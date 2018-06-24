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
      <a @click="doLogin">
        <img :src="image_src">
      </a>
    </div>
  </div>
</template>

<script>
import firebase from '~/plugins/firebase'
import { mapActions } from 'vuex'
export default {
  layout (context) {
    return 'login'
  },
  data () {
    return {
      isLoading: true,
      image_src: require("~/assets/btn_google_signin_light_normal_web.png")
    }
  },
  methods: {
    ...mapActions('user', ['login', 'setUser']),
    doLogin () {
      this.login()
        .then(() => 
          console.log('resloved'))
        .catch((err) => console.log(err))
    },
  },
  async mounted () {
    let user = await new Promise((resolve, reject) => {
      firebase.auth().onAuthStateChanged((user) =>  {
        resolve(user)
        this.setUser(user)
        if (user) {
          this.$router.push('/')
        }else {
          this.isLoading = false
        }
      })
    })
  }
}
</script>