export default function ({ store, route, redirect }) {
  if (!store.getters["user/isAuthenticated"]
   && (route.name == 'mypage' || route.name == 'compose')) {
    redirect('/login')
  }
}