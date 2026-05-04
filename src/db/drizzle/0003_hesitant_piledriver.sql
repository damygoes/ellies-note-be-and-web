CREATE TABLE "health_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"metric_type" text NOT NULL,
	"value" double precision NOT NULL,
	"unit" text NOT NULL,
	"measured_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wearable_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"access_token" text,
	"access_token_secret" text,
	"provider_user_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_sync_at" timestamp with time zone,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "check_in_entries" ADD COLUMN "check_in_date" date;--> statement-breakpoint
ALTER TABLE "check_in_entries" ADD COLUMN "symptoms" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "check_in_entries" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "health_metrics" ADD CONSTRAINT "health_metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wearable_connections" ADD CONSTRAINT "wearable_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "health_metrics_user_metric_time_idx" ON "health_metrics" USING btree ("user_id","metric_type","measured_at");--> statement-breakpoint
CREATE INDEX "health_metrics_user_time_idx" ON "health_metrics" USING btree ("user_id","measured_at");--> statement-breakpoint
CREATE UNIQUE INDEX "wearable_connections_user_provider_idx" ON "wearable_connections" USING btree ("user_id","provider");--> statement-breakpoint
ALTER TABLE "check_in_entries" DROP COLUMN "pain_level";--> statement-breakpoint
ALTER TABLE "check_in_entries" DROP COLUMN "influenced_by";--> statement-breakpoint
ALTER TABLE "check_in_entries" DROP COLUMN "note";