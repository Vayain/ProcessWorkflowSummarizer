CREATE TABLE "agent_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"system_prompt" text NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documentations" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"format" text DEFAULT 'markdown' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"detail_level" text DEFAULT 'standard' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "screenshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"image_data" text NOT NULL,
	"description" text,
	"ai_analysis_status" text DEFAULT 'pending'
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'Untitled Session' NOT NULL,
	"start_time" timestamp DEFAULT now() NOT NULL,
	"end_time" timestamp,
	"capture_interval" integer DEFAULT 2 NOT NULL,
	"capture_area" text DEFAULT 'Full Browser Tab' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
