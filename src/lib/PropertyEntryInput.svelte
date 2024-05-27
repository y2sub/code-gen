<script lang="ts">
	import { onMount } from 'svelte';
	export let value: string | number;
	export let label: string;
	export let disabled: boolean = false;

	let id: string;

	onMount(() => {
		id = 'input-' + Math.ceil(Math.random() * 10000);
	});
</script>

<div class="grid grid-cols-2 group text-sm">
	<label
		for={id}
		class=" text-slate-800"
	>
		<span class="my-auto">
			{label}
		</span>
	</label>
	<input
		{id}
		{disabled}
		type="text"
		bind:value
		class="  peer rounded outline-none focus:outline-none
				bg-slate-950 text-slate-50 focus:bg-slate-800
				focus:ring ring-slate-950/10 
				px-2 py-1 transition-all ease-out duration-300 "
		on:change
	/>
</div>
