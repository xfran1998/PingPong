const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

class Display{
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

        Display.DrawBall();
        // let player = myGame.myGameState.players[0];
        // Display.DrawHealthBar(player, this.context);

        requestAnimationFrame(() => Display.Draw());
    }

    static SetContext(context){
        this.context = context;
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
        this.context.rect(player.pos.x - player.size.width/2, player.pos.y - player.size.height/2, player.size.width, player.size.height);
        this.context.fillStyle = player.color;           
        this.context.fill(); 
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

    static DrawBall(){
        let ball = this.myGameState.GetBall();
        if (!ball) return;

        this.context.beginPath();
        this.context.arc(ball.pos.x, ball.pos.y, ball.size.width/2, 0, 2 * Math.PI);
        this.context.fillStyle = ball.color;
        this.context.fill();
        this.context.closePath();
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