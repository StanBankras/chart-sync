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