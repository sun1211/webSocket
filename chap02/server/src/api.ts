import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import * as WebSocket from 'ws';
import * as http from 'http';
import { AddressInfo } from 'net';
import uuid from 'uuid'

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

var stocks = {
    "AAPL": 95.0,
    "MSFT": 50.0,
    "AMZN": 300.0,
    "GOOG": 550.0,
    "YHOO": 35.0,
    "FB": 75.0
};

//random function
function randomInterval(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

//update value of stocks randomly
var randomStockUpdater = function () {
    for (var symbol in stocks) {
        if (stocks.hasOwnProperty(symbol)) {
            var randomizedChange = randomInterval(-150, 150);
            var floatChange = randomizedChange / 100;
            stocks[symbol] += floatChange;
        }
    }
    let randomMSTime = randomInterval(500, 2500);
    setTimeout(function () {
        randomStockUpdater();
    }, randomMSTime);

};

randomStockUpdater();

wss.on('connection', function (ws) {
    var clientStockUpdater;
    var sendStockUpdates = function (ws) {
        // 0    CONNECTING      Socket has been created. The connection is not yet open.
        // 1    OPEN            The connection is open and ready to communicate.
        // 2    CLOSING         The connection is in the process of closing.
        // 3    CLOSED          The connection is closed or couldn't be opened.
        if (ws.readyState == 1) {   //OPEN
            var stocksObj = {};

            //Update stocks value with randomStockUpdater() function
            for (var i = 0; i < clientStocks.length; i++) {
                let symbol = clientStocks[i];
                stocksObj[symbol] = stocks[symbol];
            }

            //send back to client
            ws.send(JSON.stringify(stocksObj));
        }
    };

    clientStockUpdater = setInterval(function () {
        sendStockUpdates(ws);
    }, 1000);

    var clientStocks = [];

    ws.on('message', function (message) {
        //ws.send(JSON.stringify(stock_request)) from client
        var stock_request = JSON.parse(message); //"stocks": ["AAPL", "MSFT", "AMZN", "GOOG", "YHOO"]
        clientStocks = stock_request['stocks'];
        sendStockUpdates(ws);
    });

    ws.on('close', function () {
        if (typeof clientStockUpdater !== 'undefined') {
            clearInterval(clientStockUpdater);
        }
    });
});

app.get('/heathcheck', (req, res) => {
    res.status(200).send(`Check OK on ${new Date}`);
});

// start our server
server.listen(process.env.PORT || 3005, () => {
    console.log(`Server started on port ${(server.address() as AddressInfo).port}`);
});