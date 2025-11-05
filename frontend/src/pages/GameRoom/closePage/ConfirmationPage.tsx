import React  from 'react'
import { useNavigate } from 'react-router-dom';

interface ConfirmationPageProps {
    setConfirmationOfClose: React.Dispatch<React.SetStateAction<boolean>>;
    wsRef: React.RefObject<WebSocket | null>;
    isHost: boolean
    clientId: String | null
}
export default function ConfirmationPage({setConfirmationOfClose, wsRef, isHost, clientId } : ConfirmationPageProps) {
    const navigate = useNavigate()
    function handleClose() {
        if (isHost) {
            wsRef.current?.send(JSON.stringify({
                type: 'host_close',
                data: null
            }))
        } else {
            wsRef.current?.send(JSON.stringify({
                type: 'player_close',
                data: {
                    "clientId": clientId
                }
            }));
        }
        navigate('/')
    }
  return (
    <>
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800/40 z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-80 text-center">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Are you sure you want to exit?
                </h2>
                <div className="flex justify-center gap-4">
                <button
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    onClick={() => handleClose()}
                >
                    Yes
                </button>
                <button
                    onClick={() => setConfirmationOfClose(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                    Cancel
                </button>
                </div>
            </div>
        </div>
    </>
  )
}
