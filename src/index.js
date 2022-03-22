const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
// const { randomInt } = require('crypto');
const Game = require('./game.js');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const io = socketio(server);

// class user{
//     constructor(name, room) {
//         this.name = name;
//         this.room = room;
//     }
// }

const players = {};
const rooms = {};

// 960, 468.5
// 1920 937
const TAM_GAME = {width: 600, height: 350};
const FPS = 60;
const padding = 10;

// Seteando carpeta estatica, carpeta donde contiene todos los datos que requiere el usuario cuando hace la peticion
// a la web buscando recursos.
app.use(express.static(path.join(__dirname, 'public')))

const colors = ['blue','red'];

console.log("Empezando!!");
// Funcion que se ejecuta cuando un usuario se conecta al websocket
io.on('connection', (socket) => {
    console.log("Nueva conexion!!");
    socket.on("disconnecting", () => {
        console.log("**** DISCONNECTING ****");
        console.log('leaving: ', socket.id);

        // check if user exists
        if (!players[socket.id]) return 

        let room_name = players[socket.id].room;
        // delete player from players object
        delete players[socket.id];

        // check if room exists
        if (!rooms[room_name]) return

        // delete player from room
        rooms[room_name].players = rooms[room_name].players.filter(player => player['player'].id != socket.id);

        // check if room is empty
        if (rooms[room_name].players.length == 0) {
            delete rooms[room_name];
        }

        console.log(players);
        console.log(JSON.stringify(rooms));
        console.log("**********************");
    });   
        
    // socket.on('client_key', (room_id) => {
    //     socket.broadcast.emit('server', room_id);
    // });
            
    // socket.on('client_move', (move) =>{
    // users[socket.id].x += move.x;
    // users[socket.id].y += move.y;
    
    // console.log("**** MOVING ****");
    // console.log(users);
    // console.log(rooms);
    // console.log("**********************");
    // });

    socket.on('join_room_client', (data) => {
        // if (users[socket.id]){ //if user exist on a room don't use it 
        //     return;
        // }
        let room_id = data.room_id;
        
        /// check if room exist
        if (!rooms[room_id]){
            rooms[room_id] = {};
            rooms[room_id]['players'] = [];
        }

        // only two players can play in a room
        if (rooms[room_id]['players'].length == 2) return;

        let coords;
        let side;

        let myGame ;
        if (rooms[room_id]['players'].length == 0){ // first player, new room
            side = Math.floor(Math.random() * 2); // choose a side randomly between 0 and 1 (left or right)
            myGame = new Game(TAM_GAME, FPS);
            rooms[room_id]['game'] = myGame;
        }
        else{
            side = 1 - rooms[room_id]['players'][0].side; // opposite side, if player1 have 1 then player2 have 0 and viceversa
            myGame = rooms[room_id].game;
        }
        
        // set up side coords
        if (side == 0) // left
            coords = {x:padding, y: TAM_GAME.height/2};
        else // right
            coords = {x: TAM_GAME.width - padding, y: TAM_GAME.height/2};

        const newPlayer = myGame.SpawnPlayer({width: 6, height: 16}, coords, colors[side], 10, socket.id ,`Player${side}`, 0); // debug only

        // set player inside the room
        rooms[room_id]['players'].push({
            side: side,
            player: newPlayer
        });            

        players[socket.id] = {
            room: room_id,
        };
        

        socket.join(room_id);

        // socket.broadcast.to(room_id).emit('server', 'New Player Joined: ' + socket.id);

        console.log(JSON.stringify(rooms));
        
        // room: rooms[room_id] to get players and each side players
        let response = {status: 200, response: {
            room: rooms[room_id],
            TAM_GAME: TAM_GAME
        }};

        io.to(room_id).emit('join_room_server', response);

        // start the game if room is full
        if (rooms[room_id]['players'].length == 2){
            io.to(room_id).emit('start_game_server');

            //start game
            myGame.Run(
                (game) => {
                    game.PlayerMove(
                        (playerPos, id) => {
                            io.to(room_id).emit('update_players_server', );
                        }
                    ); // Move the player (key pressed)
                },
            );
        }
        
        // if (rooms[room_id] && rooms[room_id].length == 2){
        //     const emit_server = (room) => {
        //         // console.log(`emiting to: ${room}`);
        //         let info =  myGame.GetInfoSendClient();
        //         io.to(room).emit('server_update_players', info);
        //     };
            
        //     io.to(room_id).emit('server_start_game', TAM_GAME);
            
        //     console.log(room_id);
        //     io.to(room_id).emit('test', 'testing');
            
        //     myGame.Run([room_id], emit_server);
        //     console.log('****  GAME START  ****')
        //     return;
        // }
    });

    socket.on('client_update_key', (input) => {
        // input.idPlayer = socket.id;
        // myGame.UpdatePlayerKeys(input);
        console.log("**** MOVING ****");
        // // console.log(myGame.GetPlayersKeys());
        // console.log(myGame.GetPlayersDir());
        // console.log("**********************");
    })


    // **** USER USES HABILITIES ****
    /*
    socket.on('client_use_hability', (hability) =>{
        let player = myGame.GetPlayer(socket.id);

        console.log('hability used');

        if (!myGame.gameStarted) return // if game is not started, don't use habilities

        //
        switch (hability){
            case 'attack':
                info = myGame.GetInfoSendClient();
                // io.to(room_id).emit('server_update_players', info);
                break;
            case 'q':
                info = myGame.GetInfoSendClient();
                break;
        }
    });*/
})

server.listen(PORT, () => {console.log(`runing on port ${PORT}`);});