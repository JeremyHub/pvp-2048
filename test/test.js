var {constructor, init, preload, create, update, game_config, block_config} = require('../src/game.js');
var assert = require('assert');

var scene = {
    init: init,
    update: update,
    map: {
        putTileAtWorldXY: function(data, x, y) {
            this.layer.data[x][y] = data;
        },
        getTileAtWorldXY: function(x, y) {
            return this.layer.data[x][y];
        },
        getTileAt: function(x, y) {
            return this.layer.data[x][y];
        },
        layer: {
            data: [],
        },
    },
    add: {existing: function() {},},
    w_key: {isDown: false},
    a_key: {isDown: false},
    s_key: {isDown: false},
    d_key: {isDown: false},
    
    up_key: {isDown: false},
    left_key: {isDown: false},
    down_key: {isDown: false},
    right_key: {isDown: false},
    
    pointer: {x: 0, y: 0, isDown: false},
    o_key: {isDown: false},
    g_key: {isDown: false},
    b_key: {isDown: false},
    t_key: {isDown: false},
    r_key: {isDown: false},
}

// create a 5x5 map, surrounded by walls
for (var i = 0; i < game_config.num_rows + 2; i++) {
    scene.map.layer.data[i] = [];
    for (var j = 0; j < game_config.num_cols + 2; j++) {
        if (i === 0 || i === game_config.num_rows + 1 || j === 0 || j === game_config.num_cols + 1) {
            scene.map.layer.data[i][j] = {index: block_config.wall_id, x: i, y: j};
        }
        else {
            scene.map.layer.data[i][j] = {index: -1, x: i, y: j};
        }
    }
}

describe('Scene', function () {

  describe('Collision', function () {

    it('should run game', function () {
        scene.init();
        scene.update();
        assert(true);
    });

  });

});