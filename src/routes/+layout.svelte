<script lang="ts">
	import { navigating, page } from '$app/stores';
	import * as Select from '$lib/components/ui/select';
	import Spinner from '$lib/components/ui/spinner/Spinner.svelte';
	import { loggedInUser, users } from '$lib/stores/user';
	import { FileText, FolderOpen, List, Users } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import '../app.css';
	import type { LayoutData } from './$types';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	users.set(data.users_data);

	let currentPath = $derived($page.url.pathname);

	function handleUserChange(event: any) {
		const _user = $users.find((user) => user.id === event.value);
		if (_user) loggedInUser.set(_user);
	}
</script>

<div class="min-h-screen flex bg-white">
	<!-- Sidebar -->
	<div class="w-64 bg-gray-100/50 backdrop-blur-sm p-4 fixed h-screen">
		<nav class="space-y-2">
			<a 
				href="/"
				class={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
					currentPath === '/' 
					? 'bg-white shadow-sm' 
					: 'hover:bg-white/50'
				}`}
			>
				<Users class="w-5 h-5" />
				<span>Users</span>
			</a>
			<a 
				href="/step"
				class={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
					currentPath === '/step' 
					? 'bg-white shadow-sm' 
					: 'hover:bg-white/50'
				}`}
			>
				<List class="w-5 h-5" />
				<span>Steps</span>
			</a>
			<a 
				href="/asset"
				class={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
					currentPath === '/asset' 
					? 'bg-white shadow-sm' 
					: 'hover:bg-white/50'
				}`}
			>
				<FolderOpen class="w-5 h-5" />
				<span>Assets</span>
			</a>
			<a 
				href="/instruction"
				class={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
					currentPath === '/instruction' 
					? 'bg-white shadow-sm' 
					: 'hover:bg-white/50'
				}`}
			>
				<FileText class="w-5 h-5" />
				<span>Instructions</span>
			</a>
		</nav>
	</div>

	<!-- Main Content Wrapper -->
	<div class="flex-1 ml-64 h-screen overflow-auto">
		<!-- Content Area -->
		<div class="p-6 max-w-[1440px] mx-auto">
			<!-- User Select -->
			<div class="mb-6 flex justify-end">
				<Select.Root onSelectedChange={handleUserChange}>
					<Select.Trigger class="w-60 rounded-lg border border-gray-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
						<Select.Value placeholder="Select a user" />
					</Select.Trigger>
					<Select.Content class="rounded-lg border border-gray-200 bg-white shadow-lg">
						<Select.Group>
							{#each $users as user}
								<Select.Item value={user.id} label={user.name} class="px-4 py-2 hover:bg-gray-50">
									{user.name}
								</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
					<Select.Input name="Select user" />
				</Select.Root>
			</div>

			<div class="mx-auto">
				<div class="border border-gray-200 rounded-lg py-4">
					{#if $navigating}
						<div class="flex h-32 items-center justify-center">
							<Spinner size="w-10 h-10" color="text-blue-500" />
						</div>
					{:else}
						{@render children()}
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
