/// <reference path="../phaser.js" />
var winState = {
    create: function(){
        var winLabel = game.add.text(80,80,'You beat the game!',{font:'50px Arial', fill:'#00ff00'});
        var startLabel = game.add.text(80, game.world.height - 80, 'press the "w" key to restart', {font:'25px Arial', fill:'#ffffff'});
        var wkey = game.input.keyboard.addKey(Phaser.Keyboard.W);
        wkey.onDown.addOnce(this.restart);
    },
    restart: function(){
        game.currentLevel = 0;
        game.state.start('play');
    }
};