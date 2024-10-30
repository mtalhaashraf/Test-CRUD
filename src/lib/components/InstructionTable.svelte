<script lang="ts">
	import { createRender, createTable, Render, Subscribe } from 'svelte-headless-table';
	import { addPagination, addSortBy, addTableFilter } from 'svelte-headless-table/plugins';
	import { enhance } from '$app/forms';

	import * as Dialog from '$lib/components/ui/dialog';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';

	import { instructions } from '$lib/stores/instructions';
	import { assets } from '$lib/stores/asset';
	import { loggedInUser } from '$lib/stores/user';

	import FlexColumn from './FlexColumn.svelte';
	import InstructionActions from './InstructionActions.svelte';
	import TableAnchor from './TableAnchor.svelte';
	import { Button, buttonVariants } from './ui/button';
	import { Input } from './ui/input';
	import { Label } from './ui/label';
	import { Textarea } from './ui/textarea';
	import SearchInput from './SearchInput.svelte';
	import { ArrowLeft, ArrowRight, Plus } from 'lucide-svelte';

	let open = $state(false);
	let creating = $state(false);

	const table = createTable(instructions, {
		sort: addSortBy(),
		page: addPagination(),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.includes(filterValue)
		})
	});

	const columns = table.createColumns([
		table.column({
			header: 'ID',
			accessor: 'id'
			//   plugins: { sort: { disable: true }, filter: { exclude: true } }
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
			header: 'Duration (minutes)',
			accessor: 'duration'
		}),
		table.column({
			header: 'Preview File',
			accessor: 'preview',
			cell: ({ row }) => {
				return createRender(TableAnchor, {
					value: row.original.preview,
					href: `/instructions/${row.original.preview}`
				});
			}
		}),

		table.column({
			header: 'Assets',
			accessor: 'assets',
			cell: ({ row }) => {
				return createRender(FlexColumn, {
					items: row.original.assets.map((e) => e.name)
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
				createRender(InstructionActions, {
					instruction: row.original
				})
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, flatColumns, pluginStates, rows } =
		table.createViewModel(columns);

	const { hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page;

	const { filterValue } = pluginStates.filter;

	const handleCreate = ({ formData }) => {
		selectedAssets.forEach((asset) => {
			formData.append('assets', asset.value);
		});
		creating = true;
		return async ({ result }) => {
			if (result.type === 'success' && result.data.data) {
				instructions.set(result.data.data);
				open = false;
				creating = false;
			} else {
				open = false;
				creating = false;
			}
		};
	};

	let selectedAssets: any[] = $state([]);
</script>

<div class="py-6 px-8 flex w-full justify-between">
	<SearchInput bind:value={$filterValue} />
	<Dialog.Root bind:open>
		<Dialog.Trigger class="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2" disabled={$loggedInUser == null}>
			<Plus size={16} /> Create
		</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Create Instruction</Dialog.Title>
				<Dialog.Description>Create a new instruction</Dialog.Description>
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
					<Label for="title">Title</Label>
					<Input id="title" name="title" class="col-span-3" required />
				</div>
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="description">Description</Label>
					<!-- <Input id="description" name="description" class="col-span-3" required /> -->
					<Textarea
						placeholder="Description"
						id="description"
						name="description"
						class="col-span-3"
						required
					/>
				</div>
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="duration">Duration</Label>
					<Input id="duration" name="duration" class="col-span-3" required type="number" />
				</div>
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="file">File</Label>
					<Input id="file" name="file" class="col-span-3" type="file" required accept="image/*" />
				</div>
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="assets">Assets</Label>
					<div class="col-span-3 w-full">
						<Select.Root multiple name="assets" bind:selected={selectedAssets}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select an asset" />
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									{#each $assets as asset}
										<Select.Item value={asset.id} label={asset.name}>{asset.name}</Select.Item>
									{/each}
								</Select.Group>
							</Select.Content>
							<Select.Input name="Select asset" />
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
