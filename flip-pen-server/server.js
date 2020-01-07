var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(8381);

function handler(req, res) {
  fs.readFile(__dirname + '/index.html', function(err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}

var sockets = {};

io.on('connection', function(socket) {
  socket.on('message', function(data) {
    console.log(data);
    if (sockets[data.id]) {
      sockets[data.id].emit('message', data.data);
    }
  });

  // 创建会话
  socket.on('new', () => {
    const id = socket.id;
    sockets[id] = socket;
  });

  // 移除
  socket.on('disconnect', () => {
    const id = socket.id;
    if (sockets[id]) {
      delete sockets[id];
    }
  });
});
