
const block_config = {
    animation_speed: 8,
    wall_id: 6,
    green_id: 57,   // spawning area
    orange_id: 127, // spawning area
}

class Block{
    constructor(scene, x, y, children, color, size, padding, team, value, tile_x, tile_y, block_id, drawing) {
        if (drawing) {
            this.container = new Phaser.GameObjects.Container(scene, x, y, children);
            scene.add.existing(this.container);
        } else {
            this.container = {x: x, y: y, destroy : function() {return;}}; // stub for testing
        }
        this.color = color;
        this.size = size;
        this.scene = scene;
        this.moving_direction = null;
        this.is_moving = false;
        this.movement_status = 0
        // 0 = not moving, 1 = done moving but can move more, 2 = moving
        this.total_moved = 0;
        this.padding = padding;
        this.team = team;
        this.value = value;
        this.tile_x = tile_x;
        this.tile_y = tile_y;
        this.space_size = this.size+(this.padding*2);
        this.rect = null
        this.block_id = block_id
        // block_id is just a random value assigned to every block, I use it to tell blocks apart in console logs
        if (drawing) {
            this.create();
        }
    }

    create() {
        this.rect = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, this.size, this.size, this.color);
        this.container.add(this.rect);
        // TODO this is hard coded
        let style = { font: "bold 25px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        // TODO this is hard coded too kinda
        this.text = new Phaser.GameObjects.Text(this.scene, -this.size/2.5, -this.size/1.5, this.value, style)
        this.container.add(this.text);
    }

    update() {

        // update value text
        if (this.text !== undefined) {
            this.text.setText(this.value);
        }
        
        if (this.total_moved < this.size+(this.padding*2) && this.is_moving) {
            
            if (this.movement_status === 0 && this.total_moved === 0) {
                this.is_moving = false;
                return;
            }

            // if (!this.should_move_another_space(this.moving_direction) && this.total_moved === 0) {
            //     this.moving_direction = null;
            //     this.is_moving = false;
            //     return;
            // }

            let to_move = 0;
            if (this.total_moved + block_config.animation_speed > this.size+(this.padding*2)) {
                to_move = this.size+(this.padding*2) - this.total_moved;
            } else {
                to_move = block_config.animation_speed;
            }
            
            if (this.moving_direction === 'up') {
                this.container.y -= to_move;
            }
            else if (this.moving_direction === 'down') {
                this.container.y += to_move;
            }
            else if (this.moving_direction === 'left') {
                this.container.x -= to_move;
            }
            else if (this.moving_direction === 'right') {
                this.container.x += to_move;
            }
            
            this.total_moved += to_move;

            // we want to stop moving if we are at the center of a block and we cant keep moving
            
            if (this.total_moved === this.size+(this.padding*2)) {
                this.update_visuals();
                this.is_moving = false;
                this.total_moved = 0;
                this.movement_status = 1;
            }
            
        }
    }

    block_remove() {
        this.container.destroy();
        // set all properties to null so that the garbage collector can clean up the object and errors will be throw if we try access it
        for (let prop in this) {
            this[prop] = null;
        }
    }

    go_direction(direction) {
        this.moving_direction = direction;
    }
    
    begin_movement() {
        this.is_moving = true;
        this.movement_status = 2;
    }

    /**
     * Moves the block one space ahead in the given direction, unless doing so would place the block in a wall.
     * @param {*} direction The direction the block will move in.
     */
    move_space(direction) {
        if (this.movement_status !== 1) {
            // in this case, the block is either done moving for the turn or is currently moving, and shouldn't move another space.
            return;
        }
        else if (this.check_if_wall_in_direction(direction)) {
            // if moving another space would put the block in a wall, the block doesn't move for the rest of the turn.
            this.movement_status = 0;
            return;
        }
        this.moving_direction = direction;
        if (this.moving_direction === 'up') {
            this.tile_y -= 1;
        }
        else if (this.moving_direction === 'down') {
            this.tile_y += 1;
        }
        else if (this.moving_direction === 'left') {
            this.tile_x -= 1;
        }
        else if (this.moving_direction === 'right') {
            this.tile_x += 1;
        }
        this.movement_status = 2;
        this.is_moving = true;
    }

    /**
     * Moves the block one space in the opposite direction and stops the block from moving for the rest of the turn.
     */
    bounce() {
        if (this.movement_status === 0) {
            return;
        }
        else if (this.moving_direction === 'up') {
            this.tile_y += 1;
        }
        else if (this.moving_direction === 'down') {
            this.tile_y -= 1;
        }
        else if (this.moving_direction === 'left') {
            this.tile_x += 1;
        }
        else if (this.moving_direction === 'right') {
            this.tile_x -= 1;
        }
        this.movement_status = 0;
        this.update_visuals()
    }

    should_move_another_space(direction) {
        if (direction === null) {
            return false;
        }
        const wall_in_direction = this.check_if_wall_in_direction(direction);
        // const block_in_direction = this.check_if_block_in_direction(direction, this.scene.orange_blocks);
        // const block_in_direction2 = this.check_if_block_in_direction(direction, this.scene.green_blocks);
        return !wall_in_direction;
    }

    check_if_block_in_direction(direction, list_of_blocks) {
        const tile_in_direction = this.get_tile_in_direction(direction);
        for (let i = 0; i < list_of_blocks.length; i++) {
            const block = list_of_blocks[i];
            const tile = this.scene.map.getTileAtWorldXY(block.container.x, block.container.y);
            if (tile === tile_in_direction) {
                // if the tile is moving the same direction and it can move another space then we dont care about interacting with it
                if (block.moving_direction === direction && block.should_move_another_space(block.moving_direction)) {
                    continue;
                }
                return true;
            }
        }
        return false;
    }

    /**
     * Checks if the block has passes another block going in the opposite direction. Used for collision.
     * @param {*} direction The direction the block is moving.
     * @param {*} list_of_blocks The list of blocks to check for collision with.
     * @returns 
     */
    passed_block(direction, list_of_blocks) {
        const tile_in_direction = this.get_tile_in_direction(this.get_reverse_direction(direction));
        for (let block of list_of_blocks) {
            const tile = this.scene.map.getTileAtWorldXY(block.container.x, block.container.y);
            if (tile === tile_in_direction) {
                // if the tile is moving the same direction and it can move another space then we dont care about interacting with it
                if (block.moving_direction === this.get_reverse_direction(direction) && block.movement_status !== 0) {
                    return block;
                }
                else {
                    return null;
                }
            }
        }
        return null;
    }

    check_if_wall_in_direction(direction) {        
        const tile_in_direction = this.get_tile_in_direction(direction);

        if (tile_in_direction !== null) {
            if (tile_in_direction.layer.data[tile_in_direction.y][tile_in_direction.x].index === block_config.wall_id) {
                return true;
            }
        }
        return false;
    }

    get_tile_in_direction(direction) {
        let tile_to_check = null;
        
        if (direction === 'up') {
            tile_to_check = this.scene.map.getTileAt(this.tile_x, this.tile_y - 1);
        }
        else if (direction === 'down') {
            tile_to_check = this.scene.map.getTileAt(this.tile_x, this.tile_y + 1);
        }
        else if (direction === 'left') {
            tile_to_check = this.scene.map.getTileAt(this.tile_x - 1, this.tile_y);
        }
        else if (direction === 'right') {
            tile_to_check = this.scene.map.getTileAt(this.tile_x + 1, this.tile_y);
        }

        return tile_to_check;
    }

    get_reverse_direction(direction) {
        if (direction === 'up') {
            return 'down';
        }
        else if (direction === 'down') {
            return 'up';
        }
        else if (direction === 'left') {
            return 'right';
        }
        else if (direction === 'right') {
            return 'left'
        }
    }

    get_block_team() {
        return this.team;
    }

    convert_tile_to_world(tile_x, tile_y) {
        return {
            x: (tile_x * this.space_size) + (this.space_size / 2),
            y: (tile_y * this.space_size) + (this.space_size / 2)
        }
    }

    update_visuals() {
        let canvas_coordiantes = this.convert_tile_to_world(this.tile_x, this.tile_y);
        this.container.x = canvas_coordiantes.x;
        this.container.y = canvas_coordiantes.y;
    }
}

// exports
module.exports = {
    block_config: block_config,
    Block: Block,
}
