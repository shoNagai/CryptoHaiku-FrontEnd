import firebase from '~/plugins/firebase'
const googleProvider = new firebase.auth.GoogleAuthProvider()

const namespaced = true

export const strict = false

export const state = () => ({
  user: null
})

export const getters = {
  user: state => state.user,
  isAuthenticated (state) {
    return !!state.user
  }
}

export const mutations = {
  setUser (state, payload) {
    state.user = payload
  }
}

export const actions = {
  login () {
    return new Promise((resolve, reject) => {
      firebase.auth().signInWithRedirect(googleProvider)
        .then(() => resolve())
        .catch((err) => reject(err))
    })
  },
  setUser ({ commit }, payload) {
    commit('setUser', payload)
  },
  logout ({ commit }) {
    return new Promise((resolve, reject) => {
      firebase.auth().signOut()
        .then(() => {
          commit('setUser', null)
          resolve()
        })
    })
  }
}

export default {
  namespaced,
  state,
  getters,
  actions,
  mutations
}