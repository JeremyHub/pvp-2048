var { initializeApp } = require("firebase/app");
var { getDatabase, ref, set, onValue } = require("firebase/database");
var { getAuth, signInAnonymously } = require("firebase/auth");

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

// setup everything needed for multiplayer
export function multiplayer_init(game) {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const database = getDatabase(app);

    // check if user is logged in
    auth.onAuthStateChanged(function(user) {
        if (user) {
            console.log("User " + user.uid);
        } else {
            console.log("No user");
        }
    });
    
    // sign in anonymously
    signInAnonymously(auth).catch(function(error) {
        console.log(error);
    });

    // variables for multiplayer
    let single_player = true;
    let joined_game_code = null;
    let your_color = null;
    let current_turn = 1;
    let current_data = null;

    // when the join room button is clicked, join the room
    document.getElementById("join_room").addEventListener("click", function() {
        single_player = false;
        joined_game_code = document.getElementById("room_id").value;
        document.getElementById("current-room-name").innerHTML = "Room: " + joined_game_code;
        your_color = "orange";
        set(ref(database, "games/" + joined_game_code + "/players/orange/is_active"), true);
    });

    // when the create room button is clicked, create a new room
    document.getElementById("create_room").addEventListener("click", function() {
        single_player = false;
        joined_game_code = auth.lastNotifiedUid;
        document.getElementById("current-room-name").innerHTML = "Room: " + joined_game_code;
        your_color = "green";
        let gameRef = ref(database, "games/" + joined_game_code);
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
        set(gameRef, data)
    });

    // add event listener for key presses
    document.addEventListener('keydown', function(event) {
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
        if (direction != null && joined_game_code != null && current_data != null && current_data[joined_game_code] != null) {
            let players_ref_str = "games/" + joined_game_code + "/players/";
            let your_moves = current_data[joined_game_code].players[your_color].moves;
            // if you are caught up to the current turn, add a new move
            if (current_data[joined_game_code].players[your_color].moves.length == current_turn) {
                your_moves.push(direction);
                set(ref(database, players_ref_str + your_color + "/moves"), your_moves);
            }
            // if you are ahead of the current turn, update the current turn's move
            else if (current_data[joined_game_code].players[your_color].moves.length > current_turn) {
                your_moves[current_turn] = direction;
                set(ref(database, players_ref_str + your_color + "/moves"), your_moves);
            } else {
                console.error("you are behind the current turn, this should never happen");
            }
        }
        // if you are in single player mode, update the game with both players' moves
        if (single_player) {
            if (direction){
                game.scene.scenes[0].green_move = direction;
            }
            if (event.key == "ArrowLeft") {
                game.scene.scenes[0].orange_move = "left";
            }
            if (event.key == "ArrowRight") {
                game.scene.scenes[0].orange_move = "right";
            }
            if (event.key == "ArrowUp") {
                game.scene.scenes[0].orange_move = "up";
            }
            if (event.key == "ArrowDown") {
                game.scene.scenes[0].orange_move = "down";
            }
        }
    });

    // update the game with the moves from the database whenever the database changes
    onValue(ref(database, "games/"), (snapshot) => {
        current_data = snapshot.val();
        if (joined_game_code == null) {
            return;
        }
        if (current_data[joined_game_code] == null) {
            return;
        }
        let opp_color = your_color == "green" ? "orange" : "green";
        let game_data = current_data[joined_game_code];
        document.getElementById("current-player").innerHTML = your_color;
        // if both players are active, update the game with the moves
        if (game_data.players.green.is_active && game_data.players.orange.is_active) {
            // if both players have made a move, update the game with the moves
            if (game_data.players[your_color].moves.length > current_turn) {
                if (game_data.players[opp_color].moves.length > current_turn) {
                    // update the game with the moves
                    game.scene.scenes[0].green_move = game_data.players.green.moves[current_turn];
                    game.scene.scenes[0].orange_move = game_data.players.orange.moves[current_turn];
                    current_turn++;
                }
            }
            // update the indicators for which player's has made a move
            if (game_data.players[your_color].moves.length > current_turn) {
                document.getElementById(your_color + "-lock").innerHTML = "true";
                document.getElementById("current-move").innerHTML = game_data.players[your_color].moves[current_turn];
            } else {
                document.getElementById(your_color + "-lock").innerHTML = "false";
                document.getElementById("current-move").innerHTML = "";
            }
            if (game_data.players[opp_color].moves.length > current_turn) {
                document.getElementById(opp_color + "-lock").innerHTML = "true";
            } else {
                document.getElementById(opp_color + "-lock").innerHTML = "false";
            }
        }
    });
}