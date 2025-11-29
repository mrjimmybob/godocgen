<script lang="ts">
    import { goto } from '$app/navigation';
    
    export let breadcrumbs: { label: string, route?: string }[] = [];
</script>

<nav class="bg-gray-0 p-4 shadow flex items-center justify-between">
    <div class="flex items-center gap-4">
        <img src="/logo.png" alt="Logo" class="h-18 w-18" />
        <h1 class="font-bold text-xl">Generator de Documentos GO</h1>
    </div>

    <div class="flex gap-2 text-sm text-gray-100">
        {#each breadcrumbs as crumb, i}
            {#if crumb.route}
                <a href={crumb.route} 
                    on:click|preventDefault={() => goto(crumb.route)} 
                    class="hover:underline">
                    {crumb.label}
                </a>
            {:else}
                <span>{crumb.label}</span>
            {/if}
            {#if i < breadcrumbs.length - 1}
                <span>&gt;</span>
            {/if}
        {/each}
    </div>
</nav>
