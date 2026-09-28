CREATE TABLE "not_found_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" varchar(500) NOT NULL,
	"hit_count" integer DEFAULT 1 NOT NULL,
	"first_seen_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "not_found_logs_path_unique" UNIQUE("path")
);
--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "short_answer" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "price_from_cents" integer;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "duration_minutes" integer;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "warranty" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "insurance_info" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "seo" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "author_name" varchar(255);--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "author_role" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "author_photo_media_id" uuid;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "short_answer" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "seo" jsonb DEFAULT '{}'::jsonb NOT NULL;