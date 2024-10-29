<script lang="ts">
	import AssetTable from '$lib/components/AssetTable.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { assets } from '$lib/stores/asset.js';
	import { instructions } from '$lib/stores/instructions.js';

	export let data;

	assets.set(data.assets);
	instructions.set(data.instructions);
</script>

<Tabs.Content value="/asset">
	<AssetTable />
</Tabs.Content>
