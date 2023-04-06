import { StartScene } from "./StartScene";


export class WaitingForPlayersScene extends StartScene {

    constructor() {
        super('WaitingForPlayersScene');
    }

    init(args) {
        this.multiplayer_manager = args.multiplayer_manager;
    }

    create() {

        this.add_bg_img_and_title();

        // return if not connected with the database
        if (!this.multiplayer_manager.create_room((args) => { this.scene.start("GameScene", args) })) {
            this.scene.start("MultiplayerScene");
        }

        this.add_back_button("MultiplayerMenuScene");

        // waiting for players text
        this.waiting_for_players_text = this.add.text(this.game.config.width / 2, this.game.config.height / 2, "Waiting for players...", { fontSize: this.button_text_size + "px", fill: "#fff" });
        this.waiting_for_players_text.setOrigin(0.5, 0.5);

        // room code text
        this.room_code_text = this.add.text(this.game.config.width / 2, this.game.config.height / 1.5, "Room Code: " + this.multiplayer_manager.joined_game_code, { fontSize: this.button_text_size*1.4 + "px", fill: "#fff" });
        this.room_code_text.setOrigin(0.5, 0.5);

        // (copied to clipboard) text
        this.copied_to_clipboard_text = this.add.text(this.game.config.width / 2, this.game.config.height / 1.3, "(copied to clipboard)", { fontSize: this.button_text_size*0.8 + "px", fill: "#fff" });
        this.copied_to_clipboard_text.setOrigin(0.5, 0.5);
    }

}