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
    constructor(size, pos, color, speed, id, name, score){
        super(size, pos, color, speed);
        this.id = id;
        this.name = name;
        this.score = score;
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
        let hit_borders = super.UpdateValid(vel_dir, canvas_size)
        
        if (hit_borders.x_axis){
            this.direction.x *= -1;
        }
        if (hit_borders.y_axis){
            this.direction.y *= -1; // GG
        }
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
    }

    AddPlayer(idPlayer, newPlayer){
        this.players[idPlayer] = newPlayer;
    }

    AddBall(newBall){
        this.ball = newBall;
    }

    GetAllPlayers(){
        return this.players;
    }

    GetBall(){
        return this.ball;
    }

    SetPlayers(players){
        this.players = players;
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
}

// Client Side
// class Display{
//     static Draw(myGameState, context){
//         Display.ClearScreen(context);

//         myGameState.projectiles.forEach(proj => {
//             Display.DrawPawn(proj, context);
//         });
        
//         myGameState.players.forEach(player => {
//             Display.DrawPawn(player, context);
//         });

//         let player = myGame.myGameState.players[0];
//         Display.DrawHealthBar(player, context);
//     }

//     static DrawPawn(pawn, context){
//         context.beginPath();
//         context.arc(pawn.pos.x, pawn.pos.y, pawn.size, 0, Math.PI*2, false);  
//         context.fillStyle = pawn.color;           
//         context.fill(); 
//     }

//     static ClearScreen(context){
//         const tam = canvas.getBoundingClientRect();
//         context.clearRect(0, 0, tam.width, tam.height);
//     }

//     static DrawHealthBar(player, context){
//         // Border
//         let pos = [20,20];
//         let tamBorder = [200, 30];
//         let tamHealth = [player.health, 30];
//         let stroke = 3;

//         // Player green health
//         context.beginPath();
//         context.rect(pos[0], pos[1], tamHealth[0], tamHealth[1]);
//         context.fillStyle = "green";           
//         context.fill(); 
        
//         // Border of the player health
//         context.beginPath();
//         context.rect(pos[0], pos[1], tamBorder[0], tamBorder[1]);
//         context.lineWidth = stroke;
//         context.strokeStyle = 'black';
//         context.stroke();        
//     }
// }
class GameMode{
    static GAME_STATE = {MENU: 0, WAITING_PLAYERS: 1, PLAYING: 2, END: 3};
    static GAME_TYPE = {CLASIC: 0, RAMBLE: 1};
    static GAME_MODALITY = {SINGLE: 0, MULTI: 1};
    
    constructor(){
        this.myGameState = GameMode.GAME_STATE.MENU;
        this.myGameType = GameMode.GAME_TYPE.CLASIC;
        this.myGameModality = GameMode.GAME_MODALITY.MULTI;
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
}

class Game{
    constructor(tam, fps){
        this.myGameState = new GameState();
        this.myGameMode = new GameMode();

        this.size_canvas = tam;
        this.gameFrec = 1000/fps;
        this.gameLoop = null;
        // const GAME_CHECK_INTERV = 100;
    }

    Run(...runtimeFuncs){
        // Wait until all players are connected
        if (this.myGameMode.GetGameState() == GameMode.GAME_STATE.MENU){
            return new Promise((resolve, reject) => {
                let players = this.myGameState.GetAllPlayers();
                let numPlayers = Object.keys(players).length;
                let numPlayersConnected = 0;
                gameLoop = setInterval(() => {
                    if (numPlayersConnected == numPlayers){
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });
        }

            
        
        // replicate functions ( ...func(game) )
        this.gameLoop = setInterval(() => {
            // game loop
            runtimeFuncs.forEach( func => {
                func(this);
            });
        }, this.gameFrec); // Maybe split and change to GAME_CHECK_INTERV if overloaded server
    }

    Stop(){
        clearInterval(this.gameLoop);
    }
    
    PlayerMove(replicated){
        let players = this.myGameState.GetAllPlayers();
        for (let id in players) {
            if (players[id].Move(this.size_canvas))
                replicated(players[id].GetPos(), id);
        }
    }
    
    BallMove(replicated){
        let ball = this.myGameState.GetBall();    

        if (ball == null) return;

        ball.Move(this.size_canvas);
        
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

        replicated(ball.GetPos());
    }

    GetPlayer(idPlayer){
        let players = this.myGameState.GetAllPlayers();
        for (let id in players) {
            if (id == idPlayer)
                return players[id];
        }   
    }

    SpawnPlayer(size, pos, color, speed, idPlayer, name, score){
        const newPlayer = new Player(size, pos, color, speed, idPlayer, name, score);
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

    DeleteBall(){
        this.myGameState.ball = null;
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

    GetGameState(){
        return this.myGameState;
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

    // Server info to client
    GetInfoSendClient(){
        let info = {};
        info['players'] = this.GetGameState().GetAllPlayers();

        return info;
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