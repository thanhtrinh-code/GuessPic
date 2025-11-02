import React, { useEffect } from "react"
import { useParams, useLocation } from "react-router";
import Intro from "./Intro";
import WhiteBoard from "./WhiteBoard";
import CategoryAndInput from "./InputAndCountdown";
import Profiles from "./Profiles";

export default function Doc() {
  const {roomId} = useParams(); // params.roomId will hold the room id from the route (e.g. /:roomId)
  const {state} = useLocation();

  const [role, setRole] = React.useState<'guesser' | 'drawer'|''>("");
  const [category, setCategory] = React.useState<string>('dsa');
  const [guess, setGuess] = React.useState<string>('');

  const wsRef = React.useRef<WebSocket | null>(null);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (!roomId || !state?.clientId || !state?.name) {
      console.error("Missing roomId, clientId, or name");
      return;
    }
    const clientId = state.clientId;
    const clientName = state.name;

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/${roomId}?clientId=${clientId}&clientName=${clientName}`
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
      if (!ctx) return;


      if (data.type === 'clear') {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      } else if (data.type === 'draw') {
        const {prevX, prevY, currX, currY, color, lineWidth} = data;

        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currX, currY);
        ctx.stroke();
      }
    };
  }, [roomId, state?.clientId, state?.name]);

  /*useEffect(() => {
    if (!roomId || !state?.clientId || !state?.name) return;

    async function getStateGame() {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/get_state_game/${roomId}`);
        if (!response.ok) {
          console.error('Error fetching game state');
          return;
        }
        const data = await response.json();
        console.log("Initial game state:", data);
        // You can also update your state here if needed
        // setGameState(data);
      } catch (err) {
        console.error("Failed to fetch game state:", err);
      }
    }
    getStateGame();
}, [roomId, state?.clientId, state?.name]);*/

  return ( 
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-row justify-between h-full gap-6">
          <div className="flex-1 w-100">
            <Intro />
            <WhiteBoard wsRef={wsRef} canvasRef={canvasRef} ctxRef={ctxRef} />
            <CategoryAndInput role={role} category={category} guess={guess} setGuess={setGuess} />
          </div>

          <div className="w-80">
            <Profiles />
          </div>
        </div>
      </div>
    </div>
  )
}
