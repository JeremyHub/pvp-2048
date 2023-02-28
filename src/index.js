import Phaser from 'phaser';
import {Block, block_config} from './block.js';


const game_config = {
    num_rows: 20,
    num_cols: 20,
    tile_size: 32, // currently this must match the size of the tiles in the tileset
    padding: 3,
};

const config = {
    type: Phaser.AUTO,
    width: game_config.num_cols * game_config.tile_size,
    height: game_config.num_rows * game_config.tile_size,
    backgroundColor: '#000000',
    parent: 'game',
    pixelArt: true,
    scene: {
        constructor: constructor,
        init: init,
        preload: preload,
        create: create,
        update: update,
    }
};

function constructor(game) {
}

function init() {

    this.blocks = [];               // all blocks
    this.orange_blocks = [];        // orange blocks            
    this.green_blocks = [];         // green blocks

    this.orange_move = null;
    this.green_move = null;

    this.block_spawn_counter = 0;   // used to spawn blocks

    this.movement_started = false; // used to set up movement at the start of each turn

    this.w_key = this.input.keyboard.addKey('W');
    this.a_key = this.input.keyboard.addKey('A');
    this.s_key = this.input.keyboard.addKey('S');
    this.d_key = this.input.keyboard.addKey('D');

    this.up_key = this.input.keyboard.addKey('UP');
    this.left_key = this.input.keyboard.addKey('LEFT');
    this.down_key = this.input.keyboard.addKey('DOWN');
    this.right_key = this.input.keyboard.addKey('RIGHT');

    this.timer = 0;
    this.blocks_moved = false;
}

function preload() {

    this.load.tilemapTiledJSON('tilemap', 'src/assets/basic.json');
    this.load.image('tiles', 'src/assets/tiles.png');
    this.load.audio("bounce_sound", "src/assets/bounceSound.mp3");     


}

function create() {

    this.map = this.make.tilemap({ key: 'tilemap' });
	this.tileset = this.map.addTilesetImage('tiles', 'tiles');
    // this.tileset.setTileSize(game_config.tile_size, game_config.tile_size);
	this.map.createStaticLayer('Tile Layer 1', this.tileset);
    // this.map.setBaseTileSize(game_config.tile_size, game_config.tile_size);

    this.bounceSOUND = this.sound.add("bounce_sound");     
    this.bounceSOUND.play();      
    

}

function update() {
    let all_block_lists = this.orange_blocks.concat(this.green_blocks);

    for (let i = 0; i < all_block_lists.length; i++) {
        all_block_lists[i].update();
    }

    let any_block_is_moving = false;
    for (let i = 0; i < all_block_lists.length; i++) {
        if (all_block_lists[i].is_moving) {
            this.any_block_is_moving = true;
            break;
        }
    }


    // TODO combine these
    if (!any_block_is_moving) {
        if(this.block_spawn_counter === 0 && this.green_move === null && this.orange_move === null){
            spawnblocks(this, block_config.green_id, 'green', this.green_blocks);
            spawnblocks(this, block_config.orange_id, 'orange', this.orange_blocks);
            this.block_spawn_counter ++;
        }
        if (this.green_move === null) {
            if (this.w_key.isDown) {
                this.green_move = 'up';
                this.block_spawn_counter = 0;
            }
            else if (this.a_key.isDown) {
                this.green_move = 'left';
                this.block_spawn_counter = 0;
            }
            else if (this.s_key.isDown) {
                this.green_move = 'down';
                this.block_spawn_counter = 0;
            }
            else if (this.d_key.isDown) {
                this.green_move = 'right';
                this.block_spawn_counter = 0;
            }
        }
        if (this.orange_move === null) {
            if (this.up_key.isDown) {
                this.orange_move = 'up';
                this.block_spawn_counter = 0;
            }
            else if (this.left_key.isDown) {
                this.orange_move = 'left';
                this.block_spawn_counter = 0;
            }
            else if (this.down_key.isDown) {
                this.orange_move = 'down';
                this.block_spawn_counter = 0;
            }
            else if (this.right_key.isDown) {
                this.orange_move = 'right';
                this.block_spawn_counter = 0;
            }
        }
        if (this.green_move !== null && this.orange_move !== null) {
            if (this.movement_started === false) {
                this.movement_started = true;
                for (let i = 0; i < all_block_lists.length; i++) {
                    all_block_lists[i].movement_status = 1;
                }
            }
            if (!is_any_block_moving(all_block_lists)) {
                check_collisions(all_block_lists, this.green_blocks, this.orange_blocks);
                move_blocks(this.green_blocks, this.green_move);
                move_blocks(this.orange_blocks, this.orange_move);
            }    
            if (turn_finished(all_block_lists)) {
                this.green_move = null;
                this.orange_move = null;
                this.movement_started = false;
            }
            
        }
    }
}

///////////////////////////////////
var game = new Phaser.Game(config);
///////////////////////////////////

/**
 * Checks if all of the given blocks have finished moving for the turn.
 * @param {*} blocks 
 * @returns 
 */
function turn_finished(blocks) {
    for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].movement_status !== 0) {
            return false;
        }
    }
    return true;
}

/**
 * Moves the given list of blocks one space in the given direction.
 * @param {*} blocks The list of blocks that will move.
 * @param {*} direction The direction the blocks will move in.
 */
function move_blocks(blocks, direction) {
    for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].movement_status === 1) {
            blocks[i].move_space(direction);
        }
    }
}

/**
 * Checks if any block from the given list is currently moving.
 * @param {*} blocks 
 * @returns true if any block is moving, false if not.
 */
function is_any_block_moving(blocks) {
    if (blocks.length === 0) {
        return false;
    }
    for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].movement_status === 2 || blocks[i].is_moving) {
            return true;
        }
    }
    return false;
}

/**
 * Checks if any blocks within the given list of blocks are on the same space, and if so resolves the collision.
 * @param {*} blocks 
 */
function check_collisions(blocks, green_blocks, orange_blocks) {
    let should_recheck_collision = false;
    let other_block = null;
    for (let green_block of green_blocks) {
        // this checks if two adjacent blocks are moving towards eachother
        other_block = green_block.passed_block(green_block.moving_direction, orange_blocks)
        // TODO currently it only checks for enemy blocks, since all blocks on the same team move the same direction
        if (other_block !== null) {
            if (!evaluate_collision([green_block, other_block], blocks, green_blocks, orange_blocks)) {
                should_recheck_collision = true;
            }
        }
    }
    let blocks_on_each_tile = {};
    for (let i = 0; i < blocks.length; i++) {
        if (blocks_on_each_tile[blocks[i].tile_x + "" + blocks[i].tile_y] === undefined) {
            blocks_on_each_tile[blocks[i].tile_x + "" + blocks[i].tile_y] = [blocks[i]];
        }
        else {
            blocks_on_each_tile[blocks[i].tile_x + "" + blocks[i].tile_y].push(blocks[i]);
        }
    }
    
    for (let tile in blocks_on_each_tile) {
        if (blocks_on_each_tile[tile].length > 1) {
            if (!evaluate_collision(blocks_on_each_tile[tile], blocks, green_blocks, orange_blocks)) {
                should_recheck_collision = true;
            }
        }
    }
    if (should_recheck_collision) {
        // it's possible that a block bounces into another block, so if a block bounces collision needs to be checked again
        check_collisions(blocks, green_blocks, orange_blocks);
    }
}

/**
 * Handles collision movment/destruction between two blocks. 
 * Returns true if the collision is valid, meaning that one of the blocks stays on the space while the other is removed.
 * @param {*} first_block 
 * @param {*} second_block 
 */
function evaluate_collision(colliding_blocks, blocks, green_blocks, orange_blocks) {
    // TODO dont hardcode the names of the teams

    // sort the blocks into two lists by team
    console.log(colliding_blocks);
    let green_colliding_blocks = [];
    let orange_colliding_blocks = [];
    for (let block of colliding_blocks) {
        if (block.team === "green") {
            green_colliding_blocks.push(block);
        }
        else {
            orange_colliding_blocks.push(block);
        }
    }
    
    // sort the blocks by value, so that the block with the lower value is first
    green_colliding_blocks.sort((a, b) => a.value - b.value);
    orange_colliding_blocks.sort((a, b) => a.value - b.value);

    // TODO the team who moved first should combine first
    // randomize which team moves first
    let first_team = Math.random() < 0.5 ? "green" : "orange";

    let first_team_blocks = first_team === "green" ? green_colliding_blocks : orange_colliding_blocks;
    let second_team_blocks = first_team === "orange" ? green_colliding_blocks : orange_colliding_blocks;

    // check for combinations for teams in order
    for (let team_colliding_blocks of [first_team_blocks, second_team_blocks]){
        for (let i = 0; i < team_colliding_blocks.length; i++) {
            for (let j = i + 1; j < team_colliding_blocks.length; j++) {
                if (team_colliding_blocks[i].value === team_colliding_blocks[j].value) {
                    // valid friendly collision, merge blocks
                    team_colliding_blocks[i].value = team_colliding_blocks[i].value * 2;
                    remove_block(team_colliding_blocks[j], blocks, green_blocks, orange_blocks);
                    team_colliding_blocks[i].movement_status = 0;
                    // after a valid collision, the block should stop moving
                    return true;
                }
            }
        }
    }

    // check for collisions between teams
    for (let i = 0; i < first_team_blocks.length; i++) {
        for (let j = 0; j < second_team_blocks.length; j++) {
            if (first_team_blocks[i].value !== second_team_blocks[j].value) {
                // valid enemy collision, one block should be destroyed
                if (first_team_blocks[i].value > second_team_blocks[j].value) {
                    remove_block(second_team_blocks[j], blocks, green_blocks, orange_blocks);
                    first_team_blocks[i].movement_status = 0;
                    // after a valid collision, the block should stop moving
                    return true;
                }
                else {
                    remove_block(first_team_blocks[i], blocks, green_blocks, orange_blocks);
                    second_team_blocks[j].movement_status = 0;
                    // after a valid collision, the block should stop moving
                    return true;
                }
            }
        }
    }

    // any block that has not been effected by a collision should bounce
    for (let block of colliding_blocks) {
        block.bounce();
    }
    return false;
}

/**
 * Removes the specified block from the lists of blocks and canvas.
 * @param {*} block The block that will be removed from the lists/canvas.
 * @param {*} blocks The list of all blocks currently being used in the game. 
 * @param {*} orange_blocks The list of all orange blocks currently being used.
 * @param {*} green_blocks The list of all green blocks currently being used.
 */
function remove_block(block, blocks, green_blocks, orange_blocks) {
    blocks.splice(blocks.indexOf(block), 1)
    if (block.team === 'green') {
        green_blocks.splice(green_blocks.indexOf(block), 1);
    }
    else if (block.team === 'orange') {
        orange_blocks.splice(orange_blocks.indexOf(block), 1);
    }
    block.remove();
    // removes the block from the canvas
}

function create_tile(game, x, y, color, team) {
    const coords = convert_tile_to_world(x, y);
    const tile = new Block(game, coords.x, coords.y, [], color, game_config.tile_size - (game_config.padding * 2), game_config.padding, team, 2, x, y, Math.random());
    return tile;
}

function convert_tile_to_world(tile_x, tile_y) {
    return {
        x: (tile_x * game_config.tile_size) + (game_config.tile_size / 2),
        y: (tile_y * game_config.tile_size) + (game_config.tile_size / 2)
    }
}

function block_in_tile(x, y, game, list_of_blocks) {
    const origin_tile = game.map.getTileAt(x, y);
    for (let i = 0; i < list_of_blocks.length; i++) {
        const tile = game.map.getTileAtWorldXY(list_of_blocks[i].x, list_of_blocks[i].y)
        if (tile.x === origin_tile.x && tile.y === origin_tile.y) {
            return true;
        }
    }
    return false;
}


function spawnblocks(game, spawnarea, team, list_of_blocks) {

    let color;
    if (team === 'green') {
        color = 0x00ff00;
    }
    else if (team === 'orange') {
        color = 0xffa500;
    }

    let spawnable_tiles = [];
    for (let x = 0; x < game_config.num_cols; x++) {
        for (let y = 0; y < game_config.num_rows; y++) {
            const tile = game.map.getTileAt(x, y);
            if (game.map.layer.data[tile.y][tile.x].index !== spawnarea || (block_in_tile(x, y, game, game.orange_blocks) || block_in_tile(x, y, game, game.green_blocks))) {
                continue;
            }
            spawnable_tiles.push({x: x, y: y});
        }
    }

    if (spawnable_tiles.length === 0) {
        return;
    }

    const spawn_tile = spawnable_tiles[Math.floor(Math.random() * spawnable_tiles.length)];
    list_of_blocks.push(create_tile(game, spawn_tile.x, spawn_tile.y, color, team));

    
}


