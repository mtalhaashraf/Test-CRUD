<script lang="ts">
	import AssetTable from '$lib/components/AssetTable.svelte';
	import InstructionTable from '$lib/components/InstructionTable.svelte';
	import StepTable from '$lib/components/StepTable.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import UserTable from '$lib/components/UserTable.svelte';

	export let data;
</script>

<div class="h-screen w-screen bg-blue-200 p-4">
	<Tabs.Root value="user" class="w-full">
		<Tabs.List class="grid w-full grid-cols-4">
			<Tabs.Trigger value="user">Users</Tabs.Trigger>
			<Tabs.Trigger value="step">Steps</Tabs.Trigger>
			<Tabs.Trigger value="asset">Assets</Tabs.Trigger>
			<Tabs.Trigger value="instruction">Instructions</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="user">
			<UserTable users={data.users} />
		</Tabs.Content>
		<Tabs.Content value="step">
			<StepTable steps={data.steps} />
		</Tabs.Content>
		<Tabs.Content value="asset">
			<AssetTable assets={data.assets}/>
		</Tabs.Content>
		<Tabs.Content value="instruction">
			<InstructionTable instructions={data.instructions} />
		</Tabs.Content>
	</Tabs.Root>
</div>
