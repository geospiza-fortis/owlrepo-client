<script context="module">
  const items = [
    { text: "Home", href: "" },
    { text: "Items", href: "items" },
    { text: "Guide", href: "guide" },
    { text: "Charts", href: "charts" },
    { text: "Upload", href: "upload" },
    { text: "Recommendation", href: "recommendation" },
    { text: "Merchants", href: "merchants" },
    { text: "Curate", href: "curate" },
    { text: "Personal", href: "personal" },
    {
      text: "Forum",
      href:
        "https://forum.maplelegends.com/index.php?threads/owlrepo-a-repository-of-transcribed-owl-searches.32316/"
    }
  ];

  let breakpoint = 5;
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
  let isOpen = false;

  export let segment;

  function handleUpdate(event) {
    isOpen = event.detail.isOpen;
  }
  $: console.log(segment);
</script>

<Navbar color="light" light expand="md">
  <NavbarBrand href="/">owlrepo</NavbarBrand>
  <NavbarToggler on:click={() => (isOpen = !isOpen)} />
  <Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
    <Nav class="mr-auto" tabs>
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
