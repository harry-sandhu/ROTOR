CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" text NOT NULL,
	"role" text DEFAULT 'USER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "build_components" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"build_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"category_key" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "build_evaluations" (
	"build_id" uuid PRIMARY KEY NOT NULL,
	"compatibility_score" integer NOT NULL,
	"validation_status" text NOT NULL,
	"total_cost_cents" integer NOT NULL,
	"missing_categories" jsonb NOT NULL,
	"warnings" jsonb NOT NULL,
	"issues" jsonb NOT NULL,
	"evaluated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "builds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"visibility" text DEFAULT 'PRIVATE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"key" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"alt_text" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"brand" text NOT NULL,
	"category_key" text NOT NULL,
	"description" text,
	"price_cents" integer NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"thumbnail_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compatibility_rule_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"from_category_key" text NOT NULL,
	"to_category_key" text NOT NULL,
	"left_specification_id" uuid NOT NULL,
	"operator" text NOT NULL,
	"right_specification_id" uuid NOT NULL,
	"severity_on_fail" text NOT NULL,
	"success_message_template" text,
	"failure_message_template" text NOT NULL,
	"warning_threshold_json" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category_specifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_key" text NOT NULL,
	"specification_id" uuid NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"is_filterable" boolean DEFAULT false NOT NULL,
	"is_visible_on_card" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_spec_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"specification_id" uuid NOT NULL,
	"raw_value" text NOT NULL,
	"numeric_value" numeric(12, 4),
	"text_value" text,
	"boolean_value" boolean,
	"range_min" numeric(12, 4),
	"range_max" numeric(12, 4),
	"json_value" jsonb,
	"normalized_unit" text,
	"normalized_label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "specification_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"data_type" text NOT NULL,
	"unit" text,
	"validation_json" jsonb NOT NULL,
	"search_weight" integer DEFAULT 0 NOT NULL,
	"is_filterable" boolean DEFAULT false NOT NULL,
	"is_searchable" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "build_components" ADD CONSTRAINT "build_components_build_id_builds_id_fk" FOREIGN KEY ("build_id") REFERENCES "public"."builds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "build_components" ADD CONSTRAINT "build_components_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "build_components" ADD CONSTRAINT "build_components_category_key_categories_key_fk" FOREIGN KEY ("category_key") REFERENCES "public"."categories"("key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "build_evaluations" ADD CONSTRAINT "build_evaluations_build_id_builds_id_fk" FOREIGN KEY ("build_id") REFERENCES "public"."builds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "builds" ADD CONSTRAINT "builds_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_key_categories_key_fk" FOREIGN KEY ("category_key") REFERENCES "public"."categories"("key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compatibility_rule_definitions" ADD CONSTRAINT "compatibility_rule_definitions_from_category_key_categories_key_fk" FOREIGN KEY ("from_category_key") REFERENCES "public"."categories"("key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compatibility_rule_definitions" ADD CONSTRAINT "compatibility_rule_definitions_to_category_key_categories_key_fk" FOREIGN KEY ("to_category_key") REFERENCES "public"."categories"("key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compatibility_rule_definitions" ADD CONSTRAINT "compatibility_rule_definitions_left_specification_id_specification_definitions_id_fk" FOREIGN KEY ("left_specification_id") REFERENCES "public"."specification_definitions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compatibility_rule_definitions" ADD CONSTRAINT "compatibility_rule_definitions_right_specification_id_specification_definitions_id_fk" FOREIGN KEY ("right_specification_id") REFERENCES "public"."specification_definitions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_specifications" ADD CONSTRAINT "category_specifications_category_key_categories_key_fk" FOREIGN KEY ("category_key") REFERENCES "public"."categories"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_specifications" ADD CONSTRAINT "category_specifications_specification_id_specification_definitions_id_fk" FOREIGN KEY ("specification_id") REFERENCES "public"."specification_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_spec_values" ADD CONSTRAINT "product_spec_values_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_spec_values" ADD CONSTRAINT "product_spec_values_specification_id_specification_definitions_id_fk" FOREIGN KEY ("specification_id") REFERENCES "public"."specification_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "build_components_build_category_unique_idx" ON "build_components" USING btree ("build_id","category_key");--> statement-breakpoint
CREATE INDEX "build_components_product_idx" ON "build_components" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "build_evaluations_status_idx" ON "build_evaluations" USING btree ("validation_status");--> statement-breakpoint
CREATE INDEX "builds_user_idx" ON "builds" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "builds_visibility_idx" ON "builds" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "product_images_product_idx" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_unique_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_category_status_idx" ON "products" USING btree ("category_key","status");--> statement-breakpoint
CREATE INDEX "products_brand_category_idx" ON "products" USING btree ("brand","category_key");--> statement-breakpoint
CREATE UNIQUE INDEX "compatibility_rule_definitions_key_unique_idx" ON "compatibility_rule_definitions" USING btree ("key");--> statement-breakpoint
CREATE INDEX "compatibility_rule_definitions_category_pair_idx" ON "compatibility_rule_definitions" USING btree ("from_category_key","to_category_key","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "category_specifications_category_spec_unique_idx" ON "category_specifications" USING btree ("category_key","specification_id");--> statement-breakpoint
CREATE INDEX "category_specifications_category_idx" ON "category_specifications" USING btree ("category_key");--> statement-breakpoint
CREATE UNIQUE INDEX "product_spec_values_product_spec_unique_idx" ON "product_spec_values" USING btree ("product_id","specification_id");--> statement-breakpoint
CREATE INDEX "product_spec_values_spec_numeric_idx" ON "product_spec_values" USING btree ("specification_id","numeric_value");--> statement-breakpoint
CREATE INDEX "product_spec_values_spec_text_idx" ON "product_spec_values" USING btree ("specification_id","text_value");--> statement-breakpoint
CREATE INDEX "product_spec_values_spec_range_idx" ON "product_spec_values" USING btree ("specification_id","range_min","range_max");--> statement-breakpoint
CREATE UNIQUE INDEX "specification_definitions_key_unique_idx" ON "specification_definitions" USING btree ("key");