var { MutliplayerManager } = require('./MultiplayerManager');
var { SinglePlayerManager } = require('./SinglePlayerManager');
var { Button } = require('./Button');

class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: "StartScene" });
    }

    preload() {
        this.load.image("titlescreen", "src/assets/titlescreen.png");
        this.load.image("button_background", "src/assets/button_background.png");
        this.load.image("button_background_hover", "src/assets/button_background_hover.png");
    }

    create() {
        this.image = this.add.image(0, 0, "titlescreen").setOrigin(0, 0);
        this.image.setScale(0.54, 0.53);

        this.title = this.add.text(0, 0, "PvP 2048", { fontSize: "90px", fill: "#fff" });
        this.title.setOrigin(0.5, 0.5);
        this.title.x = this.game.config.width / 2;
        this.title.y = this.game.config.height / 6;

        this.single_player_button = new Button(this, 0, 0, "button_background", "button_background_hover", "Single Player", { fontSize: "30px", fill: "#000" }, this.single_player.bind(this));
        this.single_player_button.x = this.game.config.width / 2;
        this.single_player_button.y = this.game.config.height / 2;

        this.multiplayer_buton = new Button(this, 0, 0, "button_background", "button_background_hover", "Multiplayer", { fontSize: "30px", fill: "#000" }, this.multiplayer.bind(this));
        this.multiplayer_buton.x = this.game.config.width / 2;
        this.multiplayer_buton.y = this.game.config.height / 1.5;
    }

    single_player() {
        this.single_player_manager = new SinglePlayerManager(this.game.scene.keys.GameScene);

        this.single_player_button.destroy();
        this.multiplayer_buton.destroy();

        // create 1 player mode button
        this.one_player_button = new Button(this, 0, 0, "button_background", "button_background_hover", "1 Player", { fontSize: "30px", fill: "#000" }, this.one_player.bind(this));
        this.one_player_button.x = this.game.config.width / 2;
        this.one_player_button.y = this.game.config.height / 2;

        // create 2 player mode button
        this.two_player_button = new Button(this, 0, 0, "button_background", "button_background_hover", "2 Player", { fontSize: "30px", fill: "#000" }, this.two_player.bind(this));
        this.two_player_button.x = this.game.config.width / 2;
        this.two_player_button.y = this.game.config.height / 1.5;
    }

    one_player() {
        this.single_player_manager.init(1);
        this.start_game();
    }

    two_player() {
        this.single_player_manager.init(2);
        this.start_game();
    }
    
    multiplayer() {
        this.mutliplayer_manager = new MutliplayerManager(this.game.scene.keys.GameScene, this.start_game.bind(this));
        this.mutliplayer_manager.init();
        this.single_player_button.destroy();
        this.multiplayer_buton.destroy();

        // create room button
        this.create_room_button = new Button(this, 0, 0, "button_background", "button_background_hover", "Create Room", { fontSize: "30px", fill: "#000" }, this.mutliplayer_manager.create_room.bind(this.mutliplayer_manager));
        this.create_room_button.x = this.game.config.width / 2;
        this.create_room_button.y = this.game.config.height / 2;

        // join room button
        this.join_room_button = new Button(this, 0, 0, "button_background", "button_background_hover", "Join Room", { fontSize: "30px", fill: "#000" }, this.mutliplayer_manager.join_room.bind(this.mutliplayer_manager));
        this.join_room_button.x = this.game.config.width / 2;
        this.join_room_button.y = this.game.config.height / 1.5;
    }

    start_game() {
        this.scene.start("GameScene");
    }

}

module.exports = {
    StartScene,
};