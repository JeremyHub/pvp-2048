var { Button } = require('../Button');
var { SinglePlayerManager } = require('../SinglePlayerManager');
const { game_config } = require('./GameScene');

class StartScene extends Phaser.Scene {
    constructor(key_val = "StartScene") {
        super({ key: key_val});
    }
    
    preload() {
        this.button_text_size = this.game.config.width / 15;
        this.load.image("titlescreen", "src/assets/titlescreen.png");
        this.load.image("titlescreen_dark", "src/assets/titlescreen_dark.png");
        this.load.image("button_background", "src/assets/button_background.png");
        this.load.image("button_background_hover", "src/assets/button_background_hover.png");
        this.load.image("button_background_dark", "src/assets/button_background_dark.png");
        this.load.image("button_background_hover_dark", "src/assets/button_background_hover_dark.png");
    }
    
    create() {

        this.add_bg_img_and_title();

        this.single_player_button = new Button(this, 0, 0, "button_background", "button_background_hover", "Local", { fontSize: this.button_text_size + "px", fill: "#000" }, () => { this.scene.start("SinglePlayerMenuScene") });
        this.single_player_button.x = this.game.config.width / 2;
        this.single_player_button.y = this.game.config.height / 2.1;

        this.multiplayer_buton = new Button(this, 0, 0, "button_background", "button_background_hover", "Online", { fontSize: this.button_text_size + "px", fill: "#000" }, () => { this.scene.start("MultiplayerMenuScene") });
        this.multiplayer_buton.x = this.game.config.width / 2;
        this.multiplayer_buton.y = this.game.config.height / 1.65;

        this.tutorial_button = new Button(this, 0, 0, "button_background", "button_background_hover", "How to Play", { fontSize: this.button_text_size + "px", fill: "#000" }, this.how_to_play.bind(this));
        this.tutorial_button.x = this.game.config.width / 2;
        this.tutorial_button.y = this.game.config.height / 1.2;

        if (this.single_player_manager !== undefined) {
            this.single_player_manager.destroy()
        }

    }

    add_bg_img_and_title() {
        this.image = this.add.image(0, 0, "titlescreen").setOrigin(0, 0);
        this.image.displayWidth = this.game.config.width;
        this.image.displayHeight = this.game.config.height;

        this.title_size = this.game.config.width / 5;
        this.title = this.add.text(0, 0, "PvP 2048", { fontSize: this.title_size + "px", fill: "#fff" });
        this.title.setOrigin(0.5, 0.5);
        this.title.x = this.game.config.width / 2;
        this.title.y = this.game.config.height / 6;
    }

    add_dark_bg_img() {
        this.image = this.add.image(0, 0, "titlescreen_dark").setOrigin(0, 0);
        this.image.displayWidth = this.game.config.width;
        this.image.displayHeight = this.game.config.height;
    }

    add_options_buttons(before_scene) {
        this.map_selection_button = new Button(this, 0, 0, "button_background", "button_background_hover", "Map Selection", { fontSize: this.button_text_size/2 + "px", fill: "#000" }, () => { this.scene.start("MapSelectionScene", {back: before_scene}) });
        this.map_selection_button.x = this.game.config.width - this.map_selection_button.button.displayWidth/2;
        this.map_selection_button.y = this.game.config.height - this.map_selection_button.button.displayHeight/2;

        this.options_button = new Button(this, 0, 0, "button_background", "button_background_hover", "Options", { fontSize: this.button_text_size/2 + "px", fill: "#000" }, () => { this.scene.start("OptionsScene", {back: before_scene}) });
        this.options_button.x = this.map_selection_button.x;
        this.options_button.y = this.map_selection_button.y - this.map_selection_button.button.displayHeight - this.options_button.button.displayHeight/2;
    }

    how_to_play() {
        game_config.selected_map = -1;
        game_config.top_map_offset = 0.2
        game_config.bottom_map_offset = 0.2
        game_config.left_map_offset = 0.2
        game_config.right_map_offset = 0.2
        this.single_player_manager = new SinglePlayerManager(this.game.scene.keys.GameScene);

        this.start_game({ mode: "single"});
        this.single_player_manager.init(1);
    }

    add_back_button(scene) {
        // TODO change this to be a back icon
        this.back_button = new Button(this, 0, 0, "button_background", "button_background_hover", "Back", { fontSize: this.button_text_size/2 + "px", fill: "#fff"}, () => { this.scene.start(scene) });
        this.back_button.x = this.back_button.getBounds().width / 2 + 1;
        this.back_button.y = this.game.config.height - this.back_button.getBounds().height / 2;
    }

    start_game(args) {
        this.scene.start("GameScene", args);
    }

}

module.exports = {
    StartScene,
};