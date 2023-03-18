var Phaser = require('phaser');
var {GameScene, game_config} = require('./scene');
var {StartScene} = require('./StartScene');


const config = {
    type: Phaser.AUTO,
    width: game_config.num_cols * game_config.tile_size,
    height: game_config.num_rows * game_config.tile_size,
    backgroundColor: '#000000',
    parent: 'game',
};

var game = new Phaser.Game(config);
game.scene.add('GameScene', GameScene);
game.scene.add('StartScene', StartScene)
game.scene.start('StartScene');