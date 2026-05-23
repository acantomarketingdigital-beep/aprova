import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 64;

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  bg: string;
}

const MOCK_BANNERS: Banner[] = [
  {
    id: '1',
    title: 'Saúde & Bem-estar',
    subtitle: 'Planos de saúde a partir de 12x sem juros',
    cta: 'VER OFERTA',
    bg: '#1A1A00',
  },
  {
    id: '2',
    title: 'Educação',
    subtitle: 'Cursos profissionalizantes com desconto exclusivo',
    cta: 'SAIBA MAIS',
    bg: '#001A1A',
  },
  {
    id: '3',
    title: 'Flash Sale',
    subtitle: 'Eletrodomésticos em 12x — acaba hoje!',
    cta: 'APROVEITAR',
    bg: '#1A000A',
  },
];

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function HomeScreen({ navigation, route }: any) {
  const user = route?.params?.user ?? { email: 'Usuário' };
  const firstName = user.email?.split('@')[0] ?? 'Usuário';

  const [limit] = useState(3500.0);
  const [activeBanner, setActiveBanner] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {firstName} 👋</Text>
            <Text style={styles.greetingSub}>Seu crédito está pronto para usar</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn}>
            <Text style={styles.profileInitial}>{firstName[0].toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* Limit Card */}
        <Animated.View style={[styles.limitCard, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.limitLabel}>SEU LIMITE DISPONÍVEL</Text>
          <Text style={styles.limitValue}>{formatCurrency(limit)}</Text>
          <View style={styles.limitFooter}>
            <View style={styles.limitBar}>
              <View style={[styles.limitBarFill, { width: '65%' }]} />
            </View>
            <Text style={styles.limitBarLabel}>65% disponível</Text>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {[
            { icon: '📋', label: 'Extrato' },
            { icon: '🏪', label: 'Parceiros' },
            { icon: '💳', label: 'Cartão' },
            { icon: '❓', label: 'Ajuda' },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.quickBtn}>
              <Text style={styles.quickIcon}>{item.icon}</Text>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Banners */}
        <Text style={styles.sectionTitle}>OFERTAS EXCLUSIVAS</Text>

        <FlatList
          data={MOCK_BANNERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.bannerList}
          snapToInterval={BANNER_WIDTH + 16}
          decelerationRate="fast"
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / (BANNER_WIDTH + 16));
            setActiveBanner(idx);
          }}
          renderItem={({ item }) => (
            <View style={[styles.bannerCard, { backgroundColor: item.bg }]}>
              <Text style={styles.bannerTitle}>{item.title}</Text>
              <Text style={styles.bannerSub}>{item.subtitle}</Text>
              <TouchableOpacity style={styles.bannerCta}>
                <Text style={styles.bannerCtaText}>{item.cta}</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        <View style={styles.dotsRow}>
          {MOCK_BANNERS.map((_, i) => (
            <View key={i} style={[styles.dot, activeBanner === i && styles.dotActive]} />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.qrBtn}
          activeOpacity={0.9}
          onPress={() => navigation?.navigate('QRCode', { limit })}
        >
          <Text style={styles.qrBtnText}>[ GERAR QR CODE APROVA ]</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
  },
  greeting: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  greetingSub: { color: '#666', fontSize: 13, marginTop: 2 },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: { color: '#FFD700', fontWeight: '900', fontSize: 18 },

  limitCard: {
    marginHorizontal: 24,
    backgroundColor: '#111111',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#2A2A00',
  },
  limitLabel: {
    color: '#888',
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 12,
  },
  limitValue: {
    color: '#FFD700',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
  },
  limitFooter: { marginTop: 20 },
  limitBar: {
    height: 6,
    backgroundColor: '#222',
    borderRadius: 3,
    overflow: 'hidden',
  },
  limitBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  limitBarLabel: { color: '#666', fontSize: 12, marginTop: 8 },

  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginTop: 28,
    marginBottom: 32,
  },
  quickBtn: { alignItems: 'center', gap: 8 },
  quickIcon: { fontSize: 24 },
  quickLabel: { color: '#888', fontSize: 11, fontWeight: '600', letterSpacing: 1 },

  sectionTitle: {
    color: '#888',
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '700',
    paddingHorizontal: 24,
    marginBottom: 16,
  },

  bannerList: { paddingHorizontal: 24, gap: 16 },
  bannerCard: {
    width: BANNER_WIDTH,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2A2A00',
  },
  bannerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  bannerSub: { color: '#AAA', fontSize: 14, marginBottom: 20, lineHeight: 20 },
  bannerCta: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  bannerCtaText: { color: '#0A0A0A', fontWeight: '900', fontSize: 12, letterSpacing: 2 },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#333' },
  dotActive: { backgroundColor: '#FFD700', width: 18 },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 16,
    backgroundColor: '#0A0A0A',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  qrBtn: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  qrBtnText: {
    color: '#0A0A0A',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
