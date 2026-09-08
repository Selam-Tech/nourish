import { PrismaClient } from "@prisma/client";
import { nutrientDefinitions } from "../data/foods/nutrient-definitions";

const prisma = new PrismaClient();

async function seedNutrientDefinitions() {
  console.log("Seeding Nourish nutrient definitions...");

  for (const nutrient of nutrientDefinitions) {
    await prisma.nutrientDefinition.upsert({
      where: {
        code: nutrient.code,
      },
      update: {
        nameEn: nutrient.nameEn,
        unit: nutrient.unit,
        category: nutrient.category,
        sortOrder: nutrient.sortOrder,
        isActive: true,
      },
      create: {
        code: nutrient.code,
        nameEn: nutrient.nameEn,
        unit: nutrient.unit,
        category: nutrient.category,
        sortOrder: nutrient.sortOrder,
        isActive: true,
      },
    });
  }

  console.log(
    `Successfully seeded ${nutrientDefinitions.length} nutrient definitions.`,
  );
}

async function seedRegions() {
  console.log("Seeding Nourish regions...");

  await prisma.region.upsert({
    where: {
      code: "ET-AA",
    },
    update: {
      nameEn: "Addis Ababa",
      nameAm: "አዲስ አበባ",
      countryCode: "ETH",
      parentRegionId: null,
      isActive: true,
    },
    create: {
      code: "ET-AA",
      nameEn: "Addis Ababa",
      nameAm: "አዲስ አበባ",
      countryCode: "ETH",
      parentRegionId: null,
      isActive: true,
    },
  });

  console.log("Successfully seeded Addis Ababa region.");
}

async function main() {
  console.log("Starting Nourish database seed...");

  await seedNutrientDefinitions();
  await seedRegions();

  console.log("Nourish database seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });