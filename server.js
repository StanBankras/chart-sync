const express = require('express')
const app = express()
const http = require('http').createServer(app)
const path = require('path')

app.use(express.static(path.resolve('public')))

http.listen(3000, () => console.log('listening on 3000'))