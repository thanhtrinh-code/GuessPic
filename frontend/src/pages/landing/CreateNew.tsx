import React from 'react'
import { useNavigate } from 'react-router';

interface CreateNewsProps {
  setIsLoading: (loading: boolean) => void;
  setError: (error: string) => void;
}
export default function CreateNew({
  setIsLoading,
  setError
}: CreateNewsProps) {
  const [name, setName] = React.useState('Thanh');
  const [roomAllowed, setRoomAllowed] = React.useState('4');
  const [createError, setCreateError] = React.useState('');

  const navigate = useNavigate();

  function checkInputs () {
    if (!name || !roomAllowed) {
      setCreateError('Please fill in all fields before creating a room.');
      return false;
    }
    if (isNaN(Number(roomAllowed)) || Number(roomAllowed) <= 0 || !Number.isInteger(Number(roomAllowed))) {
      setCreateError('Number of players allowed must be a positive integer number');
      return false;
    }
    if (Number(roomAllowed) > 6) {
      setCreateError('Number of players allowed cannot exceed 6');
      return false;
    }
    setCreateError('');
    return true;
  }
  async function handleCreateNew (e: React.FormEvent) { 
    e.preventDefault();

    if (!checkInputs()) {
      return;
    }
    
    try {
        setIsLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/create_room', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            name: name,
            roomAllowed: parseInt(roomAllowed, 10)
          }),
        });
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('roomData', JSON.stringify({
            roomId: data.roomId,
            clientId: data.clientId,
            name: name
          }))
          navigate(`/room/${data.roomId}`, {
            state: {
              clientId: data.clientId,
              name: name
            }
          });
        } else {
          throw new Error('Room creation failed');
        }
    }
    catch (error) {
      setError(`Error in Creating Room: ${error}`);
    }
    finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="flex items-center justify-center w-1/2 px-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg border-2 border-gray-100">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Create Room
            </h2>
            <p className="text-gray-600 text-sm">Start a new drawing game</p>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Players Allowed
              </label>
              <input
                type="number"
                placeholder="Enter number of players"
                value={roomAllowed}
                onChange={(e) => setRoomAllowed(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <button
              onClick={(e) => handleCreateNew(e)}
              className="w-full bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              🎨 Create Room
            </button>
          </div>
          {createError && (
            <p className="text-red-500 text-sm mt-4 flex items-center justify-center bg-red-50 py-2 px-4 rounded-lg">
              ⚠️ {createError}
            </p>
          )}
        </div>
      </div>
  )
}
