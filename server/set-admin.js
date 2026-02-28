require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;

  // 1) Delete duplicate user records with placeholder @clerk.user emails
  const deleted = await db.collection("users").deleteMany({
    email: { $regex: /@clerk\.user$/i },
  });
  if (deleted.deletedCount > 0) {
    console.log(`🗑️  Deleted ${deleted.deletedCount} placeholder user record(s)`);
  }

  // 2) Upsert admin user
  const result = await db.collection("users").findOneAndUpdate(
    { email: "ishaanhnk@gmail.com" },
    {
      $set: {
        name: "Ishaan Baberwal",
        email: "ishaanhnk@gmail.com",
        isAdmin: true,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        addresses: [],
        wishlist: [],
        createdAt: new Date(),
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  console.log("✅ Admin user updated:", result?.email || result?.value?.email || "done");
  process.exit(0);
}).catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
