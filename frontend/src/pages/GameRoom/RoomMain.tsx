import { useEffect, useRef, useState } from "react"
import { useParams, useLocation } from "react-router";
import Intro from "./Intro";
import WhiteBoard from "./WhiteBoard";
import CategoryAndInput from "./InputAndCountdown";

import Profiles from "./Profiles";
import type { GameState, Player } from "./Dataclasses";
import LoadingPage from "../LoadingPage";

export default function Doc() {
  const {roomId} = useParams(); // params.roomId will hold the room id from the route (e.g. /:roomId)
  const {state} = useLocation();

  const [guess, setGuess] = useState('');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[] | null>(null);


  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const clientId = useRef<String | null>(null);


  useEffect(() => {
    if (!roomId || !state?.clientId || !state?.name) {
      console.error("Missing roomId, clientId, or name");
      return;
    }
    clientId.current = state.clientId;

    const clientName = state.name;

    // Connect websocket
    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/${roomId}?clientId=${clientId.current}&clientName=${clientName}`
    );
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connection established");
    }
    ws.onclose = () => {
      console.log("WebSocket connection closed");
    }
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const ctx = ctxRef.current;
      if (data.type === 'clear') {
        if (!ctx) return
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      } else if (data.type === 'draw') {
        const {prevX, prevY, currX, currY, color, lineWidth} = data;
        if (!ctx) return
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currX, currY);
        ctx.stroke();
      } else if (data.type === 'update_game') {
        const {gameState, players} = data
        let playersArr: Player[] = []
        Object.keys(players).forEach(clientId => {
          const {name, score, hasGuessed, correctGuesses} = players[clientId]
          const player: Player = {
            id: clientId,
            name: name,
            score: score,
            hasGuessed: hasGuessed,
            correctGuesses: correctGuesses
          }
          playersArr.push(player)
        })
        setPlayers(playersArr)
        setGameState(gameState)
      } else if (data.type === 'game_start') {
        const { hostId, capacityLimit, round, gameInsession, currentDrawer, currentCategory, currentWord } = data.gameState
        const temp: GameState = {
          hostId: hostId,
          capacityLimit: capacityLimit,
          round: round,
          gameInsession: gameInsession,
          currentDrawer: currentDrawer,
          currentCategory: currentCategory,
          currentWord: currentWord,
        }
        setGameState(temp)
      }
    };
  }, [roomId, state?.clientId, state?.name]);

  const isDrawer = clientId.current === gameState?.currentDrawer
  const isHost = clientId.current === gameState?.hostId
  return (
    <>
      {(!gameState || !players) && <LoadingPage />}
      {players && gameState && (
        <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-purple-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-row justify-between h-full gap-6">
              <div className="flex-1 w-100">
                <Intro wsRef={wsRef} roomId={roomId} gameStart={gameState.gameInsession} isDrawer={isDrawer} isHost={isHost} currentCategory={gameState.currentCategory} currentWord={gameState.currentWord}/>
                <WhiteBoard wsRef={wsRef} canvasRef={canvasRef} ctxRef={ctxRef} isDrawer={isDrawer} gameStart={gameState.gameInsession}/>
                {gameState.gameInsession && <CategoryAndInput isDrawer={isDrawer} category={gameState.currentCategory} guess={guess} setGuess={setGuess} /> }
              </div>

              <div className="w-80">
                <Profiles players={players} hostId={gameState.hostId} gameStart={gameState.gameInsession} currentDrawer={gameState.currentDrawer}/>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
