import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

// ============================================
// TYPES
// ============================================

export interface PresenceUser {
  socketId: string;
  userName?: string;
  joinedAt: number;
}

export interface ProductionEvent {
  type: "ENTRY_CREATED" | "ENTRY_UPDATED" | "ENTRY_DELETED" | "STATUS_CHANGED";
  entryId: number;
  data: Record<string, unknown>;
  userId?: string;
  timestamp: number;
}

interface UseProductionSocketOptions {
  userName?: string;
  onEvent?: (event: ProductionEvent) => void;
  autoConnect?: boolean;
}

// ============================================
// SOCKET CONNECTION
// ============================================

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Singleton socket instance with proper cleanup tracking
let globalSocket: Socket | null = null;
let connectionCount = 0;

function getOrCreateSocket(): Socket {
  if (!globalSocket) {
    globalSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return globalSocket;
}

// ============================================
// useProductionSocket - Main hook for real-time production board
// ============================================

export function useProductionSocket(options: UseProductionSocketOptions = {}) {
  const { userName, onEvent, autoConnect = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [presence, setPresence] = useState<PresenceUser[]>([]);
  const [lastEvent, setLastEvent] = useState<ProductionEvent | null>(null);
  const eventCallbackRef = useRef(onEvent);
  const hasJoinedRef = useRef(false);

  // Keep callback ref updated
  useEffect(() => {
    eventCallbackRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!autoConnect) return;

    const socket = getOrCreateSocket();
    connectionCount++;

    // Connection handlers
    const handleConnect = () => {
      console.log("[Socket] Connected");
      setIsConnected(true);
      // Join room and request initial presence
      socket.emit("join:production", { userName });
      socket.emit("get:presence");
      hasJoinedRef.current = true;
    };

    const handleDisconnect = (reason: string) => {
      console.log("[Socket] Disconnected:", reason);
      setIsConnected(false);
      hasJoinedRef.current = false;
    };

    const handleConnectError = (error: Error) => {
      console.error("[Socket] Connection error:", error.message);
      setIsConnected(false);
    };

    // Presence update handler
    const handlePresenceUpdate = (users: PresenceUser[]) => {
      console.log("[Socket] Presence update:", users.length, "users");
      setPresence(users);
    };

    // Production event handler
    const handleProductionEvent = (event: ProductionEvent) => {
      setLastEvent(event);
      eventCallbackRef.current?.(event);
    };

    // Register handlers
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("presence:update", handlePresenceUpdate);
    socket.on("production:event", handleProductionEvent);

    // Connect if not already connected
    if (!socket.connected) {
      socket.connect();
    } else if (!hasJoinedRef.current) {
      // Already connected but haven't joined, join now
      socket.emit("join:production", { userName });
      socket.emit("get:presence");
      hasJoinedRef.current = true;
      setIsConnected(true);
    }

    // Heartbeat to keep presence alive (every 45 seconds, before 2min TTL)
    const heartbeatInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit("heartbeat");
      }
    }, 45000);

    return () => {
      clearInterval(heartbeatInterval);
      connectionCount--;

      // Only fully cleanup if this is the last subscriber
      if (connectionCount === 0) {
        socket.emit("leave:production");
        hasJoinedRef.current = false;
      }

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("presence:update", handlePresenceUpdate);
      socket.off("production:event", handleProductionEvent);
    };
  }, [autoConnect, userName]);

  return {
    isConnected,
    presence,
    lastEvent,
    activeUsers: presence.length,
  };
}

// ============================================
// usePresence - Just presence tracking
// ============================================

export function usePresence() {
  const { presence, isConnected, activeUsers } = useProductionSocket();
  return { presence, isConnected, activeUsers };
}

// ============================================
// useProductionEvents - Subscribe to production events with callback
// ============================================

export function useProductionEvents(onEvent: (event: ProductionEvent) => void) {
  const { isConnected, lastEvent } = useProductionSocket({ onEvent });
  return { isConnected, lastEvent };
}

// ============================================
// useAutoRefresh - Auto-refresh data when production events occur
// ============================================

export function useAutoRefresh(refetchFn: () => void, eventTypes?: ProductionEvent["type"][]) {
  const handleEvent = useCallback(
    (event: ProductionEvent) => {
      // If no specific types provided, refresh on all events
      if (!eventTypes || eventTypes.includes(event.type)) {
        refetchFn();
      }
    },
    [refetchFn, eventTypes]
  );

  return useProductionEvents(handleEvent);
}
