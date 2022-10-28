const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,

  devServer: {
    proxy: {
      '^/media': {
        target: 'http://192.168.1.222:8000',
        changeOrigin: true,
        secure:false,
        pathRewrite: {'^/media': '/media'},
      },
    }
  }

})
