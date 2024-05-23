<script lang="ts">
	import { onMount } from 'svelte';
	export let value: string | number | boolean | undefined;
	export let label: string;
	export let disabled = false;
	let id: string;

	onMount(() => {
		id = 'input-' + Math.ceil(Math.random() * 10000);
	});
</script>

<div class="grid grid-cols-2 group text-sm relative">
	<label
		for={id}
		class="border px-1 border-slate-600
		group-focus-within:bg-blue-600/30
		group-focus-within:text-blue-100
		flex transition-all ease-out duration-300
		 "
	>
		<span class="my-auto block">
			{label}
		</span>
	</label>
	<select
		{id}
		bind:value
		on:change
		{disabled}
		class="border border-slate-500 peer
		bg-stone-800 text-stone-300 focus:text-slate-50
		 focus:outline-none py-[0.15rem] pl-1 pr-4
		transition-all ease-out duration-300
		"
	>
		<slot />
	</select>
</div>
