const { InputManager } = require("./InputManager.js");


export class SinglePlayerManager {

    constructor(scene) {
        this.scene = scene;
        this.green_move = null;
        this.orange_move = null;
        this.input_manager = new InputManager(this.wasd.bind(this), this.arrow.bind(this), this.swipe.bind(this), scene);
    }

    init(num_players) {
        this.num_players = num_players;
    }

    wasd(move) {
        this.green_move = move;
        this.single_player_update();
    }

    arrow(move) {
        if (this.num_players === 1) {
            this.green_move = move;
        } else {
            this.orange_move = move;
        }
        this.single_player_update();
    }

    swipe(move) {
        this.green_move = move;
        this.single_player_update();
    }

    single_player_update() {
        if (this.num_players) {
            if (this.scene.is_waiting_for_input()) {
                if (this.green_move){
                    this.scene.make_green_move(this.green_move);
                    this.green_move = null;
                }
                if (this.num_players === 2) {
                    if (this.orange_move){
                        this.scene.make_orange_move(this.orange_move);
                        this.orange_move = null;
                    }
                } else if (this.num_players === 1) {
                    let choices = ["up", "down", "left", "right"];
                    let random_index = Math.floor(Math.random() * choices.length);
                    this.scene.make_orange_move(choices[random_index]);
                } else {
                    console.error("num_players must be 1 or 2");
                }
               
            } else {
                this.green_move = null;
                this.orange_move = null;
            }
        }
    }

    destroy() {
        this.input_manager.destroy();
        this.num_players = null;
    }
}