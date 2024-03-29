export class InputManager {

    constructor(when_wasd, when_arrow, when_swipe, scene) {
        this.when_wasd = when_wasd;
        this.when_arrow = when_arrow;
        this.when_swipe = when_swipe;
        this.tap_margin = Math.max(scene.game.config.width/10, scene.game.config.height/10);
        this.touchstartX = 0
        this.touchendX = 0
        this.touchstartY = 0
        this.touchendY = 0
        this.setup()
    }

    touch_start(event) {
        this.touchstartX = event.changedTouches[0].screenX
        this.touchstartY = event.changedTouches[0].screenY
    }

    touch_end(event) {
        this.touchendX = event.changedTouches[0].screenX
        this.touchendY = event.changedTouches[0].screenY
        this.checkDirection()
    }
    
    setup() {
        document.addEventListener('touchstart', this.touch_start.bind(this));
        document.addEventListener('touchend', this.touch_end.bind(this));
        document.addEventListener('keydown', this.handle_key.bind(this));
    }

    handle_key(event) {
        this.wasd_move = null;
        if (event.key == "w") {
            this.wasd_move = "up";
        } else if (event.key == "a") {
            this.wasd_move = "left";
        } else if (event.key == "d") {
            this.wasd_move = "right";
        } else if (event.key == "s") {
            this.wasd_move = "down";
        }
        
        this.arrow_move = null;
        if (event.key == "ArrowLeft") {
            this.arrow_move = "left";
        }
        if (event.key == "ArrowRight") {
            this.arrow_move = "right";
        }
        if (event.key == "ArrowUp") {
            this.arrow_move = "up";
        }
        if (event.key == "ArrowDown") {
            this.arrow_move = "down";
        }

        if (this.wasd_move != null) {
            this.when_wasd(this.wasd_move);
        }
        if (this.arrow_move != null) {
            this.when_arrow(this.arrow_move);
        }
    }

    checkDirection() {
        let x = this.touchendX - this.touchstartX
        let y = this.touchendY - this.touchstartY
        
        if (Math.abs(x) > Math.abs(y)) {
            if (Math.abs(x) > this.tap_margin) {
                if (x > 0) {
                    this.swipe = "right";
                } else {
                    this.swipe = "left";
                }
            } else {
                this.swipe = "tap";
            }
        } else {
            if (Math.abs(y) > this.tap_margin) {
                if (y > 0) {
                    this.swipe = "down";
                } else {
                    this.swipe = "up";
                }
            } else {
                this.swipe = "tap";
            }
        }

        if (this.swipe == "tap") {
            return;
        } else if (this.swipe != null) {
            this.when_swipe(this.swipe);
        }
    }

    destroy() {
        document.removeEventListener('touchstart', this.touch_start.bind(this));
        document.removeEventListener('touchend', this.touch_end.bind(this));
        document.removeEventListener('keydown', this.handle_key.bind(this));
    }

}