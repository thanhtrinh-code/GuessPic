import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
export default function CountDownClose() {
    const [timer, setTimer] = useState(5)
    const navigate = useNavigate()
    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval)
                    navigate('/')  // redirect immediately
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [navigate])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800/40 z-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-96 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3 whitespace-nowrap">
            The Host has closed this room.
            </h2>
            <p className="text-gray-600 text-lg mb-6">
                You will be directed back to the home page in {" "}
                <span className="font-bold text-purple-600">{timer}</span> {" "} s
            </p>
        </div>
    </div>
  )
}
