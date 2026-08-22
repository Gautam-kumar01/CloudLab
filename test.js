const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.project
  .findMany()
  .then((p) => console.log(p))
  .finally(() => prisma.$disconnect());
