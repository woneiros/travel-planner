/**
 * API client for the Travel Planner backend
 */

import { auth } from "@clerk/nextjs/server";
import type {
  IngestRequest,
  IngestResponse,
  ChatRequest,
  ChatResponse,
  Session,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "APIError";
  }
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const { getToken } = await auth();
  const token = await getToken();

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  try {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(url, {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new APIError(
        errorData?.detail || `API request failed: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError("Network error occurred", 0, error);
  }
}

export const api = {
  /**
   * Ingest YouTube videos and extract places
   */
  async ingestVideos(data: IngestRequest): Promise<IngestResponse> {
    return fetchAPI<IngestResponse>("/api/ingest", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Send a chat message
   */
  async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    return fetchAPI<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Get session data by ID
   */
  async getSession(sessionId: string): Promise<Session> {
    return fetchAPI<Session>(`/api/session/${sessionId}`);
  },

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await fetchAPI(`/api/session/${sessionId}`, {
      method: "DELETE",
    });
  },
};

export { APIError };
