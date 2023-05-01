const { StartScene } = require("./StartScene");
var { Button } = require('../Button');
var { UIContainer } = require('../UIContainer');
const { game_config } = require('./GameScene');

export class MapSelectionScene extends StartScene {

    constructor() {
        super('MapSelectionScene');
    }

    init(args) {
        this.before_scene = args.back;
    }

    preload() {
        this.load.image('claustshot', 'src/assets/claustshot.png');
        this.load.image('basicshot', 'src/assets/basicshot.png');
        this.load.image('clovershot', 'src/assets/clovershot.png');
        this.load.image('classic2048shot', 'src/assets/classic2048shot.png');
        this.load.image('libraryfireshot', 'src/assets/libraryfireshot.png');
    }

    create() {

        this.button_text_size = Math.min(this.game.config.height / 15, this.game.config.width / 15);

        this.add_bg_img_and_title();
        this.title.x = 1000000

        let num_buttons = game_config.maps.length;

        let x_pos = this.game.config.width * 0.1;
        let y_pos = this.game.config.height * 0.75;
        
        let button_height = 50; // set the height of each button
        
        let padding = Math.min(this.game.config.width, this.game.config.height) / 30;
        
        let map_buttons = [];
        
        // create map buttons
        for (let i = 0; i < num_buttons; i++) {
            let show_map = () => {

                // Get the name of the map from the button text and make it match with the screenshot name
                let mapName = map_button.text.text;
                let filename = mapName.toLowerCase() + "shot";
        
                // Create a new image object with the filename
                let image = this.add.image(0, 0, filename);
                image.x = this.game.config.width*0.5;
                image.y = this.game.config.height*0.35;

                // if the y of the image plus its hiegh its larger than the screen highet, move it up
                if (image.y + image.height/2 > this.game.config.height) {
                    image.y = this.game.config.height - image.height/2;
                }

                
                        
                // Remove the image when the mouse leaves the button
                map_button.button.on('pointerout', () => {
                    image.destroy();
                });
                
            }
        
            let map_button = new Button(
                this,
                0,
                0,
                "button_background",
                "button_background_hover",
                game_config.maps[i],
                { fontSize: this.button_text_size + "px", fill: "#000" },
                this.choose_map.bind(this, i),
                show_map
            );
        
            if (x_pos + map_button.text.width > this.game.config.width * 0.9) {
                x_pos = this.game.config.width * 0.1
                y_pos += button_height + padding
            }
            
            map_button.x = x_pos + (map_button.text.width / 2);
            map_button.y = y_pos;
            console.log(map_button)
        
            // adjust the y position for each button
            x_pos += map_button.text.width + padding;
        
            map_buttons.push(map_button);

            let current_filename = game_config.maps.at(game_config.selected_map).toLowerCase() + "shot";
        
            // Create a new image object with the filename
            this.current_image = this.add.image(0, 0, current_filename);
            this.current_image.x = this.game.config.width*0.5;
            this.current_image.y = this.game.config.height*0.35;

            // if the y of the image plus its hiegh its larger than the screen highet, move it up
            if (this.current_image.y + this.current_image.height/2 > this.game.config.height) {
                this.current_image.y = this.game.config.height - this.current_image.height/2;
            }

            this.current_map_text = new UIContainer(this, this.game.config.width*0.27, this.game.config.height*0.55, 
            ("Currently Selected Map:\n" + game_config.maps.at(game_config.selected_map).toLowerCase()), "#ffffff")
            this.current_map_text.updateTextSize(0.9)
        }
        
        this.add_back_button(this.before_scene);
    }

    choose_map(map_num) {
        game_config.selected_map = map_num;
        this.scene.start(this.before_scene);
    }

}