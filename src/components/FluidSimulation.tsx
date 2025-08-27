import { useEffect, useRef, useState } from 'react';
import { setupFluidScene, FluidRenderer } from '../lib/fluid';
import type { FlipFluid } from '../lib/fluid';

interface FluidSimulationProps {
	gravity?: { x: number; y: number };
	resolution?: number;
	fluidColor?: { r: number; g: number; b: number };
	foamColor?: { r: number; g: number; b: number };
	colorDiffusionCoeff?: number;
	foamReturnRate?: number;
	onclick?: () => void;
}

const FluidSimulation: React.FC<FluidSimulationProps> = ({
	gravity = { x: 0, y: -9.81 },
	resolution = 70,
	fluidColor = { r: 0.09, g: 0.4, b: 1.0 },
	foamColor = { r: 0.75, g: 0.9, b: 1.0 },
	colorDiffusionCoeff = 0.0008,
	foamReturnRate = 0.5,
	onclick
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fluidRef = useRef<FlipFluid | null>(null);
	const rendererRef = useRef<FluidRenderer | null>(null);
	const animationIdRef = useRef<number>();

	const [simDimensions, setSimDimensions] = useState({
		width: 4.0,
		height: 3.0
	});

	// Simulation parameters
	const dt = 1.0 / 120.0;
	const flipRatio = 0.95;
	const numPressureIters = 60;
	const numParticleIters = 3;
	const overRelaxation = 1.7;
	const compensateDrift = true;
	const separateParticles = true;
	const showParticles = true;
	const showGrid = false;
	const damping = 1.0;

	// Particle count controls
	const relWaterWidth = 0.6;
	const relWaterHeight = 0.8;

	const resizeCanvas = () => {
		if (!canvasRef.current) return;

		const rect = canvasRef.current.getBoundingClientRect();
		const devicePixelRatio = window.devicePixelRatio || 1;

		canvasRef.current.width = rect.width * devicePixelRatio;
		canvasRef.current.height = rect.height * devicePixelRatio;

		// Update simulation dimensions to maintain aspect ratio
		const cScale = canvasRef.current.height / simDimensions.height;
		const newSimWidth = canvasRef.current.width / cScale;

		setSimDimensions(prev => ({ ...prev, width: newSimWidth }));

		if (rendererRef.current) {
			rendererRef.current.resize(canvasRef.current.width, canvasRef.current.height);
		}
	};

	const simulate = () => {
		if (!fluidRef.current) return;

		fluidRef.current.simulate(
			dt,
			gravity.x,
			gravity.y,
			flipRatio,
			numPressureIters,
			numParticleIters,
			overRelaxation,
			compensateDrift,
			separateParticles,
			damping
		);
	};

	const render = () => {
		if (!fluidRef.current || !rendererRef.current) return;

		rendererRef.current.render(fluidRef.current, {
			showParticles,
			showGrid,
			simWidth: simDimensions.width,
			simHeight: simDimensions.height
		});
	};

	const update = () => {
		simulate();
		render();
		animationIdRef.current = requestAnimationFrame(update);
	};

	// Initialize fluid simulation
	useEffect(() => {
		if (!canvasRef.current) return;

		resizeCanvas();

		// Initialize fluid simulation
		fluidRef.current = setupFluidScene(
			simDimensions.width,
			simDimensions.height,
			resolution,
			relWaterWidth,
			relWaterHeight,
			fluidColor,
			foamColor,
			colorDiffusionCoeff,
			foamReturnRate
		);
		rendererRef.current = new FluidRenderer(canvasRef.current);

		// Initial color setup
		if (fluidRef.current) {
			fluidRef.current.setFluidColor(fluidColor);
			fluidRef.current.setFoamColor(foamColor);
			fluidRef.current.setColorDiffusionCoeff(colorDiffusionCoeff);
			fluidRef.current.setFoamReturnRate(foamReturnRate);
		}

		// Handle window resize
		const handleResize = () => {
			resizeCanvas();
		};
		window.addEventListener('resize', handleResize);

		// Start animation loop
		update();

		return () => {
			window.removeEventListener('resize', handleResize);
			if (animationIdRef.current) {
				cancelAnimationFrame(animationIdRef.current);
			}
		};
	}, [resolution]); // Only re-initialize when resolution changes

	// Watch for color changes and update fluid
	useEffect(() => {
		if (fluidRef.current) {
			fluidRef.current.setFluidColor(fluidColor);
		}
	}, [fluidColor]);

	// Watch for foam color changes
	useEffect(() => {
		if (fluidRef.current) {
			fluidRef.current.setFoamColor(foamColor);
		}
	}, [foamColor]);

	// Watch for diffusion coefficient changes
	useEffect(() => {
		if (fluidRef.current) {
			fluidRef.current.setColorDiffusionCoeff(colorDiffusionCoeff);
		}
	}, [colorDiffusionCoeff]);

	// Watch for foam return rate changes
	useEffect(() => {
		if (fluidRef.current) {
			fluidRef.current.setFoamReturnRate(foamReturnRate);
		}
	}, [foamReturnRate]);

	return (
		<canvas 
			ref={canvasRef} 
			className="absolute inset-0 z-10 h-full w-full" 
			onClick={onclick}
		/>
	);
};

export default FluidSimulation;