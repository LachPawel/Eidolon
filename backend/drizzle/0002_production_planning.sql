ALTER TABLE "entries" ADD COLUMN "status" text DEFAULT 'PREPARATION' NOT NULL;--> statement-breakpoint
ALTER TABLE "entries" ADD COLUMN "priority" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "entries" ADD COLUMN "started_at" timestamp;--> statement-breakpoint
ALTER TABLE "entries" ADD COLUMN "completed_at" timestamp;