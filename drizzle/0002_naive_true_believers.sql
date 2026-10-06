ALTER TABLE "instructors" RENAME COLUMN "email" TO "username";--> statement-breakpoint
ALTER TABLE "instructors" DROP CONSTRAINT "instructors_email_unique";--> statement-breakpoint
ALTER TABLE "instructors" ADD CONSTRAINT "instructors_username_unique" UNIQUE("username");