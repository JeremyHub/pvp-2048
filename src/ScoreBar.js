
class ScoreBar extends Phaser.GameObjects.Container{

    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene.add.existing(this);
        this.scene = scene;
        this.create();

        this.maxScoreHeight = this.scene.game.config.height * 0.5;
    }
      

    create(){
        this.green_rect = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, this.scene.game.config.width * 0.06, 0, 0x00ff00);
        this.orange_rect = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, this.scene.game.config.width * 0.06, 0, 0xf27507);
                
    
        
        this.add(this.orange_rect);
        this.add(this.green_rect);
        
    }

    
    update(greenscore) {
        if (isNaN(greenscore)) greenscore = 50;
        this.green_rect.height = (greenscore/100) * this.maxScoreHeight;
        this.orange_rect.height = this.maxScoreHeight;
        this.orange_rect.y = 0;
        this.green_rect.y = 0;
    }
    
}


module.exports = {
    ScoreBar,
};
