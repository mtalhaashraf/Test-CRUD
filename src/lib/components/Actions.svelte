<script>
	import Button from "./ui/button/button.svelte";

    export let id;

    const handleEdit = () => {
        console.log('edit', id);
    }
    const handleDelete = () => {
        console.log('delete', id);
    }
</script>
<div class="flex items-center gap-2">
    <Button variant='ghost' on:click={handleEdit}>Edit</Button>
    <Button variant='destructive' on:click={handleDelete}>Delete</Button>
</div>