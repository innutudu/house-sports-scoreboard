import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { InstructionCategory, AppMode } from '../types'
import { DEFAULT_INSTRUCTIONS, DEFAULT_ANNOUNCEMENT } from '../constants/houses'

type Props = {
  instructions: InstructionCategory[]
  announcement: string
  currentMode: AppMode
  onSaveInstructions: (instructions: InstructionCategory[], announcement: string) => void
}

export default function InstructionsScreen({
  instructions,
  announcement,
  currentMode,
  onSaveInstructions,
}: Props) {
  const [sections, setSections] = useState<InstructionCategory[]>(instructions)
  const [banner, setBanner] = useState<string>(announcement)
  const [isEditing, setIsEditing] = useState(false)
  const [search, setSearch] = useState('')
  const [savedAlert, setSavedAlert] = useState(false)

  const canEdit = currentMode === 'admin'

  const filteredSections = sections.filter((sec) => {
    const q = search.toLowerCase()
    return (
      sec.title.toLowerCase().includes(q) ||
      sec.tag.toLowerCase().includes(q) ||
      sec.items.toLowerCase().includes(q)
    )
  })

  const handleSave = () => {
    onSaveInstructions(sections, banner)
    setIsEditing(false)
    setSavedAlert(true)
    setTimeout(() => setSavedAlert(false), 3000)
  }

  const handleReset = () => {
    Alert.alert(
      'Reset Instructions',
      'Restore all standard instructions to official meet templates?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSections(DEFAULT_INSTRUCTIONS)
            setBanner(DEFAULT_ANNOUNCEMENT)
            onSaveInstructions(DEFAULT_INSTRUCTIONS, DEFAULT_ANNOUNCEMENT)
            setIsEditing(false)
          },
        },
      ]
    )
  }

  const handleAddSection = () => {
    const newSec: InstructionCategory = {
      id: `sec_${Date.now()}`,
      title: 'New Instruction Section',
      tag: 'Notice',
      items: 'Enter instructions here (one rule per line)...',
    }
    setSections([...sections, newSec])
    setIsEditing(true)
  }

  const handleDeleteSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id))
  }

  const handleUpdateSection = (id: string, updates: Partial<InstructionCategory>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  return (
    <View style={styles.container}>
      {/* Top Controls Bar */}
      <View style={styles.topControls}>
        <View style={styles.headerLeft}>
          <Text style={styles.mainHeading}>Meet Instructions</Text>
          <Text style={styles.subHeading}>Official guidelines set by Admin</Text>
        </View>

        {canEdit && (
          <View style={styles.editControls}>
            {isEditing ? (
              <>
                <Pressable onPress={handleReset} style={styles.resetBtn}>
                  <Text style={styles.resetText}>Reset</Text>
                </Pressable>
                <Pressable onPress={handleSave} style={styles.saveBtn}>
                  <Ionicons name="checkmark" size={14} color="#ffffff" />
                  <Text style={styles.saveText}>Save</Text>
                </Pressable>
              </>
            ) : (
              <Pressable onPress={() => setIsEditing(true)} style={styles.editBtn}>
                <Ionicons name="pencil" size={13} color="#ffffff" />
                <Text style={styles.editText}>Edit Rules</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Saved Alert Banner */}
        {savedAlert && (
          <View style={styles.savedAlert}>
            <Ionicons name="checkmark-circle" size={16} color="#15803d" />
            <Text style={styles.savedAlertText}>Instructions updated successfully!</Text>
          </View>
        )}

        {/* Announcement Banner */}
        {(banner || isEditing) && (
          <View style={styles.announcementCard}>
            <View style={styles.announcementTop}>
              <Ionicons name="megaphone" size={16} color="#d97706" />
              <Text style={styles.announcementLabel}>OFFICIAL NOTICE</Text>
            </View>
            {isEditing ? (
              <TextInput
                value={banner}
                onChangeText={setBanner}
                placeholder="Enter urgent morning notice or announcement..."
                placeholderTextColor="#94a3b8"
                style={styles.bannerInput}
                multiline
              />
            ) : (
              <Text style={styles.announcementText}>{banner}</Text>
            )}
          </View>
        )}

        {/* Search Bar */}
        {!isEditing && (
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color="#94a3b8" />
            <TextInput
              placeholder="Search instructions (e.g. spikes, 5 points)..."
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
            {search ? (
              <Pressable onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color="#94a3b8" />
              </Pressable>
            ) : null}
          </View>
        )}

        {/* Instruction Sections */}
        {filteredSections.map((sec, secIdx) => {
          const lines = sec.items
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean)

          return (
            <View key={sec.id} style={styles.sectionCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.indexCircle}>
                    <Text style={styles.indexNum}>{secIdx + 1}</Text>
                  </View>

                  {isEditing ? (
                    <View style={{ flex: 1, gap: 4 }}>
                      <TextInput
                        value={sec.tag}
                        onChangeText={(t) => handleUpdateSection(sec.id, { tag: t })}
                        placeholder="Tag (e.g. Rules)"
                        style={styles.tagInput}
                      />
                      <TextInput
                        value={sec.title}
                        onChangeText={(t) => handleUpdateSection(sec.id, { title: t })}
                        placeholder="Section title"
                        style={styles.titleInput}
                      />
                    </View>
                  ) : (
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tagBadge}>{sec.tag}</Text>
                      <Text style={styles.sectionTitle}>{sec.title}</Text>
                    </View>
                  )}
                </View>

                {isEditing && (
                  <Pressable
                    onPress={() => handleDeleteSection(sec.id)}
                    style={styles.trashBtn}
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </Pressable>
                )}
              </View>

              {/* Items */}
              {isEditing ? (
                <View style={styles.editorBox}>
                  <Text style={styles.editorHint}>One rule per line:</Text>
                  <TextInput
                    value={sec.items}
                    onChangeText={(t) => handleUpdateSection(sec.id, { items: t })}
                    multiline
                    style={styles.itemsTextarea}
                  />
                </View>
              ) : (
                <View style={styles.rulesList}>
                  {lines.map((line, idx) => (
                    <View key={idx} style={styles.ruleRow}>
                      <View style={styles.bulletDot}>
                        <Text style={styles.bulletNum}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.ruleText}>{line}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )
        })}

        {/* Add Section Button (Admin) */}
        {canEdit && isEditing && (
          <Pressable onPress={handleAddSection} style={styles.addSectionBtn}>
            <Ionicons name="add" size={18} color="#2563eb" />
            <Text style={styles.addSectionText}>Add Another Section</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    flex: 1,
  },
  mainHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  subHeading: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  editControls: {
    flexDirection: 'row',
    gap: 6,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#16a34a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  resetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  resetText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 32,
    gap: 12,
  },
  savedAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#dcfce7',
    padding: 10,
    borderRadius: 8,
  },
  savedAlertText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  announcementCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 12,
  },
  announcementTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  announcementLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#b45309',
    letterSpacing: 0.6,
  },
  announcementText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78350f',
    lineHeight: 17,
  },
  bannerInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 8,
    fontSize: 12,
    color: '#0f172a',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0f172a',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  indexCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  indexNum: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
  tagBadge: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  tagInput: {
    fontSize: 10,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#f8fafc',
  },
  titleInput: {
    fontSize: 13,
    fontWeight: '800',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f8fafc',
  },
  trashBtn: {
    padding: 4,
  },
  rulesList: {
    gap: 8,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bulletNum: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
  },
  ruleText: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  editorBox: {
    marginTop: 4,
  },
  editorHint: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 4,
  },
  itemsTextarea: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    color: '#0f172a',
  },
  addSectionBtn: {
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
  },
  addSectionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563eb',
  },
})
