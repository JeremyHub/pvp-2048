var {Block, block_config} = require('./block');

/**
 * Checks if all of the given blocks have finished moving for the turn.
 * @param {*} blocks 
 * @returns 
 */
function turn_finished(blocks) {
    for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].movement_status !== 0) {
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
function check_collisions(blocks, green_blocks, orange_blocks) {

    let should_recheck_collision = false;
    let other_block = null;
    for (let green_block of green_blocks) {
        // this checks if two adjacent blocks are moving towards eachother
        other_block = green_block.passed_block(green_block.moving_direction, orange_blocks)
        // TODO currently it only checks for enemy blocks, since all blocks on the same team move the same direction
        if (other_block !== null) {
            if (!evaluate_collision([green_block, other_block], blocks, green_blocks, orange_blocks)) {
                should_recheck_collision = true;
            }
        }
    }

    let blocks_on_each_tile = {};
    for (let i = 0; i < blocks.length; i++) {
        if (blocks_on_each_tile[blocks[i].tile_x + "," + blocks[i].tile_y] === undefined) {
            blocks_on_each_tile[blocks[i].tile_x + "," + blocks[i].tile_y] = [blocks[i]];
        }
        else {
            blocks_on_each_tile[blocks[i].tile_x + "," + blocks[i].tile_y].push(blocks[i]);
        }
    }
    
    for (let tile in blocks_on_each_tile) {
        if (blocks_on_each_tile[tile].length > 1) {
            if (!evaluate_collision(blocks_on_each_tile[tile], blocks, green_blocks, orange_blocks)) {
                should_recheck_collision = true;
            }
        }
    }
    if (should_recheck_collision) {
        // it's possible that a block bounces into another block, so if a block bounces collision needs to be checked again
        check_collisions(blocks, green_blocks, orange_blocks);
    }
}

/**
 * Handles collision movment/destruction between two blocks. 
 * Returns true if the collision is valid, meaning that one of the blocks stays on the space while the other is removed.
 * @param {*} first_block 
 * @param {*} second_block 
 */
function evaluate_collision(colliding_blocks, blocks, green_blocks, orange_blocks) {

    // assert at least one block is moving
    let moving_block = null;
    for (let i = 0; i < colliding_blocks.length; i++) {
        if (colliding_blocks[i].movement_status !== 0) {
            moving_block = colliding_blocks[i];
            break;
        }
    }
    if (moving_block === null) {
        console.error("no blocks are moving");
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
    // randomize which team moves first
    let first_team = Math.random() < 0.5 ? "green" : "orange";

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
                    remove_block(team_colliding_blocks[j], blocks, green_blocks, orange_blocks);
                    if (team_colliding_blocks[j].team === first_team) {
                        first_team_blocks.splice(first_team_blocks.indexOf(team_colliding_blocks[j]), 1);
                    }
                    else {
                        second_team_blocks.splice(second_team_blocks.indexOf(team_colliding_blocks[j]), 1);
                    }
                    team_colliding_blocks[i].movement_status = 0;
                    // after a valid collision, the block should stop moving
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
                    remove_block(second_team_blocks[j], blocks, green_blocks, orange_blocks);
                    removed_blocks.push(j)
                    // after a valid collision, the block should stop moving
                    first_team_blocks[i].movement_status = 0;
                }
                else {
                    remove_block(first_team_blocks[i], blocks, green_blocks, orange_blocks);
                    // after a valid collision, the block should stop moving
                    second_team_blocks[j].movement_status = 0;
                }
            }
        }
    }

    // if nothing happened, the blocks should bounce off of each other
    for (let block of colliding_blocks) {
        if (block.movement_status !== null){
            block.bounce();
            return_value = false;
        }
    }
    return return_value;
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
    block.block_remove();
    // removes the block from the canvas
}

function create_block(game, list_of_blocks, x, y, color, team, game_config) {
    const coords = convert_tile_to_world(x, y, game_config);
    const block = new Block(game, coords.x, coords.y, [], color, game_config.tile_size - (game_config.padding * 2), game_config.padding, team, 2, x, y, Math.random(), game_config.wall_id, game.is_drawing);
    list_of_blocks.push(block);
    return block;
}

function convert_tile_to_world(tile_x, tile_y, game_config) {
    return {
        x: (tile_x * game_config.tile_size) + (game_config.tile_size / 2),
        y: (tile_y * game_config.tile_size) + (game_config.tile_size / 2)
    }
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


function spawnblocks(game, spawnarea, team, list_of_blocks, game_config) {

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

    const spawn_tile = spawnable_tiles[Math.floor(Math.random() * spawnable_tiles.length)];
    create_block(game, list_of_blocks, spawn_tile.x, spawn_tile.y, color, team);

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


module.exports = {
    box_in,
    spawnblocks,
    block_in_tile,
    convert_tile_to_world,
    create_block,
    remove_block,
    check_collisions,
    is_any_block_moving,
    turn_finished,
    move_blocks,
}