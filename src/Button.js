
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

        this.button = this.scene.add.image(0, 0, background_img).setInteractive();

        this.text = this.scene.add.text(0, 0, text, text_style);
        this.text.setOrigin(0.5, 0.5);
        this.text.setResolution(3);

        // stretch the button so that it fits the text
        this.button.displayWidth = this.text.width + 20;
        this.button.displayHeight = this.text.height + 20;

        this.add(this.button);
        this.add(this.text);

        this.button.on('pointerover', this.on_hover.bind(this));

        this.button.on('pointerout', this.on_out.bind(this));

        this.button.on('pointerdown', function() {
            call_when_pressed();
        });

        this.scene.add.existing(this);
    }

    on_hover() {
        this.button.setTexture(this.on_over_img);
        this.text.setStyle({ fill: '#fff' });
    }

    on_out() {
        this.button.setTexture(this.background_img);
        this.text.setStyle({ fill: '#000' });
    }
}

module.exports = {
    Button,
};