// mock Phaser
global.Phaser = {
    GameObjects: {
        Container: class Container {
            constructor(scene, x, y) {
            }
        },
    },
    Scene: class Scene {
        constructor() {
        }
    },
}

// setup .at becuase for some reason the test runner doesn't like it
function at(n) {
    // ToInteger() abstract op
    n = Math.trunc(n) || 0;
    // Allow negative indexing from the end
    if (n < 0) n += this.length;
    // OOB access is guaranteed to return undefined
    if (n < 0 || n >= this.length) return undefined;
    // Otherwise, this is just normal property access
    return this[n];
}

const TypedArray = Reflect.getPrototypeOf(Int8Array);
for (const C of [Array, String, TypedArray]) {
    Object.defineProperty(C.prototype, "at",
                          { value: at,
                            writable: true,
                            enumerable: false,
                            configurable: true });
}

var {GameScene, game_config, block_config, create_block} = require('../src/GameScene.js');

function make_scene() { // make a mock scene object
    let scene = new GameScene();
    scene.green_timer = {
        pause: function() {},
    }
    scene.orange_timer = {
        pause: function() {},
    }
    scene.map = {
        putTileAtWorldXY: function(data, x, y) {
            this.layer.data[y][x].index = data;
        },
        getTileAtWorldXY: function(x, y) {
            let tile_x = x;
            let tile_y = y;
            return this.layer.data[tile_y][tile_x];
        },
        getTileAt: function(x, y) {
            return this.layer.data[y][x];
        },
        layer: {
            data: [],
        },
    };
    scene.init({mode: ""});
    for (let key of scene.keyList) {
        scene[`${key.toLowerCase()}_key`] = {is_down: false}
    }
    return scene;
}

function make_map(scene, x, y) {
// create a X*Y map, surrounded by walls
    for (var i = 0; i < x; i++) {
        scene.map.layer.data[i] = [];
        for (var j = 0; j < y; j++) {
            if (i === 0 || i === x - 1 || j === 0 || j === y - 1) {
                scene.map.layer.data[i][j] = {
                    index: game_config.wall_id[0],
                    x: j,
                    y: i,
                    layer: scene.map.layer,
                    getCenterX: function() {
                        return this.x;
                    },
                    getCenterY: function() {
                        return this.y;
                    },
                };
            }
            else {
                scene.map.layer.data[i][j] = {
                    index: -1,
                    x: j,
                    y: i,
                    layer:
                    scene.map.layer,
                    getCenterX: function() {
                        return this.x;
                    },
                    getCenterY: function() {
                        return this.y;
                    },
                };
            }
        }
    }
}

module.exports = {
    make_scene,
    block_config: block_config,
    game_config: game_config,
    create_block: create_block,
    make_map,
}