const { InputManager } = require("./InputManager.js");


export class SinglePlayerManager {

    constructor(scene) {
        this.scene = scene;
        this.green_move = null;
        this.orange_move = null;
        this.input_manager = new InputManager(this.wasd.bind(this), this.arrow.bind(this), this.swipe.bind(this));
    }

    wasd(move) {
        this.green_move = move;
        this.single_player_update();
    }

    arrow(move) {
        this.orange_move = move;
        this.single_player_update();
    }

    swipe(move) {
        this.green_move = move;
        this.single_player_update();
    }

    single_player_update() {
        if (!this.scene.any_block_is_moving) {
            if (this.green_move){
                this.scene.green_move = this.green_move;
                this.green_move = null;
                document.getElementById("green-lock").innerHTML = "true";
            }
            if (this.orange_move){
                this.scene.orange_move = this.orange_move;
                this.orange_move = null;
                document.getElementById("orange-lock").innerHTML = "true";
            }
            if (this.scene.green_move != null && this.scene.orange_move != null) {
                document.getElementById("green-lock").innerHTML = "false";
                document.getElementById("orange-lock").innerHTML = "false";
            }
        }
    }
}