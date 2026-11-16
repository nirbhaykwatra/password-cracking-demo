ALTER TABLE "users" RENAME COLUMN "address" TO "card_exp_month";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "card_exp_year" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "card_cvc" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address_line_1" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address_line_2" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address_city" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address_state" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address_zip" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address_country" text NOT NULL;