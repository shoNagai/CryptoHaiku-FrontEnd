const webpack = require('webpack')

module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'CryptoHaiku',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'CryptoHaiku is a new form of Japanese culture Haiku using blockchains' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  // mode: 'spa',
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  srcDir: 'app',
  /*
  ** Plugins to load before mounting the App
  */
  router: {
    middleware: 'authenticated'
  },
  plugins: [
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [,
  ],
  /*
  ** Include css not in components
  */
  css: [
    // node.js module but we specify the pre-processor
    { src: '~assets/main.scss', lang: 'scss' }
  ],
  /*
  ** Build configuration
  */
  build: {
    /*
    ** Run ESLint on save
    */
    extend (config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
      config.plugins.push(
        new webpack.EnvironmentPlugin(['APIKEY', 'AUTHDOMAIN', 'DATABASEURL'
        , 'PROJECTID', 'STORAGEBUCKET', 'MESSAGINGSENDERID'
        , 'IPFSHOST', 'IPFSPORT', 'IPFSPROTOCOL'
        , 'TXURL', 'NETWORKID', 'IMAGETYPE'])
      )
    }
  }
}
