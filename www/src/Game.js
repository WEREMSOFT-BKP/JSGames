BasicGame.Game = function(game) {

    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game; //   a reference to the currently running game
    this.add; //    used to add sprites, text, groups, etc
    this.camera; // a reference to the game camera
    this.cache; //  the game cache
    this.input; //  the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
    this.load; //   for preloading assets
    this.math; //   lots of useful common math operations
    this.sound; //  the sound manager - add a sound, play one, set-up markers, etc
    this.stage; //  the game stage
    this.time; //   the clock
    this.tweens; // the tween manager
    this.world; //  the game world
    this.particles; //  the particle manager
    this.physics; //    the physics manager
    this.rnd; //    the repeatable random number generator
    //  You can use any of these from any function within this State.
    //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

};

BasicGame.Game.prototype = {

    quitGame: function(pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    },
    STATE_COUNTER: 0,
    STATE_RACING: 1,
    state: 3,
    shipNumber: 2,
    truck: null,
    ships: new Array(),
    checkPoints: new Array(4),
    map: null,
    layer: null,
    cursors: null,
    layer: {},
    PI_2: Math.PI * 2,





    create: function() {

        this.physics.startSystem(Phaser.Physics.P2JS);
        this.stage.backgroundColor = '#2d2d2d';
        this.map = this.add.tilemap('map');
        this.map.addTilesetImage('ground_1x1');
        this.map.addTilesetImage('walls_1x2');
        this.map.addTilesetImage('tiles2');
        this.map.addTilesetImage('rpg_tileset');

        this.layer[0] = this.map.createLayer('Tile Layer 1');
        this.layer[0].resizeWorld();
        this.layer[1] = this.map.createLayer('Objects');
        this.layer[1].resizeWorld();

        this.checkPoints[0] = new Phaser.Line(this.game.width / 2, this.game.height / 2, 0, 0);
        this.checkPoints[1] = new Phaser.Line(this.game.width / 2, this.game.height / 2, this.game.width, this.game.height);
        this.checkPoints[2] = new Phaser.Line(this.game.width / 2, this.game.height / 2, this.game.width, 0);
        this.checkPoints[3] = new Phaser.Line(this.game.width / 2, this.game.height / 2, 0, this.game.height);


        //  Set the tiles for collision.
        //  Do this BEFORE generating the p2 bodies below.
        //map.setCollisionBetween(1, 12);

        //  Convert the tilemap layer into bodies. Only tiles that collide (see above) are created.
        //  This call returns an array of body objects which you can perform addition actions on if
        //  required. There is also a parameter to control optimising the map build.
        //this.physics.p2.convertTilemap(this.map, this.layer);

        var arrPolys = this.physics.p2.convertCollisionObjects(this.map, "collision", true);

        /*        $.each(arrPolys, function ( index, value ) {
            value.debug = true;
        });*/

        this.physics.p2.enable(arrPolys, true)


        for (var i = 0; i < this.shipNumber; i++) {
            this.ships[i] = this.add.sprite(80, 170 + i * 30, 'truck' + (i + 1));
            for (var j = 0; j < 24; j++) {
                this.ships[i].animations.add(j, [j]);
            }
            this.ships[i].p = new Array();
            for (var j = 0; j < this.checkPoints.length; j++)
                this.ships[i].p[j] = Phaser.Point();

            this.ships[i].line = new Phaser.Line(this.ships[i].x, this.ships[i].y, this.ships[i].x, this.ships[i].y);
            this.ships[i].play(5, 1, false);

            this.ships[i].animations.stop();
            this.ships[i].animations.currentAnim.setFrame(5, true);

            this.physics.p2.enable(this.ships[i], false);
            this.ships[i].body.setCircle(15);
            this.ships[i].body.dontRotateSpriteWithPhysics = true;
            this.ships[i].body.drag = new Phaser.Point(10, 10);
            //this.ships[i].body.fixedRotation = true; 
            this.ships[i].body.onBeginContact.add(this.blockHit, this);
            this.input.addPointer();
        }

        this.saveLastPositions();
        //  By default the ship will collide with the World bounds,
        //  however because you have changed the size of the world (via layer.resizeWorld) to match the tilemap
        //  you need to rebuild the physics world boundary as well. The following
        //  line does that. The first 4 parameters control if you need a boundary on the left, right, top and bottom of your world.
        //  The final parameter (false) controls if the boundary should use its own collision group or not. In this case we don't require
        //  that, so it's set to false. But if you had custom collision groups set-up then you would need this set to true.
        this.physics.p2.setBoundsToWorld(true, true, true, true, false);

        //  Even after the world boundary is set-up you can still toggle if the ship collides or not with this:
        // ship.body.collideWorldBounds = false;

        this.cursors = this.input.keyboard.createCursorKeys();

        this.passToStateCounter();
    },

    blockHit: function(body, shapeA, shapeB, equation) {

        //  The block hit something
        //  This callback is sent: the Body it collides with
        //  shapeA is the shape in the calling Body involved in the collision
        //  shapeB is the shape in the Body it hit
        //  equation is an array with the contact equation data in it

        //navigator.notification.vibrate(100);
        //this.currentSpeed = 100;
    },

    //var bmd;
    currentSpeed: 200,

    update: function(updateTime) {
        switch (this.state) {
            case this.STATE_COUNTER:
                this.processStateCounter();
                break;
            case this.STATE_RACING:
                this.processStateRacing();
                break;
        }

    },

    doAsPC: function() {

        this.currentSpeed += 1;

        this.currentSpeed = Math.min(this.currentSpeed, 300)


        if ((this.input.pointer1.screenX > (this.game.width / 2) && this.input.pointer1.isDown) || (this.input.pointer2.screenX > (this.game.width / 2) && this.input.pointer2.isDown) || ((this.input.mousePointer.screenX > (this.game.width / 2) && this.input.mousePointer.isDown))) {
            this.ships[0].body.rotateLeft(70);
        } else {
            this.ships[0].body.rotateRight(70);
        }
        if ((this.input.pointer1.screenX < (this.game.width / 2) && this.input.pointer1.isDown) || (this.input.pointer2.screenX < (this.game.width / 2) && this.input.pointer2.isDown) || ((this.input.mousePointer.screenX < (this.game.width / 2) && this.input.mousePointer.isDown))) {
            this.ships[1].body.rotateLeft(70);
        } else {
            this.ships[1].body.rotateRight(70);
        }


        for (var i = 0; i < this.shipNumber; i++) {
            this.ships[i].body.moveForward(this.currentSpeed);
        }

    },

    doAsPhone: function() {

        this.currentSpeed += 1;

        this.currentSpeed = Math.min(this.currentSpeed, 300)


        if ((this.input.pointer1.screenX > (this.game.width / 2) && this.input.pointer1.isDown) || (this.input.pointer2.screenX > (this.game.width / 2) && this.input.pointer2.isDown)) {
            this.ships[0].body.rotateLeft(70);
        } else {
            this.ships[0].body.rotateRight(70);
        }
        if ((this.input.pointer1.screenX < (this.game.width / 2) && this.input.pointer1.isDown) || (this.input.pointer2.screenX < (this.game.width / 2) && this.input.pointer2.isDown)) {
            this.ships[1].body.rotateLeft(70);
        } else {
            this.ships[1].body.rotateRight(70);
        }


        for (var i = 0; i < this.shipNumber; i++) {
            this.ships[i].body.moveForward(this.currentSpeed);
        }

    },

    textConunter: null,
    timeStampCounter: 0,


    passToStateCounter: function() {
        this.state = this.STATE_COUNTER;
        var text = "3";
        var style = {
            font: "65px verdana",
            fill: "#ffffff",
            align: "center"
        };
        this.textConunter = this.add.text(this.world.centerX - 300, 0, text, style);
        this.timeStampCounter = new Date().getTime();
    },

    processStateCounter: function() {
        var time = (1000 - (new Date().getTime() - this.timeStampCounter)) / 1000;
        this.textConunter.text = time;
        if (time <= 0) {
            this.passtoStateRacing();
            this.world.remove(this.textConunter);
        }
    },

    passtoStateRacing: function() {
        this.state = this.STATE_RACING;
    },

    processStateRacing: function() {
        if (this.game.device.desktop) {
            this.doAsPC();
        } else {
            this.doAsPhone();
        }
        this.saveLastPositions();
    },
    timeStampLastPosition: 0,
    color: "",
    saveLastPositions: function() {
        var time = (new Date().getTime() - this.timeStampLastPosition);
        if (time > 1000) {
            for (var i = 0; i < this.ships.length; i++) {
                this.ships[i].lastPosition = new Phaser.Point(this.ships[i].x, this.ships[i].y);
            }
            this.timeStampLastPosition = new Date().getTime();
        }

        for (var i = 0; i < this.ships.length; i++) {
            this.ships[i].line.fromSprite(this.ships[i].lastPosition, this.ships[i], false);
            for (var j = 0; j < this.checkPoints.length; j++) {
                this.ships[i].p[j] = this.ships[i].line.intersects(this.checkPoints[j], true);

                if (this.ships[i].p[j]) {
                    this.color[j] = 'rgb(0,255,0)';
                } else {
                    this.color[j] = 'rgb(255,255,255)';
                }
            }
        }


    },
    render: function() {
        /*        this.game.debug.pointer(this.input.pointer1);
        this.game.debug.pointer(this.input.pointer2);*/
        if (this.state == this.STATE_RACING) {
            for (var i = 0; i < this.ships.length; i++) {
                var frameToGo = Math.ceil(((this.ships[i].body.rotation % this.PI_2) / this.PI_2) * 24);
                this.ships[i].play(frameToGo);
                this.game.debug.geom(this.ships[i].line, this.color);

                for (var j = 0; j < this.checkPoints.length; j++) {
                    if (this.ships[i].p[j]) {
                        this.game.debug.geom(this.ships[i].p[j], '#ff0000');
                    }
                }

            }
            for (var i = 0; i < this.checkPoints.length; i++) {
                this.game.debug.geom(this.checkPoints[i], this.color);
            }
        }

    }


};
