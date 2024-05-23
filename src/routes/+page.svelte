<script lang="ts">
	import Menu from '$lib/Menu.svelte';
	import { checkDataType, maxInt32, revive, type ObjectMember } from '$lib/json-helper';
	let isJsonValid = true;
	let jsonText: string = '';
	let validationErrorText: string | undefined = undefined;
	let diag: HTMLDialogElement;

	function showDialog() {
		isJsonValid = true;
		validationErrorText = '';
		diag.showModal();
	}

	function handleDialogSubmitted(event: Event) {
		console.clear();
		event.stopImmediatePropagation();
		event.stopPropagation();
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		isJsonValid = true;
		jsonText = jsonText.trim();

		let isValid = jsonText !== '';

		if (!isValid) {
			isJsonValid = false;
			validationErrorText = 'Please enter a valid, non empty JSON object';
			return;
		}
		let data = new FormData(form);
		let jsonString: string = data.get('json') as string;
		jsonString = jsonString.trim();

		let jsonObject: any | undefined = undefined;
		try {
			jsonObject = JSON.parse(jsonString, revive);
			if (typeof jsonObject !== 'object') {
				throw 'Invalid JSON object';
			}
		} catch (e) {
			isValid = false;
			isJsonValid = false;
			validationErrorText = 'Could not parse text into a valid JSON object';
			return;
		}

		let baseObject: ObjectMember = {
			name: 'BaseObject',
			nullable: false,
			dataType: 'object',
			accessModifier: 'public',
			members: [],
			indent: 1
		};
		let members = getObjectProperties(jsonObject, 1);
		baseObject.members = members;

		console.log(baseObject);
	}

	function getObjectProperties(obj: any | undefined, indent: number) {
		if (!obj) {
			return [];
		}
		let objectMembers: ObjectMember[] = [];
		let props = Object.getOwnPropertyNames(obj);
		for (const propName of props) {
			const value = obj[propName];
			let dataType = typeof value;
			let objectMember: ObjectMember = {
				name: propName,
				dataType: 'string',
				accessModifier: 'public',
				nullable: true,
				members: undefined,
				indent
			};
			if (Array.isArray(value)) {
				objectMember.dataType = 'list';
				objectMembers.push(objectMember);
				continue;
			}
			switch (dataType) {
				case 'bigint':
				case 'number':
				case 'string':
					objectMember.dataType = checkDataType(value);					
					break;
				case 'boolean':
					objectMember.dataType = 'bool';
					break;
				case 'object':
					objectMember.dataType = 'object';
					objectMember.members = getObjectProperties(value, indent + 1);
				case 'symbol':
				case 'undefined':
				case 'function':
				default:
					break;
			}
			objectMembers.push(objectMember);
		}
		return objectMembers;
	}
</script>

<div class="h-screen bg-black text-neutral-300">
	<header class=" pt-4 pb-4 border-b border-b-neutral-600 flex">
		<div class="mx-auto">
			<Menu>
				<span slot="title">
					<span>Load Json</span>
				</span>
				<button
					type="button"
					class="block w-full space-x-2 px-2 py-1.5 rounded text-left outline-none focus:outline-none
                    transition-colors ease-in-out duration-300 active:ring focus:ring ring-sky-500/20
                    hover:bg-sky-700 hover:text-sky-50"
				>
					<i class="bi bi-upload"></i>
					<span>From File </span>
				</button>
				<button type="button" on:click={showDialog}>
					<i class="bi bi-braces" />
					<span> Paste Json </span>
				</button>
			</Menu>
		</div>
	</header>
</div>

<dialog
	bind:this={diag}
	class="border border-neutral-500 p-2 w-full md:w-3/4 lg:w-2/3 xl:w-1/2 rounded shadow-lg
     backdrop:bg-white/20 bg-neutral-800 text-neutral-100"
>
	<form method="dialog" class="" on:submit={handleDialogSubmitted} novalidate>
		<h3 class="py-2 pb-4 border-b border-b-neutral-500 text-2xl space-x-1">
			<i class="bi bi-braces" />
			<span> Paste Json </span>
		</h3>
		<div class="grid gap-2 my-4">
			<textarea
				aria-invalid={!isJsonValid}
				name="json"
				rows="7"
				class="focus:outline-none border border-neutral-500 bg-black px-1 py-1 rounded
                ring-sky-600/20 aria-[invalid='true']:ring-pink-600/20 aria-[invalid='true']:border-pink-600
                focus:ring peer
                "
				bind:value={jsonText}
			/>

			<div class="text-center invisible peer-aria-[invalid='true']:visible text-sm">
				<span class=" text-amber-500 space-x-2">
					<i class="bi bi-exclamation-triangle-fill"></i>
					{validationErrorText}
				</span>
			</div>
		</div>
		<div class="my-4 grid grid-cols-2 gap-x-2">
			<button
				type="submit"
				class="px-2 py-1.5 rounded
            transition-all ease-in-out duration-300 focus:outline-none focus:ring outline-none
            bg-sky-600 hover:bg-sky-700 ring-sky-500/20"
			>
				Load Json
			</button>
			<button
				type="button"
				class="px-2 py-1.5 rounded
            transition-all ease-in-out duration-300 focus:outline-none focus:ring outline-none
            bg-neutral-500 hover:bg-neutral-600 ring-neutral-500/20
            "
				on:click={() => diag.close()}>Cancel</button
			>
		</div>
	</form>
</dialog>
