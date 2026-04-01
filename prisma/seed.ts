import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding databases...");

  // 1. Create Plans
  const plans = [
    {
      name: "BASIC",
      price_monthly: 29,
      features: { advanced_ai: false, export_pdf: false, multi_user: false, api_access: true },
      limits: { max_users: 5, api_calls_per_month: 10000, storage_gb: 5 },
    },
    {
      name: "PRO",
      price_monthly: 99,
      features: { advanced_ai: true, export_pdf: true, multi_user: true, api_access: true },
      limits: { max_users: 50, api_calls_per_month: 100000, storage_gb: 50 },
    },
    {
      name: "ENTERPRISE",
      price_monthly: 299,
      features: { advanced_ai: true, export_pdf: true, multi_user: true, api_access: true },
      limits: { max_users: 500, api_calls_per_month: 1000000, storage_gb: 500 },
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    });
  }

  // 2. Create Admin Tenant & User
  const hashedPasswordAdmin = await bcrypt.hash("Admin@1234", 10);
  const adminTenant = await prisma.tenant.upsert({
    where: { email: "avaxia@avaxia.com" },
    update: {},
    create: {
      name: "AVAXIA",
      email: "avaxia@avaxia.com",
      company: "AVAXIA",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@avaxia.com" },
    update: {},
    create: {
      tenant_id: adminTenant.id,
      name: "Admin AVAXIA",
      email: "admin@avaxia.com",
      password_hash: hashedPasswordAdmin,
      role: "admin",
    },
  });

  // 3. Create Client Tenant & User
  const hashedPasswordUser = await bcrypt.hash("User@1234", 10);
  const clientTenant = await prisma.tenant.upsert({
    where: { email: "contact@testclient.com" },
    update: {},
    create: {
      name: "Test Client SARL",
      email: "contact@testclient.com",
    },
  });

  const clientUser = await prisma.user.upsert({
    where: { email: "user@testclient.com" },
    update: {},
    create: {
      tenant_id: clientTenant.id,
      name: "John Doe",
      email: "user@testclient.com",
      password_hash: hashedPasswordUser,
      role: "client",
    },
  });

  // 4. Create License for Client
  await prisma.license.upsert({
    where: { license_key: "PRO-TEST-ABCD-1234" },
    update: {},
    create: {
      tenant_id: clientTenant.id,
      license_key: "PRO-TEST-ABCD-1234",
      plan: "PRO",
      status: "active",
      expires_at: new Date("2027-12-31"),
      features: { advanced_ai: true, export_pdf: true, multi_user: true, api_access: true },
      limits: { max_users: 50, api_calls_per_month: 100000, storage_gb: 50 },
    },
  });

  console.log("Seeding finished!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
