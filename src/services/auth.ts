import axiosInstance, { setAccessToken } from "./AxiosService";
import { api } from "@/config/api";
import type {
  User,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  VerifyEmailPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "@/types/auth";

class AuthService {
  // Backend wraps all responses in { data, message, status, success }
  private unwrap(resData: any): any {
    return resData?.data !== undefined ? resData.data : resData;
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await axiosInstance.post<AuthResponse>(api.endpoints.LOGIN, payload);
    const result = this.unwrap(res.data);
    if (result.accessToken) setAccessToken(result.accessToken);
    return result;
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await axiosInstance.post<AuthResponse>(api.endpoints.REGISTER, payload);
    const result = this.unwrap(res.data);
    if (result.accessToken) setAccessToken(result.accessToken);
    return result;
  }

  async googleAuth(credential: string, role?: string): Promise<AuthResponse> {
    const res = await axiosInstance.post<AuthResponse>(api.endpoints.GOOGLE_AUTH, { credential, role });
    const result = this.unwrap(res.data);
    if (result.accessToken) setAccessToken(result.accessToken);
    return result;
  }

  async getUserInfo(): Promise<User> {
    const res = await axiosInstance.get<User>(api.endpoints.USER_INFO);
    return this.unwrap(res.data);
  }

  async updateUserInfo(updates: Partial<User>): Promise<User> {
    const res = await axiosInstance.put<User>(api.endpoints.USER_INFO, updates);
    return this.unwrap(res.data);
  }

  async verifyEmail(payload: VerifyEmailPayload): Promise<{ user: User }> {
    const res = await axiosInstance.post<AuthResponse>(api.endpoints.VERIFY_EMAIL, payload);
    const result = this.unwrap(res.data);
    if (result.accessToken) setAccessToken(result.accessToken);
    return { user: result.user || result };
  }

  async resendVerification(): Promise<any> {
    const res = await axiosInstance.post(api.endpoints.RESEND_VERIFICATION);
    return this.unwrap(res.data);
  }

  async forgotPassword(payload: ForgotPasswordPayload): Promise<any> {
    const res = await axiosInstance.post(api.endpoints.FORGOT_PASSWORD, payload);
    return this.unwrap(res.data);
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await axiosInstance.post(api.endpoints.RESET_PASSWORD, payload);
  }

  async logout(redirectTo: string = "/"): Promise<void> {
    try {
      await axiosInstance.get(api.endpoints.LOGOUT);
    } catch {
      // Ignore logout errors
    }
    setAccessToken(null);
    if (typeof window !== "undefined" && redirectTo) {
      window.location.assign(redirectTo);
    }
  }

  async deleteAccount(): Promise<void> {
    await axiosInstance.delete(api.endpoints.DELETE_ACCOUNT);
    setAccessToken(null);
    if (typeof window !== "undefined") {
      window.location.assign("/");
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getUserInfo();
      return true;
    } catch {
      return false;
    }
  }

  redirectToLogin(returnTo?: string) {
    if (typeof window === "undefined") return;
    const target = `/auth${returnTo ? `?redirect=${encodeURIComponent(returnTo)}` : ""}`;
    window.location.assign(target);
  }
}

export default new AuthService();
