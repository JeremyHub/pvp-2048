const game_config = {
    num_rows: 20,
    num_cols: 20,
    tile_size: 32,
}

const config = {
    type: Phaser.AUTO,
    width: game_config.num_cols * game_config.tile_size,
    height: game_config.num_rows * game_config.tile_size,
    parent: 'game',
}

var game = new Phaser.Game(config);


class PhaserGame {
    constructor(game) {

    }

    init() {

    }

    preload() {

        this.load.tilemap('map_simple_2048', 'src/assets/basic.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('tiles', 'src/assets/tiles.png');

    }
    create() {

        this.map = this.add.tilemap('map_simple_2048');
        this.map.addTilesetImage('tiles', 'tiles');

        this.layer = this.map.createLayer('Tile Layer 1');

    }

    update() {
        
    }
}

game.state.add('Game', PhaserGame, true);