class Display{
    static context = null;
    static myGameState = null;

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

        // // Player green health
        // this.context.beginPath();
        // this.context.rect(pos.x, pos.y, tamHealth[0], tamHealth[1]);
        // this.context.fillStyle = "green";           
        // this.context.fill(); 
        
        // // Border of the player health
        // this.context.beginPath();
        // this.context.rect(pos.x, pos.y, tamBorder[0], tamBorder[1]);
        // this.context.lineWidth = stroke;
        // this.context.strokeStyle = 'black';
        // this.context.stroke();        
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
            // console.log('playerSettings');
            // console.log(playerSettings);
            this.players[playerSettings.player.id] = {
                player: playerSettings.player,
                side: playerSettings.side,
                is_me: (socked_id == playerSettings.player.id)
            }
        });

        // console.log('this.players');
        // console.log(this.players);
    }

    SetBall(ball){
        this.ball = ball;
    }

    SetBallPos(pos){
        this.ball.pos = pos;
    }

    GetPlayers(){
        return this.players;
    }

    GetBall(){
        return this.ball;
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

export { GameState, Display };