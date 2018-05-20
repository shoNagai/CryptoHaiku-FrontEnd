<template>
  <div class="container has-text-centered">
    <div v-if="isLoading">
      <p >Loading...</p>
    </div>
    <div v-if="!isLoading">
      <h1 class="title">
        CryptoHaiku
      </h1>
      <h2 class="subtitle">
        CryptoHaiku is a new form of Japanese culture Haiku using blockchains
      </h2>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      isLoading: true,
    }
  },
  async mounted () {
    this.isLoading = false
  }
}
</script>
