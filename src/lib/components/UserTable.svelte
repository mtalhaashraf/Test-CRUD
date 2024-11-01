<script lang="ts">
	import { createRender, createTable, Render, Subscribe } from 'svelte-headless-table';
	import { addPagination, addSortBy, addTableFilter } from 'svelte-headless-table/plugins';

	import { enhance } from '$app/forms';
	import UserActions from '$lib/components/UserActions.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import { users } from '$lib/stores/user';
	import { Label } from './ui/label';
	import SearchInput from './SearchInput.svelte';
	import { ArrowLeft, ArrowRight, ArrowUpDown, Plus } from 'lucide-svelte';

	let open = $state(false);
	let creatingUser = $state(false);

	const table = createTable(users, {
		sort: addSortBy(),
		page: addPagination(),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.includes(filterValue)
		})
	});

	const sortableColumns = ['id', 'name'];

	const columns = table.createColumns([
		table.column({
			header: 'ID',
			accessor: 'id'
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
			header: 'Actions',
			accessor: ({ id }) => id,
			cell: (item) =>
				createRender(UserActions, {
					id: item.value
				})
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, flatColumns, pluginStates, rows } =
		table.createViewModel(columns);

	const { hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page;

	const { filterValue } = pluginStates.filter;

	const handleCreateUser = () => {
		creatingUser = true;
		return async ({ result }) => {
			if (result.type === 'success') {
				users.set(result.data.data);
				open = false;
				creatingUser = false;
			} else {
				open = false;
				creatingUser = false;
			}
		};
	};
</script>

<div class="flex w-full justify-between px-8 py-6">
	<SearchInput bind:value={$filterValue} />
	<Dialog.Root bind:open>
		<Dialog.Trigger class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white">
			<Plus size={16} /> Create
		</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Create User</Dialog.Title>
				<Dialog.Description>Create a new user</Dialog.Description>
			</Dialog.Header>
			<form
				action="?/create"
				method="post"
				class="flex flex-col gap-2"
				use:enhance={handleCreateUser}
			>
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="name">Name</Label>
					<Input id="name" name="name" class="col-span-3" required />
				</div>
				<div class="mt-3 flex justify-end border-t pt-3">
					<Button type="submit" disabled={creatingUser}>
						{creatingUser ? 'Creating...' : 'Save changes'}
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
									<Button variant="ghost" class="pl-0" on:click={props.sort.toggle}>
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
