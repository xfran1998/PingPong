// const canvas = document.querySelector('#game');
// const context = canvas.getContext('2d');

// canvas.width = innerWidth;
// canvas.height = innerHeight;

class GMath {
    static NormalizeVector(vec){
        let mod = Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1]);
        let mov = [0, 0];
        if (mod != 0){
            mov = [vec[0]/mod, vec[1]/mod];
        }

        return mov;
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
        this.pos = [this.pos[0]+vel_dir[0]*this.speed, this.pos[1]+vel_dir[1]*this.speed];
        // console.log(tarjetPos);
    }  

    UpdateValid(vel_dir, canvas_size){
        let newPos = [this.pos[0]+vel_dir[0]*this.speed, this.pos[1]+vel_dir[1]*this.speed];

        let hit_borders = {x_axis:false, y_axis:false}; 
        // Check inside cambas x axis
        if (newPos[0] < this.size.width/2 ){
            newPos[0] = this.size.width/2;
            hit_borders.x_axis = true;
        }
        if (newPos[0] > canvas_size.width - this.size.width/2){
            newPos[0] = canvas_size.width - this.size.width/2;
            hit_borders.x_axis = true;
        }
        // Check inside cambas y axis
        if (newPos[1] < this.size.height/2){
            newPos[1] = this.size.height/2;
            hit_borders.y_axis = true;
        }
        if (newPos[1] > canvas_size.height - this.size.height/2){
            newPos[1] = canvas_size.height - this.size.height/2;
            hit_borders.y_axis = true;
        }

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
        console.log(this.keysPress);
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
    }
    
    KeyReleassed(key){
        let ind = this.keysPress.indexOf(key);

        if (ind == -1) return;

        this.keysPress.splice(ind,1);

        console.log(`Released: ${key}`);
        this.UpdateDir();
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

class GameState{
    constructor(){
        this.players = {};
    }

    AddPlayer(idPlayer, newPlayer){
        this.players[idPlayer] = newPlayer;
    }

    GetAllPlayers(){
        return this.players;
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
//         context.arc(pawn.pos[0], pawn.pos[1], pawn.size, 0, Math.PI*2, false);  
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

class Game{
    constructor(tam, fps){
        this.myGameState = new GameState();
        this.size_canvas = tam;
        this.gameFrec = 1000/fps;
        this.gameStarted = false;
        // const GAME_CHECK_INTERV = 100;
    }

    Run(...runtimeFuncs){
        this.gameStarted = true;

        // replicate functions ( ...func(game) )
        setInterval(() => {
            // game loop
            runtimeFuncs.forEach( func => {
                func(this);
            });
        }, this.gameFrec); // Maybe split and change to GAME_CHECK_INTERV if overloaded server
    }
    
    PlayerMove(replicated=null){
        let players = this.myGameState.GetAllPlayers();
        for (let id in players) {
            // if (players[id].Move(this.size_canvas))
            //     console.log('Move');
            // if (replicated != null)
            //     console.log('Replciated'); 

            if (players[id].Move(this.size_canvas) && replicated != null)
                replicated(players[id].GetPos(), id);
        }
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

    DeletePlayer(idPlayer){
        this.myGameState.DeletePlayer(idPlayer);
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

module.exports = Game;

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