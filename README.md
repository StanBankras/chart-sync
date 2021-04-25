# Chart Sync

Chart sync helps traders work on their ideas together in real-time. Traders can create rooms where they can generate an invite link for others to join.

![join room](https://github.com/StanBankras/chart-sync/blob/main/img/join-room.png?raw=true)

![charting](https://github.com/StanBankras/chart-sync/blob/main/img/trading-together.png?raw=true)

## 📚 Table of contents
* [Concept](https://github.com/StanBankras/chart-sync/tree/main#-concept)
* [Functionalities](https://github.com/StanBankras/chart-sync/tree/main#-functionalities)
* Parts of Binance API I use
  * [Websockets](https://github.com/StanBankras/chart-sync/tree/main#-websockets)
  * [API calls](https://github.com/StanBankras/chart-sync/tree/main#-api-calls)
* [Data life cycle diagram](https://github.com/StanBankras/chart-sync/tree/main#data-life-cycle-diagram)
* [Real-time events](https://github.com/StanBankras/chart-sync/tree/main#-real-time-events)
* [Stack](https://github.com/StanBankras/chart-sync/tree/main#-stack)
* [Installation](https://github.com/StanBankras/chart-sync/tree/main#installation)
* [Acknowledgements](https://github.com/StanBankras/chart-sync/tree/main#-acknowledgements)
* [License](https://github.com/StanBankras/chart-sync/tree/main#-license)

## ✨ Concept
A lot of traders in the cryptocurrency space are sharing their trade ideas, and there are a lot of big crypto groups discussing ideas. Chart Sync will allow these traders to work on the same canvas to come to ideas and new insights together. 

### Start screen
Setup a new room, or join an existing room

![start](https://github.com/StanBankras/chart-sync/blob/main/img/sketch-1.jpg?raw=true)

### Charting screen
Chart together, see collaborator's activity in real-time.

Three different solutions for this screen:

#### Sketch 1
![live collaboration](https://github.com/StanBankras/chart-sync/blob/main/img/sketch-2.jpg?raw=true)

#### Sketch 2
![live collaboration](https://github.com/StanBankras/chart-sync/blob/main/img/sketch-3.jpg?raw=true)

#### Sketch 3
![live collaboration](https://github.com/StanBankras/chart-sync/blob/main/img/sketch-4.jpg?raw=true)

After looking at these three different approaches, I chose to continue with #3, because the charts are the most important and this way can use all the screen space.


## 🚀 Functionalities

### MoSCoW method
#### Must haves
* [x] Create room
* [x] Add drawing tools on the chart
* [x] Remove drawing tools from the chart
* [x] Move drawing tools on the chart
* [x] Charts update with live price data
* [x] Join existing room

#### Should haves
* [x] Choose layout (single, dual & quad chart)
* [x] Choose other currencies to chart
* [x] See users that are in your room
* [x] Exit current room


#### Could haves
* [x] See previous rooms you were in
* [x] Switch timeframe
* [ ] Export idea as image
* [ ] Change chart layout (add or remove a chart in the room)


#### Won't have this time
* [ ] Host can lock someone's drawing ability
* [ ] Toggle seeing collaborators cursor
* [ ] See online users in rooms you joined before
* [ ] Disallow same usernames

## 🌐 Binance websockets: trade streams
**[WS documentation](https://binance-docs.github.io/apidocs/spot/en/#websocket-market-streams)**

**WS endpoint:** `wss://stream.binance.com:9443`

Some pointers about the websocket streams (from the docs):
* A single connection to stream.binance.com is only valid for 24 hours; expect to be disconnected at the 24 hour mark
* The websocket server will send a ping frame every 3 minutes. If the websocket server does not receive a pong frame back from the connection within a 10 minute period, the connection will be disconnected. Unsolicited pong frames are allowed.

For keeping my charts real-time, I'm going to be listening to the trade streams of the coins that are being watched by the user. For this reason, I will use the [Websocket Market Streams](https://binance-docs.github.io/apidocs/spot/en/#websocket-market-streams). These allow me to subscribe to specific tickers and get the live trades.

A trade is received like this:
```
{
  "e": "aggTrade",  // Event type
  "E": 123456789,   // Event time
  "s": "BNBBTC",    // Symbol
  "a": 12345,       // Aggregate trade ID
  "p": "0.001",     // Price
  "q": "100",       // Quantity
  "f": 100,         // First trade ID
  "l": 105,         // Last trade ID
  "T": 123456785,   // Trade time
  "m": true,        // Is the buyer the market maker?
  "M": true         // Ignore
}
```

Out of this, I need:
* T: trade time
* s: symbol
* q: quantity
* p: price

## ⚙️ Binance API: retreiving historical OHLCV data
**[Market data documentation](https://binance-docs.github.io/apidocs/spot/en/#market-data-endpoints)**

**API endpoint:** `https://api.binance.com`

### Klines / Candlestick data
Mainly what I will need for my charts from the Binance API is the `Kline/Candlestick Data`: `GET /api/v3/klines`. This will allow me to collect the data that needs to be loaded to show on the price chart.
Klines come back in an array that looks like:

```
[
  [
    1499040000000,      // Open time
    "0.01634790",       // Open
    "0.80000000",       // High
    "0.01575800",       // Low
    "0.01577100",       // Close
    "148976.11427815",  // Volume
    1499644799999,      // Close time
    "2434.19055334",    // Quote asset volume
    308,                // Number of trades
    "1756.87402397",    // Taker buy base asset volume
    "28.46694368",      // Taker buy quote asset volume
    "17928899.62484339" // Ignore.
  ]
]
```

Per candle, I will map it so I have:
* Open time
* Open
* High
* Low
* Close
* Volume

### Getting all tickers on Binance
Users need to be able to select a coin pair on Binance to start charting. Therefore, I need to collect all possible pairs.
To do so, I can use `GET /api/v3/exchangeInfo`.

The response will be:
```
{
  "timezone": "UTC",
  "serverTime": 1565246363776,
  "rateLimits": [{}],
  "exchangeFilters": [],
  "symbols": [
    {
      "symbol": "ETHBTC",
      "status": "TRADING",
      ...
    }
  ]
}
```

Out of this, I need to map the symbols array to get all pairs.

## 🗃️ Data life cycle diagram
![data flow](https://github.com/StanBankras/chart-sync/blob/main/img/data-flow.png?raw=true)

My idea is to connect the client with a websockets to the Binance API, to update the price charts, while connecting it to my Node server to sync actions with other collaborators.

*This diagram will become more detailed (per socket event) soon.*

## ⏰ Real-time events
* **Joining a room** - Users currently in a room receive the message and see the new users pop up
* **Leaving a room** - Whether a user exits the room via click of a button, or clicks away their browser tab, other users will know they are gone
* **Drawing a with drawing tools** - Users are updated in real-time of what other people are drawing on the chart(s)
* **Editing a drawing tool** - Drawings that are edited are also updated to other users in the room
* **Deleting a drawing tool** - When someone deletes a drawing tool, it is deleted for everyone
* **Trading data** - All charts are updated with the real-time tradestream of Binance

*Note: since data is saved to a database, there is a 0.5s interval for possible saves to the database when a user is moving a tool, since the move event fire tens of times per second.*

## 🧰 Stack
### Frontend
* **VueJS framework** - Frontend framework that provides easy to use data driven rendering
* **vue-socket.io** - Very nice integration for sockets in Vue components and Vue store
* **trading-vue-js** - Charting package like [tradingview.com](https://tradingview.com), but completely free to use and very 'hackable'
* **haikunator** - Generating random names for my rooms
* **uuid** - Generating random temporary IDs for users

### Backend
* **Express** - Manage serving files to frontend
* **socket.io** - Server side websocket implementation
* **firebase** - Database software by Google that works well with live data
* **babel** - Transpile code from ES6 to ES5

## 🛠️ Installation
#### Install packages

`cd ./src && yarn install`

`cd ./www && yarn install`

#### Environment
In `./www`, add a `.env.local` file with:

`VUE_APP_API_HOSTNAME=http://localhost:3000`

In `./src`, add a `.env` file with:

```
FIREBASE_API_KEY=<FIREBASE_API_KEY>
FIREBASE_AUTH_DOMAIN=http://localhost:8080
FIREBASE_PROJECT_ID=<FIREBASE_PROJECT_ID>
```

Lastly, in Firestore, create a collection named: `rooms`.

## ✅ Acknowledgements
To do

## License
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
