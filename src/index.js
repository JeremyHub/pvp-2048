import Phaser from 'phaser';
import {Tile} from './tile.js';

const game_config = {
    num_rows: 20,
    num_cols: 20,
    tile_size: 32,
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
        update: update
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

    this.tiles = [];

    this.w_key = this.input.keyboard.addKey('W');
    this.a_key = this.input.keyboard.addKey('A');
    this.s_key = this.input.keyboard.addKey('S');
    this.d_key = this.input.keyboard.addKey('D');

    this.map = this.make.tilemap({ key: 'tilemap' });
	this.tileset = this.map.addTilesetImage('tiles', 'tiles');
	this.map.createStaticLayer('Tile Layer 1', this.tileset);

    for (let i = 1; i < 3; i++) {
        this.tiles.push(create_tile(this, i, 1, 0x000000));
    }
}

function update() {

    for (let i = 0; i < this.tiles.length; i++) {
        this.tiles[i].update();
    }

    let any_tile_is_moving = false;
    for (let i = 0; i < this.tiles.length; i++) {
        if (this.tiles[i].is_moving) {
            any_tile_is_moving = true;
            break;
        }
    }

    if (!any_tile_is_moving) {
        if (this.w_key.isDown) {
            move_tiles(this.tiles, 'up');
        }
        else if (this.a_key.isDown) {
            move_tiles(this.tiles, 'left');
        }
        else if (this.s_key.isDown) {
            move_tiles(this.tiles, 'down');
        }
        else if (this.d_key.isDown) {
            move_tiles(this.tiles, 'right');
        }
    }
}

///////////////////////////////////
var game = new Phaser.Game(config);
///////////////////////////////////

function move_tiles(tiles, direction) {
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].go_direction(direction);
    }
}

function create_tile(game, x, y, color) {
    const coords = convert_tile_to_world(x, y);
    const tile = new Tile(game, coords.x, coords.y, [], color, game_config.tile_size - (game_config.padding * 2));
    return tile;
}

function convert_tile_to_world(tile_x, tile_y) {
    return {
        x: (tile_x * game_config.tile_size) + (game_config.tile_size / 2),
        y: (tile_y * game_config.tile_size) + (game_config.tile_size / 2)
    }
}