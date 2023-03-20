var {block_config} = require('./block');
var {
    removePlayerWalls,
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

const game_config = {
    num_rows: 14,
    num_cols: 14,
    tile_size: 32, // currently this must match the size of the tiles in the tileset
    padding: 3,
    orange_color: 0xffa500,
    green_color: 0x00ff00,
    wall_id: [6,262],
    green_id: [57, 1, 2, 3, 17, 18, 19, 33, 34, 35],   // spawning area
    orange_id: [127, 7, 8, 9, 23, 24,25, 39, 40, 41], // spawning area
    empty_space_id: [15,178],
};

class GameScene extends Phaser.Scene {

constructor() {
    super({key: 'GameScene'});
}

init() {

    this.blocks = [];               // all blocks
    this.orange_blocks = [];        // orange blocks            
    this.green_blocks = [];         // green blocks

    this.orange_walls = [];         // orange walls
    this.green_walls = [];          // green walls

    this.orange_move = null;
    this.green_move = null;

    this.block_spawn_counter = 0;   // used to spawn blocks

    this.movement_started = false; // used to set up movement at the start of each turn
    this.animations_started = false;

    this.timer = 0;
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


    return this;
}

preload() {

    this.load.tilemapTiledJSON('tilemap', 'src/assets/libraryfire.json');
    this.load.image('tiles', 'src/assets/tiles.png');
    this.load.audio("bounce_sound", "src/assets/bounceSound.mp3");     

}

create() {

    this.is_drawing = true;

    this.map = this.make.tilemap({ key: 'tilemap' });
    this.tileset = this.map.addTilesetImage('tiles', 'tiles');
    // this.tileset.setTileSize(game_config.tile_size, game_config.tile_size);
    this.map.createLayer('Tile Layer 1', this.tileset);
    // this.map.setBaseTileSize(game_config.tile_size, game_config.tile_size);

    this.bounceSOUND = this.sound.add("bounce_sound");     
    this.bounceSOUND.play();      

    this.pointer = this.input.activePointer;

    // Loop through the keyList and add each key to the input.keyboard using a template literal
    for (let key of this.keyList) {
    this[`${key.toLowerCase()}_key`] = this.input.keyboard.addKey(key);
    }

}

update() {
    let all_block_lists = this.orange_blocks.concat(this.green_blocks);
    

    let dom_element = document.getElementById("orange-total-value");
    dom_element.innerHTML = getTotalValueOfBlocks(this.orange_blocks);

    dom_element = document.getElementById("green-total-value");
    dom_element.innerHTML = getTotalValueOfBlocks(this.green_blocks);

    dom_element = document.getElementById("orange-walls");
    dom_element.innerHTML = this.orange_walls_count;

    dom_element = document.getElementById("green-walls");
    dom_element.innerHTML = this.green_walls_count;


    // combine these into one function somehwere else? maybe in game_functions.js
    if(getTotalValueOfBlocks(this.orange_blocks) > this.win_value){

        this.scene.start('WinScene', {winner: 'Orange'});
        return;

    } else if(getTotalValueOfBlocks(this.green_blocks) > this.win_value){
    
        this.scene.start('WinScene', {winner: 'Green'});
        return;
    }


    for (let i = 0; i < all_block_lists.length; i++) {
        all_block_lists[i].update();
    }

    this.any_block_is_moving = false;
    for (let i = 0; i < all_block_lists.length; i++) {
        if (all_block_lists[i].is_moving) {
            this.any_block_is_moving = true;
            break;
        }
    }

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
    } if(this.l_key.isDown){
        this.orange_wall_bool = true;
        this.green_wall_bool = false;
    } if(this.k_key.isDown){
        this.orange_wall_bool = false;
        this.green_wall_bool = true;
    } 

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
                // if there is no tile already at that block, then we can spawn a block
                let should_spawn = true;
                for (block of all_block_lists) {
                    if (block.tile_x === tile.x && block.tile_y === tile.y) {
                        should_spawn = false;
                        break;
                    }
                }
                if (should_spawn) {
                    let block = create_block(this, block_list, tile.x, tile.y, color, team, game_config);
                    block.value = this.manual_block_spawn_value;
                }
            }
            
        }

        // this can be condensed
        if(this.green_wall_bool === true && this.green_walls_count > 0 && (this.map.getTileAtWorldXY(x, y).index !== game_config.wall_id[0] && this.map.getTileAtWorldXY(x, y).index !== game_config.green_id[0] && this.map.getTileAtWorldXY(x, y).index !== game_config.orange_id[0])){
            this.map.putTileAtWorldXY(game_config.wall_id[0], x, y);
            this.green_walls.push(this.map.getTileAtWorldXY(x, y));
            this.green_walls_count --;
        }
        if(this.orange_wall_bool === true && this.orange_walls_count > 0 && (this.map.getTileAtWorldXY(x, y).index !== game_config.wall_id[0] && this.map.getTileAtWorldXY(x, y).index !== game_config.green_id[0] && this.map.getTileAtWorldXY(x, y).index !== game_config.orange_id[0])){
            this.map.putTileAtWorldXY(game_config.wall_id[0], x, y);
            this.orange_walls.push(this.map.getTileAtWorldXY(x, y));
            this.orange_walls_count --;
        }
        
    }

    // TODO combine these
    if (!this.any_block_is_moving) {
        if(this.block_spawn_counter === 0 && this.green_move === null && this.orange_move === null){
            // dont spawn blocks when testing
            if (this.is_drawing) {
                spawnblocks(this, game_config.green_id, 'green', this.green_blocks, game_config);
                spawnblocks(this, game_config.orange_id, 'orange', this.orange_blocks, game_config);
                this.block_spawn_counter ++;
            }
        }
        if (this.green_move !== null || this.orange_move !== null) {
            this.block_spawn_counter = 0;
        }
        if (this.green_move !== null && this.orange_move !== null) {
            if (this.movement_started === false) {
                this.movement_started = true;
                for (let i = 0; i < all_block_lists.length; i++) {
                    all_block_lists[i].movement_status = 1;
                }
            }
            this.any_block_is_moving = true;
            if (!is_any_block_moving(all_block_lists)) {
                check_collisions(all_block_lists, this.green_blocks, this.orange_blocks);
                move_blocks(this.green_blocks, this.green_move);
                move_blocks(this.orange_blocks, this.orange_move);

            }    
            if (calculations_finished(all_block_lists)) {
                if (this.animations_started === false) {
                    this.animations_started = true;
                    for (let i = 0; i < all_block_lists.length; i++) {
                        all_block_lists[i].is_moving = true;
                    }
                }
                if (turn_finished(all_block_lists)) {
                    this.green_move = null;
                    this.orange_move = null;
                    this.movement_started = false;
                    this.animations_started = false;
                    for (let i = 0; i < all_block_lists.length; i++) {
                        if (all_block_lists[i].will_be_removed) {
                            remove_block(all_block_lists[i], this.blocks, this.green_blocks, this.orange_blocks)
                        }
                        else {
                            all_block_lists[i].update_visuals();
                        }
                        
                    }
                }
            }    
            if (turn_finished(all_block_lists)) {
                this.green_move = null;
                this.orange_move = null;
                this.movement_started = false;
                this.green_walls_count ++;
                this.orange_walls_count ++;


                // PUT THIS IN A FUNCTION SOMEWHERE ELSE! I was having trouble with it - Zane

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
    }
}
}

module.exports = {
    GameScene,
    game_config: game_config,
    block_config: block_config,
    create_block,
}