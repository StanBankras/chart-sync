module.exports = {
  head: {
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]
  },
  modules: ['~/io'],
  target: 'static',
  plugins: [
    { src: '~/plugins/trading-vue.client.js', mode: 'client' }
  ],
  env: {
    WS_URL: process.env.WS_URL || 'http://localhost:3000'
  },
}