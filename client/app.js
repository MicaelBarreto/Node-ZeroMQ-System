const express = require("express");
const app = express();
var http = require('http').Server(app);
const bodyParser = require("body-parser");

app.use(bodyParser.json());
require('dotenv/config');

var zmq = require("zeromq"),
  sock = zmq.socket("push");

sock.bindSync("tcp://127.0.0.1:3000");

const PORT = 8000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/send', (req, res) => {
    sock.send(JSON.stringify(req.body));
    res.send(200);
});

app.post('/stop', async (req, res) => {
    sock.send(JSON.stringify(req.body));

    res.send(200);
});

app.options("/*", (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.sendStatus(200);
});
  
app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

http.listen(PORT, () => {
    console.log('Client up and running');
});