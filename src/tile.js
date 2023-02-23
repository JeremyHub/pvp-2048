import Phaser from 'phaser';

const tile_config = {
    animation_speed: 5,
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
        this.last_movement_time = 0;
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

            this.last_movement_time = this.scene.time.now;
            this.total_moved += to_move;

            if (this.total_moved === 32) {
                this.moving_direction = null;
                this.is_moving = false;
                this.total_moved = 0;
            }

        }
    }

    go_direction(direction) {
        if (this.is_moving) {
            return;
        } else {
            this.moving_direction = direction;
        }
    }
}