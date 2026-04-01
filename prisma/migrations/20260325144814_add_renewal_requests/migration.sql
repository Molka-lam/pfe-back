-- CreateTable
CREATE TABLE "renewal_requests" (
    "id" UUID NOT NULL,
    "license_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "renewal_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "renewal_requests_tenant_id_status_idx" ON "renewal_requests"("tenant_id", "status");

-- AddForeignKey
ALTER TABLE "renewal_requests" ADD CONSTRAINT "renewal_requests_license_id_fkey" FOREIGN KEY ("license_id") REFERENCES "licenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renewal_requests" ADD CONSTRAINT "renewal_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
