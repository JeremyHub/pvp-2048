const { StartScene } = require("./StartScene");
var { SinglePlayerManager } = require('../SinglePlayerManager');
var { Button } = require('../Button');
const { game_config } = require('./GameScene');

export class SinglePlayerMenuScene extends StartScene {

    constructor() {
        super('SinglePlayerMenuScene');
    }

    create() {
        if (this.single_player_manager !== undefined) {
            this.single_player_manager.destroy();
        }

        this.add_bg_img_and_title();
        this.single_player_manager = new SinglePlayerManager(this.game.scene.keys.GameScene);

        // create 1 player mode button
        this.one_player_button = new Button(this, 0, 0, "button_background", "button_background_hover", "1 Player", { fontSize: this.button_text_size + "px", fill: "#000" }, this.one_player.bind(this));
        this.one_player_button.x = this.game.config.width / 2;
        this.one_player_button.y = this.game.config.height / 2;

        // create 2 player mode button
        this.two_player_button = new Button(this, 0, 0, "button_background", "button_background_hover", "2 Player", { fontSize: this.button_text_size + "px", fill: "#000" }, this.two_player.bind(this));
        this.two_player_button.x = this.game.config.width / 2;
        this.two_player_button.y = this.game.config.height / 1.5;

        this.add_back_button("StartScene");

        this.add_options_buttons("SinglePlayerMenuScene");
    }

    one_player() {
        this.single_player_manager.init(1);
        this.start_game({ mode: "single", manager: this.single_player_manager});
    }

    two_player() {
        this.single_player_manager.init(2);
        this.start_game({ mode: "local_multiplayer", manager: this.single_player_manager});
    }

}