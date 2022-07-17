<script lang="ts">
  import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
  } from "sveltestrap";
  import { shouldPruneProcessed } from "./store.js";

  let open = false;
  const toggle = () => (open = !open);
</script>

<Button color="warning" on:click={toggle}>Recycle processed owls</Button>
<Modal isOpen={open} {toggle}>
  <ModalHeader {toggle}>Recycle processed owls</ModalHeader>
  <ModalBody>
    Are you sure you want to move the original screenshots for processed owls to
    the trash?
  </ModalBody>
  <ModalFooter>
    <Button
      color="primary"
      on:click={() => {
        toggle();
        $shouldPruneProcessed = true;
      }}>Yes</Button
    >
    <Button color="secondary" on:click={toggle}>Cancel</Button>
  </ModalFooter>
</Modal>
