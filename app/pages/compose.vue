<template>
  <div class="container">
    <haiku-compose class="column is-narrow is-12"/>
  </div>
</template>

<script>
import HaikuCompose from '~/components/HaikuCompose.vue'

export default {
  components: {
    HaikuCompose
  },
  fetch ({store}) {
    store.commit('menu/resetMenu')
  },
}
</script>