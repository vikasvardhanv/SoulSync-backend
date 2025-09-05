-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "soulsync";

-- CreateTable
CREATE TABLE "soulsync"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "bio" TEXT,
    "location" TEXT,
    "interests" TEXT[],
    "photos" TEXT[],
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soulsync"."matches" (
    "id" TEXT NOT NULL,
    "user_initiator_id" TEXT NOT NULL,
    "user_receiver_id" TEXT NOT NULL,
    "compatibility_score" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soulsync"."messages" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soulsync"."questions" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" JSONB,
    "min_value" INTEGER,
    "max_value" INTEGER,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "emoji" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soulsync"."user_answers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soulsync"."subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "paypal_subscription_id" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soulsync"."payments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "payment_id" TEXT,
    "order_id" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "pay_currency" TEXT,
    "status" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT,
    "description" TEXT,
    "payment_url" TEXT,
    "type" TEXT DEFAULT 'one_time',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soulsync"."refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soulsync"."user_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "phone_number" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "gender" TEXT,
    "looking_for" TEXT,
    "relationship_type" TEXT,
    "education" TEXT,
    "occupation" TEXT,
    "height" TEXT,
    "religion" TEXT,
    "smoking_status" TEXT,
    "drinking_status" TEXT,
    "has_children" BOOLEAN,
    "wants_children" BOOLEAN,
    "profile_complete" BOOLEAN NOT NULL DEFAULT false,
    "last_active" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soulsync"."match_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "min_age" INTEGER,
    "max_age" INTEGER,
    "max_distance" INTEGER,
    "preferred_gender" TEXT,
    "deal_breakers" TEXT[],
    "must_haves" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soulsync"."blocked_users" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "blocked_id" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocked_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soulsync"."reports" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "reported_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "soulsync"."users"("email");

-- CreateIndex
CREATE INDEX "matches_user_initiator_id_idx" ON "soulsync"."matches"("user_initiator_id");

-- CreateIndex
CREATE INDEX "matches_user_receiver_id_idx" ON "soulsync"."matches"("user_receiver_id");

-- CreateIndex
CREATE INDEX "matches_status_idx" ON "soulsync"."matches"("status");

-- CreateIndex
CREATE UNIQUE INDEX "matches_user_initiator_id_user_receiver_id_key" ON "soulsync"."matches"("user_initiator_id", "user_receiver_id");

-- CreateIndex
CREATE INDEX "messages_sender_id_receiver_id_idx" ON "soulsync"."messages"("sender_id", "receiver_id");

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "soulsync"."messages"("created_at");

-- CreateIndex
CREATE INDEX "messages_is_read_idx" ON "soulsync"."messages"("is_read");

-- CreateIndex
CREATE INDEX "questions_category_idx" ON "soulsync"."questions"("category");

-- CreateIndex
CREATE INDEX "questions_is_active_idx" ON "soulsync"."questions"("is_active");

-- CreateIndex
CREATE INDEX "questions_weight_idx" ON "soulsync"."questions"("weight");

-- CreateIndex
CREATE INDEX "user_answers_user_id_idx" ON "soulsync"."user_answers"("user_id");

-- CreateIndex
CREATE INDEX "user_answers_question_id_idx" ON "soulsync"."user_answers"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_answers_user_id_question_id_key" ON "soulsync"."user_answers"("user_id", "question_id");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_idx" ON "soulsync"."subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "soulsync"."subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_expires_at_idx" ON "soulsync"."subscriptions"("expires_at");

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "soulsync"."payments"("user_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "soulsync"."payments"("status");

-- CreateIndex
CREATE INDEX "payments_provider_idx" ON "soulsync"."payments"("provider");

-- CreateIndex
CREATE INDEX "payments_payment_id_idx" ON "soulsync"."payments"("payment_id");

-- CreateIndex
CREATE INDEX "payments_order_id_idx" ON "soulsync"."payments"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "soulsync"."refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "soulsync"."refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "soulsync"."refresh_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "soulsync"."user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "user_profiles_gender_idx" ON "soulsync"."user_profiles"("gender");

-- CreateIndex
CREATE INDEX "user_profiles_looking_for_idx" ON "soulsync"."user_profiles"("looking_for");

-- CreateIndex
CREATE INDEX "user_profiles_relationship_type_idx" ON "soulsync"."user_profiles"("relationship_type");

-- CreateIndex
CREATE INDEX "user_profiles_last_active_idx" ON "soulsync"."user_profiles"("last_active");

-- CreateIndex
CREATE UNIQUE INDEX "match_preferences_user_id_key" ON "soulsync"."match_preferences"("user_id");

-- CreateIndex
CREATE INDEX "blocked_users_user_id_idx" ON "soulsync"."blocked_users"("user_id");

-- CreateIndex
CREATE INDEX "blocked_users_blocked_id_idx" ON "soulsync"."blocked_users"("blocked_id");

-- CreateIndex
CREATE UNIQUE INDEX "blocked_users_user_id_blocked_id_key" ON "soulsync"."blocked_users"("user_id", "blocked_id");

-- CreateIndex
CREATE INDEX "reports_reporter_id_idx" ON "soulsync"."reports"("reporter_id");

-- CreateIndex
CREATE INDEX "reports_reported_id_idx" ON "soulsync"."reports"("reported_id");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "soulsync"."reports"("status");

-- AddForeignKey
ALTER TABLE "soulsync"."matches" ADD CONSTRAINT "matches_user_initiator_id_fkey" FOREIGN KEY ("user_initiator_id") REFERENCES "soulsync"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soulsync"."matches" ADD CONSTRAINT "matches_user_receiver_id_fkey" FOREIGN KEY ("user_receiver_id") REFERENCES "soulsync"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soulsync"."messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "soulsync"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soulsync"."messages" ADD CONSTRAINT "messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "soulsync"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soulsync"."user_answers" ADD CONSTRAINT "user_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "soulsync"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soulsync"."user_answers" ADD CONSTRAINT "user_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "soulsync"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soulsync"."subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "soulsync"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soulsync"."payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "soulsync"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soulsync"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "soulsync"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soulsync"."user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "soulsync"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soulsync"."match_preferences" ADD CONSTRAINT "match_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "soulsync"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soulsync"."blocked_users" ADD CONSTRAINT "blocked_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "soulsync"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soulsync"."blocked_users" ADD CONSTRAINT "blocked_users_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "soulsync"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soulsync"."reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "soulsync"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soulsync"."reports" ADD CONSTRAINT "reports_reported_id_fkey" FOREIGN KEY ("reported_id") REFERENCES "soulsync"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
