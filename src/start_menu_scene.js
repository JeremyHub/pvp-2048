var { multiplayer_init } = require('./multiplayer');

class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: "StartScene" });
    }

    preload() {
        this.load.image("titlescreen", "src/assets/titlescreen.png");
    }

    create() {
        let image = this.add.image(0, 0, "titlescreen").setOrigin(0, 0);
        image.setScale(0.54, 0.53);

        let text = this.add.text(0, 0, "Press any key to start", {
            font: "bold 32px Arial",
            fill: "white",
        });
        text.setOrigin(-0.2, -5);

        this.input.keyboard.on("keydown", function (event) {
            this.scene.start("GameScene");
            multiplayer_init(this.game.scene.keys.GameScene);
        }, this);
    }
}

module.exports = {
    StartScene,
};