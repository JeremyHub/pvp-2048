var {Timer} = require('../Timer');
var {UIContainer} = require('../UIContainer');
var {ScoreBar} = require('../ScoreBar');


var {block_config} = require('../Block');
var {
    getTotalValueOfBlocks,
    box_in,
    spawnblocks,
    create_block,
    remove_block,
    check_collisions,
    is_any_block_moving,
    calculations_finished,
    turn_finished,
    move_blocks,
} = require('../game_functions');
const { Button } = require('../Button');

const game_config = {
    top_map_offset: 0.1, // percentage of screen height from top that the map is offset
    bottom_map_offset: 0.1, // percentage of screen height from bottom that the map is offset
    left_map_offset: 0.2, // percentage of screen width from left that the map is offset
    right_map_offset: 0.2, // percentage of screen width from right that the map is offset
    num_rows: 14, // reset in create
    num_cols: 14, // reset in create
    tile_size: 32, // reset in create
    padding: 3,
    orange_color: 0xf27507,
    green_color: 0x00ff00,
    colorblind_mode: false,
    wall_id: [6,262, 268, 62, 132, 34],
    green_id: [57, 321, 29],   // spawning area
    orange_id: [127], // spawning area
    green_wall: 62,
    orange_wall: 132,
    empty_space_id: [15,178],
    maps: [
        'libraryfire',
        'Classic2048',
        'basic',
        'claust',
        'clover'
        
    ],
    selected_map: 0, // default map
    starting_time: 120000, // starting time in ms
    time_increment: 3000, // ms added to timer every turn
    wall_increment: 1, // number of walls added to each player every turn
    win_percentage: 70,
};

class GameScene extends Phaser.Scene {

    constructor() {
        super({key: 'GameScene'});
    }

    init(args) {

        this.args = args;
        this.mode = args.mode;
        this.your_color = args.your_color;
        this.manager = args.manager;
        this.seed = args.seed;
        if (this.seed === undefined) {
            this.seed = Math.floor(Math.random() * 1000000000);
        } else {
            let utf8Encode = new TextEncoder();
            let encoded = utf8Encode.encode(this.seed);
            let buffer = Buffer.from(encoded);
            this.seed = buffer.readUIntBE(0, 5);
        }

        this.error_log = [];

        this.blocks = [];               // all blocks
        this.orange_blocks = [];        // orange blocks            
        this.green_blocks = [];         // green blocks

        this.placed_orange_walls = [];         // orange walls placed in the map
        this.placed_green_walls = [];          // green walls placed in the map

        this.green_walls_count = 0;         // number of green walls (not placed)
        this.orange_walls_count = 0;        // number of orange walls (not placed)

        this.is_placing_green_walls = false;
        this.is_placing_orange_walls = false;


        this.orange_move = null;
        this.green_move = null;

        this.movement_started = false; // used to set up movement at the start of each turn
        this.animations_started = false;

        this.blocks_moved = false;

        this.is_placing_orange_blocks = false;
        this.is_placing_green_blocks = false;
        this.is_placing_barriers = false;
        this.is_placing_background_blocks = false;

        this.is_drawing = false;

        this.manual_block_spawn_value = null;

        this.box_in_counter = 0;

        this.orange_total_value = 0;
        this.green_total_value = 0;
        this.win_value = 100;

        this.orange_percent = 0;
        this.green_percent = 0;



        // Define a list of the keys
        this.keyList = ['W', 'A', 'S', 'D', 'UP', 'LEFT', 'DOWN', 'RIGHT', 'O', 'G', 'B', 'T', 'R', 'Z', 'X', 'C', 'P', 'M', 'L', 'K', 'N'];

        this.green_lock = "false";      
        this.orange_lock = "false";

        this.green_has_moved = false;
        this.orange_has_moved = false;

        this.total_moves = 0;

        this.green_moves = [];
        this.orange_moves = [];

        this.is_tutorial = false;
        this.tutorial_move = null;

        this.game_has_started = false;
        this.ending_animation_playing = false;

        return this;
    }

    preload() {
        for (let map of game_config.maps) {
            this.load.tilemapTiledJSON(map, `src/assets/${map}.json`);
        }
        this.load.tilemapTiledJSON('tutorial', `src/assets/tutorial.json`);

        this.load.image('combinedmaps', 'src/assets/combinedmaps.png');
        this.load.image('tiles', 'src/assets/tiles.png');

        this.load.atlas('shapes', 'src/assets/shapes.png', 'src/assets/shapes.json');
        this.load.text('block-particle', 'src/assets/block-particle.json');

    }

    convert_hex_to_hex_string(num) {
        let hex_string = num.toString(16);
        while (hex_string.length < 6) {
            hex_string = '0' + hex_string;
        }
        return hex_string;
    }
    
    create() {
        
        if (game_config.selected_map === -1) {
            this.map = this.make.tilemap({ key: 'tutorial' });
            let tileset_name = this.map.tilesets[0].name;
            this.tileset = this.map.addTilesetImage(tileset_name, tileset_name);
            this.is_tutorial = true;
            this.tutorial_step = 0;
            this.tutorial_text = new UIContainer(this, this.game.config.width*0.1,
                this.game.config.height*0.05,
                "WASD or arrow keys\n(or swipe on mobile) to move.", "#ffffff");
            this.has_bounced = false;
        } else {
            this.map = this.make.tilemap({ key: game_config.maps[game_config.selected_map] });
            let tileset_name = this.map.tilesets[0].name;
            this.tileset = this.map.addTilesetImage(tileset_name, tileset_name);
        }
        
        
        this.map.createLayer('Tile Layer 1', this.tileset, 0, 0);

        // set the game config variables
        game_config.num_cols = this.map.width;
        game_config.num_rows = this.map.height;
        // set the tile size to the smallest of the two dimensions
        let map_width = this.game.config.width * (1 - game_config.left_map_offset - game_config.right_map_offset);
        let map_height = this.game.config.height * (1 - game_config.top_map_offset - game_config.bottom_map_offset);
        
        game_config.tile_size = Math.min(map_width / game_config.num_cols,map_height / game_config.num_rows);
        // scale the tilemap to the correct size
        this.map.layers[0].tilemapLayer.setScale(game_config.tile_size / this.map.tileWidth, game_config.tile_size / this.map.tileHeight);
        // center it in the game
        this.map.layers[0].tilemapLayer.x = Math.max((map_width - (game_config.tile_size*game_config.num_cols)) / 2,0) + this.game.config.width * game_config.left_map_offset;
        this.map.layers[0].tilemapLayer.y = Math.max((map_height - (game_config.tile_size*game_config.num_rows)) / 2,0) + this.game.config.height * game_config.top_map_offset;
        if (game_config.colorblind_mode) {
            for (let x = 0; x < game_config.num_cols; x++) {
                for (let y = 0; y < game_config.num_rows; y++) {
                    if (this.map.getTileAt(x, y).index === 57) {
                        this.map.getTileAt(x, y).index = 29;
                    }
                }
            }
            game_config.green_color = 0x0d6cff;
            game_config.green_wall = 34;
        } else {
            game_config.green_color = 0x00ff00;
            game_config.green_wall = 62;
        }

        this.pointer = this.input.activePointer;
        
        // Loop through the keyList and add each key to the input.keyboard using a template literal
        for (let key of this.keyList) {
        this[`${key.toLowerCase()}_key`] = this.input.keyboard.addKey(key);
        }

        // no timer when against bot
        if (this.mode == "single") {
            let dummy = {
                update: function() {},
                pause: function() {},
                unpause: function() {},
                add_time: function() {},
            }
            this.green_timer = dummy;
            this.orange_timer = dummy;
        } else {
            this.green_timer = new Timer(this, this.game.config.width*0.015, this.game.config.height*0.5, game_config.starting_time, "#" + this.convert_hex_to_hex_string(game_config.green_color));
            this.orange_timer = new Timer(this, 0, this.game.config.height*0.5, game_config.starting_time, "#" + this.convert_hex_to_hex_string(game_config.orange_color));
            this.orange_timer.x = this.game.config.width - this.orange_timer.text.width - this.game.config.width*.015;
        }
        
        // I did something a little strange with orange_score.x
        this.green_score = new UIContainer(this, this.game.config.width*0.01, this.game.config.height*0.02, "Score:   " + this.green_total_value, "#" + this.convert_hex_to_hex_string(game_config.green_color));
        this.orange_score = new UIContainer(this, 0, this.game.config.height*0.02, "Score:   " + this.orange_total_value, "#" + this.convert_hex_to_hex_string(game_config.orange_color));
        this.orange_score.x = this.game.config.width - this.orange_score.text.width - this.game.config.width*0.04;
        if (this.is_tutorial) {
            this.green_score.x = 1000000;
            this.orange_score.x = 1000000;
        }

        this.green_walls_container = new UIContainer(this, this.game.config.width*0.02, this.game.config.height*0.93, "Walls: " + this.green_walls_count, "#" + this.convert_hex_to_hex_string(game_config.green_color));
        this.orange_walls_container = new UIContainer(this, 0, this.game.config.height*0.93, "Walls: 00" + this.orange_walls_count, "#" + this.convert_hex_to_hex_string(game_config.orange_color));
        if (game_config.wall_increment % 1 === 0) {
            this.orange_walls_container.x = this.game.config.width*.79;
        } else {
            this.orange_walls_container.x = this.game.config.width - this.orange_walls_container.text.width - this.game.config.width*0.02;
        }
        if (this.is_tutorial) {
            this.orange_walls_container.x = 1000000;
            this.green_walls_container.x = 1000000;
        }

        this.green_player_move = new UIContainer(this, this.game.config.width*0.04, this.game.config.height*0.6, null, "#" + this.convert_hex_to_hex_string(game_config.green_color));
        this.orange_player_move = new UIContainer(this, this.orange_timer.x + 30, this.game.config.height*0.6, null, "#" + this.convert_hex_to_hex_string(game_config.orange_color));
        if (this.is_tutorial) {
            this.green_player_move.x = 1000000;
            this.orange_player_move.x = 1000000;
        }
        if (this.mode !== "single") {
            this.waiting_for_move_green = new UIContainer(this, this.game.config.width*0.01, this.game.config.height*0.35,
            "Waiting\nfor move", "#" + this.convert_hex_to_hex_string(game_config.green_color));
            this.waiting_for_move_orange = new UIContainer(this, this.game.config.width*0.81, this.game.config.height*0.35,
            "Waiting\nfor move", "#" + this.convert_hex_to_hex_string(game_config.orange_color));
            this.waiting_for_move_green.updateTextSize(0.8);
            this.waiting_for_move_orange.updateTextSize(0.8);
            this.waiting_for_move_animation_step = 50;
        }
        

        if (this.mode === "local_multiplayer") {
            this.create_green_wall_button_local_multiplayer();
            this.create_orange_wall_button_local_multiplayer();     
            this.green_control_info = new UIContainer(this, this.game.config.width*0.015, this.game.config.height*0.7, "    [W]\n[A][S][D]",
            "#" + this.convert_hex_to_hex_string(game_config.green_color));
            this.green_control_info.updateTextSize(0.9);
            this.orange_control_info = new UIContainer(this, this.game.config.width*0.81, this.game.config.height*0.7, "      [↑]\n[←][↓][→]",
            "#" + this.convert_hex_to_hex_string(game_config.orange_color));
            this.orange_control_info.updateTextSize(0.9);
        } else if (this.mode === "single") {
            this.create_green_wall_button();
            if (game_config.colorblind_mode) {
                this.team_indicator = new UIContainer(this, this.game.config.width*0.045, this.game.config.height*0.15, 
                    "You're\nBLUE", "#" + this.convert_hex_to_hex_string(game_config.green_color));
            } else {
                if (this.is_tutorial) {
                    this.team_indicator = new UIContainer(this, this.game.config.width*0.02, this.game.config.height*0.47, 
                    " You're GREEN", "#" + this.convert_hex_to_hex_string(game_config.green_color));
                } else {
                    this.team_indicator = new UIContainer(this, this.game.config.width*0.045, this.game.config.height*0.15, 
                    " You're\nGREEN", "#" + this.convert_hex_to_hex_string(game_config.green_color));
                }

            }
            this.team_indicator.updateTextSize(0.7)
        } else if (this.mode === "multiplayer") {
            if (this.your_color === "green") {
                this.create_green_wall_button();
                if (game_config.colorblind_mode) {
                    this.team_indicator = new UIContainer(this, this.game.config.width*0.045, this.game.config.height*0.15, 
                    "You're\nBLUE", "#" + this.convert_hex_to_hex_string(game_config.green_color));
                } else {
                    this.team_indicator = new UIContainer(this, this.game.config.width*0.045, this.game.config.height*0.15, 
                    " You're\nGREEN", "#" + this.convert_hex_to_hex_string(game_config.green_color));
                }
            } else {
                this.create_orange_wall_button();
                this.team_indicator = new UIContainer(this, this.game.config.width*0.83, this.game.config.height*0.15, 
                "  You're\nORANGE", "#" + this.convert_hex_to_hex_string(game_config.orange_color));
            }
            this.team_indicator.updateTextSize(0.7);
        }


        this.scorebar = new ScoreBar(this, this.game.config.width*0.27, this.game.config.height*0.053, game_config.win_percentage,
        game_config.green_color, game_config.orange_color); 
        this.is_drawing = true;
    }


    create_green_wall_button() {
        this.green_wall_button = new Button(this, this.game.config.width*0.5, this.game.config.height*0.96, "button_background_dark", "button_background_hover_dark", "            ", {fontSize: this.game.config.width/30, fill: "#000"}, this.toggle_place_green_wall.bind(this));
        this.green_wall_button_text = new UIContainer(this, 0, 0, "Place Walls", "#" + this.convert_hex_to_hex_string(game_config.green_color));
        if (this.is_tutorial) {
            this.green_wall_button.x = 1000000;
        }
    }

    create_green_wall_button_local_multiplayer() {
        this.green_wall_button = new Button(this, this.game.config.width*0.35, this.game.config.height*0.96, "button_background_dark", "button_background_hover_dark", "            ", {fontSize: this.game.config.width/30, fill: "#000"}, this.toggle_place_green_wall.bind(this));
        this.green_wall_button_text = new UIContainer(this, 0, 0, "Place Walls", "#" + this.convert_hex_to_hex_string(game_config.green_color));
        if (this.is_tutorial) {
            this.green_wall_button.x = 1000000;
        }
    }

    create_orange_wall_button() {
        this.orange_wall_button = new Button(this, 0, this.game.config.height*0.96, "button_background_dark", "button_background_hover_dark", "            ", {fontSize: this.game.config.width/30}, this.toggle_place_orange_wall.bind(this));
        this.orange_wall_button.x = this.game.config.width*.5;
        
        this.orange_wall_button_text = new UIContainer(this, 0, 0, "Place Walls", "#" + this.convert_hex_to_hex_string(game_config.orange_color));
    }

    create_orange_wall_button_local_multiplayer() {
        this.orange_wall_button = new Button(this, 0, this.game.config.height*0.96, "button_background_dark", "button_background_hover_dark", "            ", {fontSize: this.game.config.width/30}, this.toggle_place_orange_wall.bind(this));
        this.orange_wall_button.x = this.game.config.width - this.orange_wall_button.text.width - this.game.config.width*0.14;
        
        this.orange_wall_button_text = new UIContainer(this, 0, 0, "Place Walls", "#" + this.convert_hex_to_hex_string(game_config.orange_color));
    }

    toggle_place_green_wall() {
        if (this.is_placing_orange_walls) {
            this.toggle_place_orange_wall();
        }
        this.is_placing_green_walls = !this.is_placing_green_walls;
        if (this.is_placing_green_walls) {
            this.green_wall_button_text.updateText("Stop Placing");
            this.green_wall_button_text.updateTextSize(0.9);
            if (this.is_tutorial && this.tutorial_step === 12) {
                this.tutorial_text.updateText("...and clicking on spaces.");
            }
        } else {
            this.green_wall_button_text.updateText("Place Walls");
            this.green_wall_button_text.updateTextSize(1);
            if (this.is_tutorial && this.tutorial_step === 12) {
                this.tutorial_text.updateText("Place temporary walls by clicking on the \"place walls\"\nbutton below...");
            }
        }
    }

    toggle_place_orange_wall() {
        if (this.is_placing_green_walls) {
            this.toggle_place_green_wall();
        }
        this.is_placing_orange_walls = !this.is_placing_orange_walls;
        if (this.is_placing_orange_walls) {
            this.orange_wall_button_text.updateText("Stop Placing");
            this.orange_wall_button_text.updateTextSize(0.9);
        } else {
            this.orange_wall_button_text.updateText("Place Walls");
            this.green_wall_button_text.updateTextSize(1);
        }
    }

    update_ui_elements(){

        if (this.green_wall_button !== undefined) {
            this.green_wall_button_text.x = this.green_wall_button.x + this.green_wall_button.width/2 - this.green_wall_button_text.text.width/2;
            this.green_wall_button_text.y = this.green_wall_button.y + this.green_wall_button.height/2 - this.green_wall_button_text.text.height/2;
        }
        if (this.orange_wall_button !== undefined) {
            this.orange_wall_button_text.x = this.orange_wall_button.x + this.orange_wall_button.width/2 - this.orange_wall_button_text.text.width/2;
            this.orange_wall_button_text.y = this.orange_wall_button.y + this.orange_wall_button.height/2 - this.orange_wall_button_text.text.height/2;
        }
        
        let green_score_short = this.green_total_value / (this.green_total_value + this.orange_total_value) * 100;
        let orange_score_short = this.orange_total_value / (this.green_total_value + this.orange_total_value) * 100;


        if (green_score_short > 0 && orange_score_short > 0) {

            var green_score_rounded;
            var orange_score_rounded;
            
            if (green_score_short >= orange_score_short) {
                green_score_rounded = Math.floor(green_score_short);
                orange_score_rounded = Math.ceil(orange_score_short);
            } else {
                green_score_rounded = Math.ceil(green_score_short);
                orange_score_rounded = Math.floor(orange_score_short);
            }
            
            this.green_score.updateText("Score: " + green_score_rounded + "%");
            this.orange_score.updateText("Score: " + orange_score_rounded + "%");
        }


        if (game_config.wall_increment % 1 === 0) {
            this.green_walls_container.updateText("Walls: " + this.green_walls_count.toFixed());
            this.orange_walls_container.updateText("Walls: " + this.orange_walls_count.toFixed());

        } else {
            this.green_walls_container.updateText("Walls: " + this.green_walls_count.toFixed(2));
            this.orange_walls_container.updateText("Walls: " + this.orange_walls_count.toFixed(2));
        }

        if (this.is_tutorial && this.green_walls_count === 99 
            && this.tutorial_step > 14 && this.tutorial_step < 20 && this.max_wall_tutorial == undefined) {
            this.max_wall_tutorial = new UIContainer(this, this.game.config.width*0.02, this.game.config.height*0.85, 
            "You can't have more\nthan 99 walls!", "#ffffff");
            this.max_wall_tutorial.updateTextSize(0.5);
            this.max_wall_tutorial.emphasize();
        }

        if ((this.green_move !== null && this.orange_move !== null) || (this.green_move === null && this.orange_move === null)) {
            this.green_player_move.updateText(this.green_move);
            this.orange_player_move.updateText(this.orange_move);
        }

        this.scorebar.update(this.green_percent);

        if (this.mode !== "single") {
            this.animate_waiting_for_move();
        }

    }

    animate_waiting_for_move() {
        this.waiting_for_move_animation_step++;
        if (this.waiting_for_move_animation_step === 50) {
            this.waiting_for_move_green.updateText("Waiting\nfor move");
            this.waiting_for_move_orange.updateText("Waiting\nfor move");
        } else if (this.waiting_for_move_animation_step === 100) {
            this.waiting_for_move_green.updateText("Waiting\nfor move.");
            this.waiting_for_move_orange.updateText("Waiting\nfor move.");
        } else if (this.waiting_for_move_animation_step === 150) {
            this.waiting_for_move_green.updateText("Waiting\nfor move..");
            this.waiting_for_move_orange.updateText("Waiting\nfor move..");
        } else if (this.waiting_for_move_animation_step === 200) {
            this.waiting_for_move_green.updateText("Waiting\nfor move...");
            this.waiting_for_move_orange.updateText("Waiting\nfor move...");
            this.waiting_for_move_animation_step = 0;
        }
    }

    update_block_totals() {
        this.green_total_value = getTotalValueOfBlocks(this.green_blocks);
        this.orange_total_value = getTotalValueOfBlocks(this.orange_blocks);
    }
    
    orange_win() {
        if (!this.ending_animation_playing) this.ending_animation_part_1(this.orange_blocks, this.green_blocks, "orange");
    }
    
    green_win() {
        if (!this.ending_animation_playing) this.ending_animation_part_1(this.green_blocks, this.orange_blocks, "green");
    }
    
    tie() {
        if (!this.ending_animation_playing) this.scene.start('TieScene');
    }
    
    start_win_loss_scene(winner) {
        this.manager.destroy();
        if (winner == "green") {
            if (this.mode == "single") {
                this.scene.start('WinScene', {player: "you"});
            } else if (this.mode == "multiplayer") {
                if (this.your_color == "green") {
                    this.scene.start('WinScene', {player: "you"});
                } else {
                    this.scene.start('LossScene', {player: "you"});
                }
            } else if (this.mode == "local_multiplayer") {
                if (game_config.colorblind_mode) {
                    this.scene.start('WinScene', {player: 'Blue'});
                } else {
                    this.scene.start('WinScene', {player: 'Green'});
                }
            }
        } else if (winner == "orange") {
            if (this.mode == "single") {    
                this.scene.start('LossScene', {player: "you"});
            } else if (this.mode == "multiplayer") {
                if (this.your_color == "orange") {
                    this.scene.start('WinScene', {player: "you"});
                } else {
                    this.scene.start('LossScene', {player: "you"});
                }
            } else if (this.mode == "local_multiplayer") {
                this.scene.start('WinScene', {player: 'Orange'});
            }
        }
    }

    ending_animation_part_1(winner_blocks, loser_blocks, winner) {
        this.ending_animation_playing = true;
        if (this.mode !== "single") {
            this.green_timer.pause();
            this.orange_timer.pause();
            if (winner === "green" && this.orange_timer.time <= 0) {
                this.orange_timer.time = 0;
                this.orange_timer.update_visuals();
            } else if (winner === "orange" && this.green_timer.time <= 0) {
                this.green_timer.time = 0;
                this.green_timer.update_visuals();
            }
            
            
        }

        this.green_blocks = [];
        this.orange_blocks = [];
        
        let duration = 1000 * loser_blocks.length;

        for (let i = 0; i < winner_blocks.length; i++) {
            this.tweens.add({
                targets: [winner_blocks[i].container],
                duration: duration,
                angle: 1200,
                ease : 'Linear',
            });
        }

        this.ending_animation_breaking_blocks(winner_blocks, loser_blocks, winner, duration / loser_blocks.length);
    }

    ending_animation_breaking_blocks(winner_blocks, loser_blocks, winner, duration) {

        if (loser_blocks.length == 0) {
            this.ending_animation_part_2(winner_blocks, winner);
            return;
        }

        let loser_block = loser_blocks.pop();
        loser_block.break_apart_animation();

        this.time.addEvent({
            delay: duration,
            callback: this.ending_animation_breaking_blocks.bind(this, winner_blocks, loser_blocks, winner, duration * 0.8),
            loop: false
        });
    }

    ending_animation_part_2(winner_blocks, winner) {
        let duration = 2000;

        // all go twords the center of the screen
        for (let i = 0; i < winner_blocks.length; i++) {
            this.tweens.add({
                targets: [winner_blocks[i].container],
                duration: duration,
                x: this.cameras.main.centerX,
                y: this.cameras.main.centerY,
                ease : 'Back.easeIn',
            });
        }
        
        this.time.addEvent({
            delay: duration,
            callback: this.ending_animation_part_3.bind(this, winner_blocks, winner),
            loop: false
        });
    }

    ending_animation_part_3(winner_blocks, winner) {
        let duration = 1500;

        // total the blocks, delete all of them, and then create a new block with the total value which grows in size
        let total_value = 0;
        for (let i = 0; i < winner_blocks.length; i++) {
            total_value += winner_blocks[i].value;
            winner_blocks[i].container.destroy();
        }

        let new_block = create_block(this, [], 0, 0, game_config[winner + "_color"], winner, game_config, total_value);
        new_block.container.x = this.cameras.main.centerX;
        new_block.container.y = this.cameras.main.centerY;
        new_block.update();
        new_block.container.setScale(0.1);
        new_block.container.setDepth(1);
        this.tweens.add({
            targets: [new_block.container],
            duration: duration,
            scaleX: 10,
            scaleY: 10,
            angle: 360,
            ease : 'Linear',
            onComplete: this.start_win_loss_scene.bind(this, winner)
        });
    }


    check_timer_wins() {
        if (this.green_timer.time <= 0 && this.orange_timer.time <= 0) {
            this.tie();
            return true;
        } else if (this.green_timer.time <= 0) {
            this.orange_win();
            return true;
        } else if (this.orange_timer.time <= 0) {
            this.green_win();
            return true;
        }
        return false;
    }

    new_win_loss(){

        // this is a special case for the map Classic2048
        if (game_config.maps[game_config.selected_map] === "Classic2048"){
            return;
        }

        if (this.check_timer_wins()) {
            return;
        }

        this.green_percent = this.green_total_value / (this.green_total_value + this.orange_total_value);
        this.orange_percent = this.orange_total_value / (this.green_total_value + this.orange_total_value);
        this.green_percent = this.green_percent * 100;
        this.orange_percent = this.orange_percent * 100;

        if (this.is_tutorial && this.tutorial_step < 25) {
            return;
        }

        if(this.green_percent >= game_config.win_percentage && this.orange_percent >= game_config.win_percentage){
            this.tie();
            return true;
        } else if(this.green_percent >= game_config.win_percentage){
            this.update_ui_elements();
            this.green_win();
            if (this.is_tutorial) {
                game_config.selected_map = 0;
                game_config.top_map_offset = 0.1;
                game_config.bottom_map_offset = 0.1;
                game_config.left_map_offset = 0.1;
                game_config.right_map_offset = 0.1;
            }
            return true;
        } else if(this.orange_percent >= game_config.win_percentage){
            this.update_ui_elements();
            this.orange_win();
            return true;
        }

    }

    check_win_loss() {

        // this is a special case for the map Classic2048
        if (game_config.maps[game_config.selected_map] === "Classic2048"){
            return;
        }

        if (this.is_tutorial && this.tutorial_step < 22) {
            return;
        }

        if (this.check_timer_wins()) {
            return true;
        }
        if(this.orange_total_value >= this.win_value && this.green_total_value >= this.win_value){
            this.tie();
            return true;
        } else if(this.orange_total_value >= this.win_value){
            this.orange_win();
            return true;
        } else if(this.green_total_value >= this.win_value){
            this.green_win();
            return true;
        }

        return false;
    }

    update_all_blocks() {
        for (let i = 0; i < this.all_block_lists.length; i++) {
            this.all_block_lists[i].update();
        }
    }

    update_is_any_block_moving() {
        this.any_block_is_moving = false;
        for (let i = 0; i < this.all_block_lists.length; i++) {
            if (this.all_block_lists[i].is_moving) {
                this.any_block_is_moving = true;
                break;
            }
        }
    }

    make_wall([x, y], team) {

        let tile = this.map.getTileAt(x, y);
        if (tile === null) {
            return false;
        }
        let index = this.map.getTileAt(x, y).index;
        if (game_config.wall_id.includes(index) || game_config.green_id.includes(index) || game_config.orange_id.includes(index)) {
            return false;
        }
        if (this[team + "_walls_count"] <= 0) {
            return false;
        }
        this.update_all_blocks_list();
        for (let i = 0; i < this.all_block_lists.length; i++) {
            if (this.all_block_lists[i].tile_x === x && this.all_block_lists[i].tile_y === y) {
                return false;
            }
        }

        if(team === "green"){
            this.map.putTileAt(game_config.green_wall, x, y);
        } else if(team === "orange"){
            this.map.putTileAt(game_config.orange_wall, x, y);
        }
        
        this["placed_" + team + "_walls"].push(this.map.getTileAt(x, y));
        this[team + "_walls_count"] --;
        if (this.mode === "multiplayer") {
            if (this.your_color === team) {
                this.manager.update_with_wall(x, y);
            }
        }
        if (this.is_tutorial) {
            if (this.tutorial_step === 12) {
                this.tutorial_step++;
                this.tutorial_text.updateText("You can place multiple walls in one turn.");
            } else if (this.tutorial_step === 19) {
                this.tutorial_step++;
            }
        }

        return true;
    }

    check_key_presses() {
        if(this.o_key.isDown){
            this.is_placing_orange_blocks = true;
            this.is_placing_green_blocks = false;
            this.is_placing_barriers = false;
            this.is_placing_background_blocks = false;
        } if(this.g_key.isDown){
            this.is_placing_orange_blocks = false;
            this.is_placing_green_blocks = true;
            this.is_placing_barriers = false;
            this.is_placing_background_blocks = false;
        } if(this.b_key.isDown){
            this.is_placing_orange_blocks = false;
            this.is_placing_green_blocks = false;
            this.is_placing_barriers = true;
            this.is_placing_background_blocks = false;
        } if(this.t_key.isDown){
            this.is_placing_orange_blocks = false;
            this.is_placing_green_blocks = false;
            this.is_placing_barriers = false;
            this.is_placing_background_blocks = true;
        } if(this.z_key.isDown){
            this.manual_block_spawn_value = 2;
        } if(this.x_key.isDown){
            this.manual_block_spawn_value = 4;
        } if(this.c_key.isDown){
            this.manual_block_spawn_value = 8;
        } if(this.r_key.isDown){
            this.scene.restart();
        } if(this.p_key.isDown){
            this.manual_block_spawn_value = null;
        } if(this.m_key.isDown){
            box_in(this, game_config.wall_id[0], game_config);
        } if(this.n_key.isDown){                                    // for now some type of set all bools to false
            this.is_placing_orange_blocks = false;
            this.is_placing_green_blocks = false;
            this.is_placing_barriers = false;
            this.is_placing_background_blocks = false;
        }
    }

    check_pointer_press() {
        if(this.pointer.isDown){            // we can now place walls with the mouse, 
            let x = this.pointer.x;         // pressing o will change it to place orange spawn blocks
            let y = this.pointer.y;         // pressing g will change it to place green spawn blocks
                                            // pressing b will change it to place barriers
            let value = game_config.wall_id[0];


            
            let values = {
                orange_bool: game_config.orange_id[0],
                green_bool: game_config.green_id[0],
                barrier_bool: game_config.wall_id[0],
                background_bool: game_config.empty_space_id[0]
            };
            
            if (this.manual_block_spawn_value === null) {
                for (let key in values) {
                    if (this[key] === true) {
                        value = values[key];
                        this.map.putTileAtWorldXY(value, x, y);
                        break;
                    }
                }
            }

            else if (this.manual_block_spawn_value !== null) {
                
                let block_list;
                let team;
                let color;
                if(this.is_placing_orange_blocks === true){
                    block_list = this.orange_blocks;
                    team = 'orange';
                    color = game_config.orange_color;
                }
                else if(this.is_placing_green_blocks === true){
                    block_list = this.green_blocks;
                    team = 'green';
                    color = game_config.green_color;
                }

                if (this.is_placing_green_blocks === true || this.is_placing_orange_blocks === true) {
                    let tile = this.map.getTileAtWorldXY(x, y);
                    if (tile === null) {
                        return;
                    }
                    // if there is no tile already at that block, then we can spawn a block
                    let should_spawn = true;
                    for (block of this.all_block_lists) {
                        if (block.tile_x === tile.x && block.tile_y === tile.y) {
                            should_spawn = false;
                            break;
                        }
                    }
                    if (should_spawn) {
                        let block = create_block(this, block_list, tile.x, tile.y, color, team, game_config, this.manual_block_spawn_value);
                    }
                }
                
            }

            for (let team of ['orange', 'green']) {
                if (this[team + '_wall_bool']) {
                    if (this.mode === "multiplayer") {
                        if (this.your_color !== team) {
                            continue;
                        }
                    }
                    let tile = this.map.getTileAtWorldXY(x, y);
                    if (tile === null) {
                        return;
                    }
                    this.make_wall([tile.x, tile.y], team);
                }
            }
        }
    }

    handle_getting_rid_of_player_placed_walls() {
        if (turn_finished(this.all_block_lists)) {
            
            // cap wall count at 99
            if (this.green_walls_count < 99) {
                this.green_walls_count += game_config.wall_increment;
                if (this.green_walls_count > 99) {
                    this.green_walls_count = 99;
                }
            }
            if (this.orange_walls_count < 99) {
                this.orange_walls_count += game_config.wall_increment;
                if (this.orange_walls_count > 99) {
                    this.orange_walls_count = 99;
                }
            }

            for( let i = 0; i < this.placed_green_walls.length; i++){
                if(this.placed_green_walls[i].index === game_config.green_wall){
                    this.placed_green_walls[i].index = game_config.empty_space_id[0];
                }
            }
            for( let i = 0; i < this.placed_orange_walls.length; i++){
                if(this.placed_orange_walls[i].index === game_config.orange_wall){
                    this.placed_orange_walls[i].index = game_config.empty_space_id[0];
                }
            }
        }
    }

    check_block_spawning() {
        if (this.is_drawing && !this.ending_animation_playing) {
            spawnblocks(this, game_config.green_id, 'green', this.green_blocks, game_config, this.seed + this.total_moves);
            spawnblocks(this, game_config.orange_id, 'orange', this.orange_blocks, game_config, this.seed + this.total_moves);
        }
    }

    handle_moving() {
        this.update_all_blocks_list();

        
        if (this.movement_started === false) {
            this.movement_started = true;
            this.error_log = this.log_block_positions(this.all_block_lists, this.green_move, this.orange_move);
            for (let i = 0; i < this.all_block_lists.length; i++) {
                this.all_block_lists[i].movement_status = 1;
            }
        }
        this.any_block_is_moving = true;
        if (!is_any_block_moving(this.all_block_lists)) {
            check_collisions(this.all_block_lists, this.green_blocks, this.orange_blocks, this.seed + this.total_moves);
            move_blocks(this.green_blocks, this.green_move);
            move_blocks(this.orange_blocks, this.orange_move);
            
        }    
        if (calculations_finished(this.all_block_lists)) {
            if (this.animations_started === false && this.is_drawing) {
                this.animations_started = true;
                // first check if any blocks have movement animations
                for (let i = 0; i < this.all_block_lists.length; i++) {
                    this.all_block_lists[i].remove_lone_bounce_animations();
                    this.all_block_lists[i].update_has_movement_animations();
                }
                // then evaluate the animations
                for (let i = 0; i < this.all_block_lists.length; i++) {
                    this.all_block_lists[i].is_moving = true;
                    this.all_block_lists[i].evaluate_animations();
                }
            }
            if (turn_finished(this.all_block_lists)) {

                this.green_moves.push(this.green_move);
                this.orange_moves.push(this.orange_move);
                // console.log(this.green_moves, this.orange_moves)

                this.total_moves ++;
                this.green_move = null;
                this.orange_move = null;
                this.movement_started = false;
                this.animations_started = false;
                for (let i = 0; i < this.all_block_lists.length; i++) {
                    if (this.all_block_lists[i].will_be_removed) {
                        remove_block(this.all_block_lists[i], this.blocks, this.green_blocks, this.orange_blocks);
                    }
                    else {
                        this.all_block_lists[i].update_visuals();
                    }
                }

                
                this.check_block_spawning();
                
                this.update_block_totals();

                if (this.is_tutorial) {
                    this.tutorial();
                }
            }
        }
    }

    is_waiting_for_input() {
        return this.green_move === null || this.orange_move === null;
    }

    animation_finished() {
        for (let i = 0; i < this.all_block_lists.length; i++) {
            if (this.all_block_lists[i].animations.length > 0) {
                return false;
            }
        }
        return true;
    }

    update_timers() {
        this.green_timer.update();
        this.orange_timer.update();
    }

    update_all_blocks_list() {
        this.all_block_lists = this.orange_blocks.concat(this.green_blocks);
    }

    remove_all_blocks() {
        let removed_block_list = [];
        for (let block of this.all_block_lists) {
            removed_block_list.push(block);
        }
        for (let block of removed_block_list) {
            remove_block(block, this.all_block_lists, this.green_blocks, this.orange_blocks);
            block.container.destroy();
        }
    }

    log_block_positions(blocks, green_move, orange_move) {
        let block_positions = [];
        for (let block of blocks) {
            block_positions.push([block.value, block.tile_x, block.tile_y, block.color, block]);
        }
        return (green_move, orange_move, block_positions);
    }

    update() {
        
        this.update_ui_elements();
        
        this.update_timers();
        
        this.update_all_blocks_list();
        
        // this is just to spawn blocks in at the start of the game
        if (!this.game_has_started) {
            this.check_block_spawning();
            this.game_has_started = true;
        }
        
        this.update_all_blocks();

        this.new_win_loss();
        
        this.update_is_any_block_moving();
        
        this.check_key_presses();
        
        this.check_pointer_press();
        
        if (this.is_tutorial && this.tutorial_step === 0) {
            this.tutorial();
        }
        
        if (!this.any_block_is_moving) {
            
            if (this.green_move !== null && this.orange_move !== null) {
                if (this.is_tutorial) {
                    if (this.tutorial_step === 12) {
                        this.orange_move = "right";
                    } else if (this.tutorial_step === 21) {
                        let seen_moves = (this.tutorial_move !== null);
                        if (seen_moves) {
                            this.green_move = this.tutorial_move;
                        }
                        if (this.green_move === 'up') {
                            this.orange_move = "left";
                        }
                        else if (this.green_move === 'down') {
                            this.orange_move = "right";
                        }
                        else if (this.green_move === 'left') {
                            this.orange_move = "up";
                        }
                        else if (this.green_move === 'right') {
                            this.orange_move = "down";
                        }
                        if (!seen_moves) {
                            this.move_info = new UIContainer(this, this.game.config.width*0.3, this.game.config.height*0.82, 
                            ("Your move: " + this.green_move + "\nOrange's move: " + this.orange_move), "#ffffff");
                            this.move_info.updateTextSize(0.9);
                            this.tutorial_move = this.green_move;
                            this.green_move = null;
                            return;
                        } else {
                            this.tutorial();
                            this.move_info.destroy();
                        }
                    } else if (this.tutorial_step === 24) {
                        if (this.green_move === 'up') {
                            this.orange_move = "right";
                        }
                        else if (this.green_move === 'down') {
                            this.orange_move = "up";
                        }
                        else if (this.green_move === 'left') {
                            this.orange_move = "down";
                        }
                        else if (this.green_move === 'right') {
                            this.orange_move = "left";
                        }
                    }
                }

                if (this.mode === 'multiplayer') {
                    this.manager.animating_started();
                }
                
                this.handle_moving();
                this.handle_getting_rid_of_player_placed_walls();
                
            }
            
            this.check_unpause_timers();
        }
    }
    
    check_unpause_timers() {
        if (this.mode === 'multiplayer') {
            if (this.green_move === null && this.orange_move === null) {
                this.manager.done_animating();
            }
            if (this.manager.opponent_is_animating) {
                return;
            }
        }

        if (this.ending_animation_playing) {
            return;
        }

        if (this.green_move === null && this.green_has_moved) {
            this.green_timer.unpause();
            this.green_timer.add_time(game_config.time_increment);
            if (this.mode !== "single") {
                this.waiting_for_move_green.x = this.game.config.width*0.01;
            }
        }
        
        if (this.orange_move === null && this.orange_has_moved)  {
            this.orange_timer.unpause();
            this.orange_timer.add_time(game_config.time_increment);
            if (this.mode !== "single") {
                this.waiting_for_move_orange.x = this.game.config.width*0.81;
            }
        }
    }

    make_green_move(move) {
        this.green_move = move;
        this.green_timer.pause();
        if (this.mode !== "single") {
            this.waiting_for_move_green.x = 1000000;
        }
        this.green_has_moved = true;
        if (this.green_control_info !== undefined && this.green_control_info !== null) {
            this.green_control_info.destroy();
            this.green_control_info = null;
        }
    }

    make_orange_move(move) {
        this.orange_move = move;
        this.orange_timer.pause();
        if (this.mode !== "single") {
            this.waiting_for_move_orange.x = 1000000;
        }
        this.orange_has_moved = true;
        if (this.orange_control_info !== undefined && this.orange_control_info !== null) {
            this.orange_control_info.destroy();
            this.orange_control_info = null;
        }
    }

    tutorial() {
        if (this.tutorial_step === 0) {
            this.scorebar.x = 1000000;
            create_block(this, this.green_blocks, 1, 1, game_config.green_color, 'green', game_config, 2);
            this.tutorial_step++;
        } else if (this.tutorial_step < 5) {
            this.tutorial_step++;
            if (this.tutorial_step === 5) {
                this.tutorial_text.updateText("All your blocks move in the\nsame direction.");
                this.remove_all_blocks();
                create_block(this, this.green_blocks, 1, 1, game_config.green_color, 'green', game_config, 2);
                create_block(this, this.green_blocks, 2, 2, game_config.green_color, 'green', game_config, 2);
            }
        } else if (this.tutorial_step === 5) {
            for (let block of this.all_block_lists) {
                if (block.value === 4) {
                    this.tutorial_text.updateText("When two of your blocks of the same\nvalue collide, they combine!");
                    if (block.tile_x === 1 && block.tile_y === 1) {
                        create_block(this, this.green_blocks, 2, 2, game_config.green_color, 'green', game_config, 4);
                    } else {
                        create_block(this, this.green_blocks, 1, 1, game_config.green_color, 'green', game_config, 4);
                    }
                    this.tutorial_step++;
                }
            }
        } else if (this.tutorial_step === 6) {
            for (let block of this.all_block_lists) {
                if (block.value === 8) {
                    this.tutorial_text.updateTextSize(0.8);
                    this.tutorial_text.updateText("When two of your blocks with different\nvalues collide, they stop each other from moving.");
                    if (block.tile_x === 1 && block.tile_y === 1) {
                        create_block(this, this.green_blocks, 2, 2, game_config.green_color, 'green', game_config, 4);
                    } else {
                        create_block(this, this.green_blocks, 1, 1, game_config.green_color, 'green', game_config, 4);
                    }
                    this.tutorial_step++;
                }
            }
        } else if (this.tutorial_step < 12) {
            this.tutorial_step++;
            if (this.tutorial_step === 12) {
                this.tutorial_text.updateText("When two blocks from different teams collide,\nthe block with the lower number is destroyed.\n",
                "(same value blocks from different teams also stop each other from moving.)");
                this.remove_all_blocks();
                create_block(this, this.green_blocks, 1, 1, game_config.green_color, 'green', game_config, 4);
                create_block(this, this.orange_blocks, 3, 3, game_config.orange_color, 'orange', game_config, 2);
            }
        } else if (this.tutorial_step === 12) {
            if (this.all_block_lists.length === 1) {
                this.green_walls_count = 99;
                this.tutorial_text.updateText("Place temporary walls by clicking\non the \"place walls\" button below...");
                this.green_wall_button.x = this.game.config.width*0.35;
            }
        } else if (this.tutorial_step < 14) {
            this.tutorial_text.updateText("Temporary walls are removed after each turn.");
            this.tutorial_step++;
        } else if (this.tutorial_step < 20) {
            if (this.tutorial_step < 20) {
                this.tutorial_step++;
            }
            if (this.tutorial_step === 15) {
                this.tutorial_text.updateText("You have a limited number of walls to place.\nYou gain one wall every turn.");
                this.green_walls_count = 0;
                this.update_ui_elements();
                this.green_walls_container.x = this.game.config.width*0.01;
            }
            this.green_walls_container.emphasize();
        } else if (this.tutorial_step === 20) {
            this.tutorial_text.updateText("Each turn, both players choose\na direction to move...");
            this.green_walls_container.x = 1000000;
            this.green_wall_button.x = 1000000;
            this.is_placing_green_walls = false;
            this.remove_all_blocks();
            if (this.max_wall_tutorial !== undefined) {
                this.max_wall_tutorial.destroy();
            }
            create_block(this, this.green_blocks, 2, 2, game_config.green_color, 'green', game_config, 4);
            create_block(this, this.orange_blocks, 2, 1, game_config.orange_color, 'orange', game_config, 2);
            create_block(this, this.orange_blocks, 1, 2, game_config.orange_color, 'orange', game_config, 2);
            create_block(this, this.orange_blocks, 3, 2, game_config.orange_color, 'orange', game_config, 2);
            create_block(this, this.orange_blocks, 2, 3, game_config.orange_color, 'orange', game_config, 2);
            this.tutorial_step++;
        } else if (this.tutorial_step === 21) {
            this.tutorial_text.updateText("...and then all blocks move at the same time.");
            this.tutorial_step++;
        } else if (this.tutorial_step === 22) {
            this.tutorial_step++;
        } else if (this.tutorial_step === 23) {
            this.scorebar.x = this.game.config.width*0.27;
            this.tutorial_text.updateText("Each player's score is based on the combined value\nof their blocks compared to their opponent.");
            this.tutorial_text.y = this.game.config.height * 0.8;
            this.tutorial_text.x = this.game.config.width * 0.05;
            this.orange_score.x = this.game.config.width - this.orange_score.text.width - this.game.config.width*0.02;
            this.green_score.x = this.game.config.width*0.005;
            this.remove_all_blocks();
            create_block(this, this.green_blocks, 1, 1, game_config.green_color, 'green', game_config, 64);
            create_block(this, this.orange_blocks, 3, 2, game_config.orange_color, 'orange', game_config, 32);
            create_block(this, this.orange_blocks, 2, 3, game_config.orange_color, 'orange', game_config, 4);
            this.update_block_totals();
            this.tutorial_step++;
        } else if (this.tutorial_step === 24) {
            this.tutorial_text.updateText("Reach " + game_config.win_percentage + "% to win!");
            this.tutorial_step++;
        }
    }
}



module.exports = {
    GameScene,
    game_config: game_config,
    block_config: block_config,
    create_block,
}