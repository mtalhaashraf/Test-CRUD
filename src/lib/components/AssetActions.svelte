<script lang="ts">
	import { enhance } from '$app/forms';

	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';

	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from './ui/input';
	import { Label } from './ui/label';

	import { assets } from '$lib/stores/asset';
	import { instructions } from '$lib/stores/instructions';
	import { loggedInUser } from '$lib/stores/user';
	import { PUBLIC_ENDPOINT } from '$env/static/public';

	export let asset;

	let id = asset.id;
	let name = asset.name || '';
	let file = asset.file || '';

	let editModalOpen = false;
	let editing = false;

	let deleteModalOpen = false;
	let deleting = false;

	const handleEdit = ({ formData }) => {
		editing = true;
		selectedInstructions.forEach((instruction) => {
			formData.append('instructions', instruction.value);
		});
		asset.instructions.forEach((instruction) => {
			formData.append('prev_instructions', instruction.id);
		});
		return async ({ result }) => {
			if (result.type === 'success' && result.data.data) {
				assets.set(result.data.data);
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
				assets.set(result.data.data);
				deleteModalOpen = false;
				deleting = false;
			} else {
				deleteModalOpen = false;
				deleting = false;
				console.error('Error editing user:', result.error);
			}
		};
	};

	let selectedInstructions = asset.instructions.map((instruction) => ({
		value: instruction.id,
		label: instruction.title,
		disabled: false
	}));
</script>

<div class="flex items-center gap-2">
	<Dialog.Root bind:open={editModalOpen}>
		<Dialog.Trigger
			class={buttonVariants({ variant: 'secondary' })}
			disabled={$loggedInUser == null}>Edit</Dialog.Trigger
		>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Edit Asset</Dialog.Title>
				<Dialog.Description>Edit an existing asset</Dialog.Description>
			</Dialog.Header>
			<form
				method="post"
				class="flex flex-col gap-2"
				use:enhance={handleEdit}
				action="?/edit"
				enctype="multipart/form-data"
			>
				<input type="hidden" name="id" value={id} />
				<input type="hidden" name="user_id" value={$loggedInUser?.id} />
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="name">Name</Label>
					<Input id="name" name="name" class="col-span-3" required bind:value={name} />
				</div>
				<div class="grid grid-cols-4 items-baseline gap-3">
					<Label for="file">File</Label>
					<div class="col-span-3 flex w-full flex-col gap-1">
						<Input id="file" name="file" type="file" />
						{#if file}
							<a
								href={`${PUBLIC_ENDPOINT}/assets/${file}`}
								target="_blank"
								class="ml-1 w-max text-sm text-muted-foreground underline"
							>
								{file}
							</a>
						{/if}
					</div>
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
				<Dialog.Title>Delete Asset</Dialog.Title>
				<Dialog.Description>Are you sure to delete the asset.</Dialog.Description>

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
