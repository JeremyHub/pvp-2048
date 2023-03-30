class UIContainer extends Phaser.GameObjects.Container{

    constructor(scene, x, y, score, color){
        super(scene, x, y);
        this.scene = scene;
        this.score = score;
        this.color = color;
        let text_size = this.scene.game.config.width/22;
        let style = { font: "bold " + text_size + "px Arial", fill: color, boundsAlignH: "center", boundsAlignV: "middle" };
        this.text = new Phaser.GameObjects.Text(this.scene, 0, 0, score, style);
        this.add(this.text);
        this.create();
        //this.update_visuals();
    }
    
    create(){
        this.scene.add.existing(this);
    }

    // make a list of random colors

    

    updateText(score){
        //let cList  = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff", "#ffffff", "#000000"];
        this.text.setText(score);
        //this.text.setColor(cList[Math.floor(Math.random() * cList.length)]);
    }

}

module.exports = {
    UIContainer,
};
