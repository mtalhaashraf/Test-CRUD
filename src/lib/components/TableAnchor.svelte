<script lang="ts">
	export let value;
	export let href;
</script>

{#if value}
	<a
		href={`https://pjttyefgwfimenfozyui.supabase.co/storage/v1/object/public/crud${href}`}
		target="_blank"
		class="hover:underline">{value}</a
	>
{/if}
