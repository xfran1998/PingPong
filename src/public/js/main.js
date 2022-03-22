import {GameState, Display} from './gameClient.js';

const socket = io();
const container = document.querySelector('.container');
const btn = document.querySelectorAll('.btn');
const canvas = document.querySelector('#game');
const context = canvas.getContext('2d');

var input = {
    type: false,
    key: 'z'
};

const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

socket.on('join_room_server', (data) => {
    if (data.status != 200) {
        alert(data.response);
        return;
    }

    console.log(data.response);
    console.log(socket.id);
    DisplayCanvas(data.response.room , data.response.TAM_GAME, socket.id);
});



socket.on('server_start_game', (TAM_GAME) => {
    console.log('****  GAME START  ****');

});

socket.on('update_players_server', (info) => {
    Display.myGameState.SetPlayersPos(info.players);
});

function DisplayCanvas(room, TAM_GAME, socked_id){
    canvas.width = TAM_GAME.width;
    canvas.height = TAM_GAME.height;

    Display.SetContext(context);
    Display.SetGameState(new GameState());
    Display.SetPlayers(room['players'], socked_id)
    Display.Draw();
    
    canvas.classList.remove('hidden');
    container.classList.add('hidden');
}

function UpdateKey(type, key){
    if (input.type == type && input.key == key) // if haven't changed
    return;
    
    input.type = type;
    input.key = key;
    
    // if (input.type != type) console.log(`type: ${input.type} - ${type}`);
    // if (input.key != type) console.log(`key: ${input.key} - ${key}`);
    
    socket.emit('client_update_key', input);   
}

document.addEventListener('keydown', (e) => {
    let key = e.key.toLowerCase()
    if (key == 'w' || key =='s')
        UpdateKey(true, key);
    // else if(e.key == 'q' || e.key == 'Q')
    //     socket.emit('client_use_hability', 'q');
});

document.addEventListener('keyup', (e) => {
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