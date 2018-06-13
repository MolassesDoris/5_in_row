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
     this.checkWinner(player, column, i);
     this.askForMove(player.opponent);
   }

   checkWinner(player, column, row){
     var icon = String(player.gameIcon)
     var results = []
     results.push(this.checkHorizontal(row, icon));
     results.push(this.checkVertical(column, icon));
     results.push(this.checkAscendingDiagonal(column, row, icon));
     results.push(this.checkDescendingDiagonal(column, row, icon));
     if(results.includes(true)){
       this.notifyPlayersResult(player)
     }
   }

   notifyPlayersResult(winner){
     var winnerRes = winner.getResponseLoc();
     var winData = JSON.stringify({
       type: 'gameOver',
       result: 'Winner',
       reason: null
     });
     winnerRes.write(winData);
     winnerRes.end();
     var loserRes = winner.opponent.getResponseLoc();
     var loseData = JSON.stringify({
       type: 'gameOver',
       result: 'Loser',
       reason: null
     })
     loserRes.write(loseData);
     loserRes.end();
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

   checkAscendingDiagonal(column, row, icon){
     var startCol = (column + row) % (this.rows -1);
     var startRow = 5;
     var numMatch =0;
     while(startCol < this.cols && startRow >0){
       if(this.grid[startCol][startRow] == icon){
         numMatch += 1;
       }
       else{
         numMatch = 0;
       }
       if(numMatch>=5){
         return true;
       }
       startCol+=1;
       startRow-=1;
     }
     return false;
   }

   checkDescendingDiagonal(column, row, icon){
     var startRow = 0;
     var startCol = 0;
     if(column>row){
       startCol = column - row;
       startRow = 0;
     }else if(column<row){
       startCol = Math.max(column-row, 0);
       startRow = (row-column) == 1 ? 1 : (row-column)
     }
     var numMatched = 0;
     while(startCol < this.cols && startRow < this.rows){
       if(this.grid[startCol][startRow] == icon){
         numMatched += 1;
       }
       else{
         numMatched = 0;
       }
       if(numMatched>=5){
         return true;
       }
       startCol+=1;
       startRow+=1;
     }
     return false;
   }

   // checkDescendingDiagonal(column, row, icon){
   //   var startCol = column - row;
   //   var startRow = 0;
   //   var numMatch = 0;
   //   while(startCol < this.cols && startRow < this.rows){
   //     // var entry = this.grid.slice(startCol);
   //     // console.log(entry[startRow])
   //     if(this.grid[startCol][startRow] == icon){
   //       numMatch += 1;
   //     }
   //     else{
   //       numMatch = 0;
   //     }
   //     if(numMatch>=5){
   //       return true;
   //     }
   //     startCol+=1;
   //     startRow+=1;
   //   }
   //   return false;
   // }

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
       type: 'moveQuery',
       token: this.generateToken(player),
       name: player.name,
       id: player.id,
       icon: player.gameIcon
     });
     response.writeHead(200, {"Content-Type": "application/json"});
     response.end(gridData);
     // player.setResponseLoc(null);
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
     var myTurnRequest = JSON.stringify({
       type : 'joinSuccess',
       name: player.name,
       id: player.id,
       token: this.generateToken(player)
     })
     response.writeHead(200, {"Content-Type": "application/json"});
     response.end(myTurnRequest);
     // player.setResponseLoc(response);
     this.players.push(player);
     this.startPingCheck(player)
     const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));
     const checkIfPlayable = async (player) => {
       while(this.players.length<2){
         await snooze(1000);
       }
       this.handlePlayable(player)
     };
     checkIfPlayable(player)
   }

   isColumnNotFull(column){
     return this.grid[column][0] == '-';
   }

   isMoveInBounds(move){
     return move >=0 && move<this.cols;
   }

   checkIfValidMove(move){
     if(!this.isMoveInBounds(move)){
       return false;
     }
     return this.isColumnNotFull(move);
   }

   notifyInvalid(player, response){
     var invalidMove = JSON.stringify({
       type : 'moveFailure',
       name: player.name,
       id: player.id,
       icon: player.gameIcon,
       token: this.generateToken(player)
     })
     response.writeHead(200, {"Content-Type": "application/json"});
     response.end(invalidMove);
   }

   startPingCheck(player){
     const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));
     const checkPing = async(player) => {
       while(true){
         var updatedPlayer = this.getPlayerWithName(player.name);
         console.log(updatedPlayer.name + ' received Ping: '+ updatedPlayer.receivedPing)
           if(updatedPlayer.receivedPing == false){
             const notify = function(updatedPlayer){
               var response = updatedPlayer.opponent.pingResponse
               var sendData = JSON.stringify({
                 type: 'gameOver',
                 result: 'Winner',
                 reason: 'Opponent has left the game.'
               })
               response.write(sendData);
               response.end();
             }
             if(updatedPlayer.opponent != null){
               notify(updatedPlayer);
             }
             break;
             process.exit()
           }
           updatedPlayer.receivedPing = false;
           await snooze(10000);

       }
     };
     checkPing(player)
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
    this.receivedPing = true;
    this.pingResponse = null;
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
