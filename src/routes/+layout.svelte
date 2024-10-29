<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import * as Select from '$lib/components/ui/select';
	import * as Tabs from '$lib/components/ui/tabs';
	import { loggedInUser, users } from '$lib/stores/user';
	import type { Snippet } from 'svelte';
	import '../app.css';
	import type { LayoutData } from './$types';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	users.set(data.users_data);

	let currentPath = $derived($page.url.pathname);

	function handleTabChange(route: string | undefined) {
		// console.log('check', value)
		// const route = event.detail.value;
		goto(route || '/');
	}

	function handleUserChange(event: any) {
		const _user = $users.find((user) => user.id === event.value);
		if (_user) loggedInUser.set(_user);
	}
</script>

<div class="h-screen w-screen overflow-y-auto bg-blue-200 p-4">
	<Tabs.Root value={currentPath} onValueChange={handleTabChange} class="w-full">
		<Tabs.List class="grid w-full grid-cols-4">
			<Tabs.Trigger value="/">Users</Tabs.Trigger>
			<Tabs.Trigger value="/step">Steps</Tabs.Trigger>
			<Tabs.Trigger value="/asset">Assets</Tabs.Trigger>
			<Tabs.Trigger value="/instruction">Instructions</Tabs.Trigger>
		</Tabs.List>

		<div class="flex justify-end py-2">
			<Select.Root onSelectedChange={handleUserChange}>
				<Select.Trigger class="w-60">
					<Select.Value placeholder="Select a user" />
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each $users as user}
							<Select.Item value={user.id} label={user.name}>{user.name}</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
				<Select.Input name="Select user" />
			</Select.Root>
		</div>
		{@render children()}
	</Tabs.Root>
</div>
