const { StartScene } = require("./StartScene");
var { Button } = require('../Button');
const { game_config } = require('./GameScene');

export class OptionsScene extends StartScene {

    constructor() {
        super('OptionsScene');
    }

    init(args) {
        this.before_scene = args.back;
    }

    create() {

        this.add_bg_img_and_title();

        this.add_back_button(this.before_scene);

        // timer options
        // increment
        this.change_increment_button = new Button(this, 0, 0, "button_background", "button_background_hover", "Change Increment", { fontSize: this.button_text_size/2 + "px", fill: "#000" }, this.change_increment.bind(this));
        this.change_increment_button.x = this.game.config.width / 2;
        this.change_increment_button.y = this.game.config.height / 2;
        this.current_increment = this.add.text(0, 0, "Timer Increment (seconds): " + game_config.time_increment/1000, { fontSize: this.button_text_size/2 + "px", fill: "#fff" });
        this.current_increment.setOrigin(0.5, 0.5);
        this.current_increment.x = this.game.config.width / 2;
        this.current_increment.y = this.change_increment_button.y - this.change_increment_button.button.displayHeight/2 - this.current_increment.displayHeight/2;
        // starting time
        this.starting_time_button = new Button(this, 0, 0, "button_background", "button_background_hover", "Change Starting Time", { fontSize: this.button_text_size/2 + "px", fill: "#000" }, this.change_starting_time.bind(this));
        this.starting_time_button.x = this.game.config.width / 2;
        this.starting_time_button.y = this.game.config.height / 1.5;
        this.current_starting_time = this.add.text(0, 0, "Starting Time (seconds): " + game_config.starting_time/1000, { fontSize: this.button_text_size/2 + "px", fill: "#fff" });
        this.current_starting_time.setOrigin(0.5, 0.5);
        this.current_starting_time.x = this.game.config.width / 2;
        this.current_starting_time.y = this.starting_time_button.y - this.starting_time_button.button.displayHeight/2 - this.current_starting_time.displayHeight/2;

        // win condition
    }

    change_starting_time() {
        let new_starting_time = parseInt(window.prompt("Enter new starting time"));
        if (new_starting_time !== NaN) {
            game_config.starting_time = new_starting_time*1000;
            this.current_starting_time.setText("Starting Time (seconds): " + game_config.starting_time/1000);
        } else {
            window.alert("Not a Number!");
        }
    }

    change_increment() {
        let new_increment = parseInt(window.prompt("Enter new increment"));
        if (new_increment !== NaN) {
            game_config.time_increment = new_increment*1000;
            this.current_increment.setText("Increment (seconds): " + game_config.time_increment/1000);
        } else {
            window.alert("Not a Number!");
        }
    }

}