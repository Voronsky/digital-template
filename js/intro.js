var i = 0;
state.intro = function(game){


};

state.intro.prototype = {

    preload: function(){

        this.load.audio('nujabes', ['assets/audio/nujabes_afternoon.mp3']);
        this.load.audio('cheers', ['assets/audio/5_sec_crowd.mp3']);
        this.load.audio('jump',['assets/audio/mario_jump.mp3']);

    },

    create: function(){


        this.introText = this.add.text(100,200,"",{size: "32px", fill:"#FFF"});
        this.changeText(i);
        this.time.events.repeat(Phaser.Timer.SECOND*3,2,this.changeText,this);
        this.time.events.add(Phaser.Timer.SECOND*10,this.startGame,this);

    },

    update: function(){

    },

    changeText: function(){
        var textOutput = ["Catch them dogs!\nSome dogs have been roaming\nthe street time to get them!","Catch the stars to increment the time","Maximize the points before timer runs out!"];
        //this.introText.setText("Catch them dogs!\nSome dogs have been roaming\nthe street time to get them!")
        this.introText.setText(textOutput[i++]);
        
 //       this.introText.setText(textOutput[i]);
 /*       for(var i=0; i<textOutput.length;i++){ 

            //this.time.events.add(Phaser.Timer.SECOND*1,this.introText(textOutput[i]),null,this);
        }*/
        //this.introText.setText("Catch them Dogs!\nSome dogs have been roaming the street time to get them!");
       // this.time.events.add(Phaser.Timer.SECOND*3,changeText,null,this);
    },

    startGame: function(){
        this.state.start('main');
    }

}
