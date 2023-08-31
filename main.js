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
    return _currentTurn;
  };
  const makeMove = (moveIndex) => {
    if (moveIndex >= _board.length || _board[moveIndex] !== "-") {
      getAsConsoleBoard();
      return "Can't Place there!"; // Invalid
    }
    if (_movesLeft.includes(`${moveIndex}`)) {
      let tempIndex = _movesLeft.findIndex((e) => e === `${moveIndex}`);
      _movesLeft.splice(tempIndex, 1);
      _board[moveIndex] = _currentTurn === "1" ? "X" : "O";
      _switchTurn();
      console.log(_movesLeft);
      getAsConsoleBoard();
      checkWinPattern();
      return true; // Valid
    }
  };
  const makeRandomMove = () => {
    let randomIndex = Math.floor(Math.random() * _movesLeft.length);
    randomIndex = _movesLeft[randomIndex];
    makeMove(randomIndex);
  };
  const getBoard = () => [..._board];

  const getIndexValue = (index) => [..._board][index];

  const getMovesLeft = () => [..._movesLeft];
  const gameTieState = () => {
    if (_movesLeft.length === 0 && _winnerState.winnerSign === "") {
      stopGame();
      console.log("Game is tie");
    }
    return;
  };
  const stopGame = () => {
    _winnerState.winnerPattern = ``;

    _movesLeft = [];
    _currentTurn = "1";
    console.log("Game Ended!");
  };

  const resetGame = () => {
    _winnerState.winnerSign = ``;
    stopGame();
    _movesLeft = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];

    _board.fill("-");
    console.log("New Game Started!");
  };
  /* ["012", "345", "678", "036", "147", "258", "048", "246"] */
  const checkWinPattern = () => {
    let isGameEnded = false;
    for (let i = 0; i < _winPatterns.length; i++) {
      if (isGameEnded === false) {
        let patterns = [
          _winPatterns[i][0],
          _winPatterns[i][1],
          _winPatterns[i][2],
        ];
        let activeValues = [
          _board[patterns[0]],
          _board[patterns[1]],
          _board[patterns[2]],
        ];
        let activeSign = activeValues[0];
        if (
          activeSign !== "-" &&
          activeSign === activeValues[1] &&
          activeSign === activeValues[2]
        ) {
          _winnerState.wonPattern = `${patterns[0]}${patterns[1]}${patterns[2]}`;
          _winnerState.winnerSign = activeSign;
          console.log(
            `Winner Pattern is:${_winnerState.wonPattern} Winner Sign is: ${activeSign}`
          );
          stopGame();
          isGameEnded = true;
          return;
        }
      }
    }
    gameTieState();
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
    findTurn,
    getBoard,
    makeMove,
    makeRandomMove,
    getIndexValue,
    getMovesLeft,
    stopGame,
    resetGame,
    checkWinPattern,
    getAsConsoleBoard,
  });
})();

const newPlayer = (name = "Player") => {
  let _name = `${name}`;

  const setName = (newName = "Player") => {
    if (newName != "") _name = `${newName}`;
  };
  const getName = () => {
    return _name;
  };
  return Object.freeze({ setName, getName });
};
