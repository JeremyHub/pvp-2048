
class WinLossScene extends Phaser.Scene {
    constructor(win_or_loss) {
        super({ key: win_or_loss });
        this.type = win_or_loss;
    }

    init(data) {
        this.winner = data.winner;
    }

    preload() {
        if (this.type === "WinScene") {
            this.load.image("win", "src/assets/win.png");
        } else if (this.type === "LossScene") {
            this.load.image("loss", "src/assets/loss.png");
        }
    }

    create() {
        let img_name = this.type === "WinScene" ? "win" : "loss";
        this.image = this.add.image(0, 0, img_name).setOrigin(0, 0);
        this.image.displayWidth = this.game.config.width;
        this.image.displayHeight = this.game.config.height;

        this.text = this.winner + " " + (this.type === "WinScene" ? " Wins!" : " Loses!");
        let text_size = this.game.config.width / 10;
        this.title = this.add.text(0, 0, this.text, { fontSize: text_size + "px", fill: "#000"});
        this.title.setOrigin(0.5, 0.5);
        this.title.scaleY = 2;
        this.title.x = this.game.config.width / 2;
        this.title.y = this.game.config.height / 2;
        this.title.setResolution(2);

        this.input.on("pointerdown", () => {
            this.scene.start("StartScene");
        });
    }
}

export class WinScene extends WinLossScene {
    constructor() {
        super("WinScene");
    }
}

export class LossScene extends WinLossScene {
    constructor() {
        super("LossScene");
    }
}
