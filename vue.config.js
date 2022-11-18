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
      '^/admin': {
        target: 'http://192.168.1.222:8000',
        changeOrigin: true,
        secure:false,
        pathRewrite: {'^/admin': '/admin'},
      },
      '^/static': {
        target: 'http://192.168.1.222:8000',
        changeOrigin: true,
        secure:false,
        pathRewrite: {'^/static': '/static'},
      },
      '^/gp': {
        target: 'http://192.168.1.222:8000',
        changeOrigin: true,
        secure:false,
        pathRewrite: {'^/gp': '/gp'},
      },
    }
  }

})
