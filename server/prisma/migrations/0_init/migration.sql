-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT,
    "role" TEXT,
    "last_seen" BIGINT,
    "armed" INTEGER NOT NULL DEFAULT 0,
    "activation_expiry" BIGINT
);

-- CreateTable
CREATE TABLE "terminals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT,
    "target" TEXT,
    "enabled" INTEGER NOT NULL DEFAULT 0,
    "secure" INTEGER NOT NULL DEFAULT 0,
    "secret" TEXT,
    "last_seen" BIGINT,
    CONSTRAINT "terminals_target_fkey" FOREIGN KEY ("target") REFERENCES "devices" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "logging" (
    "ts" BIGINT NOT NULL PRIMARY KEY,
    "level" TEXT NOT NULL,
    "instance" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" TEXT
);

-- CreateIndex
CREATE INDEX "devices_last_seen_idx" ON "devices"("last_seen");

-- CreateIndex
CREATE INDEX "terminals_target_idx" ON "terminals"("target");

-- CreateIndex
CREATE INDEX "logging_level_idx" ON "logging"("level");

-- CreateIndex
CREATE INDEX "logging_instance_idx" ON "logging"("instance");

