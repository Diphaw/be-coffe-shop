import Pusher from "pusher";

// Pastikan semua env variable tersedia
const requiredEnvs = [
  "PUSHER_APP_ID",
  "PUSHER_KEY",
  "PUSHER_SECRET",
  "PUSHER_CLUSTER",
] as const;

for (const env of requiredEnvs) {
  if (!process.env[env]) {
    console.warn(`⚠️  Missing env: ${env} — Pusher notifications will not work`);
  }
}

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID ?? "",
  key: process.env.PUSHER_KEY ?? "",
  secret: process.env.PUSHER_SECRET ?? "",
  cluster: process.env.PUSHER_CLUSTER ?? "ap1",
  useTLS: true,
});

// Channel & Event constants — hindari typo string
export const PUSHER_CHANNELS = {
  ORDERS: "orders",
  KITCHEN: "kitchen",
} as const;

export const PUSHER_EVENTS = {
  NEW_ORDER: "new-order",
  ORDER_STATUS_UPDATED: "order-status-updated",
  TABLE_STATUS_UPDATED: "table-status-updated",
} as const;

export default pusher;
