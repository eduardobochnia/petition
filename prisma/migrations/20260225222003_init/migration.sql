-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'INTAKE',
    "cctInfo" TEXT,
    "notes" TEXT,
    "authorId" TEXT NOT NULL,
    "defendantId" TEXT NOT NULL,
    "contractId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Case_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Party" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Case_defendantId_fkey" FOREIGN KEY ("defendantId") REFERENCES "Party" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Case_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Party" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "document" TEXT,
    "address" TEXT,
    "role" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "admissionDate" DATETIME NOT NULL,
    "dismissalDate" DATETIME,
    "resignationType" TEXT,
    "baseSalary" REAL NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT,
    "journeyHours" REAL NOT NULL,
    "journeyString" TEXT NOT NULL,
    "hasNightWork" BOOLEAN NOT NULL DEFAULT false,
    "hasBankOfHours" BOOLEAN NOT NULL DEFAULT false,
    "cnae" TEXT,
    "activitySector" TEXT,
    "municipality" TEXT
);

-- CreateTable
CREATE TABLE "ClaimDictionary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "shortDesc" TEXT,
    "category" TEXT NOT NULL,
    "pjeCalcImpact" TEXT
);

-- CreateTable
CREATE TABLE "CaseClaim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    CONSTRAINT "CaseClaim_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaseClaim_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "ClaimDictionary" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SpecialSituation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "suggestedClaims" TEXT NOT NULL,
    "suggestedBlocks" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CaseSpecialSituation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "situationId" TEXT NOT NULL,
    CONSTRAINT "CaseSpecialSituation_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaseSpecialSituation_situationId_fkey" FOREIGN KEY ("situationId") REFERENCES "SpecialSituation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TemplateBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "contentAST" TEXT NOT NULL,
    "triggerClaims" TEXT,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "version" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CaseBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "templateId" TEXT,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "contentAST" TEXT NOT NULL,
    "origin" TEXT NOT NULL DEFAULT 'MANUAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CaseBlock_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaseBlock_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TemplateBlock" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewError" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReviewError_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Case_authorId_key" ON "Case"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Case_defendantId_key" ON "Case"("defendantId");

-- CreateIndex
CREATE UNIQUE INDEX "Case_contractId_key" ON "Case"("contractId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseClaim_caseId_claimId_key" ON "CaseClaim"("caseId", "claimId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseSpecialSituation_caseId_situationId_key" ON "CaseSpecialSituation"("caseId", "situationId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseBlock_caseId_order_key" ON "CaseBlock"("caseId", "order");
