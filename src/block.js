import Phaser from 'phaser';

export const block_config = {
    animation_speed: 50,
    wall_id: 6,
}

export class Block extends Phaser.GameObjects.Container{
    constructor(scene, x, y, children, color, size, padding) {
        super(scene, x, y, children);
        this.color = color;
        this.size = size;
        this.scene = scene;
        this.scene.add.existing(this);
        this.moving_direction = null;
        this.is_moving = false;
        this.total_moved = 0;
        this.padding = padding;
        this.create();
    }

    create() {
        const rect = this.scene.add.rectangle(0, 0, this.size, this.size, this.color);
        this.add(rect);
    }

    update() {
        
        if (this.total_moved < this.size+(this.padding*2) && this.moving_direction !== null) {

            this.is_moving = true;
            
            if (!this.should_move_another_space(this.moving_direction) && this.total_moved === 0) {
                this.moving_direction = null;
                this.is_moving = false;
                return;
            }

            let to_move = 0;
            if (this.total_moved + block_config.animation_speed > this.size+(this.padding*2)) {
                to_move = this.size+(this.padding*2) - this.total_moved;
            } else {
                to_move = block_config.animation_speed;
            }
            
            if (this.moving_direction === 'up') {
                this.y -= to_move;
            }
            else if (this.moving_direction === 'down') {
                this.y += to_move;
            }
            else if (this.moving_direction === 'left') {
                this.x -= to_move;
            }
            else if (this.moving_direction === 'right') {
                this.x += to_move;
            }
            
            this.total_moved += to_move;

            // we want to stop moving if we are at the center of a block and we cant keep moving
            
            if (this.total_moved === this.size+(this.padding*2)) {
                if (!this.should_move_another_space(this.moving_direction)) {
                    this.moving_direction = null;
                    this.is_moving = false;
                }
                this.total_moved = 0;
            }
            
        }
    }

    go_direction(direction) {
        this.moving_direction = direction;
    }

    should_move_another_space(direction) {
        if (direction === null) {
            return false;
        }
        const wall_in_direction = this.check_if_wall_in_direction(direction);
        const block_in_direction = this.check_if_block_in_direction(direction);
        return !wall_in_direction && !block_in_direction;
    }

    check_if_block_in_direction(direction) {
        const tile_in_direction = this.get_tile_in_direction(direction);
        for (let i = 0; i < this.scene.blocks.length; i++) {
            const block = this.scene.blocks[i];
            const tile = this.scene.map.getTileAtWorldXY(block.x, block.y);
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
        let tile = this.scene.map.getTileAtWorldXY(this.x, this.y);

        let tile_to_check = null;
        if (direction === 'up') {
            tile_to_check = this.scene.map.getTileAt(tile.x, tile.y - 1);
        }
        else if (direction === 'down') {
            tile_to_check = this.scene.map.getTileAt(tile.x, tile.y + 1);
        }
        else if (direction === 'left') {
            tile_to_check = this.scene.map.getTileAt(tile.x - 1, tile.y);
        }
        else if (direction === 'right') {
            tile_to_check = this.scene.map.getTileAt(tile.x + 1, tile.y);
        }

        return tile_to_check;
    }
}