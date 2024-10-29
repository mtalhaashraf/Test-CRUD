<script lang="ts">
	import InstructionTable from '$lib/components/InstructionTable.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { assets } from '$lib/stores/asset.js';
	import { instructions } from '$lib/stores/instructions.js';

	export let data;

	instructions.set(data.instructions);
	assets.set(data.assets);
</script>

<Tabs.Content value="/instruction">
	<InstructionTable />
</Tabs.Content>
