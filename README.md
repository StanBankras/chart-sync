# Chart Sync

Chart sync helps traders work on their ideas together in real-time. Traders can create rooms where they can generate an invite link for others to join.

## Concept & Sketches
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

After looking at these three different approaches, I chose to continue with #2, because the charts are the most important and this way can use all the screen space.


## Functionalities
* [ ] Create room
* [ ] Join existing room
* [ ] Choose layout (single, dual & quad chart)
* [ ] Choose currencies to chart
* [ ] Draw on the charts
* [ ] Host can lock someone's drawing ability
* [ ] Charts update with live price data
* [ ] Toggle seeing collaborators cursor
* [ ] Export idea as image

## Data flow
![data flow](https://github.com/StanBankras/chart-sync/blob/main/img/data-flow.png?raw=true)

My idea is to connect the client with a websockets to the Binance API, to update the price charts, while connecting it to my Node server to sync actions with other collaborators.

## Binance websockets: trade streams
**[WS documentation](https://binance-docs.github.io/apidocs/spot/en/#websocket-market-streams)**

**WS endpoint:** `wss://stream.binance.com:9443`

Some pointers about the websocket streams (from the docs):
* A single connection to stream.binance.com is only valid for 24 hours; expect to be disconnected at the 24 hour mark
* The websocket server will send a ping frame every 3 minutes. If the websocket server does not receive a pong frame back from the connection within a 10 minute period, the connection will be disconnected. Unsolicited pong frames are allowed.

For keeping my charts real-time, I'm going to be listening to the trade streams of the coins that are being watched by the user. For this reason, I will use the [Websocket Market Streams](https://binance-docs.github.io/apidocs/spot/en/#websocket-market-streams). These allow me to subscribe to specific tickers and get the live trades.

A trade is received like this:
```json
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

## Binance API: retreiving historical OHLCV data
**[Market data documentation](https://binance-docs.github.io/apidocs/spot/en/#market-data-endpoints)**

**API endpoint:** `https://api.binance.com`

### Klines / Candlestick data
Mainly what I will need for my charts from the Binance API is the `Kline/Candlestick Data`: `GET /api/v3/klines`. This will allow me to collect the data that needs to be loaded to show on the price chart.
Klines come back in an array that looks like:

```json
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
```json
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