
const block_config = {
    animation_speed: 100,
}

class Block{
    constructor(scene, x, y, children, color, size, padding, team, value, tile_x, tile_y, block_id, wall_ids, drawing) {
        if (drawing) {
            this.container = new Phaser.GameObjects.Container(scene, x, y, children);
            scene.add.existing(this.container);
        } else {
            this.container = {x: x, y: y, destroy : function() {return;}}; // stub for testing
        }
        this.wall_ids = wall_ids;
        this.color = color;
        this.size = size;
        this.scene = scene;
        this.moving_direction = null;
        this.reverse_movement = false;
        this.is_moving = false;
        this.will_be_removed = false;
        this.movement_status = 0
        // 0 = not moving, 1 = done moving but can move more, 2 = moving
        this.total_moved = 0;
        this.total_movement_distance = 0;
        // the distance the block will move for the current animation step
        this.next_space_distance = 0;
        // the total amount of space traveled needed to reach the next space during movement animations
        // this.log_count = 0;
        this.padding = padding;
        this.team = team;
        this.value = value;
        this.text_value = value;
        // the value of the block currently displayed, used for animations
        this.tile_x = tile_x;
        this.tile_y = tile_y;
        this.visual_tile_x = tile_x;
        this.visual_tile_y = tile_y;
        this.space_size = this.size+(this.padding*2);
        this.rect = null
        this.block_id = block_id
        this.animations_completed = true;
        // block_id is just a value assigned to every block, I use it to tell blocks apart in console logs
        this.animations = []
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
        
    }

    get_opposite_direction(direction) {
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

    calculate_movement_diffs(num_tiles_to_move) {
        let x_diff = 0;
        let y_diff = 0;

        let diff = (this.size+(this.padding*2)) * num_tiles_to_move

        if (this.moving_direction === "up") {
            y_diff = -diff;
        } else if (this.moving_direction === "down") {
            y_diff = diff;
        } else if (this.moving_direction === "left") {
            x_diff = -diff;
        } else if (this.moving_direction === "right") {
            x_diff = diff;
        }

        return {x: x_diff, y: y_diff}
    }

    remove_lone_bounce_animations() {
        if (this.animations.length < 2) {
            return;
        } else if (this.animations.length === 2){
            if (this.animations[0].at(0) === "move" && this.animations[0].at(1) === 1) {
                if (this.animations[1].at(0) === "bounce") {
                    this.animations = [];
                }
            }
        }
    }

    update_has_movement_animations() {
        // if there are no movement animations left
        let has_movement_animations = false;
        let total_spaces_moving = 0;
        for (let i = 0; i < this.animations.length; i++) {
            if (this.animations[i].at(0) === "move") {
                has_movement_animations = true;
                total_spaces_moving += this.animations[i].at(1);
                break;
            }
        }
        this.movement_completed = !has_movement_animations;
        this.total_movement_distance = total_spaces_moving;
    }

    evaluate_animations() {
        if (this.animations.length === 0) {
            this.movement_status = 0;
            this.is_moving = false;
            this.moving_direction = null;
            this.movement_completed = true;
            return;
        } else {
            this.update_has_movement_animations();
        }
        let animation_step = this.animations.shift()
        if (animation_step.at(0) === "move") {
            // move format: ["move", number of steps to move]
            let movement_diff = this.calculate_movement_diffs(animation_step.at(1))
            this.scene.tweens.add({
                targets: [this.container],
                duration: block_config.animation_speed * animation_step.at(1),
                x: movement_diff.x + this.container.x,
                y: movement_diff.y + this.container.y,
                ease : 'Linear',
                onComplete: this.evaluate_animations.bind(this)
            })
        }
        else if (animation_step.at(0) === "merge" || animation_step.at(0) === "destroy") {
            // there might be an issue here, if the two blocks in a destroy event aren't ever visually in the same space
            // (that shouldn't happen because it would look odd but it's something to consider)
            // would probably want to seperate this later after animations get added
            // destroy/merge format: ["merge" or "destroy", (block that this block is merging into/being destroyed by), is_direct]
            // fade out animation
            let duration = Math.max(1, animation_step.at(1).total_movement_distance - this.total_movement_distance) * block_config.animation_speed
            this.scene.tweens.add({
                targets: [this.container],
                duration: duration,
                scale: 0,
                ease : 'Quint.easeIn',
                onComplete: this.evaluate_animations.bind(this)
            })
        } else if (animation_step.at(0) === "increase value") {
            // increase value format: ["increase value", (block that this block is merging with), is_direct]
            // is_direct isn't being used at the moment since merges are always direct
            if (animation_step.at(1).movement_completed) {
                this.text_value *= 2
                this.scene.tweens.add({
                    targets: [this.container],
                    duration: 200,
                    scale: Math.min(1 + this.text_value/15, 2),
                    ease : 'Back.easeInOut',
                    yoyo : true,
                    repeat : 0,
                    onComplete: this.evaluate_animations.bind(this)
                })
            } else {
                this.animations.unshift(animation_step)
                // add tween animation to wait for other block to finsih its animations
                this.scene.tweens.add({
                    targets: [this.container],
                    duration: 10,
                    onComplete: this.evaluate_animations.bind(this)
                })
            }
        } else if (animation_step.at(0) === "bounce") {
            // bounce format: ["bounce"]
            this.scene.ohhaimark_play()
            this.moving_direction = this.get_opposite_direction(this.moving_direction)
            let movement_diff = this.calculate_movement_diffs(1)
            this.scene.tweens.add({
                targets: [this.container],
                duration: block_config.animation_speed,
                x: movement_diff.x + this.container.x,
                y: movement_diff.y + this.container.y,
                ease : 'Circ.easeOut',
                onComplete: this.evaluate_animations.bind(this)
            })
        }
    }

    /**
     * Checks if the given block is visually on the same space as the current block.
     * @param {*} block 
     * @returns True if the given block is on the same space as the current block, false if not.
     */
    block_at_same_tile(block) {
        return (block.visual_tile_x === this.visual_tile_x && block.visual_tile_y === this.visual_tile_y)
    }

    /**
     * Checks if the given block is one tile behind the current block.
     * @param {*} block 
     * @param {*} using_visual_position Whether or not the function checks the visual position of the blocks (true) or the tile positon (false).
     * @returns True if the given block is behind the current block, false if not.
     */
    block_at_opposite_tile(block, using_visual_position) {
        let direction = this.get_reverse_direction(this.moving_direction)
        if (using_visual_position) {
            if (direction === 'up') {
                return (block.visual_tile_x === this.visual_tile_x && block.visual_tile_y === this.visual_tile_y-1)
            }
            else if (direction === 'down') {
                return (block.visual_tile_x === this.visual_tile_x && block.visual_tile_y === this.visual_tile_y+1)
            }
            else if (direction === 'left') {
                return (block.visual_tile_x === this.visual_tile_x-1 && block.visual_tile_y === this.visual_tile_y)
            }
            else if (direction === 'right') {
                return (block.visual_tile_x === this.visual_tile_x+1 && block.visual_tile_y === this.visual_tile_y)
            }
        } else {
            if (direction === 'up') {
                return (block.tile_x === this.tile_x && block.tile_y === this.tile_y-1)
            }
            else if (direction === 'down') {
                return (block.tile_x === this.tile_x && block.tile_y === this.tile_y+1)
            }
            else if (direction === 'left') {
                return (block.tile_x === this.tile_x-1 && block.tile_y === this.tile_y)
            }
            else if (direction === 'right') {
                return (block.tile_x === this.tile_x+1 && block.tile_y === this.tile_y)
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
        if (direction === 'up') {
            this.tile_y -= 1;
        }
        else if (direction === 'down') {
            this.tile_y += 1;
        }
        else if (direction === 'left') {
            this.tile_x -= 1;
        }
        else if (direction === 'right') {
            this.tile_x += 1;
        }
        this.movement_status = 1;
        this.update_movement_animation();
        // this.is_moving = true;
    }
    /**
     * Adds a step of movement to the animation path.
     * If the current last step of the block animation path is a movement step, updates that step to move another space instead.
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
        this.animations.push(["bounce"])
        this.movement_status = 0;
    }

    /**
     * Checks if the block has passes another block going in the opposite direction. Used for collision.
     * @param {*} direction The direction the block is moving.
     * @param {*} list_of_blocks The list of blocks to check for collision with.
     * @returns 
     */
    passed_block(list_of_blocks) {
        for (let block of list_of_blocks) {
            if (this.block_at_opposite_tile(block, false) && block.moving_direction === this.get_reverse_direction(this.moving_direction)
            && block.movement_status !== 0) {
                return block
            }
        }
        return null;
    }

    check_if_wall_in_direction(direction, distance) {        
        const tile_in_direction = this.get_tile_in_direction(direction, distance);

        if (tile_in_direction !== null) {
            if (this.wall_ids.includes(tile_in_direction.layer.data[tile_in_direction.y][tile_in_direction.x].index)) {
                return true;
            }
        }
        return false;
    }

    get_tile_in_direction(direction, distance) {
        if (distance == null) [
            distance = 1
        ]
        let tile_to_check = null;
        
        if (direction === 'up') {
            tile_to_check = this.scene.map.getTileAt(this.tile_x, this.tile_y - distance);
        }
        else if (direction === 'down') {
            tile_to_check = this.scene.map.getTileAt(this.tile_x, this.tile_y + distance);
        }
        else if (direction === 'left') {
            tile_to_check = this.scene.map.getTileAt(this.tile_x - distance, this.tile_y);
        }
        else if (direction === 'right') {
            tile_to_check = this.scene.map.getTileAt(this.tile_x + distance, this.tile_y);
        }

        return tile_to_check;
    }
    
    /**
     * Checks if there is an empty space in the given direction between the block and any walls.
     * @param {*} direction 
     * @param {*} distance The distance from the block to check. Used for recursion, 1 is the default value.
     * @param {*} block_list The list of all blocks currently on screen.
     * @returns True if there is an empty space in the given direction, false if not.
     */
    is_any_space_empty(direction, distance, block_list) {
        if (this.check_if_wall_in_direction(direction, distance)) {
            return false
        }
        let tile = this.get_tile_in_direction(direction, distance);
        for (let block of block_list) {
            if (tile.x === block.tile_x && tile.y === block.tile_y && block !== this) {
                return this.is_any_space_empty(direction, distance + 1, block_list)
            }
        }
        return true         
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

    convert_tile_to_world(x, y) {
        const tile = this.scene.map.getTileAt(x, y);
        const world_x = tile.getCenterX();
        const world_y = tile.getCenterY();
        return {
            x: world_x,
            y: world_y,
        }
    }

    update_visuals() {
        // this.log_count = 0
        let canvas_coordiantes = this.convert_tile_to_world(this.tile_x, this.tile_y);
        this.container.x = canvas_coordiantes.x;
        this.container.y = canvas_coordiantes.y;
        this.text_value = this.value;
        this.visual_tile_x = this.tile_x;
        this.visual_tile_y = this.tile_y;
    }
}

// exports
module.exports = {
    block_config: block_config,
    Block: Block,
}
