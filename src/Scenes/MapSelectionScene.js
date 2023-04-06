const { StartScene } = require("./StartScene");
var { Button } = require('../Button');
const { game_config } = require('./GameScene');

export class MapSelectionScene extends StartScene {

    constructor() {
        super('MapSelectionScene');
    }

    init(args) {
        this.before_scene = args.back;
    }

    create() {

        this.add_bg_img_and_title();

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

        this.add_back_button(this.before_scene);
    }

    choose_map(map_num) {
        game_config.selected_map = map_num;
        this.scene.start(this.before_scene);
    }

}