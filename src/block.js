
const block_config = {
    animation_speed: 8,
}

class Block{
    constructor(scene, x, y, children, color, size, padding, team, value, tile_x, tile_y, block_id, wall_id, drawing) {
        if (drawing) {
            this.container = new Phaser.GameObjects.Container(scene, x, y, children);
            scene.add.existing(this.container);
        } else {
            this.container = {x: x, y: y, destroy : function() {return;}}; // stub for testing
        }
        this.wall_id = wall_id;
        this.color = color;
        this.size = size;
        this.scene = scene;
        this.moving_direction = null;
        this.is_moving = false;
        this.will_be_removed = false;
        this.movement_status = 0
        // 0 = not moving, 1 = done moving but can move more, 2 = moving
        this.total_moved = 0;
        this.total_movement_distance = 0;
        // the distance the block will move for the current animation step
        this.padding = padding;
        this.team = team;
        this.value = value;
        this.text_value = value;
        // the value of the block currently displayed, used for animations
        this.tile_x = tile_x;
        this.tile_y = tile_y;
        this.space_size = this.size+(this.padding*2);
        this.rect = null
        this.block_id = block_id
        this.animations = []
        // block_id is just a random value assigned to every block, I use it to tell blocks apart in console logs
        if (drawing) {
            this.create();
        }
    }

    create() {
        this.rect = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, this.size, this.size, this.color);
        this.container.add(this.rect);
        let style = { font: "bold 1px Arial", fill: "#fffff", boundsAlignH: "center", boundsAlignV: "middle" };

        this.text = new Phaser.GameObjects.Text(this.scene, 0, 0, this.value, style);
        this.container.add(this.text);
    }
    
    update() {
        
        // update value text
        if (this.text !== undefined && !this.will_be_removed) {
            this.text.setText(this.text_value);
        }
        
        if (this.text !== undefined && !this.will_be_removed) {
            let text_size = this.size * 1.1 - (this.text_value.toString().length * this.size * 0.18)
            this.text.setFontSize(text_size)
            this.text.setOrigin(0.5)
        }

        if (this.total_movement_distance > 0 && this.is_moving) {

            let to_move = 0;
            if (this.total_moved + block_config.animation_speed > this.total_movement_distance) {
                to_move = this.total_movement_distance - this.total_moved;
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
            
            if (this.total_moved === this.total_movement_distance) {
                this.total_moved = 0;
                this.total_movement_distance = 0;
            }
            
        }
        else if (this.is_moving) {
            if (this.animations.length === 0) {
                this.is_moving = false;
            }
            else if (this.total_movement_distance === 0) {
                let animation_step = this.animations.shift()
                if (animation_step.at(0) === "move") {
                    this.total_movement_distance = (this.size+(this.padding*2)) * animation_step.at(1)
                }
                else if (animation_step.at(0) === "merge" || animation_step.at(0) === "destroy") {
                    // there might be an issue here, if the two blocks in a destroy event aren't ever visually in the same space
                    // (that shouldn't happen because it would look odd but it's something to consider)
                    // would probably want to seperate this later after animations get added
                    if (animation_step.at(1).container.x === this.container.x && animation_step.at(1).container.y === this.container.y) {
                        console.log('block destroyed', this, animation_step.at(1))
                        this.rect.destroy()
                        this.text.destroy()
                    }
                    else {
                        this.animations = [["merge", animation_step.at(1)]].concat(this.animations)
                    }
                }
                else if (animation_step.at(0) === "increase value") {
                    if (animation_step.at(1).container.x === this.container.x && animation_step.at(1).container.y === this.container.y) {
                        this.text_value *= 2
                    }
                    else {
                        this.animations = [["increase value", animation_step.at(1)]].concat(this.animations)
                    }
                }
            }
        }
    }

    block_remove() {
        console.log("block was removed", this)
        this.container.destroy();
        // set all properties to null so that the garbage collector can clean up the object and errors will be throw if we try access it
        for (let prop in this) {
            this[prop] = null;
        }
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
        this.movement_status = 1;
        this.update_movement_animation();
        // this.is_moving = true;
    }
    /**
     * Adds a step of movement to the animation path.
     * If the current last step of the block animation path is 
     */
    update_movement_animation() {
        // right now this makes the assumption that a block's movement direction will stay the same throughout movement
        // (bouncing works fine with this, though)
        if (this.animations.length > 0 && this.animations.at(this.animations.length-1).at(0) === "move") {
            let movement_distance = this.animations.at(this.animations.length-1).at(1) + 1
            this.animations.splice(this.animations.length-1, 1, ["move", movement_distance])
        }
        else {
            this.animations.push(["move", 1]);
        }
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
            if (this.wall_id.includes(tile_in_direction.layer.data[tile_in_direction.y][tile_in_direction.x].index)) {
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
        this.text_value = this.value;
    }
}

// exports
module.exports = {
    block_config: block_config,
    Block: Block,
}
