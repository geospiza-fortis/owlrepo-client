<script context="module">
  const items = [
    { text: "Summary", href: "/summary" },
    { text: "Items", href: "/items" },
    { text: "Upload", href: "/upload" },
    { text: "Charts", href: "/charts" },
    { text: "About", href: "/about" },
    { text: "Recommendation", href: "/recommendation" },
    { text: "Personal", href: "/personal" },
    { text: "Sign and Verify", href: "/sign" },
    {
      text: "Forum",
      href:
        "https://forum.maplelegends.com/index.php?threads/owlrepo-a-repository-of-transcribed-owl-searches.32316/",
    },
    {
      text: "Desktop Client (Github)",
      href: "https://github.com/geospiza-fortis/owlrepo-client/releases",
    },
  ];
</script>

<script>
  import { browser } from "$app/environment";

  const isTauri = browser && window.__TAURI__;
  const breakpoint = 5 - (isTauri ? 2 : 0);
  let isOpen = false;
  let dropdownOpen = false;

  function handleWindowClick() {
    if (dropdownOpen) dropdownOpen = false;
  }

  export let segment;
</script>

<svelte:window on:click={handleWindowClick} />

<nav class="navbar navbar-expand-md navbar-dark bg-primary">
  {#if !isOpen}
    <a class="navbar-brand" href="/">
      <img src="/favicon.png" alt="owl of minerva" />
      owlrepo
    </a>
  {/if}
  <button
    class="navbar-toggler ms-auto"
    type="button"
    aria-label="Toggle navigation"
    on:click={() => (isOpen = !isOpen)}
  >
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" class:show={isOpen}>
    <ul class="nav mx-auto">
      <li class="nav-item">
        <a class="navbar-brand" href="/">
          <img src="/favicon.png" alt="owl of minerva" />
          owlrepo
        </a>
      </li>
      {#if isTauri}
        <li class="nav-item">
          <a class="nav-link" href="/screenshots">Screenshots</a>
        </li>
      {/if}
      {#each items as item, index}
        {#if index < breakpoint}
          <li class="nav-item">
            <a
              class="nav-link"
              class:active={!segment ? "" == item.href : segment == item.href}
              href={item.href}
              target={item.href.startsWith("https://") ? "_blank" : ""}
            >
              {item.text}
            </a>
          </li>
        {/if}
      {/each}
      <li class="nav-item dropdown">
        <a
          class="nav-link dropdown-toggle"
          href="#other"
          role="button"
          on:click|preventDefault|stopPropagation={() => (dropdownOpen = !dropdownOpen)}
        >
          Other
        </a>
        <ul class="dropdown-menu dropdown-menu-end" class:show={dropdownOpen}>
          {#each items as item, index}
            {#if index >= breakpoint}
              <li>
                <a
                  class="dropdown-item"
                  href={item.href}
                  target={item.href.startsWith("https://") ? "_blank" : ""}
                >
                  {item.text}
                </a>
              </li>
            {/if}
          {/each}
        </ul>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="https://maplelegends.com/" target="_blank">
          MapleLegends
        </a>
      </li>
    </ul>
  </div>
</nav>

<style>
  :global(.nav-link) {
    color: rgba(255, 255, 255, 0.95);
  }
</style>
