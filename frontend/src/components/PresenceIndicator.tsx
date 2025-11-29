import { usePresence } from "../lib/useProductionSocket";

export function PresenceIndicator() {
  const { activeUsers, isConnected, presence } = usePresence();

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="h-2 w-2 rounded-full bg-gray-400" />
        <span>Offline</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {presence.slice(0, 5).map((user) => (
          <div
            key={user.socketId}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-gray-700 to-gray-900 text-xs font-medium text-white"
            title={user.userName || "Anonymous"}
          >
            {user.userName ? user.userName.charAt(0).toUpperCase() : "?"}
          </div>
        ))}
        {presence.length > 5 && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-medium text-gray-600">
            +{presence.length - 5}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
        <span>
          {activeUsers} {activeUsers === 1 ? "user" : "users"} online
        </span>
      </div>
    </div>
  );
}
