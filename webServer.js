var express = require('express') // 引入express模块
var app = express() // express对象
const testStr = {
  name: 'matt',
  sex: 'male',
  age: 20,
  skills: ['js', 'ts', 'css', 'html', 'node']
} // 版本检查返回的数据，假数据，自行修改
let port = 3030
console.log(process.argv)
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

// 静态资源
app.use(express.static('dist'))

app.listen(port, function () {
  // 服务端口监听
  console.log(`server now listening at port ${port}`)
})
