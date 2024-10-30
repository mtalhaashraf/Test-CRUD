<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { buttonVariants, Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	import { Label } from './ui/label';
	import { Input } from './ui/input';
	import { users } from '$lib/stores/user';

	export let id;

	let editModalOpen = false;
	let editing = false;

	let deleteModalOpen = false;
	let deleting = false;

	const handleEditUser = () => {
		editing = true;
		return async ({ result }) => {
			if (result.type === 'success') {
				users.set(result.data.data);
				editModalOpen = false;
				editing = false;
			} else {
				editModalOpen = false;
				editing = false;
				console.error('Error editing user:', result.error);
			}
		};
	};

	const handleDeleteUser = () => {
		deleting = true;
		return async ({ result }) => {
			if (result.type === 'success') {
				users.set(result.data.data);
				deleteModalOpen = false;
				deleting = false;
			} else {
				deleteModalOpen = false;
				deleting = false;
				console.error('Error editing user:', result.error);
			}
		};
	};
</script>

<div class="flex justify-end gap-2">
	<Dialog.Root bind:open={editModalOpen}>
		<Dialog.Trigger class={buttonVariants({ variant: 'secondary' })}>Edit</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Edit User</Dialog.Title>
				<Dialog.Description>Edit an existing user</Dialog.Description>
			</Dialog.Header>
			<form method="post" class="flex flex-col gap-2" use:enhance={handleEditUser} action="?/edit">
				<input type="hidden" name="id" value={id} />
				<div class="grid grid-cols-4 items-center gap-3">
					<Label for="name">Name</Label>
					<Input id="name" name="name" class="col-span-3" required />
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
		<Dialog.Trigger class={buttonVariants({ variant: 'destructive' })}>Delete</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Delete User</Dialog.Title>
				<Dialog.Description>Are you sure to delete the user.</Dialog.Description>

				<form action="?/delete" method="post" use:enhance={handleDeleteUser}>
					<input type="hidden" name="id" value={id} />
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
