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

    update_visuals(){
        if (this.time < 60000){
            this.text.setText(Math.floor(this.time/1000) + "." + Math.floor((this.time%1000)/10));
        } else{
            let zero = Math.floor((this.time%60000)/1000) < 10 ? "0" : "";
            this.text.setText(Math.floor(this.time/60000) + ":" + zero + Math.floor((this.time%60000)/1000));
        }
    }

    pause(){
        this.oldtime = null; 
        this.isticking = false; 
    }

    unpause(){
        this.isticking = true;
    }



}

module.exports = {
    Timer,
};