import React, { useEffect, useRef } from 'react'
import ColorPallete from './ColorPallete';

interface WhiteBoardProps {
  wsRef: React.RefObject<WebSocket | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  ctxRef: React.RefObject<CanvasRenderingContext2D | null>;
  isDrawer: boolean
  gameStart: boolean
}
export default function WhiteBoard({
  wsRef,
  canvasRef,
  ctxRef,
  isDrawer,
  gameStart,
}: WhiteBoardProps) {
    const [isDrawing, setIsDrawing] = React.useState(false);
    const [currentColor, setCurrentColor] = React.useState('black');
    const lastXRef = useRef<number | null>(null);
    const lastYRef = useRef<number | null>(null);
    useEffect(() => {

      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = 800;
      canvas.height = 600;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      ctxRef.current = ctx;


    }, []);
  const startDrawing = (e: React.MouseEvent) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    lastXRef.current = e.nativeEvent.offsetX;
    lastYRef.current = e.nativeEvent.offsetY;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent) => {
    const ctx = ctxRef.current;
    if (!ctx || !isDrawing || lastXRef.current === null || lastYRef.current === null) return;

    const currX = e.nativeEvent.offsetX;
    const currY = e.nativeEvent.offsetY;

    ctx.beginPath();
    ctx.moveTo(lastXRef.current, lastYRef.current);
    ctx.strokeStyle = currentColor;
    ctx.lineTo(currX, currY);
    ctx.stroke();

    // Send drawing data over WebSocket
    wsRef.current?.send(JSON.stringify({
      type: 'drawing',
      data: {
        type: 'draw',
        prevX: lastXRef.current,
        prevY: lastYRef.current,
        currX: currX,
        currY: currY,
        color: currentColor,
        lineWidth: ctx.lineWidth
    }}));

    lastXRef.current = currX;
    lastYRef.current = currY;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  function handleClear() {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    wsRef.current?.send(JSON.stringify({
      type: 'clearing', // Backend handle
      data: {
        type: 'clear', // Other clients handle
      }
      }
    ))
  }
  const isDisabled = !gameStart || !isDrawer;
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-gray-100">
      <div className="bg-gray-300 rounded-xl border-2 border-dashed border-gray-300 aspect-video flex items-center justify-center hover:border-purple-400 transition-colors duration-300">
        <div className="">
          <canvas
            
            ref={canvasRef}
            className={`bg-white rounded-lg shadow-inner cursor-crosshair ${
              isDisabled ? 'pointer-events-none opacity-85' : ''
            }`}
            onMouseDown={isDisabled ? undefined : startDrawing}
            onMouseMove={isDisabled ? undefined : draw}
            onMouseUp={isDisabled ? undefined : stopDrawing}
            onMouseLeave={isDisabled ? undefined : stopDrawing}
          >
          </canvas>
        </div>
      </div>
      {isDrawer &&
          <>
          <div className="flex gap-3 mt-4 justify-center">
          <button
              className="bg-linear-to-r from-purple-500 to-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
              onClick={isDisabled ? undefined : handleClear}

            >
              Clear Canvas
            </button>

          </div>
          <ColorPallete setCurrentColor={setCurrentColor} currentColor={currentColor} />
          </>}
    </div>
  );
}
