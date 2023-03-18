
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
        Phaser.Display.Align.In.Center(this.text, this.button);

        // stretch the button so that it fits the text
        this.button.displayWidth = this.text.width + 20;

        this.add(this.button);
        this.add(this.text);

        this.button.on('pointerover', function() {
            this.setTexture(on_over_img);
        });

        this.button.on('pointerout', function() {
            this.setTexture(background_img);
        });

        this.button.on('pointerdown', function() {
            call_when_pressed();
        });

        this.scene.add.existing(this);
    }
}

module.exports = {
    Button,
};