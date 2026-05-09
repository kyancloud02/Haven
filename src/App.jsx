import WorldStage from './components/WorldStage'
import World from './components/World'
import Mailbox from './components/Mailbox'
import Shop from './components/Shop'

export default function App() {
  return (
    <div className="min-h-screen bg-stone-900 flex flex-col">
      <div className="w-full max-w-4xl mx-auto px-4 pt-8 pb-6">
        <WorldStage />
      </div>
      <div className="flex gap-6 justify-center pb-8">
        <World />
        <Mailbox />
        <Shop />
      </div>
    </div>
  )
}
