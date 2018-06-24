<template>
  <section class="hero is-dark is-large">
  <div class="hero-head">
    <nav class="navbar">
      <div class="container">
        <div class="navbar-brand">
          <nuxt-link to="/" class="navbar-item">
            <!-- <img src="https://bulma.io/images/bulma-type-white.png" alt="Logo"> -->
            CryptoHaiku
          </nuxt-link>
          <span class="navbar-burger burger" data-target="navbarMenuHeroB" @click="$store.commit('menu/toggleMenu')" :class="{'is-active': $store.state.menu.isMenuActive}">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </div>
        <div id="navbarMenuHeroB" class="navbar-menu"  :class="{'is-active': $store.state.menu.isMenuActive}">
          <div class="navbar-end">
            <nuxt-link to="/compose" class="navbar-item ">Publish</nuxt-link>
            <nuxt-link to="/mypage" class="navbar-item ">My Haikus</nuxt-link>
            <nuxt-link to="/allList" class="navbar-item ">All Haikus</nuxt-link>
            <!-- <nuxt-link to="/contact" class="navbar-item">Contact</nuxt-link> -->
            <span class="navbar-item">
              <a class="" @click="doLogout">
                <span>Logout</span>
              </a>
            </span>
          </div>
        </div>
      </div>
    </nav>
  </div>
</section>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions('user', ['logout']),
    doLogout () {
      this.logout()
        .then(() => {
          this.$router.push('/login')
        })
        .catch((err) => console.log(err))
    },
    setActive(){
      Vue.set(this.$data, 'isActive', true)
    }
  }
}
</script>