class Display{
    static context = null;
    static myGameState = null;

    static Draw(){
        if (!this.context || !this.myGameState) return // Prevents fail

        Display.ClearScreen(this.context);
        
        this.myGameState.projectiles.forEach(proj => {
            Display.DrawPawn(proj, this.context);
        });
        
        let players = this.myGameState.GetPlayers();
        for (let id in players) {
            Display.DrawPawn(players[id], this.context);
        }

        // let player = myGame.myGameState.players[0];
        // Display.DrawHealthBar(player, this.context);

        requestAnimationFrame(() => Display.Draw());
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
        this.projectiles = new Array();
    }

    GetPlayers(){
        return this.players;
    }

    GetProjectiles(){
        return this.projectiles;
    }

    SetPlayers(players){
        this.players = players;
    }

    SetProjectiles(projectiles){
        this.projectiles = projectiles;
    }  
}

export { GameState, Display };