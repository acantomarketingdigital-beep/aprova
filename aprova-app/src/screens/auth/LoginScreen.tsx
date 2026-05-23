import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';

const API_URL = 'http://localhost:3000/api/v1';

function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export default function LoginScreen({ navigation }: any) {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCPF = (text: string) => setCpf(maskCPF(text));

  const handleLogin = async () => {
    const rawCPF = cpf.replace(/\D/g, '');
    if (rawCPF.length !== 11 || password.length < 6) {
      Alert.alert('Atenção', 'Preencha CPF e senha corretamente.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cpf, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao entrar');

      navigation?.navigate('Home', { user: data.user });
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Falha na autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Text style={styles.logoText}>APROVA</Text>
          <Text style={styles.logoSub}>CRÉDITO CONSIGNADO</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={styles.input}
            value={cpf}
            onChangeText={handleCPF}
            placeholder="000.000.000-00"
            placeholderTextColor="#444"
            keyboardType="numeric"
            returnKeyType="next"
          />

          <Text style={[styles.label, { marginTop: 20 }]}>SENHA</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#444"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0A0A0A" />
            ) : (
              <Text style={styles.btnText}>ENTRAR</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 56,
  },
  logoText: {
    color: '#FFD700',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 8,
  },
  logoSub: {
    color: '#888',
    fontSize: 11,
    letterSpacing: 4,
    marginTop: 4,
    fontWeight: '600',
  },
  form: {
    width: '100%',
  },
  label: {
    color: '#888',
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  btn: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 32,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#0A0A0A',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
  },
  forgotWrap: {
    alignItems: 'center',
    marginTop: 24,
  },
  forgotText: {
    color: '#666',
    fontSize: 14,
  },
});
