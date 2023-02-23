var game = new Phaser.Game(640, 480, Phaser.CANVAS, 'game');


class Car {
    constructor(game) {
        this.game = game;
        this.car = null;

        this.speed = 150;
        this.threshold = 3;
        this.turnSpeed = 150;

        this.safetile = 2;

        this.marker = new Phaser.Point();
        this.turnPoint = new Phaser.Point();

        this.directions = [null, null, null, null, null];
        this.opposites = [Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP];

        this.current = Phaser.UP;
        this.turning = Phaser.NONE;
    }
    turn() {

        var cx = Math.floor(this.car.x);
        var cy = Math.floor(this.car.y);

        //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
        if (!this.game.math.fuzzyEqual(cx, this.turnPoint.x, this.threshold) || !this.game.math.fuzzyEqual(cy, this.turnPoint.y, this.threshold)) {
            return false;
        }

        this.car.x = this.turnPoint.x;
        this.car.y = this.turnPoint.y;

        this.car.body.reset(this.turnPoint.x, this.turnPoint.y);

        this.move(this.turning);

        this.turning = Phaser.NONE;

        return true;

    }
    move(direction) {

        var speed = this.speed;

        if (direction === Phaser.LEFT || direction === Phaser.UP) {
            speed = -speed;
        }

        if (direction === Phaser.LEFT || direction === Phaser.RIGHT) {
            this.car.body.velocity.x = speed;
        }

        else {
            this.car.body.velocity.y = speed;
        }

        this.game.add.tween(this.car).to({ angle: this.getAngle(direction) }, this.turnSpeed, "Linear", true);

        this.current = direction;

    }
    getAngle(to) {

        //  About-face?
        if (this.current === this.opposites[to]) {
            return "180";
        }

        if ((this.current === Phaser.UP && to === Phaser.LEFT) ||
            (this.current === Phaser.DOWN && to === Phaser.RIGHT) ||
            (this.current === Phaser.LEFT && to === Phaser.DOWN) ||
            (this.current === Phaser.RIGHT && to === Phaser.UP)) {
            return "-90";
        }

        return "90";

    }
    update(cars) {

        this.checkKeys();

        this.game.physics.arcade.collide(this.car, this.game.layer);
        for (var i = 0; i < cars.length; i++) {
            if (cars[i] === this.car) {
                continue;
            }
            this.game.physics.arcade.collide(this.car, cars[i]);
        }

        this.marker.x = this.game.math.snapToFloor(Math.floor(this.car.x), this.game.gridsize) / this.game.gridsize;
        this.marker.y = this.game.math.snapToFloor(Math.floor(this.car.y), this.game.gridsize) / this.game.gridsize;

        //  Update our grid sensors
        this.directions[1] = this.game.map.getTileLeft(this.game.layer.index, this.marker.x, this.marker.y);
        this.directions[2] = this.game.map.getTileRight(this.game.layer.index, this.marker.x, this.marker.y);
        this.directions[3] = this.game.map.getTileAbove(this.game.layer.index, this.marker.x, this.marker.y);
        this.directions[4] = this.game.map.getTileBelow(this.game.layer.index, this.marker.x, this.marker.y);


        if (this.turning !== Phaser.NONE) {
            this.turn();
        }

    }
    checkDirection(turnTo) {
        
        if (this.turning === turnTo || this.directions[turnTo] === null || this.directions[turnTo].index !== this.safetile) {
            //  Invalid direction if they're already set to turn that way
            //  Or there is no tile there, or the tile isn't index a floor tile
            return;
        }


        //  Check if they want to turn around and can
        if (this.current === this.opposites[turnTo]) {
            this.move(turnTo);
        }

        else{
            this.turning = turnTo;

            this.turnPoint.x = (this.marker.x * this.game.gridsize) + (this.game.gridsize / 2);
            this.turnPoint.y = (this.marker.y * this.game.gridsize) + (this.game.gridsize / 2);
        }

    }
    checkKeys() {

        if (this.game.cursors.left.isDown && this.current !== Phaser.LEFT) {
            this.checkDirection(Phaser.LEFT);
        }
        else if (this.game.cursors.right.isDown && this.current !== Phaser.RIGHT) {
            this.checkDirection(Phaser.RIGHT);
        }
        else if (this.game.cursors.up.isDown && this.current !== Phaser.UP) {
            this.checkDirection(Phaser.UP);
        }
        else if (this.game.cursors.down.isDown && this.current !== Phaser.DOWN) {
            this.checkDirection(Phaser.DOWN);
        }

        else {
            //  This forces them to hold the key down to turn the corner
            this.turning = Phaser.NONE;
        }

    }
}


class PhaserGame {
    constructor(game) {

        this.map = null;
        this.layer = null;
        this.cars = [];

        this.gridsize = 32;

    }
    init() {

        this.physics.startSystem(Phaser.Physics.ARCADE);

    }
    preload() {

        // this.load.tilemap('map', 'src/assets/maze.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('map_simple_2048', 'src/assets/simple.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('tiles', 'src/assets/tiles.png');
        this.load.image('car', 'src/assets/car.png');

    }
    create() {

        this.map = this.add.tilemap('map_simple_2048');
        this.map.addTilesetImage('tiles', 'tiles');

        this.layer = this.map.createLayer('Tile Layer 1');

        this.map.setCollision(6, true, this.layer);
        
        this.cursors = this.input.keyboard.createCursorKeys();

        var x = 48;

        for (var i = 0; i < 4; i++) {
            var car = new Car(this);
            car.car = this.add.sprite(x, 48, 'car');
            x += 48+48;
            car.car.anchor.set(0.5);

            this.physics.arcade.enable(car.car);
            this.cars.push(car);
        }

        car.move(Phaser.DOWN);

    }
    update() {
        
        for (var i = 0; i < this.cars.length; i++) {
            this.cars[i].update(this.cars);
        }
    
    }
}


game.state.add('Game', PhaserGame, true);