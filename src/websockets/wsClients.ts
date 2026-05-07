import WebSocket from "ws";

// Map banao — userId → WebSocket connection
export const clients = new Map<string, WebSocket>();