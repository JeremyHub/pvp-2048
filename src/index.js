

var game = new Phaser.Game(640, 480, Phaser.CANVAS, 'game');


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