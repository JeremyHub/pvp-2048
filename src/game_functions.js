var {Block, block_config} = require('./Block');

/**
 * Checks if all of the given blocks have finished moving for the turn.
 * @param {*} blocks 
 * @returns 
 */
function calculations_finished(blocks) {
    for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].movement_status !== 0) {
            return false;
        }
    }
    return true;
}

function turn_finished(blocks) {
    for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].movement_status !== 0 || blocks[i].is_moving) {
            return false;
        }
    }
    return true;
}

/**
 * Moves the given list of blocks one space in the given direction.
 * @param {*} blocks The list of blocks that will move.
 * @param {*} direction The direction the blocks will move in.
 */
function move_blocks(blocks, direction) {
    for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].movement_status === 1) {
            blocks[i].moving_direction = direction;
            blocks[i].move_space(direction);
        }
    }
}

/**
 * Checks if any block from the given list is currently moving.
 * @param {*} blocks 
 * @returns true if any block is moving, false if not.
 */
function is_any_block_moving(blocks) {
    if (blocks.length === 0) {
        return false;
    }
    for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].movement_status === 2 || blocks[i].is_moving) {
            return true;
        }
    }
    return false;
}

/**
 * Checks if any blocks within the given list of blocks are on the same space, and if so resolves the collision.
 * @param {*} blocks 
 */
function check_collisions(blocks, green_blocks, orange_blocks, seed) {

    let should_recheck_collision = false;
    let other_block = null;
    for (let green_block of green_blocks) {
        // this checks if two adjacent blocks are moving towards eachother
        other_block = green_block.passed_block(orange_blocks)
        // TODO currently it only checks for enemy blocks, since all blocks on the same team move the same direction
        if (other_block !== null) {
            if (!evaluate_collision([green_block, other_block], false, seed, blocks)) {
                should_recheck_collision = true;
            }
        }
    }

    let blocks_on_each_tile = {};
    for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].will_be_removed === false) {
            if (blocks_on_each_tile[blocks[i].tile_x + "," + blocks[i].tile_y] === undefined) {
                blocks_on_each_tile[blocks[i].tile_x + "," + blocks[i].tile_y] = [blocks[i]];
            }
            else {
                blocks_on_each_tile[blocks[i].tile_x + "," + blocks[i].tile_y].push(blocks[i]);
            }
        }
    }
    
    for (let tile in blocks_on_each_tile) {
        if (blocks_on_each_tile[tile].length > 1) {
            if (!evaluate_collision(blocks_on_each_tile[tile], true, seed, blocks)) {
                should_recheck_collision = true;
            }
        }
    }
    if (should_recheck_collision) {
        // it's possible that a block bounces into another block, so if a block bounces collision needs to be checked again
        check_collisions(blocks, green_blocks, orange_blocks, seed);
    }
}

/**
 * Handles collision movment/destruction between two blocks. 
 * Returns true if the collision is valid, meaning that one of the blocks stays on the space while the other is removed.
 * @param {*} colliding_blocks the list of blocks to check collision for
 * @param {*} is_direct whether or not the collision is direct (blocks are on the same tile) or indirect (blocks passes each other)
 */
function evaluate_collision(colliding_blocks, is_direct, seed, block_list) {

    let tile_colliding_on_coords = {x: colliding_blocks[0].tile_x, y: colliding_blocks[0].tile_y};

    // assert at least one block is moving
    let moving_block = null;
    for (let i = 0; i < colliding_blocks.length; i++) {
        if (colliding_blocks[i].movement_status !== 0) {
            moving_block = colliding_blocks[i];
            break;
        }
    }

    
    // TODO dont hardcode the names of the teams
    // sort the blocks into two lists by team
    let green_colliding_blocks = [];
    let orange_colliding_blocks = [];
    for (let block of colliding_blocks) {
        if (block.team === "green") {
            green_colliding_blocks.push(block);
        }
        else {
            orange_colliding_blocks.push(block);
        }
    }
    
    // sort the blocks by value, so that the block with the lower value is first
    green_colliding_blocks.sort((a, b) => a.value - b.value);
    orange_colliding_blocks.sort((a, b) => a.value - b.value);

    // TODO the team who moved first should combine first
    let first_team = "green";

    let first_team_blocks = first_team === "green" ? green_colliding_blocks : orange_colliding_blocks;
    let second_team_blocks = first_team === "orange" ? green_colliding_blocks : orange_colliding_blocks;

    let return_value = true;
    // this will change to false if any blocks bounce

    // check for combinations for teams in order
    for (let team_colliding_blocks of [first_team_blocks, second_team_blocks]){
        for (let i = 0; i < team_colliding_blocks.length; i++) {
            for (let j = i + 1; j < team_colliding_blocks.length; j++) {
                if (team_colliding_blocks[i].value === team_colliding_blocks[j].value) {
                    // valid friendly collision, merge blocks
                    team_colliding_blocks[i].value = team_colliding_blocks[i].value * 2;
                    team_colliding_blocks[i].animations.push(["increase value", team_colliding_blocks[j], is_direct])
                    let removed_team = team_colliding_blocks[j].team;
                    team_colliding_blocks[j].animations.push(["merge", team_colliding_blocks[i], is_direct])
                    // console.log("block should have added merge to animations", team_colliding_blocks[j], team_colliding_blocks[j].animations)
                    team_colliding_blocks[j].will_be_removed = true
                    team_colliding_blocks[j].movement_status = 0;
                    if (removed_team === first_team) {
                        first_team_blocks.splice(first_team_blocks.indexOf(team_colliding_blocks[j]), 1);
                    }
                    else {
                        second_team_blocks.splice(second_team_blocks.indexOf(team_colliding_blocks[j]), 1);
                    }
                    team_colliding_blocks[i].movement_status = 0;
                    // after a valid collision, the blocks should stop moving
                }
            }
        }
    }

    // check for collisions between teams
    let removed_blocks = [];
    for (let i = 0; i < first_team_blocks.length; i++) {
        for (let j = 0; j < second_team_blocks.length; j++) {
            if (removed_blocks.indexOf(j) === -1 && first_team_blocks[i].value !== second_team_blocks[j].value) {
                // valid enemy collision, one block should be destroyed
                if (first_team_blocks[i].value > second_team_blocks[j].value) {
                    second_team_blocks[j].animations.push(["destroy", first_team_blocks[i], is_direct])
                    second_team_blocks[j].will_be_removed = true
                    removed_blocks.push(j)
                    // after a valid collision, the block should stop moving
                    first_team_blocks[i].movement_status = 0;
                }
                else {
                    first_team_blocks[i].animations.push(["destroy", second_team_blocks[j], is_direct])
                    first_team_blocks[i].will_be_removed = true
                    // after a valid collision, the block should stop moving
                    second_team_blocks[j].movement_status = 0;
                }
            }
        }
    }

    // if nothing happened, the blocks should bounce off of each other
    for (let block of colliding_blocks) {
        block.bounce();
        return_value = false;
    }

    let blocks_still_on_tile = [];
    for (let block of colliding_blocks) {
        if (block.tile_x === tile_colliding_on_coords.x && block.tile_y === tile_colliding_on_coords.y && block.will_be_removed === false) {
            blocks_still_on_tile.push(block);
        }
    }
    if (blocks_still_on_tile.length == 2) {
        if (blocks_still_on_tile[0].team === blocks_still_on_tile[1].team) {
            if (blocks_still_on_tile[0].value !== blocks_still_on_tile[1].value) {
                // same team, diff value, bounce
                // figure out which block should move relative to the direction of the collision
                let block_to_move;
                if (blocks_still_on_tile[0].moving_direction === "up") {
                    block_to_move = (blocks_still_on_tile[0].tile_y < blocks_still_on_tile[1].tile_y) ? blocks_still_on_tile[0] : blocks_still_on_tile[1];
                } else if (blocks_still_on_tile[0].moving_direction === "down") {
                    block_to_move = (blocks_still_on_tile[0].tile_y > blocks_still_on_tile[1].tile_y) ? blocks_still_on_tile[0] : blocks_still_on_tile[1];
                } else if (blocks_still_on_tile[0].moving_direction === "left") {
                    block_to_move = (blocks_still_on_tile[0].tile_x < blocks_still_on_tile[1].tile_x) ? blocks_still_on_tile[0] : blocks_still_on_tile[1];
                } else if (blocks_still_on_tile[0].moving_direction === "right") {
                    block_to_move = (blocks_still_on_tile[0].tile_x > blocks_still_on_tile[1].tile_x) ? blocks_still_on_tile[0] : blocks_still_on_tile[1];
                }

                let opposite_direction = get_opposite_direction(block_to_move.moving_direction);
                block_to_move.movement_status = 1;
                block_to_move.move_space(opposite_direction);
            }
        } else {
            let blocks_able_to_bounce = []
            for (let block of blocks_still_on_tile) {
                if (block.is_any_space_empty(get_opposite_direction(block.moving_direction), 1, block_list)) {
                    blocks_able_to_bounce.push(block)
                }
            }
            let block = null
            block = blocks_able_to_bounce.at(0)
            block.movement_status = 1
            block.move_space(get_opposite_direction(block.moving_direction))
            block.movement_status = 0
        }
    }

    return return_value;
}

function get_opposite_direction(direction) {
    if (direction === "up") {
        return "down";
    } else if (direction === "down") {
        return "up";
    } else if (direction === "left") {
        return "right";
    } else if (direction === "right") {
        return "left";
    }
}

/**
 * Removes the specified block from the lists of blocks and canvas.
 * @param {*} block The block that will be removed from the lists/canvas.
 * @param {*} blocks The list of all blocks currently being used in the game. 
 * @param {*} orange_blocks The list of all orange blocks currently being used.
 * @param {*} green_blocks The list of all green blocks currently being used.
 */
function remove_block(block, blocks, green_blocks, orange_blocks) {
    blocks.splice(blocks.indexOf(block), 1)
    if (block.team === 'green') {
        green_blocks.splice(green_blocks.indexOf(block), 1);
    }
    else if (block.team === 'orange') {
        orange_blocks.splice(orange_blocks.indexOf(block), 1);
    }
}

function create_block(game, list_of_blocks, x, y, color, team, game_config, value=2) {
    const tile = game.map.getTileAt(x, y);
    const world_x = tile.getCenterX();
    const world_y = tile.getCenterY();
    const block = new Block(game, world_x, world_y, [], color, game_config.tile_size - (game_config.padding * 2), game_config.padding, team, value, x, y, Math.random(), game_config.wall_id, game.is_drawing);
    list_of_blocks.push(block);
    return block;
}

function block_in_tile(x, y, game, list_of_blocks) {
    const origin_tile = game.map.getTileAt(x, y);
    for (let i = 0; i < list_of_blocks.length; i++) {
        const tile = game.map.getTileAtWorldXY(list_of_blocks[i].container.x, list_of_blocks[i].container.y)
        if (tile.x === origin_tile.x && tile.y === origin_tile.y) {
            return true;
        }
    }
    return false;
}


function spawnblocks(game, spawnarea, team, list_of_blocks, game_config, seed) {

    let color;
    if (team === 'green') {
        color = game_config.green_color;
    }
    else if (team === 'orange') {
        color = game_config.orange_color;
    }

    let spawnable_tiles = [];
    for (let x = 0; x < game_config.num_cols; x++) {
        for (let y = 0; y < game_config.num_rows; y++) {
            const tile = game.map.getTileAt(x, y);
            if (!spawnarea.includes(game.map.layer.data[tile.y][tile.x].index) || (block_in_tile(x, y, game, game.orange_blocks) || block_in_tile(x, y, game, game.green_blocks))) {
                continue;
            }
            spawnable_tiles.push({x: x, y: y});
        }
    }

    if (spawnable_tiles.length === 0) {
        return;
    }

    const random = new Phaser.Math.RandomDataGenerator([seed]);
    const spawn_tile = spawnable_tiles[random.integerInRange(0, spawnable_tiles.length - 1)];
    create_block(game, list_of_blocks, spawn_tile.x, spawn_tile.y, color, team, game_config);

}


function box_in(game, value, game_config) {
    const width = game_config.num_cols;
    const height = game_config.num_rows
    
    // Set left and right boundaries
    for (let i = 0; i < height; i++) {
      game.map.putTileAt(value, game.box_in_counter, i );
      game.map.putTileAt(value, (width - 1 - game.box_in_counter), i);
    }
  
    // Set top and bottom boundaries
    for (let i = 0; i < width; i++) {
      game.map.putTileAt(value, i, game.box_in_counter);
      game.map.putTileAt(value, i, (height - 1 - game.box_in_counter));
    }
    game.box_in_counter++;
}

function getTotalValueOfBlocks(blockList) {             
    let totalValue = 0;                                 
    for (let i = 0; i < blockList.length; i++) {
      totalValue += blockList[i].value;
    }
    return totalValue;
}

function removePlayerWalls() {
    
}


module.exports = {
    removePlayerWalls,
    getTotalValueOfBlocks,
    box_in,
    spawnblocks,
    block_in_tile,
    create_block,
    remove_block,
    check_collisions,
    is_any_block_moving,
    calculations_finished,
    turn_finished,
    move_blocks,
}