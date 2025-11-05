import { useEffect, useState } from "react";
import CorrectDisplayer from "./CorrectDisplay";
import InputForm from "./InputForm";

interface CategoryAndInputProps {
  isDrawer: boolean
  word: string | undefined,
  wsRef: React.RefObject<WebSocket | null>
  clientId: String | null
}

export default function CategoryAndInput({
  isDrawer,
  word,
  wsRef,
  clientId
}: CategoryAndInputProps) {
  const [guess, setGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState(45);
  const [correct, setCorrect] = useState(false)
  const totalTime = 45;
  const percentage = (timeLeft / totalTime) * 100;
    
    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }, []);
    useEffect(() => {
      if (timeLeft == 0) {
        wsRef.current?.send(JSON.stringify({
          type: 'round_ended',
          data: null
        }))
      }
    }, [timeLeft])
  function handleSubmit(e: any) {
    e.preventDefault()
    if (guess.trim().length == 0) {
      setGuess('')
      return
    }
    if (!word) {
      return
    }
    if (guess.toUpperCase() === word.toUpperCase()) {
      const score = timeLeft * 10
      wsRef.current?.send(JSON.stringify({
        type: 'answer_correct',
        data: {
          'clientId': clientId,
          'score': score
        }
      }));
      setCorrect(true)
    }
    setGuess('')
  }
    
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-gray-100">
       <div className="flex items-center gap-4 mb-5">
        <p className="bg-clip-text whitespace-nowrap text-[1rem]">
          {timeLeft} s
        </p>
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-linear ${
            percentage > 50 
              ? 'bg-linear-to-r from-green-400 to-green-500' 
              : percentage > 20 
              ? 'bg-linear-to-r from-yellow-400 to-orange-500' 
              : 'bg-linear-to-r from-red-500 to-red-600'
          }`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
        </div>
      </div>
      </div>

      {!isDrawer ? correct ? <CorrectDisplayer/> : <InputForm handleSubmit={handleSubmit} guess={guess} setGuess={setGuess}/> : <></>}
    </div>
  );
}
