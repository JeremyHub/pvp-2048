
class Button extends Phaser.GameObjects.Container {
    constructor(scene, x, y, background_img, on_over_img, text, text_style, call_when_pressed) {
        super(scene, x, y);
        this.scene = scene; // the scene this container will be added to
        this.x = x; // the x position of the container
        this.y = y; // the y position of the container
        this.background_img = background_img; // the background image of the button
        this.on_over_img = on_over_img; // the image that will appear when the button is hovered over
        this.text = text; // the text of the button
        this.call_when_pressed = call_when_pressed; // the function to be called when the button is pressed
        this.origin_style_color = text_style.fill;
        this.text_style = text_style;

        this.button = this.scene.add.image(0, 0, background_img).setInteractive();

        this.update_text(text);

        this.add(this.button);
        this.add(this.text);

        this.button.on('pointerover', this.on_hover.bind(this));

        this.button.on('pointerout', this.on_out.bind(this));

        this.button.on('pointerup', function() {
            call_when_pressed();
        });

        this.scene.add.existing(this);
    }

    update_text(text, scale_text = false) {
        let text_width = this.text.width
        this.text = this.scene.add.text(0, 0, text, this.text_style);
        this.text.setOrigin(0.5, 0.5);
        this.text.setResolution(3);

        // stretch the button so that it fits the text
        if (scale_text) {
            let text_scale = text_width / this.text.width
            console.log(text_scale * this.text_style.fontSize)
            console.log(this.text_style.fontSize)
            this.text.setFontSize(text_scale * this.text_style.fontSize)
        } else {
            this.button.displayWidth = this.text.width + 20;
            this.button.displayHeight = this.text.height + 20;
        }
    }

    on_hover() {
        this.button.setTexture(this.on_over_img);
        this.text.setStyle({ fill: '#fff' });
    }

    on_out() {
        this.button.setTexture(this.background_img);
        this.text.setStyle({ fill: this.origin_style_color });
    }
}

module.exports = {
    Button,
};