import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  PanResponder,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';

const { width } = Dimensions.get('window');
const SLIDER_TRACK = width - 64;
const THUMB_SIZE = 64;
const MAX_SLIDE = SLIDER_TRACK - THUMB_SIZE - 4;

interface PurchaseDetails {
  service: string;
  partner: string;
  totalAmount: number;
  installments: number;
  installmentAmount: number;
  transactionId: string;
}

export default function ContractScreen({ navigation, route }: any) {
  const details: PurchaseDetails = route?.params?.details ?? {
    service: 'Plano de Saúde Plus',
    partner: 'MedCare Saúde',
    totalAmount: 1200.0,
    installments: 12,
    installmentAmount: 100.0,
    transactionId: 'tx-demo-001',
  };

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const thumbX = useRef(new Animated.Value(0)).current;
  const slid = useRef(false);
  const confirmAnim = useRef(new Animated.Value(0)).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => termsAccepted && !confirmed,
    onMoveShouldSetPanResponder: () => termsAccepted && !confirmed,
    onPanResponderMove: (_, gs) => {
      const newX = Math.max(0, Math.min(gs.dx, MAX_SLIDE));
      thumbX.setValue(newX);
    },
    onPanResponderRelease: (_, gs) => {
      if (gs.dx >= MAX_SLIDE * 0.85) {
        // Confirmed!
        Animated.spring(thumbX, {
          toValue: MAX_SLIDE,
          useNativeDriver: false,
        }).start(() => handleConfirm());
        slid.current = true;
      } else {
        Animated.spring(thumbX, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  const handleConfirm = async () => {
    if (!termsAccepted) {
      Alert.alert('Atenção', 'Aceite os termos para prosseguir.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/v1/transactions/${details.transactionId}/approve`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      );
      if (!res.ok) throw new Error('Erro ao confirmar');
      setConfirmed(true);
      Animated.timing(confirmAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      setTimeout(() => navigation?.navigate('Home'), 2500);
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Não foi possível confirmar a compra');
      Animated.spring(thumbX, { toValue: 0, useNativeDriver: false }).start();
      slid.current = false;
    } finally {
      setLoading(false);
    }
  };

  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const fillWidth = thumbX.interpolate({
    inputRange: [0, MAX_SLIDE],
    outputRange: [THUMB_SIZE, SLIDER_TRACK],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CONFIRME SUA COMPRA</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardSection}>SERVIÇO</Text>
          <Text style={styles.cardValue}>{details.service}</Text>

          <View style={styles.divider} />

          <Text style={styles.cardSection}>PARCEIRO</Text>
          <Text style={styles.cardValue}>{details.partner}</Text>

          <View style={styles.divider} />

          <View style={styles.amountRow}>
            <View>
              <Text style={styles.cardSection}>VALOR TOTAL</Text>
              <Text style={styles.totalAmount}>{fmt(details.totalAmount)}</Text>
            </View>
            <View style={styles.installmentBadge}>
              <Text style={styles.installmentCount}>{details.installments}x</Text>
              <Text style={styles.installmentAmount}>{fmt(details.installmentAmount)}</Text>
              <Text style={styles.installmentLabel}>sem juros</Text>
            </View>
          </View>
        </View>

        {/* Installment Grid */}
        <Text style={styles.sectionTitle}>PARCELAS DO CONSIGNADO</Text>
        <View style={styles.installmentGrid}>
          {Array.from({ length: details.installments }, (_, i) => i + 1).map((n) => (
            <View key={n} style={styles.installmentCell}>
              <Text style={styles.cellN}>{n}x</Text>
              <Text style={styles.cellVal}>{fmt(details.installmentAmount)}</Text>
            </View>
          ))}
        </View>

        {/* Terms */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setTermsAccepted((v) => !v)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
            {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            Li e aceito os{' '}
            <Text style={styles.termsLink}>Termos de Crédito Consignado</Text> e autorizo o
            desconto em folha de pagamento nas condições acima.
          </Text>
        </TouchableOpacity>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Success overlay */}
      {confirmed && (
        <Animated.View style={[styles.successOverlay, { opacity: confirmAnim }]}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successText}>COMPRA APROVADA!</Text>
          <Text style={styles.successSub}>Redirecionando...</Text>
        </Animated.View>
      )}

      {/* Swipe Button */}
      {!confirmed && (
        <View style={styles.swipeWrap}>
          <View style={[styles.sliderTrack, !termsAccepted && styles.sliderDisabled]}>
            <Animated.View style={[styles.sliderFill, { width: fillWidth }]} />
            <Animated.View
              style={[styles.thumb, { transform: [{ translateX: thumbX }] }]}
              {...panResponder.panHandlers}
            >
              {loading ? (
                <ActivityIndicator color="#0A0A0A" size="small" />
              ) : (
                <Text style={styles.thumbArrow}>›</Text>
              )}
            </Animated.View>
            <Text style={styles.sliderLabel}>
              {termsAccepted ? 'DESLIZE PARA APROVAR' : 'ACEITE OS TERMOS'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  backBtn: { color: '#FFD700', fontSize: 28, fontWeight: '300', width: 40 },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
    flex: 1,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 24,
  },
  cardSection: { color: '#666', fontSize: 10, letterSpacing: 2, fontWeight: '700', marginBottom: 6 },
  cardValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#1E1E1E', marginVertical: 16 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  totalAmount: { color: '#FFD700', fontSize: 28, fontWeight: '900', marginTop: 4 },
  installmentBadge: {
    backgroundColor: '#1A1A00',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A00',
  },
  installmentCount: { color: '#FFD700', fontSize: 24, fontWeight: '900' },
  installmentAmount: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  installmentLabel: { color: '#666', fontSize: 10, letterSpacing: 1 },

  sectionTitle: {
    color: '#666',
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 12,
  },
  installmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 28,
  },
  installmentCell: {
    width: '22%',
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  cellN: { color: '#FFD700', fontSize: 13, fontWeight: '900' },
  cellVal: { color: '#888', fontSize: 10, marginTop: 2 },

  termsRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 8 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
  checkmark: { color: '#0A0A0A', fontWeight: '900', fontSize: 14 },
  termsText: { color: '#888', fontSize: 13, lineHeight: 20, flex: 1 },
  termsLink: { color: '#FFD700', fontWeight: '700' },

  swipeWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: '#0A0A0A',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  sliderTrack: {
    height: THUMB_SIZE + 4,
    backgroundColor: '#141414',
    borderRadius: (THUMB_SIZE + 4) / 2,
    borderWidth: 1,
    borderColor: '#2A2A00',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderDisabled: { borderColor: '#222', opacity: 0.4 },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#332B00',
    borderRadius: (THUMB_SIZE + 4) / 2,
  },
  thumb: {
    position: 'absolute',
    left: 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  thumbArrow: { color: '#0A0A0A', fontSize: 28, fontWeight: '900' },
  sliderLabel: {
    color: '#666',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
  },

  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,10,0.97)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  successEmoji: { fontSize: 72, marginBottom: 24 },
  successText: {
    color: '#00E676',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 12,
  },
  successSub: { color: '#666', fontSize: 14 },
});
