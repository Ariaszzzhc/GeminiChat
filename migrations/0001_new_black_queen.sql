ALTER TABLE "chat" RENAME COLUMN "createAt" TO "createdAt";--> statement-breakpoint
ALTER TABLE "chat" ALTER COLUMN "title" SET NOT NULL;