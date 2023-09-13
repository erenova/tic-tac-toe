const gameController = (function () {
  const PlayBoard = (() => {
    let _board = ["-", "-", "-", "-", "-", "-", "-", "-", "-"];
    /* 
          X O X
          O X O
          X O X
  */
    let _currentTurn = null;
    let _movesLeft = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];
    const _winPatterns = [
      "012",
      "345",
      "678",
      "036",
      "147",
      "258",
      "048",
      "246",
    ];

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
      if (_currentTurn === null) {
        return "You need to start the game first.";
      }

      if (moveIndex >= _board.length || _board[moveIndex] !== "-") {
        getAsConsoleBoard();
        return "Can't Place there!"; // Invalid
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
      updateGrid(randomIndex);
      if (gameTieState()) {
        updateTieTitle();
        activateResetButtons();
        winnerGlow(false);

        return;
      }
      if (getWinner() === undefined) {
        updateTitle();
      } else {
        winnerGlow(true);
        updateWinnerTitle();
        stopGame();
        activateResetButtons();
      }
    };
    const getBoard = () => [..._board];

    const getMovesLeft = () => [..._movesLeft];

    const getIndexValue = (index) => [..._board][index];

    let _activePlayers = [];

    const getActivePlayers = () => [..._activePlayers];

    const _createPlayer = (name = "player one", state, sign) => {
      if (
        _activePlayers.length === 1 &&
        _activePlayers[0].playerName === name
      ) {
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
      } else if (
        _activePlayers.length === 0 &&
        (sign === "X" || sign === "O")
      ) {
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
      _activePlayers.push(
        Object.freeze({ playerName, playerState, playerSign })
      );
    };

    const startGame = (player1, player2) => {
      if (player1 === undefined || player2 === undefined) {
        return `Please Enter Valid Data`;
      }
      resetGame();
      _createPlayer(
        player1.playerName,
        player1.playerState,
        player1.playerSign
      );
      _createPlayer(
        player2.playerName,
        player2.playerState,
        player2.playerSign
      );
      _currentTurn = getActivePlayers()[0].playerSign === "X" ? "0" : "1";
      console.log(
        `${getTurn().playerName}'s Turn, ${getTurn().playerSign} Sign`
      );
      _handleAITurn();
    };

    const stopGame = () => {
      _movesLeft = [];
      _activePlayers = [];
      _currentTurn = null;
      console.log("Game Over");
    };

    const resetGame = () => {
      _gameSettings.winnerPattern = undefined;
      _gameSettings.winnerSign = undefined;
      _gameSettings.winnerName = undefined;

      stopGame();
      _movesLeft = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];
      _board.fill("-");
      console.log("New Game Started!");
    };
    /* ["012", "345", "678", "036", "147", "258", "048", "246"] */

    const _checkWinPattern = (gameboard) => {
      for (let i = 0; i < _winPatterns.length; i++) {
        let [pat0, pat1, pat2] = _winPatterns[i];
        let activeValues = [gameboard[pat0], gameboard[pat1], gameboard[pat2]];
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
            pattern: `${pat0}${pat1}${pat2}`,
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
        stopGame();
        return true;
      } else {
        gameTieState();
        return false;
      }
    };

    const gameTieState = () => {
      if (_movesLeft.length === 0 && _gameSettings.winnerSign === undefined) {
        stopGame();

        return true;
      }

      return false;
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
      updateGrid(bestMove);

      if (gameTieState()) {
        updateTieTitle();
        activateResetButtons();
        winnerGlow(false);

        return;
      }
      if (getWinner() === undefined) {
        updateTitle();
      } else {
        winnerGlow(true);
        updateWinnerTitle();
        stopGame();
        activateResetButtons();
      }
    };

    const _handleAITurn = () => {
      const activeTurn = getTurn();
      if (!_movesLeft.length || !activeTurn) return;
      const delay = activeTurn.playerState === "medAI" ? 800 : 1000;
      setTimeout(() => {
        if (activeTurn.playerState === "hardAI")
          if (_movesLeft.length === 9)
            setTimeout(() => {
              _makeAIMove();
            }, 500);
          else {
            _makeAIMove();
          }
        else if (activeTurn.playerState === "easyAI") _makeRandomMove();
        else if (activeTurn.playerState === "medAI") {
          if (_movesLeft.length > 7) _makeRandomMove();
          else _makeAIMove();
        }
      }, delay);
    };

    const getWinner = () => {
      const clone = Object.assign({}, _gameSettings);
      if (clone.winnerName === undefined) {
        return undefined;
      }
      return clone;
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
      getWinner,
      stopGame,
      gameTieState,
    });
  })();

  const getDomItem = (selector, all = false) =>
    all
      ? document.querySelectorAll(selector)
      : document.querySelector(selector);

  const resetAllActiveItems = (playerId) => {
    getDomItem(`#${playerId}-ai-state .panel button`, true).forEach((item) => {
      item.classList.remove("active");
    });
    getDomItem(`#${playerId}-ai-state`).classList.remove("active");
    getDomItem(`#${playerId}-human-state`).classList.remove("active");
  };

  const handlePlayerChoice = (playerId) => {
    getDomItem(`#${playerId}-state-selection [data-id]`, true).forEach(
      (element) => {
        element.addEventListener("click", (e) => {
          const datasetVal = e.target.dataset.id;
          resetAllActiveItems(playerId);
          if (datasetVal === "human") {
            resetAllActiveItems(playerId);

            getDomItem(`#${playerId}-list`).dataset.player =
              e.target.dataset.id;
            getDomItem(`[data-${playerId}-panel]`).classList.remove("active");
            getDomItem(`#${playerId}-ai-button`).innerText = "AI";
            getDomItem(`#${playerId}-ai-button`).classList.remove("active");
            getDomItem(`#${playerId}-human-state`).classList.add("active");
          }
          if (
            getDomItem(`#${playerId}-list`).dataset.player === "medAI" ||
            getDomItem(`#${playerId}-list`).dataset.player === "hardAI"
          ) {
            getDomItem(`#${playerId}-ai-state`).classList.add("active");

            return;
          }
          if (datasetVal === "easyAI") {
            getDomItem(`#${playerId}-list`).dataset.player =
              e.target.dataset.id;
            getDomItem(`#${playerId}-ai-button`).innerText =
              e.target.dataset.id;
            getDomItem(`#${playerId}-ai-state`).classList.add("active");
            getDomItem(
              `#${playerId}-ai-state .panel button:first-child`
            ).classList.add("active");
          }
        });
      }
    );
  };

  const handleDifficultyChoice = (playerId) => {
    getDomItem(`#${playerId}-ai-state .panel button`, true).forEach((item) => {
      item.addEventListener("click", (e) => {
        getDomItem(`#${playerId}-ai-state .panel button`, true).forEach(
          (button) => {
            button.classList.remove("active");
          }
        );
        getDomItem(`#${playerId}-list`).dataset.player = e.target.dataset.diff;
        getDomItem(`#${playerId}-ai-button`).innerText = e.target.dataset.diff;
        getDomItem(`#${playerId}-human-state`).classList.remove("active");
        getDomItem(`#${playerId}-ai-button`).classList.add("active");
        e.target.classList.add("active");
      });
    });
  };

  // Handle choices for the first and second players
  handlePlayerChoice("player-one");
  handlePlayerChoice("player-two");

  // Handle difficulty choices for the first and second players
  handleDifficultyChoice("player-one");
  handleDifficultyChoice("player-two");

  getDomItem("#switch-sign").addEventListener("click", () => {
    let signX = getDomItem(`[data-player-sign="X"]`);
    let signO = getDomItem(`[data-player-sign="O"]`);

    if (!signX || !signO) {
      getDomItem(`[data-player-sign]`, true)[0].dataset.playerSign = `X`;
      getDomItem(`[data-player-sign]`, true)[1].dataset.playerSign = `O`;
    } else {
      // Add vanish class to make them disappear
      signX.classList.add("vanish");
      signO.classList.add("vanish");

      // Replace with new signs after 1 second (1000ms)
      setTimeout(() => {
        signX.textContent = "O";
        signO.textContent = "X";

        // Remove vanish class to make them reappear
        signX.classList.remove("vanish");
        signO.classList.remove("vanish");

        // Toggle the player signs
        signX.dataset.playerSign = `O`;
        signO.dataset.playerSign = `X`;
      }, 550);
    }
  });

  const collectValues = () => {
    const playerOne = {};
    const playerTwo = {};
    let firstPlayerName = getDomItem("#firstUserName").value;
    let firstPlayerState = getDomItem("#player-one-list").dataset.player;
    let firstPlayerSign = getDomItem("#player-one-sign>[data-player-sign]")
      .dataset.playerSign;
    let secondPlayerName = getDomItem("#secondUserName").value;
    let secondPlayerState = getDomItem("#player-two-list").dataset.player;
    let secondPlayerSign = getDomItem("#player-two-sign>[data-player-sign]")
      .dataset.playerSign;
    if (firstPlayerName !== "") playerOne.playerName = firstPlayerName;
    playerOne.playerState = firstPlayerState;
    playerOne.playerSign = firstPlayerSign;
    if (secondPlayerName !== "") playerTwo.playerName = secondPlayerName;
    playerTwo.playerState = secondPlayerState;
    playerTwo.playerSign = secondPlayerSign;

    return { playerOne, playerTwo };
  };

  const updateTitle = () => {
    const turnSec = getDomItem(".active-player-name");
    const interTitle = getDomItem(".intertitle");
    interTitle.innerText = `'s Turn sign:`;
    const turnSign = getDomItem(".active-sign-symbol");

    const getTurnVal = PlayBoard.getTurn();
    turnSec.innerText = getTurnVal.playerName;
    turnSign.innerText = getTurnVal.playerSign;
  };
  const updateWinnerTitle = () => {
    const turnSec = getDomItem(".active-player-name");
    const interTitle = getDomItem(".intertitle");
    winnerGlow(true);

    interTitle.innerText = "";
    turnSec.innerText = `Winner Is: ${PlayBoard.getWinner().winnerName}`;
  };

  const updateTieTitle = () => {
    const turnSec = getDomItem(".active-player-name");
    const turnSign = getDomItem(".active-sign-symbol");
    const interTitle = getDomItem(".intertitle");
    turnSec.innerText = `Game Tie`;
    turnSign.innerText = "";
    interTitle.innerText = "";
  };
  const updateGrid = (index) => {
    if (PlayBoard.getIndexValue(index) !== "-") {
      gridList[index].firstChild.textContent = PlayBoard.getIndexValue(index);
      setTimeout(() => {
        gridList[index].firstChild.classList.remove("hidden");
      }, 100);
    }
  };

  /* Start game button */
  getDomItem("[data-start-game]").addEventListener("click", () => {
    const mainMenu = getDomItem(".main-menu");
    const gameboardScreen = getDomItem(".gameboard-screen");

    mainMenu.classList.remove("active");
    mainMenu.classList.add("progress");
    setTimeout(() => {
      mainMenu.classList.add("passive");
      gameboardScreen.classList.remove("passive");
      gameboardScreen.classList.add("progress");
    }, 475);
    setTimeout(() => {
      gameboardScreen.classList.add("active");
    }, 575);
    let val = collectValues();
    PlayBoard.startGame(val.playerOne, val.playerTwo);
    updateTitle();
    repeatScenario();
  });

  /* Making move on UI */
  const gridList = getDomItem(".grid-item", true);
  for (let i = 0; i < gridList.length; i++) {
    gridList[i].addEventListener("click", () => {
      const isAi = PlayBoard.getTurn().playerState.includes("AI");

      if (!isAi) {
        if (PlayBoard.getActivePlayers().length === 2) {
          PlayBoard.makeMove(i);
          updateGrid(i);
          if (PlayBoard.gameTieState()) {
            updateTieTitle();
            activateResetButtons();

            return;
          }
          if (PlayBoard.getWinner() === undefined) {
            updateTitle();
          } else {
            winnerGlow(true);
            updateWinnerTitle();
            PlayBoard.stopGame();
            activateResetButtons();
          }
        }
      }
    });
  }

  /* Reset buttons */
  /* repeat btn */
  getDomItem('[data-button-type="repeat"]').addEventListener("click", () => {
    repeatScenario();
    winnerGlow(false);
    let val = collectValues();
    PlayBoard.startGame(val.playerOne, val.playerTwo);
    updateTitle();
  });

  /* back btn */
  getDomItem('[data-button-type="reset"]').addEventListener("click", () => {
    const mainMenu = getDomItem(".main-menu");
    const gameboardScreen = getDomItem(".gameboard-screen");

    gameboardScreen.classList.remove("active");
    gameboardScreen.classList.add("progress");
    setTimeout(() => {
      gameboardScreen.classList.add("passive");
      mainMenu.classList.remove("passive");
      mainMenu.classList.add("progress");
    }, 475);
    setTimeout(() => {
      mainMenu.classList.add("active");
    }, 575);
  });

  const repeatScenario = () => {
    let gridList = getDomItem(".sign-val.hidden", true);
    gridList.forEach((item) => {
      item.classList.remove("hidden");
    });
    gridList = getDomItem(".sign-val", true);
    gridList.forEach((element) => {
      element.classList.add("hidden");
    });
    disableResetButtons();
    winnerGlow(false);
  };

  const activateResetButtons = () => {
    getDomItem(".reset-buttons").classList.add("progress");
    setTimeout(() => {
      getDomItem(".reset-buttons").classList.add("active");
    }, 50);
  };
  const disableResetButtons = () => {
    getDomItem(".reset-buttons").classList.remove("active");
    setTimeout(() => {
      getDomItem(".reset-buttons").classList.remove("progress");
    }, 100);
  };

  /* winner glow */
  const winnerGlow = (give) => {
    if (give) {
      if (PlayBoard.getWinner() !== undefined) {
        let glowList = [
          PlayBoard.getWinner().winnerPattern[0] || null,
          PlayBoard.getWinner().winnerPattern[1] || null,
          PlayBoard.getWinner().winnerPattern[2] || null,
        ];

        gridList[glowList[0]].classList.add("win-glow");
        gridList[glowList[1]].classList.add("win-glow");
        gridList[glowList[2]].classList.add("win-glow");
      }
    } else {
      gridList.forEach((item) => {
        item.classList.remove("win-glow");
      });
    }
  };

  const updateLabelVisibility = (inputElement, labelElement) => {
    labelElement.classList.remove("label-focused", "label-filled");
    if (inputElement.value) labelElement.classList.add("label-filled");
    if (inputElement.matches(":focus"))
      labelElement.classList.add("label-focused");
  };

  const attachEvents = (inputId) => {
    const inputElement = getDomItem(`#${inputId}`);
    const labelElement = getDomItem(`label[for='${inputId}']`);
    ["input", "focus", "blur"].forEach((event) =>
      inputElement.addEventListener(event, () =>
        updateLabelVisibility(inputElement, labelElement)
      )
    );
  };

  document.addEventListener("DOMContentLoaded", () => {
    const mainMenu = getDomItem(".main-menu");
    setTimeout(() => mainMenu.classList.add("active"), 175);

    ["firstUserName", "secondUserName"].forEach(attachEvents);

    const acc = getDomItem(".ai-state > button", true);
    acc.forEach((item) => {
      item.addEventListener("click", () => {
        const panel = item.nextElementSibling;
        panel.classList.toggle("active");
      });
    });
  });

  return { PlayBoard, collectValues, updateGrid, gridList };
})();
