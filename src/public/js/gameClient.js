const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

class Display{
    static paddingMiddle = 20;
    static font_size = 24;
    
    static canvas_size;
    static context = null;
    static myGameState = null;
    static myGameMode = null;
    static displaysGameplay = {}

    static Draw(){
        if (!this.context || !this.myGameState) return // Prevents fail

        Display.ClearScreen();
        
        let players = this.myGameState.GetPlayers();

        for (let id in players) {
            // console.log('id: ', players[id]);
            Display.DrawPlayer(players[id].player);
        }

        Display.DrawMiddleLine();
        Display.DrawBall();
        Display.DrawNames();
        Display.DrawScore();
        // let player = myGame.myGameState.players[0];
        // Display.DrawHealthBar(player, this.context);

        requestAnimationFrame(() => Display.Draw());
    }

    static SetContext(context){
        this.context = context;
    }

    static SetTamBoard(canvas_size){
        this.canvas_size = canvas_size;
    }

    static SetGameState(myGameState){
        this.myGameState = myGameState;
    }

    static SetGameMode(GAME_MODE){
        this.myGameMode = GAME_MODE;
    }

    // roomPlayers = rooms[room_id]['players'] array
    static SetPlayers(roomPlayers, socked_id){
        this.myGameState.SetPlayers(roomPlayers, socked_id);
    }
    
    static DrawPlayer(player){
        this.context.beginPath();
        this.context.setLineDash([]);
        this.context.rect(player.pos.x - player.size.width/2, player.pos.y - player.size.height/2, player.size.width, player.size.height);
        this.context.fillStyle = player.color;           
        this.context.fill(); 
        this.context.stroke();
        this.context.closePath();
    }

    static SetDisplays(displays){
        this.displaysGameplay = displays;
    }   

    static DisableAllInputs(submit_text='Waiting'){
        console.log('inputs: ', $$('input'));
        $$('input').forEach(input => {
            input.classList.add('input-disabled');
        });
    
        if (submit_text == 'Ready') // Only enable for player who is not ready
            $('#start-game').classList.remove('input-disabled');
    
        $('#start-game').value = submit_text;
    }

    static EnableAllInputs(){
        $$('input').forEach(input => {
            input.classList.remove('input-disabled');
        });
    }
    
    static ChangeDisplay(game_mode){
        this.myGameMode = game_mode;
        
        console.log('game_mode: ', game_mode);
        console.log('displaysGameplay: ', this.displaysGameplay);
        // game_mode = {MENU:0} or {WAITING:1} or {PLAYING:2} or {FINISH:3} or {END:4}
        // this.displaysGameplay = {MENU:div_menu] or {WAITING:div_waiting] or {PLAYING:div_playing] or {FINISH:div_finish] or {END:div_end]
        
        // change display based on game_mode using loops
        for (let key in this.displaysGameplay) {
            if (key == game_mode) {
                console.log('restore: ', this.displaysGameplay[key]);
                // if (key == 1) {
                    
                // }
                this.displaysGameplay[key].classList.remove('hidden');
            } else {
                if(key == 1 && game_mode == 2) continue;
                if (key == 2 && game_mode == 1) continue;
                console.log('add: ', this.displaysGameplay[key]);
                this.displaysGameplay[key].classList.add('hidden');
            }
        }

        if (this.myGameMode == 3) { // Start Game Draw
            this.Draw();
        }

        // for (let id in this.displaysGameplay) {
        //     if (id == game_mode) {
        //         this.displaysGameplay[id].display.classList.remove('hidden');
        //     } else {
        //         this.displaysGameplay[id].display.classList.add('hidden');
        //     }
        // }
    }

    static DrawMiddleLine(){
        this.context.moveTo(this.context.canvas.width/2, 0);
        this.context.strokeStyle = '#555';
        this.context.lineWidth=3;
        this.context.setLineDash([15, 10]);
        this.context.lineTo(this.context.canvas.width/2, this.context.canvas.height);
        this.context.stroke();
    }

    static DrawBall(){
        let ball = this.myGameState.GetBall();
        if (!ball) return;

        this.context.beginPath();
        this.context.arc(ball.pos.x, ball.pos.y, ball.size.width/2, 0, 2 * Math.PI);
        this.context.fillStyle = ball.color;
        this.context.fill();
        this.context.closePath();
    }

    static DrawNames(){
        let count = 0;
        for(let id in this.myGameState.players){
        //     let name_player = this.myGameState.players[id].player.name;
        //     let coords;
        //     this.context.font = `${this.font_size}px Arial`;
        //     this.context.fillStyle = '#eee';

        //     if (count == 0) {
        //         let size_name = this.context.measureText(name_player);
        //         coords = [this.canvas_size.width/2 - (size_name.width+this.paddingMiddle), this.paddingMiddle+this.font_size/2];
        //     }
        //     else{
        //         coords = [this.canvas_size.width/2 + this.paddingMiddle, this.paddingMiddle+this.font_size/2];
        //     }
            
        //     count++;
        //     this.context.fillText(name_player, coords[0], coords[1]);
            this.DrawText(this.myGameState.players[id].player.name, this.font_size,  '#eee', (count == 0));
            count++;
        }

    }

    static DrawScore(){
        let count = 0;
        for(let id in this.myGameState.players){
            // let name_player = this.myGameState.players[id].player.name;
            // let coords;
            // this.context.font = `${this.font_size/2}px Arial`;
            // this.context.fillStyle = '#fff';
            // let size_name = this.context.measureText(name_player);

            // if (count == 0) {
            //     coords = [this.canvas_size.width/2 - (size_name.width/2+this.paddingMiddle), this.paddingMiddle+this.font_size/2];
            // }
            // else{
            //     coords = [this.canvas_size.width/2 + this.paddingMiddle + size_name.width/2, this.paddingMiddle+this.font_size/2];
            // }
            
            // this.context.fillText(name_player, coords[0], coords[1]);
            this.DrawText(this.myGameState.players[id].player.name, this.font_size/2,  '#fff', (count == 0), this.myGameState.players[id].player.score);
            count++;
        }
    }

    static DrawText(name_player, font_size, text_color, is_left, score=null){   
        let coords;
        this.context.fillStyle = text_color;
        
        if (score != null) { // 0 null (score)
            this.context.font = `${font_size*2}px Arial`;
        }
        else{
            this.context.font = `${font_size}px Arial`;
        }
        
        let size_name = this.context.measureText(name_player);
        if (score != null) {
            this.context.font = `${font_size}px Arial`;
        }

        if (score == null) // players names
            if (is_left) {
                coords = [this.canvas_size.width/2 - (size_name.width+this.paddingMiddle), this.paddingMiddle+this.font_size];
            }
            else{
                coords = [this.canvas_size.width/2 + this.paddingMiddle, this.paddingMiddle+this.font_size];
            }
        else
            if (is_left) {
                coords = [this.canvas_size.width/2 - (size_name.width/2+this.paddingMiddle), this.paddingMiddle+this.font_size*2];
            }
            else{
                coords = [this.canvas_size.width/2 + this.paddingMiddle + size_name.width/2, this.paddingMiddle+this.font_size*2];
            }

        if (score != null) {
            this.context.fillText(score, coords[0], coords[1]);
        }
        else{
            this.context.fillText(name_player, coords[0], coords[1]);
        }
    }

    static ClearScreen(){
        const tam = this.context.canvas.getBoundingClientRect();
        this.context.clearRect(0, 0, tam.width, tam.height);
    }


    static DrawHealthBar(player){
        // Border
        let pos = [20,20];
        let tamBorder = [200, 30];
        let tamHealth = [player.health, 30];
        let stroke = 3;     
    }
}

class GameState{
    constructor(){
        this.players = {};
        this.ball = null;
    }
    
    SetPlayers(roomPlayers, socked_id){
        // console.log('roomPlayers');
        // console.log(roomPlayers);
        
        this.players = {};
        roomPlayers.forEach(playerSettings => {
            console.log('playerSettings');
            console.log(playerSettings.player);
            this.players[playerSettings.player.id] = {
                player: playerSettings.player,
                side: playerSettings.side,
                is_me: (socked_id == playerSettings.player.id)
            }
        });
    }

    SetBall(ball){
        this.ball = ball;
    }

    SetBallPos(pos){
        this.ball.pos = pos;
    }

    SetPlayerScore(id, score){
        this.players[id].player.score = score;
    }

    SetAllPlayers(players){
        console.log('players');
        console.log(players);
        console.log('this.players');
        console.log(this.players);
        
        for (let id in players){
            this.players[id].player = players[id];
        }
        console.log('this.players');
        console.log(this.players);
    }

    GetPlayers(){
        return this.players;
    }

    GetBall(){
        return this.ball;
    }

    GetPlayerScore(id){
        return this.players[id].player.score;
    }

    GetPlayerId(data){
        if (data.side){
            return  this.players.filter(player => player.side == data.side)[0].player.id;
        }
    }

    SetPlayersPos(posPlayers){
        for (let id in posPlayers){
            this.players[id].player.SetPos(posPlayers[id]);
        }
    }

    SetPlayerPos(id, pos){
        this.players[id].player.pos = pos;
    }

    SetBallSize(size){
        this.ball.size = size;
    }
}

class GameMode{
    static GAME_STATE = {MENU: 0, WAITING_PLAYERS: 1, PLAYING: 2, FINISH_GAME: 3, END: 4};
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
}

export { GameState, Display, GameMode };