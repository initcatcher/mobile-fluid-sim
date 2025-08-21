<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	let show = $state(true);

	onMount(() => {
		setTimeout(() => {
			show = false;
		}, 5000);
	});
</script>

{#if show}
	<div
		transition:fly={{ y: 20 }}
		class="absolute top-1/2 z-20 -translate-y-1/2 rounded-lg bg-black/90 px-3 py-2 text-sm text-gray-100"
	>
		<p>Tilt your device to control the fluid</p>
	</div>
{/if}
