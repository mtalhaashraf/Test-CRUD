<script lang="ts">
	import { enhance } from '$app/forms';

	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';

	import Textarea from './ui/textarea/textarea.svelte';
	import { buttonVariants, Button } from '$lib/components/ui/button';
	import { Label } from './ui/label';
	import { Input } from './ui/input';

	import { loggedInUser } from '$lib/stores/user';
	import { instructions } from '$lib/stores/instructions';
	import { steps } from '$lib/stores/step';

	export let id;

	const step = $steps.find((step) => step.id === id);

	let title = step?.title;
	let description = step?.description;
	let step_nr = step?.step_nr;
	let file = step?.attached_file;

	let editModalOpen = false;
	let editing = false;

	let deleteModalOpen = false;
	let deleting = false;

	const handleEdit = ({ formData }) => {
		formData.set('type', type.value);
		formData.set('instruction', selectedInstruction.value);
		editing = true;
		return async ({ result }) => {
			if (result.type === 'success' && result.data.data) {
				steps.set(result.data.data);
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
				steps.set(result.data.data);
				deleteModalOpen = false;
				deleting = false;
			} else {
				deleteModalOpen = false;
				deleting = false;
				console.error('Error editing user:', result.error);
			}
		};
	};

	let selectedInstruction = {
		value: step?.instruction.id,
		label: step?.instruction.title,
		disabled: false
	};

	let type = {
		value: step?.type,
		label: step?.type,
		disabled: false
	};
</script>

<div class="flex items-center gap-2">
	<Dialog.Root bind:open={editModalOpen}>
		<Dialog.Trigger
			class={buttonVariants({ variant: 'secondary' })}
			disabled={$loggedInUser == null}>Edit</Dialog.Trigger
		>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Edit Step</Dialog.Title>
				<Dialog.Description>Edit an existing step</Dialog.Description>
			</Dialog.Header>
			<form action="?/edit" method="post" class="flex flex-col gap-2" use:enhance={handleEdit}>
				<input type="hidden" name="user_id" value={$loggedInUser?.id} />
				<input type="hidden" name="id" value={id} />
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="step_nr">Step #</Label>
					<Input
						id="step_nr"
						name="step_nr"
						class="col-span-3"
						type="number"
						required
						bind:value={step_nr}
					/>
				</div>
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="title">Title</Label>
					<Input id="title" name="title" class="col-span-3" required bind:value={title} />
				</div>
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="description">Description</Label>
					<!-- <Input id="title" name="title" class="col-span-3" required /> -->
					<Textarea
						placeholder="Description"
						id="description"
						name="description"
						class="col-span-3"
						bind:value={description}
					/>
				</div>
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="type">Type</Label>
					<div class="col-span-3 w-full">
						<Select.Root name="type" bind:selected={type}>
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
						<Input id="file" name="file" class="col-span-3" required bind:value={file} />
					</div>
				{/if}
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="assets">Instruction</Label>
					<div class="col-span-3 w-full">
						<Select.Root name="assets" bind:selected={selectedInstruction}>
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
				<Dialog.Title>Delete Step</Dialog.Title>
				<Dialog.Description>Are you sure to delete the step.</Dialog.Description>

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
