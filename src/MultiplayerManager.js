import { game_config } from "./GameScene";

var { initializeApp } = require("firebase/app");
var { getDatabase, ref, set, onValue, off } = require("firebase/database");
var { getAuth, signInAnonymously } = require("firebase/auth");
var { InputManager } = require("./InputManager");

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
        this.current_wall = 1;
        this.current_data = null;
        this.database = null;
        this.app = null;
        this.auth = null;
        this.gameRef = null;
        this.user = null;
        this.game_has_started = false;
        this.you_have_moved = false;
        this.opp_has_moved = false;
        this.opponent_is_animating = false;
        this.input_manager = new InputManager(this.update_with_direction.bind(this), this.update_with_direction.bind(this), this.update_with_direction.bind(this));
    }

    init() {

        this.app = initializeApp(firebaseConfig);
        this.auth = getAuth(this.app);
        this.database = getDatabase(this.app);

        // check if user is logged in
        this.auth.onAuthStateChanged(this.onAuthChange.bind(this));
        
        // sign in anonymously
        signInAnonymously(this.auth).catch(function(error) {
            console.log(error);
        });
    }

    onAuthChange(user) {
        if (user) {
            console.log("User " + user.uid);
            this.user = user;
        } else {
            console.log("No user");
        }
    }

    is_signed_in() {
        if (this.user === null) {
            alert("Can't access database")
            return false;
        } else {
            return true;
        }
    }

    join_room() {
        if (!this.is_signed_in()) {
            return;
        }
        // prompt the user for input
        this.joined_game_code = prompt("Enter room code");
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
                    this.on_dataset_update(snapshot);
                } else if (!snapshot.child("players/orange/is_active").val() && !this.game_has_started) {
                    // if orange is not active and your game has not started, join as orange
                    this.game_has_started = true;
                    this.gameRef = temp_ref;
                    this.your_color = "orange";
                    game_config.selected_map = snapshot.child("map_selection").val();
                    this.start_game();
                }
            }
        });
    }

    create_room() {
        if (!this.is_signed_in()) {
            return;
        }

        this.joined_game_code = Math.random().toString(36).substring(2, 7);
        navigator.clipboard.writeText(this.joined_game_code);
        this.your_color = "green";
        this.gameRef = ref(this.database, "games/" + this.joined_game_code);
        let data = {
            players: {
                green: {
                    is_active: true,
                    moves: [-1],
                    walls: [[-1, -1]],
                },
                orange: {
                    is_active: false,
                    moves: [-1],
                    walls: [[-1, -1]],
                }
            },
            map_selection: game_config.selected_map,
        }
        set(this.gameRef, data);

        onValue(this.gameRef, (snapshot) => {
            if (snapshot.child("players/orange/is_active").val() && this.game_has_started) {
                // if orange is active and your game has started, you are green
                this.on_dataset_update(snapshot);
            } else if (snapshot.child("players/orange/is_active").val() && !this.game_has_started) {
                // if orange is not active and your game has not started, orange has joined
                this.game_has_started = true;
                this.start_game();
            } else {
                // you are waiting for orange to join
            }
        });
    }

    start_game() {
        this.start_game_callback({mode: "multiplayer", your_color: this.your_color, seed: this.joined_game_code, manager: this});
        set(ref(this.database, "games/" + this.joined_game_code + "/players/" + this.your_color + "/is_active"), true);
    }

    on_dataset_update(snapshot) {
        this.current_data = snapshot.val();
        if (this.joined_game_code == null) {
            return;
        }
        if (this.current_data == null) {
            return;
        }
        let opp_color = this.your_color == "green" ? "orange" : "green";
        let game_data = this.current_data;
        // if both players are active, update the game with the moves
        if (game_data.players.green.is_active && game_data.players.orange.is_active) {

            // update if opp is animating
            this.opponent_is_animating = game_data.players[opp_color].is_animating;

            // update the game with the moves
            if (game_data.players[this.your_color].moves.length > this.current_turn) {
                this.scene["make_" + this.your_color + "_move"](game_data.players[this.your_color].moves[this.current_turn]);
                this.you_have_moved = true;
            }
            if (game_data.players[opp_color].moves.length > this.current_turn) {
                this.scene["make_" + opp_color + "_move"](game_data.players[opp_color].moves[this.current_turn]);
                this.opp_has_moved = true;
            }
            
            // if the game has two moves in it
            if (this.you_have_moved && this.opp_has_moved) {
                this.you_have_moved = false;
                this.opp_has_moved = false;
                this.current_turn++;
            }

            // update the game with the walls
            if (game_data.players[opp_color].walls.length > this.current_wall) {
                this.scene["make_" + opp_color + "_wall"](game_data.players[opp_color].walls[this.current_wall]);
                this.current_wall++;
            }
        }
    }

    update_with_direction(direction) {
        // update the database with the new direction
        if (direction != null && this.joined_game_code != null && this.current_data != null) {
            let players_ref_str = "games/" + this.joined_game_code + "/players/";
            let your_moves = this.current_data.players[this.your_color].moves;
            // if you are caught up to the current turn, add a new move
            if (this.current_data.players[this.your_color].moves.length === this.current_turn && this.scene.is_waiting_for_input()) {
                your_moves.push(direction);
                set(ref(this.database, players_ref_str + this.your_color + "/moves"), your_moves);
                // console.log("updated with direction: " + direction);
            }
        }
    }

    update_with_wall(x, y) {
        // update the database with the new wall
        if (x != null && y != null && this.joined_game_code != null && this.current_data != null) {
            let players_ref_str = "games/" + this.joined_game_code + "/players/";
            let your_walls = this.current_data.players[this.your_color].walls;
            your_walls.push([x, y]);
            set(ref(this.database, players_ref_str + this.your_color + "/walls"), your_walls);
            // console.log("updated with wall: " + x + ", " + y);
        }
    }

    done_animating() {
        // update the database with the fact that you are done animating
        if (this.joined_game_code != null && this.current_data != null) {
            let players_ref_str = "games/" + this.joined_game_code + "/players/";
            set(ref(this.database, players_ref_str + this.your_color + "/is_animating"), false);
        }
    }

    animating_started() {
        // update the database with the fact that you are done animating
        if (this.joined_game_code != null && this.current_data != null) {
            let players_ref_str = "games/" + this.joined_game_code + "/players/";
            set(ref(this.database, players_ref_str + this.your_color + "/is_animating"), true);
        }
    }
}
