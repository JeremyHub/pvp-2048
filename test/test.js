var {make_scene,block_config,game_config,constructor,preload,create,update,make_map} = require('./testing_setup');
var {create_block} = require('../src/game');
var expect = require('chai').expect;
var forEach = require('mocha-each');

describe('Game', function () {
    let game = null;
    beforeEach("Setup game", function() {
        // common setup code for each test
        game = make_scene();
        game.init();
        make_map(game, game_config.num_rows, game_config.num_cols);
        game.update();
    });

    forEach([
        ["orange", 2, 2],
        ["green", 3, 4]
    ])
        .it(`%s block spawns at (%d,%d)`, function (team, tile_x, tile_y) {
            // test code for each block
            let list_of_blocks = team === "orange" ? game.orange_blocks : game.green_blocks;
            let block = create_block(game, list_of_blocks, tile_x, tile_y, "color", team);
            expect(block.tile_x).to.equal(tile_x);
            expect(block.tile_y).to.equal(tile_y);
            expect(block.team).to.equal(team);
        });

    forEach([
        ["green", 2, 2, "s", "right", 2, 18, 100],
        ["green", 2, 2, "a", "down", 1, 2, 100],
        ["green", 2, 2, "w", "left", 2, 1, 100],
        ["green", 2, 2, "d", "up", 18, 2, 100],
        ["orange", 2, 2, "a", "right", 18, 2, 100],
        ["orange", 2, 2, "d", "left", 1, 2, 100],
        ["orange", 2, 2, "w", "down", 2, 18, 100],
        ["orange", 2, 2, "s", "up", 2, 1, 100],
    ])
        .it(`%s block moves from (%d,%d) going directions: %s (green), %s (orange), to (%d,%d), num_updates = %s`, function (team, tile_x, tile_y, green_key, orange_key, new_tile_x, new_tile_y, num_updates) {
            // test code for each block
            let list_of_blocks = team === "orange" ? game.orange_blocks : game.green_blocks;
            let block = create_block(game, list_of_blocks, tile_x, tile_y, "color", team);
            
            game[green_key + "_key"].isDown = true;
            game[orange_key + "_key"].isDown = true;
            for (var i = 0; i < num_updates; i++) {
                game.update();
            }
            
            expect(block.tile_x).to.equal(new_tile_x, "x position is wrong");
            expect(block.tile_y).to.equal(new_tile_y, "y position is wrong");
        });

});