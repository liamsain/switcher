/// <reference path="../phaser.js" />
Enemy = function (x, y) {
    Phaser.Sprite.call(this, game, x, y, "enemy");
    this.taggedIndicator = this.addChild(game.make.sprite(10, -20, 'tagIndicator'));
    this.taggedIndicator.scale.setTo(0.5, 0.5);
    this.taggedIndicator.visible = false;
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.collideWorldBounds = true;
    this.enableBody = true;
    this.animationSpeed = 5;
    this.animations.add('left', [0, 1], this.animationSpeed, true);
    this.animations.add('right', [2, 3], this.animationSpeed, true);
    this.body.gravity.y = 800;
    this.body.bounce.y = 0.3;
    this.body.bounce.x = 1;
    this.body.collideWorldBounds = true;
    this.movingRight = false;
    this.hitArea = new Phaser.Rectangle(-this.width / 2, 0, 50, 50);
    this.inputEnabled = true;
    this.speed = 30;
    this.waitingToSwitch = false;
    this.switchDirection = function () {
        this.movingRight = !this.movingRight;
    };
    this.id = 0;


    this.onPlayerClick = function () {
        if (this.waitingToSwitch === true) {
            this.waitingToSwitch = false;
            this.taggedIndicator.visible = false;
        }
        else {
            var taggedEnemiesCheck = playState.checkWhichEnemyIsTagged();
            if (taggedEnemiesCheck.body === undefined) { // no other enemies tagged
                this.waitingToSwitch = true;
                this.taggedIndicator.visible = true;
            }
            else { // other enemy already tagged
                taggedEnemiesCheck.waitingToSwitch = false;
                taggedEnemiesCheck.taggedIndicator.visible = false;
                this.waitingToSwitch = true;
                this.taggedIndicator.visible = true;
            }
        }

    };
    this.events.onInputDown.add(this.onPlayerClick, this);
    playState.enemyArr.push(this);

};
Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;
Enemy.prototype.update = function () {
    game.physics.arcade.collide(this, playState.collisionLayer);
    if (this.isStandingOnCollisionLayer() && !this.hasTileToWalk()) {
        this.switchDirection();
    }
    if (this.detectPlayer()) {
        this.speed = 400;
        this.animations.stop();
    }
    else {
        this.speed = 30;
    }


    if (this.movingRight === true) {
        this.body.velocity.x = this.speed;
        this.animations.play('right');
        if (this.body.blocked.right)
            this.switchDirection();
    }
    else {
        this.body.velocity.x = -this.speed;
        this.animations.play('left');
        if (this.body.blocked.left)
            this.switchDirection();
    }

};
Enemy.prototype.hasTileToWalk = function () {
    var map = playState.map;
    var direction = (this.body.velocity.x < 0) ? -1 : 1;
    var p = new Phaser.Point((this.x + this.width / 2) + (direction * (map.tileWidth)), this.bottom + 1);
    //game.debug.geom(p, 'rgba(255,255,255,1)');
    var nextTile = map.getTileWorldXY(p.x, p.y, map.tileWidth, map.tileHeight, "CollisionLayer");
    var hasTileToWalk;
    nextTile === null ? hasTileToWalk = false : hasTileToWalk = true;
    return hasTileToWalk;
};
Enemy.prototype.isStandingOnCollisionLayer = function () {
    var map = playState.map;
    var p = new Phaser.Point(this.x + this.width / 2, this.y + (this.height * 1.02));
    //game.debug.geom(p, 'rgba(255,0,255,1)');
    var tile = map.getTileWorldXY(p.x, p.y, map.tileWidth, map.tileHeight, "CollisionLayer");
    var isStandingOnCollisionLayer;
    tile === null ? isStandingOnCollisionLayer = false : isStandingOnCollisionLayer = true;
    return isStandingOnCollisionLayer;
};
Enemy.prototype.detectPlayer = function () {
    var xDist = Math.abs(this.x - player.x);
    if (xDist < 300 && (Math.ceil(this.bottom)) === player.bottom) {
        return true;
    }
    else
        return false;
};


var playState = {
    switchSound: {},
    deathEmitter: {},
    enemyCount: 0,
    deathParticle: function (point) {
        this.deathEmitter.x = point.x;
        this.deathEmitter.y = point.y;
        this.deathEmitter.start(true, 2000, null, 100);//args:explode?, lifespan, only used if !explode, particles emitted
    },
    deathSound: {},
    create: function () {
        background = game.add.sprite(0, 0, 'background');
        this.setupControls();
        this.setupWorld();
        this.setupSounds();
        this.setupParticles();

    },
    setupParticles: function () {
        this.deathEmitter = game.add.emitter(0, 0, 100);//x,y,maxParticles
        this.deathEmitter.makeParticles("bloodParticle");
        this.deathEmitter.gravity = 600;
    },
    setupSounds: function () {
        this.switchSound = game.add.audio('switchAudio');
        this.switchSound.volume = 0.2;
        this.deathSound = game.add.audio('deathAudio');
        this.deathSound.volume = 0.2;
    },
    setupControls: function () {
        cursors = game.input.keyboard.createCursorKeys();
        left = game.input.keyboard.addKey(Phaser.Keyboard.A);
        right = game.input.keyboard.addKey(Phaser.Keyboard.D);
        jump = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        down = game.input.keyboard.addKey(Phaser.Keyboard.S);
        control = game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
        restart = game.input.keyboard.addKey(Phaser.Keyboard.R);
    },
    enemyArr: [],
    collisionLayer: {},
    enemyBoundsLayer: {},
    endOfLevel: {},
    deathLayer: {},

    checkWhichEnemyIsTagged: function () {
        var taggedEnemy = {};
        for (var i = 0; i < this.enemyArr.length; i++) {
            if (this.enemyArr[i].waitingToSwitch === true) {
                taggedEnemy = this.enemyArr[i];
                break;
            }
        }
        return taggedEnemy;
    },
    switch: function () {
        var enemy = this.checkWhichEnemyIsTagged();
        if (enemy.body !== undefined) {
            var newPlayerPos = enemy.position;
            newPlayerPos.y -= 30;
            enemy.position = player.position;
            player.position = newPlayerPos;
            enemy.waitingToSwitch = false;
            enemy.taggedIndicator.visible = false;
            this.switchSound.play();
        }
        else
            console.log("trying to switch with an empty object!");
    },
    restartLevel: function () {
        var taggedEnemy = playState.checkWhichEnemyIsTagged();
        taggedEnemy.waitingToSwitch = false;
        this.enemyArr = [];
        game.state.restart('play');
    },
    map: {},
    ladderLayer: {},
    setupWorld: function () {
        control.onDown.add(this.switch, this);
        restart.onDown.add(this.restartLevel, this);
        this.setupTileMaps();
        this.setupPlayer();
        this.setupEnemies();

        worldLayer.alpha = 0;
        player.alpha = 0;
        background.alpha = 0;
    },
    setupTileMaps: function () {
        this.map = game.add.tilemap(game.levels[game.currentLevel].tilemapName);

        this.map.addTilesetImage('BrownTiles', 'tiles');
        worldLayer = this.map.createLayer('World');
        this.collisionLayer = this.map.createLayer('CollisionLayer');
        this.collisionLayer.visible = false;
        this.map.setCollision(51, true, this.collisionLayer);
        //this.map.setCollisionBetween(51, 51, true, this.collisionLayer);//51 is the value of the tile used for collision
        this.deathLayer = this.map.createLayer("DeathLayer");
        this.map.setCollisionBetween(52, 52, true, this.deathLayer);
        this.deathLayer.visible = false;
        //this.deathLayer.debug = true;
        if (this.map.getLayer('Ladders') !== null) {
            this.ladderLayer = this.map.createLayer('Ladders');
            this.map.setCollision(45, true, this.ladderLayer);
        }
        this.endOfLevel = this.getSingleEntityDetails(this.map.objects.ObjectLayer, "PlayerFinishPoint");
        console.log(this.endOfLevel);
    },
    getSingleEntityDetails: function (objArray, entityName) {
        return objArray.find(x => x.name === entityName);
        // this is a new js feature so it aint gonna work in some browsers
    },
    getMultipleEntityDetails: function (objArray, entityName) {
        var entities = [];
        objArray.forEach(function (element) {
            if (element.name == entityName) {
                entities.push(element);
            }
        }, this);
        return entities;
    },
    createEnemies: function (entityDetailsArray) {
        var enemyArr = [];
        var id = 0;
        entityDetailsArray.forEach(function (element) {
            var enemy = new Enemy(element.x, element.y);
            this.enemyCount++;
            enemy.id = id;
            id++;
            enemyArr.push(enemy);
            game.add.existing(enemy);
        }, this);
        return enemyArr;
    },
    setupEnemies: function () {
        var enemyEntitiesArray = this.getMultipleEntityDetails(this.map.objects.ObjectLayer, "EnemyStartPoint");
        game.enemies = this.createEnemies(enemyEntitiesArray);
    },
    killEnemy: function (enemy) {
        playState.deathParticle(enemy);
        playState.deathSound.play();
        //playState.enemyArr.splice(enemy, 1);// needs testing
        // for(var i = 0; i < playState.enemyArr.length;i++){
        //     if(enemy.id == playState.enemyArr[i].id){
        //         playState.enemyArr.splice(playState.enemyArr[i], 1);
        //         console.log("killing enemy id: " + enemy.id + " array pos: " + i);
        //     }
        // }
        playState.enemyCount--;
        enemy.kill();
        // console.log("enemyArr length:" + playState.enemyArr.length);
        // console.log("ids of enemies left:");
        // for(var k = 0; k < playState.enemyArr.length; k++){
        //     console.log(playState.enemyArr[k].id);
        // }

    },
    setupPlayer: function () {
        var startPos = this.getSingleEntityDetails(this.map.objects.ObjectLayer, "PlayerStartPoint");
        player = game.add.sprite(startPos.x, startPos.y - 16, 'player');
        game.physics.arcade.enable(player);
        player.body.bounce.y = 0.0;
        player.body.gravity.y = 1000;
        player.body.collideWorldBounds = true;
        player.facingRightFrame = 12;
        player.facingLeftFrame = 0;
        player.jumpingRightFrame = 14;
        player.jumpingLeftFrame = 7;
        player.scale.setTo(0.4, 0.4);
        var animSpeed = 15;
        player.animations.add('left', [0, 1, 2, 3, 4, 5, 6, 7], animSpeed, true);//3rd arg: animspeed, 4th: loop?
        player.animations.add('right', [9, 10, 11, 12, 13, 14, 15, 16], animSpeed, true);
        player.facingRight = true;
        player.reachedEndOfLevel = false;
        player.body.checkCollision.up = false;

    },
    playerMovement: function () {

        speed = 300;
        jumpSpeed = 340;

        player.body.velocity.x = 0;
        if (cursors.left.isDown || left.isDown) {
            player.body.velocity.x = -speed;
            player.animations.play('left');
            player.facingRight = false;
        }
        else if (cursors.right.isDown || right.isDown) {
            player.body.velocity.x = speed;
            player.animations.play('right');
            player.facingRight = true;
        }
        else {
            player.animations.stop();
            if (player.facingRight) {
                player.frame = player.facingRightFrame;
            }
            else
                player.frame = player.facingLeftFrame;

        }
        if ((cursors.up.isDown || jump.isDown) && player.body.blocked.down) {
            player.body.velocity.y = -jumpSpeed;
        }
        if ((cursors.up.isDown || cursors.left.isDown || cursors.right.isDown || left.isDown || right.isDown) && !player.body.blocked.down) {
            player.animations.stop();
            if (player.facingRight) {
                player.frame = player.jumpingRightFrame;
            }
            else
                player.frame = player.jumpingLeftFrame;
        }
    },
    killPlayer: function () {
        playState.deathSound.play();
        playState.restartLevel(); // this.restartLevel() doesn't work here - interesting!
    },
    nextLevel: function () {

        if (game.currentLevel < game.levels.length - 1) {
            //player.body.moves = false;
            player.body.enable = false;
            player.animations.stop();
            this.fadeOut();
            if (worldLayer.alpha < 0.2) {
                this.enemyArr = [];
                game.currentLevel += 1;
                game.state.start('play');
            }
        }
        else {
            player.body.enable = false;
            player.animations.stop();
            this.fadeOut();
            if (worldLayer.alpha < 0.2) {
                game.state.start('win');
            }

        }
    },
    checkForLevelCompletion: function () {
        var lvlEndTrigger = this.endOfLevel;
        var px = player.body.position.x;
        var py = player.body.position.y;
        var pw = player.width;
        var ph = player.height;
        var lvlEndX = lvlEndTrigger.x;
        var lvlEndY = lvlEndTrigger.y;
        var lvlEndW = lvlEndTrigger.width;

        if (px + (pw / 6) > lvlEndX - lvlEndW / 2 && px < lvlEndX + lvlEndW) {
            if (py >= lvlEndY) {
                if (this.enemyCount === 0) {
                    player.reachedEndOfLevel = true;
                    this.nextLevel();
                }
            }
        }
    },
    onLadders: function(){
    },
    collisions: function () {
        game.physics.arcade.collide(player, this.collisionLayer);
        game.physics.arcade.collide(player, this.deathLayer, this.killPlayer);
        game.physics.arcade.collide(this.enemyArr, this.deathLayer, this.killEnemy);
        game.physics.arcade.overlap(player, this.ladderLayer, this.onLadders);
    },
    fadeOut: function () {
        var speed = 0.07;
        worldLayer.alpha -= Math.sin(game.time.totalElapsedSeconds() % speed);
        player.alpha -= Math.sin(game.time.totalElapsedSeconds() % speed);
        background.alpha -= Math.sin(game.time.totalElapsedSeconds() % speed);

    },
    fadeIn: function () {

        var speed = 0.04;
        if (worldLayer.alpha < 0.90 && !player.reachedEndOfLevel) {
            worldLayer.alpha += Math.sin(game.time.totalElapsedSeconds() % speed);
            player.alpha += Math.sin(game.time.totalElapsedSeconds() % speed);
            background.alpha += Math.sin(game.time.totalElapsedSeconds() % speed);

        }
        if (worldLayer.alpha > 0.9 && worldLayer.alpha < 1.0 && !player.reachedEndOfLevel) {
            worldLayer.alpha = 1.0;
            player.alpha = 1.0;
            background.alpha = 1.0;

        }
    },
    update: function () {
        // call collisions before player movement :http://www.html5gamedevs.com/topic/9851-cant-jump/
        this.collisions();
        this.playerMovement();
        this.fadeIn();
        this.checkForLevelCompletion();
    },
    render: function () {
        //game.debug.body(player);
    }
};