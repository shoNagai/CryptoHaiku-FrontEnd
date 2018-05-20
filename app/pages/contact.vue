<template>
  <div class="container has-text-centered">
    <h1 class="title is-size-2">
      Contact
    </h1>
    <h2 class="subtitle is-size-4">
      You can contact to our.
    </h2>
  </div>
</template>

<script>
export default {
  fetch ({store}) {
    store.commit('menu/resetMenu')
  }
}
</script>