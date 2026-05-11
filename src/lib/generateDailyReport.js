import characters from '../data/characters.json'
import { REPORT_CONTENT } from '../data/reportContent.js'

// Returns a report object (without date/timestamps — the hook adds those).
export function generateDailyReport({ currentLeaderId }) {
  // Prefer the coronated leader; fall back to a random resident
  let reporter = characters.find(c => c.id === currentLeaderId)
  if (!reporter) {
    reporter = characters[Math.floor(Math.random() * characters.length)]
  }

  const pool = REPORT_CONTENT[reporter.id] ?? []
  const entry = pool.length > 0
    ? pool[Math.floor(Math.random() * pool.length)]
    : { message: `${reporter.name} has nothing unusual to report today.`, itemHint: null }

  return {
    characterId:   reporter.id,
    characterName: reporter.name,
    message:       entry.message,
    itemHint:      entry.itemHint,
    photoUrl:      null, // placeholder for future character art
  }
}
