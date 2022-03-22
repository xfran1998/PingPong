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

    Update(tarjetPos){
        this.pos = [this.pos[0]+tarjetPos[0]*this.speed, this.pos[1]+tarjetPos[1]*this.speed];
        // console.log(tarjetPos);
    }  

    UpdateValid(tarjetPos, center){
        let newPos = [this.pos[0]+tarjetPos[0]*this.speed, this.pos[1]+tarjetPos[1]*this.speed];
        
        // Check inside cambas x axis
        if (center[0]*2-this.size < newPos[0]) this.pos[0] = center[0]*2-this.size;
        else if(newPos[0] < this.size) this.pos[0] = this.size;
        else this.pos[0] = newPos[0];

        // Check inside cambas y axis
        if (center[1]*2-this.size < newPos[1]) this.pos[1] = center[1]*2-this.size;
        else if(newPos[1] < this.size) this.pos[1] = this.size;
        else this.pos[1] = newPos[1];
        // console.log(tarjetPos);
    }  

    SetPos(pos){
        this.pos = pos;
    }
}

class Player extends Pawn{
    constructor(size, pos, color, speed, name, health){
        super(size, pos, color, speed);
        this.name = name;
        this.keysPress = [];
        this.direction = {x: 0, y: 0};
    }

    // Move toward espefic target, this a
    Move(center){
        let dir = GMath.NormalizeVector([this.direction.x, this.direction.y]);
    
        super.UpdateValid(dir, center);
        // console.log((center[0]*2-this.size) > this.pos[0] && this.pos[0] > (0+this.size));
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
            
            if ((key == 'w' || key == 'W')) {
                this.direction.y = -1;
                dirPressed.y = true;
                
            }
            else if ((key == 's' || key == 'S')) {
                this.direction.y = 1;
                dirPressed.y = true;
            }
        });

        // Check if direction not pressed and set direction to 0
        if (!dirPressed.x) this.direction.x = 0;
        if (!dirPressed.y) this.direction.y = 0;
    }

    KeyPressed(key){
        if (this.keysPress.indexOf(key) == -1)
            this.keysPress.push(key);

        this.UpdateDir();
    }
    
    KeyReleassed(key){
        let ind = this.keysPress.indexOf(key);
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
        this.center = [tam.width/2, tam.height/2];
        this.gameFrec = 1000/fps;
        this.gameStarted = false;
        // const GAME_CHECK_INTERV = 100;
    }

    Run(args, ...runtimeFuncs){
        this.gameStarted = true;

        // Display.Draw(this.myGameState, this.context);
        setInterval(() => {
            this.PlayerMove(); // Move the player (key pressed)
            this.ProjectilesMove(); // Move projectiles
            this.ProjectileHitEnemy(); // check if hit projectile
            this.DespawnProjectile(); // check if can despawn proj

            let i=0;
            // If we want to debug something
            runtimeFuncs.forEach( func => {
                func(args[i]);
                i++;
            });

        }, this.gameFrec); // Maybe split and change to GAME_CHECK_INTERV if overloaded server
    }

    PlayerMove(){
        let players = this.myGameState.GetAllPlayers();
        for (let id in players) {
            players[id].Move(this.center);
        }
    }

    GetPlayer(idPlayer){
        let players = this.myGameState.GetAllPlayers();
        for (let id in players) {
            if (id == idPlayer)
                return players[id];
        }   
    }

    SpawnPlayer(idPlayer, size, pos, color, speed, name, health){
        // const x = innerWidth / 2;
        // const y = innerHeight / 2;
        // const size = 50;
        // const pos = [x, y];
        // const color = 'blue';
        // const speed = 1;
        // const name = "Player01";

        const newPlayer = new Player(size, pos, color, speed, name, health);
        this.myGameState.AddPlayer(idPlayer, newPlayer);
        return newPlayer;
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

//     D:\Web\JS-WebSocket-Game_Dummy\src\Game.js:364
//             players[input.idPlayer].KeyReleassed(input.key); // if it's delete the key
//                                     ^

//     TypeError: Cannot read properties of undefined (reading 'KeyReleassed')

    GetGameState(){
        return this.myGameState;
    }

    // Debug funcs
    GetPlayersKeys(){
        let keysPress = {};
        let players = this.myGameState.GetAllPlayers();
        for (let id in players) {
            keysPress[players[id].GetName()] = players[id].GetKeyPressed();
        }

        return keysPress;
    }

    GetPlayersDir(){
        let dirPlayers = {};
        let players = this.myGameState.GetAllPlayers();
        for (let id in players) {
            dirPlayers[players[id].GetName()] = players[id].GetDirection();
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