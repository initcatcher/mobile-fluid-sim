<script lang="ts">
	import { onMount } from 'svelte';
	import { setupFluidScene, FluidRenderer } from '$lib/fluid';
	import type { FlipFluid } from '$lib/fluid';

	let {
		gravity = { x: 0, y: -9.81 },
		resolution = 70
	}: { gravity?: { x: number; y: number }; resolution?: number; angle?: number } = $props();

	let canvas: HTMLCanvasElement;
	let fluid: FlipFluid;
	let renderer: FluidRenderer;
	let animationId: number;

	let simHeight = 3.0;
	let simWidth = 4.0;

	const dt = 1.0 / 60.0; // Performance: Matched example.html
	const flipRatio = 0.9;
	const numPressureIters = 50; // Performance: Matched example.html
	const numParticleIters = 2;
	const overRelaxation = 1.9;
	const compensateDrift = true;
	const separateParticles = true;
	const showParticles = true;
	const showGrid = false;

	// Particle count controls
	const relWaterWidth = 0.6; // Water width as fraction of tank (0.1 to 1.0)
	const relWaterHeight = 0.8; // Water height as fraction of tank (0.1 to 1.0)

	function resizeCanvas() {
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		const devicePixelRatio = window.devicePixelRatio || 1;

		canvas.width = rect.width * devicePixelRatio;
		canvas.height = rect.height * devicePixelRatio;

		// Update simulation dimensions to maintain aspect ratio
		const cScale = canvas.height / simHeight;
		simWidth = canvas.width / cScale;

		if (renderer) {
			renderer.resize(canvas.width, canvas.height);
		}
	}

	function simulate() {
		if (!fluid) return;

		fluid.simulate(
			dt,
			gravity.x,
			gravity.y,
			flipRatio,
			numPressureIters,
			numParticleIters,
			overRelaxation,
			compensateDrift,
			separateParticles
		);
	}

	function render() {
		if (!fluid || !renderer) return;

		renderer.render(fluid, {
			showParticles,
			showGrid,
			simWidth,
			simHeight
		});
	}

	function update() {
		simulate();
		render();
		animationId = requestAnimationFrame(update);
	}

	onMount(() => {
		resizeCanvas();

		// Initialize fluid simulation
		fluid = setupFluidScene(simWidth, simHeight, resolution, relWaterWidth, relWaterHeight);
		renderer = new FluidRenderer(canvas);

		// Handle window resize
		const handleResize = () => {
			resizeCanvas();
		};
		window.addEventListener('resize', handleResize);

		// Start animation loop
		update();

		return () => {
			window.removeEventListener('resize', handleResize);
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		};
	});
</script>

<canvas bind:this={canvas} class="absolute inset-0 z-10 h-full w-full"></canvas>
