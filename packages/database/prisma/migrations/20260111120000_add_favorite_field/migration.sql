-- AlterTable
-- Add favorite field to Wine table
ALTER TABLE "Wine" ADD COLUMN "favorite" BOOLEAN NOT NULL DEFAULT false;
