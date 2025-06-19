-- CreateTable
CREATE TABLE "DoctorPrescriptionPattern" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patterns" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorPrescriptionPattern_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DoctorPrescriptionPattern_doctorId_key" ON "DoctorPrescriptionPattern"("doctorId");
