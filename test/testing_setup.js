var {constructor, init, preload, create, update, game_config, block_config} = require('../src/game.js');

function make_scene() {
    return {
        init: init,
        update: update,
        map: {
            putTileAtWorldXY: function(data, x, y) {
                this.layer.data[y][x].index = data;
            },
            getTileAtWorldXY: function(x, y) {
                let tile_x = Math.floor(x / game_config.tile_size);
                let tile_y = Math.floor(y / game_config.tile_size);
                return this.layer.data[tile_y][tile_x];
            },
            getTileAt: function(x, y) {
                return this.layer.data[y][x];
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
        z_key: {isDown: false},
        x_key: {isDown: false},
        c_key: {isDown: false},
        p_key: {isDown: false},
    };
}

function make_map(scene, x, y) {
// create a X*Y map, surrounded by walls
    for (var i = 0; i < x; i++) {
        scene.map.layer.data[i] = [];
        for (var j = 0; j < y; j++) {
            if (i === 0 || i === x - 1 || j === 0 || j === y - 1) {
                scene.map.layer.data[i][j] = {index: block_config.wall_id, x: j, y: i, layer: scene.map.layer};
            }
            else {
                scene.map.layer.data[i][j] = {index: -1, x: j, y: i, layer: scene.map.layer};
            }
        }
    }
}

module.exports = {
    make_scene: make_scene,
    block_config: block_config,
    game_config: game_config,
    constructor: constructor,
    preload: preload,
    create: create,
    update: update,
    make_map: make_map,
}