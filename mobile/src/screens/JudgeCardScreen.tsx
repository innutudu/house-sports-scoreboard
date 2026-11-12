import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { ScoreboardEvent, JudgeEntry, AppMode, EventStatus } from '../types'
import { HOUSES, HOUSE_MAP } from '../constants/houses'

type Props = {
  events: ScoreboardEvent[]
  currentMode: AppMode
  selectedEventId?: number
  onSaveScores: (
    eventId: number,
    status: EventStatus,
    scores: { houseId: number; points: number }[],
    entries: JudgeEntry[]
  ) => void
}

export default function JudgeCardScreen({
  events,
  currentMode,
  selectedEventId,
  onSaveScores,
}: Props) {
  const [activeEventId, setActiveEventId] = useState<number>(
    selectedEventId ?? (events[0]?.id || 1)
  )

  useEffect(() => {
    if (selectedEventId) {
      setActiveEventId(selectedEventId)
    }
  }, [selectedEventId])

  const activeEvent = events.find((e) => e.id === activeEventId) ?? events[0]

  const [entries, setEntries] = useState<JudgeEntry[]>([])
  const [eventStatus, setEventStatus] = useState<EventStatus>('completed')
  const [savedBanner, setSavedBanner] = useState(false)

  // Add Student Modal State
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentHouse, setNewStudentHouse] = useState<number>(1)
  const [newStudentNote, setNewStudentNote] = useState('')
  const [newStudentPos, setNewStudentPos] = useState<1 | 2 | 3 | null>(null)

  // Load entries for active event
  useEffect(() => {
    if (!activeEvent) return

    setEventStatus(activeEvent.status)

    if (activeEvent.judge_entries && activeEvent.judge_entries.length > 0) {
      setEntries(activeEvent.judge_entries)
    } else {
      // Default 4 representative student slots (one per house)
      const defaultEntries: JudgeEntry[] = HOUSES.map((h, i) => {
        const pts = activeEvent.results.find((r) => r.house_id === h.id)?.points ?? 0
        let pos: 1 | 2 | 3 | null = null
        if (pts >= 5) pos = 1
        else if (pts === 3) pos = 2
        else if (pts === 1) pos = 3

        return {
          id: `entry-${activeEvent.id}-${h.id}-${i}-${Date.now()}`,
          name: '',
          house_id: h.id,
          position: pos,
          note: '',
        }
      })
      setEntries(defaultEntries)
    }
  }, [activeEventId, activeEvent])

  const canEdit = currentMode === 'admin' || currentMode === 'judge'

  // Toggle position for student with conflict resolution
  const handlePositionTap = (entryId: string, targetPos: 1 | 2 | 3) => {
    if (!canEdit) return

    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id === entryId) {
          const newPos = entry.position === targetPos ? null : targetPos
          return { ...entry, position: newPos }
        }
        // If another student had this position, clear it
        if (entry.position === targetPos) {
          return { ...entry, position: null }
        }
        return entry
      })
    )
  }

  const handleNameChange = (entryId: string, name: string) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === entryId ? { ...entry, name } : entry))
    )
  }

  const handleHouseChange = (entryId: string, houseId: number) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === entryId ? { ...entry, house_id: houseId } : entry))
    )
  }

  const handleNoteChange = (entryId: string, note: string) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === entryId ? { ...entry, note } : entry))
    )
  }

  const handleDeleteStudent = (entryId: string, studentName: string) => {
    if (!canEdit) return
    Alert.alert(
      'Remove Student',
      `Remove ${studentName.trim() ? `"${studentName}"` : 'this participant'} from ${activeEvent?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setEntries((prev) => prev.filter((e) => e.id !== entryId))
          },
        },
      ]
    )
  }

  // Handle Add Student Submission
  const handleAddStudentSubmit = () => {
    if (!newStudentName.trim()) {
      Alert.alert('Student Name Required', 'Please enter the student or athlete name.')
      return
    }

    const newEntry: JudgeEntry = {
      id: `student-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newStudentName.trim(),
      house_id: newStudentHouse,
      position: newStudentPos,
      note: newStudentNote.trim(),
    }

    setEntries((prev) => {
      // If position assigned, clear it from any existing student
      if (newStudentPos) {
        return [
          ...prev.map((e) => (e.position === newStudentPos ? { ...e, position: null } : e)),
          newEntry,
        ]
      }
      return [...prev, newEntry]
    })

    // Reset modal form
    setNewStudentName('')
    setNewStudentHouse(1)
    setNewStudentNote('')
    setNewStudentPos(null)
    setAddModalVisible(false)
  }

  // Calculate projected house points based on positions (5-3-1 rule)
  const projectedPoints: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }
  entries.forEach((e) => {
    if (e.position === 1) projectedPoints[e.house_id] = (projectedPoints[e.house_id] || 0) + 5
    else if (e.position === 2) projectedPoints[e.house_id] = (projectedPoints[e.house_id] || 0) + 3
    else if (e.position === 3) projectedPoints[e.house_id] = (projectedPoints[e.house_id] || 0) + 1
  })

  const handleSave = () => {
    if (!canEdit || !activeEvent) return

    const scores = HOUSES.map((h) => ({
      houseId: h.id,
      points: projectedPoints[h.id] || 0,
    }))

    onSaveScores(activeEvent.id, eventStatus, scores, entries)
    setSavedBanner(true)
    setTimeout(() => setSavedBanner(false), 3000)
  }

  return (
    <View style={styles.container}>
      {/* Event Selector Horizontal Bar */}
      <View style={styles.selectorBar}>
        <Text style={styles.selectorLabel}>SELECT EVENT:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventScroll}>
          {events.map((ev) => (
            <Pressable
              key={ev.id}
              onPress={() => setActiveEventId(ev.id)}
              style={[
                styles.eventChip,
                activeEventId === ev.id && styles.eventChipActive,
              ]}
            >
              <Text
                style={[
                  styles.eventChipText,
                  activeEventId === ev.id && styles.eventChipTextActive,
                ]}
              >
                {ev.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Saved Success Alert */}
        {savedBanner && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={18} color="#15803d" />
            <Text style={styles.successText}>Official scores saved successfully!</Text>
          </View>
        )}

        {/* Event Header Card */}
        <View style={styles.eventHeaderCard}>
          <View style={styles.eventHeaderTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventCategoryBadge}>{activeEvent?.category}</Text>
              <Text style={styles.activeEventTitle}>{activeEvent?.name}</Text>
              {activeEvent?.division && (
                <Text style={styles.activeEventDivision}>{activeEvent.division}</Text>
              )}
            </View>

            <View style={styles.statusPicker}>
              {(['live', 'completed'] as const).map((st) => (
                <Pressable
                  key={st}
                  disabled={!canEdit}
                  onPress={() => setEventStatus(st)}
                  style={[
                    styles.statusOption,
                    eventStatus === st && (st === 'live' ? styles.statusOptionLive : styles.statusOptionCompleted),
                  ]}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      eventStatus === st && styles.statusOptionTextActive,
                    ]}
                  >
                    {st === 'live' ? '🔴 Live' : '✓ Completed'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Points allocation preview */}
          <View style={styles.pointsPreviewBar}>
            {HOUSES.map((h) => (
              <View key={h.id} style={styles.pointsHousePill}>
                <View style={[styles.pillDot, { backgroundColor: h.hex }]} />
                <Text style={styles.pillName}>{h.name}:</Text>
                <Text style={styles.pillPoints}>{projectedPoints[h.id] || 0} pts</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section Header with Add Student Button */}
        <View style={styles.slipHeaderRow}>
          <View>
            <Text style={styles.tableTitle}>PARTICIPATING STUDENTS</Text>
            <Text style={styles.tableSubtitle}>
              {entries.length} {entries.length === 1 ? 'athlete' : 'athletes'} registered for this event
            </Text>
          </View>

          {canEdit && (
            <Pressable
              onPress={() => setAddModalVisible(true)}
              style={styles.addStudentBtn}
            >
              <Ionicons name="person-add" size={14} color="#ffffff" />
              <Text style={styles.addStudentBtnText}>+ Add Student</Text>
            </Pressable>
          )}
        </View>

        {/* Student Cards List */}
        <View style={styles.slipCard}>
          {entries.map((entry, index) => {
            const house = HOUSE_MAP.get(entry.house_id) || HOUSES[0]

            return (
              <View key={entry.id} style={styles.entryRow}>
                {/* Student Top Row: Index, House Selector / Badge, and Delete */}
                <View style={styles.entryTopRow}>
                  <View style={styles.entryHouseBadgeWrap}>
                    <Text style={styles.entryIndexText}>#{index + 1}</Text>
                    <View style={[styles.houseDotLarge, { backgroundColor: house.hex }]} />
                    <Text style={styles.houseTitleText}>{house.name} House</Text>
                  </View>

                  <View style={styles.entryTopRight}>
                    {entry.position && (
                      <View style={styles.awardedPill}>
                        <Text style={styles.awardedText}>
                          {entry.position === 1 ? '🥇 1st (5 pts)' : entry.position === 2 ? '🥈 2nd (3 pts)' : '🥉 3rd (1 pt)'}
                        </Text>
                      </View>
                    )}

                    {canEdit && (
                      <Pressable
                        onPress={() => handleDeleteStudent(entry.id, entry.name)}
                        style={styles.deleteRowBtn}
                        hitSlop={8}
                        accessibilityLabel="Delete participant"
                      >
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                      </Pressable>
                    )}
                  </View>
                </View>

                {/* Athlete Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Student Name:</Text>
                  <TextInput
                    placeholder="Enter student / athlete name..."
                    placeholderTextColor="#94a3b8"
                    value={entry.name}
                    editable={canEdit}
                    onChangeText={(text) => handleNameChange(entry.id, text)}
                    style={[styles.nameInput, !canEdit && styles.inputDisabled]}
                  />
                </View>

                {/* House Switcher Chips (when in edit mode) */}
                {canEdit && (
                  <View style={styles.houseSelectGroup}>
                    <Text style={styles.inputLabel}>Assign House:</Text>
                    <View style={styles.houseSelectRow}>
                      {HOUSES.map((h) => {
                        const isSelected = entry.house_id === h.id
                        return (
                          <Pressable
                            key={h.id}
                            onPress={() => handleHouseChange(entry.id, h.id)}
                            style={[
                              styles.houseSelectChip,
                              isSelected && { borderColor: h.hex, backgroundColor: '#f8fafc' },
                            ]}
                          >
                            <View style={[styles.chipColorDot, { backgroundColor: h.hex }]} />
                            <Text
                              style={[
                                styles.chipText,
                                isSelected && { fontWeight: '800', color: '#0f172a' },
                              ]}
                            >
                              {h.name}
                            </Text>
                          </Pressable>
                        )
                      })}
                    </View>
                  </View>
                )}

                {/* 1-Tap Position Buttons (🥇 1st, 🥈 2nd, 🥉 3rd) */}
                <View style={styles.positionButtonsGroup}>
                  <Text style={styles.inputLabel}>Place / Rank:</Text>
                  <View style={styles.positionRow}>
                    {/* 1st Place Button */}
                    <Pressable
                      disabled={!canEdit}
                      onPress={() => handlePositionTap(entry.id, 1)}
                      style={[
                        styles.posBtn,
                        entry.position === 1 && styles.posBtn1st,
                        !canEdit && styles.btnDisabled,
                      ]}
                    >
                      <Text style={styles.posBtnEmoji}>🥇</Text>
                      <Text style={[styles.posBtnLabel, entry.position === 1 && styles.posBtnLabelActive]}>
                        1st (5 pts)
                      </Text>
                    </Pressable>

                    {/* 2nd Place Button */}
                    <Pressable
                      disabled={!canEdit}
                      onPress={() => handlePositionTap(entry.id, 2)}
                      style={[
                        styles.posBtn,
                        entry.position === 2 && styles.posBtn2nd,
                        !canEdit && styles.btnDisabled,
                      ]}
                    >
                      <Text style={styles.posBtnEmoji}>🥈</Text>
                      <Text style={[styles.posBtnLabel, entry.position === 2 && styles.posBtnLabelActive]}>
                        2nd (3 pts)
                      </Text>
                    </Pressable>

                    {/* 3rd Place Button */}
                    <Pressable
                      disabled={!canEdit}
                      onPress={() => handlePositionTap(entry.id, 3)}
                      style={[
                        styles.posBtn,
                        entry.position === 3 && styles.posBtn3rd,
                        !canEdit && styles.btnDisabled,
                      ]}
                    >
                      <Text style={styles.posBtnEmoji}>🥉</Text>
                      <Text style={[styles.posBtnLabel, entry.position === 3 && styles.posBtnLabelActive]}>
                        3rd (1 pt)
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Remarks / Distance / Time */}
                <View style={styles.inputGroup}>
                  <TextInput
                    placeholder="Time / Distance / Remarks (optional)..."
                    placeholderTextColor="#94a3b8"
                    value={entry.note}
                    editable={canEdit}
                    onChangeText={(text) => handleNoteChange(entry.id, text)}
                    style={[styles.noteInput, !canEdit && styles.inputDisabled]}
                  />
                </View>
              </View>
            )
          })}

          {entries.length === 0 && (
            <View style={styles.emptyEntriesBox}>
              <Ionicons name="people-outline" size={36} color="#cbd5e1" />
              <Text style={styles.emptyEntriesTitle}>No Students in This Event</Text>
              <Text style={styles.emptyEntriesSub}>
                Tap "+ Add Student" above to register athletes for this competition.
              </Text>
            </View>
          )}
        </View>

        {/* Quick "+ Add Another Student" Bar */}
        {canEdit && (
          <Pressable
            onPress={() => setAddModalVisible(true)}
            style={styles.addStudentDashedBtn}
          >
            <Ionicons name="person-add" size={16} color="#2563eb" />
            <Text style={styles.addStudentDashedText}>+ Add Another Student / Athlete</Text>
          </Pressable>
        )}

        {/* Save Scores Button */}
        {canEdit && (
          <Pressable onPress={handleSave} style={styles.saveScoresButton}>
            <Ionicons name="save-outline" size={18} color="#ffffff" />
            <Text style={styles.saveScoresText}>Save & Publish Event Scores</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Add Student Modal */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setAddModalVisible(false)} />

          <View style={styles.modalContainer}>
            <View style={styles.modalTop}>
              <View style={styles.modalTopLeft}>
                <View style={styles.modalIconWrap}>
                  <Ionicons name="person-add" size={20} color="#2563eb" />
                </View>
                <View>
                  <Text style={styles.modalHeaderTitle}>Add Student to Event</Text>
                  <Text style={styles.modalHeaderSub}>{activeEvent?.name}</Text>
                </View>
              </View>
              <Pressable onPress={() => setAddModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748b" />
              </Pressable>
            </View>

            {/* Student Name */}
            <View style={styles.modalFormGroup}>
              <Text style={styles.modalLabel}>Student / Athlete Name *</Text>
              <TextInput
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor="#94a3b8"
                value={newStudentName}
                onChangeText={setNewStudentName}
                style={styles.modalInput}
                autoFocus
              />
            </View>

            {/* House Selection */}
            <View style={styles.modalFormGroup}>
              <Text style={styles.modalLabel}>Select House *</Text>
              <View style={styles.modalHousesGrid}>
                {HOUSES.map((h) => {
                  const isSelected = newStudentHouse === h.id
                  return (
                    <Pressable
                      key={h.id}
                      onPress={() => setNewStudentHouse(h.id)}
                      style={[
                        styles.modalHouseChip,
                        isSelected && { borderColor: h.hex, backgroundColor: '#eff6ff' },
                      ]}
                    >
                      <View style={[styles.modalHouseDot, { backgroundColor: h.hex }]} />
                      <Text
                        style={[
                          styles.modalHouseName,
                          isSelected && { fontWeight: '800', color: '#0f172a' },
                        ]}
                      >
                        {h.name}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>

            {/* Initial Place / Position (Optional) */}
            <View style={styles.modalFormGroup}>
              <Text style={styles.modalLabel}>Initial Placing (Optional)</Text>
              <View style={styles.modalPosRow}>
                <Pressable
                  onPress={() => setNewStudentPos(null)}
                  style={[styles.modalPosBtn, newStudentPos === null && styles.modalPosBtnActive]}
                >
                  <Text style={[styles.modalPosText, newStudentPos === null && styles.modalPosTextActive]}>
                    Unplaced
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setNewStudentPos(1)}
                  style={[styles.modalPosBtn, newStudentPos === 1 && styles.modalPosBtnActiveGold]}
                >
                  <Text style={styles.modalPosText}>🥇 1st (5 pts)</Text>
                </Pressable>
                <Pressable
                  onPress={() => setNewStudentPos(2)}
                  style={[styles.modalPosBtn, newStudentPos === 2 && styles.modalPosBtnActiveSilver]}
                >
                  <Text style={styles.modalPosText}>🥈 2nd (3 pts)</Text>
                </Pressable>
                <Pressable
                  onPress={() => setNewStudentPos(3)}
                  style={[styles.modalPosBtn, newStudentPos === 3 && styles.modalPosBtnActiveBronze]}
                >
                  <Text style={styles.modalPosText}>🥉 3rd (1 pt)</Text>
                </Pressable>
              </View>
            </View>

            {/* Remarks / Record */}
            <View style={styles.modalFormGroup}>
              <Text style={styles.modalLabel}>Time / Distance / Remarks (Optional)</Text>
              <TextInput
                placeholder="e.g. 11.2s, 48m, Lane 4..."
                placeholderTextColor="#94a3b8"
                value={newStudentNote}
                onChangeText={setNewStudentNote}
                style={styles.modalInput}
              />
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActionRow}>
              <Pressable
                onPress={() => setAddModalVisible(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleAddStudentSubmit}
                style={styles.modalSubmitBtn}
              >
                <Ionicons name="checkmark" size={16} color="#ffffff" />
                <Text style={styles.modalSubmitText}>Add to Event</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  selectorBar: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  selectorLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  eventScroll: {
    flexDirection: 'row',
  },
  eventChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  eventChipActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  eventChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  eventChipTextActive: {
    color: '#ffffff',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 36,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  successText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803d',
  },
  eventHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  eventHeaderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  eventCategoryBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563eb',
    textTransform: 'uppercase',
  },
  activeEventTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
  },
  activeEventDivision: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 1,
  },
  statusPicker: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  statusOption: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusOptionLive: {
    backgroundColor: '#fee2e2',
  },
  statusOptionCompleted: {
    backgroundColor: '#dcfce7',
  },
  statusOptionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  statusOptionTextActive: {
    color: '#0f172a',
    fontWeight: '800',
  },
  pointsPreviewBar: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  pointsHousePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingVertical: 4,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillName: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  pillPoints: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f172a',
  },
  slipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tableTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.6,
  },
  tableSubtitle: {
    fontSize: 10,
    color: '#64748b',
  },
  addStudentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addStudentBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  slipCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 12,
  },
  entryRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  entryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  entryHouseBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  entryIndexText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    width: 22,
  },
  houseDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  houseTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  entryTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  awardedPill: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  awardedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b45309',
  },
  deleteRowBtn: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 4,
  },
  nameInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: '#0f172a',
  },
  houseSelectGroup: {
    marginBottom: 8,
  },
  houseSelectRow: {
    flexDirection: 'row',
    gap: 6,
  },
  houseSelectChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  chipColorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  noteInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    color: '#475569',
  },
  inputDisabled: {
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
  },
  positionButtonsGroup: {
    marginBottom: 8,
  },
  positionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  posBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
  },
  posBtn1st: {
    backgroundColor: '#fef3c7',
    borderColor: '#eab308',
  },
  posBtn2nd: {
    backgroundColor: '#f1f5f9',
    borderColor: '#94a3b8',
  },
  posBtn3rd: {
    backgroundColor: '#ffedd5',
    borderColor: '#f97316',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  posBtnEmoji: {
    fontSize: 12,
  },
  posBtnLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  posBtnLabelActive: {
    color: '#0f172a',
    fontWeight: '900',
  },
  emptyEntriesBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEntriesTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    marginTop: 8,
  },
  emptyEntriesSub: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
  addStudentDashedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#93c5fd',
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: '#eff6ff',
    marginBottom: 14,
  },
  addStudentDashedText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563eb',
  },
  saveScoresButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveScoresText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 34,
  },
  modalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalHeaderSub: {
    fontSize: 11,
    color: '#64748b',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalFormGroup: {
    marginBottom: 14,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
  },
  modalHousesGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  modalHouseChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  modalHouseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalHouseName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  modalPosRow: {
    flexDirection: 'row',
    gap: 6,
  },
  modalPosBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  modalPosBtnActive: {
    borderColor: '#0f172a',
    backgroundColor: '#0f172a',
  },
  modalPosBtnActiveGold: {
    borderColor: '#eab308',
    backgroundColor: '#fef3c7',
  },
  modalPosBtnActiveSilver: {
    borderColor: '#94a3b8',
    backgroundColor: '#f1f5f9',
  },
  modalPosBtnActiveBronze: {
    borderColor: '#f97316',
    backgroundColor: '#ffedd5',
  },
  modalPosText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  modalPosTextActive: {
    color: '#ffffff',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  modalCancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  modalSubmitBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
})
