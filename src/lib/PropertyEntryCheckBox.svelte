<script lang="ts">
	import { onMount } from 'svelte';

	export let checked: boolean = false;
	export let labelText: string = '';
	export let id: string | undefined = undefined;
    export let disabled:boolean = false;

	onMount(() => {
		
	});
</script>

<label class="grid grid-cols-2 text-slate-950 hover:text-slate-800 cursor-pointer">
    <div class="flex">
		<label class="text-sm block my-auto">
			<input type="checkbox" bind:checked class="hidden" {id} on:change {disabled} />
			<span>
				{labelText}
			</span>
		</label>
	</div>
    <div class="text-2xl px-2 py-1 {disabled ? 'text-slate-300' :''} ">
        {#if checked}
			<i class="bi bi-toggle-on"></i>
		{:else}
			<i class="bi bi-toggle-off"></i>
		{/if}
    </div>
	
</label>

