/// <reference path="../phaser.js" />
var loadState = {
    preload: function () {
        var loadingLabel = game.add.text(80, 150, 'loading...', { font: '30px Courier', fill: '#ffffff' });

        game.load.image('background', 'assets/sky.png');
        game.load.tilemap('lvl1', 'assets/levels/lvl1.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.tilemap('lvl2', 'assets/levels/lvl2.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.tilemap('lvl3', 'assets/levels/lvl3.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.tilemap('lvl4', 'assets/levels/lvl4.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.tilemap('lvl5', 'assets/levels/lvl5.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.tilemap('lvl6', 'assets/levels/lvl6.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tiles', 'assets/BrownNature/BrownTiles.png');
        game.load.image('tagIndicator', 'assets/tagIndicator.png');
        game.load.spritesheet('player', 'assets/ropey.png', 128, 128);
        game.load.image('bloodParticle', 'assets/bloodParticle.png');
        game.load.spritesheet('enemy', 'assets/baddie.png', 32, 32);
        game.load.audio('switchAudio', ['assets/sounds/switch.mp3', 'assets/sounds/switch.wav', 'assets/sounds/switch.ogg', 'assets/sounds/switch.mp4']);
        game.load.audio('deathAudio', ['assets/sounds/death.mp3', 'assets/sounds/death.wav', 'assets/sounds/death.ogg', 'assets/sounds/death.mp4']);
        game.levels = [
            { level: 1, tilemapName: 'lvl1' },
            { level: 2, tilemapName: 'lvl2' },
            { level: 3, tilemapName: 'lvl3' },
            { level: 4, tilemapName: 'lvl4' },
            { level: 5, tilemapName: 'lvl5' },
            { level: 6, tilemapName: 'lvl6' }
            ];
        game.currentLevel = 0;
    },

    create: function () {

        game.state.start('play');
    }
};