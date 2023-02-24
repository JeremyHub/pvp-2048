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

    this.blocks = [];
    this.block_spawn_counter = 0;

    this.w_key = this.input.keyboard.addKey('W');
    this.a_key = this.input.keyboard.addKey('A');
    this.s_key = this.input.keyboard.addKey('S');
    this.d_key = this.input.keyboard.addKey('D');

    this.map = this.make.tilemap({ key: 'tilemap' });
	this.tileset = this.map.addTilesetImage('tiles', 'tiles');
    // this.tileset.setTileSize(game_config.tile_size, game_config.tile_size);
	this.map.createStaticLayer('Tile Layer 1', this.tileset);
    // this.map.setBaseTileSize(game_config.tile_size, game_config.tile_size);
}

function update() {

    for (let i = 0; i < this.blocks.length; i++) {
        this.blocks[i].update();
    }

    let any_block_is_moving = false;
    for (let i = 0; i < this.blocks.length; i++) {
        if (this.blocks[i].is_moving) {
            any_block_is_moving = true;
            break;
        }
    }

    
    if (!any_block_is_moving) {
        if(this.block_spawn_counter === 0){
            spawn_block(this);
            this.block_spawn_counter ++;
        }
        if (this.w_key.isDown) {
            move_blocks(this.blocks, 'up');
            this.block_spawn_counter = 0;
        }
        else if (this.a_key.isDown) {
            move_blocks(this.blocks, 'left');
            this.block_spawn_counter = 0;
        }
        else if (this.s_key.isDown) {
            move_blocks(this.blocks, 'down');
            this.block_spawn_counter = 0;
        }
        else if (this.d_key.isDown) {
            move_blocks(this.blocks, 'right');
            this.block_spawn_counter = 0;
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

function create_tile(game, x, y, color) {
    const coords = convert_tile_to_world(x, y);
    const tile = new Block(game, coords.x, coords.y, [], color, game_config.tile_size - (game_config.padding * 2), game_config.padding);
    return tile;
}

function convert_tile_to_world(tile_x, tile_y) {
    return {
        x: (tile_x * game_config.tile_size) + (game_config.tile_size / 2),
        y: (tile_y * game_config.tile_size) + (game_config.tile_size / 2)
    }
}

function spawn_block(game) {

    const color = Math.floor(Math.random() * 0xFFFFFF);

    let spawnable_tiles = [];
    for (let x = 0; x < game_config.num_cols; x++) {
        for (let y = 0; y < game_config.num_rows; y++) {
            const tile = game.map.getTileAt(x, y);
            if (game.map.layer.data[tile.y][tile.x].index === block_config.wall_id || block_in_tile(x, y, game)) {
                continue;
            }
            spawnable_tiles.push({x: x, y: y});
        }
    }

    if (spawnable_tiles.length === 0) {
        return;
    }

    const spawn_tile = spawnable_tiles[Math.floor(Math.random() * spawnable_tiles.length)];
    game.blocks.push(create_tile(game, spawn_tile.x, spawn_tile.y, color));
    
}

function block_in_tile(x, y, game) {
    const origin_tile = game.map.getTileAt(x, y);
    for (let i = 0; i < game.blocks.length; i++) {
        const tile = game.map.getTileAtWorldXY(game.blocks[i].x, game.blocks[i].y)
        if (tile.x === origin_tile.x && tile.y === origin_tile.y) {
            return true;
        }
    }
    return false;
}
