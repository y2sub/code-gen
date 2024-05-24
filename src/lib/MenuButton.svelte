<script lang="ts">
	export let disabled = false;
	export let buttonStyle: 'slate' | 'red' = 'slate';
</script>

<button
	{disabled}
	on:click
	class="space-x-1 px-6 py-1 rounded-2xl bg-transparent
    font-bold uppercase
    {buttonStyle === 'slate'
		? 'text-slate-900  hover:bg-slate-800/10 active:bg-slate-950 active:text-slate-50'
		: ''}
    {buttonStyle === 'red'
		? 'text-red-700 hover:bg-red-700/10 active:bg-red-800 active:text-red-50'
		: ''}
    
    
    disabled:text-slate-300 disabled:bg-slate-100

    transition-all ease-out duration-300
    "
>
	<slot />
</button>
