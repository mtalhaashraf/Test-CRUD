<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';
	import { addPagination, addTableFilter, addSortBy } from 'svelte-headless-table/plugins';
	import { readable } from 'svelte/store';
	import Actions from './Actions.svelte';
	import TableAnchor from './TableAnchor.svelte';
	import { Button } from './ui/button';
	import { Input } from './ui/input';

	interface Step {
		id: number;
		title: string;
		type: string;
		description: string | null;
		attached_file: string | null;
		step_nr: number;
		instruction: string | undefined;
		created_by: string;
		updated_by: string | undefined;
	}

	export let steps: Step[] = [];

	const table = createTable(readable(steps), {
		page: addPagination(),
		sort: addSortBy(),
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
			header: 'Instruction',
			accessor: 'instruction',
			plugins: {
				filter: {
					getFilterValue(value) {
						return value.toLowerCase();
					}
				}
			}
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
				return createRender(TableAnchor, { value: row.original.attached_file });
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
				createRender(Actions, {
					id: item.value
				})
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, flatColumns, pluginStates, rows } =
		table.createViewModel(columns);

	const { hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page;

	const { filterValue } = pluginStates.filter;
</script>

<Input class="max-w-sm my-2" placeholder="Filter steps..." type="text" bind:value={$filterValue} />

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
