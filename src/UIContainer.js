class UIContainer extends Phaser.GameObjects.Container{

    constructor(scene, x, y, score, color, textSize = null){
        super(scene, x, y);
        this.scene = scene;
        this.score = score;
        this.color = color;
        let text_size = (textSize == null) ? this.scene.game.config.width/22 : textSize;
        let style = { font: "bold " + text_size + "px Arial", fill: color, boundsAlignH: "center", boundsAlignV: "middle" };
        this.text = new Phaser.GameObjects.Text(this.scene, 0, 0, score, style);
        this.add(this.text);
        this.create();

        //this.update_visuals();

    }
    
    create(){
        this.scene.add.existing(this);
    }

    
    updateText(score){
        //let cList  = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff", "#ffffff", "#000000"];
        //this.text.setColor(cList[Math.floor(Math.random() * cList.length)]);

        this.text.setText(score);


    }

    /**
     * Changes the text size of the UIContainer.
     * @param {*} size The new text size. Note that the size of the text is scaled off of the default value, which is scaled based on the size
     * of the window (i.e. updateTextSize(1) will set the size to the default value, updateTextSize(0.5) will set the size to half of the
     * default value, etc.).
     */
    updateTextSize(size){
        this.text.setFontSize(this.scene.game.config.width/22 * size);
    }

    emphasize() {
        this.scene.tweens.add({
            targets: [this],
            duration: 150,
            scale: 1.25,
            ease : 'Back.easeInOut',
            yoyo : true,
            repeat : 0
        })
    }

}

module.exports = {
    UIContainer,
};


