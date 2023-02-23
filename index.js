var game = new Phaser.Game(640, 480, Phaser.CANVAS, 'game');

class PhaserGame {
    constructor(game) {

    }

    init() {
        this.physics.startSystem(Phaser.Physics.ARCADE);
    }

    preload() {
        
    }

    create() {

    }

    update() {

    }
}

game.state.add('Game', PhaserGame, true);