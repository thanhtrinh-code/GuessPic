import React from 'react'

interface InputFormProps {
    handleSubmit: (e: any) => void;
    guess: string
    setGuess: React.Dispatch<React.SetStateAction<string>>;
}
export default function InputForm({handleSubmit, guess, setGuess}: InputFormProps) {
  return (
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
              className="bg-linear-to-r from-purple-500 to-indigo-500 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:shadow-xl">
                Guess
              </button>
            </form>          
        </div>
  )
}
