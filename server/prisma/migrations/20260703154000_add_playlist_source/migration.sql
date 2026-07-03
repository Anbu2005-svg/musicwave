CREATE TYPE "PlaylistSource" AS ENUM ('USER', 'ONLINE');

ALTER TABLE "Playlist"
ADD COLUMN "source" "PlaylistSource" NOT NULL DEFAULT 'USER';

UPDATE "Playlist"
SET "source" = 'ONLINE'
WHERE "description" ILIKE 'Saved from online%';

CREATE INDEX "Playlist_userId_source_idx" ON "Playlist"("userId", "source");
