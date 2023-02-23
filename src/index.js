import Phaser from 'phaser';
import {Tile} from './tile.js';

const game_config = {
    num_rows: 20,
    num_cols: 20,
    tile_size: 32,
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

    this.load.tilemapTiledJSON('tilemap', 'src/assets/basic.json')
    this.load.image('tiles', 'src/assets/tiles.png');

}

function create() {

    const map = this.make.tilemap({ key: 'tilemap' })
	const tileset = map.addTilesetImage('tiles', 'tiles')
	map.createStaticLayer('Tile Layer 1', tileset)
    
}

function update() {
    
}

var game = new Phaser.Game(config);