import Phaser from 'phaser';

class MyGame extends Phaser.Scene
{
    constructor ()
    {
        super();
    }

    preload() {
        this.load.image('tiles', 'src/assets/tiles.png');
	    this.load.tilemapTiledJSON('tilemap', 'src/assets/basic.json');
    }

    create() {
        this.map = this.add.tilemap('tilemap');
        this.map.addTilesetImage('tiles', 'tiles');
        this.layer = this.map.createLayer('Tile Layer 1');
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 600,
    scene: MyGame,
};

const game = new Phaser.Game(config);
