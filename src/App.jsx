import { useState } from 'react'
import WorldStage from './components/WorldStage'
import CharacterSprite from './components/CharacterSprite'
import World from './components/World'
import Mailbox from './components/Mailbox'
import Shop from './components/Shop'
import DebugTimeSlider from './components/DebugTimeSlider'
import { useGameState } from './hooks/useGameState'
import characters from './data/characters.json'

const IS_DEV = import.meta.env.DEV

export default function App() {
  const [gameState, updateState] = useGameState()
  const [debugHour, setDebugHour] = useState(() => new Date().getHours())

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col" style={IS_DEV ? { paddingBottom: 52 } : {}}>
      <div className="w-full max-w-4xl mx-auto px-4 pt-8 pb-6">
        <WorldStage overrideHour={IS_DEV ? debugHour : undefined} />
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

      {IS_DEV && <DebugTimeSlider hour={debugHour} onChange={setDebugHour} />}
    </div>
  )
}
