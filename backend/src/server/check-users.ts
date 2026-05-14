import prisma from "../config/prisma.js";

async function checkUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log("Registered Users count:", users.length);
    console.log("Registered Users:", JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Error fetching users:", error);
    process.exit(1);
  }
}

checkUsers();
