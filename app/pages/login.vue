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
      <button class="button uport-connect-btn" @click="doConnectUPort">
        Connect with uPort
      </button>
    </div>
  </div>
</template>

<script>
import firebase from '~/plugins/firebase'
import { Connect, SimpleSigner } from 'uport-connect'
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
        .then(() => console.log('resloved'))
        .catch((err) => console.log(err))
    },
    doConnectUPort() {
      const uport = new Connect('CryptoHaiku', {
        clientId: '2oiX15UxxGBJpa1zYrG4TU1iqhd5YJUkPZG',
        network: 'rinkeby',
        signer: SimpleSigner('643aab8b75b2622a363f4c607b4b7f5f7cd4b0121432094af0e7ce9f80d6dd88')
      })

      // Request credentials to login
      uport.requestCredentials({
        requested: ['name', 'phone', 'country'],
        notifications: true // We want this if we want to recieve credentials
      })
      .then((credentials) => {
        // Do something
        console.log(credentials)
      })
    }

  },
  async mounted () {
    this.isLoading = false
    // let user = await new Promise((resolve, reject) => {
    //   firebase.auth().onAuthStateChanged((user) =>  {
    //     resolve(user)
    //     this.setUser(user)
    //     if (user) {
    //       this.$router.push('/')
    //     }else {
    //       this.isLoading = false
    //     }
    //   })
    // })
  }
}
</script>

<style>
.uport-connect-btn {
  background: #7958d8;
  color: #f9f9fa;
}
</style>