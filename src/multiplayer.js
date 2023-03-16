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

export function multiplayer_init(game) {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const database = getDatabase(app);

    auth.onAuthStateChanged(function(user) {
        if (user) {
            console.log("User " + user.uid);
        } else {
            console.log("No user");
        }
    });
    
    signInAnonymously(auth).catch(function(error) {
        console.log(error);
    });
    
    let single_player = true;
    let joined_game_code = null;
    let your_color = null;

    document.getElementById("join_room").addEventListener("click", function() {
        single_player = false;
        joined_game_code = document.getElementById("room_id").value;
        document.getElementById("current-room-name").innerHTML = "Room: " + joined_game_code;
        your_color = "orange";
        set(ref(database, "games/" + joined_game_code + "/players/orange/is_active"), true);
    });

    document.getElementById("create_room").addEventListener("click", function() {
        single_player = false;
        joined_game_code = auth.lastNotifiedUid;
        document.getElementById("current-room-name").innerHTML = "Room: " + joined_game_code;
        your_color = "green";
        let gameRef = ref(database, "games/" + joined_game_code);
        set(gameRef,
            {
                players: {
                    green: {
                        is_active: true,
                        direction: null,
                    },
                    orange: {
                        is_active: false,
                        direction: null,
                    }
                }
            }
        )
    });

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
        if (direction != null && joined_game_code != null) {
            set(ref(database, "games/" + joined_game_code + "/players/" + your_color + "/direction"), direction);
        }
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

    onValue(ref(database, "games/"), (snapshot) => {
        const data = snapshot.val();
        if (joined_game_code == null) {
            return;
        }
        if (data[joined_game_code] == null) {
            return;
        }
        let game_data = data[joined_game_code];
        if (game_data.players.green.is_active) {
            game.scene.scenes[0].green_move = game_data.players.green.direction;
        }
        if (game_data.players.orange.is_active) {
            game.scene.scenes[0].orange_move = game_data.players.orange.direction;
        }
    });
}