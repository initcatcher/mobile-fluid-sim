<script lang="ts">
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import Smartphone from '@lucide/svelte/icons/smartphone';

	import { onMount, onDestroy } from 'svelte';

	import { browser } from '$app/environment';
	import FluidSimulation from '$lib/FluidSimulation.svelte';
	import GitHubLink from '$lib/GitHubLink.svelte';
	import PopupInfo from '$lib/PopupInfo.svelte';

	const MAX_GRAVITY = 9.81;

	type AppState = 'loading' | 'needs-permission' | 'ready' | 'denied' | 'not-supported';

	let angle: number | undefined = $state(0);
	let gravity: { x: number; y: number } = $state({ x: 0, y: -MAX_GRAVITY });
	let appState: AppState = $state('loading');

	const requestPermission = async () => {
		if (!browser) return;

		if (
			'DeviceOrientationEvent' in window &&
			typeof (DeviceOrientationEvent as any).requestPermission === 'function'
		) {
			// iOS 13+ permission request
			try {
				const response = await (DeviceOrientationEvent as any).requestPermission();
				if (response === 'granted') {
					startListening();
					appState = 'ready';
				} else {
					appState = 'denied';
				}
			} catch (error) {
				console.error('Error requesting device orientation permission:', error);
				appState = 'denied';
			}
		} else if ('DeviceOrientationEvent' in window) {
			startListening();
			appState = 'ready';
		} else {
			appState = 'not-supported';
		}
	};

	const startListening = () => {
		if (!browser) return;
		window.addEventListener('deviceorientation', onOrientationChange);
	};

	const onOrientationChange = (event: DeviceOrientationEvent) => {
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

			gravity.x = MAX_GRAVITY * Math.max(-1, Math.min(1, gx));
			gravity.y = MAX_GRAVITY * Math.max(-1, Math.min(1, gy));
		}
	};

	onMount(async () => {
		if (!browser) return;

		if (!('DeviceOrientationEvent' in window)) {
			gravity = { x: 0, y: -MAX_GRAVITY };
			angle = 0;
			appState = 'not-supported';
			return;
		}

		if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
			appState = 'needs-permission';
		} else {
			startListening();
			appState = 'ready';
		}
	});

	onDestroy(() => {
		if (browser && window) {
			window.removeEventListener('deviceorientation', onOrientationChange);
		}
	});
</script>

<div
	class="relative flex h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-950"
>
	<GitHubLink />
	{#if appState === 'loading'}
		<div class="text-center">
			<Loader2 class="mx-auto mb-4 h-12 w-12 animate-spin text-blue-400" />
			<h1 class="mb-2 text-2xl font-bold text-white">Fluid Simulation</h1>
			<p class="text-gray-300">Initializing...</p>
		</div>
	{:else if appState === 'needs-permission'}
		<div class="text-center">
			<Smartphone class="mx-auto mb-6 h-16 w-16 text-blue-400" />
			<h1 class="mb-4 text-2xl font-bold text-white">Motion Sensors Required</h1>
			<p class="mb-6 max-w-sm text-gray-300">
				This fluid simulation responds to your device's tilt and orientation. Please grant
				permission to access motion sensors for the best experience.
			</p>
			<button
				onclick={requestPermission}
				class="rounded-lg bg-blue-500 px-8 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
			>
				Enable Motion Sensors
			</button>
		</div>
	{:else if appState === 'denied'}
		<div class="text-center">
			<div class="mb-6 text-6xl">🚫</div>
			<h2 class="mb-4 text-xl font-semibold text-white">Permission Denied</h2>
			<p class="max-w-sm text-center text-gray-300">
				Motion sensor access was denied. You can still use the simulation, but it won't respond to
				device tilt. To enable this feature, please allow motion access in your browser settings.
			</p>
			<button
				onclick={requestPermission}
				class="mt-4 rounded-lg bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-500"
			>
				Try Again
			</button>
		</div>
	{:else}
		<FluidSimulation {gravity} />
		{#if appState === 'ready'}
			<PopupInfo />
		{/if}
	{/if}
</div>
