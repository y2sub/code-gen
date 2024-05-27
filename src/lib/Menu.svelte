<script lang="ts">
	import { onMount } from 'svelte';

	export let menuWidth = 200;
	let isMenuOpen = false;
	
	let menuItems: HTMLDivElement;
	let menu: HTMLDivElement;
	let menuButton: HTMLButtonElement;
	let svgArrow: SVGSVGElement;

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
		if (isMenuOpen) {
			svgArrow.style.visibility = 'visible';
		} else {
			setTimeout(() => {
				svgArrow.style.visibility = 'hidden';
			}, 301);
		}
	}

	onMount(() => {
		let menuButtonWidth = menuButton.clientWidth;
		menu.style.width = `${menuWidth}px`;
		let left = menuWidth / 2 - menuButtonWidth / 2;
		left *= -1;
		menu.style.left = `${left}px`;

		const buttons = menuItems.querySelectorAll('button');
		const links = menuItems.querySelectorAll('a');
		const className = `block w-full space-x-1 px-2 py-1.5 rounded text-left outline-none focus:outline-none
                    transition-colors ease-in-out duration-300 active:ring focus:ring ring-blue-500/20
                    hover:bg-blue-500 hover:text-blue-50 text-sm`;

		for (const button of buttons) {
			button.className = className;
			button.addEventListener('click', toggleMenu);
		}
		for (const link of links) {
			link.className = className;
			link.addEventListener('click', toggleMenu);
		}
	});
	// onMount(() => {

	// });
</script>

<div class="relative">
	<button
		bind:this={menuButton}
		type="button"
		on:click={toggleMenu}
		aria-checked={isMenuOpen}
		role="checkbox"
		class="text-blue-500 font-bold uppercase rounded-2xl
		bg-transparent hover:bg-blue-500/20
        aria-checked:bg-blue-500 aria-checked:text-blue-50
		transition-colors ease-in-out duration-300
		
        px-4 py-2"
	>
		<slot name="title" />
	</button>
	{#if isMenuOpen}
		<!-- svelte-ignore a11y-interactive-supports-focus -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="fixed inset-0 z-[999]" on:click={toggleMenu}></div>
	{/if}
	<div class="absolute -bottom-3 flex left-0 right-0">
		<svg
			bind:this={svgArrow}
			viewBox="0 0 50 50"
			class="w-3 h-3 invisible mx-auto inline-block transition-colors ease-in-out duration-300 {isMenuOpen
				? ' text-blue-400'
				: ' text-blue-50'}"
		>
			<polygon points="25,0 0,50 50,50 " fill="currentColor" />
		</svg>
	</div>

	<div
		bind:this={menu}
		class="absolute mt-2 grid border-2
        border-blue-300
        transition-all ease-in-out duration-300 {isMenuOpen ? 'visible z-[10001]' : 'invisible'}
            rounded-md bg-blue-50 shadow
            "
		style="grid-template-rows: {isMenuOpen ? '1fr' : '0fr'};"
	>
		<div class="overflow-hidden" bind:this={menuItems}>
			<div class="px-1 py-2"><slot /></div>
		</div>
	</div>
</div>
