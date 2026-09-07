import { PrismaClient } from "@prisma/client";
import { nutrientDefinitions } from "../data/foods/nutrient-definitions";

const prisma = new PrismaClient();

async function main() {
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
    `Successfully seeded ${nutrientDefinitions.length} nutrient definitions.`
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });