<script lang="ts">
	import { enhance } from '$app/forms';

	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';

	import { buttonVariants, Button } from '$lib/components/ui/button';
	import { Label } from './ui/label';
	import { Input } from './ui/input';
	import { Textarea } from './ui/textarea';

	import { loggedInUser } from '$lib/stores/user';
	import { instructions } from '$lib/stores/instructions';
	import { assets } from '$lib/stores/asset';

	export let instruction;

	let id = instruction.id;
	let title = instruction.title;
	let description = instruction.description || '';
	let duration = instruction.duration;
	let file = instruction.preview;

	let editModalOpen = false;
	let editing = false;

	let deleteModalOpen = false;
	let deleting = false;

	const handleEdit = ({ formData }) => {
		editing = true;
		selectedAssets.forEach((asset) => {
			formData.append('assets', asset.value);
		});
		instruction.assets.forEach((asset) => {
			formData.append('prev_assets', asset.id);
		});
		return async ({ result }) => {
			if (result.type === 'success' && result.data.data) {
				instructions.set(result.data.data);
				editModalOpen = false;
				editing = false;
			} else {
				editModalOpen = false;
				editing = false;
				console.error('Error editing user:', result.error);
			}
		};
	};

	const handleDelete = () => {
		deleting = true;
		return async ({ result }) => {
			if (result.type === 'success' && result.data.data) {
				instructions.set(result.data.data);
				deleteModalOpen = false;
				deleting = false;
			} else {
				deleteModalOpen = false;
				deleting = false;
				console.error('Error editing user:', result.error);
			}
		};
	};

	let selectedAssets: any[] = instruction.assets.map((asset) => ({
		value: asset.id,
		label: asset.name,
		disabled: false
	}));
</script>

<div class="flex items-center gap-2">
	<Dialog.Root bind:open={editModalOpen}>
		<Dialog.Trigger class={buttonVariants({ variant: 'secondary' })}>Edit</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Edit Instruction</Dialog.Title>
				<Dialog.Description>Edit an existing instruction</Dialog.Description>
			</Dialog.Header>
			<form action="?/edit" method="post" class="flex flex-col gap-2" use:enhance={handleEdit}>
				<input type="hidden" name="id" value={id} />
				<input type="hidden" name="user_id" value={$loggedInUser?.id} />
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="title">Title</Label>
					<Input id="title" name="title" class="col-span-3" required bind:value={title} />
				</div>
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="description">Description</Label>
					<!-- <Input id="description" name="description" class="col-span-3" required /> -->
					<Textarea
						placeholder="Description"
						id="description"
						name="description"
						class="col-span-3"
						bind:value={description}
						required
					/>
				</div>
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="duration">Duration</Label>
					<Input
						id="duration"
						name="duration"
						class="col-span-3"
						required
						type="number"
						bind:value={duration}
					/>
				</div>
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="file">File</Label>
					<Input id="file" name="file" class="col-span-3" required bind:value={file} />
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
					<Button type="submit" disabled={editing}>
						{editing ? 'Saving...' : 'Save changes'}
					</Button>
				</div>
			</form>
		</Dialog.Content>
	</Dialog.Root>

	<Dialog.Root bind:open={deleteModalOpen}>
		<Dialog.Trigger
			class={buttonVariants({ variant: 'destructive' })}
			disabled={$loggedInUser == null}>Delete</Dialog.Trigger
		>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Delete Instruction</Dialog.Title>
				<Dialog.Description>Are you sure to delete the instruction.</Dialog.Description>

				<form action="?/delete" method="post" use:enhance={handleDelete}>
					<input type="hidden" name="id" value={id} />
					<input type="hidden" name="user_id" value={$loggedInUser?.id} />
					<div class="mt-3 flex justify-end border-t pt-3">
						<Button variant="destructive" type="submit" disabled={deleting}>
							{deleting ? 'Deleting...' : 'Confirm'}
						</Button>
					</div>
				</form>
			</Dialog.Header>
		</Dialog.Content>
	</Dialog.Root>
</div>
