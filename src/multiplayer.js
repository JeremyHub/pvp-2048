var { initializeApp } = require("firebase/app");
var { getDatabase, ref, set, onValue } = require("firebase/database");
var { getAuth, signInAnonymously } = require("firebase/auth");
var seedrandom = require('seedrandom');

// this is all safe to expose to the user even if it doesnt look like it lol
const firebaseConfig = {
  apiKey: "AIzaSyDnHWSpbaUyuQC_K7iYnz4abOFC5s1H_hE",
  authDomain: "pvp-2048.firebaseapp.com",
  databaseURL: "https://pvp-2048-default-rtdb.firebaseio.com",
  projectId: "pvp-2048",
  storageBucket: "pvp-2048.appspot.com",
  messagingSenderId: "951717778895",
  appId: "1:951717778895:web:e7ccd9dd52f7cb039beeba",
  measurementId: "G-VHGWG8TK15"
};

// setup everything needed for single player
export function single_player_init(scene) {
    document.addEventListener('keydown', function(event) {
        let green_move = null;
        if (event.key == "w") {
            green_move = "up";
        } else if (event.key == "a") {
            green_move = "left";
        } else if (event.key == "d") {
            green_move = "right";
        } else if (event.key == "s") {
            green_move = "down";
        }

        let orange_move = null;
        if (event.key == "ArrowLeft") {
            orange_move = "left";
        }
        if (event.key == "ArrowRight") {
            orange_move = "right";
        }
        if (event.key == "ArrowUp") {
            orange_move = "up";
        }
        if (event.key == "ArrowDown") {
            orange_move = "down";
        }

        if (!scene.any_block_is_moving) {
            if (green_move){
                scene.green_move = green_move;
                document.getElementById("green-lock").innerHTML = "true";
            }
            if (orange_move){
                scene.orange_move = orange_move;
                document.getElementById("orange-lock").innerHTML = "true";
            }
            if (scene.green_move != null && scene.orange_move != null) {
                document.getElementById("green-lock").innerHTML = "false";
                document.getElementById("orange-lock").innerHTML = "false";
            }
        }
    });
}

export class Mutliplayer_Manager {
    constructor(scene) {
        this.scene = scene;
        this.joined_game_code = null;
        this.your_color = null;
        this.current_turn = 1;
        this.current_data = null;
        this.database = null;
        this.app = null;
        this.auth = null;
        this.gameRef = null;
        this.gameRefCallback = null;
    }

    init(super_scene) {
        this.super_scene = super_scene;

        document.getElementById("all-multiplayer-items").style.visibility = "visible";
        this.app = initializeApp(firebaseConfig);
        this.auth = getAuth(this.app);
        this.database = getDatabase(this.app);

        // check if user is logged in
        this.auth.onAuthStateChanged(function(user) {
            if (user) {
                console.log("User " + user.uid);
            } else {
                console.log("No user");
            }
        });
        
        // sign in anonymously
        signInAnonymously(this.auth).catch(function(error) {
            console.log(error);
        });

        this.add_event_listeners();
    }

    join_room() {
        this.joined_game_code = document.getElementById("room_id").value;
        document.getElementById("current-room-name").innerHTML = "Room: " + this.joined_game_code;
        this.your_color = "orange";
        set(ref(this.database, "games/" + this.joined_game_code + "/players/orange/is_active"), true);
        this.gameRef = ref(this.database, "games/" + this.joined_game_code);
        this.start_listening();
    }

    create_room() {
        this.joined_game_code = Math.random().toString(36).substring(2, 7);
        document.getElementById("current-room-name").innerHTML = "Room: " + this.joined_game_code;
        this.your_color = "green";
        this.gameRef = ref(this.database, "games/" + this.joined_game_code);
        let data = {
            players: {
                green: {
                    is_active: true,
                    moves: [-1],
                },
                orange: {
                    is_active: false,
                    moves: [-1],
                }
            }
        }
        set(this.gameRef, data)
        this.start_listening();
    }

    add_event_listeners() {
        document.getElementById("join_room").addEventListener("click", this.join_room.bind(this));
        document.getElementById("create_room").addEventListener("click", this.create_room.bind(this));
        document.addEventListener('keydown', this.update_on_key.bind(this));
    }

    start_listening() {
        seedrandom(this.joined_game_code, { global: true });
        this.gameRefCallback = onValue(this.gameRef, this.update.bind(this));
        this.super_scene.start("GameScene");
    }

    update(snapshot) {
        this.current_data = snapshot.val();
        if (this.joined_game_code == null) {
            return;
        }
        if (this.current_data == null) {
            return;
        }
        let opp_color = this.your_color == "green" ? "orange" : "green";
        let game_data = this.current_data;
        document.getElementById("current-player").innerHTML = this.your_color;
        // if both players are active, update the game with the moves
        if (game_data.players.green.is_active && game_data.players.orange.is_active) {
            // if both players have made a move, update the game with the moves
            if (game_data.players[this.your_color].moves.length > this.current_turn) {
                if (game_data.players[opp_color].moves.length > this.current_turn) {
                    // update the game with the moves
                    this.scene.green_move = game_data.players.green.moves[this.current_turn];
                    this.scene.orange_move = game_data.players.orange.moves[this.current_turn];
                    this.current_turn++;
                }
            }
            // update the indicators for which player's has made a move
            if (game_data.players[this.your_color].moves.length > this.current_turn) {
                document.getElementById(this.your_color + "-lock").innerHTML = "true";
                document.getElementById("current-move").innerHTML = game_data.players[this.your_color].moves[this.current_turn];
            } else {
                document.getElementById(this.your_color + "-lock").innerHTML = "false";
                document.getElementById("current-move").innerHTML = "";
            }
            if (game_data.players[opp_color].moves.length > this.current_turn) {
                document.getElementById(opp_color + "-lock").innerHTML = "true";
            } else {
                document.getElementById(opp_color + "-lock").innerHTML = "false";
            }
        }
    }

    update_on_key(event) {
        let direction = null;
        if (event.key == "w") {
            direction = "up";
        } else if (event.key == "a") {
            direction = "left";
        } else if (event.key == "d") {
            direction = "right";
        } else if (event.key == "s") {
            direction = "down";
        }
        // if you are in multiplayer mode, update the database
        if (direction != null && this.joined_game_code != null && this.current_data != null) {
            let players_ref_str = "games/" + this.joined_game_code + "/players/";
            let your_moves = this.current_data.players[this.your_color].moves;
            // if you are caught up to the current turn, add a new move
            if (this.current_data.players[this.your_color].moves.length == this.current_turn) {
                your_moves.push(direction);
                set(ref(this.database, players_ref_str + this.your_color + "/moves"), your_moves);
            }
            // if you are ahead of the current turn, update the current turn's move
            else if (this.current_data.players[this.your_color].moves.length > this.current_turn) {
                your_moves[this.current_turn] = direction;
                set(ref(this.database, players_ref_str + this.your_color + "/moves"), your_moves);
            } else {
                console.error("you are behind the current turn, this should never happen");
            }
        }
    }
}
