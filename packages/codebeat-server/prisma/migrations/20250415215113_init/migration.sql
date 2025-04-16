-- CreateTable
CREATE TABLE "Heartbeats" (
    "id" BIGSERIAL NOT NULL,
    "entity" VARCHAR(255) NOT NULL,
    "language" VARCHAR(63),
    "lineno" INTEGER,
    "lines" INTEGER,
    "project" VARCHAR(255),
    "projectPath" VARCHAR(255),
    "userAgent" VARCHAR(255),
    "sendAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recvAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Heartbeats_pkey" PRIMARY KEY ("id")
);
