<script lang="ts">
	import { onMount } from 'svelte';

	export let menuWidth = 200;
	let isMenuOpen = false;
	let menuItems: HTMLDivElement;
	let menu: HTMLDivElement;
	let menuButton: HTMLButtonElement;

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
	onMount(() => {
		let menuButtonWidth = menuButton.clientWidth;
		menu.style.width = `${menuWidth}px`;
		let left = menuWidth / 2 - menuButtonWidth / 2;
		left *= -1;

		menu.style.left = `${left}px`;
	});
</script>

<div class="relative">
	<button
		bind:this={menuButton}
		type="button"
		on:click={toggleMenu}
		aria-checked={isMenuOpen}
		role="checkbox"
		class="text-slate-200 hover:text-slate-50 bg-transparent hover:bg-slate-500/30
        aria-checked:bg-slate-800 aria-checked:text-slate-50 transition-colors ease-in-out
        px-3 py-2 rounded"
	>
		<slot name="title" />
	</button>
	{#if isMenuOpen}
		<!-- svelte-ignore a11y-interactive-supports-focus -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="fixed inset-0 z-[999]" on:click={toggleMenu}></div>
	{/if}
	{#if isMenuOpen}
		<div class="absolute -bottom-3 flex left-0 right-0">
			<svg viewBox="0 0 50 50" class="w-3 h-3 mx-auto inline-block text-slate-600">
				<polygon points="25,0 0,50 50,50 " fill="currentColor" />
			</svg>
		</div>
	{/if}

	{#if isMenuOpen}
		<div class="text-center"></div>
	{/if}
	<div
		bind:this={menu}
		class="absolute mt-2 grid border-2
        border-slate-600
        transition-all ease-in-out duration-300 {isMenuOpen ? 'visible z-[10001]' : 'invisible'}
            rounded-md bg-slate-800 shadow
            "
		style="grid-template-rows: {isMenuOpen ? '1fr' : '0fr'};"
	>
		<div class="overflow-hidden" bind:this={menuItems}>
			<div class="px-1 py-2"><slot /></div>
		</div>
	</div>
</div>
