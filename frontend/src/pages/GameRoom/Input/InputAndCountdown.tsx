import { useEffect, useState } from "react";

interface CategoryAndInputProps {
  isDrawer: boolean
  word: string | undefined,
  wsRef: React.RefObject<WebSocket | null>

}

export default function CategoryAndInput({
  isDrawer,
  word,
  wsRef,
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
  function handleSubmit(e: any) {
    e.preventDefault()
    
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

      {!isDrawer && (
        <div>
            <form className="flex gap-3"
                onSubmit={(e) => handleSubmit(e)}
            >
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Type your guess here..."
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 text-gray-800 placeholder-gray-400"
              />
              <button 
              type='submit'
              className="bg-linear-to-r from-purple-500 to-indigo-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg">
                Guess
              </button>
            </form>          
        </div>
      )}
    </div>
  );
}
