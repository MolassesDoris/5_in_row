var chai = require('chai');
var sinon = require('sinon');
var ConnectGame = require('../game').game;
var Player = require('../game').player;

describe('Game', function(){
  beforeEach(function() {
		this.game = new ConnectGame();
	});

  it('Grid Location [0,5] should equal \'X\'', function(){
    var checkWinner = sinon.stub(this.game, 'checkWinner');
    var handleSuccesfulUserMove = sinon.stub(this.game, 'handleSuccesfulUserMove');
    var player = new Player('Test', 0);
    player.gameIcon = 'X';
    this.game.makeMove(0, player);
    var entry = this.game.grid[0][5]
    chai.assert.equal(entry, 'X');
    checkWinner.restore();
    handleSuccesfulUserMove.restore();
  });

  it('CheckVertical should find 5-in-row of column 5', function(){
    var mockColumn = ['X','X','X','X','X','X'];
    var stub = sinon.stub(this.game.grid, [5]).value(mockColumn);
    var result = this.game.checkVertical(5, 'X');
    chai.assert.equal(result, true);
  });

  it('CheckHorizontal should find 5-in-row of row 4', function(){
    for(var i = 0; i<=5; i++){
      sinon.stub(this.game.grid[i], [4]).value('X');
    }
    var result = this.game.checkHorizontal(4, 'X');
    chai.assert.equal(result, true);
  });

  it('checkAscendingDiagonal should find 5-in-row', function(){
    var i = 0;
    var j = 5;
    while(i<5 && j >=0){
      sinon.stub(this.game.grid[i], [j]).value('X');
      i+=1;
      j-=1;
    }
    var result = this.game.checkAscendingDiagonal(4, 1, 'X');
    chai.assert.equal(result, true);
  });

  it('checkDescendingDiagonal should find 5-in-row', function(){
    var i = 0;
    var j = 1;
    while(i<5 && j<=5){
      sinon.stub(this.game.grid[i], [j]).value('X');
      i+=1;
      j+=1;
    }
    var result = this.game.checkDescendingDiagonal(2, 3, 'X');
    chai.assert.equal(result, true);
  });

});
