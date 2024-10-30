<script lang="ts">
    import { Input } from "$lib/components/ui/input";
    import { Search } from "lucide-svelte";

    export let value: string;
    export let placeholder = "Search";
    export let maxWidth = "max-w-sm";
</script>

<div class="relative {maxWidth}">
    <Search class="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input 
        class="pl-8 border-2 border-gray-100 focus-visible:border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0" 
        {placeholder} 
        type="text" 
        bind:value
    />
</div>