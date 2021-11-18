# WebSocket App

The first structure, ```stock_request``` is passed after the successful connection between client and server and asks that the server keep telling you about the updated pricing on these specific stocks.

The second structure, ```stocks``` is a simple associative array that will hold the changing values passed back from the server and then used to modify the text in the table and colors.

WebSocket fires four events, which are available from the JavaScript API
1. open
2. message
3. error
4. close

You listen for these events to fire either with the handler on<event name>, or the addEventListener() method. Your code will provide a callback that will execute every time that event gets fired.

## Event: Open
When the WebSocket server responds to the connection request, and the handshake is complete, the open event fires and the connection is established. Once this happens, the server has completed the handshake and is ready to send and receive messages from your client application:
```
// WebSocket connection established
ws.onopen = function(e) {
	console.log("Connection established");
	ws.send(JSON.stringify(stock_request));
};
```
From within this handler you can send messages to the server and output the status to the screen, and the connection is ready and available for bidirectional communication. The initial message being sent to the server over WebSocket is the stock_request structure as a JSON string. Your server now knows what stocks you want to get updates on and will send them back to the client in one-second intervals.
```
    ws.on('message', function (message) {
        var stock_request = JSON.parse(message); //"stocks": ["AAPL", "MSFT", "AMZN", "GOOG", "YHOO"]
        clientStocks = stock_request['stocks'];
        sendStockUpdates(ws);
    });

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
```

## Event: Message
After you’ve established a connection to the WebSocket server, it will be available to send messages to and receive messages.
The WebSocket API will prepare complete messages to be processed in the onmessage handler.
```
// WebSocket message handler
ws.onmessage = function(e) {
    var stocksData = JSON.parse(e.data);
    for(var symbol in stocksData) {
        if(stocksData.hasOwnProperty(symbol)) {
            changeStockEntry(symbol, stocks[symbol], stocksData[symbol]);
            stocks[symbol] = stocksData[symbol];
        }
    }
};
```
You can see from this short snippet that the handler is receiving a message from the server via an onmessage callback. When querying for data, the data attribute will contain updated stock values. The preceding code snippet does the following:

1. Parses the JSON response within ```e.data```
2. Iterates over the associative array
3. Ensures that the key exists in the array
4. Calls your UI update fragment
5. Assigns the new stock values to your local array

You’re passing around regular strings here, but WebSocket has full support for sending text and binary data.

## Event: Error
When a failure happens for any reason at all, the handler you’ve attached to the error event gets fired. When an error occurs, it can be assumed that the WebSocket connection will close and a close event will fire. Because the close event happens shortly after an error in some instances, the code and reason attributes can give you some indication as to what happened. Here’s a sample of how to handle the error case, and possibly reconnect to the WebSocket server as well:
```
ws.onerror = function(e) {
	console.log("WebSocket failure, error", e);
	handleErrors(e);
};
```

## Event: PING/PONG
The WebSocket protocol calls out two frame types: PING and PONG. The WebSocket JavaScript client API provides no capability to send a PING frame to the server. PING frames are sent out by the server only, and browser implementations should send back PONG frames in response.

## Event: Close
The close event fires when the WebSocket connection closes, and the callback onerror will be executed. You can manually trigger calling the onclose event by executing the close() method on a WebSocket object, which will terminate the connection with the server. Once the connection is closed, communication between client and server will not continue. The following example zeros out the stocks array upon a close event being fired to show cleaning up resources:
```
ws.onclose = function(e) {
	console.log(e.reason + " " + e.code);
	for(var symbol in stocks) {
		if(stocks.hasOwnProperty(symbol)) {
			stocks[symbol] = 0;
		}
	}
}

ws.close(1000, 'WebSocket connection closed')
```

## WebSocket Methods
The creators of WebSocket kept its methods pretty simple—there are only two: send() and close().
### Method: Send
When your connection has been established, you’re ready to start sending (and receiving) messages to/from the WebSocket server. The client application can specify what type of data is being passed in and will accept several, including string and binary values. As shown earlier, the client code is sending a JSON string of listed stocks:
```
ws.send(JSON.stringify(stock_request));
```
Performing this send just anywhere won’t be appropriate. As we’ve discussed, WebSocket is event-driven, so you need to ensure that the connection is open and ready to receive messages.

Client
```
var ws = new WebSocket("ws://localhost:8181");
ws.onopen = function(e) {
	ws.send(JSON.stringify(stock_request));
}
```
Server
```
function processEvent(e) {
	if(ws.readyState === WebSocket.OPEN) {
		// Socket open, send!
		ws.send(e);
	} else {
		// Show an error, queue it for sending later, etc
	}
}

```

### Method: Close
You close the WebSocket connection or terminate an attempt at connection is done via the close() method. After this method is called, no more data can be sent or received from this connection. And calling it multiple times has no effect.


