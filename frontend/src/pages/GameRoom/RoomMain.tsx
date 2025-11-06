import { useEffect, useRef, useState } from "react"
import { useParams, useLocation } from "react-router";
import {toast} from 'react-toastify'
import Intro from "./Intro/Intro";
import WhiteBoard from "./Whiteboard/WhiteBoard";
import CategoryAndInput from "./Input/InputAndCountdown";

import Profiles from "./profiles/Profiles";
import type { GameState, Player } from "./dataclass/Dataclasses";
import LoadingPage from "../LoadingPage";
import BackButton from "./closePage/BackButton";
import ConfirmationPage from "./closePage/ConfirmationPage";
import CountDownClose from "./closePage/CountDownClose";
import ClosePlayerPopUp from "./closePage/ClosePlayerPopUp";

export default function Doc() {
  const {roomId} = useParams(); // params.roomId will hold the room id from the route (e.g. /:roomId)
  const {state} = useLocation();

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [confirmationOfClose, setConfirmationOfClose] = useState(false)
  const [close, setClose] = useState(false)


  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const clientId = useRef<String | null>(null);


  useEffect(() => {
    clientId.current = state?.clientId;
    let clientName = state?.name;

    if (!clientId.current || !clientName) {
      const getFromLocal = localStorage.getItem('roomData')
      if (getFromLocal) {
        const parsed = JSON.parse(getFromLocal)
        clientId.current = parsed.clientId;
        clientName = parsed.name;
      }
    }
    if (!roomId || !clientId.current || !clientName) {
      console.error("Missing roomId, clientId, or name");
      return;
    }

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
        const {prevX, prevY, currX, currY, color, lineWidth} = data.data;
        if (!ctx) return
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currX, currY);
        ctx.stroke();
      } else if (data.type === 'update_game') {
        const dataGameState = data.gameState
        const dataPlayer = data.players
        console.log(data)
        let playersArr: Player[] = []
        Object.keys(dataPlayer).forEach(clientId => {
          const {name, score, hasGuessed, correctGuesses} = dataPlayer[clientId]
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
        setGameState(dataGameState)
      } else if (data.type === 'game_start') {
        const {hostId, capacityLimit, round, gameInsession, currentDrawer, currentCategory, currentWord } = data.gameState
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
      } else if (data.type === 'player_close') {
        const dataGameState = data.gameState;
        const dataPlayer = data.players;
        const closePlayer = data.closePlayer;

        let playersArr: Player[] = []
        Object.keys(dataPlayer).forEach(clientId => {
          const {name, score, hasGuessed, correctGuesses} = dataPlayer[clientId]
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
        setGameState(dataGameState)
        toast.info(`${closePlayer} has left the room`);
      } else if (data.type === 'host_close') {
        wsRef.current?.send(JSON.stringify({
          type: 'remove_room',
          data: null
        }))
        setClose(true)
      }
    };
  }, [roomId, state?.clientId, state?.name]);
  useEffect(() => {
    // Add a fake state so that the next "Back" triggers popstate
    window.history.pushState(null, '', window.location.href)

    const handleBackState = (e: PopStateEvent) => {
      e.preventDefault()
      setConfirmationOfClose(true)

      // Push the state again so pressing Back again re-triggers popstate
      // (prevent leaving the page)
      window.history.pushState(null, '', window.location.href)
    }

    window.addEventListener('popstate', handleBackState)

    return () => {
      window.removeEventListener('popstate', handleBackState)
    }
  }, [])
    

  const isDrawer = clientId.current === gameState?.currentDrawer
  const isHost = clientId.current === gameState?.hostId

  
  return (
    <>
      {(!gameState || !players) && <LoadingPage />}
      {players && gameState && (
        <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-purple-50 p-6">
          <ClosePlayerPopUp/>
          <div className="max-w-7xl mx-auto">
              {!gameState.gameInsession && <BackButton setConfirmationOfClose={setConfirmationOfClose}/>}



            <div className="flex flex-row justify-between h-full gap-6">
              <div className="flex-1 w-100">
                <Intro wsRef={wsRef} roomId={roomId} gameStart={gameState.gameInsession} isDrawer={isDrawer} isHost={isHost} currentCategory={gameState.currentCategory} currentWord={gameState.currentWord}/>
                <WhiteBoard wsRef={wsRef} canvasRef={canvasRef} ctxRef={ctxRef} isDrawer={isDrawer} gameStart={gameState.gameInsession}/>
                
                {gameState.gameInsession && 
                  <CategoryAndInput isDrawer={isDrawer} word={gameState.currentWord} wsRef={wsRef} clientId={clientId.current}/> 
                }
              </div>

              <div className="w-80">
                <Profiles players={players} hostId={gameState.hostId} gameStart={gameState.gameInsession} currentDrawer={gameState.currentDrawer}/>
              </div>
            </div>
          </div>
        </div>
      )}
      {confirmationOfClose && <ConfirmationPage setConfirmationOfClose={setConfirmationOfClose} wsRef={wsRef} isHost={isHost} clientId={clientId.current}/>}
      {close && <CountDownClose/>}
    </>
  );
}
