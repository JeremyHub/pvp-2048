var Phaser = require('phaser');
var {GameScene, game_config} = require('./GameScene');
var {StartScene} = require('./StartScene');
var {LossScene, WinScene, TieScene} = require('./WinLossScenes');


const config = {
    type: Phaser.AUTO,
    scale: {
        min: {
            width: 500,
            height: 500
        },
        max: {
            width: 1000,
            height: 1000
        },
        mode: Phaser.Scale.FIT,
        parent: 'game',
    },    
    backgroundColor: '#000000',
    parent: 'game',
};

var game = new Phaser.Game(config);
game.scene.add('GameScene', GameScene);
game.scene.add('StartScene', StartScene)
game.scene.add('WinScene', WinScene);
game.scene.add('LossScene', LossScene);
game.scene.add('TieScene', TieScene)
game.scene.start('StartScene');