import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import * as WebSocket from 'ws';
import * as http from 'http';
import { AddressInfo } from 'net';

const app = express();

// Application-Level Middleware

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

// initialize a simple http server
const server = http.createServer(app);

// initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on('connection', function(ws) {
	console.log('client connected');
    ws.on('message', function(message) {
		console.log(message);
    });
});

app.get('/heathcheck', (req, res) => {
  res.status(200).send(`Check OK on ${new Date}`);
});

// start our server
server.listen(process.env.PORT || 3005, () => {
    console.log(`Server started on port ${(server.address() as AddressInfo).port}`);
});