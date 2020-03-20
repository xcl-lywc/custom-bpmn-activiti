module.exports = {
  lintOnSave: false,
  devServer:{
	  port:8888,
	  proxy: {
      '/api': {//通用api代理
        target: 'http://192.168.31.10:19999',
        ws:true, // 为true表示可以给webscoket使用
        pathRewrite: {'^/api' : ''}, //重定向
        secure: false
      },
    }
  }
}