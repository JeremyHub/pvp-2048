var { initializeApp } = require("firebase/app");
var { getDatabase, ref, set, onValue, off } = require("firebase/database");
var { getAuth, signInAnonymously } = require("firebase/auth");
var { InputManager } = require("./InputManager");
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

export class MutliplayerManager {
    constructor(scene, start_game_callback) {
        this.start_game_callback = start_game_callback;
        this.scene = scene;
        this.joined_game_code = null;
        this.your_color = null;
        this.current_turn = 1;
        this.current_data = null;
        this.database = null;
        this.app = null;
        this.auth = null;
        this.gameRef = null;
        this.game_has_started = false;
        this.input_manager = new InputManager(this.update_with_direction.bind(this), this.update_with_direction.bind(this), this.update_with_direction.bind(this));
    }

    init() {

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
    }

    join_room() {
        this.joined_game_code = document.getElementById("room_id").value;
        if (this.joined_game_code == "") {
            alert("Please enter a room code");
            return;
        }
        let temp_ref = ref(this.database, "games/" + this.joined_game_code);
        // check if game exists
        onValue(temp_ref, (snapshot) => {
            if (!snapshot.child("players").exists()) {
                alert("Room does not exist");
                off(temp_ref, "value")
                return;
            } else if (snapshot.child("players").exists()) {
                if (snapshot.child("players/orange/is_active").val() && !this.game_has_started) {
                    // if orange is active and your game has not started, room is full cuz someone else is orange
                    alert("Room is full");
                    off(temp_ref, "value");
                    return;
                } else if (snapshot.child("players/orange/is_active").val() && this.game_has_started) {
                    // if orange is active and your game has started, you are orange
                    this.update(snapshot);
                } else if (!snapshot.child("players/orange/is_active").val() && !this.game_has_started) {
                    // if orange is not active and your game has not started, join as orange
                    this.game_has_started = true;
                    this.gameRef = temp_ref;
                    document.getElementById("current-room-name").innerHTML = "Room: " + this.joined_game_code;
                    this.your_color = "orange";
                    this.start_game();
                }
            }
        });
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
        this.start_game();
        onValue(this.gameRef, this.update.bind(this));
    }

    start_game() {
        seedrandom(this.joined_game_code, { global: true });
        this.start_game_callback();
        set(ref(this.database, "games/" + this.joined_game_code + "/players/" + this.your_color + "/is_active"), true);
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

    update_with_direction(direction) {
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