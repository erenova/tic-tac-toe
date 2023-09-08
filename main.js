const PlayBoard = (() => {
  let _board = ["-", "-", "-", "-", "-", "-", "-", "-", "-"];
  /* 
          X O X
          O X O
          X O X
  */
  let _currentTurn = null;
  let _movesLeft = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];
  const _winPatterns = ["012", "345", "678", "036", "147", "258", "048", "246"];

  let _gameSettings = {
    winnerName: undefined,
    winnerPattern: undefined,
    winnerSign: undefined,
  };

  const _switchTurn = () => {
    _currentTurn = _currentTurn === "0" ? "1" : "0";
    _handleAITurn();
  };
  const findSign = () => {
    if (_currentTurn === null) return undefined;
    let whoseTurn = _currentTurn === "0" ? "X" : "O";
    return whoseTurn;
  };
  const getTurn = () => {
    let value = findSign();
    if (value !== undefined) {
      let turn =
        getActivePlayers()[0].playerSign === value
          ? getActivePlayers()[0]
          : getActivePlayers()[1];
      return turn;
    } else return undefined;
  };

  const makeMove = (moveIndex) => {
    if (moveIndex >= _board.length || _board[moveIndex] !== "-") {
      getAsConsoleBoard();
      return "Can't Place there!"; // Invalid
    }

    if (_currentTurn === null) {
      return "You need to start the game first.";
    }
    if (_movesLeft.includes(`${moveIndex}`)) {
      let tempIndex = _movesLeft.findIndex((e) => e === `${moveIndex}`);
      _movesLeft.splice(tempIndex, 1);
      _board[moveIndex] = findSign();
      _switchTurn();
      console.log(_movesLeft);
      getAsConsoleBoard();

      let activeGameState = _decideGameState(getBoard());
      if (activeGameState === false && getMovesLeft().length > 0)
        console.log(
          `${getTurn().playerName}'s Turn, ${getTurn().playerSign} Sign`
        );

      return true; // Valid
    }
  };
  const _makeRandomMove = () => {
    let randomIndex = Math.floor(Math.random() * _movesLeft.length);
    randomIndex = _movesLeft[randomIndex];
    makeMove(randomIndex);
  };
  const getBoard = () => [..._board];

  const getMovesLeft = () => [..._movesLeft];

  const getIndexValue = (index) => [..._board][index];

  let _activePlayers = [];

  const getActivePlayers = () => [..._activePlayers];

  const _createPlayer = (name = "player one", state = "human", sign) => {
    if (_activePlayers.length === 1 && _activePlayers[0].playerName === name) {
      name += ` (2)`;
    }
    state =
      state === "hardAI"
        ? "hardAI"
        : state === "medAI"
        ? "medAI"
        : state === "easyAI"
        ? "easyAI"
        : "human";
    let playerSign;
    if (_activePlayers.length === 1) {
      playerSign = _activePlayers[0].playerSign === "X" ? "O" : "X";
    } else if (_activePlayers.length === 0 && (sign === "X" || sign === "O")) {
      playerSign = sign;
    } else if (_activePlayers.length === 0) {
      playerSign = "X";
    } else if (_activePlayers.length === 2) {
      return "Please Reset The Game For Add New Player";
    } else {
      return "Please Enter The Values In Correct Format";
    }
    const playerName = name;
    const playerState = state;
    _activePlayers.push(Object.freeze({ playerName, playerState, playerSign }));
  };

  const startGame = (player1, player2) => {
    if (player1 === undefined || player2 === undefined) {
      return `Please Enter Valid Data`;
    }
    resetGame();
    _createPlayer(player1.playerName, player1.playerState, player1.playerSign);
    _createPlayer(player2.playerName, player2.playerState, player2.playerSign);
    _currentTurn = getActivePlayers()[0].playerSign === "X" ? "0" : "1";
    console.log(`${getTurn().playerName}'s Turn, ${getTurn().playerSign} Sign`);
    _handleAITurn();
  };

  const _stopGame = () => {
    _gameSettings.winnerPattern = undefined;
    _movesLeft = [];
    _activePlayers = [];
    _currentTurn = null;
    console.log("Game Over");
  };

  const resetGame = () => {
    _gameSettings.winnerSign = undefined;
    _stopGame();
    _movesLeft = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];
    _board.fill("-");
    console.log("New Game Started!");
  };
  /* ["012", "345", "678", "036", "147", "258", "048", "246"] */

  const _checkWinPattern = (gameboard) => {
    for (let i = 0; i < _winPatterns.length; i++) {
      let patterns = [
        _winPatterns[i][0],
        _winPatterns[i][1],
        _winPatterns[i][2],
      ];
      let activeValues = [
        gameboard[patterns[0]],
        gameboard[patterns[1]],
        gameboard[patterns[2]],
      ];
      let activeSign = activeValues[0];
      if (
        activeSign !== "-" &&
        activeSign === activeValues[1] &&
        activeSign === activeValues[2]
      ) {
        let name = getActivePlayers().find(
          (item) => item.playerSign === `${activeSign}`
        ).playerName;
        return {
          name,
          sign: activeSign,
          pattern: `${patterns[0]}${patterns[1]}${patterns[2]}`,
        };
      }
    }
    return null;
  };

  const _decideGameState = (gameboard) => {
    const winner = _checkWinPattern(gameboard);

    if (winner !== null) {
      _gameSettings.winnerName = winner.name;
      _gameSettings.winnerSign = winner.sign;
      _gameSettings.winnerPattern = winner.pattern;
      console.log(
        `The Winner is: ${winner.name} Winner Sign: ${winner.sign} Winner Pattern: ${winner.pattern}`
      );
      _stopGame();
      return true;
    } else {
      _gameTieState();
      return false;
    }
  };

  const _gameTieState = () => {
    if (_movesLeft.length === 0 && _gameSettings.winnerSign === undefined) {
      _stopGame();
      console.log("Game is tie");
    }
    return;
  };

  const _minimax = (gameboard, depth, maximizing) => {
    const winnerResult = _checkWinPattern(gameboard);
    let chances = {
      active: findSign(),
      enemy: findSign() === "X" ? "O" : "X",
    };

    if (winnerResult !== null) {
      if (winnerResult.sign === chances.active) return 10 - depth;
      if (winnerResult.sign === chances.enemy) return -10 + depth;
    }
    if (_movesLeft.length === 0) return 0;

    if (maximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < _movesLeft.length; i++) {
        let index = _movesLeft[i];
        gameboard[index] = chances.active;
        _movesLeft.splice(i, 1);
        let evaluation = _minimax(gameboard, depth + 1, false);
        gameboard[index] = "-";
        _movesLeft.splice(i, 0, index);
        maxEval = Math.max(evaluation, maxEval);
      }

      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < _movesLeft.length; i++) {
        let index = _movesLeft[i];
        gameboard[index] = chances.enemy;
        _movesLeft.splice(i, 1);
        let evaluation = _minimax(gameboard, depth + 1, true);
        gameboard[index] = "-";
        _movesLeft.splice(i, 0, index);
        minEval = Math.min(evaluation, minEval);
      }
      return minEval;
    }
  };

  const _makeAIMove = () => {
    let bestValue = -Infinity;
    let bestMove = null;

    for (let i = 0; i < _movesLeft.length; i++) {
      let index = _movesLeft[i];
      _board[index] = findSign();
      _movesLeft.splice(i, 1);
      let moveValue = _minimax(_board, 0, false);
      _board[index] = "-";
      _movesLeft.splice(i, 0, index);

      if (moveValue > bestValue) {
        bestValue = moveValue;
        bestMove = index;
      }
    }

    makeMove(bestMove);
  };

  const _handleAITurn = () => {
    let activeTurn = getTurn();
    if (getMovesLeft().length === 0) {
      return;
    }
    if (activeTurn !== undefined) {
      if (activeTurn.playerState === "hardAI") {
        setTimeout(() => {
          _makeAIMove();
        }, 1000);
      } else if (activeTurn.playerState === "easyAI") {
        setTimeout(() => {
          _makeRandomMove();
        }, 1000);
      } else if (activeTurn.playerState === "medAI") {
        if (getMovesLeft().length === 8 || getMovesLeft().length === 9) {
          setTimeout(() => {
            _makeRandomMove();
          }, 800);
        } else {
          setTimeout(() => {
            _makeAIMove();
          }, 800);
        }
      }
    }
  };

  const getAsConsoleBoard = () => {
    console.log(
      PlayBoard.getIndexValue(0),
      PlayBoard.getIndexValue(1),
      PlayBoard.getIndexValue(2)
    );
    console.log(
      PlayBoard.getIndexValue(3),
      PlayBoard.getIndexValue(4),
      PlayBoard.getIndexValue(5)
    );
    console.log(
      PlayBoard.getIndexValue(6),
      PlayBoard.getIndexValue(7),
      PlayBoard.getIndexValue(8)
    );
  };

  return Object.freeze({
    findSign,
    getBoard,
    makeMove,
    getIndexValue,
    getMovesLeft,
    resetGame,
    getAsConsoleBoard,
    getActivePlayers,
    startGame,
    getTurn,
    _gameSettings,
  });
})();
