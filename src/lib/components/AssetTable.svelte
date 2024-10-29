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
					value: row.original.file
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

<div class="my-2 flex w-full justify-between">
	<Input class="max-w-sm" placeholder="Filter assets..." type="text" bind:value={$filterValue} />
	<Dialog.Root bind:open>
		<Dialog.Trigger class={buttonVariants({ variant: 'default' })} disabled={$loggedInUser == null}
			>Create</Dialog.Trigger
		>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Create Asset</Dialog.Title>
				<Dialog.Description>Create a new asset</Dialog.Description>
			</Dialog.Header>
			<form action="?/create" method="post" class="flex flex-col gap-2" use:enhance={handleCreate}>
				<input type="hidden" name="user_id" value={$loggedInUser?.id} />
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="name">Name</Label>
					<Input id="name" name="name" class="col-span-3" required />
				</div>
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="file">File</Label>
					<Input id="file" name="file" class="col-span-3" required />
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

<Table.Root {...$tableAttrs}>
	<Table.Header>
		{#each $headerRows as headerRow}
			<Subscribe>
				<Table.Row>
					{#each headerRow.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
							<Table.Head {...attrs}><Render of={cell.render()} /></Table.Head>
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

<div class="mt-2 flex items-center justify-end gap-2">
	<Button
		variant="outline"
		size="sm"
		on:click={() => ($pageIndex = $pageIndex - 1)}
		disabled={!$hasPreviousPage}>Previous</Button
	>
	<Button
		variant="outline"
		size="sm"
		disabled={!$hasNextPage}
		on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button
	>
</div>
