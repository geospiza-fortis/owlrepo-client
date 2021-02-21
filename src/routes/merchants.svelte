<script context="module">
  export async function preload(page, session) {
    // This route no longer exists, redirect to the home page
    return this.redirect(301, "/");
  }
</script>
