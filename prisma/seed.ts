import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { SERVICES, PRICES, FAQ_ITEMS } from "../src/lib/constants";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  if ((await prisma.service.count()) === 0) {
    await prisma.service.createMany({
      data: SERVICES.map((s, i) => ({
        title: s.title,
        description: s.description,
        imageUrl: "",
        tags: [...s.features],
        sortOrder: (i + 1) * 10,
        isActive: true,
      })),
    });
    console.log(`Seeded ${SERVICES.length} services`);
  } else {
    console.log("services table non-empty, skipping");
  }

  if ((await prisma.priceItem.count()) === 0) {
    await prisma.priceItem.createMany({
      data: PRICES.map((p, i) => ({
        title: p.title,
        note: p.note,
        price: p.price,
        sortOrder: (i + 1) * 10,
        isActive: true,
      })),
    });
    console.log(`Seeded ${PRICES.length} prices`);
  } else {
    console.log("price_items table non-empty, skipping");
  }

  if ((await prisma.faqItem.count()) === 0) {
    await prisma.faqItem.createMany({
      data: FAQ_ITEMS.map((f, i) => ({
        question: f.question,
        answer: f.answer,
        sortOrder: (i + 1) * 10,
        isActive: true,
      })),
    });
    console.log(`Seeded ${FAQ_ITEMS.length} FAQ items`);
  } else {
    console.log("faq_items table non-empty, skipping");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
