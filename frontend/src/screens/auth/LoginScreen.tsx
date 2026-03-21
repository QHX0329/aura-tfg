/**
 * Pantalla de inicio de sesión.
 *
 * Conectada a POST /auth/token/ a través de authService.login.
 * Tras obtener los tokens, llama a authService.getProfileWithToken() para recuperar
 * el objeto User completo y lo persiste en authStore + SecureStore.
 */

import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import { borderRadius, colors, shadows, spacing, textStyles } from "@/theme";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/api/authService";
import type { AuthStackParamList } from "@/navigation/types";

type LoginNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Login"
>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNavigationProp>();
  const { height } = useWindowDimensions();
  const isCompact = height <= 650;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Usuario o contraseña incorrectos");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResetMessage(null);

    try {
      const tokens = await authService.login(username.trim(), password);
      const profile = await authService.getProfileWithToken(tokens.access);

      const user = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
      };

      await useAuthStore.getState().login(tokens.access, tokens.refresh, user);
    } catch {
      setError("Usuario o contraseña incorrectos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!username.trim()) {
      setError("Introduce tu email para recuperar la contraseña");
      return;
    }

    try {
      await authService.requestPasswordReset(username.trim());
      setResetMessage("Si el email existe, recibirás instrucciones.");
      setError(null);
    } catch {
      setResetMessage("Si el email existe, recibirás instrucciones.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.inner}>
          <View style={[styles.header, isCompact && styles.headerCompact]}>
            <Image
              source={require("@/assets/logo.png")}
              style={[styles.logoImage, isCompact && styles.logoImageCompact]}
              resizeMode="contain"
            />
            <Text style={styles.title}>Bienvenido de vuelta</Text>
            <Text style={styles.subtitle}>Tu compra inteligente, con estilo premium</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Usuario</Text>
              <TextInput
                style={styles.input}
                placeholder="tu_usuario"
                placeholderTextColor={colors.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu contraseña"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {resetMessage ? (
              <Text style={styles.successText}>{resetMessage}</Text>
            ) : null}

            <TouchableOpacity
              testID="login-submit-button"
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
              accessibilityState={{ disabled: isLoading }}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.loginButtonText}>Iniciar sesión</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotLink}
              onPress={handleForgotPassword}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              disabled={isLoading}
            >
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate("Register")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              disabled={isLoading}
            >
              <Text style={styles.registerButtonText}>Crear una cuenta</Text>
            </TouchableOpacity>

            <View style={styles.socialWrap}>
              <Text style={styles.socialLabel}>o continúa con</Text>
              <View style={styles.socialRow}>
                <View style={styles.socialChip}>
                  <Text style={styles.socialChipText}>Google</Text>
                </View>
                <View style={styles.socialChip}>
                  <Text style={styles.socialChipText}>Apple</Text>
                </View>
              </View>
            </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  headerCompact: {
    marginBottom: spacing.md,
  },
  logoImage: {
    width: 220,
    height: 120,
    marginBottom: spacing.md,
  },
  logoImageCompact: {
    width: 160,
    height: 96,
    marginBottom: spacing.sm,
  },
  title: {
    ...textStyles.heading2,
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    ...textStyles.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.card,
  },
  form: {},
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...textStyles.label,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...textStyles.body,
    color: colors.text,
  },
  errorText: {
    ...textStyles.caption,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  successText: {
    ...textStyles.caption,
    color: colors.success,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    marginTop: spacing.md,
    minHeight: 44,
    justifyContent: "center",
    ...shadows.button,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    ...textStyles.button,
    color: colors.white,
  },
  forgotLink: {
    marginTop: spacing.md,
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  forgotText: {
    ...textStyles.caption,
    color: colors.secondary,
  },
  registerButton: {
    marginTop: spacing.sm,
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryTint,
  },
  registerButtonText: {
    ...textStyles.buttonSmall,
    color: colors.primary,
  },
  socialWrap: {
    marginTop: spacing.md,
    alignItems: "center",
  },
  socialLabel: {
    ...textStyles.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  socialRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  socialChip: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  socialChipText: {
    ...textStyles.labelSmall,
    color: colors.text,
  },
});
