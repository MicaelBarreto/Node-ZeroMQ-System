require('dotenv/config');
const express = require("express");
const bodyParser = require("body-parser");
var zmq = require("zeromq"),
  sock = zmq.socket("pull");

const PORT = 3000;
 
const app = express();
app.use(bodyParser.json());

sock.connect("tcp://127.0.0.1:3000");

var logs = [];
var number = false;
var operator = [];
var results = [];
var lastMessageClient = false; // True = client1, False = client2
var stop = false;

sock.on("message", (msg) => {
    msg = JSON.parse(msg.toString());
    var client = msg.client;
    msg = msg.msg;

    if(!stop) {
        if(client === 'client1' && !lastMessageClient) {
            if(number) {
                logs.push(`Number ${msg} received from ${client}`);
                logs.push(`Calculating ${number}${operator}${msg}`);

                if(operator === '^') {
                    var result = eval(`Math.pow(${number}, ${msg})`);
                } else {
                    var result = eval(`${number}${operator}${msg}`);
                }
                
                results.push(result);

                number = result;

            } else {
                number = msg;
                logs.push(`Number ${msg} received from ${client}`);
            }

            lastMessageClient = !lastMessageClient;

        } else if(client === 'client2' && lastMessageClient) {
            operator = msg;
            logs.push(`Operation ${msg} received from ${client}`);

            lastMessageClient = !lastMessageClient;
            
        } else if (msg === 'STOP') {
            stop = true;
            logs.push(`STOP message received from ${client}`);

        } else {
            logs.push(`Message ${msg} received from ${client} but was ignored`);
        }
    }
});

app.options("/*", function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.sendStatus(200);
});

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get('/results', (req, res) => {
    res.json({ logs, results });
});

app.get('/', (req, res) => {
    res.send('Up and running');
});
 
app.listen(PORT);