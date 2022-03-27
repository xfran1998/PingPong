import {GameState, Display, GameMode} from './gameClient.js';

const socket = io();
const container = document.querySelector('.container');
const btn = document.querySelectorAll('.btn');
const canvas = document.querySelector('#game');
const context = canvas.getContext('2d');
const settings_container = document.querySelector('.settings-container');
const finish = document.querySelector('.finish');
const winner_container = document.querySelector('#winner-container');

let input = {
    type: false,
    key: 'z'
};

let inside_game = false;


const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

Display.SetDisplays({
    0: container,
    1: settings_container,
    2: settings_container,
    3: canvas,
    4: winner_container,
});


socket.on('join_room_server', (data) => {
    console.log('join_room_server');
    if (data.status != 200) {
        alert(data.response);
        return;
    }

    console.log(data.response);

    // console.log(data.response);
    // console.log(socket.id);
    inside_game = true;
    // DisplayCanvas(data.response.room , data.response.TAM_GAME, socket.id);
    SetCanvas(data.response.room_players , data.response.TAM_GAME, socket.id);
    if (data.response.is_waiting){
        Display.DisableAllInputs('Ready');
    }

    Display.SetTamBoard(data.response.TAM_GAME);
    Display.SetGameFrec(data.response.game_frec);
});


socket.on('start_game_server', () => {
    console.log('****  GAME START  ****');

});

socket.on('set_ball_server', (data) => {
    Display.myGameState.SetBall(data.ball);
});

socket.on('update_player_pos_server', (info) => {
    Display.myGameState.SetPlayerPos(info.playerId, info.playerPos);
});

socket.on('update_ball_pos_server', (info) => {
    Display.myGameState.SetBallPos(info.ballPos);
});

socket.on('waiting_player_server', (data) => {
    Display.DisableAllInputs(data.submit_text);
});

socket.on('update_ball_size_server', (data) => {
    Display.myGameState.SetBallSize(data.ballSize);
});

socket.on('update_score_server', (data) => {
    Display.myGameState.SetPlayerScore(data.player_id, data.score);
    console.log('SCORE:' + data.player_id + ' - ' + data.score);
});

socket.on('change_game_state_server', (data) => {
    Display.ChangeDisplay(data.gameState);
});

socket.on('win_server', (data) => {
    console.log('WIN');
    console.log(data);
    Display.ShowWinner(data.winner);
});

socket.on('set_timer_server', (data) => {
    console.log('set_timer_server');
    console.log(data);

    Display.SetTimer(data.timer);

    if (data.start_timer == true) {
        Display.StartTimer();
    }
    if (data.start_timer == false) {
        Display.PauseTimer();
    }
});

socket.on('change_player_settings_server', (data) => {
    Display.myGameState.SetAllPlayers(data.players);
});

function SetCanvas(room_players, TAM_GAME, socked_id, GAME_MODE){
    canvas.width = TAM_GAME.width;
    canvas.height = TAM_GAME.height;

    Display.SetContext(context);
    Display.SetGameState(new GameState());
    Display.SetPlayers(room_players, socked_id);
    Display.SetGameMode(GAME_MODE);
    // Display.Draw();
}

function DisplayCanvas(){
    canvas.classList.remove('hidden');
    settings_container.classList.add('hidden');
}

function DisplayMenu(){
    container.classList.add('hidden');
    settings_container.classList.remove('hidden');
}

function UpdateKey(type, key){
    if (input.type == type && input.key == key) // if haven't changed
    return;
    
    input.type = type;
    input.key = key;
    
    // if (input.type != type) console.log(`type: ${input.type} - ${type}`);
    // if (input.key != type) console.log(`key: ${input.key} - ${key}`);
    
    socket.emit('update_key_client', input);   
}

document.addEventListener('keydown', (e) => {
    let key = e.key/*.toLowerCase()*/;
    if (key == 'w' || key =='s')
    UpdateKey(true, key);
    // else if(e.key == 'q' || e.key == 'Q')
    //     socket.emit('client_use_hability', 'q');
});

document.addEventListener('keyup', (e) => {
    let key = e.key/*.toLowerCase()*/;
    if (key == 'w' || key =='s')
        UpdateKey(false, e.key);
});


$('#join-room').addEventListener('click', () => {
    let room = $('#room-name').value;

    room = room.replace(' ', '_');

    // check if room only contain [A-Z], [0-9], [a-z], [_], [.] and [ ]
    var regex = /^[A-Za-z0-9_.]+$/;

    if (!regex.test(room)) {
      alert('Room name must only contain [A-Z, a-z, 0-9, _, ., SPACE]');
      return;
    }
    
    if (room.length == 0){
        alert('Room name must not be empty');
        return;
    }
    
    socket.emit('join_room_client', {
        room_id: room,
    });
});


$('#start-game').addEventListener('click', () => {
    getDataForm();
});

$('form').addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('prevented');
    return false;
});

function searchKeyPress(e) {
    e.preventDefault();
    return false;
  }
  
function SetRoomMenu(data){
    socket.emit('set_room_menu_client', data);
}

function getDataForm(){
    let data = {};
    data.n_player1 = document.getElementById('name-player1').value;
    data.n_player2 = document.getElementById('name-player2').value;
    data.p_size = document.getElementById('player-size').value;
    data.p_speed = document.getElementById('player-speed').value;
    data.b_speed = document.getElementById('ball-speed').value;

    // console.log(data);
    SetRoomMenu(data);
}

// function DisableAllInputs(disable, submit_text){
//     $$('input').forEach(input => {
//         if(disable)
//             input.classList.add('input-disabled');
//         else
//             input.classList.remove('input-disabled');
//     });

//     if (submit_text == 'Ready') // Only enable for player who is not ready
//         $('#start-game').classList.remove('input-disabled');

//     $('#start-game').value = submit_text;
// }