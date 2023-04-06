var Phaser = require('phaser');
var {GameScene} = require('./Scenes/GameScene');
var {StartScene} = require('./Scenes/StartScene');
var {LossScene, WinScene, TieScene} = require('./Scenes/WinLossScenes');
var {SinglePlayerMenuScene} = require('./Scenes/SinglePlayerMenuScene');
var {MultiplayerMenuScene} = require('./Scenes/MultiplayerMenuScene');
var {MapSelectionScene} = require('./Scenes/MapSelectionScene');
var {WaitingForPlayersScene} = require('./Scenes/WaitingForPlayersScene');
var {OptionsScene} = require('./Scenes/OptionsScene');


const config = {
    type: Phaser.AUTO,
    scale: {
        // min: {
        //     width: 500,
        //     height: 500
        // },
        // max: {
        //     width: 1000,
        //     height: 1000
        // },
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
game.scene.add('SinglePlayerMenuScene', SinglePlayerMenuScene)
game.scene.add('MultiplayerMenuScene', MultiplayerMenuScene)
game.scene.add('MapSelectionScene', MapSelectionScene)
game.scene.add('WaitingForPlayersScene', WaitingForPlayersScene)
game.scene.add('OptionsScene', OptionsScene)
game.scene.start('StartScene');