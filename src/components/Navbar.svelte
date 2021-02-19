<script context="module">
  import { navbarIndex } from "../store.js";

  let items = [
    { text: "Home", href: "/" },
    { text: "Items", href: "/items" },
    { text: "Guide", href: "/guide" },
    { text: "Charts", href: "/charts" },
    { text: "Upload", href: "/upload" },
    { text: "Recommendation", href: "/recommendation" },
    { text: "Merchants", href: "/merchants" },
    { text: "Curate", href: "/curate" },
    { text: "Personal", href: "/personal" },
    {
      text: "Forum",
      href:
        "https://forum.maplelegends.com/index.php?threads/owlrepo-a-repository-of-transcribed-owl-searches.32316/"
    }
  ];

  let breakpoint = 5;

  export function setNavbarIndex(href) {
    let index = -1;
    for (let i = 0; i < items.length; i++) {
      if (href === items[i].href) {
        index = i;
        break;
      }
    }
    if (index < 0) {
      console.log(`index for ${href} was not found`);
      return;
    }
    navbarIndex.set(index);
  }
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

  function handleUpdate(event) {
    isOpen = event.detail.isOpen;
  }
</script>

<Navbar color="light" light expand="md">
  <NavbarBrand href="/">owlrepo</NavbarBrand>
  <NavbarToggler on:click={() => (isOpen = !isOpen)} />
  <Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
    <Nav class="mr-auto" tabs>
      {#each items as item, index}
        {#if index < breakpoint}
          <NavItem>
            <NavLink href={item.href} active={$navbarIndex == index}>
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
