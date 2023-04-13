class Timer extends Phaser.GameObjects.Container{

    
    constructor(scene, x, y, time, color){
        super(scene, x, y);
        this.scene = scene;
        this.time = time;
        this.color = color;
        let text_size = this.scene.game.config.width/20;
        let style = { font: "bold " + text_size + "px Arial", fill: color, boundsAlignH: "center", boundsAlignV: "middle" };
        this.text = new Phaser.GameObjects.Text(this.scene, 0, 0, "", style);
        this.add(this.text);
        this.create();
        this.oldtime = null;
        this.isticking = false;
        this.update_visuals();
        this.has_been_paused = false;
    }
    
    create(){
        this.scene.add.existing(this);
    }


    // make the timer count down
    update(){
        if (this.isticking){
            if (this.oldtime == null) this.oldtime = new Date().getTime();
            this.time -= new Date().getTime() - this.oldtime;
            this.update_visuals();   
            this.oldtime = new Date().getTime();
        }
    }

    add_time(time){
        if (this.has_been_paused) {
            this.time += time;
            this.update_visuals();
            this.has_been_paused = false;
        }
    }

    update_visuals(){
        let mili_zero = Math.floor((this.time%1000)/10) < 10 ? "0" : "";
        if (this.time < 60000){
            this.text.setText(Math.floor(this.time/1000) + "." + Math.floor((this.time%1000)/10) + mili_zero);
        } else{
            let sec_zero = Math.floor((this.time%60000)/1000) < 10 ? "0" : "";
            this.text.setText(Math.floor(this.time/60000) + ":" + sec_zero + Math.floor((this.time%60000)/1000) + "." + Math.floor((this.time%1000)/10) + mili_zero);
        }
    }

    pause(){
        this.oldtime = null; 
        this.isticking = false; 
        this.has_been_paused = true;
        if (this.color === "#00ff00") {
            this.text.setColor("#006f02");
        } else {
            this.text.setColor("#954600");
        }        
    }

    unpause(){
        this.isticking = true;
        this.text.setColor(this.color);
    }



}

module.exports = {
    Timer,
};