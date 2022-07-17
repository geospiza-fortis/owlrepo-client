<script lang="ts">
  import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
  } from "sveltestrap";
  export let header = "";
  export let body = "";
  export let onClick = () => {};

  let open = false;
  const toggle = () => (open = !open);
</script>

<Button color="warning" on:click={toggle}>{header}</Button>
<Modal isOpen={open} {toggle}>
  <ModalHeader {toggle}>{header}</ModalHeader>
  <ModalBody>
    {body}
  </ModalBody>
  <ModalFooter>
    <Button
      color="primary"
      on:click={() => {
        toggle();
        onClick();
      }}>Yes</Button
    >
    <Button color="secondary" on:click={toggle}>Cancel</Button>
  </ModalFooter>
</Modal>
