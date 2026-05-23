import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const QR_SIZE = width * 0.65;
const TIMER_SECONDS = 15 * 60;
const API_URL = 'http://localhost:3000/api/v1';

type TxStatus = 'pending' | 'approved' | 'rejected';

interface StatusConfig {
  color: string;
  emoji: string;
  message: string;
}

const STATUS_CONFIG: Record<TxStatus, StatusConfig> = {
  pending: { color: '#FFD700', emoji: '⏳', message: 'Aguardando leitura no balcão...' },
  approved: { color: '#00E676', emoji: '✅', message: 'Compra aprovada! Sucesso!' },
  rejected: { color: '#FF1744', emoji: '❌', message: 'Transação recusada.' },
};

function padZero(n: number) {
  return n.toString().padStart(2, '0');
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${padZero(m)}:${padZero(s)}`;
}

export default function QRCodeScreen({ navigation, route }: any) {
  const token = route?.params?.token ?? 'APROVA-DEMO-TOKEN-001';
  const limit = route?.params?.limit ?? 3500;

  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [status, setStatus] = useState<TxStatus>('pending');
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Neon glow pulse
  useEffect(() => {
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
      ]),
    );
    glow.start();
    return () => glow.stop();
  }, [glowAnim]);

  // Progress bar animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: TIMER_SECONDS * 1000,
      useNativeDriver: false,
    }).start();
  }, [progressAnim]);

  // Countdown timer
  useEffect(() => {
    if (status !== 'pending') return;
    const tick = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(tick);
          setStatus('rejected');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [status]);

  // WebSocket / polling for status updates
  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/qr-codes/status/${token}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === 'used' && data.transaction?.status === 'approved') {
        setStatus('approved');
        clearInterval(pollRef.current!);
      } else if (data.status === 'cancelled') {
        setStatus('rejected');
        clearInterval(pollRef.current!);
      }
    } catch {
      // network error — keep polling
    }
  }, [token]);

  useEffect(() => {
    pollRef.current = setInterval(pollStatus, 3000);
    return () => clearInterval(pollRef.current!);
  }, [pollStatus]);

  const cfg = STATUS_CONFIG[status];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Text style={styles.backBtn}>‹ Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR CODE APROVA</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* QR Code Box */}
      <View style={styles.qrWrap}>
        <Animated.View
          style={[
            styles.qrGlow,
            {
              opacity: status === 'pending' ? glowAnim : 1,
              borderColor: cfg.color,
              shadowColor: cfg.color,
            },
          ]}
        >
          {/* Placeholder QR — replace with react-native-qrcode-svg in production */}
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrPlaceholderText}>
              {'█ ▀ ▄ ▀ █\n▄ ▀ ▀ ▄ ▄\n▀ ▄ █ ▀ ▄\n▄ ▀ ▀ ▄ █\n█ ▄ ▀ ▀ █'}
            </Text>
          </View>
        </Animated.View>

        <Text style={styles.tokenText}>{token}</Text>
      </View>

      {/* Timer */}
      {status === 'pending' && (
        <View style={styles.timerWrap}>
          <Text style={styles.timerValue}>{formatTime(secondsLeft)}</Text>
          <Text style={styles.timerLabel}>tempo restante</Text>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Status Badge */}
      <View style={[styles.statusBadge, { borderColor: cfg.color }]}>
        <Text style={styles.statusEmoji}>{cfg.emoji}</Text>
        <Text style={[styles.statusMsg, { color: cfg.color }]}>{cfg.message}</Text>
      </View>

      {/* Instructions */}
      {status === 'pending' && (
        <Text style={styles.instructions}>
          Mostre este código no balcão do parceiro para concluir sua compra
        </Text>
      )}

      {/* Limit display */}
      <View style={styles.limitRow}>
        <Text style={styles.limitLabel}>LIMITE DISPONÍVEL</Text>
        <Text style={styles.limitValue}>
          {limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Text>
      </View>

      {status !== 'pending' && (
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation?.navigate('Home')}
        >
          <Text style={styles.doneBtnText}>VOLTAR AO INÍCIO</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center' },

  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  backBtn: { color: '#FFD700', fontSize: 18, fontWeight: '600' },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
  },

  qrWrap: { alignItems: 'center', marginBottom: 24 },
  qrGlow: {
    width: QR_SIZE,
    height: QR_SIZE,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 20,
    backgroundColor: '#111',
  },
  qrPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  qrPlaceholderText: {
    color: '#FFD700',
    fontSize: 28,
    fontFamily: 'monospace',
    letterSpacing: 4,
    lineHeight: 40,
    textAlign: 'center',
  },
  tokenText: {
    color: '#444',
    fontSize: 12,
    marginTop: 12,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },

  timerWrap: { alignItems: 'center', marginBottom: 24, width: '100%', paddingHorizontal: 40 },
  timerValue: { color: '#FFD700', fontSize: 40, fontWeight: '900', letterSpacing: 4 },
  timerLabel: { color: '#666', fontSize: 12, letterSpacing: 2, marginTop: 4, marginBottom: 12 },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#222',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#FFD700', borderRadius: 2 },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  statusEmoji: { fontSize: 20 },
  statusMsg: { fontSize: 14, fontWeight: '700', letterSpacing: 1 },

  instructions: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
    marginBottom: 32,
  },

  limitRow: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 48,
  },
  limitLabel: {
    color: '#555',
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 4,
  },
  limitValue: { color: '#FFD700', fontSize: 24, fontWeight: '900' },

  doneBtn: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 48,
    position: 'absolute',
    bottom: 40,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  doneBtnText: { color: '#0A0A0A', fontWeight: '900', fontSize: 14, letterSpacing: 3 },
});
