CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"organization" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entry_values" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_id" integer NOT NULL,
	"field_definition_id" integer NOT NULL,
	"value_text" text,
	"value_number" numeric,
	"value_boolean" boolean
);
--> statement-breakpoint
CREATE TABLE "field_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"field_key" text NOT NULL,
	"field_label" text NOT NULL,
	"field_type" text NOT NULL,
	"scope" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_validations" (
	"id" serial PRIMARY KEY NOT NULL,
	"field_definition_id" integer NOT NULL,
	"required" boolean DEFAULT false,
	"min" numeric,
	"max" numeric,
	"options" text[]
);
--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_values" ADD CONSTRAINT "entry_values_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_values" ADD CONSTRAINT "entry_values_field_definition_id_field_definitions_id_fk" FOREIGN KEY ("field_definition_id") REFERENCES "public"."field_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_definitions" ADD CONSTRAINT "field_definitions_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_validations" ADD CONSTRAINT "field_validations_field_definition_id_field_definitions_id_fk" FOREIGN KEY ("field_definition_id") REFERENCES "public"."field_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "articles_name_idx" ON "articles" USING btree ("name");--> statement-breakpoint
CREATE INDEX "articles_organization_idx" ON "articles" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "articles_status_idx" ON "articles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "entries_article_id_idx" ON "entries" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX "entry_values_entry_id_idx" ON "entry_values" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX "entry_values_field_definition_id_idx" ON "entry_values" USING btree ("field_definition_id");--> statement-breakpoint
CREATE INDEX "field_definitions_article_id_idx" ON "field_definitions" USING btree ("article_id");