'use strict';

var game = new Phaser.Game(900, 675, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });

function preload() {

game.load.audio('nujabes',['assets/audio/nujabes_afternoon.mp3']);
game.load.audio('cheers',['assets/audio/5_sec_crowd.mp3']);
game.load.audio('jump',['assets/audio/mario_jump.mp3']);
game.load.image('sky', 'assets/sky.png');
game.load.image('street','assets/street.png');
game.load.image('ground', 'assets/platform.png');
game.load.image('star', 'assets/star.png');
game.load.image('oneUp','assets/firstaid.png');
game.load.spritesheet('Dog','assets/Dog.png',50,50);
game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
game.load.spritesheet('enemy', 'assets/baddie.png',32, 32);

}

var player;
var dogs;
var enemy;
var platforms;
var cursors;
var enemies;
var giveLife;
var stars;
var score = 0;
var scoreText;
var clock = 2000; //2 minutes in miliseconds
var clockText;
var boostText;
var music;
var jump;
var cheers;
var isDead = false;

function create() {

    music = game.add.audio('nujabes');
    cheers = game.add.audio('cheers');
    jump = game.add.audio('jump');
    music.volume = 0.1;
    music.loop = true;
    music.play();

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.sprite(0, 0, 'street');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 900x650 in size)
    ground.scale.setTo(3, 3);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    var ledge = platforms.create(450, 400, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(-150, 275, 'ground');
    ledge.body.immovable = true;
    
    ledge = platforms.create(500, 150, 'ground');
    ledge.body.immovable = true;
    
    ledge  = platforms.create(600, -250, 'ground');
    ledge.body.immovable = true;

    // The player and its settings
    player = game.add.sprite(32, game.world.height - 150, 'dude');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 400;
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);
   
    enemy = game.add.sprite(game.world.randomX, y, 'enemy');

    game.physics.arcade.enable(enemy);
    enemy.body.bounce.y = 0.2;
    enemy.body.gravity.y = 400;
    enemy.body.collideWorldBounds = true;
    
    enemy.animations.add('left',[0,1],10,true);
    enemy.animations.add('right',[2, 3], 10, true);

    //Adding dog groups

    dogs = game.add.group(); 
    dogs.enableBody = true;
    
    //Adding dog into the game at random X and Y
    var y = randomHeight(); //generate a random height above 150 (ground height)
    var dog = dogs.create(game.world.randomX, y, 'Dog');


    //Adding dog physics
    
    dog.body.bounce.y = 0.2;
    dog.body.gravity.y = 320;
    dog.body.collideWorldBounds = true;

    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    var star = stars.create(game.world.randomX, y, 'star');
    star.body.gravity.y = 400;
    star.body.bounce.y = 0.8;
    game.time.events.repeat(Phaser.Timer.SECOND*20, 500, resurrectStar, this);
    game.time.events.loop(Phaser.Timer.SECOND, enemyMove, this);
    //  The score
    scoreText = game.add.text(16, 16, 'Score: '+ score, { fontSize: '32px', fill: '#000' });
    clockText = game.add.text(16,40, 'Time: ' + clock, {fontSize: '32px', fill: '#000' });			

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
    
}

function update() {

    //  Collide the player,stars,dogs and enemy with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.collide(dogs, platforms);
    game.physics.arcade.collide(enemy, platforms);

    //  Checks to see if the player overlaps with any of the dogs, if he does call the collectDog function
    game.physics.arcade.overlap(player, dogs, collectDog, null, this);
    //  Checks to see if the player overlaps with any of the stars, if so call the collectStar			
    game.physics.arcade.overlap(player, stars, collectStars, null, this);
    //  Checks to see if the player overlaps with any of the rabbits, if so call the playerKill			
    game.physics.arcade.overlap(player, enemy, playerKill, null, this);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -175;

        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 175;

        player.animations.play('right');
    }
    else
    {
        //  Stand still
        player.animations.stop();

        player.frame = 4;
    }
    
    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down)
    {
	jump.volume =0.1;
	jump.play();
        player.body.velocity.y = -425;
    }
    
    if(isDead == true) {

	restart();
    }
    updateCounter();
    updateScore(score);

}
function enemyMove() {
    var x = Math.round(Math.random());
    if(x == 1) {
	if(enemy.body.touching.down) {
	    enemy.body.velocity.y = -455;
	}
	enemy.animations.play('left');
	enemy.body.velocity.x = -150
    }
    if(x == 0) {
	    if(enemy.body.touching.down) {
		enemy.body.velocity.y = -455;
	    }
	enemy.animations.play('right');
	enemy.body.velocity.x = 150;
    } 
}

function playerKill (player, enemy) {

    player.kill();
    isDead = true;
    restart();

}

function collectDog (player, dogs) {
    
    // Removes the dog from the screen
    dogs.kill();
    //Add and update the score
    score+= 10;
    updateScore(parseInt(score));

    // Spawn another one
    resurrectDog();			


}

function collectStars (player, stars) {
    //Remove the stars			
    stars.kill();			
    cheers.volume = 0.08;
    cheers.play();
    
   

    //Add 600 miliseconds			
    clock+=450; //equivalent to 45 seconds
    var boostTimeText = game.add.text(40, 70,"Time increased by: 45 seconds!", {fontSize: '6px', fill: '#000'});  
    //var myText = this.add.tween(arf);
    game.time.events.add(0, function () {
	game.add.tween(boostTimeText).to({y: 0}, 1500, Phaser.Easing.Linear.None, true);
	game.add.tween(boostTimeText).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true);
	}, this);
    clockText.setText("Time: "+clock);
}
			
function resurrectDog() {
   var thing = dogs.getFirstDead();
   var y = randomHeight();

   if (thing)
   {
     
      thing.reset(game.world.randomX, y);

   }
}

function resurrectStar() {
   var thing = stars.getFirstDead();
   var y = randomHeight();
   if (thing)
   {
     
      thing.reset(game.world.randomX, y);

   }

}


function restart() {
    player.reset(32, game.world.height - 150);
    score = 0;
    updateScore(parseInt(score));
    //scoreText.text = 'Score: ' + score;
    clock = 2000;
    isDead = false;
}

function updateCounter() {
    if(clock == 0) {
	player.kill();
	isDead = true;
    }
    clock--;
    clockText.setText("Time: " + clock);
}

function randomHeight() {
    var width = 800; //Game width for this one
    return Math.random()*(width - (game.world.height - 150) + 150);
}

function updateScore(score) {
   scoreText.setText("Score: " + score); 
}
