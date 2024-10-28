<script lang="ts">
	export let items: string[] = [];
</script>

<div class="flex flex-col gap-1">
	{#each items as item}
		<p>{item}</p>
	{/each}
</div>
