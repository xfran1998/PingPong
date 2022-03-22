# JS-WebSocket-Game_Dummy
First multiplayer game using just Node.js (Express and Socket.io)

## ALREADY MADE: 
* WebServer / WebSocket setup
* Game Engine Multiplayer setted
* Client Send Keyboard and server store's it
* Server run the game with 2 players and send it to all roms
* Client update canvas for the values server is sending of the position for the players/projectiles


## TODO:
```Simple```
* Disconnect handler
* Better lobby layout
* Countdown starting game
* Separating player's field
* Couldown habilities
* More habilities (Space: Dash, E: Tarjet projectile, ...)

```Advance```
- Server prediction
  - Client runs his own game (60FPS)
  - Data will be send Cliento-to-Server:
    - Movement (keys, like we did)
    - Player and enemy projectiles positions(10FPS or a bit higher to not saturate bandwith)
  - Data will be send Server-to-Client:
    - Projectile hits player
    - Player is moving wrong (prediction will know if player is trying to cheat moving faster than he should)
- Server class (handle all events of the GameEngine)
- ( Posible handing sync error ) Server will update player position if error between server and client is inside prediction margin error, if not server will send new location of the player to update it
- Make Engine and Server class customicable, for posible future projects.
