-- CreateEnum
CREATE TYPE "TestimonialStatus" AS ENUM ('pending', 'approved', 'rejected');

-- Add status column with default 'pending'
ALTER TABLE "testimonials" ADD COLUMN "status" "TestimonialStatus" NOT NULL DEFAULT 'pending';

-- Migrate existing approved rows from boolean is_approved
UPDATE "testimonials" SET "status" = 'approved' WHERE "is_approved" = true;

-- Drop old boolean column
ALTER TABLE "testimonials" DROP COLUMN "is_approved";
