class PlayerWalls extends Phaser.GameObjects.Container{

    constructor(scene, x, y, walls){
        super(scene, x, y);
        this.scene = scene;
        this.walls = walls;
        let text_size = this.scene.game.config.width/20;
        let style = { font: "bold " + text_size + "px Arial", fill: "#ff0000", boundsAlignH: "center", boundsAlignV: "middle" };
        this.text = new Phaser.GameObjects.Text(this.scene, 0, 0, walls, style);
        this.add(this.text);
        this.create();
        //this.update_visuals();
    }
    
    create(){
        this.scene.add.existing(this);
    }

    update(walls){
        this.text.setText(walls);
    }

}

module.exports = {
    PlayerWalls,
};


