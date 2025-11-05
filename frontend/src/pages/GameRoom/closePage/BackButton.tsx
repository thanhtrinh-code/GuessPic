import React from 'react'

interface BackButtonProps {
  setConfirmationOfClose: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function BackButton({setConfirmationOfClose} : BackButtonProps) {
    
  return (
    <button 
    onClick={() => setConfirmationOfClose(true)}
    className="absolute top-4 right-6 px-4 py-2 rounded-full text-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-all duration-200">
        Exit
    </button>
  )
}
