-- CreateTable
CREATE TABLE "soulsync"."notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "from_user_id" TEXT,
    "match_id" TEXT,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soulsync"."conversations" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "user1_id" TEXT NOT NULL,
    "user2_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "soulsync"."notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_read_idx" ON "soulsync"."notifications"("read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "soulsync"."notifications"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_match_id_key" ON "soulsync"."conversations"("match_id");

-- CreateIndex
CREATE INDEX "conversations_user1_id_idx" ON "soulsync"."conversations"("user1_id");

-- CreateIndex
CREATE INDEX "conversations_user2_id_idx" ON "soulsync"."conversations"("user2_id");

-- AddForeignKey
ALTER TABLE "soulsync"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "soulsync"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soulsync"."notifications" ADD CONSTRAINT "notifications_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "soulsync"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soulsync"."notifications" ADD CONSTRAINT "notifications_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "soulsync"."matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soulsync"."conversations" ADD CONSTRAINT "conversations_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "soulsync"."matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soulsync"."conversations" ADD CONSTRAINT "conversations_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "soulsync"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soulsync"."conversations" ADD CONSTRAINT "conversations_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "soulsync"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
