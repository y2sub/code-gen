<script lang="ts">
	import type { SupportedLanguages } from './code-generator';
	import { fireToast } from './swal_helper';

	export let language: SupportedLanguages;
	export let codeText: string;
	let formattedCode: string = '';
	

	function formatCode() {
		switch (language) {
			case 'CS':
				formatCode_CSharp();
				break;
			case 'TS':
			case 'JS':
			default:
				formattedCode = codeText;
				break;
		}
	}

	// Stupid formatter, a much better formatter is required
	function formatCode_CSharp() {
		codeText = codeText.trim();

		formattedCode = '';
		// formattedCode = codeText;

		for (let index = 0; index < codeText.length; index++) {
			const char = codeText[index];
			if (char === '{') {
				let blockEndPos = getBlockEndPos(index + 1);
				let block = codeText.substring(index + 1, blockEndPos);

				index += block.length + 1;
				block = block.replaceAll('\n', '\n\t');
				formattedCode += `\n{${block} \n}`.trim();
				continue;
			}
			formattedCode += char;
		}
		// styledCode = formattedCode
		// 	.replaceAll('{', '<span class="text-fuchsia-500">{</span>')
		// 	.replaceAll('}', '<span class="text-fuchsia-500">}</span>');


		// styledCode = styledCode.replaceAll('public', `<span class='text-blue-500'>public</span>`);
	}

	function getBlockEndPos(blockStartPos: number) {
		let index = blockStartPos;
		for (; index < codeText.length; index++) {
			const char = codeText[index];
			if (char === '{') {
				let blockEnd = getBlockEndPos(index + 1);
				let codeBlock = '{' + codeText.substring(index + 1, blockEnd) + '}';

				index += codeBlock.length;
				continue;
			}
			if (char === '}') {
				return index;
			}
		}
		return index;
	}

	$: {
		if (codeText) {
			formatCode();
		}
	}

	function copyCode() {
		navigator.clipboard.writeText(formattedCode);
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
	<code class="block whitespace-pre text-sm ">
		{@html formattedCode}
	</code>
</div>
