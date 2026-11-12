import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { EventCategory, EventStatus, ScoreboardEvent } from '../types'
import { HOUSES } from '../constants/houses'

type Props = {
  visible: boolean
  onClose: () => void
  onAdd: (event: Omit<ScoreboardEvent, 'id' | 'results'>) => void
}

const CATEGORIES: EventCategory[] = ['Track', 'Field - Throw', 'Field - Jump', 'Team', 'General']

export default function AddEventModal({ visible, onClose, onAdd }: Props) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<EventCategory>('Track')
  const [division, setDivision] = useState('Senior Boys')
  const [date, setDate] = useState('2026-11-12')
  const [status, setStatus] = useState<EventStatus>('upcoming')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Event name is required.')
      return
    }

    onAdd({
      name: name.trim(),
      category,
      division: division.trim() || undefined,
      event_date: date.trim() || '2026-11-12',
      status,
    })

    setName('')
    setError(null)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Ionicons name="add-circle" size={20} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Add New Event</Text>
                <Text style={styles.modalSub}>Configure an official competition event</Text>
              </View>
            </View>

            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView style={styles.formScroll}>
            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Event Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Event Name *</Text>
              <TextInput
                placeholder="e.g. 100m Sprint, High Jump..."
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={(t) => {
                  setName(t)
                  setError(null)
                }}
                style={styles.textInput}
              />
            </View>

            {/* Category Selector */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryRow}>
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[styles.catChip, category === cat && styles.catChipActive]}
                  >
                    <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Division */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Division / Group</Text>
              <TextInput
                placeholder="e.g. Senior Boys, Senior Girls, Open..."
                placeholderTextColor="#94a3b8"
                value={division}
                onChangeText={setDivision}
                style={styles.textInput}
              />
            </View>

            {/* Event Date */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Event Date (YYYY-MM-DD)</Text>
              <TextInput
                placeholder="2026-11-12"
                placeholderTextColor="#94a3b8"
                value={date}
                onChangeText={setDate}
                style={styles.textInput}
              />
            </View>

            {/* Status */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Initial Status</Text>
              <View style={styles.statusRow}>
                {(['upcoming', 'live', 'completed'] as const).map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setStatus(s)}
                    style={[styles.statusChip, status === s && styles.statusChipActive]}
                  >
                    <Text style={[styles.statusChipText, status === s && styles.statusChipTextActive]}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footerRow}>
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSubmit} style={styles.submitBtn}>
              <Text style={styles.submitText}>Create Event</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSub: {
    fontSize: 11,
    color: '#64748b',
  },
  closeBtn: {
    padding: 4,
  },
  formScroll: {
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 10,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  catChipActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  catChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  catChipTextActive: {
    color: '#ffffff',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  statusChipTextActive: {
    color: '#ffffff',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },
  submitText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
})
