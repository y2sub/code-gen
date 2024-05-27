<script lang="ts">
	import DropDownButton from './DropDownButton.svelte';

	export let language: 'CS' | 'TS' | 'JS' = 'CS';

	let isTransitionning = false;
	let isMenuOpen = false;
	let menu: HTMLDivElement;
	function openMenu() {
		isTransitionning = true;
		isMenuOpen = true;
		menu.style.width = '384px';
		setTimeout(() => {
			isTransitionning = false;
		}, 301);
	}
	function closeMenu() {
		isTransitionning = true;
		menu.style.width = '0px';
		setTimeout(() => {
			isMenuOpen = false;
			isTransitionning = false;
		}, 301);
	}
</script>

<button
	type="button"
	on:click={openMenu}
	class="text-2xl py-1.5 px-3 my-auto
        bg-white hover:bg-slate-950
        text-slate-950 hover:text-slate-50 rounded-md
        transition-all ease-in-out duration-300
        "
>
	<i class="bi bi-list"></i>
</button>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="fixed inset-0 bg-black/20 z-[1000] {isMenuOpen ? 'block' : 'hidden'}"
	on:click={closeMenu}
/>
<div
	bind:this={menu}
	style="width: 0px;"
	class="fixed left-0 inset-y-0 bg-neutral-100 border-r border-r-neutral-400
           shadow-lg
           {isMenuOpen ? 'visible z-[1001] ' : 'invisible'} 
           transition-all ease-in-out duration-300"
>
	<div class="p-2 {isTransitionning || !isMenuOpen ? 'hidden' : 'block'} ">
		<div class="flex py-2 mb-2 border-b border-b-neutral-300">
			<h1 class="text-2xl space-x-1">
				<i class="bi bi-sliders2"></i>
				<span> Settings </span>
			</h1>
			<button
				type="button"
				class="ml-auto my-auto p-2 text-red-600 hover:text-red-700 text-lg outline-none focus:outline-none"
				on:click={closeMenu}
			>
				<i class="bi bi-x-circle-fill" />
			</button>
		</div>
		<div class="grid grid-cols-1 gap-2">
			<DropDownButton bind:value={language} labelText="Language" size='md'>
				<option value="CS">C Sharp</option>
				<option value="TS">Typescript</option>
				<option value="JS">Javascript</option>
			</DropDownButton>
		</div>
	</div>
</div>
