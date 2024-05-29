<script lang="ts">
	import Menu from '$lib/Menu.svelte';
	import ObjectMemberPresenter from '$lib/ObjectMemberPresenter.svelte';
	import PropertyEntryInput from '$lib/PropertyEntryInput.svelte';
	import PropertyEntryDropDown from '$lib/PropertyEntryDropDown.svelte';
	import {
		checkDataType,
		maxInt32,
		revive,
		getValidVariableName,
		type ObjectMember,
		getRandomVariableName
	} from '$lib/json-helper';
	import {
		capitalize,
		generateComplexProperty,
		type SupportedLanguages
	} from '$lib/code-generator';
	import MenuButton from '$lib/MenuButton.svelte';
	import {
		ColorTheme,
		fireErrorToast,
		fireSuccessToast,
		fireSweetAlert,
		fireToast
	} from '$lib/swal_helper';
	import NavigationMenu from '$lib/NavigationMenu.svelte';
	import DropDownButton from '$lib/DropDownButton.svelte';
	import PropertyEntryCheckBox from '$lib/PropertyEntryCheckBox.svelte';
	import CodePresenter from '$lib/CodePresenter.svelte';
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	let language: SupportedLanguages = 'CS';
	let isJsonValid = true;
	let jsonText: string = '';
	let baseObject: ObjectMember | undefined = undefined;
	let contextObject: ObjectMember | undefined = undefined;
	let baseObjectCode: string | undefined = undefined;

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
		if (language) {
			handleBaseObjectChanged();
		}
	}

	function handleBaseObjectChanged() {
		baseObject = baseObject;
		if (!baseObject) {
			baseObjectCode = '';
		} else {
			baseObjectCode = generateComplexProperty(baseObject, language);
		}
	}

	function clearJson() {
		contextObject = undefined;
		baseObject = undefined;
		jsonText = '';
		fireToast('Json object cleared', 'success');
	}

	function parseJson(jsonString: string, baseObjectName: string = 'BaseObject') {
		jsonString = jsonString.trim();

		let jsonObject: any | undefined = undefined;
		try {
			jsonObject = JSON.parse(jsonString, revive);
			if (typeof jsonObject !== 'object') {
				throw 'Invalid JSON object';
			}
			//If it is an array take the first element
			// return invalid if array is empty
			if (Array.isArray(jsonObject)) {
				if (jsonObject.length === 0) {
					return {
						isJsonValid: false,
						validationErrorText: 'Could not parse empty array'
					};
				}
				jsonObject = jsonObject[0];
			}
		} catch (e) {
			return {
				isJsonValid: false,
				validationErrorText: 'Could not parse text into a valid JSON object'
			};
		}

		if (Array.isArray(jsonObject)) {
		}

		baseObject = {
			name: baseObjectName,
			nullable: false,
			dataType: 'object',
			accessModifier: 'public',
			members: [],
			indent: 1,
			typeIndecisive: false
		};
		let members = getObjectProperties(jsonObject, 1);
		baseObject.members = members;
		contextObject = baseObject;
		handleBaseObjectChanged();
		return {
			isJsonValid: true,
			validationErrorText: ''
		};
	}

	// File Upload function

	async function handleFileChanged(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) {
			return;
		}
		const file = input.files[0];
		const json = await file.text();
		const result = parseJson(json);
		if (result.isJsonValid) {
			fireSuccessToast('Json object created');
		} else {
			fireErrorToast(result.validationErrorText);
		}

		input.value = '';
	}

	// End File  Upload function

	// JsonDialog functipns

	function showDialog() {
		isJsonValid = true;
		validationErrorText = '';
		diag.classList.add('scale-0');
		diag.showModal();
		diag.classList.remove('scale-0');
		const input = diag.querySelector('input#jsonObjectNameInput') as HTMLInputElement;
		input.value = capitalize(getRandomVariableName());
		input.ariaInvalid = 'false';
		const textArea = diag.querySelector('textarea') as HTMLTextAreaElement;
		textArea.focus();
		textArea.value = '';
	}
	function closeDialog() {
		diag.classList.add('scale-0');
		setTimeout(() => {
			diag.close();
		}, 500);
	}

	function handleDialogSubmitted(event: Event) {
		event.stopImmediatePropagation();
		event.stopPropagation();
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		let nameInput = form.querySelector('input#jsonObjectNameInput') as HTMLInputElement;
		let name = nameInput.value.trim();
		let isNameValid = true;
		if (!name) {
			nameInput.ariaInvalid = 'true';
			isNameValid = false;
		} else {
			nameInput.ariaInvalid = 'false';
		}

		name = getValidVariableName(name);

		jsonText = jsonText.trim();

		isJsonValid = jsonText !== '';

		if (!isJsonValid) {
			validationErrorText = 'Please enter a valid, non empty JSON object';
			return;
		}
		if (!isNameValid) {
			return;
		}
		let data = new FormData(form);
		let jsonString: string = data.get('json') as string;
		jsonString = jsonString.trim();

		const result = parseJson(jsonString, name);
		if (result.isJsonValid) {
			closeDialog();
		} else {
			isJsonValid = false;
			validationErrorText = 'Could not parse text into a valid JSON object';
		}
	}

	// end Json Dialog functions

	function getObjectProperties(obj: any | undefined, indent: number) {
		if (!obj) {
			return [];
		}
		let objectMembers: ObjectMember[] = [];
		let props = Object.getOwnPropertyNames(obj);
		for (const propName of props) {
			const value = obj[propName];

			let dataType = typeof value;
			if (value === null || value === undefined) {
				dataType = 'undefined';
			}
			let objectMember: ObjectMember = {
				name: propName,
				dataType: 'string',
				accessModifier: 'public',
				nullable: true,
				members: undefined,
				indent,
				typeIndecisive: false
			};

			if (Array.isArray(value)) {
				objectMember.dataType = 'list';
				if (value[0]) {
					let childMembers = getObjectProperties(value[0], indent + 1);
					objectMember.members = childMembers;
				}
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
					break;
				case 'undefined':
					// probably a string is a better fit for null | undefined in most cases
					objectMember.dataType = 'string';
					objectMember.typeIndecisive = true;
					objectMember.nullable = true;
					break;
				case 'function':
				case 'symbol':
				default:
					objectMember.typeIndecisive = true;
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

<div class="h-screen bg-slate-100 relative">
	<header
		bind:this={header}
		class=" border-b border-b-neutral-400 shadow-md flex bg-white h-20 px-2 md:px-4 lg:px-16 xl:px-20"
	>
		<NavigationMenu bind:language />
		<div class="mx-auto my-auto flex space-x-2">
			<!-- <Menu>
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
			</Menu> -->
			<MenuButton on:click={clearJson} buttonStyle="red" disabled={!baseObject}>
				<i class="bi bi-trash"></i>
				<span> Reset </span></MenuButton
			>
		</div>
	</header>
	<input
		type="file"
		id="jsonUploadInput"
		class="hidden"
		accept=".txt,.json"
		on:change={handleFileChanged}
	/>
	{#if !baseObject}
		<div class="flex px-2 py-4 md:py-10">
			<div
				class="border-2 border-slate-500 w-full md:w-1/2 mx-auto
			py-4 text-slate-900
			rounded-lg shadow-xl bg-gradient-to-br from-neutral-50 to-neutral-200
			
			"
			>
				<div class=" my-4 p-2 text-center font-bold text-2xl">No JSON file loaded....</div>
				<div class="text-center">
					<div class="text-9xl -rotate-12 text-slate-700">
						<label for="jsonUploadInput" class="cursor-pointer">
							<i
								class="bi bi-file-earmark-code
									scale-100
									hover:scale-125 transition-all ease-in-out duration-500 hover:text-blue-800
									inline-block"
							></i>
						</label>
					</div>
				</div>
				<div class="text-center my-4 pt-8 grid grid-cols-2 gap-4 px-4">
					<button
						type="button"
						on:click={showDialog}
						class="space-x-1 bg-slate-950 text-slate-50 px-3 py-2 rounded-lg
						hover:bg-slate-800 active:ring ring-slate-950/20
						focus:ring focus:outline-none
						"
					>
						<i class="bi bi-braces"></i>
						From JSON String
					</button>
					<label
						for="jsonUploadInput"
						class="space-x-1 cursor-pointer
								focus:ring focus:outline-none bg-blue-800 text-blue-50 px-3 py-2 rounded-lg
								hover:bg-blue-700 active:ring ring-blue-800/20
								"
					>
						<i class="bi bi-upload"></i>
						<span>Load From File</span>
					</label>
				</div>
			</div>
		</div>
	{:else}
		<div
			class="absolute left-0 right-0 bottom-0 p-2
			md:px-4 lg:px-16 xl:px-20
			flex flex-row space-x-2 md:space-x-4 lg:space-x-10
			"
			style="top: {headerHeight}px;"
		>
			<div
				class="overflow-y-scroll border border-slate-300 shadow-sm
				bg-white w-full md:w-1/2 lg:w-1/3 flex-shrink-0

			"
			>
				<ObjectMemberPresenter property={baseObject} on:selectionchanged={handleSelectionChanged} />
			</div>

			<div
				class="overflow-y-scroll border border-slate-300 shadow-sm
			bg-white flex-grow
			"
			>
				{#if contextObject}
					<div class="flex-grow">
						<div class="p-2 space-y-1 divide-y divide-gray-300">
							<PropertyEntryInput
								bind:value={contextObject.name}
								label="Name"
								on:change={handleBaseObjectChanged}
							/>
							<DropDownButton
								size="sm"
								bind:value={contextObject.dataType}
								disabled={contextObject === baseObject}
								labelText="Data Type"
								labelPosition="left"
								on:change={handleBaseObjectChanged}
							>
								<option value="string">String</option>
								<option value="DateTime">Date</option>
								<option value="bool">Boolean</option>
								<option value="int">Integer</option>
								<option value="long">Long</option>
								<option value="double">Double</option>
								<option value="object">Object</option>
								<option value="list">List</option>
							</DropDownButton>
							<DropDownButton
								bind:value={contextObject.accessModifier}
								labelText="Access Modifier"
								size="sm"
								labelPosition="left"
								on:change={handleBaseObjectChanged}
							>
								<option value="public">Public</option>
								<option value="private">Private</option>
							</DropDownButton>

							<PropertyEntryCheckBox
								disabled={contextObject === baseObject}
								labelText="Nullable"
								bind:checked={contextObject.nullable}
								on:change={handleBaseObjectChanged}
							></PropertyEntryCheckBox>
							<div />
						</div>

						{#if baseObjectCode}
							<div class="p-2">
								<CodePresenter {language} codeText={baseObjectCode} />
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<dialog
	bind:this={diag}
	class="p-2 w-full md:w-3/4 lg:w-2/3 xl:w-1/2 rounded-xl shadow-lg
		   text-neutral-800 dark:text-neutral-100
			border border-neutral-300 dark:border-neutral-500
			backdrop:bg-black/20 dark:backdrop:bg-white/20
			bg-neutral-100 dark:bg-neutral-800
			transition-all ease-in-out duration-500
			"
>
	<form method="dialog" class="" on:submit={handleDialogSubmitted} novalidate>
		<h3 class="py-2 pb-4 border-b border-b-neutral-500 text-2xl font-bold space-x-1">
			<i class="bi bi-braces" />
			<span> Load JSON </span>
		</h3>
		<div class="grid gap-2 my-4">
			<div class="space-y-1">
				<label for="jsonObjectNameInput" class="text-neutral-800"> Object Name </label>
				<input
					name="name"
					id="jsonObjectNameInput"
					placeholder="Your JSON object name"
					required={true}
					class="block w-full outline-none focus:outline-none peer
							p-1 rounded
							focus:ring ring-sky-500/20
							focus:border-blue-500
							bg-white border border-neutral-500
							aria-[invalid='true']:ring-red-600/20 aria-[invalid='true']:border-red-600
					"
				/>
			</div>
			<div class="space-y-1">
				<label for="jsonTextArea" class="text-neutral-800"> Json Text </label>
				<textarea
					id="jsonTextArea"
					aria-invalid={!isJsonValid}
					name="json"
					rows="10"
					placeholder="Paste your JSON object here"
					class="px-1 py-1 rounded focus:outline-none border
					   border-neutral-500
					   focus:border-blue-500
					   bg-white dark:bg-black w-full
				 
                ring-sky-600/20 aria-[invalid='true']:ring-red-600/20 aria-[invalid='true']:border-red-600
                focus:ring peer
                "
					bind:value={jsonText}
				/>
				<div class="text-center invisible peer-aria-[invalid='true']:visible text-sm">
					<span class="text-red-600 dark:text-amber-600 space-x-2">
						<i class="bi bi-exclamation-triangle-fill"></i>
						{validationErrorText}
					</span>
				</div>
			</div>
		</div>
		<div class="my-4 grid grid-cols-2 gap-x-2">
			<button
				type="submit"
				class="space-x-1 cursor-pointer outline-none focus:outline-none
				
				focus:ring bg-blue-800 text-blue-50 px-3 py-2 rounded-lg
				hover:bg-blue-700 active:ring ring-blue-800/20
				transition-all ease-in-out duration-300
				"
			>
				<span>Load JSON</span>
			</button>
			<button
				type="button"
				class="space-x-1 cursor-pointer outline-none focus:outline-none
					px-3 py-2 rounded-lg
					bg-slate-950 text-slate-50 hover:bg-slate-800 active:ring
					focus:ring ring-slate-500/20


				 
				 transition-all ease-in-out duration-300
            "
				on:click={closeDialog}>Cancel</button
			>
		</div>
	</form>
</dialog>
