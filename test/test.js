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

    // testing block spawning
    forEach([
        ["orange", 2, 2],
        ["green", 3, 4]
    ])
        .it(`%s block spawns at (%d,%d)`, function (team, tile_x, tile_y) {
            let list_of_blocks = team === "orange" ? game.orange_blocks : game.green_blocks;
            let block = create_block(game, list_of_blocks, tile_x, tile_y, "color", team);
            expect(block.tile_x).to.equal(tile_x);
            expect(block.tile_y).to.equal(tile_y);
            expect(block.team).to.equal(team);
        });

    // testing moving all directions for each color and hitting the wall
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

    // testing blocks of different colors not interacting when they shouldnt
    forEach([
        ["green", 2, 2, "orange", 5, 5, "s", "right", 2, 18, 100],
        ["green", 2, 2, "orange", 5, 5, "a", "right", 1, 2, 100],
        ["green", 2, 2, "orange", 5, 5, "w", "right", 2, 1, 100],
        ["green", 2, 2, "orange", 5, 5, "d", "right", 18, 2, 100],
        ["orange", 2, 2, "green", 5, 5, "d", "right", 18, 2, 100],
        ["orange", 2, 2, "green", 5, 5, "d", "left", 1, 2, 100],
        ["orange", 2, 2, "green", 5, 5, "d", "down", 2, 18, 100],
        ["orange", 2, 2, "green", 5, 5, "d", "up", 2, 1, 100],
    ])
        .it(`%s block at (%d,%d) and %s block at (%d,%d), green moving: %s, orange moving: %s, ends at (%d,%d) using %d updates`, function (team, tile_x, tile_y, other_team, other_tile_x, other_tile_y, green_key, orange_key, new_tile_x, new_tile_y, num_updates) {
            let list_of_blocks = team === "orange" ? game.orange_blocks : game.green_blocks;
            let other_list_of_blocks = other_team === "orange" ? game.orange_blocks : game.green_blocks;
            let block = create_block(game, list_of_blocks, tile_x, tile_y, "color", team);
            let other_block = create_block(game, other_list_of_blocks, other_tile_x, other_tile_y, "color", other_team);
            
            game[green_key + "_key"].isDown = true;
            game[orange_key + "_key"].isDown = true;
            for (var i = 0; i < num_updates; i++) {
                game.update();
            }
            
            expect(block.tile_x).to.equal(new_tile_x, "x position of " + team + " block is wrong");
            expect(block.tile_y).to.equal(new_tile_y, "y position of " + team + " block is wrong");
        }
    );


    forEach([
        // testing blocks of same colors combining when they should
        ["green", 2, 2, 4, "green", 2, 5, 4, "s", "right", 2, 18, 100, 8],
        ["green", 5, 2, 2, "green", 2, 2, 2, "a", "right", 1, 2, 100, 4],
        ["green", 2, 2, 4, "green", 2, 5, 4, "w", "right", 2, 1, 100, 8],
        ["green", 2, 2, 2, "green", 5, 2, 2, "d", "right", 18, 2, 100, 4],
        ["orange", 2, 2, 2, "orange", 2, 5, 2, "d", "down", 2, 18, 100, 4],
        ["orange", 2, 2, 4, "orange", 5, 2, 4, "d", "left", 1, 2, 100, 8],
        ["orange", 2, 2, 4, "orange", 2, 5, 4, "d", "up", 2, 1, 100, 8],
        ["orange", 2, 2, 2, "orange", 5, 2, 2, "d", "right", 18, 2, 100, 4],
    ])
        .it(`%s block at (%d,%d) with value of %d, and %s block at (%d,%d) with value of %d, green moving: %s, orange moving: %s, ends at (%d,%d) using %d updates, ended at value of &d`, function (team, tile_x, tile_y, first_value, other_team, other_tile_x, other_tile_y, second_value, green_key, orange_key, new_tile_x, new_tile_y, num_updates, expected_value) {
            let list_of_blocks = team === "orange" ? game.orange_blocks : game.green_blocks;
            let other_list_of_blocks = other_team === "orange" ? game.orange_blocks : game.green_blocks;
            let block = create_block(game, list_of_blocks, tile_x, tile_y, "color", team);
            block.value = first_value;
            let other_block = create_block(game, other_list_of_blocks, other_tile_x, other_tile_y, "color", other_team);
            other_block.value = second_value;
            
            game[green_key + "_key"].isDown = true;
            game[orange_key + "_key"].isDown = true;
            for (var i = 0; i < num_updates; i++) {
                game.update();
            }
            
            // first block should be in the position and value described by input
            expect(block.tile_x).to.equal(new_tile_x, "x position of " + team + " block is wrong");
            expect(block.tile_y).to.equal(new_tile_y, "y position of " + team + " block is wrong");
            expect(block.value).to.equal(expected_value, "value of " + team + " block is wrong");

            // second block should be gone
            expect(other_block.tile_x).to.equal(null, "x position of " + other_team + " block is not null");
            expect(other_block.tile_y).to.equal(null, "y position of " + other_team + " block is not null");
            expect(other_block.value).to.equal(null, "value of " + other_team + " block is not null");
        }
    );

});