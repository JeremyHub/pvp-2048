class PlayerMove extends Phaser.GameObjects.Container{

    constructor(scene, x, y, move){
        super(scene, x, y);
        this.scene = scene;
        this.move = move;
        let text_size = this.scene.game.config.width/20;
        let style = { font: "bold " + text_size + "px Arial", fill: "#ff0000", boundsAlignH: "center", boundsAlignV: "middle" };
        this.text = new Phaser.GameObjects.Text(this.scene, 0, 0, move, style);
        this.add(this.text);
        this.create();
        //this.update_visuals();
    }
    
    create(){
        this.scene.add.existing(this);
    }

    update(move){
        this.text.setText(move);
    }

}

module.exports = {
    PlayerMove,
};
