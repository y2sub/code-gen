<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	export let value: string | undefined;
	export let labelText: string = '';
	export let labelPosition: 'top' | 'left' = 'top';
	export let size: 'sm' | 'md' = 'md';
	export let disabled: boolean = false;

	let id: string | undefined = undefined;
	const dispatch = createEventDispatcher();

	let selectedOption: HTMLOptionElement | undefined = undefined;
	let isMenuOpen = false;
	let select: HTMLSelectElement;
	let menuButton: HTMLButtonElement;
	let menu: HTMLDivElement;
	let options: HTMLOptionElement[] = [];
    $:{
        for (const option of options) {
            if(option.value===value){
                selectedOption = option;
                break;
            }
        }
    }

	function openMenu() {
		isMenuOpen = true;
	}

	function closeMenu() {
		isMenuOpen = false;
	}

	function handleOptionClicked(option: HTMLOptionElement) {
		selectedOption = option;
		value = selectedOption?.value;
		dispatch('change', value);
		closeMenu();
	}

	onMount(() => {
		const _options = select.querySelectorAll('option');
		for (const option of _options) {
			options.push(option);
			if (option.value === value) {
				selectedOption = option;
			}
		}
		options = options;
		if (!id) {
			const rand = Math.ceil(Math.random() * 100 + Math.random() * 200);
			id = `drop-down-button-${rand}`;
		}
	});
</script>

<select bind:this={select} bind:value class="hidden" {disabled}>
	<slot />
</select>

<div class="relative">
	<div class="flex  {labelPosition === 'top' ? 'flex-col' : 'flex-row'}">
		{#if labelText}
			<label for={id} class="text-slate-800 my-2 block w-1/2 flex-shrink-0 {size === 'sm' ? 'text-sm' : ''}">
				{labelText}
			</label>
		{/if}
		<button
			{id}
			{disabled}
			type="button"
			bind:this={menuButton}
			on:click={openMenu}
			class="px-2 py-1 my-auto outline-none focus:outline-none
                bg-slate-950 text-slate-50 w-full flex
                hover:bg-slate-800 active:ring focus:ring ring-slate-950/15
                transition-all ease-in-out duration-300 flex-grow
        {size == 'sm' ? 'rounded text-sm' : ''}
        {size == 'md' ? 'rounded' : ''}
        {isMenuOpen ? 'ring' : ''}
        disabled:bg-slate-100 disabled:text-slate-400 disabled:focus:ring-0 disabled:active:ring-0
        "
		>
			<span>
				{@html selectedOption?.textContent}
			</span>
			<span class="ml-auto">
				<i
					class="bi bi-chevron-down block transition-transform rotate-0 {isMenuOpen
						? 'rotate-180'
						: ''}"
				/>
			</span>
		</button>
	</div>
	{#if isMenuOpen}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="fixed inset-0 {isMenuOpen ? 'z-[999]' : ''}" on:click={closeMenu} />
	{/if}
	<div
		bind:this={menu}
		class="absolute inset-x-0 mt-1 rounded-md
               bg-white border border-neutral-300 shadow
            {isMenuOpen ? 'visible z-[10001]' : 'invisible'}
            transition-all ease-in-out duration-300 grid"
		style="grid-template-rows: {isMenuOpen ? '1fr' : '0fr'};"
	>
		<div class="overflow-hidden">
			<ul class="space-y-2 p-2">
				{#each options as option}
					<li>
						<button
							type="button"
							data-value={option.value}
							class="w-full text-slate-800 hover:text-blue-800 text-left
                            {size === 'sm' ? 'text-sm' : ''}
                            "
							on:click={() => handleOptionClicked(option)}
						>
							{@html option.textContent}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>
