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
            let block = create_block(scene, tile_x, tile_y, "color", team);
            expect(block.tile_x).to.equal(tile_x);
            expect(block.tile_y).to.equal(tile_y);
            expect(block.team).to.equal(team);
        });

    // forEach([
    //     ["orange", 2, 2, "down", 2, 3],
    //     ["green", 3, 4, "right", 4, 4]
    // ])
    //     .it(`%s block moves from (%d,%d) %s to (%d,%d)`, function (team, tile_x, tile_y, direction, new_tile_x, new_tile_y) {
    //         // test code for each block
    //         let block = create_block(scene, tile_x, tile_y, "color", team);
    //         scene.a_key.isDown = true;
    //         for (var i = 0; i < 100; i++) {
    //             scene.update();
    //         }
    //         console.log(block.tile_x, block.tile_y);
    //         // expect(block.tile_x).to.equal(new_tile_x);
    //         // expect(block.tile_y).to.equal(new_tile_y);
    //     });

});