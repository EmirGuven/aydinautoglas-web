ALTER TABLE "theme" ADD COLUMN "color_surface" varchar(20) DEFAULT '#ffffff' NOT NULL;--> statement-breakpoint
ALTER TABLE "theme" ADD COLUMN "color_border" varchar(20) DEFAULT '#e2e8f0' NOT NULL;--> statement-breakpoint
ALTER TABLE "theme" ADD COLUMN "color_muted" varchar(20) DEFAULT '#64748b' NOT NULL;--> statement-breakpoint
ALTER TABLE "theme" ADD COLUMN "font_family_heading" varchar(255) DEFAULT 'system-ui, sans-serif' NOT NULL;--> statement-breakpoint
ALTER TABLE "theme" ADD COLUMN "radius_card" varchar(20) DEFAULT '0.5rem' NOT NULL;--> statement-breakpoint
ALTER TABLE "theme" ADD COLUMN "shadow_card" varchar(255) DEFAULT '0 1px 2px rgba(15, 23, 42, 0.08)' NOT NULL;--> statement-breakpoint
ALTER TABLE "theme" ADD COLUMN "shadow_elevated" varchar(255) DEFAULT '0 12px 28px rgba(15, 23, 42, 0.18)' NOT NULL;