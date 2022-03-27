const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
// const { randomInt } = require('crypto');
const {Game, GameMode} = require('./game.js');
const { disable } = require('express/lib/application');

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

// initial game values
const TAM_GAME = {width: 600, height: 350};
const FPS = 60;
const padding = 20;
const TAM_PLAYER = {width: 10, height: 50};
const PLAYER_SPEED = 10;

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
        rooms[room_name].players = rooms[room_name].players.filter(playerSettings => playerSettings.player.id !== socket.id);

        // delete user from game
        rooms[room_name].game.DeletePlayer(socket.id);
        rooms[room_name].game.Stop(
            // check if room exists
            () => {
                // check if room room exists
                console.log('STOP');
                if (!rooms[room_name]) return
                console.log('room exist');

                if (rooms[room_name].players.length == 0) {   
                    delete rooms[room_name];
                    console.log('game deleted');
                    return;
                }

                io.to(room_name).emit('change_game_state_server', {
                    gameState: rooms[room_name].game.GetGameMode().GetGameState()
                });
            });
    });   
    
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
            myGame.SpawnBall({width:24, height:24}, {x: TAM_GAME.width/2, y: TAM_GAME.height/2}, 'black', 10);
            myGame.SetRoomId(room_id);
            StartRoom(myGame); // starts gameLoop
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
        
        const newPlayer = myGame.SpawnPlayer(TAM_PLAYER, coords, colors[side], PLAYER_SPEED, socket.id ,`Player${side}`, 0, side); // debug only
        
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
        
        // console.log(JSON.stringify(rooms));
        
        // room: rooms[room_id] to get players and each side players
        let response = {status: 200, response: {
            room_players: rooms[room_id]['players'],
            TAM_GAME: TAM_GAME
        }};
        
        io.to(room_id).emit('join_room_server', response);

        // TODO: Change this to it in another way, maybe send this in change game state
        if (myGame.GetGameMode().GetGameState() == GameMode.GAME_STATE.WAITING_PLAYERS){
            socket.emit('waiting_player_server', {
                submit_text: 'Ready',
            });
        }

        socket.emit('change_game_state_server', { 
            gameState: myGame.GetGameMode().GetGameState()
        });
        
        // start the game if room is full
        if (rooms[room_id]['players'].length == 2){
            io.to(room_id).emit('set_ball_server', {
                ball: myGame.GetBall(),
            });
            myGame.Run(); //start game
            // io.to(room_id).emit('start_game_server');            
            socket.broadcast.to(room_id).emit('change_game_state_server', {
                gameState: myGame.GetGameMode().GetGameState()
            });            
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

    socket.on('update_key_client', (input) => {
        if (!players[socket.id]) return;

        input.idPlayer = socket.id;
        rooms[players[socket.id].room].game.UpdatePlayerKeys(input);
        // console.log("**** MOVING ****");
        // // console.log(myGame.GetPlayersKeys());
        // console.log(myGame.GetPlayersDir());
        // console.log("**********************");
    });
    
    socket.on('set_room_menu_client', (gameSettings) => {
        // check if player exist
        if (!players[socket.id]) return;
        
        // check if room exist
        room_name = players[socket.id].room;
        if (!rooms[room_name]) return;
        
        let myGame = rooms[room_name].game;

        
        if (!myGame.GetIsPlayerWaiting()){
            myGame.ChangeGameSetting(gameSettings);
            myGame.SetGameMode(GameMode.GAME_STATE.WAITING_PLAYERS);
        }

        
        // io.to(room).emit('waiting_player_server');


        socket.broadcast.to(room_name).emit('waiting_player_server', {
            submit_text: 'Ready',
        });
        
        socket.emit('waiting_player_server', {
            submit_text: 'Waiting Player',
        });

        console.log('set_room_menu_server');
        
        if (myGame.SetPlayerWaiting(true)){
            myGame.SetGameMode(GameMode.GAME_STATE.PLAYING);
            io.to(room_name).emit('change_game_state_server', {
                gameState: rooms[room_name].game.GetGameMode().GetGameState()
            });
        }
    });


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

function StartRoom(myGame){
    SetGameBeheavur(myGame);
}

async function SetGameBeheavur(myGame){ // TODO: WHEN A PLAYER LEAVES THE ROOM, THE GAME SHOULD STOP
    if (!myGame.IsBeheavurSet()){ // if beheavur is not set, set it
        myGame.SetPlayingBeheavur((game) => {
            game.PlayerMove(
                (playerPos, id) => {
                    // console.log(`Player ${id} moved to ${playerPos}`);
                    io.to(myGame.GetRoomId()).emit('update_player_pos_server', {
                        playerPos: playerPos,
                        playerId: id
                    });
                }), // Move the player (key pressed)
            game.BallMove(
                (ballPos) => {
                    // console.log(`Move Ball`);
                    io.to(myGame.GetRoomId()).emit('update_ball_pos_server', {
                        ballPos: ballPos
                    });

                }) // Move the ball
            game.CheckCollision( 
                async (hitSide) => {
                    let waitBallGrowing = false;
                    let ball;
                    let original_size;
                    let original_speed;


                    if (hitSide != -1){ // Ball hits the left/right borders of the field, so one player scores
                        // console.log('Ball hit: ', hitSide);
                        waitBallGrowing = true;
                        let player_id = myGame.GetPlayerId({side: 1-hitSide}); // Get the player id of the player that hit the ball
                        
                        myGame.AddScorePlayer(player_id);
                        
                        // TODO: Move the ball to the center, change the size to 0 and the velocity to 0 |  CHECKED
                        ball = myGame.GetBall();
                        original_size = ball.size.width;
                        original_speed = ball.speed;

                        let size_canvas = myGame.GetCanvasSize();
                        
                        ball.size.width = 0;
                        ball.speed = 0;
                        
                        ball.pos.x = size_canvas.width/2;
                        ball.pos.y = size_canvas.height/2;
                        
                        io.to(myGame.GetRoomId()).emit('update_score_server', {
                            player_id: player_id,
                            score: myGame.GetScorePlayer(player_id)
                        });
                    }     
                    if (waitBallGrowing){
                        // TODO: Change gradually the size of the ball from 0 to his original size in a certain time
                        await WaitGrowing(myGame, ball, original_size);
                        // TODO: When that certain time is over, change velocity to aim the field player who scored (1-hitSide)
                        ball.speed = original_speed;
                    }
                        
                    
                });
            });
        }
}

async function WaitGrowing(myGame, ball, original_size){
    let size_time_interval = 2000; 
    return new Promise((resolve, reject) => {
        let gameFrec = myGame.gameFrec;
        let growInterval = setInterval(() => {
            ball.size.width += original_size * (gameFrec/size_time_interval);

            io.to(myGame.GetRoomId()).emit('update_ball_size_server', {
                ballSize: ball.size
            });
        }, gameFrec);
        
        setTimeout(() => {
            clearInterval(growInterval);
            ball.size.width = original_size;
            resolve();
        }, size_time_interval);
    });
}

server.listen(PORT, () => {console.log(`runing on port ${PORT}`);});