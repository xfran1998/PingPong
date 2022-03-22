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

$ = selector => document.querySelector(selector);
$$ = selector => document.querySelectorAll(selector);

socket.on('server', (message) => {
    let el = document.createElement('div');
    el.classList = "key-container";
    el.innerHTML = `<p>${message}</p>`;

    container.appendChild(el);
    console.log('Hijo añadido: ', message);
});

socket.on('server_start_game', (TAM_GAME) => {
    console.log('****  GAME START  ****');

    canvas.width = TAM_GAME.width;
    canvas.height = TAM_GAME.height;

    Display.context = context;
    Display.myGameState = new GameState();;
    Display.Draw();
    
    canvas.classList.remove('hidden');
    container.classList.add('hidden');
});

socket.on('server_update_players', (info) => {
    Display.myGameState.SetPlayers(info.players);
    Display.myGameState.SetProjectiles(info.projectiles);
});

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
    if (key == 'a' || key == 'w' || key =='s' || key =='d')
        UpdateKey(true, key);
    else if(e.key == 'q' || e.key == 'Q')
        socket.emit('client_use_hability', 'q');
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