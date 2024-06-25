DO $$ BEGIN
 CREATE TYPE "public"."provider_type" AS ENUM('Farcaster', 'Twitter');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airdrop_participant" (
	"id" serial PRIMARY KEY NOT NULL,
	"airdrop_id" text NOT NULL,
	"receiver_id" text NOT NULL,
	"points" integer NOT NULL,
	"signature" text NOT NULL,
	"claimable_amount" bigint NOT NULL,
	"claimed" boolean DEFAULT false,
	"claimed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "airdrop_participant_signature_unique" UNIQUE("signature")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airdrop" (
	"id" serial PRIMARY KEY NOT NULL,
	"tip_engine_id" text NOT NULL,
	"token_amount" bigint NOT NULL,
	"claim_date" timestamp NOT NULL,
	"points_to_token_ratio" integer NOT NULL,
	"min_tokens" integer NOT NULL,
	"min_tokens_duration" integer NOT NULL,
	"min_casts" integer NOT NULL,
	"require_account_created_before_tip_engine" boolean DEFAULT false,
	"custom_api_requirement" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feature_flags" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "feature_flags_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tip_engine" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"webhook_id" text NOT NULL,
	"webhook_active" boolean DEFAULT false,
	"token_contract" text NOT NULL,
	"tip_string" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tip_engine_tip_string_unique" UNIQUE("tip_string")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tip_post" (
	"id" text PRIMARY KEY NOT NULL,
	"provider_type" "provider_type" NOT NULL,
	"tip_engine_id" text NOT NULL,
	"amount_tipped" integer NOT NULL,
	"receiver_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"approved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"is_subscribed" boolean DEFAULT false,
	"subscription_tier" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "webhook_log" (
	"id" text PRIMARY KEY NOT NULL,
	"webhook_event" text NOT NULL,
	"webhook_payload" text NOT NULL,
	"processed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);