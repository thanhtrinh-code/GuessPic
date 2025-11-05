interface IntroProps {
  wsRef: React.RefObject<WebSocket | null>;
  roomId: string | undefined,
  gameStart: boolean,
  isDrawer: boolean,
  isHost: boolean,
  currentWord: string | undefined,
  currentCategory: string | undefined

}

function Intro ({wsRef, roomId, isHost, gameStart, isDrawer, currentWord, currentCategory} : IntroProps) {
  function handleStart(e: any) {
    e.preventDefault()
    wsRef.current?.send(JSON.stringify({
      type: 'game_start',
      data: null
    }))
    console.log('send')
  }
  const word = currentWord
    ? currentWord.charAt(0).toUpperCase() + currentWord.slice(1)
    : '';

  const category = currentCategory
    ? currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)
    : '';
    
  return (
    <div className="bg-white rounded-2xl shadow-lg px-6 pt-6 pb-3 mb-5 border-2 border-gray-100 hover:shadow-xl transition-shadow duration-300">
      {/* Progress Bar */}
      <div className="mb-4">
        {
        gameStart ? (
          isDrawer ? (
            <h2 className="text-2xl font-bold text-center">
              The word is: <span className="text-purple-600">{word}</span>
            </h2>
          ) : (
            <h2 className="text-2xl font-bold text-center">
              The category is: <span className="text-purple-600">{category}</span>
            </h2>
          )
        ) : isHost ? (
          <div className="text-center mx-2">
            <h2 className="text-xl font-bold mb-4">
              The Room ID is : <span className="text-purple-600">{roomId}</span>
            </h2>
            <button className="w-full bg-purple-600 text-white px-8 py-4 rounded-xl font-bold text-xl hover:bg-purple-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
              onClick={(e) => handleStart(e)}
            >
              🎮 Click to Start The Game
            </button>
          </div>
        ) : (
          <h2 className="text-xl font-semibold text-center text-gray-600">
            ⏳ Waiting for host to start the game...
          </h2>
        )}
      </div>

    </div>
  );
};
export default Intro;