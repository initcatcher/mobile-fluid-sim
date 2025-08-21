<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';

	let angle: number | null = $state(0);
	let permission: string = $state('unknown');

	const requestPermission = async () => {
		if (!browser) return;

		if (
			'DeviceOrientationEvent' in window &&
			typeof (DeviceOrientationEvent as any).requestPermission === 'function'
		) {
			// iOS 13+ permission request
			try {
				const response = await (DeviceOrientationEvent as any).requestPermission();
				permission = response;
				if (response === 'granted') {
					startListening();
				}
			} catch (error) {
				console.error('Error requesting device orientation permission:', error);
				permission = 'denied';
			}
		} else if ('DeviceOrientationEvent' in window) {
			// Android and older iOS - no permission needed
			permission = 'granted';
			startListening();
		} else {
			permission = 'not-supported';
		}
	};

	const startListening = () => {
		if (!browser) return;
		window.addEventListener('deviceorientation', onOrientationChange);
	};

	// --- THIS IS THE CORRECTED FUNCTION ---
	const onOrientationChange = (event: DeviceOrientationEvent) => {
		// We need both beta (front-to-back) and gamma (left-to-right)
		if (event.beta !== null && event.gamma !== null) {
			// atan2 gives us the angle in radians for a point (x, y).
			// We use gamma for x and beta for y.
			const angleRad = Math.atan2(event.beta, event.gamma);

			// Convert radians to degrees and apply an offset.
			// The -90 degree offset aligns the 0-degree angle of the calculation
			// with the "down" direction of the phone.
			angle = angleRad * (180 / Math.PI) - 90;
		}
	};
	// --- END OF CORRECTION ---

	onMount(() => {
		// Only run on client side
		if (browser) {
			// For non-iOS devices, we can start listening immediately.
			// For iOS, the user must click the button.
			if (
				!(
					'DeviceOrientationEvent' in window &&
					typeof (DeviceOrientationEvent as any).requestPermission === 'function'
				)
			) {
				requestPermission();
			}
		}
	});

	onDestroy(() => {
		if (browser && window) {
			window.removeEventListener('deviceorientation', onOrientationChange);
		}
	});
</script>

<svelte:window />

<div class="flex h-screen flex-col items-center justify-center bg-slate-800 text-white">
	{#if permission === 'unknown'}
		<div class="text-center">
			<h1 class="mb-4 text-2xl font-bold">Gravity Arrow</h1>
			<p class="mb-6 max-w-sm">
				This demo needs access to your device's orientation sensors to work.
			</p>
			<button
				onclick={requestPermission}
				class="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white shadow-lg hover:bg-blue-600"
			>
				Enable Device Orientation
			</button>
		</div>
	{:else if permission === 'denied'}
		<p class="max-w-sm text-center text-xl">
			Permission denied. Please enable Motion & Orientation Access for this site in your browser
			settings.
		</p>
	{:else if permission === 'not-supported'}
		<p class="text-center text-xl">Device orientation not supported on this device.</p>
	{:else if angle === null}
		<p>Waiting for orientation data...</p>
	{:else}
		<div style:transform="rotate({angle}deg)" class="transition-transform duration-75 ease-out">
			<ArrowDownIcon class="size-24" />
		</div>
		<div class="absolute bottom-10 text-center font-mono">
			<p>Angle: {angle?.toFixed(2)}°</p>
		</div>
	{/if}
</div>
