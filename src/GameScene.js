var {Timer} = require('./Timer');
var {UIContainer} = require('./UIContainer');


var {block_config} = require('./Block');
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
} = require('./game_functions');
const { Button } = require('./Button');

const game_config = {
    top_map_offset: 0.1, // percentage of screen height from top that the map is offset
    bottom_map_offset: 0.1, // percentage of screen height from bottom that the map is offset
    left_map_offset: 0.1, // percentage of screen width from left that the map is offset
    right_map_offset: 0.1, // percentage of screen width from right that the map is offset
    num_rows: 14, // reset in create
    num_cols: 14, // reset in create
    tile_size: 32, // reset in create
    padding: 3,
    orange_color: 0xf27507,
    green_color: 0x00ff00,
    wall_id: [6,262,268],
    green_id: [57, 1, 2, 3, 17, 18, 19, 33, 34, 35, 321],   // spawning area
    orange_id: [127, 7, 8, 9, 23, 24,25, 39, 40, 41], // spawning area
    empty_space_id: [15,178],
    maps: [
        'libraryfire',
        'basic',
        'halls',
        'claust',
        "Classic2048"
    ],
    selected_map: 0, // default map
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

        this.orange_walls = [];         // orange walls
        this.green_walls = [];          // green walls

        this.orange_move = null;
        this.green_move = null;

        this.movement_started = false; // used to set up movement at the start of each turn
        this.animations_started = false;

        this.blocks_moved = false;

        this.orange_bool = false;
        this.green_bool = false;
        this.barrier_bool = false;
        this.background_bool = false;

        this.is_drawing = false;

        this.manual_block_spawn_value = null;

        this.box_in_counter = 0;

        this.orange_total_value = 0;
        this.green_total_value = 0;
        this.win_value = 100;
        
        // Define a list of the keys
        this.keyList = ['W', 'A', 'S', 'D', 'UP', 'LEFT', 'DOWN', 'RIGHT', 'O', 'G', 'B', 'T', 'R', 'Z', 'X', 'C', 'P', 'M', 'L', 'K', 'N'];

        this.green_walls_count = 0;
        this.orange_walls_count = 0;
        this.green_wall_bool = false;
        this.orange_wall_bool = false;

        this.green_lock = "false";      
        this.orange_lock = "false";

        this.green_has_moved = false;
        this.orange_has_moved = false;

        this.total_moves = 0;

        this.green_moves = [];
        this.orange_moves = [];

        return this;
    }

    preload() {
        for (let map of game_config.maps) {
            this.load.tilemapTiledJSON(map, `src/assets/${map}.json`);
        }
        this.load.image('combinedmaps', 'src/assets/combinedmaps.png');
        this.load.image('tiles', 'src/assets/tiles.png');
        this.load.audio("wall_place_sound", "src/assets/wall_place_sound.mp3");
        this.load.audio("ohhaimark", "src/assets/ohhaimark.mp3");
        this.load.audio("andimdying", "src/assets/andimdying.mp3");
        this.load.audio("letsgoeathuu", "src/assets/letsgoeathuu.mp3");
        this.load.audio("ididnothither", "src/assets/ididnothither.mp3");
    }

    convert_hex_to_hex_string(num) {
        let hex_string = num.toString(16);
        while (hex_string.length < 6) {
            hex_string = '0' + hex_string;
        }
        return hex_string;
    }
    
    create() {
        
        this.is_drawing = true;
        
        this.map = this.make.tilemap({ key: game_config.maps[game_config.selected_map] });
        let tileset_name = this.map.tilesets[0].name;
        this.tileset = this.map.addTilesetImage(tileset_name, tileset_name);
        
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
            }
            this.green_timer = dummy;
            this.orange_timer = dummy;
        } else {
            this.green_timer = new Timer(this, this.game.config.width*0.3, this.game.config.height*0.02, 120000, "#" + this.convert_hex_to_hex_string(game_config.green_color));
            this.orange_timer = new Timer(this, 0, this.game.config.height*0.02, 120000, "#" + this.convert_hex_to_hex_string(game_config.orange_color));
            this.orange_timer.x = this.game.config.width - this.orange_timer.text.width - this.game.config.width*0.3;
        }

        this.green_score = new UIContainer(this, this.game.config.width*0.01, this.game.config.height*0.02, "Score: " + this.green_total_value, "#" + this.convert_hex_to_hex_string(game_config.green_color));
        this.orange_score = new UIContainer(this, 0, this.game.config.height*0.02, "Score: 00" + this.orange_total_value, "#" + this.convert_hex_to_hex_string(game_config.orange_color));
        this.orange_score.x = this.game.config.width - this.orange_score.text.width - this.game.config.width*0.01;


        this.green_walls_container = new UIContainer(this, this.game.config.width*0.01, this.game.config.height*0.93, "Walls: " + this.green_walls_count, "#" + this.convert_hex_to_hex_string(game_config.green_color));
        this.orange_walls_container = new UIContainer(this, 0, this.game.config.height*0.93, "Walls: 00" + this.orange_walls_count, "#" + this.convert_hex_to_hex_string(game_config.orange_color));
        this.orange_walls_container.x = this.game.config.width - this.orange_walls_container.text.width - this.game.config.width*0.01;

        this.green_player_move = new UIContainer(this, this.game.config.width*0.3, this.game.config.height*0.5, null, "#" + this.convert_hex_to_hex_string(game_config.green_color));
        this.orange_player_move = new UIContainer(this, this.game.config.width*0.7, this.game.config.height*0.5, null, "#" + this.convert_hex_to_hex_string(game_config.orange_color));

        if (this.mode === "local_multiplayer") {
            this.create_green_wall_button();
            this.create_orange_wall_button();     
        } else if (this.mode === "single") {
            this.create_green_wall_button();
        } else if (this.mode === "multiplayer") {
            if (this.your_color === "green") {
                this.create_green_wall_button();
            } else {
                this.create_orange_wall_button();
            }
        }
    }

    ididnothitherplay() {
        let ididnothither = this.sound.add('ididnothither', {volume: 0.02});
        ididnothither.play();
    }

    letsgoeathuuplay() {
        let letsgoeathuuplay = this.sound.add('letsgoeathuu', {volume: 0.2});
        letsgoeathuuplay.play();
    }

    andimdyingplay() {
        let imdying = this.sound.add('andimdying', {volume: 0.7});
        imdying.play();
    }

    wall_place_sound_play() {
        let wall_place_sound = this.sound.add("wall_place_sound", {volume: 0.2});
        wall_place_sound.play();
    }

    ohhaimarkplay() {
        let ohhaimark = this.sound.add('ohhaimark');
        ohhaimark.play();
    }

    create_green_wall_button() {
        this.green_wall_button = new Button(this, this.game.config.width*0.35, this.game.config.height*0.96, "button_background_dark", "button_background_hover_dark", "            ", {fontSize: this.game.config.width/30, fill: "#000"}, this.toggle_place_green_wall.bind(this));
        this.green_wall_button_text = new UIContainer(this, 0, 0, "Place Walls", "#" + this.convert_hex_to_hex_string(game_config.green_color));
    }

    create_orange_wall_button() {
        this.orange_wall_button = new Button(this, 0, this.game.config.height*0.96, "button_background_dark", "button_background_hover_dark", "            ", {fontSize: this.game.config.width/30}, this.toggle_place_orange_wall.bind(this));
        this.orange_wall_button.x = this.game.config.width - this.orange_wall_button.text.width - this.game.config.width*0.14;
        
        this.orange_wall_button_text = new UIContainer(this, 0, 0, "Place Walls", "#" + this.convert_hex_to_hex_string(game_config.orange_color));
    }

    toggle_place_green_wall() {
        if (this.orange_wall_bool) {
            this.toggle_place_orange_wall();
        }
        this.green_wall_bool = !this.green_wall_bool;
        if (this.green_wall_bool) {
            this.green_wall_button_text.updateText("Untoggle");
        } else {
            this.green_wall_button_text.updateText("Place Walls");
        }
    }

    toggle_place_orange_wall() {
        if (this.green_wall_bool) {
            this.toggle_place_green_wall();
        }
        this.orange_wall_bool = !this.orange_wall_bool;
        if (this.orange_wall_bool) {
            this.orange_wall_button_text.updateText("Untoggle");
        } else {
            this.orange_wall_button_text.updateText("Place Walls");
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
            
        this.green_score.updateText("Score: " + this.green_total_value);
        this.orange_score.updateText("Score: " + this.orange_total_value);

        this.green_walls_container.updateText("Walls: " + this.green_walls_count);
        this.orange_walls_container.updateText("Walls: " + this.orange_walls_count);

        if ((this.green_move !== null && this.orange_move !== null) || (this.green_move === null && this.orange_move === null)) {
            this.green_player_move.updateText(this.green_move);
            this.orange_player_move.updateText(this.orange_move);
        }

    }

    update_block_totals() {
        this.green_total_value = getTotalValueOfBlocks(this.green_blocks);
        this.orange_total_value = getTotalValueOfBlocks(this.orange_blocks);
    } 

    check_win_loss() {

        // this is a special case for the map Classic2048
        if (game_config.maps[game_config.selected_map] === "Classic2048"){
            return;
        }

        // check tie
        if(this.orange_total_value >= this.win_value && this.green_total_value >= this.win_value || this.green_timer.time <= 0 && this.orange_timer.time <= 0){
            this.scene.start('TieScene');
            return true;
            
            // check orange win
        } else if(this.orange_total_value >= this.win_value || this.green_timer.time <= 0){
            
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
            return true;

        // check green win
        } else if(this.green_total_value >= this.win_value || this.orange_timer.time <= 0){
        
            if (this.mode == "single") {
                this.scene.start('WinScene', {player: "you"});
            } else if (this.mode == "multiplayer") {
                if (this.your_color == "green") {
                    this.scene.start('WinScene', {player: "you"});
                } else {
                    this.scene.start('LossScene', {player: "you"});
                }
            } else if (this.mode == "local_multiplayer") {
                this.scene.start('WinScene', {player: 'Green'});
            }
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
        this.wall_place_sound_play();
        this.map.putTileAt(game_config.wall_id[0], x, y);
        this[team + "_walls"].push(this.map.getTileAt(x, y));
        this[team + "_walls_count"] --;
        console.log(this.mode)
        if (this.mode === "multiplayer") {
            console.log("sending wall1")
            if (this.your_color === team) {
                this.manager.update_with_wall(x, y);
                console.log("sending wall2");
            }
        }
    }

    check_key_presses() {
        if(this.o_key.isDown){
            this.orange_bool = true;
            this.green_bool = false;
            this.barrier_bool = false;
            this.background_bool = false;
        } if(this.g_key.isDown){
            this.orange_bool = false;
            this.green_bool = true;
            this.barrier_bool = false;
            this.background_bool = false;
        } if(this.b_key.isDown){
            this.orange_bool = false;
            this.green_bool = false;
            this.barrier_bool = true;
            this.background_bool = false;
        } if(this.t_key.isDown){
            this.orange_bool = false;
            this.green_bool = false;
            this.barrier_bool = false;
            this.background_bool = true;
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
            this.orange_bool = false;
            this.green_bool = false;
            this.barrier_bool = false;
            this.background_bool = false;
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
                if(this.orange_bool === true){
                    block_list = this.orange_blocks;
                    team = 'orange';
                    color = game_config.orange_color;
                }
                else if(this.green_bool === true){
                    block_list = this.green_blocks;
                    team = 'green';
                    color = game_config.green_color;
                }

                if (this.green_bool === true || this.orange_bool === true) {
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
                    if (this[team + '_walls_count'] > 0) {
                        let tile = this.map.getTileAtWorldXY(x, y);
                        if (tile !== null) {
                            let index = this.map.getTileAtWorldXY(x, y).index;
                            if (!game_config.wall_id.includes(index) && !game_config.green_id.includes(index) && !game_config.orange_id.includes(index)) {
                                if (this.mode === "multiplayer") {
                                    console.log("sending wall3", team, this.your_color)
                                    if (this.your_color !== team) {
                                        continue;
                                    }
                                }
                                let tile = this.map.getTileAtWorldXY(x, y)
                                this.make_wall([tile.x, tile.y], team);
                            }
                        }
                    }
                }
            }
        }
    }

    handle_getting_rid_of_player_placed_walls() {
        if (turn_finished(this.all_block_lists)) {
            
            // cap wall count at 99
            if (this.green_walls_count < 99) {
                this.green_walls_count ++;
            }
            if (this.orange_walls_count < 99) {
                this.orange_walls_count ++;
            }

            for( let i = 0; i < this.green_walls.length; i++){
                if(this.green_walls[i].index === game_config.wall_id[0]){
                    this.green_walls[i].index = game_config.empty_space_id[0];
                }
            }
            for( let i = 0; i < this.orange_walls.length; i++){
                if(this.orange_walls[i].index === game_config.wall_id[0]){
                    this.orange_walls[i].index = game_config.empty_space_id[0];
                }
            }
        }
    }

    check_block_spawning() {
        if (this.is_drawing) {
            spawnblocks(this, game_config.green_id, 'green', this.green_blocks, game_config, this.seed + this.total_moves);
            spawnblocks(this, game_config.orange_id, 'orange', this.orange_blocks, game_config, this.seed + this.total_moves);
        }
    }

    handle_moving() {
        this.update_all_blocks_list();

        
        if (this.movement_started === false) {
            this.movement_started = true;
            this.error_log = this.log_block_positions(this.all_block_lists, this.green_move, this.orange_move)
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
            if (this.animations_started === false) {
                this.animations_started = true;
                for (let i = 0; i < this.all_block_lists.length; i++) {
                    this.all_block_lists[i].is_moving = true;
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
                        remove_block(this.all_block_lists[i], this.blocks, this.green_blocks, this.orange_blocks)
                    }
                    else {
                        this.all_block_lists[i].update_visuals();
                    }
                }

                
                this.check_block_spawning();
                
                this.update_block_totals();
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

    log_block_positions(blocks, green_move, orange_move) {
        let block_positions = []
        for (let block of blocks) {
            block_positions.push([block.value, block.tile_x, block.tile_y, block.color, block])
        }
        return (green_move, orange_move, block_positions);
    }

    update() {
        
        this.update_ui_elements();
        
        this.update_timers();
        
        this.update_all_blocks_list();
        
        this.check_win_loss();
        
        // this is just to spawn blocks in at the start of the game (it shouldnt do anything else)
        if (this.all_block_lists.length === 0) {
            this.check_block_spawning();
        }
        
        this.update_all_blocks();
        
        this.update_is_any_block_moving();
        
        this.check_key_presses();
        
        this.check_pointer_press();
        
        
        if (!this.any_block_is_moving) {
            
            if (this.green_move !== null && this.orange_move !== null) {

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

        if (this.green_move === null && this.green_has_moved) {
            this.green_timer.unpause();
        }
        
        if (this.orange_move === null && this.orange_has_moved)  {
            this.orange_timer.unpause();
        }
    }

    make_green_move(move) {
        this.green_move = move;
        this.green_timer.pause();
        this.green_has_moved = true;
    }

    make_orange_move(move) {
        this.orange_move = move;
        this.orange_timer.pause();
        this.orange_has_moved = true;
    }

}



module.exports = {
    GameScene,
    game_config: game_config,
    block_config: block_config,
    create_block,
}