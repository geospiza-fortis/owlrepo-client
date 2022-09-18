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
  import {
    Collapse,
    Navbar,
    NavbarBrand,
    NavbarToggler,
    Nav,
    NavItem,
    NavLink,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
  } from "sveltestrap";
  import { browser } from "$app/env";

  const breakpoint = 5 - (browser && window.__TAURI__ ? 2 : 0);
  let isOpen = false;

  export let segment;
</script>

<Navbar class="navbar-dark bg-primary" expand="md">
  {#if !isOpen}
    <NavbarBrand href="/">
      <img src="/favicon.png" alt="owl of minerva" />
      owlrepo
    </NavbarBrand>
  {/if}
  <NavbarToggler class="ml-auto" on:click={() => (isOpen = !isOpen)} />
  <Collapse
    {isOpen}
    navbar
    expand="md"
    on:open={() => (isOpen = true)}
    on:close={() => (isOpen = false)}
  >
    <Nav class="mx-auto">
      <NavbarBrand href="/">
        <img src="/favicon.png" alt="owl of minerva" />
        owlrepo
      </NavbarBrand>
      {#if window.__TAURI__}
        <NavItem>
          <NavLink href="/screenshots">Screenshots</NavLink>
        </NavItem>
      {/if}
      {#each items as item, index}
        {#if index < breakpoint}
          <NavItem>
            <NavLink
              href={item.href}
              active={!segment ? "" == item.href : segment == item.href}
              target={item.href.startsWith("https://") ? "_blank" : ""}
            >
              {item.text}
            </NavLink>
          </NavItem>
        {/if}
      {/each}
      <Dropdown>
        <DropdownToggle nav caret>Other</DropdownToggle>
        <DropdownMenu right>
          {#each items as item, index}
            {#if index >= breakpoint}
              <DropdownItem
                href={item.href}
                target={item.href.startsWith("https://") ? "_blank" : ""}
                >{item.text}</DropdownItem
              >
            {/if}
          {/each}
        </DropdownMenu>
      </Dropdown>
      <NavItem>
        <NavLink href="https://maplelegends.com/" target="_blank">
          MapleLegends
        </NavLink>
      </NavItem>
    </Nav>
  </Collapse>
</Navbar>

<style>
  :global(.nav-link) {
    color: rgba(255, 255, 255, 0.95);
  }
</style>
