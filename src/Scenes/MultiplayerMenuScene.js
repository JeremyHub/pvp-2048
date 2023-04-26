import { StartScene } from './StartScene';

var { MutliplayerManager } = require('../MultiplayerManager');
var { Button } = require('../Button');

export class MultiplayerMenuScene extends StartScene {

    constructor() {
        super('MultiplayerMenuScene');
    }

    create() {

        if (this.multiplayer_manager !== undefined) {
            this.multiplayer_manager.destroy();
        }

        this.add_bg_img_and_title();
        
        this.mutliplayer_manager = new MutliplayerManager(this.game.scene.keys.GameScene, this.start_game.bind(this));
        this.mutliplayer_manager.init();

        // create room button
        this.create_room_button = new Button(this, 0, 0, "button_background", "button_background_hover", "Create Room", { fontSize: this.button_text_size + "px", fill: "#000" }, () => { this.scene.start("WaitingForPlayersScene", {multiplayer_manager: this.mutliplayer_manager}) });
        this.create_room_button.x = this.game.config.width / 2;
        this.create_room_button.y = this.game.config.height / 2;

        // join room button
        this.join_room_button = new Button(this, 0, 0, "button_background", "button_background_hover", "Join Room", { fontSize: this.button_text_size + "px", fill: "#000" }, this.mutliplayer_manager.join_room.bind(this.mutliplayer_manager));
        this.join_room_button.x = this.game.config.width / 2;
        this.join_room_button.y = this.game.config.height / 1.5;

        this.add_back_button("StartScene");

        this.add_options_buttons("MultiplayerMenuScene");
    }

}