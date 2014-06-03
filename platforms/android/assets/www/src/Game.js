
BasicGame.Game = function (game) {

	//	When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;		//	a reference to the currently running game
    this.add;		//	used to add sprites, text, groups, etc
    this.camera;	//	a reference to the game camera
    this.cache;		//	the game cache
    this.input;		//	the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
    this.load;		//	for preloading assets
    this.math;		//	lots of useful common math operations
    this.sound;		//	the sound manager - add a sound, play one, set-up markers, etc
    this.stage;		//	the game stage
    this.time;		//	the clock
    this.tweens;	//	the tween manager
    this.world;		//	the game world
    this.particles;	//	the particle manager
    this.physics;	//	the physics manager
    this.rnd;		//	the repeatable random number generator
    //	You can use any of these from any function within this State.
    //	But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

};

BasicGame.Game.prototype = {

	quitGame: function (pointer) {

		//	Here you should destroy anything you no longer need.
		//	Stop music, delete sprites, purge caches, free resources, all that good stuff.

		//	Then let's go back to the main menu.
		this.state.start('MainMenu');

	},

    ship : null,
    ship2: null,
    map: null,
    layer: null,
    cursors: null,

    create: function () {

        this.physics.startSystem(Phaser.Physics.P2JS);

        this.stage.backgroundColor = '#2d2d2d';

        this.input.addPointer();

        map = this.add.tilemap('map');

        map.addTilesetImage('ground_1x1');
        map.addTilesetImage('walls_1x2');
        map.addTilesetImage('tiles2');
        
        layer = map.createLayer('Tile Layer 1');

        layer.resizeWorld();

        //  Set the tiles for collision.
        //  Do this BEFORE generating the p2 bodies below.
        map.setCollisionBetween(1, 12);

        //  Convert the tilemap layer into bodies. Only tiles that collide (see above) are created.
        //  This call returns an array of body objects which you can perform addition actions on if
        //  required. There is also a parameter to control optimising the map build.
        //this.physics.p2.convertTilemap(map, layer);

        var arrPolys = this.physics.p2.convertCollisionObjects(map, "collision", true);

        $.each(arrPolys, function ( index, value ) {
            value.debug = true;
        });

        this.physics.p2.enable(arrPolys, true)

        this.ship = this.add.sprite(200, 200, 'ship');
        this.ship2 = this.add.sprite(220, 200, 'ship');
        this.physics.p2.enable(this.ship, true);
        this.physics.p2.enable(this.ship2, true);

        this.ship.body.setCircle(15);
        this.ship2.body.setCircle(15);

        this.ship.body.drag = new Phaser.Point(10, 10);
        this.ship2.body.drag = new Phaser.Point(10, 10);

        this.camera.follow(this.ship);

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

        this.ship.body.onBeginContact.add(this.blockHit, this);
        this.ship2.body.onBeginContact.add(this.blockHit, this);


      /*var gray = this.add.filter('Gray');

      ship2.filters = [gray];*/

        /*bmd = this.add.bitmapData(800, 4800);
        bmd.context.fillStyle = '#ffffff';

        var bg = this.add.sprite(0, 0, bmd);*/

        this.enableBodyDebug = false;

    },

    blockHit:function (body, shapeA, shapeB, equation) {

        //  The block hit something
        //  This callback is sent: the Body it collides with
        //  shapeA is the shape in the calling Body involved in the collision
        //  shapeB is the shape in the Body it hit
        //  equation is an array with the contact equation data in it

        //navigator.notification.vibrate(100);
        this.currentSpeed = 200;
    },

    //var bmd;
    currentSpeed: 200,

    update: function() {
       this.doAsPhone();
       //this.doAsPC();

    },

    doAsPC: function() {
         if (this.cursors.left.isDown)
        {
            this.ship.body.rotateLeft(100);
        }
        else if (this.cursors.right.isDown)
        {
            this.ship.body.rotateRight(100);
        }
        else
        {
            this.ship.body.setZeroRotation();
        }

        if (this.cursors.up.isDown)
        {
            this.ship.body.moveForward(400);
        }
        else if (this.cursors.down.isDown)
        {
            this.ship.body.moveBackward(400);
        }
    },

    doAsPhone: function () {
        
        this.currentSpeed += 1;

        this.currentSpeed = Math.min(this.currentSpeed, 400)

        if ((this.input.pointer1.isDown && this.input.pointer1.position.x > this.game.world.centerX) || (this.input.pointer2.isDown && this.input.pointer2.position.x > this.game.world.centerX))
        {
            this.ship2.body.rotateLeft(70);
        }
        else
        {
            this.ship2.body.rotateRight(70);
        }

        if ((this.input.pointer1.isDown && this.input.pointer1.position.x < this.game.world.centerX) || (this.input.pointer2.isDown && this.input.pointer2.position.x < this.game.world.centerX))
        {
            this.ship.body.rotateLeft(70);    
        }
        else
        {
            this.ship.body.rotateRight(70);
        }

        this.ship.body.moveForward(this.currentSpeed);
        this.ship2.body.moveForward(this.currentSpeed);
        //ship.body.thrust(currentSpeed);

       // bmd.context.fillRect(ship.x, ship.y, 2, 2);

        //bmd.dirty = true;
    },



    render: function () {
       // this.game.debug.body(this.ship);
    }


};
