/*
  Warnings:

  - You are about to drop the `BeachEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ThemePark` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `beachEventId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `themeParkId` on the `Booking` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BeachEvent";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ThemePark";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Activity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "capacity" INTEGER,
    "date" DATETIME,
    "imageUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "roomId" INTEGER,
    "ferryId" INTEGER,
    "activityId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalPrice" REAL NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_ferryId_fkey" FOREIGN KEY ("ferryId") REFERENCES "Ferry" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("createdAt", "endDate", "ferryId", "id", "roomId", "startDate", "status", "totalPrice", "updatedAt", "userId") SELECT "createdAt", "endDate", "ferryId", "id", "roomId", "startDate", "status", "totalPrice", "updatedAt", "userId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
