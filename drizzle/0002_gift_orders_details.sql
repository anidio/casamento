ALTER TABLE "gift_orders" ADD COLUMN "gift_name" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "gift_orders" ADD COLUMN "code" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "weddings" ADD COLUMN "allow_free_amount" boolean DEFAULT false NOT NULL;