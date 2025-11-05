import type { Player } from './dataclass/Dataclasses'
interface ProfileProps {
    player: Player
    hostId: string
    gameStart: boolean
    isTopThree: boolean
    rank: number
    isDrawer: boolean
    index: number
}
const colorsBackground: string[] = [
  'bg-red-200',
  'bg-blue-200',
  'bg-green-200',
  'bg-yellow-200',
  'bg-purple-200',
  'bg-pink-200',
  'bg-red-200',
  'bg-blue-200',
];

export default function Profile({player, hostId, gameStart, isTopThree, rank, isDrawer, index} : ProfileProps) {
    
    const getMedalIcon = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };
  return (
    <div className={`p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                    isDrawer && gameStart
                    ? 'bg-linear-to-r from-purple-100 to-indigo-100 border-purple-300 shadow-md scale-[1.02]'
                        : gameStart && isTopThree
                            ? 'bg-linear-to-r from-amber-50 to-orange-50 border-amber-200 hover:shadow-md'
                                : `${colorsBackground[index]} border-gray-200 hover:border-purple-200 hover:shadow-sm`
                }`}>
                    {gameStart && 
                        <div className="text-2xl font-bold w-10 text-center text-gray-700">
                            {getMedalIcon(rank)}
                        </div>}
                     <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 flex items-center gap-2 flex-wrap">
                            {player.name}

                            {player.id === hostId && (
                                <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">
                                    👑 Host
                                </span>
                                )}

                            {gameStart && isDrawer && (
                                <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                                    ✏️ Drawing
                                </span>
                                )}

                            {gameStart && (
                                <div className="text-sm text-gray-500">
                                <span className="font-bold text-lg text-purple-600">{player.score}</span> pts
                                </div>
                            )}
                        </div>
                    </div>
    </div>
  )
}
