import { Platform } from "react-native";

const memoryFallback = new Map<string, string>();

function hasLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

async function getNativeSecureStore() {
  return import("expo-secure-store");
}

/**
 * Abstraccion de almacenamiento seguro con fallback web.
 * En web usa localStorage (o memoria si no esta disponible).
 */
export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    if (hasLocalStorage()) {
      return window.localStorage.getItem(key);
    }
    return memoryFallback.get(key) ?? null;
  }

  const SecureStore = await getNativeSecureStore();
  return SecureStore.getItemAsync(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    if (hasLocalStorage()) {
      window.localStorage.setItem(key, value);
      return;
    }
    memoryFallback.set(key, value);
    return;
  }

  const SecureStore = await getNativeSecureStore();
  await SecureStore.setItemAsync(key, value);
}

export async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    if (hasLocalStorage()) {
      window.localStorage.removeItem(key);
      return;
    }
    memoryFallback.delete(key);
    return;
  }

  const SecureStore = await getNativeSecureStore();
  await SecureStore.deleteItemAsync(key);
}