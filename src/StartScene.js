var { MutliplayerManager } = require('./MultiplayerManager');
var { SinglePlayerManager } = require('./SinglePlayerManager');
var { Button } = require('./Button');
const { game_config } = require('./GameScene');

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
        if (this.mutliplayer_manager !== undefined) {
            console.log("destroying mutliplayer_manager")
            this.mutliplayer_manager.destroy();
        }
        if (this.single_player_manager !== undefined) {
            console.log("destroying single_player_manager")
            this.single_player_manager.destroy();
        }

        this.title_size = this.game.config.width / 5;
        this.button_text_size = this.game.config.width / 15;

        
        this.image = this.add.image(0, 0, "titlescreen").setOrigin(0, 0);
        this.image.displayWidth = this.game.config.width;
        this.image.displayHeight = this.game.config.height;

        this.title = this.add.text(0, 0, "PvP 2048", { fontSize: this.title_size + "px", fill: "#fff" });
        this.title.setOrigin(0.5, 0.5);
        this.title.x = this.game.config.width / 2;
        this.title.y = this.game.config.height / 6;

        this.single_player_button = new Button(this, 0, 0, "button_background", "button_background_hover", "Local", { fontSize: this.button_text_size + "px", fill: "#000" }, this.single_player.bind(this));
        this.single_player_button.x = this.game.config.width / 2;
        this.single_player_button.y = this.game.config.height / 2;

        this.multiplayer_buton = new Button(this, 0, 0, "button_background", "button_background_hover", "Online", { fontSize: this.button_text_size + "px", fill: "#000" }, this.multiplayer.bind(this));
        this.multiplayer_buton.x = this.game.config.width / 2;
        this.multiplayer_buton.y = this.game.config.height / 1.5;

        this.map_selection_button = new Button(this, 0, 0, "button_background", "button_background_hover", "Map Selection", { fontSize: this.button_text_size/2 + "px", fill: "#000" }, this.map_selection.bind(this));
        this.map_selection_button.x = this.game.config.width - this.map_selection_button.button.displayWidth/2;
        this.map_selection_button.y = this.game.config.height - this.map_selection_button.button.displayHeight/2;

    }

    destroy_main_menu_buttons() {
        this.single_player_button.destroy();
        this.multiplayer_buton.destroy();
        this.map_selection_button.destroy();
    }

    map_selection() {
        this.destroy_main_menu_buttons();
        let num_buttons = game_config.maps.length;

        let x_pos = 0;
        let y_pos = this.game.config.height / 2.7;
        let padding = Math.min(this.game.config.width, this.game.config.height) / 30;

        let map_buttons = [];
        // create map buttons
        for (let i = 0; i < num_buttons; i++) {
            let map_button = new Button(this, 0, 0, "button_background", "button_background_hover", game_config.maps[i], { fontSize: this.button_text_size + "px", fill: "#000" }, this.choose_map.bind(this, i));
            if (x_pos + map_button.button.displayWidth > this.game.config.width) {
                x_pos = 0;
                y_pos += map_button.button.displayHeight + padding;
            }
            x_pos += map_button.button.displayWidth / 2 + padding;
            map_button.x = x_pos;
            map_button.y = y_pos;
            x_pos += map_button.button.displayWidth/2;
            map_buttons.push(map_button);
        }

        this.add_back_button();
    }

    choose_map(map_num) {
        game_config.selected_map = map_num;
        this.restart_scene();
    }

    single_player() {
        this.single_player_manager = new SinglePlayerManager(this.game.scene.keys.GameScene);

        this.destroy_main_menu_buttons();

        // create 1 player mode button
        this.one_player_button = new Button(this, 0, 0, "button_background", "button_background_hover", "1 Player", { fontSize: this.button_text_size + "px", fill: "#000" }, this.one_player.bind(this));
        this.one_player_button.x = this.game.config.width / 2;
        this.one_player_button.y = this.game.config.height / 2;

        // create 2 player mode button
        this.two_player_button = new Button(this, 0, 0, "button_background", "button_background_hover", "2 Player", { fontSize: this.button_text_size + "px", fill: "#000" }, this.two_player.bind(this));
        this.two_player_button.x = this.game.config.width / 2;
        this.two_player_button.y = this.game.config.height / 1.5;

        this.add_back_button();
    }

    one_player() {
        this.single_player_manager.init(1);
        this.start_game({ mode: "single"});
    }

    two_player() {
        this.single_player_manager.init(2);
        this.start_game({ mode: "local_multiplayer"});
    }
    
    multiplayer() {

        this.mutliplayer_manager = new MutliplayerManager(this.game.scene.keys.GameScene, this.start_game.bind(this));
        this.mutliplayer_manager.init();
        this.destroy_main_menu_buttons();

        // create room button
        this.create_room_button = new Button(this, 0, 0, "button_background", "button_background_hover", "Create Room", { fontSize: this.button_text_size + "px", fill: "#000" }, this.waiting_for_players.bind(this));
        this.create_room_button.x = this.game.config.width / 2;
        this.create_room_button.y = this.game.config.height / 2;

        // join room button
        this.join_room_button = new Button(this, 0, 0, "button_background", "button_background_hover", "Join Room", { fontSize: this.button_text_size + "px", fill: "#000" }, this.mutliplayer_manager.join_room.bind(this.mutliplayer_manager));
        this.join_room_button.x = this.game.config.width / 2;
        this.join_room_button.y = this.game.config.height / 1.5;

        this.add_back_button();
    }

    waiting_for_players() {
        this.mutliplayer_manager.create_room();

        this.create_room_button.destroy();
        this.join_room_button.destroy();
        this.add_back_button();

        // waiting for players text
        this.waiting_for_players_text = this.add.text(this.game.config.width / 2, this.game.config.height / 2, "Waiting for players...", { fontSize: this.button_text_size + "px", fill: "#fff" });
        this.waiting_for_players_text.setOrigin(0.5, 0.5);

        // room code text
        this.room_code_text = this.add.text(this.game.config.width / 2, this.game.config.height / 1.5, "Room Code: " + this.mutliplayer_manager.joined_game_code, { fontSize: this.button_text_size*1.4 + "px", fill: "#fff" });
        this.room_code_text.setOrigin(0.5, 0.5);

        // (copied to clipboard) text
        this.copied_to_clipboard_text = this.add.text(this.game.config.width / 2, this.game.config.height / 1.3, "(copied to clipboard)", { fontSize: this.button_text_size*0.8 + "px", fill: "#fff" });
        this.copied_to_clipboard_text.setOrigin(0.5, 0.5);
    }

    add_back_button() {
        // TODO change this to be a back icon
        this.back_button = new Button(this, 0, 0, "button_background", "button_background_hover", "Back", { fontSize: this.button_text_size/2 + "px", fill: "#fff"}, this.restart_scene.bind(this));
        this.back_button.x = this.back_button.getBounds().width / 2 + 1;
        this.back_button.y = this.game.config.height - this.back_button.getBounds().height / 2;
    }

    restart_scene() {
        this.scene.start("StartScene");
    }

    start_game(args) {
        this.scene.start("GameScene", args);
    }

}

module.exports = {
    StartScene,
};