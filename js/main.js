'use strict';
 /*var this.player;
    var dogs;
    var this.enemy;
    var this.platforms;
    var this.input.keyboard.
    var enemies;
    var stars;
    var score = 0;
    var scoreText;
    var clock = 2000; //2 minutes in miliseconds
    var clockText;
    var boostText;
    var music;
    var jump;
    var cheers;
    var isDead = false;*/

var keys = Phaser.Keyboard;
var score = 0;
var isDead = false;
//var clock = 2000;

state.main = function(game){
    
};

state.main.prototype={
    preload: function() {

        //this.load.audio('nujabes',['assets/audio/nujabes_afternoon.mp3']);
        //this.load.audio('cheers',['assets/audio/5_sec_crowd.mp3']);
        //this.load.audio('jump',['assets/audio/mario_jump.mp3']);
        this.load.image('sky', 'assets/sky.png');
        this.load.image('street','assets/street.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('oneUp','assets/firstaid.png');
        this.load.spritesheet('Dog','assets/Dog.png',50,50);
        this.load.spritesheet('dude', 'assets/dude.png', 32, 48);
        this.load.spritesheet('enemy', 'assets/baddie.png',32, 32);

    },

    create: function() {

        this.music = this.add.audio('nujabes');
        this.cheers = this.add.audio('cheers');
        this.jump = this.add.audio('jump');
        this.music.volume = 0.3;
        this.music.loop = true;
        this.music.play();
        this.clock = 2000;
        //var clock = 2000;
        //  We're going to be using physics, so enable the Arcade Physics system
        this.physics.startSystem(Phaser.Physics.ARCADE);

        //  A simple background for our game
        this.add.sprite(0, 0, 'street');

        //  The this.platforms group contains the ground and the 2 ledges we can jump on
        this.platforms = this.add.group();

        //  We will enable physics for any object that is created in this group
        this.platforms.enableBody = true;

        // Here we create the ground.
        var ground = this.platforms.create(0, this.world.height - 64, 'ground');

        //  Scale it to fit the width of the this.(the original sprite is 900x650 in size)
        ground.scale.setTo(3, 3);

        //  This stops it from falling away when you jump on it
        ground.body.immovable = true;

        //  Now let's create two ledges
        var ledge = this.platforms.create(450, 400, 'ground');
        ledge.body.immovable = true;

        ledge = this.platforms.create(-150, 275, 'ground');
        ledge.body.immovable = true;
        
        ledge = this.platforms.create(500, 150, 'ground');
        ledge.body.immovable = true;
        
        ledge  = this.platforms.create(600, -250, 'ground');
        ledge.body.immovable = true;

        // The this.player and its settings
        this.player = this.add.sprite(32, this.world.height - 150, 'dude');

        //  We need to enable physics on the this.player
        this.physics.arcade.enable(this.player);

        //  This.Player physics properties. Give the little guy a slight bounce.
        this.player.body.bounce.y = 0.2;
        this.player.body.gravity.y = 400;
        this.player.body.collideWorldBounds = true;

        //  Our two animations, walking left and right.
        this.player.animations.add('left', [0, 1, 2, 3], 10, true);
        this.player.animations.add('right', [5, 6, 7, 8], 10, true);
        
        var y = this.randomHeight(); //generate a random height above 150 (ground height)
        //Building the enemy
        this.enemy = this.add.sprite(this.world.randomX, y, 'enemy');

        this.physics.arcade.enable(this.enemy);
        this.enemy.body.bounce.y = 0.2;
        this.enemy.body.gravity.y = 400;
        this.enemy.body.collideWorldBounds = true;
        
        this.enemy.animations.add('left',[0,1],10,true);
        this.enemy.animations.add('right',[2, 3], 10, true);

        //Adding dog groups

        this.dogs = this.add.group();
        this.dogs.enableBody = true;
        
        //Adding dog into the this.at random X and Y
        this.dog = this.dogs.create(this.world.randomX, y, 'Dog');


        //Adding dog physics
        
        this.dog.body.bounce.y = 0.2;
        this.dog.body.gravity.y = 320;
        this.dog.body.collideWorldBounds = true;

        //  Finally some stars to collect
        this.stars = this.add.group();

        //  We will enable physics for any star that is created in this group
        this.stars.enableBody = true;

        //  Here we'll create 12 of them evenly spaced apart
        this.star = this.stars.create(this.world.randomX, y, 'star');
        this.star.body.gravity.y = 400;
        this.star.body.bounce.y = 0.8;
        this.time.events.repeat(Phaser.Timer.SECOND*20, 500, this.resurrectStar, this);
        this.time.events.loop(Phaser.Timer.SECOND, this.enemyMove, this);
        //  The score
        this.scoreText = this.add.text(16, 16, 'Score: '+ score, { fontSize: '32px', fill: '#000' });
        this.clockText = this.add.text(16,40, 'Time: ' + this.clock, {fontSize: '32px', fill: '#000' });			

        //  Our controls.
       // this.input.keyboard.= this.input.keyboard.createCursorKeys();
        
    },

    update: function() {

        //  Collide the this.player,stars,dogs and this.enemy with the this.platforms
        this.physics.arcade.collide(this.player, this.platforms);
        this.physics.arcade.collide(this.stars, this.platforms);
        this.physics.arcade.collide(this.dogs, this.platforms);
        this.physics.arcade.collide(this.enemy, this.platforms);

        //  Checks to see if the this.player overlaps with any of the dogs, if he does call the collectDog function
        this.physics.arcade.overlap(this.player, this.dogs, this.collectDog, null, this);
        //  Checks to see if the this.player overlaps with any of the stars, if so call the collectStar			
        this.physics.arcade.overlap(this.player, this.stars, this.collectStars, null, this);
        //  Checks to see if the this.player overlaps with any of the rabbits, if so call the this.playerKill			
        this.physics.arcade.overlap(this.player, this.enemy, this.playerKill, null, this);

        //  Reset the this.players velocity (movement)
        this.player.body.velocity.x = 0;

        if (this.input.keyboard.isDown(keys.LEFT))
        {
            //  Move to the left
            this.player.body.velocity.x = -175;

            this.player.animations.play('left');
        }
        else if (this.input.keyboard.isDown(keys.RIGHT))
        {
            //  Move to the right
            this.player.body.velocity.x = 175;

            this.player.animations.play('right');
        }
        else
        {
            //  Stand still
            this.player.animations.stop();

            this.player.frame = 4;
        }
        
        //  Allow the this.player to jump if they are touching the ground.
        if (this.input.keyboard.isDown(keys.UP) && this.player.body.touching.down)
        {
	          this.jump.volume =0.5;
	          this.jump.play();
            this.player.body.velocity.y = -425;
        }
        
        if(isDead == true) {

	          this.restart();
        }
        this.updateCounter();
        this.updateScore(score);

    },

    enemyMove: function() {
        var x = Math.round(Math.random());
        if(x == 1) {
	          if(this.enemy.body.touching.down) {
	              this.enemy.body.velocity.y = -455;
	          }
	          this.enemy.animations.play('left');
	          this.enemy.body.velocity.x = -150
        }
        if(x == 0) {
	          if(this.enemy.body.touching.down) {
		            this.enemy.body.velocity.y = -455;
	          }
	          this.enemy.animations.play('right');
	          this.enemy.body.velocity.x = 150;
        } 
    },

    playerKill: function (player, enemy) {

        this.player.kill();
        isDead = true;
        this.restart();

    },

    collectDog: function(player, dogs) {
        
        // Removes the dog from the screen
        dogs.kill();
        //Add and update the score
        score+= 10;
        this.updateScore(parseInt(score));

        // Spawn another one
        this.resurrectDog();			
    },

    collectStars: function (player, stars) {
        //Remove the stars			
        stars.kill();			
        this.cheers.volume = 0.08;
        this.cheers.play();
        
        

        //Add 600 miliseconds			
        this.clock+=450; //equivalent to 45 seconds
        this.boostTimeText = this.add.text(40, 70,"Time increased by: 45 seconds!", {fontSize: '6px', fill: '#000'});  
        //var myText = this.add.tween(arf);
        this.time.events.add(0, function () {
	          this.add.tween(this.boostTimeText).to({y: 0}, 1500, Phaser.Easing.Linear.None, true);
	          this.add.tween(this.boostTimeText).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true);
	      }, this);
        this.clockText.setText("Time: "+this.clock);
    },
		
    resurrectDog: function() {
        var dogDead = this.dogs.getFirstDead();
        var y = this.randomHeight();

        if (dogDead)
        {
            
            dogDead.reset(this.world.randomX, y);

        }
    },

    resurrectStar: function() {
        var starDead = this.stars.getFirstDead();
        var y = this.randomHeight();
        if (starDead)
        {
            
            starDead.reset(this.world.randomX, y);

        }

    },

    restart: function() {
        this.player.reset(32, this.world.height - 150);
        score = 0;
        this.updateScore(parseInt(score));
        //scoreText.text = 'Score: ' + score;
        this.clock = 2000;
        isDead = false;
    },

    updateCounter: function() {
        if(this.clock == 0) {
            this.state.restart('main');
	          //this.player.kill();
	          //isDead = true;
        }

        this.clock--;
        this.clockText.setText("Time: " + this.clock);
    },

    randomHeight: function() {
        var width = 800; //This.width for this one
        return Math.random()*(width - (this.world.height - 150) + 150);
    },

    updateScore: function(score) {
        this.scoreText.setText("Score: " + score); 
    }
}
