<script lang="ts">
	import Menu from '$lib/Menu.svelte';
	import ObjectMemberPresenter from '$lib/ObjectMemberPresenter.svelte';
	import PropertyEntryInput from '$lib/PropertyEntryInput.svelte';
	import PropertyEntryDropDown from '$lib/PropertyEntryDropDown.svelte';
	import { checkDataType, maxInt32, revive, type ObjectMember } from '$lib/json-helper';
	import { generateComplexProperty } from '$lib/code-generator';

	let isJsonValid = true;
	let jsonText: string = '';
	let baseObject: ObjectMember | undefined = undefined;
	let contextObject: ObjectMember | undefined = undefined;
	let contextObjectCode: string | undefined = undefined;

	let validationErrorText: string | undefined = undefined;
	let diag: HTMLDialogElement;
	let header: HTMLHeadElement;
	let headerHeight = 0;
	$: {
		if (header) {
			headerHeight = header.clientHeight + 1;
		} else {
			headerHeight = 0;
		}
		if (!contextObject) {
			contextObjectCode = undefined;
		} else {
			contextObjectCode = generateComplexProperty(contextObject);
		}
	}

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

		baseObject = {
			name: 'BaseObject',
			nullable: false,
			dataType: 'object',
			accessModifier: 'public',
			members: [],
			indent: 1
		};
		let members = getObjectProperties(jsonObject, 1);
		baseObject.members = members;
		diag.close();
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

	function handleSelectionChanged(event: CustomEvent) {
		let property = event.detail.property as ObjectMember;
		contextObject = property;
	}
</script>

<div class="h-screen bg-black text-neutral-300 relative">
	<header bind:this={header} class="pt-4 pb-4 border-b border-b-neutral-600 flex">
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
					<span> From File </span>
				</button>
				<button type="button" on:click={showDialog}>
					<i class="bi bi-braces" />
					<span> From JSON String</span>
				</button>
			</Menu>
		</div>
	</header>
	{#if !baseObject}
		<div class="flex px-2 py-4 md:py-10">
			<div
				class="border border-slate-500 w-full md:w-1/2 rounded mx-auto
			backdrop-opacity-15 bg-slate-900 text-blue-400 py-4
			ring ring-slate-500/30
			"
			>
				<div class=" my-4 p-2 text-center">No JSON file loaded....</div>
				<div class="text-center">
					<div
						class="bg-gradient-to-br from-blue-100 to-indigo-200 my-4 inline-block rounded border
					border-slate-600 ring ring-blue-400/20 py-5 px-2
					text-blue-700
					-rotate-12"
					>
						<i class="bi bi-braces text-7xl"></i>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div
			class="grid grid-cols-2 gap-x-4 absolute left-0 right-0 bottom-0 p-2"
			style="top: {headerHeight}px;"
		>
			<div
				class="overflow-y-scroll border border-slate-500 rounded bg-slate-900
			
			"
			>
				<ObjectMemberPresenter property={baseObject} on:selectionchanged={handleSelectionChanged} />
			</div>

			<div class="overflow-y-scroll border border-slate-500 rounded bg-slate-900">
				{#if contextObject}
					<div class="flex-grow">
						<PropertyEntryInput bind:value={contextObject.name} label="Name" />

						<PropertyEntryDropDown
							disabled={contextObject === baseObject}
							label="Data Type"
							bind:value={contextObject.dataType}
							on:change={() => (baseObject = baseObject)}
						>
							<option value="string">String</option>
							<option value="DateTime">Date</option>
							<option value="bool">Boolean</option>
							<option value="int">Integer</option>
							<option value="long">Long</option>
							<option value="double">Double</option>
							<option value="object">Object</option>
						</PropertyEntryDropDown>
						<PropertyEntryDropDown
							label="Access Modifier"
							bind:value={contextObject.accessModifier}
						>
							<option value="public">Public</option>
							<option value="private">Private</option>
						</PropertyEntryDropDown>
						<div class="px-2 border-b border-b-slate-500 text-sm py-[0.15rem]">
							<label class="space-x-1">
								<input
									type="checkbox"
									bind:checked={contextObject.nullable}
									disabled={contextObject === baseObject}
								/>
								<span> Nullable </span>
							</label>
						</div>
						<div class="p-2">
							<div class="h-10">
								<button
									type="button"
									on:click={() => navigator.clipboard.writeText(contextObjectCode ?? '')}
								>
									<i class="bi bi-clipboard"></i>
									<span> Copy Code </span>
								</button>
							</div>
							<code class="block whitespace-pre">
								{contextObjectCode}
							</code>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
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
