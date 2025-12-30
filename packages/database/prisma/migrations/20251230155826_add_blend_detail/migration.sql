-- CreateTable or AlterTable migration
-- Add blendDetail field to Wine table

ALTER TABLE "Wine" ADD COLUMN "blendDetail" TEXT;
