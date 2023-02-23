import Phaser from 'phaser';

const tile_config = {
    animation_speed: 5,
    wall_id: 6,
}

export class Tile extends Phaser.GameObjects.Container{
    constructor(scene, x, y, children, color, size) {
        super(scene, x, y, children);
        this.color = color;
        this.size = size;
        this.scene = scene;
        this.scene.add.existing(this);
        this.create();
        this.moving_direction = null;
        this.is_moving = false;
        this.total_moved = 0;
    }

    create() {
        const rect = this.scene.add.rectangle(0, 0, this.size, this.size, this.color);
        this.add(rect);
    }

    update() {
        
        if (this.total_moved < 32 && this.moving_direction !== null) {
            this.is_moving = true;

            let to_move = 0;
            if (this.total_moved + tile_config.animation_speed > 32) {
                to_move = 32 - this.total_moved;
            } else {
                to_move = tile_config.animation_speed;
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

            if (this.total_moved === 32) {
                this.total_moved = 0;
                if (!this.should_move_another_space(this.moving_direction)) {
                    this.moving_direction = null;
                    this.is_moving = false;
                }
            }

        }
    }

    go_direction(direction) {
        if (this.is_moving || !this.should_move_another_space(direction)) {
            return;
        } else {
            this.moving_direction = direction;
        }
    }

    should_move_another_space(direction) {
        const wall_in_direction = this.check_if_wall_in_direction(direction);
        const tile_in_direction = this.check_if_tile_in_direction(direction);
        return !wall_in_direction && !tile_in_direction;
    }

    check_if_tile_in_direction(direction) {
        const tile_to_check = this.get_tile_in_direction(direction);
        for (let i = 0; i < this.scene.tiles.length; i++) {
            const tile = this.scene.tiles[i];
            const tiles_space = this.scene.map.getTileAtWorldXY(tile.x, tile.y);
            if (tiles_space === tile_to_check) {
                return true;
            }
        }
        return false;
    }

    check_if_wall_in_direction(direction) {        
        let tile_to_check = this.get_tile_in_direction(direction);

        if (tile_to_check !== null) {
            if (tile_to_check.layer.data[tile_to_check.y][tile_to_check.x].index === tile_config.wall_id) {
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