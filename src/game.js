// const canvas = document.querySelector('#game');
// const context = canvas.getContext('2d');

// canvas.width = innerWidth;
// canvas.height = innerHeight;

class GMath {
    static NormalizeVector(vec, type_vector=true){
        // vector is given as a vector [x, y]
        if (type_vector) {
            let mod = Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1]);
            let mov = [0, 0];
            if (mod != 0){
                mov = [vec[0]/mod, vec[1]/mod];
            }

            return mov;
        }

        // vector is given as object {x: , y: }
        let mod = Math.sqrt(vec.x ** 2 + vec.y ** 2);
        let mov = {x: 0, y: 0};
        if (mod != 0){
            mov = {x: vec.x/mod, y: vec.y/mod};
        }

        return mov;
    }

    static GetVector(pos1, pos2){
        return {x: pos2.x-pos1.x, y: pos2.y-pos1.y};
    }
}

class Pawn{
    constructor(size, pos, color, speed){
        this.size = size;
        this.pos = pos;
        this.color = color;
        this.speed = speed;
    }

    Update(vel_dir){
        this.pos = [this.pos.x+vel_dir[0]*this.speed, this.pos.y+vel_dir[1]*this.speed];
        // console.log(tarjetPos);
    }  

    UpdateValid(vel_dir, canvas_size){
        this.pos.x += vel_dir[0]*this.speed;
        this.pos.y += vel_dir[1]*this.speed;

        let hit_borders = {x_axis:false, y_axis:false}; 
        // Check inside cambas x axis
        if (this.pos.x < this.size.width/2 ){
            this.pos.x = this.size.width/2;
            hit_borders.x_axis = true;
        }
        if (this.pos.x > canvas_size.width - this.size.width/2){
            this.pos.x = canvas_size.width - this.size.width/2;
            hit_borders.x_axis = true;
        }
        // Check inside cambas y axis
        if (this.pos.y < this.size.height/2){
            this.pos.y = this.size.height/2;
            hit_borders.y_axis = true;
        }
        if (this.pos.y > canvas_size.height - this.size.height/2){
            this.pos.y = canvas_size.height - this.size.height/2;
            hit_borders.y_axis = true;
        }

        // console.log('pos2:'+this.pos.x+','+this.pos.y);
        return hit_borders;
    }  

    SetPos(pos){
        this.pos = pos;
    }
}

class Player extends Pawn{
    constructor(size, pos, color, speed, id, name, score, side){
        super(size, pos, color, speed);
        this.id = id;
        this.name = name;
        this.score = score;
        this.side = side;
        this.keysPress = [];
        this.direction = {x: 0, y: 0};
    }

    // Move toward espefic target, this a
    Move(canvas_size){
        if (this.keysPress.length == 0){
            return false;
        }

        let vel_dir = GMath.NormalizeVector([this.direction.x, this.direction.y]);
        super.UpdateValid(vel_dir, canvas_size);

        return true;
    }

    GetPos(){
        return this.pos;
    }

    GetColor(){
        return this.color;
    }

    UpdateDir(){
        let dirPressed = {x: false, y: false}; // x direccion not pressed and y the same
        this.keysPress.forEach( (key) => {
            // console.log(`key: ${key}`);
            // if ((key == 'a' || key == 'A')){
            //     this.direction.x = -1;
            //     dirPressed.x = true;
            // } 
            // else if ((key == 'd' || key == 'D')){
            //     this.direction.x = 1;
            //     dirPressed.x = true;
            // } 
            
            if ((key == 'w')) {
                this.direction.y = -1;
                dirPressed.y = true;
                
            }
            else if ((key == 's')) {
                this.direction.y = 1;
                dirPressed.y = true;
            }
        });

        // Check if direction not pressed and set direction to 0
        // if (!dirPressed.x) this.direction.x = 0;
        if (!dirPressed.y) this.direction.y = 0;
    }

    KeyPressed(key){
        if (this.keysPress.indexOf(key) != -1) return; // Key already pressed, avoid duplicates
        
        this.keysPress.push(key); // Add key to keysPress array
        this.UpdateDir();
        // console.log('direction-pres: ' + JSON.stringify(this.direction));
    }
    
    KeyReleassed(key){
        let ind = this.keysPress.indexOf(key);
        
        if (ind == -1) return;
        
        this.keysPress.splice(ind,1);
        
        // console.log(`Released: ${key}`);
        this.UpdateDir();
        // console.log('direction-rel: ' + JSON.stringify(this.direction));
    }
    
    GetKeyPressed(){
        return this.keysPress;
    }

    GetDirection(){
        return this.direction;
    }

    GetName(){
        return this.name;
    }

    SetPos(pos){
        super.SetPos(pos);
    }
}


class Ball extends Pawn{
    constructor(size, pos, color, speed){
        super(size, pos, color, speed);
        this.direction = {x: 1, y: 1};
    }

    Move(canvas_size){
        let vel_dir = GMath.NormalizeVector([this.direction.x, this.direction.y]);
        let hit_borders = super.UpdateValid(vel_dir, canvas_size);
        let hitSide = -1;

        if (hit_borders.x_axis){
            hitSide = (this.direction.x > 0) ? 1 : 0;
            this.direction.x *= -1;
        }
        if (hit_borders.y_axis){
            this.direction.y *= -1; // GG
        }

        return hitSide;
    }

    CheckCollisionPlayer(player){
        let collision = {x: this.CheckXCollision(player), y: this.CheckYCollision(player)};

        return collision;
    }

    GetPos(){
        return this.pos;
    }

    CheckXCollision(player){
        if (this.pos.x + this.size.width/2 < player.pos.x - player.size.width/2) return false;
        if (this.pos.x - this.size.width/2 > player.pos.x + player.size.width/2) return false;
        return true;
    }

    CheckYCollision(player){
        if (this.pos.y + this.size.height/2 < player.pos.y - player.size.height/2) return false;
        if (this.pos.y - this.size.height/2 > player.pos.y + player.size.height/2) return false;
        return true;
    }
}

class GameState{
    constructor(){
        this.players = {};
        this.ball = null;
        this.isPlayerWaiting = false;
        this.room_id;
        this.hitSide = -1;
        this.timer = 60 * 0.1; // 2 min
    }

    AddPlayer(idPlayer, newPlayer){
        this.players[idPlayer] = newPlayer;
    }

    AddBall(newBall){
        this.ball = newBall;
    }

    AddScorePlayer(idPlayer){
        this.players[idPlayer].score++;
    }

    GetAllPlayers(){
        return this.players;
    }
    
    GetBall(){
        return this.ball;
    }
    
    GetPlayerId(data){
        if (data.side != null){
            for (let id in this.players){
                // console.log('id: ' + JSON.stringify(this.players[id]));
                console.log('score: ' + this.players[id].score);
                if (this.players[id].side == data.side){
                    return id;
                }
            }
        }
    }

    SetPlayers(players){
        this.players = players;
    }

    SetPlayerWaiting(isWaiting){
        this.isPlayerWaiting = isWaiting;
    }

    SetRoomId(room_id){
        this.room_id = room_id;
    }

    GetPlayersPos(){
        let players = this.myGameState.GetAllPlayers();
        let posPlayers = [];
        for (let id in players) {
            posPlayers[id] = players[id].GetPos();
        }
        return posPlayers;
    }

    DeletePlayer(idPlayer){
        delete this.players[idPlayer];
    }

    GetScorePlayer(idPlayer){
        return this.players[idPlayer].score;
    }

    GetTimer(){
        return this.timer;
    }

    GetPlayerMostScore(){
        let maxScore = -1;
        let playerName = 'Unknown';

        for (let id in this.players){
            if (this.players[id].score > maxScore){
                maxScore = this.players[id].score;
                playerName = this.players[id].name;
            }
            else if (this.players[id].score == maxScore){
                playerName = 'Tie'; // Tie
            }
        }
        return playerName;
    }

    RestartScorePlayers(){
        for (let id in this.players){
            this.players[id].score = 0;
        }
    }

    RestartBall(tam_canvas){
        this.ball.SetPos({x: tam_canvas.width/2, y: tam_canvas.height/2});
        this.ball.direction = {x: side = Math.floor(Math.random()*3 - 1), y: side = Math.floor(Math.random()*3 - 1)}; // Random direction -1,1]
    }

    RestartGame(tam_canvas){
        this.RestartScorePlayers();
        this.RestartBall(tam_canvas);
        this.isPlayerWaiting = false;
        this.hitSide = -1;
        this.timer = 60 * 0.1; // 2 min

    }
}

class GameMode{
    static GAME_STATE = {INIT: 0, MENU: 1, WAITING_PLAYERS: 2, PLAYING: 3, FINISH_GAME: 4};
    static GAME_TYPE = {CLASIC: 0, RAMBLE: 1}; // Ramble: habilities or random changes
    static GAME_MODALITY = {SINGLE: 0, MULTI: 1}; // Single: one player (we will need a basic AI), Multi: multiplayer
    
    constructor(){
        this.myGameState = GameMode.GAME_STATE.MENU;
        this.myGameType = GameMode.GAME_TYPE.CLASIC;
        this.myGameModality = GameMode.GAME_MODALITY.MULTI;
        this.myBehaviour = null;
        this.isBeheavurSet = false;
    }

    UpdateState(state){
        this.myGameState = state;
    }

    UpdateType(type){
        this.myGameType = type;
    }

    UpdateModality(modality){
        this.myGameModality = modality;
    }

    GetGameState(){
        return this.myGameState;
    }

    GetGameType(){
        return this.myGameType;
    }

    GetGameModality(){
        return this.myGameModality;
    }

    SetBeheavur(beheavur){
        if (!this.myBehaviour){
            this.myBehaviour = beheavur;
            this.isBeheavurSet = true;
        }
    }

    GetBeheavur(){
        return this.myBehaviour;
    }

    IsBeheavurSet(){
        return this.isBeheavurSet;
    }

    RestartGame(){
        this.myGameState = GameMode.GAME_STATE.PLAYING;
    }
}

class Game{
    constructor(tam, fps){
        this.myGameState = new GameState();
        this.myGameMode = new GameMode(); // default game mode settings

        this.size_canvas = tam;
        this.gameFrec = 1000/fps;
        this.gameLoop = null;
        // const GAME_CHECK_INTERV = 100;
    }

    // let players = this.myGameState.GetAllPlayers();
    // let numPlayers = Object.keys(players).length;
    // let numPlayersConnected = 0;
    
    WaitMenu(){
        return new Promise((resolve, reject) => {
            this.gameLoop = setInterval(() => {
                if (this.myGameMode.GetGameState() != GameMode.GAME_STATE.MENU){
                    console.log('GameMenu finished');
                    clearInterval(this.gameLoop);
                    resolve();
                }
            }, 1000);
        });
    }

    WaitJoin(){
        return new Promise((resolve, reject) => {
            this.gameLoop = setInterval(() => {
                if (this.myGameMode.GetGameState() != GameMode.GAME_STATE.WAITING_PLAYERS){
                    console.log('2 players connected');
                    clearInterval(this.gameLoop);
                    resolve();
                }
            }, 1000);
        });
    }
    
    WaitPlaying(){
        return new Promise((resolve, reject) => {
            let myBehaviour = this.myGameMode.GetBeheavur();
            // console.log('WaitPlaying: ' + myBehaviour);
            // reject if no behaviour
            if (!myBehaviour)
                reject('No behaviour set');

            this.gameLoop = setInterval(() => {
                // game loop
                myBehaviour(this);
            }, this.gameFrec);

            this.timerLoop = setInterval(() => {
                this.myGameState.timer--;

                if (this.myGameState.timer <= 0){
                    console.log('GamePlaying finished');
                    clearInterval(this.timerLoop);
                    clearInterval(this.gameLoop);
                    this.myGameMode.UpdateState(GameMode.GAME_STATE.FINISH_GAME);
                    resolve({finished: true, winner: this.GetPlayerMostScore()});
                }
                
                if (this.myGameMode.GetGameState() != GameMode.GAME_STATE.PLAYING){
                    console.log('GamePlaying paused');
                    clearInterval(this.timerLoop);
                    clearInterval(this.gameLoop);

                    resolve({finished: false});
                }
            }, 1000);

        });   
    }
    
    WaitFinish(){
        return new Promise((resolve, reject) => {
            this.gameLoop = setInterval(() => {
                if (this.myGameMode.GetGameState() != GameMode.GAME_STATE.FINISH_GAME){
                    console.log('End finished');
                    clearInterval(this.gameLoop);
                    resolve();
                }
            }, 1000);
        });    
    }
    
    Run(win_callback){ /// if this asycn and socket.io is sync ????
        // Change the game state untill game is finished
        console.log('Game started');
        console.log(win_callback);
        this.ChangeState(win_callback);
    }

    async ChangeState(win_callback){
        let state = this.myGameMode.GetGameState();

        console.log('ChangeState: ' + state);
        if (state == GameMode.GAME_STATE.MENU){
            await this.WaitMenu();
        }
        else if (state == GameMode.GAME_STATE.WAITING_PLAYERS){
            await this.WaitJoin();
        }
        else if (state == GameMode.GAME_STATE.PLAYING){
            let finish = await this.WaitPlaying();
            console.log(JSON.stringify(finish));
            if (finish.finished){
                win_callback(finish.winner);
            }
        }
        else if (state == GameMode.GAME_STATE.FINISH_GAME){
            await this.WaitFinish();
        }

        if (state != GameMode.GAME_STATE.INIT) // if gameLoop is not null then change state when the previous one is finished
            this.ChangeState(win_callback);
    }

    Stop(restart_players, pause_players){
        if (this.gameLoop != null){
            clearInterval(this.gameLoop);
        }
        if (this.timerLoop != null){
            clearInterval(this.timerLoop);
        }
            
        setTimeout(() => {
            if (this.gameLoop == null) {
                restart_players();
                console.log('Game restarted');
            }
        }, 10000);

        if (pause_players){
            pause_players(this);
        }
    }
    
    // Playing behavior callbacks
    PlayerMove(replicated){
        let players = this.myGameState.GetAllPlayers();
        for (let id in players) {
            if (players[id].Move(this.size_canvas))
                replicated(players[id].GetPos(), id); // Handle emiting the message to the clients (Socket.io)
        }
    }
    
    BallMove(replicated){
        let ball = this.myGameState.GetBall();    

        if (ball == null) return;

        this.myGameState.hitSide = ball.Move(this.size_canvas);

        const players = this.myGameState.GetAllPlayers();
        for (let id in players) {
            let player = players[id];
            let collisions = ball.CheckCollisionPlayer(player);

            if (collisions.x && collisions.y) {
                // get the vector Player------>Ball
                let col_dir = GMath.GetVector(player.pos, ball.pos);
                ball.direction = GMath.NormalizeVector(col_dir, false);
            }    
        }

        replicated(ball.GetPos()); // Handle emiting the message to the clients (Socket.io)
    }

    async CheckCollision(replicated){
        replicated(this.myGameState.hitSide);
    }

    GetAllPlayers(){
        return this.myGameState.GetAllPlayers();
    }

    GetPlayer(idPlayer){
        let players = this.myGameState.GetAllPlayers();
        for (let id in players) {
            if (id == idPlayer)
                return players[id];
        }   
    }

    GetBall(){
        return this.myGameState.GetBall();
    }

    SpawnPlayer(size, pos, color, speed, idPlayer, name, score, side){
        const newPlayer = new Player(size, pos, color, speed, idPlayer, name, score, side);
        this.myGameState.AddPlayer(idPlayer, newPlayer);

        return newPlayer;
    }

    SpawnBall(size, pos, color, speed){
        const newBall = new Ball(size, pos, color, speed);
        this.myGameState.AddBall(newBall);

        return newBall;
    }

    DeletePlayer(idPlayer){
        this.myGameState.DeletePlayer(idPlayer);
    }

    GetPlayerId(data){
        return this.myGameState.GetPlayerId(data);
    }

    DeleteBall(){
        this.myGameState.ball = null;
    }
    
    SetPlayerWaiting(isWaiting){ // return true if the player is already waiting, so go to play state
        if (this.myGameState.isWaiting && isWaiting){
            // this.myGameState.isWaiting = false; // The game is just started so no player is waiting anymore
            return true;  
        } 

        this.myGameState.isWaiting = isWaiting;
        return false;
    }

    GetIsPlayerWaiting(){
        return this.myGameState.isWaiting;
    }

    /*
    *   input.idPlayer  :   Id of the socket the player is connected
    *   input.type      :   true = pressed , false = releassed     
    *   input.key       :   Key the player has been pressed
    */
    UpdatePlayerKeys(input){
        let players = this.myGameState.GetAllPlayers();
        
        if (input.type) 
            players[input.idPlayer].KeyPressed(input.key); // if it's insert add the key
        else 
            players[input.idPlayer].KeyReleassed(input.key); // if it's delete the key
    }

    GetCanvasSize(){
        return this.size_canvas;
    }

    GetGameState(){
        return this.myGameState;
    }

    GetGameMode(){
        return this.myGameMode;
    }

    // Debug funcs
    GetPlayersKeys(){
        let keysPress = {};
        let players = this.myGameState.GetAllPlayers();
        for (let id in players) {
            keysPress[id] = players[id].GetKeyPressed();
        }

        return keysPress;
    }

    GetPlayersDir(){
        let dirPlayers = {};
        let players = this.myGameState.GetAllPlayers();
        for (let id in players) {
            dirPlayers[id] = players[id].GetDirection();
        }

        return dirPlayers;
    }

    GetBallSize(){
        let ball = this.myGameState.GetBall();
        return ball.size;
    }

    // Server info to client
    GetInfoSendClient(){
        let info = {};
        info['players'] = this.GetGameState().GetAllPlayers();

        return info;
    }

    // Change game setting base on menu state
    ChangeGameSetting(gameSettings){
        let players = this.myGameState.GetAllPlayers();

        // Change player settings (vel and size Y)
        let cont=0;
        for (let id in players) {
            if (cont == 0) 
                players[id].name = gameSettings.n_player1;
            else
                players[id].name = gameSettings.n_player2;
            
            players[id].size.height = gameSettings.p_size;
            players[id].speed = gameSettings.p_speed;
            cont++;
        }

        // Change ball settings
        let ball = this.myGameState.GetBall();

        ball.speed = gameSettings.b_speed;

        return players;
    }

    async SetPlayingBeheavur(behaviour){
        this.myGameMode.SetBeheavur(behaviour); // player and ball beheavur
    }

    IsBeheavurSet(){
        return this.myGameMode.IsBeheavurSet();
    }

    SetGameMode(gameMode){
        this.myGameMode.myGameState = gameMode;
    }

    SetRoomId(roomId){
        this.myGameMode.roomId = roomId;
    }

    GetRoomId(){
        return this.myGameMode.roomId;
    }

    GetBall(){
        return this.myGameState.GetBall();
    }

    AddScorePlayer(idPlayer){
        this.myGameState.AddScorePlayer(idPlayer);
    }

    GetScorePlayer(idPlayer){
        return this.myGameState.GetScorePlayer(idPlayer);
    }

    GetTimer(){
        console.log("GetTimer");
        return this.myGameState.timer;
    }

    GetPlayerMostScore(){
        return this.myGameState.GetPlayerMostScore();
    }

    RestartGame(){
        this.myGameState.RestartGame(this.size_canvas);
        this.myGameMode.myGameState = GameMode.GAME_STATE.PLAYING;
    }
    
    BackToMenu(){
        this.myGameState.RestartGame(this.size_canvas);
        this.myGameMode.myGameState = GameMode.GAME_STATE.MENU;
    }
}

module.exports = {Game, GameMode};

// function test(args, ...funcs){
//     let i=0;
//     funcs.forEach( fnc => {
//         fnc(args[i]);
//         i++;
//     });
// }

// hello = (msg) => {
//     console.log('Hello ',msg);
// };

// world = ([msg1,msg2]) => {
//     console.log(`World ${msg1} - ${msg2}`);
// };

// test(['1',['2','3']],hello, world);