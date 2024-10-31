<script lang="ts">
	import { createRender, createTable, Render, Subscribe } from 'svelte-headless-table';
	import { addPagination, addSortBy, addTableFilter } from 'svelte-headless-table/plugins';
	import { enhance } from '$app/forms';

	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import * as Dialog from '$lib/components/ui/dialog';

	import StepActions from './StepActions.svelte';
	import TableAnchor from './TableAnchor.svelte';
	import Textarea from './ui/textarea/textarea.svelte';
	import { Button, buttonVariants } from './ui/button';
	import { Input } from './ui/input';
	import { Label } from './ui/label';

	import { steps } from '$lib/stores/step';
	import { loggedInUser } from '$lib/stores/user';
	import { instructions } from '$lib/stores/instructions';
	import TableParagraph from './TableParagraph.svelte';
	import SearchInput from './SearchInput.svelte';
	import { ArrowLeft, ArrowRight, ArrowUpDown, Plus } from 'lucide-svelte';

	let creating = $state(false);
	let open = $state(false);

	const table = createTable(steps, {
		page: addPagination(),
		sort: addSortBy(),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.includes(filterValue)
		})
	});

	const sortableColumns = ['title', 'id', 'instruction', 'created_by', 'updated_by'];


	const columns = table.createColumns([
		table.column({
			header: 'ID',	
			accessor: 'id'
			//   plugins: { sort: { disable: true }, filter: { exclude: true } }
		}),
		table.column({
			header: 'Instruction',
			accessor: 'instruction',
			cell: ({ row }) => {
				return createRender(TableParagraph, {
					value: row.original.instruction.title
				});
			}

			// plugins: {
			// 	filter: {
			// 		getFilterValue(value) {
			// 			return value.toLowerCase();
			// 		}
			// 	}
			// }
		}),
		table.column({
			header: 'Step Number',
			accessor: 'step_nr'
		}),
		table.column({
			header: 'Title',
			accessor: 'title',
			plugins: {
				filter: {
					getFilterValue(value) {
						return value.toLowerCase();
					}
				}
			}
		}),

		table.column({
			header: 'Description',
			accessor: 'description',
			plugins: {
				filter: {
					getFilterValue(value) {
						return value.toLowerCase();
					}
				}
			}
		}),

		table.column({
			header: 'Type',
			accessor: 'type'
		}),
		table.column({
			accessor: 'attached_file',
			header: 'Attached File',
			cell: ({ row }) => {
				return createRender(TableAnchor, {
					value: row.original.attached_file,
					href: `/steps/${row.original.attached_file}`
				});
			}
		}),
		table.column({
			header: 'Created By',
			accessor: 'created_by',
			plugins: {
				filter: {
					getFilterValue(value) {
						return value.toLowerCase();
					}
				}
			}
		}),
		table.column({
			header: 'Updated By',
			accessor: 'updated_by',
			plugins: {
				filter: {
					getFilterValue(value) {
						return value.toLowerCase();
					}
				}
			}
		}),
		table.column({
			header: 'Actions',
			accessor: ({ id }) => id,
			cell: (item) =>
				createRender(StepActions, {
					id: item.value
				})
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, flatColumns, pluginStates, rows } =
		table.createViewModel(columns);

	const { hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page;

	const { filterValue } = pluginStates.filter;

	const handleCreate = ({ formData }) => {
		if (selectedInstruction) {
			creating = true;
			formData.set('instruction', selectedInstruction.value);
			formData.set('type', type.value);
			return async ({ result }) => {
				if (result.type === 'success') {
					steps.set(result.data.data);
					open = false;
					creating = false;
				} else {
					open = false;
					creating = false;
				}
			};
		} else {
			console.error('Missing instruction');
		}
	};

	let selectedInstruction = $state({
		value: $instructions[0]?.id || null,
		label: $instructions[0]?.title || 'Select instruction'
	});
	let type: any = $state({ value: 'text', label: 'text', disabled: false });
</script>

<div class="flex w-full justify-between px-8 py-6">
	<SearchInput bind:value={$filterValue} />
	<Dialog.Root bind:open>
		<Dialog.Trigger
			class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white"
			disabled={$loggedInUser == null}
		>
			<Plus size={16} /> Create
		</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Create Step</Dialog.Title>
				<Dialog.Description>Create a new step for instruction</Dialog.Description>
			</Dialog.Header>
			<form
				action="?/create"
				method="post"
				class="flex flex-col gap-2"
				use:enhance={handleCreate}
				enctype="multipart/form-data"
			>
				<input type="hidden" name="user_id" value={$loggedInUser?.id} />
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="step_nr">Step #</Label>
					<Input id="step_nr" name="step_nr" class="col-span-3" type="number" required />
				</div>
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="title">Title</Label>
					<Input id="title" name="title" class="col-span-3" required />
				</div>
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="description">Description</Label>
					<!-- <Input id="title" name="title" class="col-span-3" required /> -->
					<Textarea
						placeholder="Description"
						id="description"
						name="description"
						class="col-span-3"
						required
					/>
				</div>
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="type">Type</Label>
					<div class="col-span-3 w-full">
						<Select.Root name="type" required bind:selected={type}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select type" />
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									{#each ['text', 'image', 'video', 'pdf'] as _type}
										<Select.Item value={_type} label={_type}>
											{_type}
										</Select.Item>
									{/each}
								</Select.Group>
							</Select.Content>
							<Select.Input name="Select type" />
						</Select.Root>
					</div>
				</div>
				{#if type.value != 'text'}
					<div class="grid grid-cols-4 items-center gap-3">
						<Label for="file">File</Label>
						<Input
							id="file"
							name="file"
							class="col-span-3"
							required
							type="file"
							accept={type.value === 'image'
								? 'image/*'
								: type.value === 'video'
									? 'video/*'
									: 'application/pdf'}
						/>
					</div>
				{/if}
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="instruction">Instruction</Label>
					<div class="col-span-3 w-full">
						<Select.Root name="instruction" bind:selected={selectedInstruction}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select instruction" />
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									<Select.Item value={null} label="Select instruction" disabled>
										Select instruction
									</Select.Item>
									{#each $instructions as instruction}
										<Select.Item value={instruction.id} label={instruction.title}>
											{instruction.title}
										</Select.Item>
									{/each}
								</Select.Group>
							</Select.Content>
							<Select.Input name="Select instruction" />
						</Select.Root>
					</div>
				</div>
				<div class="mt-3 flex justify-end border-t pt-3">
					<Button type="submit" disabled={creating}>
						{creating ? 'Creating...' : 'Save changes'}
					</Button>
				</div>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>

<Table.Root {...$tableAttrs}>
	<Table.Header>
		{#each $headerRows as headerRow}
			<Subscribe>
				<Table.Row>
					{#each headerRow.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
							<Table.Head
								class={`bg-gray-100/80 ${cell.id === 'Actions' ? 'pr-24 text-right' : ''}`}
								{...attrs}
								{...props}
							>
								{#if sortableColumns.includes(cell.id)}
									<Button variant="ghost" on:click={props.sort.toggle}>
										<Render of={cell.render()} />
										<ArrowUpDown class="ml-2 h-4 w-4" />
									</Button>
								{:else}
									<Render of={cell.render()} />
								{/if}
							</Table.Head>
						</Subscribe>
					{/each}
				</Table.Row>
			</Subscribe>
		{/each}
	</Table.Header>

	<Table.Body {...$tableBodyAttrs}>
		{#each $pageRows as row (row.id)}
			<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
				<Table.Row {...rowAttrs}>
					{#each row.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} let:attrs>
							<Table.Cell {...attrs}>
								<Render of={cell.render()} />
							</Table.Cell>
						</Subscribe>
					{/each}
				</Table.Row>
			</Subscribe>
		{/each}
	</Table.Body>
</Table.Root>
<div class="flex w-full items-end justify-end gap-2 px-8 py-6">
	<Button
		variant="outline"
		size="sm"
		on:click={() => ($pageIndex = $pageIndex - 1)}
		disabled={!$hasPreviousPage}
		class="flex items-center gap-2"
	>
		<ArrowLeft size={16} /> Previous
	</Button>
	<Button
		variant="outline"
		size="sm"
		disabled={!$hasNextPage}
		on:click={() => ($pageIndex = $pageIndex + 1)}
		class="flex items-center gap-2"
	>
		Next <ArrowRight size={16} />
	</Button>
</div>
