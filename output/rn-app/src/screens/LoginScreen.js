import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { COLORS, globalStyles } from '../styles/theme';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const { control, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await api.login(data.username, data.password);
      if (response.code === 200 && response.data) {
        await login(response.data.token);
      } else {
        setErrorMsg(response.message || '登录失败');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.gradientTop}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarIcon}>👤</Text>
        </View>
        <Text style={styles.appName}>企业办公助手</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.welcome}>欢迎登录</Text>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxText}>{errorMsg}</Text>
          </View>
        ) : null}

        <Controller
          control={control}
          name="username"
          rules={{ required: '请输入用户名' }}
          defaultValue=""
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <View style={styles.fieldWrap}>
              <Text style={globalStyles.label}>用户名</Text>
              <TextInput
                style={[globalStyles.input, error && globalStyles.inputError]}
                placeholder="请输入用户名"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
              {error && <Text style={globalStyles.errorText}>{error.message}</Text>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{ required: '请输入密码' }}
          defaultValue=""
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <View style={styles.fieldWrap}>
              <Text style={globalStyles.label}>密码</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[globalStyles.input, error && globalStyles.inputError, { flex: 1 }]}
                  placeholder="请输入密码"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry={secureText}
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setSecureText(!secureText)}
                >
                  <Text style={styles.eyeText}>{secureText ? '👁' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
              {error && <Text style={globalStyles.errorText}>{error.message}</Text>}
            </View>
          )}
        />

        <TouchableOpacity
          style={[globalStyles.btnPrimary, styles.loginBtn, loading && { opacity: 0.5 }]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={globalStyles.btnPrimaryText}>登录</Text>
          )}
        </TouchableOpacity>

        <View style={styles.hintBox}>
          <Text style={styles.hintTitle}>测试账号</Text>
          <Text style={styles.hintText}>admin / admin123</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  gradientTop: {
    height: 200,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarIcon: { fontSize: 32 },
  appName: { color: COLORS.white, fontSize: 18, fontWeight: '600' },
  formCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginHorizontal: 24,
    marginTop: -32,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    maxHeight: 420,
  },
  welcome: {
    textAlign: 'center',
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  fieldWrap: { marginBottom: 16 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 10,
  },
  eyeText: { fontSize: 18 },
  loginBtn: { marginTop: 8 },
  errorBox: {
    backgroundColor: COLORS.dangerBg,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorBoxText: { color: COLORS.danger, fontSize: 14, textAlign: 'center' },
  hintBox: {
    backgroundColor: COLORS.blue50,
    borderRadius: 10,
    padding: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  hintTitle: { fontSize: 13, color: COLORS.textSecondary },
  hintText: { fontSize: 14, color: COLORS.primary, fontWeight: '500', marginTop: 2 },
});
