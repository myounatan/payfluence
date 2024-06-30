DO $$ BEGIN
 CREATE TYPE "public"."provider_type" AS ENUM('Farcaster', 'Twitter');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airdrop_participant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tip_engine_user_id" uuid NOT NULL,
	"tip_engine_id" uuid NOT NULL,
	"airdrop_id" uuid NOT NULL,
	"receiver_id" text NOT NULL,
	"wallet_address" text NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"signature" text,
	"claimable_amount" bigint NOT NULL,
	"claimed" boolean DEFAULT false,
	"claimed_at" timestamp,
	"claimed_transaction_hash" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "airdrop_participant_signature_unique" UNIQUE("signature")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "airdrop" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tip_engine_id" uuid NOT NULL,
	"token_amount" bigint NOT NULL,
	"start_date" timestamp NOT NULL,
	"claim_start_date" timestamp NOT NULL,
	"claim_end_date" timestamp,
	"points_to_token_ratio" integer DEFAULT 1,
	"min_tokens" integer DEFAULT 0,
	"min_tokens_duration" integer DEFAULT 0,
	"min_casts" integer DEFAULT 0,
	"require_legacy_account" boolean DEFAULT false,
	"require_power_badge" boolean DEFAULT false,
	"custom_api_requirement" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feature_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "feature_flags_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_id_subscription_tier_map" (
	"id" text PRIMARY KEY NOT NULL,
	"subscription_tier" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "restricted_tip_strings" (
	"tip_string" text PRIMARY KEY NOT NULL,
	"restricted" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscription_tier_features" (
	"id" integer PRIMARY KEY NOT NULL,
	"feature_json" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tip_engine" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"user_id" uuid NOT NULL,
	"chain_id" integer NOT NULL,
	"webhook_id" text NOT NULL,
	"webhook_active" boolean DEFAULT false NOT NULL,
	"webhook_secret" text,
	"slug" text NOT NULL,
	"owner_address" text NOT NULL,
	"token_contract" text NOT NULL,
	"token_decimals" integer NOT NULL,
	"token_name" text NOT NULL,
	"token_symbol" text NOT NULL,
	"tip_string" text NOT NULL,
	"public_timeline" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tip_engine_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tip_engine_tip_string_unique" UNIQUE("tip_string")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tip_post" (
	"id" text PRIMARY KEY NOT NULL,
	"provider_type" "provider_type" NOT NULL,
	"tip_engine_id" uuid NOT NULL,
	"airdrop_id" uuid NOT NULL,
	"amount_tipped" integer NOT NULL,
	"receiver_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"receiver_avatar_url" text,
	"sender_avatar_url" text,
	"receiver_username" text,
	"sender_username" text,
	"receiver_display_name" text,
	"sender_display_name" text,
	"approved" boolean DEFAULT false,
	"rejected_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"is_subscribed" boolean DEFAULT false,
	"subscription_tier" integer DEFAULT 0,
	"subscription_product_id" text,
	"subscription_expires_at" timestamp,
	"customer_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "webhook_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"webhook_id" text NOT NULL,
	"webhook_type" text NOT NULL,
	"webhook_payload" text NOT NULL,
	"processed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
