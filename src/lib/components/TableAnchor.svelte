<script lang="ts">
	export let value;
</script>

{#if value}
	<a href={value} target="_blank" class="hover:underline">{value}</a>
{/if}
