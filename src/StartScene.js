var { multiplayer_init, single_player_init } = require('./multiplayer');
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
        let image = this.add.image(0, 0, "titlescreen").setOrigin(0, 0);
        image.setScale(0.54, 0.53);

        let title = this.add.text(0, 0, "PvP 2048", { fontSize: "90px", fill: "#fff" });
        title.setOrigin(0.5, 0.5);
        title.x = this.game.config.width / 2;
        title.y = this.game.config.height / 6;

        let button = new Button(this, 0, 0, "button_background", "button_background_hover", "Single Player", { fontSize: "30px", fill: "#000" }, this.single_player.bind(this));
        button.x = this.game.config.width / 2;
        button.y = this.game.config.height / 2;

        let button2 = new Button(this, 0, 0, "button_background", "button_background_hover", "Multiplayer", { fontSize: "30px", fill: "#000" }, this.multiplayer.bind(this));
        button2.x = this.game.config.width / 2;
        button2.y = this.game.config.height / 1.5;
    }

    single_player() {
        single_player_init(this.game.scene.keys.GameScene);
        this.scene.start("GameScene");
    }
    
    multiplayer() {
        multiplayer_init(this.game.scene.keys.GameScene);
        this.scene.start("GameScene");
    }

}

module.exports = {
    StartScene,
};