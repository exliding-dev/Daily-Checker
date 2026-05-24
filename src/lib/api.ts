/**
 * MAAG Daily Tracker - API Client
 * Connects the frontend to the WordPress REST API backend.
 * User identification: name + IP address (no login required)
 */

const API_BASE_URL =
  import.meta.env.PUBLIC_API_URL || "https://medinova.info/wp-json/maag-tracker/v1";

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    total: number;
    page: number;
    per_page: number;
    pages: number;
  };
}

interface UserData {
  uuid: string;
  name: string;
  ip_address?: string;
  device_id?: string;
  created_at?: string;
}

interface DailyCheckData {
  uuid: string;
  risk_level: "low" | "medium" | "high";
  total_score: number;
  max_score: number;
  score_percentage: number;
  triggers: string[];
  checked_at: string;
}

/**
 * Generate a persistent device ID for this browser
 */
function getDeviceId(): string {
  let deviceId = localStorage.getItem("maag_device_id");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("maag_device_id", deviceId);
  }
  return deviceId;
}

/**
 * Get stored user UUID
 */
function getUserUuid(): string | null {
  return localStorage.getItem("maag_user_uuid");
}

/**
 * Store user UUID
 */
function setUserUuid(uuid: string): void {
  localStorage.setItem("maag_user_uuid", uuid);
}

/**
 * Get user's public IP address
 */
async function getUserIpAddress(): Promise<string> {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip || "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Handle both /wp-json/ and ?rest_route= URL formats
  let url: string;
  if (API_BASE_URL.includes("?rest_route=")) {
    url = `${API_BASE_URL}${endpoint}`;
  } else {
    url = `${API_BASE_URL}${endpoint}`;
  }

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data: ApiResponse<T> = await response.json();
    return data;
  } catch (error) {
    console.error("[MAAG API] Request failed:", error);
    return {
      success: false,
      message: "Network error. Please check your connection.",
    };
  }
}

/**
 * Register a new user (no login — just name + IP address)
 */
export async function registerUser(name: string): Promise<ApiResponse<UserData>> {
  const deviceId = getDeviceId();
  const ipAddress = await getUserIpAddress();

  const response = await apiFetch<UserData>("/users/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      device_id: deviceId,
      ip_address: ipAddress,
    }),
  });

  if (response.success && response.data) {
    setUserUuid(response.data.uuid);
    localStorage.setItem("maag_user_name", name);
  }

  return response;
}

/**
 * Get user profile
 */
export async function getUser(): Promise<ApiResponse<UserData>> {
  const uuid = getUserUuid();
  if (!uuid) {
    return { success: false, message: "User not registered" };
  }

  return apiFetch<UserData>(`/users/${uuid}`);
}

/**
 * Submit a daily check result to the backend
 */
export async function submitDailyCheck(result: {
  riskLevel: "low" | "medium" | "high";
  totalScore: number;
  maxScore: number;
  triggers: string[];
  answers: Record<string, string>;
}): Promise<ApiResponse<DailyCheckData>> {
  const userUuid = getUserUuid();
  if (!userUuid) {
    return { success: false, message: "User not registered" };
  }

  return apiFetch<DailyCheckData>("/daily-checks", {
    method: "POST",
    body: JSON.stringify({
      user_uuid: userUuid,
      risk_level: result.riskLevel,
      total_score: result.totalScore,
      max_score: result.maxScore,
      triggers: result.triggers,
      answers: result.answers,
    }),
  });
}

/**
 * Get user's daily check history from the backend
 */
export async function getDailyCheckHistory(
  page = 1,
  perPage = 20
): Promise<ApiResponse<DailyCheckData[]>> {
  const userUuid = getUserUuid();
  if (!userUuid) {
    return { success: false, message: "User not registered" };
  }

  const separator = API_BASE_URL.includes("?") ? "&" : "?";
  return apiFetch<DailyCheckData[]>(
    `/daily-checks/${userUuid}${separator}page=${page}&per_page=${perPage}`
  );
}

/**
 * Delete a specific daily check entry
 */
export async function deleteDailyCheck(
  checkUuid: string
): Promise<ApiResponse<void>> {
  const userUuid = getUserUuid();
  if (!userUuid) {
    return { success: false, message: "User not registered" };
  }

  return apiFetch<void>(`/daily-checks/${checkUuid}/delete`, {
    method: "DELETE",
    body: JSON.stringify({ user_uuid: userUuid }),
  });
}

/**
 * Check if user is registered
 */
export function isUserRegistered(): boolean {
  return !!getUserUuid();
}

/**
 * Get the stored user UUID (for display purposes)
 */
export function getStoredUserUuid(): string | null {
  return getUserUuid();
}

/**
 * Get stored user name
 */
export function getStoredUserName(): string | null {
  return localStorage.getItem("maag_user_name");
}
