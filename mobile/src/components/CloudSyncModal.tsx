import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import {
  loadSupabaseConfigAsync,
  saveSupabaseConfigAsync,
  clearSupabaseConfigAsync,
  isSupabaseConfiguredSync,
  testSupabaseConnection,
} from '../services/supabase'

type Props = {
  visible: boolean
  onClose: () => void
  onConnected?: () => void
}

export default function CloudSyncModal({ visible, onClose, onConnected }: Props) {
  const [url, setUrl] = useState('')
  const [key, setKey] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showGuide, setShowGuide] = useState(false)

  const isConnected = isSupabaseConfiguredSync()

  useEffect(() => {
    if (visible) {
      loadSupabaseConfigAsync().then((cfg) => {
        setUrl(cfg.url)
        setKey(cfg.key)
        setTestResult(null)
      })
    }
  }, [visible])

  const handleTest = async () => {
    if (!url.trim() || !key.trim()) {
      setTestResult({
        success: false,
        message: 'Please enter both the Supabase URL and Anon Key.',
      })
      return
    }

    setTesting(true)
    setTestResult(null)
    try {
      const res = await testSupabaseConnection(url, key)
      setTestResult(res)
      if (res.sanitizedUrl && res.sanitizedUrl !== url.trim()) {
        setUrl(res.sanitizedUrl)
      }
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    if (!url.trim() || !key.trim()) {
      Alert.alert('Missing Info', 'Please enter your Supabase Project URL and Anon Key.')
      return
    }

    await saveSupabaseConfigAsync(url, key)
    onClose()
    if (onConnected) onConnected()
  }

  const handleDisconnect = async () => {
    await clearSupabaseConfigAsync()
    setUrl('')
    setKey('')
    setTestResult({
      success: true,
      message: 'Disconnected. The mobile app will now use local storage.',
    })
    if (onConnected) onConnected()
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="cloud-outline" size={24} color="#2563EB" />
              <Text style={styles.headerTitle}>Live Cloud Sync</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </Pressable>
          </View>

          {/* Status Chip */}
          <View
            style={[
              styles.statusChip,
              isConnected ? styles.statusChipOnline : styles.statusChipOffline,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                isConnected ? styles.statusDotOnline : styles.statusDotOffline,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                isConnected ? styles.statusTextOnline : styles.statusTextOffline,
              ]}
            >
              {isConnected
                ? 'Cloud Sync: Active (Multi-Device Live)'
                : 'Local Mode: Offline (This Phone Only)'}
            </Text>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>
              Connect to your free Supabase PostgreSQL cloud database so scores entered by judges
              instantly synchronize across all phones and web dashboards.
            </Text>

            {/* Test Feedback Banner */}
            {testResult && (
              <View
                style={[
                  styles.resultBanner,
                  testResult.success ? styles.resultBannerSuccess : styles.resultBannerError,
                ]}
              >
                <Ionicons
                  name={testResult.success ? 'checkmark-circle' : 'alert-circle'}
                  size={18}
                  color={testResult.success ? '#16A34A' : '#DC2626'}
                />
                <Text
                  style={[
                    styles.resultText,
                    testResult.success ? styles.resultTextSuccess : styles.resultTextError,
                  ]}
                >
                  {testResult.message}
                </Text>
              </View>
            )}

            {/* Inputs */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>SUPABASE PROJECT URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://your-project.supabase.co"
                placeholderTextColor="#94A3B8"
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>SUPABASE ANON PUBLIC KEY</Text>
              <TextInput
                style={styles.input}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                placeholderTextColor="#94A3B8"
                value={key}
                onChangeText={setKey}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <Pressable
                style={styles.testBtn}
                onPress={handleTest}
                disabled={testing || !url.trim() || !key.trim()}
              >
                {testing ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                  <>
                    <Ionicons name="refresh-outline" size={16} color="#2563EB" />
                    <Text style={styles.testBtnText}>Test Connection</Text>
                  </>
                )}
              </Pressable>

              {isConnected && (
                <Pressable style={styles.disconnectBtn} onPress={handleDisconnect}>
                  <Text style={styles.disconnectText}>Disconnect</Text>
                </Pressable>
              )}
            </View>

            {/* Setup Guide Accordion */}
            <Pressable
              style={styles.guideHeader}
              onPress={() => setShowGuide(!showGuide)}
            >
              <Text style={styles.guideTitle}>📖 2-Minute Supabase Setup Guide</Text>
              <Ionicons
                name={showGuide ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#2563EB"
              />
            </Pressable>

            {showGuide && (
              <View style={styles.guideBox}>
                <Text style={styles.guideStep}>
                  <Text style={styles.bold}>1.</Text> Create a free project at{' '}
                  <Text style={styles.codeText}>database.new</Text>
                </Text>
                <Text style={styles.guideStep}>
                  <Text style={styles.bold}>2.</Text> Open <Text style={styles.bold}>SQL Editor</Text>,
                  paste the contents of <Text style={styles.codeText}>db/schema.sql</Text>, and tap{' '}
                  <Text style={styles.bold}>Run</Text>.
                </Text>
                <Text style={styles.guideStep}>
                  <Text style={styles.bold}>3.</Text> In <Text style={styles.bold}>Project Settings → API</Text>,
                  copy the <Text style={styles.bold}>Project URL</Text> and{' '}
                  <Text style={styles.bold}>anon key</Text>, paste them above, and tap Connect!
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer Save */}
          <View style={styles.footer}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.saveBtn, (!url || !key) && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!url || !key}
            >
              <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
              <Text style={styles.saveText}>Save & Connect</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
  },
  statusChipOnline: {
    backgroundColor: '#DCFCE7',
  },
  statusChipOffline: {
    backgroundColor: '#FEF3C7',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotOnline: {
    backgroundColor: '#16A34A',
  },
  statusDotOffline: {
    backgroundColor: '#D97706',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextOnline: {
    color: '#15803D',
  },
  statusTextOffline: {
    color: '#B45309',
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  resultBannerSuccess: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  resultBannerError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  resultText: {
    fontSize: 12,
    flex: 1,
    fontWeight: '600',
  },
  resultTextSuccess: {
    color: '#166534',
  },
  resultTextError: {
    color: '#991B1B',
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    fontFamily: 'monospace',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  testBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  disconnectBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  disconnectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 10,
  },
  guideTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  guideBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    gap: 8,
  },
  guideStep: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  codeText: {
    fontFamily: 'monospace',
    backgroundColor: '#E2E8F0',
    color: '#0F172A',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})
