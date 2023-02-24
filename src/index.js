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

}

function preload() {

    this.load.tilemapTiledJSON('tilemap', 'src/assets/basic.json');
    this.load.image('tiles', 'src/assets/tiles.png');

}

function create() {

    this.blocks = [];               // all blocks
    this.orange_blocks = [];        // orange blocks            
    this.green_blocks = [];         // green blocks

    this.orange_move = null;
    this.green_move = null;

    this.block_spawn_counter = 0;   // used to spawn blocks

    this.w_key = this.input.keyboard.addKey('W');
    this.a_key = this.input.keyboard.addKey('A');
    this.s_key = this.input.keyboard.addKey('S');
    this.d_key = this.input.keyboard.addKey('D');

    this.up_key = this.input.keyboard.addKey('UP');
    this.left_key = this.input.keyboard.addKey('LEFT');
    this.down_key = this.input.keyboard.addKey('DOWN');
    this.right_key = this.input.keyboard.addKey('RIGHT');


    this.map = this.make.tilemap({ key: 'tilemap' });
	this.tileset = this.map.addTilesetImage('tiles', 'tiles');
    // this.tileset.setTileSize(game_config.tile_size, game_config.tile_size);
	this.map.createStaticLayer('Tile Layer 1', this.tileset);
    // this.map.setBaseTileSize(game_config.tile_size, game_config.tile_size);
}

function update() {

    let all_block_lists = this.orange_blocks.concat(this.green_blocks);

    for (let i = 0; i < all_block_lists.length; i++) {
        all_block_lists[i].update();
    }

    let any_block_is_moving = false;
    for (let i = 0; i < all_block_lists.length; i++) {
        if (all_block_lists[i].is_moving) {
            any_block_is_moving = true;
            break;
        }
    }

    // TODO combine these two
    if (!any_block_is_moving) {
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
            move_blocks(this.green_blocks, this.green_move);
            move_blocks(this.orange_blocks, this.orange_move);
            this.green_move = null;
            this.orange_move = null;
        }
        if(this.block_spawn_counter === 0 && this.green_move === null && this.orange_move === null){
            spawnblocks(this, block_config.green_id, 'green', this.green_blocks);
            spawnblocks(this, block_config.orange_id, 'orange', this.orange_blocks);
            this.block_spawn_counter ++;
        }
    }
}

///////////////////////////////////
var game = new Phaser.Game(config);
///////////////////////////////////

function move_blocks(blocks, direction) {
    for (let i = 0; i < blocks.length; i++) {
        blocks[i].go_direction(direction);
    }
}

function create_tile(game, x, y, color, team) {
    const coords = convert_tile_to_world(x, y);
    const tile = new Block(game, coords.x, coords.y, [], color, game_config.tile_size - (game_config.padding * 2), game_config.padding, team);
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
