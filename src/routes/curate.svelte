<script context="module">
  export async function load() {
    // This route no longer exists, redirect to the home page
    return {
      status: 302,
      redirect: "/",
    };
  }
</script>
