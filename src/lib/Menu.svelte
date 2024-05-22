<script lang="ts">
	import { onMount } from 'svelte';

	let isMenuOpen = false;
	let menuItems: HTMLDivElement;

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function closeMenu() {
		isMenuOpen = false;
	}

	onMount(() => {
		const buttons = menuItems.querySelectorAll('button');
		const links = menuItems.querySelectorAll('a');
		const className = `block w-full space-x-1 px-2 py-1.5 rounded text-left outline-none focus:outline-none
                    transition-colors ease-in-out duration-300 active:ring focus:ring ring-sky-500/20
                    hover:bg-sky-700 hover:text-sky-50 text-sm`;
		for (const button of buttons) {
			button.className = className;
			button.addEventListener('click', closeMenu);
		}
		for (const link of links) {
			link.className = className;
			link.addEventListener('click', closeMenu);
		}
	});
</script>

<div class="relative">
	<button
		type="button"
		on:click={toggleMenu}
		aria-checked={isMenuOpen}
		role="checkbox"
		class="text-neutral-200 hover:text-neutral-50 bg-transparent hover:bg-neutral-300/20
        aria-checked:bg-neutral-800 aria-checked:text-neutral-50 transition-colors ease-in-out
        px-3 py-2 rounded"
	>
		<slot name="title" />
	</button>
	{#if isMenuOpen}
		<!-- svelte-ignore a11y-interactive-supports-focus -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="fixed inset-0" on:click={toggleMenu}></div>
	{/if}
	<div
		class="absolute min-w-[200px] mt-1 grid border
        border-neutral-600
        transition-all ease-in-out duration-300 {isMenuOpen ? 'visible' : 'invisible'}
            rounded-md bg-neutral-800 shadow
            "
		style="grid-template-rows: {isMenuOpen ? '1fr' : '0fr'};"
	>
		<div class="overflow-hidden" bind:this={menuItems}>
			<div class="px-1 py-2"><slot /></div>
		</div>
	</div>
</div>
