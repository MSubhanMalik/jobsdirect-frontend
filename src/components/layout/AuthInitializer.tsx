import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import authService from "@/services/auth";

/**
 * Silently hydrates auth state on mount.
 * Does NOT block rendering — children render immediately.
 */
export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const hydrate = async () => {
      try {
        const user = await authService.getUserInfo();
        useAuthStore.getState().setUser(user);
      } catch {
        useAuthStore.getState().setUser(null);
      }
    };
    hydrate();
  }, []);

  return <>{children}</>;
}
