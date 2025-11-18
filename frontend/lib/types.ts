/**
 * TypeScript types for the Travel Planner API
 */

export type PlaceType =
  | "restaurant"
  | "attraction"
  | "hotel"
  | "activity"
  | "coffee_shop"
  | "shopping"
  | "other";

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  description: string;
  video_id: string;
  timestamp_seconds: number | null;
  mentioned_context: string;
  address: string | null;
  neighborhood: string | null;
  created_at: string;
}

export interface Video {
  video_id: string;
  title: string;
  description: string | null;
  duration_seconds: number;
  transcript: string;
  summary: string;
  url: string;
  places_count: number;
}

export interface VideoSummary {
  video_id: string;
  title: string;
  summary: string;
  places_count: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  places_referenced: string[];
}

export interface Session {
  session_id: string;
  videos: Video[];
  places: Place[];
  chat_history: ChatMessage[];
  created_at: string;
  last_activity: string;
}

// API Request/Response types
export interface IngestRequest {
  video_urls: string[];
}

export interface IngestResponse {
  session_id: string;
  videos: Video[];
  total_places: number;
  processing_time_ms: number;
}

export interface ChatRequest {
  session_id: string;
  message: string;
  llm_provider: "openai" | "anthropic";
}

export interface ChatSource {
  video_id: string;
  title: string;
  timestamp: number;
}

export interface ChatResponse {
  message: string;
  places_referenced: string[];
  sources: ChatSource[];
}
