
class WinLossScene extends Phaser.Scene {
    constructor(win_or_loss) {
        super({ key: win_or_loss });
        this.type = win_or_loss;
    }

    init(data) {
        this.player = data.player;
    }

    preload() {
        if (this.type === "WinScene") {
            this.load.image("win", "src/assets/win.png");
        } else if (this.type === "LossScene") {
            this.load.image("loss", "src/assets/loss.png");
        } else if (this.type === "TieScene") {
            this.load.image("tie", "src/assets/tie.png");
        }
    }

    create() {
        let img_name = this.type === "WinScene" ? "win" : "loss";
        img_name = this.type === "TieScene" ? "tie" : img_name;
        this.image = this.add.image(0, 0, img_name).setOrigin(0, 0);
        this.image.displayWidth = this.game.config.width;
        this.image.displayHeight = this.game.config.height;

        if (this.player == "you") {
            this.text = this.type === "WinScene" ? "You Win!" : "You Lose!";
        } else if (this.type === "TieScene") {
            this.text = "Tie!";
        } else {
            this.text = this.player + " " + (this.type === "WinScene" ? " Wins!" : " Loses!");
        }
        let text_size = this.game.config.width / 10;
        this.title = this.add.text(0, 0, this.text, { fontSize: text_size + "px", fill: "#fff"});
        this.title.setOrigin(0.5, 0.5);
        this.title.scaleY = 2;
        this.title.x = this.game.config.width / 2;
        this.title.y = this.game.config.height / 2;
        this.title.setResolution(2);

        this.instruction_text = this.add.text(0, 0, "Click anywhere to play again", { fontSize: text_size / 2 + "px", fill: "#fff"});
        this.instruction_text.setOrigin(0.5, 0.5);
        this.instruction_text.scaleY = 2;
        this.instruction_text.x = this.game.config.width / 2;
        this.instruction_text.y = this.game.config.height / 1.5;
        this.instruction_text.setResolution(2);

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

export class TieScene extends WinLossScene {
    constructor() {
        super("TieScene");
    }
}
