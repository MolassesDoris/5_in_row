class Connect5 {
   constructor() {
     this.cols = 9;
     this.rows = 6;
     this.grid = [['-','-','-','-','-','-'],
              ['-','-','-','-','-','-'],
              ['-','-','-','-','-','-'],
              ['-','-','-','-','-','-'],
              ['-','-','-','-','-','-'],
              ['-','-','-','-','-','-'],
              ['-','-','-','-','-','-'],
              ['-','-','-','-','-','-'],
              ['-','-','-','-','-','-']];
      this.players = []
      this.pairedPlayers= []
   }

   makeMove(column, player){
     var i = (this.grid[column].length)-1;
     while(i >= 0){
       if(this.grid[column][i] == '-'){
         this.grid[column][i] = player.gameIcon.toString();
         break;
       }
       i-=1
     }
     for(var entry of this.getPrintableGrid()){
       console.log(entry)
     }
     player.turn+=1;
     this.checkWinner(column, i, String(player.gameIcon))
     this.askForMove(player.opponent);
   }

   checkWinner(column, row, icon){
     var results = []
     results.push(this.checkHorizontal(row, icon));
     results.push(this.checkVertical(column, icon));
     console.log(results);
   }

   checkHorizontal(row, icon){
     var numMatch = 0;
     for(var i = 0; i<this.cols;i++){
       if(this.grid[i][row] == icon){
         numMatch+=1
       }else{
         numMatch=0
       }
       if(numMatch>=5){
         return true;
       }
     }
     return false;
   }

   checkVertical(column, icon){
     var numMatch = 0;
     for(var i = 0; i<this.rows;i++){
       if(this.grid[column][i] == icon){
         numMatch+=1
       }else{
         numMatch=0
       }
       if(numMatch>=5){
         return true;
       }
     }
     return false;
   }

   pairPlayerWithOpponent(player){
     var opp = this.players.find(p => player.name != p.name);
     player.opponent = opp;
   }

   getPrintableGrid() {
     var colNums = Array.from(Array(this.cols).keys());
     colNums = colNums.map(x=> x.toString()).join('   ');
     var printable = [];
     printable.push(colNums);
     printable.push('================================');
     for(var i=0; i <= this.rows-1; i++){
       var cleanedRow = [];
       for(var j=0; j <= this.cols-1; j++){
         cleanedRow.push(this.grid[j][i]);
       }
       printable.push(cleanedRow.join('   '));
     }
     return(printable);
   }

   generateToken(player){
     var token = player.name + '-!/=' + player.turn;
     return token;
   }

   parseToken(token){
     var splitToken = token.split('-!/=');
     return splitToken;
   }

   getPlayerWithName(name){
     var player = this.players.filter(p => p.name == name)[0]
     return player;
   }

   askForMove(player){
     var response = player.getResponseLoc();
     var gridMessage = this.getPrintableGrid()
     var gridData = JSON.stringify({
       grid : gridMessage,
       type: 'grid',
       token: this.generateToken(player),
       name: player.name,
       id: player.id,
       icon: player.gameIcon
     });
     response.writeHead(200, {"Content-Type": "application/json"});
     response.end(gridData);
   }

   handlePlayable(player){
     console.log('Players can play now');
     console.log(player.name + ' can play');
     this.pairPlayerWithOpponent(player);
     if(player.id<player.opponent.id){
       player.gameIcon = 'X';
       player.opponent.gameIcon = 'O';
       this.askForMove(player);
     }
   }

   createNewPlayer(name, response = null) {
     // Create new players
     // add player to list of game players
     // if the player can play we send him a response
     var id = this.players.length;
     var player = new Player(name, id);
     player.setResponseLoc(response);
     this.players.push(player);
     const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));
     const checkIfPlayable = async (player) => {
       while(this.players.length<2){
         await snooze(1000);
       }
       this.handlePlayable(player)
     };
     checkIfPlayable(player)
   }

}

class Player {
  constructor(name, id){
    this.name = name;
    this.id = id;
    this.gameIcon = null;
    this.responseLoc = null;
    this.opponent = null;
    this.turn = 0;
  }

  setResponseLoc(responseLoc){
    this.responseLoc = responseLoc;
  }
  getResponseLoc(){
    return this.responseLoc;
  }

}

module.exports = {
  game: Connect5,
  player: Player
};
