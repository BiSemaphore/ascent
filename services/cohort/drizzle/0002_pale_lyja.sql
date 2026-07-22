ALTER TABLE "cohorts" ADD COLUMN "price" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "cohorts" ADD COLUMN "currency" text DEFAULT 'usd' NOT NULL;