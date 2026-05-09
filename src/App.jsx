import World from './components/World'
import Mailbox from './components/Mailbox'
import Shop from './components/Shop'

export default function App() {
  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-green-800 mb-8">Haven</h1>
      <div className="flex gap-6">
        <World />
        <Mailbox />
        <Shop />
      </div>
    </div>
  )
}
