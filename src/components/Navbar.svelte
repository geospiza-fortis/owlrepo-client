<script context="module">
  const items = [
    { text: "Home", href: "" },
    { text: "Items", href: "items" },
    { text: "Guide", href: "guide" },
    { text: "Charts", href: "charts" },
    { text: "Upload", href: "upload" },
    { text: "Recommendation", href: "recommendation" },
    { text: "Curate", href: "curate" },
    { text: "Personal", href: "personal" },
    {
      text: "Forum",
      href:
        "https://forum.maplelegends.com/index.php?threads/owlrepo-a-repository-of-transcribed-owl-searches.32316/"
    }
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
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
  } from "sveltestrap/src";

  const breakpoint = 5;
  let isOpen = false;

  export let segment;

  function handleUpdate(event) {
    isOpen = event.detail.isOpen;
  }
</script>

<Navbar color="light" light expand="md">
  {#if !isOpen}
    <NavbarBrand href="/">owlrepo</NavbarBrand>
  {/if}
  <NavbarToggler class="ml-auto" on:click={() => (isOpen = !isOpen)} />
  <Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
    <Nav class="mx-auto" tabs>
      <NavbarBrand href="/">owlrepo</NavbarBrand>
      {#each items as item, index}
        {#if index < breakpoint}
          <NavItem>
            <NavLink
              href={item.href}
              active={!segment ? '' == item.href : segment == item.href}>
              {item.text}
            </NavLink>
          </NavItem>
        {/if}
      {/each}
      <UncontrolledDropdown>
        <DropdownToggle nav caret>Other</DropdownToggle>
        <DropdownMenu right>
          {#each items as item, index}
            {#if index >= breakpoint}
              <DropdownItem href={item.href}>{item.text}</DropdownItem>
            {/if}
          {/each}
        </DropdownMenu>
      </UncontrolledDropdown>
      <NavItem>
        <NavLink href="https://maplelegends.com/" target="_blank">
          MapleLegends
        </NavLink>
      </NavItem>
    </Nav>
  </Collapse>
</Navbar>
