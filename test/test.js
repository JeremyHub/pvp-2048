var {scene,block_config,game_config,constructor,preload,create,update,} = require('./testing_setup');
var assert = require('assert');

describe('Scene', function () {

  describe('Collision', function () {

    it('should run game', function () {
        scene.init();
        scene.update();
        assert(true);
    });

  });

});