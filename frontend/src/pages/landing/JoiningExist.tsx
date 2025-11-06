import React from 'react'
import { useNavigate } from 'react-router';

interface JoiningExistProps {
  setIsLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  joinForm: {
    name: string;
    roomId: string;
    joinError: string;
  };
  setJoinForm: React.Dispatch<React.SetStateAction<{
    name: string;
    roomId: string;
    joinError: string;
  }>>;
}
export default function JoiningExist({
  setIsLoading,
  setError,
  joinForm,
  setJoinForm
}: JoiningExistProps) {
  const { name, roomId, joinError } = joinForm;
  const navigate = useNavigate();

  function setName(key: string, value: string) {
    setJoinForm(prev => ({ ...prev, [key]: value }));
  }

  function checkInputs () {
    if (!name || !roomId) {
      setName('joinError', 'Please fill in all fields');
      return false;
    }
    if (isNaN(Number(roomId)) || Number(roomId) <= 0 || !Number.isInteger(Number(roomId)) || roomId.length !== 6) {
      setName('joinError', 'Room ID is a positive 6 digit number');
      return false;
    }
    return true;
  }
  async function handleJoinExisting(e: React.FormEvent) {
    e.preventDefault();
    if (!checkInputs()) return;

    try {
      setIsLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/join_room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, roomId: parseInt(roomId, 10) }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (data?.success === true) {
        localStorage.setItem('roomData', JSON.stringify({
            roomId: data.roomId,
            clientId: data.clientId,
            name: name
          }))
        navigate(`/room/${roomId}`, {
          state: {
            clientId: data.clientId,
            name: name
          }
        })
      } else {
        const msg = data?.error || 'Unknown error occurred while joining.';
        setName('joinError', `${msg}. Please try again.`);
      }
    } catch (err: any) {
      const message = err?.message || String(err);
      setError(`Error in Joining Room: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center w-1/2 px-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg border-2 border-gray-100">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Join Room
            </h2>
            <p className="text-gray-600 text-sm">Enter an existing game</p>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName('name', e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room ID
              </label>
              <input
                type="number"
                placeholder="Enter room ID"
                value={roomId}
                onChange={(e) => setName('roomId', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <button
              onClick={(e) => handleJoinExisting(e)}
              className="w-full bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              🚪 Join Room
            </button>
          </div>

          {joinError && (
            <p className="text-red-500 text-sm mt-4 flex items-center justify-center bg-red-50 py-2 px-4 rounded-lg">
              ⚠️ {joinError}
            </p>
          )}
        </div>
      </div>
  )
}
