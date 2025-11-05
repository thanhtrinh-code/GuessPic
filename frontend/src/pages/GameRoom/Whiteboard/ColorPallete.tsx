import React from 'react'

interface ColorPalleteProps {
  setCurrentColor: React.Dispatch<React.SetStateAction<string>>;
  currentColor: string;
}
export default function ColorPallete({setCurrentColor, currentColor}: ColorPalleteProps) {
  return (
    <div className="flex gap-2 mt-4 justify-center flex-wrap items-center">

        <span className="text-sm text-gray-600 font-medium mr-2">Colors:</span>
        
        {['black', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85929E'].map((color) => (
          <button
            key={color}
            onClick={() => setCurrentColor(color)}
            className={`w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
              currentColor === color
                ? 'border-purple-500 shadow-lg scale-110'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
  )
}
