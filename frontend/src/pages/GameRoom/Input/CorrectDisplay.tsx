import { useState } from "react";

const messages = [
  "You guessed correctly",
  "Well done!",
  "Nice job!",
  "Correct answer!"
];
export default function CorrectDisplayer() {
   const [message] = useState(() => {
      return messages[Math.floor(Math.random() * messages.length)];
  });
  return (
    <div className="p-6 bg-green-100 rounded-xl shadow-md text-center text-green-700 font-bold">
      {message}
    </div>
  )
}
