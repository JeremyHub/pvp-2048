const { UIContainer } = require("./UIContainer");

class ScoreBar extends Phaser.GameObjects.Container{

    constructor(scene, x, y, win_percentage) {
        super(scene, x, y);
        this.scene.add.existing(this);
        this.scene = scene;
        this.win_percentage = win_percentage;
        this.win_percentage_text_destroyed = false;
        this.near_win_animation_speed = 0.015;
        this.maxScoreHeight = this.scene.game.config.height * 0.6;

        this.create();
    }
      

    create(){
        
        
        //this.green_rect = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, this.scene.game.config.width * 0.06, 0, 0x00ff00);
        //this.orange_rect = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, this.scene.game.config.width * 0.06, 0, 0xf27507);
                
    
        this.green_rect = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, 0, this.scene.game.config.width * 0.04, 0x00ff00);
        this.orange_rect = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, 0, this.scene.game.config.width * 0.04, 0xf27507);
        this.near_win_rect = new Phaser.GameObjects.Rectangle(this.scene, 1000000, 0, 0, this.scene.game.config.width * 0.04, 0xffffff);
        this.near_win_rect.width = (this.maxScoreHeight *  ((100 - this.win_percentage) / 100));
        this.near_win_rect.alpha = 0;
        this.green_win_percent_line = new Phaser.GameObjects.Rectangle(this.scene, this.near_win_rect.width, 0, 
            this.scene.game.config.width * 0.003, this.scene.game.config.width * 0.04, 0xb9ff9f)
        this.orange_win_percent_line = new Phaser.GameObjects.Rectangle(this.scene, this.maxScoreHeight - this.near_win_rect.width, 0, 
            this.scene.game.config.width * 0.003, this.scene.game.config.width * 0.04, 0xffd180)
        this.win_percentage_text = new UIContainer(this.scene, this.maxScoreHeight * 0.2, this.scene.game.config.width * -0.02, 
            "Reach " + this.win_percentage + "% to win!", "#000000")
        this.win_percentage_text.updateTextSize(0.7)
        
        this.add(this.orange_rect);
        this.add(this.green_rect);
        this.add(this.near_win_rect);
        this.add(this.green_win_percent_line);
        this.add(this.orange_win_percent_line);
        this.add(this.win_percentage_text);
        
    }

    
    update(greenscore) {
        if (isNaN(greenscore)) greenscore = 50;
        this.green_rect.width = (greenscore/100) * this.maxScoreHeight;
        this.orange_rect.width = this.maxScoreHeight;
        this.orange_rect.x = 0;
        this.green_rect.x = 0;
        this.update_near_win(greenscore)
    }

    update_near_win(greenscore) {
        if (!this.win_percentage_text_destroyed && greenscore !== 50 && greenscore !== 0) {
            this.win_percentage_text.destroy()
            this.win_percentage_text_destroyed = true
        }
        if (greenscore >= this.win_percentage || greenscore <= (100 - this.win_percentage)) {
            this.near_win_rect.x = 1000000
            return
        }
        if (greenscore >= this.win_percentage - 10) {
            this.near_win_rect.width = (this.maxScoreHeight *  ((this.win_percentage - greenscore) / 100));
            this.near_win_rect.x = this.orange_win_percent_line.x - this.near_win_rect.width
            this.near_win_rect.alpha += this.near_win_animation_speed
            if (this.near_win_rect.alpha === 0 || this.near_win_rect.alpha >= 0.8) {
                this.near_win_animation_speed *= -1
            }
        } else if (greenscore <= (100 - this.win_percentage) + 10) {
            this.near_win_rect.width = (this.maxScoreHeight *  ((this.win_percentage - (100 - greenscore)) / 100));
            this.near_win_rect.x = this.green_win_percent_line.x
            this.near_win_rect.alpha += this.near_win_animation_speed
            if (this.near_win_rect.alpha === 0 || this.near_win_rect.alpha >= 0.8) {
                this.near_win_animation_speed *= -1
            }
        } else {
            this.near_win_rect.x = 1000000
            this.near_win_rect.alpha = 0
            this.near_win_animation_speed = Math.abs(this.near_win_animation_speed)
        }
    }
    
}


module.exports = {
    ScoreBar,
};
