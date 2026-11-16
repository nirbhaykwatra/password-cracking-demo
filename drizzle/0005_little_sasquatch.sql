ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "credit_card" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address" text NOT NULL;