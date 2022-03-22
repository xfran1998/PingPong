const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
// const { randomInt } = require('crypto');
const Game = require('./Game');

const app = express();
const server = http.createServer(app);
const PORT = 3000 || process.env.PORT;
const io = socketio(server);

// class user{
//     constructor(name, room) {
//         this.name = name;
//         this.room = room;
//     }
// }

const users = {};
const rooms = {};

// 960, 468.5
// 1920 937
const TAM_GAME = {width: 1920, height: 935};
const FPS = 60;
const padding = 10;

let myGame = new Game(TAM_GAME, FPS);

// Seteando carpeta estatica, carpeta donde contiene todos los datos que requiere el usuario cuando hace la peticion
// a la web buscando recursos.
app.use(express.static(path.join(__dirname, 'public')))

const colors = ['blue','red'];

let cont=0;
console.log("Empezando!!");
// Funcion que se ejecuta cuando un usuario se conecta al websocket
io.on('connection', (socket) => {
    console.log("Nueva conexion!!");
    socket.on("disconnecting", () => {

        console.log("**** DISCONNECTING ****");
        console.log(socket.id);
        console.log(users);
        console.log(rooms);
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

        if (rooms[room_id].length == 0)
            side = Math.floor(Math.random() * 2); // choose a side randomly between 0 and 1 (left or right)
        else
            side = 1 - rooms[room_id]['players'][0].side; // opposite side, if player1 have 1 then player2 have 0 and viceversa
        
        // set up side coords
        if (side == 0) // left
            coords = [padding, TAM_GAME.height/2];
        else // right
            coords = [TAM_GAME.width - padding, TAM_GAME.height/2];

        // set player inside the room
        rooms[room_id]['players'].push({
            'player_id': socket.id,
            'side': side
        });            
        
        myGame.SpawnPlayer(socket.id, 50, coords, colors[side], 10, `Player${cont++}`, 200); // debug only

        socket.join(room_id);

        // socket.broadcast.to(room_id).emit('server', 'New Player Joined: ' + socket.id);

        console.log(rooms);
        
        let return_msg = {status: 'ok', response: {room: rooms[room_id]}};
        socket.emit('join_room_server', return_msg);

        
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
        input.idPlayer = socket.id;
        myGame.UpdatePlayerKeys(input);
        console.log("**** MOVING ****");
        // console.log(myGame.GetPlayersKeys());
        console.log(myGame.GetPlayersDir());
        console.log("**********************");
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