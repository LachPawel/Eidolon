import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { getRedisClient } from "./redis.js";

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

// ============================================
// CONSTANTS
// ============================================

const PRESENCE_KEY = "presence:production";
const PRESENCE_TTL = 60; // 60 seconds
const PRODUCTION_CHANNEL = "production:events";

// ============================================
// SOCKET.IO SERVER
// ============================================

let io: SocketIOServer | null = null;

export function getSocketIO(): SocketIOServer | null {
  return io;
}

export function initializeSocketIO(
  httpServer: HttpServer,
  allowedOrigins: string[]
): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Handle joining production room
    socket.on("join:production", async (userData: { userId?: string; userName?: string }) => {
      socket.join("production");

      // Add to presence
      await addPresence(socket.id, userData.userName);

      // Broadcast updated presence list
      const presence = await getPresence();
      io?.to("production").emit("presence:update", presence);

      console.log(`[Socket.IO] ${socket.id} joined production room`);
    });

    // Handle leaving production room
    socket.on("leave:production", async () => {
      socket.leave("production");
      await removePresence(socket.id);

      const presence = await getPresence();
      io?.to("production").emit("presence:update", presence);
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      await removePresence(socket.id);

      const presence = await getPresence();
      io?.to("production").emit("presence:update", presence);

      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });

    // Heartbeat to keep presence alive
    socket.on("heartbeat", async () => {
      await refreshPresence(socket.id);
    });
  });

  // Subscribe to Redis Pub/Sub for production events
  subscribeToProductionEvents();

  console.log("[Socket.IO] Server initialized");
  return io;
}

// ============================================
// PRESENCE SYSTEM
// ============================================

async function addPresence(socketId: string, userName?: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    const user: PresenceUser = {
      socketId: socketId,
      userName: userName,
      joinedAt: Date.now(),
    };
    await client.hset(PRESENCE_KEY, socketId, JSON.stringify(user));
    await client.expire(PRESENCE_KEY, PRESENCE_TTL * 2);
  } catch (error) {
    console.error("[Presence] Error adding presence:", error);
  }
}

async function removePresence(socketId: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    await client.hdel(PRESENCE_KEY, socketId);
  } catch (error) {
    console.error("[Presence] Error removing presence:", error);
  }
}

async function refreshPresence(socketId: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    const existing = await client.hget(PRESENCE_KEY, socketId);
    if (existing) {
      const user = JSON.parse(existing) as PresenceUser;
      user.joinedAt = Date.now();
      await client.hset(PRESENCE_KEY, socketId, JSON.stringify(user));
    }
  } catch (error) {
    console.error("[Presence] Error refreshing presence:", error);
  }
}

export async function getPresence(): Promise<PresenceUser[]> {
  const client = getRedisClient();
  if (!client) return [];

  try {
    const all = await client.hgetall(PRESENCE_KEY);
    const now = Date.now();
    const users: PresenceUser[] = [];

    for (const [socketId, data] of Object.entries(all)) {
      try {
        const user = JSON.parse(data) as PresenceUser;
        // Filter out stale entries (older than TTL)
        if (now - user.joinedAt < PRESENCE_TTL * 1000) {
          users.push(user);
        } else {
          // Clean up stale entry
          await client.hdel(PRESENCE_KEY, socketId);
        }
      } catch {
        // Invalid JSON, remove it
        await client.hdel(PRESENCE_KEY, socketId);
      }
    }

    return users;
  } catch (error) {
    console.error("[Presence] Error getting presence:", error);
    return [];
  }
}

// ============================================
// PUB/SUB FOR PRODUCTION EVENTS
// ============================================

let subscriber: ReturnType<typeof getRedisClient> = null;

async function subscribeToProductionEvents(): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    // Create a duplicate connection for subscribing
    subscriber = client.duplicate();

    subscriber.on("message", (channel: string, message: string) => {
      if (channel === PRODUCTION_CHANNEL) {
        try {
          const event = JSON.parse(message) as ProductionEvent;
          // Broadcast to all clients in the production room
          io?.to("production").emit("production:event", event);
        } catch (error) {
          console.error("[Pub/Sub] Error parsing event:", error);
        }
      }
    });

    await subscriber.subscribe(PRODUCTION_CHANNEL);

    console.log("[Pub/Sub] Subscribed to production events");
  } catch (error) {
    console.error("[Pub/Sub] Error subscribing:", error);
  }
}

/**
 * Publish a production event to all connected clients
 */
export async function publishProductionEvent(
  event: Omit<ProductionEvent, "timestamp">
): Promise<void> {
  const client = getRedisClient();

  const fullEvent: ProductionEvent = {
    ...event,
    timestamp: Date.now(),
  };

  // If Redis is available, use Pub/Sub (works across multiple server instances)
  if (client) {
    try {
      await client.publish(PRODUCTION_CHANNEL, JSON.stringify(fullEvent));
    } catch (error) {
      console.error("[Pub/Sub] Error publishing event:", error);
    }
  } else {
    // Fallback: broadcast directly via Socket.IO (single server only)
    io?.to("production").emit("production:event", fullEvent);
  }
}

// ============================================
// HELPER FUNCTIONS FOR ROUTERS
// ============================================

export const ProductionEvents = {
  entryCreated: (entryId: number, data: Record<string, unknown>, userId?: string) =>
    publishProductionEvent({ type: "ENTRY_CREATED", entryId, data, userId }),

  entryUpdated: (entryId: number, data: Record<string, unknown>, userId?: string) =>
    publishProductionEvent({ type: "ENTRY_UPDATED", entryId, data, userId }),

  entryDeleted: (entryId: number, userId?: string) =>
    publishProductionEvent({ type: "ENTRY_DELETED", entryId, data: {}, userId }),

  statusChanged: (entryId: number, oldStatus: string, newStatus: string, userId?: string) =>
    publishProductionEvent({
      type: "STATUS_CHANGED",
      entryId,
      data: { oldStatus, newStatus },
      userId,
    }),
};
