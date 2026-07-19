CREATE TABLE "LogicDefinition" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "signalKey" TEXT,
  "definition" TEXT NOT NULL,
  "behavior" TEXT NOT NULL,
  "implementationStatus" TEXT NOT NULL DEFAULT 'draft',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "LogicDefinition_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LogicDefinition_slug_key" ON "LogicDefinition"("slug");
CREATE INDEX "LogicDefinition_category_sortOrder_idx" ON "LogicDefinition"("category", "sortOrder");
