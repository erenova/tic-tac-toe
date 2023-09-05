const PlayBoard = (() => {
  let _board = ["-", "-", "-", "-", "-", "-", "-", "-", "-"];
  /* 
          X O X
          O X O
          X O X
  */
  let _currentTurn = "1";
  let _movesLeft = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];
  const _winPatterns = ["012", "345", "678", "036", "147", "258", "048", "246"];

  let _winnerState = {
    winnerPattern: "",
    winnerSign: "",
  };

  const _switchTurn = () => {
    _currentTurn = _currentTurn === "1" ? "2" : "1";
  };
  const findTurn = () => {
    let whoseTurn = _currentTurn === "1" ? "X" : "O";
    return whoseTurn;
  };
  const makeMove = (moveIndex) => {
    if (moveIndex >= _board.length || _board[moveIndex] !== "-") {
      getAsConsoleBoard();
      return "Can't Place there!"; // Invalid
    }
    if (_movesLeft.includes(`${moveIndex}`)) {
      let tempIndex = _movesLeft.findIndex((e) => e === `${moveIndex}`);
      _movesLeft.splice(tempIndex, 1);
      _board[moveIndex] = findTurn();
      _switchTurn();
      console.log(_movesLeft);
      getAsConsoleBoard();
      _decideGameState(getBoard());
      return true; // Valid
    }
  };
  const makeRandomMove = () => {
    let randomIndex = Math.floor(Math.random() * _movesLeft.length);
    randomIndex = _movesLeft[randomIndex];
    makeMove(randomIndex);
  };
  const getBoard = () => [..._board];

  const getMovesLeft = () => [..._movesLeft];

  const getIndexValue = (index) => [..._board][index];

  const _stopGame = () => {
    _winnerState.winnerPattern = ``;
    _movesLeft = [];
    _currentTurn = "1";
    console.log("Game Ended!");
  };

  const resetGame = () => {
    _winnerState.winnerSign = ``;
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
        return {
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
      _winnerState.winnerSign = winner.sign;
      _winnerState.winnerPattern = winner.pattern;
      console.log(
        `Winner Sign: ${winner.sign} Winner Pattern: ${winner.pattern}`
      );
      _stopGame();
    } else {
      _gameTieState();
    }
  };

  const _gameTieState = () => {
    if (_movesLeft.length === 0 && _winnerState.winnerSign === "") {
      _stopGame();
      console.log("Game is tie");
    }
    return;
  };

  const minimax = (board, sign) => {};

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
    findTurn,
    getBoard,
    makeMove,
    makeRandomMove,
    getIndexValue,
    getMovesLeft,
    resetGame,
    getAsConsoleBoard,
  });
})();

const createPlayer = (name, state = "player") => {
  if (state !== "player" || state !== "ai") state = "player";
  const playerName = name;
  const playerState = state;

  return Object.freeze({ playerName, playerState });
};

const PlayerOne = createPlayer("eren", "ai");
const PlayerTwo = createPlayer("erenova", "ai");
