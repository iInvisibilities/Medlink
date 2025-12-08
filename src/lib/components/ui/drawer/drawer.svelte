<script lang="ts">
  import { createEventDispatcher } from "svelte";
  export let open = false;
  const dispatch = createEventDispatcher();
  function close() {
    open = false;
    dispatch("close");
  }
</script>

{#if open}
  <div class="fixed inset-0 z-50">
    <div
      class="absolute inset-0 bg-black/50"
      role="button"
      tabindex="0"
      onclick={close}
      onkeydown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') close(); }}
    ></div>
    <div class="absolute right-0 top-0 h-full w-full max-w-md border-l bg-background p-4 shadow-lg">
      <slot />
    </div>
  </div>
{/if}

<style>
  :global(.bg-background) {
    background-color: var(--background);
    color: var(--foreground);
  }
</style>
