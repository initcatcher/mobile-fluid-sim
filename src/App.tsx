import { useState, useEffect } from 'react';
import { Loader2, Smartphone } from 'lucide-react';
import FluidSimulation from './components/FluidSimulation';
import GitHubLink from './components/GitHubLink';
import PopupInfo from './components/PopupInfo';
import { useDeviceSensors } from './hooks/useDeviceSensors';
import { useColorTween } from './hooks/useColorTween';

const fluidTypes = [
	{
		fluidColor: { r: 0.09, g: 0.4, b: 1.0 },
		foamColor: { r: 0.75, g: 0.9, b: 1.0 },
		colorDiffusionCoeff: 0.0008,
		foamReturnRate: 0.5
	},
	{
		fluidColor: { r: 0.0, g: 0.7, b: 0.8 },
		foamColor: { r: 0.6, g: 0.95, b: 0.9 },
		colorDiffusionCoeff: 0.0012,
		foamReturnRate: 0.6
	},
	{
		fluidColor: { r: 1.0, g: 0.4, b: 0.1 },
		foamColor: { r: 1.0, g: 0.8, b: 0.6 },
		colorDiffusionCoeff: 0.0004,
		foamReturnRate: 0.3
	},
	{
		fluidColor: { r: 0.5, g: 0.2, b: 0.9 },
		foamColor: { r: 0.8, g: 0.7, b: 1.0 },
		colorDiffusionCoeff: 0.001,
		foamReturnRate: 0.7
	},
	{
		fluidColor: { r: 0.1, g: 0.6, b: 0.4 },
		foamColor: { r: 0.7, g: 0.95, b: 0.8 },
		colorDiffusionCoeff: 0.0015,
		foamReturnRate: 0.4
	},
	{
		fluidColor: { r: 0.9, g: 0.5, b: 0.6 },
		foamColor: { r: 1.0, g: 0.85, b: 0.9 },
		colorDiffusionCoeff: 0.0006,
		foamReturnRate: 0.8
	},
	{
		fluidColor: { r: 0.3, g: 0.7, b: 0.9 },
		foamColor: { r: 0.9, g: 0.95, b: 1.0 },
		colorDiffusionCoeff: 0.0009,
		foamReturnRate: 0.5
	},
	{
		fluidColor: { r: 0.9, g: 0.7, b: 0.2 },
		foamColor: { r: 1.0, g: 0.9, b: 0.7 },
		colorDiffusionCoeff: 0.0005,
		foamReturnRate: 0.2
	}
];

const App: React.FC = () => {
	const [currentFluidIndex, setCurrentFluidIndex] = useState(0);
	const [colorDiffusionCoeff, setColorDiffusionCoeff] = useState(fluidTypes[0].colorDiffusionCoeff);
	const [foamReturnRate, setFoamReturnRate] = useState(fluidTypes[0].foamReturnRate);

	// Initialize color tweens
	const fluidColorTween = useColorTween(fluidTypes[0].fluidColor, 500);
	const foamColorTween = useColorTween(fluidTypes[0].foamColor, 500);

	// Device sensors hook
	const { appState, gravity, requestPermission, setOnShakeCallback } = useDeviceSensors();

	// Handle shake to change colors
	const handleShake = () => {
		const nextIndex = (currentFluidIndex + 1) % fluidTypes.length;
		setCurrentFluidIndex(nextIndex);
		
		const newFluid = fluidTypes[nextIndex];
		
		// Animate color transitions
		fluidColorTween.set(newFluid.fluidColor);
		foamColorTween.set(newFluid.foamColor);
		
		// Update other properties immediately
		setColorDiffusionCoeff(newFluid.colorDiffusionCoeff);
		setFoamReturnRate(newFluid.foamReturnRate);
	};

	// Set up shake callback
	useEffect(() => {
		setOnShakeCallback(handleShake);
	}, [currentFluidIndex, setOnShakeCallback]);

	return (
		<div className="relative flex h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-950">
			<GitHubLink />
			
			{appState === 'loading' && (
				<div className="text-center">
					<Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-400" />
					<h1 className="mb-2 text-2xl font-bold text-white">Fluid Simulation</h1>
					<p className="text-gray-300">Initializing...</p>
				</div>
			)}

			{appState === 'needs-permission' && (
				<div className="text-center">
					<Smartphone className="mx-auto mb-6 h-16 w-16 text-blue-400" />
					<h1 className="mb-4 text-2xl font-bold text-white">Motion Sensors Required</h1>
					<p className="mb-6 max-w-sm text-gray-300">
						This fluid simulation responds to your device's tilt and orientation. It also detects shake
						gestures to change fluid colors! Please grant permission to access motion sensors for the
						best experience.
					</p>
					<button
						onClick={requestPermission}
						className="rounded-lg bg-blue-500 px-8 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
					>
						Enable Motion Sensors
					</button>
				</div>
			)}

			{appState === 'denied' && (
				<div className="text-center">
					<div className="mb-6 text-6xl">🚫</div>
					<h2 className="mb-4 text-xl font-semibold text-white">Permission Denied</h2>
					<p className="max-w-sm text-center text-gray-300">
						Motion sensor access was denied. You can still use the simulation, but it won't respond to
						device tilt. To enable this feature, please allow motion access in your browser settings.
					</p>
					<button
						onClick={requestPermission}
						className="mt-4 rounded-lg bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-500"
					>
						Try Again
					</button>
				</div>
			)}

			{(appState === 'ready' || appState === 'not-supported') && (
				<>
					<FluidSimulation
						gravity={gravity}
						fluidColor={fluidColorTween.current}
						foamColor={foamColorTween.current}
						colorDiffusionCoeff={colorDiffusionCoeff}
						foamReturnRate={foamReturnRate}
					/>

					{appState === 'ready' && <PopupInfo />}
				</>
			)}
		</div>
	);
};

export default App;