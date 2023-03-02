var {scene,block_config,game_config,constructor,preload,create,update,make_map} = require('./testing_setup');
var {create_block} = require('../src/game');
var expect = require('chai').expect;
var forEach = require('mocha-each');

describe('Scene', function () {

    beforeEach("Setup Scene", function() {
        // common setup code for each test
        scene.init();
        make_map(scene, game_config.num_rows, game_config.num_cols);
        scene.update();
    });

    forEach([
        ["orange", 2, 2],
        ["green", 3, 4]
    ])
        .it(`%s block spawns at (%d,%d)`, function (team, tile_x, tile_y) {
            // test code for each block
            let list_of_blocks = team === "orange" ? scene.orange_blocks : scene.green_blocks;
            let block = create_block(scene, list_of_blocks, tile_x, tile_y, "color", team);
            expect(block.tile_x).to.equal(tile_x);
            expect(block.tile_y).to.equal(tile_y);
            expect(block.team).to.equal(team);
        });

    forEach([
        ["green", 2, 2, "s", "right", 2, 3, 1],
        ["green", 2, 2, "s", "right", 2, 3, 2],
        ["green", 2, 2, "s", "right", 2, 3, 3],
        ["green", 2, 2, "s", "right", 2, 3, 4],
        ["green", 2, 2, "s", "right", 2, 4, 5],
        ["green", 2, 2, "s", "right", 2, 4, 6],
        ["green", 2, 2, "s", "right", 2, 4, 7],
        ["green", 2, 2, "s", "right", 2, 4, 8],
        ["green", 2, 2, "s", "right", 2, 5, 9],
        ["green", 2, 2, "s", "right", 2, 5, 10],
        ["green", 2, 2, "s", "right", 2, 5, 11],
        ["green", 2, 2, "s", "right", 2, 5, 12],
        ["green", 2, 2, "s", "right", 2, 6, 13],
        ["green", 2, 2, "s", "right", 2, 6, 14],
        ["green", 2, 2, "s", "right", 2, 6, 15],
        ["green", 2, 2, "s", "right", 2, 6, 16],
        ["green", 2, 2, "s", "right", 2, 7, 17],
    ])
        .it(`%s block moves from (%d,%d) going directions: %s (green), %s (orange), to (%d,%d), num_updates = %s`, function (team, tile_x, tile_y, green_key, orange_key, new_tile_x, new_tile_y, num_updates) {
            // test code for each block
            let list_of_blocks = team === "orange" ? scene.orange_blocks : scene.green_blocks;
            let block = create_block(scene, list_of_blocks, tile_x, tile_y, "color", team);
            
            scene[green_key + "_key"].isDown = true;
            scene[orange_key + "_key"].isDown = true;
            for (var i = 0; i < num_updates; i++) {
                scene.update();
            }
            
            expect(block.tile_x).to.equal(new_tile_x);
            expect(block.tile_y).to.equal(new_tile_y);
        });

});