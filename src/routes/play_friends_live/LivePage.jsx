import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";
import { LiveGameContext } from "src/context/useLiveGameContext";
import { startGame, rollDice, holdPoints } from "../../services/gameService";
import { soundManager } from "../../soundManager";

function LiveGamePage() {
  const { preloadSrcList, pigPetNames } = useGreedyPigContext();
  
  const name1 = pigPetNames?.[0] || "Sugar";
  const name2 = pigPetNames?.[1] && pigPetNames[1] !== name1 ? pigPetNames[1] : "Oliver";
  const name3 = pigPetNames?.[2] && pigPetNames[2] !== name1 && pigPetNames[2] !== name2 ? pigPetNames[2] : "Marley";

  const initialDefaultPlayers = [
    { id: 1, name: name1, avatar: preloadSrcList?.[0] || "", score: 0, runningScore: 0 },
    { id: 2, name: name2, avatar: preloadSrcList?.[1] || "", score: 0, runningScore: 0 },
    { id: 3, name: name3, avatar: preloadSrcList?.[2] || "", score: 0, runningScore: 0 },
  ];

  const [gameId, setGameId] = useState("local-session");
  const [playerData, setPlayerData] = useState(initialDefaultPlayers);
  const [maxPoints, setMaxPoints] = useState(100);
  const [gameLevel, setGameLevel] = useState(1);
  const [gameHistory, setGameHistory] = useState([]);
  const [numberRolled, setNumberRolled] = useState(0);
  const [changeBackground, setChangeBackground] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false); 
  const [isContinue, setIsContinue] = useState(false); 
  const [isRunning, setIsRunning] = useState("?");
  const [diceValue, setDiceValue] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const startNewGame = async ({ players, targetScore, level }) => {
    const session = await startGame(players, targetScore, level);
    setGameId(session.gameId || "local-session");
    setPlayerData(session.players?.length ? session.players : players);
    setMaxPoints(Number(session.targetScore) || Number(targetScore));
    setGameLevel(Number(session.level) || Number(level));
    setCurrentPlayer(0);
    setIsGameOver(false);
    setDiceValue(1);
  };

  const handleRollDice = async () => {
    if (isGameOver) return;

    let result = null;
    try {
      result = await rollDice(gameId);
    } catch {
      result = null;
    }

    if (result && result.players) {
      setDiceValue(result.diceValue);
      
      if (result.diceValue === 1) soundManager.play('pigOut');
      else soundManager.play('roll');

      const updatedPlayers = result.players.map((p, idx) => ({
        ...(playerData[idx] || {}),
        ...p,
        score: Number(p.score ?? p.totalScore ?? 0),
        runningScore: Number(p.runningScore ?? p.currentScore ?? 0),
      }));

      setPlayerData(updatedPlayers);
      setCurrentPlayer(result.currentPlayer ?? currentPlayer);
      
      const hasWinner = updatedPlayers.some(p => p.score >= maxPoints);
      setIsGameOver(result.isGameOver || hasWinner);
      
      if (result.isGameOver || hasWinner) soundManager.play('win');
    } else {
      const oneChance = (1 / 6) * 1.4 ** (gameLevel - 1);
      const rolled = Math.random() < oneChance ? 1 : Math.floor(Math.random() * 5) + 2;
      setDiceValue(rolled);
      setNumberRolled(rolled);

      if (rolled === 1) soundManager.play('pigOut');
      else soundManager.play('roll');

      setPlayerData((prevPlayers) => {
        const updated = prevPlayers.map(p => ({
          ...p,
          score: Number(p.score) || 0,
          runningScore: Number(p.runningScore) || 0,
        }));
        
        const active = { ...updated[currentPlayer] };

        if (rolled === 1) {
          active.runningScore = 0;
          updated[currentPlayer] = active;
          setCurrentPlayer((prevTurn) => (prevTurn + 1) % updated.length);
        } else {
          active.runningScore += rolled;
          updated[currentPlayer] = active;
        }

        return updated;
      });
    }
  };

  const handleHoldPoints = async () => {
    if (isGameOver) return;
    
    soundManager.play('hold');

    const activePlayerObj = playerData[currentPlayer];
    const projectedScore = (Number(activePlayerObj?.score) || 0) + (Number(activePlayerObj?.runningScore) || 0);

    let result = null;
    try {
      result = await holdPoints(gameId, {
        winnerName: activePlayerObj?.name,
        winningScore: projectedScore,
        playersList: playerData.map(p => p.name),
      });
    } catch {
      result = null;
    }

    if (result && result.players) {
      const updatedPlayers = result.players.map((p, idx) => ({
        ...(playerData[idx] || {}),
        ...p,
        score: Number(p.score ?? p.totalScore ?? 0),
        runningScore: Number(p.runningScore ?? p.currentScore ?? 0),
      }));

      setPlayerData(updatedPlayers);
      const hasWinner = updatedPlayers.some(p => p.score >= maxPoints);
      setIsGameOver(result.isGameOver || hasWinner);

      if (result.isGameOver || hasWinner) {
        soundManager.play('win');
      } else {
        setCurrentPlayer(result.currentPlayer ?? currentPlayer);
      }
    } else {
      setPlayerData((prevPlayers) => {
        const updated = prevPlayers.map(p => ({
          ...p,
          score: Number(p.score) || 0,
          runningScore: Number(p.runningScore) || 0,
        }));
        
        const active = { ...updated[currentPlayer] };

        active.score += active.runningScore;
        active.runningScore = 0;
        updated[currentPlayer] = active;

        const hasWinner = updated.some(p => p.score >= maxPoints);
        if (hasWinner || active.score >= maxPoints) {
          setIsGameOver(true);
          soundManager.play('win');
        } else {
          setCurrentPlayer((prevTurn) => (prevTurn + 1) % updated.length);
        }

        return updated;
      });
    }
  };

  const handleMuteToggle = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <main className="bg-[#111111] min-h-screen min-w-full relative z-10 sec-font">
      

      <div
        className={`${
          changeBackground ? " bg-[#D30CBD] blur-[200px] md:blur-[300px] " : diceValue === 1 ? "bg-[#D30C0C] blur-[500px] md:blur-[800px]" : "bg-[#056FA4] blur-[500px] md:blur-[800px]"
        } rounded-full w-[800px] h-[800px] -z-10 fixed -bottom-[700px] -left-[700px] md:-bottom-96 md:-left-96`}
      ></div>
      <div className={`${
          changeBackground ? "bg-[#056FA4] blur-[200px] md:blur-[300px] " : diceValue === 1 ? "bg-[#D30C0C] blur-[500px] md:blur-[800px] " : "bg-[#D30CBD] blur-[500px] md:blur-[800px]"
        } rounded-full w-[800px] h-[800px] -z-10 fixed -top-[700px] -right-[700px] md:-top-96 md:-right-96`}></div>
      <LiveGameContext.Provider
        value={{
          playerData,
          setPlayerData,
          maxPoints,
          setMaxPoints,
          gameLevel,
          setGameLevel,
          startNewGame,
          gameHistory,
          setGameHistory,
          numberRolled,
          setNumberRolled,
          isRunning,
          setIsRunning,
          changeBackground,
          setChangeBackground,
          diceValue,
          setDiceValue,
          currentPlayer,
          setCurrentPlayer,
          setIsGameOver,
          isGameOver,
          isContinue,
          setIsContinue,
          handleRollDice,
          handleHoldDice: handleHoldPoints,
          gameId
        }}
      >
        <Outlet />
      </LiveGameContext.Provider>
    </main>
  );
}

export default LiveGamePage;