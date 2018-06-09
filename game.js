class Connect5 {
   constructor() {
     this.cols = 9;
     this.rows = 6;
     this.grid = [['0','0','0','0','0','0','0','0','0'],
              ['0','0','0','0','0','0','0','0','0'],
              ['0','0','0','0','0','0','0','0','0'],
              ['0','0','0','0','0','0','0','0','0'],
              ['0','0','0','0','0','0','0','0','0'],
              ['0','0','0','0','0','0','0','0','0']];
      this.players=[]
   }

   display() {
     var colNums = Array.from(Array(9).keys());
     colNums = colNums.map(x=> x.toString()).join('   ');
     console.log(colNums);
     console.log('-----------------------------------')
     for(var row of this.grid){
       var cleanedRow = []
       for(var column of row){
         cleanedRow.push(column)
       }
       console.log(cleanedRow.join('   '))
     }
   }

   newPlayer(name, value) {
     var player = new Player(name, value)
     this.players.push(player)
   }

}

class Player {
  constructor(name, value){
    this.name = name;
    this.value = value;
  }
}

module.exports = {
  game: Connect5
};
