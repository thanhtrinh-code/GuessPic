import type { Player } from "../dataclass/Dataclasses";
import Profile from "./Profile";

interface ProfilesProp {
  players: Player[] | null
  hostId: string
  gameStart: boolean
  currentDrawer: string | undefined
}

export default function Profiles({ players, hostId, gameStart, currentDrawer}: ProfilesProp) {
  const safePlayers: Player[] = players ?? [];
  const playersList = gameStart ? [...safePlayers].sort((a, b) => b.score - a.score) : safePlayers;
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 sticky top-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="text-3xl">🏆</span>
        {gameStart ? 'Leaderboard' : 'Players'}
      </h3>
      <div className="space-y-4">
        {playersList.map((player, index) => {
          const rank = index + 1
          const isTopThree = rank <= 3
          const isDrawer = player.id === currentDrawer
          return (
            <Profile key={player.id} 
            player={player} 
            hostId={hostId} 
            gameStart={gameStart} 
            isTopThree={isTopThree} 
            rank={rank} 
            isDrawer={isDrawer} 
            index={index} 
            hasGuessed={player.hasGuessed}
            />
          )})}
      </div>
    </div>
  );
}