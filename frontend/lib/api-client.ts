/**
 * Client-side API client for the Travel Planner backend
 * Uses client-side auth from Clerk
 */

"use client";

import { useAuth } from "@clerk/nextjs";
import type {
  IngestRequest,
  IngestResponse,
  ChatRequest,
  ChatResponse,
  Session,
  UpdatePlacePreferenceRequest,
  Place,
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

async function fetchAPI<T>(
  endpoint: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
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

/**
 * Hook to use authenticated API client in client components
 */
export function useApi() {
  const { getToken } = useAuth();

  return {
    async ingestVideos(data: IngestRequest): Promise<IngestResponse> {
      const token = await getToken();
      return fetchAPI<IngestResponse>("/api/ingest", token, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async sendMessage(data: ChatRequest): Promise<ChatResponse> {
      const token = await getToken();
      return fetchAPI<ChatResponse>("/api/chat", token, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async getSession(sessionId: string): Promise<Session> {
      const token = await getToken();
      return fetchAPI<Session>(`/api/session/${sessionId}`, token);
    },

    async deleteSession(sessionId: string): Promise<void> {
      const token = await getToken();
      await fetchAPI(`/api/session/${sessionId}`, token, {
        method: "DELETE",
      });
    },

    async updatePlacePreference(
      data: UpdatePlacePreferenceRequest
    ): Promise<Place> {
      const token = await getToken();
      return fetchAPI<Place>("/api/places/preference", token, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
  };
}

export { APIError };
