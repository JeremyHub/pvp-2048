import Phaser from 'phaser';

class Tile extends Phaser.GameObjects.Container{
    constructor(scene, x, y, children, tileType, tileSize) {
        super(scene, x, y, children);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.children = children;
    }
}