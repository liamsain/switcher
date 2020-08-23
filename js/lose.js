var loseState = {
        create: function(){
        var winLabel = game.add.text(80,80,'You died!',{font:'50px Arial', fill:'#00ff00'});
        var startLabel = game.add.text(80, game.world.height - 80, 'press the "r" key to restart', {font:'25px Arial', fill:'#ffffff'});
        var rkey = game.input.keyboard.addKey(Phaser.Keyboard.R);
        rkey.onDown.addOnce(this.restart);
    },
    restart: function(){
        game.state.start('play');
    }
};