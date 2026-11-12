import { useState, useEffect, useMemo } from 'react'
import {
  FileText,
  Pencil,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Printer,
  Search,
  Megaphone,
  Check,
  ShieldCheck,
  Layers,
  Info,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../lib/shadcn/card'
import { Button } from '../../lib/shadcn/button'
import { Input } from '../../lib/shadcn/input'
import type { AppMode } from './houses'

type Props = {
  currentMode: AppMode
}

export interface InstructionCategory {
  id: string
  title: string
  tag: string
  items: string
}

const STORAGE_KEY = 'house_sports_admin_instructions_v2'
const BANNER_STORAGE_KEY = 'house_sports_admin_announcement_v2'

const DEFAULT_ANNOUNCEMENT =
  'Welcome to the Inter-House Sports Meet. All athletes and house captains must assemble at the main track by 8:30 AM.'

const DEFAULT_SECTIONS: InstructionCategory[] = [
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

export default function InstructionsSection({ currentMode }: Props) {
  const [sections, setSections] = useState<InstructionCategory[]>(DEFAULT_SECTIONS)
  const [announcement, setAnnouncement] = useState<string>(DEFAULT_ANNOUNCEMENT)
  const [announcementEnabled, setAnnouncementEnabled] = useState<boolean>(true)
  const [isEditing, setIsEditing] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const canEdit = currentMode === 'admin'

  // Load saved instructions from localStorage
  useEffect(() => {
    try {
      const savedSections = localStorage.getItem(STORAGE_KEY)
      if (savedSections) {
        const parsed = JSON.parse(savedSections)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSections(parsed)
        }
      }
      const savedBanner = localStorage.getItem(BANNER_STORAGE_KEY)
      if (savedBanner !== null) {
        setAnnouncement(savedBanner)
      }
    } catch {}
  }, [])

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sections))
      localStorage.setItem(BANNER_STORAGE_KEY, announcement)
      setSavedSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch {}
  }

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all instructions to default templates? Any custom edits will be replaced.')) {
      setSections(DEFAULT_SECTIONS)
      setAnnouncement(DEFAULT_ANNOUNCEMENT)
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(BANNER_STORAGE_KEY)
      setIsEditing(false)
    }
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all instructions? You can add fresh ones.')) {
      setSections([])
      setAnnouncement('')
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
      localStorage.setItem(BANNER_STORAGE_KEY, '')
    }
  }

  const handleAddSection = () => {
    const newId = `section_${Date.now()}`
    const newCategory: InstructionCategory = {
      id: newId,
      title: 'New Instruction Section',
      tag: 'Notice',
      items: 'Enter instructions here (one rule per line)...',
    }
    setSections((prev) => [...prev, newCategory])
    setIsEditing(true)
  }

  const handleUpdateSection = (id: string, updates: Partial<InstructionCategory>) => {
    setSections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, ...updates } : sec))
    )
  }

  const handleDeleteSection = (id: string) => {
    setSections((prev) => prev.filter((sec) => sec.id !== id))
  }

  const handlePrint = () => {
    window.print()
  }

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections
    const query = searchQuery.toLowerCase()
    return sections.filter(
      (sec) =>
        sec.title.toLowerCase().includes(query) ||
        sec.tag.toLowerCase().includes(query) ||
        sec.items.toLowerCase().includes(query)
    )
  }, [sections, searchQuery])

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border bg-card/70 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              Meet Instructions & Guidelines
              {canEdit && (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Admin Editable
                </span>
              )}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Official meet regulations, scoring rules, and instructions set by the Administrator.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mr-1 animate-in fade-in">
              <CheckCircle className="w-3.5 h-3.5" />
              Saved Successfully!
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-8 text-xs gap-1.5"
            title="Print Instructions"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Instructions</span>
          </Button>

          {canEdit ? (
            isEditing ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddSection}
                  className="h-8 text-xs gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-primary" />
                  Add Section
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetToDefaults}
                  className="h-8 text-xs text-muted-foreground gap-1"
                  title="Reset to default templates"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Instructions
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Instructions
                </Button>
              </div>
            )
          ) : (
            <div className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>{currentMode === 'judge' ? 'Judges Mode (View Only)' : 'User Mode (View Only)'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Admin Quick Action Tip when not in edit mode */}
      {canEdit && !isEditing && (
        <div className="text-xs bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg p-3 flex items-center justify-between gap-3 text-blue-800 dark:text-blue-300">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              You are logged in as <strong>Admin</strong>. You can customize, add, or rewrite any instruction section.
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-7 text-xs font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300 hover:bg-blue-100"
          >
            Edit Now →
          </Button>
        </div>
      )}

      {/* Official Announcement / Notice Banner */}
      {(announcement.trim() || isEditing) && (
        <div className="rounded-xl border border-amber-300/60 bg-amber-50/80 dark:bg-amber-950/30 dark:border-amber-900/60 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-200/80 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 mt-0.5">
              <Megaphone className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Official Notice / Announcement
                </span>
                {isEditing && (
                  <span className="text-[10px] text-muted-foreground">Admin Announcement</span>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-1.5 mt-2">
                  <Input
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    placeholder="Enter urgent announcement or morning notice for participants..."
                    className="h-9 text-xs bg-background"
                  />
                  <span className="text-[10px] text-muted-foreground block">
                    Shown highlighted at the top of the Instructions board for all modes.
                  </span>
                </div>
              ) : (
                <p className="text-sm font-medium text-amber-950 dark:text-amber-100 leading-snug">
                  {announcement}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Bar for Instructions */}
      {!isEditing && sections.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search instructions (e.g., spikes, 5 points, false start, relay)..."
            className="pl-9 h-9 text-xs bg-card"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Empty State when no sections exist */}
      {sections.length === 0 && (
        <Card className="text-center py-12 px-4 border-dashed">
          <CardContent className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-base">No Instructions Configured</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              There are currently no instruction sections posted. As an Administrator, you can write
              custom guidelines or restore the standard templates.
            </p>
            {canEdit ? (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button size="sm" onClick={handleAddSection} className="text-xs gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Add First Section
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetToDefaults}
                  className="text-xs gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore Standard Rules
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Please check back later or contact the meet officials.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Grid of Instruction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSections.map((sec, secIdx) => {
          const lines = sec.items
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean)

          return (
            <Card key={sec.id} className="relative overflow-hidden border transition-all hover:shadow-sm">
              <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                        {secIdx + 1}
                      </span>
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={sec.tag}
                            onChange={(e) =>
                              handleUpdateSection(sec.id, { tag: e.target.value })
                            }
                            placeholder="Tag (e.g. Rules)"
                            className="h-6 w-24 text-[10px] font-semibold uppercase"
                          />
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {sec.tag}
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <Input
                        value={sec.title}
                        onChange={(e) =>
                          handleUpdateSection(sec.id, { title: e.target.value })
                        }
                        placeholder="Section Title..."
                        className="h-8 text-sm font-bold bg-background mt-1"
                      />
                    ) : (
                      <CardTitle className="text-sm font-bold leading-snug">
                        {sec.title}
                      </CardTitle>
                    )}
                  </div>

                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSection(sec.id)}
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                      title="Delete this section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="px-4 sm:px-5 pb-5">
                {isEditing ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Instructions (One point per line):
                    </label>
                    <textarea
                      rows={7}
                      value={sec.items}
                      onChange={(e) =>
                        handleUpdateSection(sec.id, { items: e.target.value })
                      }
                      placeholder="Type each instruction on a new line..."
                      className="w-full text-xs font-mono p-3 rounded-lg border bg-background resize-y focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                    />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{lines.length} instruction items defined</span>
                      <span>Line breaks create numbered list</span>
                    </div>
                  </div>
                ) : lines.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground italic border border-dashed rounded-lg bg-muted/20">
                    No instructions written in this section yet.
                  </div>
                ) : (
                  <ul className="space-y-2.5 text-xs sm:text-sm">
                    {lines.map((line, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed text-foreground/90">{line}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Bottom Save & Management Toolbar when editing */}
      {canEdit && isEditing && (
        <div className="p-4 rounded-xl border bg-muted/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddSection}
              className="text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              Add Another Section
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear All Sections
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save All Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
