<script lang="ts">
	import { createRender, createTable, Render, Subscribe } from 'svelte-headless-table';
	import { addPagination, addSortBy, addTableFilter } from 'svelte-headless-table/plugins';
	import { enhance } from '$app/forms';

	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';

	import AssetActions from './AssetActions.svelte';
	import FlexColumn from './FlexColumn.svelte';
	import TableAnchor from './TableAnchor.svelte';
	import { Button, buttonVariants } from './ui/button';
	import { Input } from './ui/input';
	import { Label } from './ui/label';

	import { assets } from '$lib/stores/asset';
	import { loggedInUser } from '$lib/stores/user';
	import { instructions } from '$lib/stores/instructions';
	import SearchInput from './SearchInput.svelte';
	import { Plus, ArrowLeft, ArrowRight } from 'lucide-svelte';

	let creating = $state(false);
	let open = $state(false);

	const table = createTable(assets, {
		sort: addSortBy(),
		page: addPagination(),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.includes(filterValue)
		})
	});

	const columns = table.createColumns([
		table.column({
			header: 'ID',
			accessor: 'id',
			plugins: { sort: { disable: true }, filter: { exclude: true } }
		}),
		table.column({
			header: 'Name',
			accessor: 'name',
			plugins: {
				filter: {
					getFilterValue(value) {
						return value.toLowerCase();
					}
				}
			}
		}),

		table.column({
			header: 'File',
			accessor: 'file',
			cell: ({ row }) => {
				return createRender(TableAnchor, {
					value: row.original.file,
					href: `/assets/${row.original.file}`
				});
			}
		}),

		table.column({
			header: 'Instructions',
			accessor: 'instructions',
			cell: ({ row }) => {
				return createRender(FlexColumn, {
					items: row.original.instructions.map((e) => e.title)
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
			cell: ({ row }) =>
				createRender(AssetActions, {
					asset: row.original
				})
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, flatColumns, pluginStates, rows } =
		table.createViewModel(columns);

	const { hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page;

	const { filterValue } = pluginStates.filter;

	const handleCreate = ({ formData }) => {
		selectedInstructions.forEach((instruction) => {
			formData.append('instructions', instruction.value);
		});
		creating = true;
		return async ({ result }) => {
			if (result.type === 'success') {
				assets.set(result.data.data);
				open = false;
				creating = false;
			} else {
				open = false;
				creating = false;
			}
		};
	};

	let selectedInstructions: any[] = $state([]);
</script>


<div class="py-6 px-8 flex w-full justify-between">
	<SearchInput bind:value={$filterValue} />
	<Dialog.Root bind:open>
		<Dialog.Trigger class="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2" disabled={$loggedInUser == null}>
			<Plus size={16} /> Create
		</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Create Asset</Dialog.Title>
				<Dialog.Description>Create a new asset</Dialog.Description>
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
					<Label for="name">Name</Label>
					<Input id="name" name="name" class="col-span-3" required />
				</div>
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="file">File</Label>
					<Input
						id="file"
						name="file"
						type="file"
						class="col-span-3"
						required
					/>
				</div>
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="assets">Instructions</Label>
					<div class="col-span-3 w-full">
						<Select.Root multiple name="assets" bind:selected={selectedInstructions}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select instruction" />
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
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

<Table.Root  {...$tableAttrs}>
	<Table.Header>
		{#each $headerRows as headerRow}
			<Subscribe>
				<Table.Row>
					{#each headerRow.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
							<Table.Head 
								class={`bg-gray-100/80 ${cell.id === 'Actions' ? 'text-right pr-24' : ''}`} 
								{...attrs} 
								{...props}
							>
								<Render of={cell.render()} />
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

<div class="py-6 px-8 flex gap-2 items-end justify-end w-full">
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
