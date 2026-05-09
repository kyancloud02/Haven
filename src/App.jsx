import WorldStage from './components/WorldStage'
import CharacterSprite from './components/CharacterSprite'
import World from './components/World'
import Mailbox from './components/Mailbox'
import Shop from './components/Shop'
import { useGameState } from './hooks/useGameState'
import characters from './data/characters.json'

export default function App() {
  const [gameState, updateState] = useGameState()

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col">
      <div className="w-full max-w-4xl mx-auto px-4 pt-8 pb-6">
        <WorldStage />
      </div>

      {/* Hero roster */}
      <div className="flex gap-8 justify-center flex-wrap px-6 pb-6">
        {characters.map(hero => (
          <CharacterSprite
            key={hero.id}
            heroData={hero}
            gameState={gameState}
            updateState={updateState}
          />
        ))}
      </div>

      <div className="flex gap-6 justify-center pb-8">
        <World />
        <Mailbox />
        <Shop />
      </div>
    </div>
  )
}
