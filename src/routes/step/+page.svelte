<script lang="ts">
	import StepTable from '$lib/components/StepTable.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { instructions } from '$lib/stores/instructions.js';
	import { steps } from '$lib/stores/step.js';

	export let data;
	steps.set(data.steps);
	instructions.set(data.instructions);
</script>

<StepTable />
