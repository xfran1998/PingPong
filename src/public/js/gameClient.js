class Display{
    static context = null;
    static myGameState = null;

    static Draw(){
        if (!this.context || !this.myGameState) return // Prevents fail

        Display.ClearScreen();
        
        let players = this.myGameState.GetPlayers();

        for (let id in players) {
            Display.DrawPawn(players[id].player);
        }

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

    static DrawPawn(pawn){
        this.context.beginPath();
        this.context.arc(pawn.pos[0], pawn.pos[1], pawn.size, 0, Math.PI*2, false);  
        this.context.fillStyle = pawn.color;           
        this.context.fill(); 
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

        // Player green health
        this.context.beginPath();
        this.context.rect(pos[0], pos[1], tamHealth[0], tamHealth[1]);
        this.context.fillStyle = "green";           
        this.context.fill(); 
        
        // Border of the player health
        this.context.beginPath();
        this.context.rect(pos[0], pos[1], tamBorder[0], tamBorder[1]);
        this.context.lineWidth = stroke;
        this.context.strokeStyle = 'black';
        this.context.stroke();        
    }
}

class GameState{
    constructor(){
        this.players = {};
    }
    
    SetPlayers(roomPlayers, socked_id){
        console.log('roomPlayers');
        console.log(roomPlayers);
        
        this.players = {};
        roomPlayers.forEach(player => {
            this.players[player.player_id] = {
                player: player.player,
                is_me: (socked_id == player.player_id)
            }
        });

        console.log('this.players');
        console.log(this.players);
    }

    GetPlayers(){
        return this.players;
    }

    SetPlayersPos(posPlayers){
        for (let id in posPlayers){
            this.players[id].player.SetPos(posPlayers[id]);
        }
    }
}

export { GameState, Display };