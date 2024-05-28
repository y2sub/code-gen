<script lang="ts">
	import { type SupportedLanguages } from './code-generator';
	import { fireToast } from './swal_helper';

	export let language: SupportedLanguages;
	export let codeText: string;

	function copyCode() {
		navigator.clipboard.writeText(codeText);
		fireToast('Copied', 'success');
	}
</script>

<div class="p-2 bg-slate-950 text-slate-100 rounded">
	<div class="h-8 border-b border-b-slate-600 flex mb-2">
		<button
			type="button"
			on:click={copyCode}
			class="text-sm
        text-slate-100 hover:text-amber-300 ml-auto"
		>
			<i class="bi bi-clipboard"></i>
			<span> Copy Code </span>
		</button>
	</div>
	<code class="block whitespace-pre text-sm text-slate-50">
		{codeText}
	</code>
</div>
