import type { House, ScoreboardEvent, InstructionCategory } from '../types'

export const HOUSES: House[] = [
  { id: 1, name: 'Britto', color: 'azure', hex: '#2F8CDC', label: 'Britto House' },
  { id: 2, name: 'Campion', color: 'pink', hex: '#F5A9CA', label: 'Campion House' },
  { id: 3, name: 'Kostka', color: 'lime', hex: '#82CC1F', label: 'Kostka House' },
  { id: 4, name: 'Loyola', color: 'maroon', hex: '#9B1C3B', label: 'Loyola House' },
]

export const HOUSE_MAP = new Map<number, House>(HOUSES.map((h) => [h.id, h]))

export const INITIAL_EVENTS: ScoreboardEvent[] = [
  {
    id: 1,
    name: '100 Meters',
    category: 'Track',
    division: 'Senior Boys',
    event_date: '2026-11-11',
    status: 'completed',
    results: [
      { house_id: 4, points: 5 },
      { house_id: 1, points: 3 },
      { house_id: 3, points: 1 },
      { house_id: 2, points: 0 },
    ],
    judge_entries: [
      { id: '1-1', name: 'Rahul Sharma', house_id: 4, position: 1, note: '11.2s' },
      { id: '1-2', name: 'Aman Verma', house_id: 1, position: 2, note: '11.5s' },
      { id: '1-3', name: 'Kunal Roy', house_id: 3, position: 3, note: '11.8s' },
      { id: '1-4', name: 'David Ekka', house_id: 2, position: null },
    ],
  },
  {
    id: 2,
    name: '200 Meters',
    category: 'Track',
    division: 'Senior Boys',
    event_date: '2026-11-11',
    status: 'completed',
    results: [
      { house_id: 1, points: 5 },
      { house_id: 4, points: 3 },
      { house_id: 2, points: 1 },
      { house_id: 3, points: 0 },
    ],
    judge_entries: [
      { id: '2-1', name: 'Sohan Marandi', house_id: 1, position: 1, note: '23.4s' },
      { id: '2-2', name: 'Rahul Sharma', house_id: 4, position: 2, note: '23.9s' },
      { id: '2-3', name: 'Rohan Gupta', house_id: 2, position: 3, note: '24.2s' },
      { id: '2-4', name: 'Sunil Hembram', house_id: 3, position: null },
    ],
  },
  {
    id: 3,
    name: '400 Meters',
    category: 'Track',
    division: 'Open',
    event_date: '2026-11-11',
    status: 'completed',
    results: [
      { house_id: 3, points: 5 },
      { house_id: 1, points: 3 },
      { house_id: 4, points: 1 },
      { house_id: 2, points: 0 },
    ],
    judge_entries: [
      { id: '3-1', name: 'Arjun Hansda', house_id: 3, position: 1, note: '53.1s' },
      { id: '3-2', name: 'Vikram Murmu', house_id: 1, position: 2, note: '54.0s' },
      { id: '3-3', name: 'Anil Soren', house_id: 4, position: 3, note: '55.2s' },
      { id: '3-4', name: 'Suraj Tudu', house_id: 2, position: null },
    ],
  },
  {
    id: 4,
    name: '800 Meters',
    category: 'Track',
    division: 'Senior Boys',
    event_date: '2026-11-11',
    status: 'live',
    results: [
      { house_id: 4, points: 5 },
      { house_id: 2, points: 3 },
      { house_id: 1, points: 1 },
      { house_id: 3, points: 0 },
    ],
    judge_entries: [
      { id: '4-1', name: 'Pankaj Kumar', house_id: 4, position: 1 },
      { id: '4-2', name: 'Naveen Minz', house_id: 2, position: 2 },
      { id: '4-3', name: 'Roshan Kispotta', house_id: 1, position: 3 },
      { id: '4-4', name: 'Deepak Besra', house_id: 3, position: null },
    ],
  },
  {
    id: 5,
    name: '1500 Meters',
    category: 'Track',
    division: 'Open',
    event_date: '2026-11-12',
    status: 'upcoming',
    results: [
      { house_id: 1, points: 0 },
      { house_id: 2, points: 0 },
      { house_id: 3, points: 0 },
      { house_id: 4, points: 0 },
    ],
    judge_entries: [
      { id: '5-1', name: 'Manoj Tirkey', house_id: 1, position: null },
      { id: '5-2', name: 'Sanjay Baski', house_id: 2, position: null },
      { id: '5-3', name: 'Rajesh Toppo', house_id: 3, position: null },
      { id: '5-4', name: 'Amit Topno', house_id: 4, position: null },
    ],
  },
  {
    id: 6,
    name: 'Relay (4x100m)',
    category: 'Track',
    division: 'Inter-House',
    event_date: '2026-11-12',
    status: 'upcoming',
    results: [
      { house_id: 1, points: 0 },
      { house_id: 2, points: 0 },
      { house_id: 3, points: 0 },
      { house_id: 4, points: 0 },
    ],
  },
  {
    id: 7,
    name: 'Javelin Throw',
    category: 'Field - Throw',
    division: 'Senior Boys',
    event_date: '2026-11-11',
    status: 'completed',
    results: [
      { house_id: 4, points: 5 },
      { house_id: 3, points: 3 },
      { house_id: 1, points: 1 },
      { house_id: 2, points: 0 },
    ],
    judge_entries: [
      { id: '7-1', name: 'Karan Kisku', house_id: 4, position: 1, note: '48.2m' },
      { id: '7-2', name: 'Sunil Soren', house_id: 3, position: 2, note: '44.7m' },
      { id: '7-3', name: 'Bimal Murmu', house_id: 1, position: 3, note: '41.3m' },
      { id: '7-4', name: 'Ajay Marandi', house_id: 2, position: null },
    ],
  },
  {
    id: 8,
    name: 'Shot-put',
    category: 'Field - Throw',
    division: 'Senior Boys',
    event_date: '2026-11-11',
    status: 'completed',
    results: [
      { house_id: 2, points: 5 },
      { house_id: 4, points: 3 },
      { house_id: 3, points: 1 },
      { house_id: 1, points: 0 },
    ],
    judge_entries: [
      { id: '8-1', name: 'Dinesh Hemrom', house_id: 2, position: 1, note: '12.8m' },
      { id: '8-2', name: 'Karan Kisku', house_id: 4, position: 2, note: '12.1m' },
      { id: '8-3', name: 'Birendra Hansda', house_id: 3, position: 3, note: '11.5m' },
      { id: '8-4', name: 'Mohit Baski', house_id: 1, position: null },
    ],
  },
  {
    id: 9,
    name: 'Discus Throw',
    category: 'Field - Throw',
    division: 'Senior Boys',
    event_date: '2026-11-12',
    status: 'upcoming',
    results: [
      { house_id: 1, points: 0 },
      { house_id: 2, points: 0 },
      { house_id: 3, points: 0 },
      { house_id: 4, points: 0 },
    ],
  },
  {
    id: 10,
    name: 'High Jump',
    category: 'Field - Jump',
    division: 'Open',
    event_date: '2026-11-11',
    status: 'completed',
    results: [
      { house_id: 1, points: 5 },
      { house_id: 4, points: 3 },
      { house_id: 3, points: 1 },
      { house_id: 2, points: 0 },
    ],
    judge_entries: [
      { id: '10-1', name: 'Ranjit Murmu', house_id: 1, position: 1, note: '1.68m' },
      { id: '10-2', name: 'Subodh Hembram', house_id: 4, position: 2, note: '1.65m' },
      { id: '10-3', name: 'Vijay Soren', house_id: 3, position: 3, note: '1.58m' },
      { id: '10-4', name: 'Lalit Marandi', house_id: 2, position: null },
    ],
  },
  {
    id: 11,
    name: 'Long Jump',
    category: 'Field - Jump',
    division: 'Senior Boys',
    event_date: '2026-11-12',
    status: 'live',
    results: [
      { house_id: 3, points: 5 },
      { house_id: 1, points: 3 },
      { house_id: 4, points: 1 },
      { house_id: 2, points: 0 },
    ],
  },
  {
    id: 12,
    name: 'Tug of War',
    category: 'Team',
    division: 'Inter-House Squad',
    event_date: '2026-11-12',
    status: 'upcoming',
    results: [
      { house_id: 1, points: 0 },
      { house_id: 2, points: 0 },
      { house_id: 3, points: 0 },
      { house_id: 4, points: 0 },
    ],
  },
]

export const DEFAULT_INSTRUCTIONS: InstructionCategory[] = [
  {
    id: 'general',
    title: 'General Meet Guidelines & Conduct',
    tag: 'General',
    items: `All student athletes must report in proper house sports uniform with bib numbers clearly visible.
Competitors must assemble at the marshalling tent at least 15 minutes prior to the first call of their event.
Only competing athletes, assigned judges, and track marshals are permitted inside the arena.
Good sportsmanship and fair play are expected from all houses at all times. Unsporting conduct may lead to point deductions.`,
  },
  {
    id: 'scoring',
    title: 'Scoring & House Points System',
    tag: 'Scoring',
    items: `First Place (🥇): 5 Points awarded to the winning House.
Second Place (🥈): 3 Points awarded to the runner-up House.
Third Place (🥉): 1 Point awarded to the third-place House.
Tug of War and Relay events follow the standard 5-3-1 points scale unless announced otherwise by the Meet Director.
In the event of a tie for any placing, total points for the positions involved will be split equally between the tied houses.`,
  },
  {
    id: 'track_field',
    title: 'Track & Field Rules and Regulations',
    tag: 'Competition',
    items: `Sprint lane infringements: Running outside the designated lane in 100m, 200m, and 400m will result in instant review by track umpires.
False Start Policy: One warning is issued to the field for the first false start; any subsequent false start results in disqualification.
Spike Shoes: Maximum 6mm spikes are permitted only on the synthetic track for sprint events and Long Jump.
Field Events (Throws & Jumps): Each competitor is allowed 3 attempts; the single best valid attempt determines the placing.
Throwing Sector Exit: Competitors in Shot-put, Discus, and Javelin must exit the throwing circle/runway behind the white marker line after implement lands.`,
  },
  {
    id: 'officials',
    title: 'Judges, Marshals & Protests Protocol',
    tag: 'Officials',
    items: `Judges must record official times and finish positions immediately on the on-field Judge Score Card.
Signed judge cards must be handed over to the Central Scrutiny Desk within 10 minutes of heat conclusion.
Protests or disputes must be lodged in writing by the House Master/Captain within 15 minutes of official results announcement.
The Chief Referee's ruling on all technical disputes and disqualifications is final.`,
  },
]

export const DEFAULT_ANNOUNCEMENT =
  'Welcome to the Inter-House Sports Meet. All athletes and house captains must assemble at the main track by 8:30 AM.'

export const DEFAULT_PINS = {
  admin: '9999',
  judge: '1234',
}
