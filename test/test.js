var {make_scene,game_config,make_map,create_block} = require('./testing_setup');
var expect = require('chai').expect;
var forEach = require('mocha-each');

describe('Game', function () {
    let game = null;
    beforeEach("Setup game", function() {
        // common setup code for each test
        game = make_scene();
        make_map(game, 20, 20);
        // game.handle_moving();
    });

    // testing block spawning
    forEach([
        ["orange", 2, 2],
        ["green", 3, 4]
    ])
        .it(`%s block spawns at (%d,%d)`, function (team, tile_x, tile_y) {
            let list_of_blocks = team === "orange" ? game.orange_blocks : game.green_blocks;
            let block = create_block(game, list_of_blocks, tile_x, tile_y, "color", team, game_config);
            expect(block.tile_x).to.equal(tile_x);
            expect(block.tile_y).to.equal(tile_y);
            expect(block.team).to.equal(team);
        }
    );

    // testing moving all directions for each color and hitting the wall
    forEach([
        ["green", 2, 2, "down", "right", 2, 18, 100],
        ["green", 2, 2, "left", "down", 1, 2, 100],
        ["green", 2, 2, "up", "left", 2, 1, 100],
        ["green", 2, 2, "right", "up", 18, 2, 100],
        ["orange", 2, 2, "left", "right", 18, 2, 100],
        ["orange", 2, 2, "right", "left", 1, 2, 100],
        ["orange", 2, 2, "up", "down", 2, 18, 100],
        ["orange", 2, 2, "down", "up", 2, 1, 100],
    ])
        .it(`%s block moves from (%d,%d) going directions: %s (green), %s (orange), to (%d,%d), num_updates = %s`, function (team, tile_x, tile_y, green_key, orange_key, new_tile_x, new_tile_y, num_updates) {
            let list_of_blocks = team === "orange" ? game.orange_blocks : game.green_blocks;
            let block = create_block(game, list_of_blocks, tile_x, tile_y, "color", team, game_config);
            
            game.make_green_move(green_key);
            game.make_orange_move(orange_key);
            for (var i = 0; i < num_updates; i++) {
                game.handle_moving();
            }
            
            expect(block.tile_x).to.equal(new_tile_x, "x position is wrong");
            expect(block.tile_y).to.equal(new_tile_y, "y position is wrong");
        }
    );

    // testing blocks of different colors not interacting when they shouldnt
    forEach([
        ["green", 2, 2, "orange", 5, 5, "down", "right", 2, 18, 100],
        ["green", 2, 2, "orange", 5, 5, "left", "right", 1, 2, 100],
        ["green", 2, 2, "orange", 5, 5, "up", "right", 2, 1, 100],
        ["green", 2, 2, "orange", 5, 5, "right", "right", 18, 2, 100],
        ["orange", 2, 2, "green", 5, 5, "right", "right", 18, 2, 100],
        ["orange", 2, 2, "green", 5, 5, "right", "left", 1, 2, 100],
        ["orange", 2, 2, "green", 5, 5, "right", "down", 2, 18, 100],
        ["orange", 2, 2, "green", 5, 5, "right", "up", 2, 1, 100],
    ])
        .it(`%s block at (%d,%d) and %s block at (%d,%d), green moving: %s, orange moving: %s, ends at (%d,%d) using %d updates`, function (team, tile_x, tile_y, other_team, other_tile_x, other_tile_y, green_key, orange_key, new_tile_x, new_tile_y, num_updates) {
            let list_of_blocks = team === "orange" ? game.orange_blocks : game.green_blocks;
            let other_list_of_blocks = other_team === "orange" ? game.orange_blocks : game.green_blocks;
            let block = create_block(game, list_of_blocks, tile_x, tile_y, "color", team, game_config);
            let other_block = create_block(game, other_list_of_blocks, other_tile_x, other_tile_y, "color", other_team, game_config);
            
            game.make_green_move(green_key);
            game.make_orange_move(orange_key);
            for (var i = 0; i < num_updates; i++) {
                game.handle_moving();
            }
            
            expect(block.tile_x).to.equal(new_tile_x, "x position of " + team + " block is wrong");
            expect(block.tile_y).to.equal(new_tile_y, "y position of " + team + " block is wrong");
        }
    );


    forEach([
        // testing blocks of same colors combining when they should
        ["green", 2, 2, 4, "green", 2, 5, 4, "down", "right", 2, 18, 100, 8],
        ["green", 5, 2, 2, "green", 2, 2, 2, "left", "right", 1, 2, 100, 4],
        ["green", 2, 2, 4, "green", 2, 5, 4, "up", "right", 2, 1, 100, 8],
        ["green", 2, 2, 2, "green", 5, 2, 2, "right", "right", 18, 2, 100, 4],
        ["orange", 2, 2, 2, "orange", 2, 5, 2, "right", "down", 2, 18, 100, 4],
        ["orange", 2, 2, 4, "orange", 5, 2, 4, "right", "left", 1, 2, 100, 8],
        ["orange", 2, 2, 4, "orange", 2, 5, 4, "right", "up", 2, 1, 100, 8],
        ["orange", 2, 2, 2, "orange", 5, 2, 2, "right", "right", 18, 2, 100, 4],
    ])
        .it(`%s block at (%d,%d) with value of %d, and %s block at (%d,%d) with value of %d, green moving: %s, orange moving: %s, ends at (%d,%d) using %d updates, ended at value of %d`, function (team, tile_x, tile_y, first_value, other_team, other_tile_x, other_tile_y, second_value, green_key, orange_key, new_tile_x, new_tile_y, num_updates, expected_value) {
            let list_of_blocks = team === "orange" ? game.orange_blocks : game.green_blocks;
            let other_list_of_blocks = other_team === "orange" ? game.orange_blocks : game.green_blocks;
            let block = create_block(game, list_of_blocks, tile_x, tile_y, "color", team, game_config);
            block.value = first_value;
            let other_block = create_block(game, other_list_of_blocks, other_tile_x, other_tile_y, "color", other_team, game_config);
            other_block.value = second_value;
            
            game.make_green_move(green_key);
            game.make_orange_move(orange_key);
            for (var i = 0; i < num_updates; i++) {
                game.handle_moving();
            }
            
            // first block should be in the position and value described by input
            expect(block.tile_x).to.equal(new_tile_x, "x position of " + team + " block is wrong");
            expect(block.tile_y).to.equal(new_tile_y, "y position of " + team + " block is wrong");
            expect(block.value).to.equal(expected_value, "value of " + team + " block is wrong");

            // second block should be gone
            let has_destroy_animation = false;
            for (anim of other_block.animations) {
                if (anim[0] === "merge" || anim[0] === "destroy") {
                    has_destroy_animation = true;
                }
            }
            expect(has_destroy_animation).to.equal(true, "second block does not have a destroy animation");
        }
    );

    // testing 2 block interactions
    forEach([
        // same color diff value bouncing tests
        ["green", 2, 2, 2, "green", 2, 5, 4, "down", "right", 2, 17, 2, 18, 100, 2, 4],
        ["green", 2, 2, 4, "green", 2, 5, 2, "down", "right", 2, 17, 2, 18, 100, 4, 2],
        ["green", 2, 2, 2, "green", 5, 2, 4, "left", "right", 1, 2, 2, 2, 100, 2, 4],
        ["green", 2, 2, 4, "green", 5, 2, 2, "left", "right", 1, 2, 2, 2, 100, 4, 2],
        ["green", 2, 2, 2, "green", 2, 5, 4, "up", "right", 2, 1, 2, 2, 100, 2, 4],
        ["green", 2, 2, 4, "green", 2, 5, 2, "up", "right", 2, 1, 2, 2, 100, 4, 2],
        ["green", 2, 2, 2, "green", 5, 2, 4, "right", "right", 17, 2, 18, 2, 100, 2, 4],
        ["green", 2, 2, 4, "green", 5, 2, 2, "right", "right", 17, 2, 18, 2, 100, 4, 2],
        ["orange", 2, 2, 2, "orange", 2, 5, 4, "down", "down", 2, 17, 2, 18, 100, 2, 4],
        ["orange", 2, 2, 4, "orange", 2, 5, 2, "down", "down", 2, 17, 2, 18, 100, 4, 2],
        ["orange", 2, 2, 2, "orange", 5, 2, 4, "left", "left", 1, 2, 2, 2, 100, 2, 4],
        ["orange", 2, 2, 4, "orange", 5, 2, 2, "left", "left", 1, 2, 2, 2, 100, 4, 2],
        ["orange", 2, 2, 2, "orange", 2, 5, 4, "up", "up", 2, 1, 2, 2, 100, 2, 4],
        ["orange", 2, 2, 4, "orange", 2, 5, 2, "up", "up", 2, 1, 2, 2, 100, 4, 2],
        ["orange", 2, 2, 2, "orange", 5, 2, 4, "right", "right", 17, 2, 18, 2, 100, 2, 4],
        ["orange", 2, 2, 4, "orange", 5, 2, 2, "right", "right", 17, 2, 18, 2, 100, 4, 2],

        // diff color same value bouncing tests (same direction)
        ["green", 2, 2, 2, "orange", 5, 2, 2, "right", "right", 17, 2, 18, 2, 100, 2, 2],
        ["green", 2, 2, 4, "orange", 2, 5, 4, "down", "down", 2, 17, 2, 18, 100, 4, 4],
        ["green", 2, 2, 2, "orange", 2, 5, 2, "up", "up", 2, 1, 2, 2, 100, 2, 2],
        ["green", 2, 2, 2, "orange", 5, 2, 2, "left", "left", 1, 2, 2, 2, 100, 2, 2],
        ["orange", 2, 2, 2, "green", 5, 2, 2, "right", "right", 17, 2, 18, 2, 100, 2, 2],
        ["orange", 2, 2, 4, "green", 2, 5, 4, "down", "down", 2, 17, 2, 18, 100, 4, 4],
        ["orange", 2, 2, 2, "green", 2, 5, 2, "up", "up", 2, 1, 2, 2, 100, 2, 2],
        ["orange", 2, 2, 2, "green", 5, 2, 2, "left", "left", 1, 2, 2, 2, 100, 2, 2],

        // diff color same value bouncing tests (diff direction (ie. moving through each other)) (right next to each other)
        ["green", 2, 2, 2, "orange", 5, 2, 2, "right", "left", 3, 2, 4, 2, 100, 2, 2],
        ["green", 2, 2, 2, "orange", 2, 5, 2, "down", "up", 2, 3, 2, 4, 100, 2, 2],
        ["green", 5, 2, 2, "orange", 2, 2, 2, "left", "right", 4, 2, 3, 2, 100, 2, 2],
        ["green", 2, 5, 2, "orange", 2, 2, 2, "up", "down", 2, 4, 2, 3, 100, 2, 2],

        // diff color same value bouncing tests (diff direction (ie. moving through each other)) (one space in between)
        ["green", 2, 2, 4, "orange", 6, 2, 4, "right", "left", 3, 2, 5, 2, 100, 4, 4],
        ["green", 2, 2, 4, "orange", 2, 6, 4, "down", "up", 2, 3, 2, 5, 100, 4, 4],
        ["green", 6, 2, 4, "orange", 2, 2, 4, "left", "right", 5, 2, 3, 2, 100, 4, 4],
        ["green", 2, 6, 4, "orange", 2, 2, 4, "up", "down", 2, 5, 2, 3, 100, 4, 4],

        // diff color same value bouncing when traveling perpendicular to each other and meeting on the same tile
        ["green", 1, 1, 2, "orange", 2, 2, 2, "down", "left", 1, 1, 2, 2, 100, 2, 2],
        ["green", 1, 1, 2, "orange", 3, 3, 2, "down", "left", 1, 2, 2, 3, 100, 2, 2],

        // diff color same value passes through each other when traveling prependicular to each other and one beats the other
        ["green", 2, 1, 2, "orange", 3, 3, 2, "down", "left", 2, 18, 1, 3, 100, 2, 2],

        // eating at walls tests
        ["green", 2, 2, 4, "orange", 5, 2, 2, "right", "right", 18, 2, null, null, 100, 4, null],
        ["green", 2, 2, 8, "orange", 2, 5, 2, "down", "down", 2, 18, null, null, 100, 8, null],
        ["green", 5, 2, 4, "orange", 2, 2, 2, "left", "left", 1, 2, null, null, 100, 4, null],
        ["green", 2, 5, 16, "orange", 2, 2, 2, "up", "up", 2, 1, null, null, 100, 16, null],
        ["orange", 2, 2, 4, "green", 5, 2, 2, "right", "right", 18, 2, null, null, 100, 4, null],
        ["orange", 2, 2, 4, "green", 2, 5, 2, "down", "down", 2, 18, null, null, 100, 4, null],
        ["orange", 5, 2, 8, "green", 2, 2, 2, "left", "left", 1, 2, null, null, 100, 8, null],
        ["orange", 2, 5, 4, "green", 2, 2, 2, "up", "up", 2, 1, null, null, 100, 4, null],

        // eating mid movement tests
            // twords each other with even number space in between (end on the smaller number's spot)
        ["green", 2, 2, 4, "orange", 5, 2, 2, "right", "left", 4, 2, null, null, 100, 4, null],
        ["orange", 2, 2, 4, "green", 5, 2, 2, "left", "right", 4, 2, null, null, 100, 4, null],
        ["green", 2, 2, 2, "orange", 5, 2, 4, "right", "left", null, null, 3, 2, 100, null, 4],
        ["orange", 2, 2, 2, "green", 5, 2, 4, "left", "right", null, null, 3, 2, 100, null, 4],
        
            // twords each other with odd number space in between (end in the middle)
        ["green", 2, 2, 4, "orange", 6, 2, 2, "right", "left", 4, 2, null, null, 100, 4, null],
        ["orange", 2, 2, 4, "green", 6, 2, 2, "left", "right", 4, 2, null, null, 100, 4, null],
        ["green", 2, 2, 2, "orange", 6, 2, 4, "right", "left", null, null, 4, 2, 100, null, 4],
        ["orange", 2, 2, 2, "green", 6, 2, 4, "left", "right", null, null, 4, 2, 100, null, 4],

            // twords each other right next to each other (end on the smaller number's spot)
        ["green", 2, 2, 4, "orange", 3, 2, 2, "right", "left", 3, 2, null, null, 100, 4, null],
        ["orange", 2, 2, 4, "green", 3, 2, 2, "left", "right", 3, 2, null, null, 100, 4, null],
        ["green", 2, 2, 2, "orange", 3, 2, 4, "right", "left", null, null, 2, 2, 100, null, 4],
        ["orange", 2, 2, 2, "green", 3, 2, 4, "left", "right", null, null, 2, 2, 100, null, 4],

            // perpendicular to each other's movement (end on the intersection spot)
        ["green", 1, 1, 4, "orange", 2, 2, 2, "down", "left", 1, 2, null, null, 100, 4, null],
        ["orange", 1, 2, 4, "green", 2, 3, 2, "up", "right", 2, 2, null, null, 100, 4, null],


    ])
        .it(`%s block at (%d,%d) with value of %d, and %s block at (%d,%d) with value of %d, green moving: %s, orange moving: %s, first tile ends at (%d,%d), second tile ends at (%d,%d), using %d updates, first tile ended at value of %d, second tile ended at value of %d`,
            function (team, tile_x, tile_y, first_value, other_team, other_tile_x, other_tile_y, second_value, green_key, orange_key, new_tile_x, new_tile_y, new_other_tile_x, new_other_tile_y, num_updates, expected_value, expected_other_value) {
                let list_of_blocks = team === "orange" ? game.orange_blocks : game.green_blocks;
                let other_list_of_blocks = other_team === "orange" ? game.orange_blocks : game.green_blocks;
                let block = create_block(game, list_of_blocks, tile_x, tile_y, "color", team, game_config);
                block.value = first_value;
                let other_block = create_block(game, other_list_of_blocks, other_tile_x, other_tile_y, "color", other_team, game_config);
                other_block.value = second_value;
                
                game.make_green_move(green_key);
                game.make_orange_move(orange_key);
                game.handle_moving();
                game[green_key + "_key"].isDown = false;
                game[orange_key + "_key"].isDown = false;
                for (var i = 0; i < num_updates-1; i++) {
                    game.handle_moving();
                }

                for ([block, x, y, value, team] of [[block, new_tile_x, new_tile_y, expected_value, team], [other_block, new_other_tile_x, new_other_tile_y, expected_other_value, other_team]]) {
                    if (x === null || y === null || value === null) {
                        // block should be gone
                        let has_destroy_animation = false;
                        for (anim of block.animations) {
                            if (anim[0] === "merge" || anim[0] === "destroy") {
                                has_destroy_animation = true;
                            }
                        }
                        expect(has_destroy_animation).to.equal(true, "block does not have a destroy animation");
                    } else {
                        // block should be in the position and value described by input
                        expect(block.tile_x).to.equal(x, "x position of " + team + " block is wrong");
                        expect(block.tile_y).to.equal(y, "y position of " + team + " block is wrong");
                        expect(block.value).to.equal(value, "value of " + team + " block is wrong");
                    }
                }
            }
    );

    // triple block tests
    forEach([
        // two twos combining, one 4 moving into them at the same time, should combine first then stop the movement of the 4
        ["green", 1, 1, 2, "green", 1, 2, 2, "orange", 2, 1, 4, "up", "left", 1, 1, null, null, 2, 1, 100, 4, null, 4],
        ["orange", 1, 1, 2, "orange", 1, 2, 2, "green", 2, 1, 4, "left", "up", 1, 1, null, null, 2, 1, 100, 4, null, 4],

        // two twos combining, one 4 block moving perpedicular to the others, should combine first then stop the movement of the 4
        ["green", 5, 1, 2, "green", 5, 2, 2, "orange", 4, 1, 4, "up", "right", 5, 1, null, null, 4, 1, 100, 4, null, 4],
        ["orange", 5, 1, 2, "orange", 5, 2, 2, "green", 4, 1, 4, "right", "up", 5, 1, null, null, 4, 1, 100, 4, null, 4],

        // two twos moving into a 4 of the other team, should both be eaten by the 4
        ["green", 1, 1, 2, "green", 2, 1, 2, "orange", 4, 1, 4, "right", "up", null, null, null, null, 4, 1, 100, null, null, 4],
        ["orange", 1, 1, 2, "orange", 2, 1, 2, "green", 4, 1, 4, "up", "right", null, null, null, null, 4, 1, 100, null, null, 4],

    ])
        .it(`%s block at (%d,%d) with value of %d, and %s block at (%d,%d) with value of %d, and %s block at (%d,%d) with value of %d, green moving: %s, orange moving: %s, first tile ends at (%d,%d), second tile ends at (%d,%d), third tile ends at (%d,%d), using %d updates, first tile ended at value of %d, second tile ended at value of %d, third tile ended at value of %d`,
            function (team, tile_x, tile_y, first_value, other_team, other_tile_x, other_tile_y, second_value, third_team, third_tile_x, third_tile_y, third_value, green_key, orange_key, new_tile_x, new_tile_y, new_other_tile_x, new_other_tile_y, new_third_tile_x, new_third_tile_y, num_updates, expected_value, expected_other_value, expected_third_value) {
                let list_of_blocks = team === "orange" ? game.orange_blocks : game.green_blocks;
                let other_list_of_blocks = other_team === "orange" ? game.orange_blocks : game.green_blocks;
                let third_list_of_blocks = third_team === "orange" ? game.orange_blocks : game.green_blocks;
                let block = create_block(game, list_of_blocks, tile_x, tile_y, "color", team, game_config);
                block.value = first_value;
                let other_block = create_block(game, other_list_of_blocks, other_tile_x, other_tile_y, "color", other_team, game_config);
                other_block.value = second_value;
                let third_block = create_block(game, third_list_of_blocks, third_tile_x, third_tile_y, "color", third_team, game_config);
                third_block.value = third_value;
                
                game.make_green_move(green_key);
                game.make_orange_move(orange_key);
                game.handle_moving();
                game[green_key + "_key"].isDown = false;
                game[orange_key + "_key"].isDown = false;
                for (var i = 0; i < num_updates-1; i++) {
                    game.handle_moving();
                }
                for ([block, x, y, value, team] of [[block, new_tile_x, new_tile_y, expected_value, team], [other_block, new_other_tile_x, new_other_tile_y, expected_other_value, other_team], [third_block, new_third_tile_x, new_third_tile_y, expected_third_value, third_team]]) {
                    if (x === null || y === null || value === null) {
                        // block should be gone
                        let has_destroy_animation = false;
                        for (anim of block.animations) {
                            if (anim[0] === "merge" || anim[0] === "destroy") {
                                has_destroy_animation = true;
                            }
                        }
                        expect(has_destroy_animation).to.equal(true, "block does not have a destroy animation");
                    } else {
                        // block should be in the position and value described by input
                        expect(block.tile_x).to.equal(x, "x position of " + team + " block is wrong");
                        expect(block.tile_y).to.equal(y, "y position of " + team + " block is wrong");
                        expect(block.value).to.equal(value, "value of " + team + " block is wrong");
                    }
                }
            }
    );

    // quadruple block tests
    forEach([
        // two green twos moving into 2 orange twos (one space inbetween), should combine into 4s with one space inbetween
        ["green", 2, 1, 2, "green", 1, 1, 2, "orange", 3, 1, 2, "orange", 4, 1, 2, "right", "left", 2, 1, null, null, 3, 1, null, null, 100, 4, null, 4, null],

        // visual: https://i.imgur.com/3LqPhev.png, green goes up, orange goes left
        ["green", 1, 2, 4, "green", 1, 3, 8, "orange", 2, 1, 4, "orange", 2, 2, 2, "up", "left", 1, 2, 1, 3, 2, 1, null, null, 100, 4, 8, 4, null],

        // visual: https://i.imgur.com/Ixs09U8.png, green goes up, orange goes left
        ["green", 1, 1, 4, "green", 1, 2, 2, "orange", 2, 1, 4, "orange", 2, 2, 2, "up", "left", 1, 1, 1, 2, 2, 1, 2, 2, 100, 4, 2, 4, 2],
    ])
        .it(`%s block at (%d,%d) with value of %d, and %s block at (%d,%d) with value of %d, and %s block at (%d,%d) with value of %d, and %s block at (%d,%d) with value of %d, green moving: %s, orange moving: %s, first tile ends at (%d,%d), second tile ends at (%d,%d), third tile ends at (%d,%d), fourth tile ends at (%d,%d), using %d updates, first tile ended at value of %d, second tile ended at value of %d, third tile ended at value of %d, fourth tile ended at value of %d`,
            function (team, tile_x, tile_y, first_value, other_team, other_tile_x, other_tile_y, second_value, third_team, third_tile_x, third_tile_y, third_value, fourth_team, fourth_tile_x, fourth_tile_y, fourth_value, green_key, orange_key, new_tile_x, new_tile_y, new_other_tile_x, new_other_tile_y, new_third_tile_x, new_third_tile_y, new_fourth_tile_x, new_fourth_tile_y, num_updates, expected_value, expected_other_value, expected_third_value, expected_fourth_value) {
                let list_of_blocks = team === "orange" ? game.orange_blocks : game.green_blocks;
                let other_list_of_blocks = other_team === "orange" ? game.orange_blocks : game.green_blocks;
                let third_list_of_blocks = third_team === "orange" ? game.orange_blocks : game.green_blocks;
                let fourth_list_of_blocks = fourth_team === "orange" ? game.orange_blocks : game.green_blocks;
                let block = create_block(game, list_of_blocks, tile_x, tile_y, "color", team, game_config);
                block.value = first_value;
                let other_block = create_block(game, other_list_of_blocks, other_tile_x, other_tile_y, "color", other_team, game_config);
                other_block.value = second_value;
                let third_block = create_block(game, third_list_of_blocks, third_tile_x, third_tile_y, "color", third_team, game_config);
                third_block.value = third_value;
                let fourth_block = create_block(game, fourth_list_of_blocks, fourth_tile_x, fourth_tile_y, "color", fourth_team, game_config);
                fourth_block.value = fourth_value;
                
                game.make_green_move(green_key);
                game.make_orange_move(orange_key);
                game.handle_moving();
                game[green_key + "_key"].isDown = false;
                game[orange_key + "_key"].isDown = false;
                for (var i = 0; i < num_updates-1; i++) {
                    game.handle_moving();
                }
                for ([block, x, y, value, team] of [[block, new_tile_x, new_tile_y, expected_value, team], [other_block, new_other_tile_x, new_other_tile_y, expected_other_value, other_team], [third_block, new_third_tile_x, new_third_tile_y, expected_third_value, third_team], [fourth_block, new_fourth_tile_x, new_fourth_tile_y, expected_fourth_value, fourth_team]]) {
                    // block should be gone
                    let has_destroy_animation = false;
                    for (anim of block.animations) {
                        if (anim[0] === "merge" || anim[0] === "destroy") {
                            has_destroy_animation = true;
                        }
                    }
                    expect(has_destroy_animation).to.equal((x === null || y === null || value === null), "block does not have a destroy animation");

                    if (x === null || y === null || value === null) {
                        continue;
                    }
                    // block should be in the position and value described by input
                    expect(block.tile_x).to.equal(x, "x position of " + team + " block is wrong");
                    expect(block.tile_y).to.equal(y, "y position of " + team + " block is wrong");
                    expect(block.value).to.equal(value, "value of " + team + " block is wrong");
                }
            }
    );
});