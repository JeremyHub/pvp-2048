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

        this.add_dark_bg_img();

        this.add_back_button(this.before_scene);

        // timer options
        // increment
        this.change_increment_button = new Button(this, 0, 0, "button_background", "button_background_hover", "Change Increment", { fontSize: this.button_text_size/2 + "px", fill: "#000" }, this.change_increment.bind(this));
        this.change_increment_button.x = this.game.config.width / 2;
        this.change_increment_button.y = this.game.config.height / 5.4;
        this.current_increment = this.add.text(0, 0, "Timer Increment (seconds): " + game_config.time_increment/1000, { fontSize: this.button_text_size/2 + "px", fill: "#fff" });
        this.current_increment.setOrigin(0.5, 0.5);
        this.current_increment.x = this.game.config.width / 2;
        this.current_increment.y = this.change_increment_button.y - this.change_increment_button.button.displayHeight/2 - this.current_increment.displayHeight/2;
        // starting time
        this.starting_time_button = new Button(this, 0, 0, "button_background", "button_background_hover", "Change Starting Time", { fontSize: this.button_text_size/2 + "px", fill: "#000" }, this.change_starting_time.bind(this));
        this.starting_time_button.x = this.game.config.width / 2;
        this.starting_time_button.y = this.game.config.height / 3;
        this.current_starting_time = this.add.text(0, 0, "Starting Time (seconds): " + game_config.starting_time/1000, { fontSize: this.button_text_size/2 + "px", fill: "#fff" });
        this.current_starting_time.setOrigin(0.5, 0.5);
        this.current_starting_time.x = this.game.config.width / 2;
        this.current_starting_time.y = this.starting_time_button.y - this.starting_time_button.button.displayHeight/2 - this.current_starting_time.displayHeight/2;

        // wall increment
        this.wall_increment_button = new Button(this, 0, 0, "button_background", "button_background_hover", "Change Wall Increment", { fontSize: this.button_text_size/2 + "px", fill: "#000" }, this.change_wall_increment.bind(this));
        this.wall_increment_button.x = this.game.config.width / 2;
        this.wall_increment_button.y = this.game.config.height / 2;
        this.current_wall_increment = this.add.text(0, 0, "Walls gained per turn: " + game_config.wall_increment, { fontSize: this.button_text_size/2 + "px", fill: "#fff" });
        this.current_wall_increment.setOrigin(0.5, 0.5);
        this.current_wall_increment.x = this.game.config.width / 2;
        this.current_wall_increment.y = this.wall_increment_button.y - this.wall_increment_button.button.displayHeight/2 - this.current_wall_increment.displayHeight/2;

        // win percentage
        this.win_percentage_button = new Button(this, 0, 0, "button_background", "button_background_hover", "Change Win Percentage", { fontSize: this.button_text_size/2 + "px", fill: "#000" }, this.change_win_percentage.bind(this));
        this.win_percentage_button.x = this.game.config.width / 2;
        this.win_percentage_button.y = this.game.config.height / 1.5;
        this.current_win_percentage = this.add.text(0, 0, "Win Percentage: " + game_config.win_percentage, { fontSize: this.button_text_size/2 + "px", fill: "#fff" });
        this.current_win_percentage.setOrigin(0.5, 0.5);
        this.current_win_percentage.x = this.game.config.width / 2;
        this.current_win_percentage.y = this.win_percentage_button.y - this.win_percentage_button.button.displayHeight/2 - this.current_win_percentage.displayHeight/2;


        // colorblind mode
        this.colorblind_mode_button = new Button(this, 0, 0, "button_background", "button_background_hover", "Toggle Colorblind Mode", { fontSize: this.button_text_size/2 + "px", fill: "#000" }, this.toggle_colorblind_mode.bind(this));
        this.colorblind_mode_button.x = this.game.config.width / 2;
        this.colorblind_mode_button.y = this.game.config.height / 1.2;
        this.current_colorblind_mode = this.add.text(0, 0, "Colorblind Mode: Off", { fontSize: this.button_text_size/2 + "px", fill: "#fff" });
        this.current_colorblind_mode.setOrigin(0.5, 0.5);
        this.current_colorblind_mode.x = this.game.config.width / 2;
        this.current_colorblind_mode.y = this.colorblind_mode_button.y - this.colorblind_mode_button.button.displayHeight/2 - this.current_colorblind_mode.displayHeight/2;

    }

    change_starting_time() {
        let new_starting_time = parseInt(window.prompt("Enter new starting time"));
        if (new_starting_time >= 1 && new_starting_time <= 600) {
            game_config.starting_time = new_starting_time*1000;
            this.current_starting_time.setText("Starting Time (seconds): " + game_config.starting_time/1000);
        } else {
            window.alert("Must be an integer value from 1-600!");
        }
    }

    change_increment() {
        let new_increment = parseInt(window.prompt("Enter new increment"));
        if (new_increment >= 0 && new_increment <= 1000) {
            game_config.time_increment = new_increment*1000;
            this.current_increment.setText("Timer Increment (seconds): " + game_config.time_increment/1000);
        } else {
            window.alert("Must be an integer value from 0-100!");
        }
    }

    change_wall_increment() {
        let new_wall_increment = parseFloat(window.prompt("Enter new wall increment"));
        if (new_wall_increment >= 0 && new_wall_increment <= 25) {
            game_config.wall_increment = new_wall_increment;
            this.current_wall_increment.setText("Walls gained per turn: " + game_config.wall_increment);
        } else {
            window.alert("Must be a value from 0-25!");
        }
    }

    change_win_percentage() {
        let new_win_percentage = parseFloat(window.prompt("Enter new win percentage"));
        if (new_win_percentage > 50 && new_win_percentage <= 100) {
            game_config.win_percentage = new_win_percentage;
            this.current_win_percentage.setText("Win Percentage: " + game_config.win_percentage);
        } else if (new_win_percentage <= 50 || new_win_percentage > 100) {
            window.alert("Win percentage must be greater than 50% and less than or equal to 100%!")
        } else {
            window.alert("Win percentage must be greater than 50% and less than or equal to 100%!");
        }
    }

    toggle_colorblind_mode() {
        let new_colorblind_mode = !game_config.colorblind_mode;
        game_config.colorblind_mode = new_colorblind_mode;
        if(game_config.colorblind_mode === true) {
            this.current_colorblind_mode.setText("Colorblind Mode: On");
        } else {
            this.current_colorblind_mode.setText("Colorblind Mode: Off");
        }



    }
      

}