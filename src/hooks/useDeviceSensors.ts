import { useState, useEffect, useCallback, useRef } from 'react';

type AppState = 'loading' | 'needs-permission' | 'ready' | 'denied' | 'not-supported';

interface DeviceSensorsHook {
	appState: AppState;
	gravity: { x: number; y: number };
	requestPermission: () => Promise<void>;
	onShake: () => void;
	setOnShakeCallback: (callback: () => void) => void;
}

const MAX_GRAVITY = 9.81;

export const useDeviceSensors = (): DeviceSensorsHook => {
	const [appState, setAppState] = useState<AppState>('loading');
	const [gravity, setGravity] = useState({ x: 0, y: -MAX_GRAVITY });
	const [onShakeCallback, setOnShakeCallback] = useState<() => void>(() => () => {});

	// Shake detection state - using useRef to prevent infinite loops
	const lastShakeTimeRef = useRef(0);
	const lastAccelerationRef = useRef({ x: 0, y: 0, z: 0 });
	const shakeThreshold = 15;
	const shakeTimeThreshold = 600;

	const onDeviceMotion = useCallback((event: DeviceMotionEvent) => {
		if (!event.accelerationIncludingGravity) return;

		const acceleration = event.accelerationIncludingGravity;
		const x = acceleration.x || 0;
		const y = acceleration.y || 0;
		const z = acceleration.z || 0;

		// Calculate the magnitude of acceleration change
		const deltaX = Math.abs(x - lastAccelerationRef.current.x);
		const deltaY = Math.abs(y - lastAccelerationRef.current.y);
		const deltaZ = Math.abs(z - lastAccelerationRef.current.z);

		const totalDelta = deltaX + deltaY + deltaZ;
		const currentTime = Date.now();

		// Check if shake threshold is exceeded and enough time has passed
		if (totalDelta > shakeThreshold && currentTime - lastShakeTimeRef.current > shakeTimeThreshold) {
			onShakeCallback();
			lastShakeTimeRef.current = currentTime;
		}

		// Update last acceleration values
		lastAccelerationRef.current = { x, y, z };
	}, [onShakeCallback]);

	const onOrientationChange = useCallback((event: DeviceOrientationEvent) => {
		if (event.beta !== null && event.gamma !== null) {
			const beta = event.beta;
			const gamma = event.gamma;

			const betaRad = beta * (Math.PI / 180);
			const gammaRad = gamma * (Math.PI / 180);

			const cosBeta = Math.cos(betaRad);
			const sinBeta = Math.sin(betaRad);
			const sinGamma = Math.sin(gammaRad);

			const gx = sinGamma * cosBeta;
			const gy = -sinBeta;

			setGravity({
				x: MAX_GRAVITY * Math.max(-1, Math.min(1, gx)),
				y: MAX_GRAVITY * Math.max(-1, Math.min(1, gy))
			});
		}
	}, []);

	const startListening = useCallback(() => {
		window.addEventListener('deviceorientation', onOrientationChange);
		window.addEventListener('devicemotion', onDeviceMotion);
	}, [onOrientationChange, onDeviceMotion]);

	const requestPermission = useCallback(async () => {
		if (
			'DeviceOrientationEvent' in window &&
			typeof (DeviceOrientationEvent as any).requestPermission === 'function'
		) {
			// iOS 13+ permission request
			try {
				const orientationResponse = await (DeviceOrientationEvent as any).requestPermission();
				let motionResponse = 'granted';

				// Also request motion permission if available
				if (
					'DeviceMotionEvent' in window &&
					typeof (DeviceMotionEvent as any).requestPermission === 'function'
				) {
					motionResponse = await (DeviceMotionEvent as any).requestPermission();
				}

				if (orientationResponse === 'granted' && motionResponse === 'granted') {
					startListening();
					setAppState('ready');
				} else {
					setAppState('denied');
				}
			} catch (error) {
				console.error('Error requesting device motion/orientation permission:', error);
				setAppState('denied');
			}
		} else if ('DeviceOrientationEvent' in window) {
			startListening();
			setAppState('ready');
		} else {
			setAppState('not-supported');
		}
	}, [startListening]);

	const onShake = useCallback(() => {
		onShakeCallback();
	}, [onShakeCallback]);

	// Initialize - only run once
	useEffect(() => {
		if (!('DeviceOrientationEvent' in window)) {
			setGravity({ x: 0, y: -MAX_GRAVITY });
			setAppState('not-supported');
			return;
		}

		if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
			setAppState('needs-permission');
		} else {
			startListening();
			setAppState('ready');
		}

		// Cleanup - include dependencies to fix closure issue
		return () => {
			window.removeEventListener('deviceorientation', onOrientationChange);
			window.removeEventListener('devicemotion', onDeviceMotion);
		};
	}, [startListening, onOrientationChange, onDeviceMotion]); // Include dependencies

	return {
		appState,
		gravity,
		requestPermission,
		onShake,
		setOnShakeCallback: (callback: () => void) => setOnShakeCallback(() => callback)
	};
};