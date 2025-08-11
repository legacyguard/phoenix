import { schedule } from "node-cron";
import nodemailer from "nodemailer";
import { createClient } from "@/lib/supabase/server";

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // or any other email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function checkInactivityAndNotify(): Promise<void> {
  const supabase = createClient();

  // Fetch users who have not logged in for more than 90 days
  const { data: inactiveUsers, error } = await supabase
    .from("users")
    .select("id, name, email, last_login, trusted_people")
    .is("status", "active")
    .lte(
      "last_login",
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    );

  if (error) {
    console.error("Error fetching inactive users:", error);
    return;
  }

  if (!inactiveUsers || inactiveUsers.length === 0) {
    console.log("No inactive users to notify.");
    return;
  }

  for (const user of inactiveUsers) {
    // Step 1: Send a check-in email to the user
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "LegacyGuard Check-in",
      text: "No action needed, we are just confirming your account is active.",
    });

    // Step 2: Notify verifiers if user remains inactive
    const verifiers = JSON.parse(user.trusted_people || "[]");
    for (const verifier of verifiers) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: verifier.email,
        subject: `LegacyGuard: Verify ${user.name}'s status`,
        text: `We have been unable to reach ${user.name}. Please confirm their status.`,
      });
    }
  }

  console.log(
    "Notifications sent successfully to inactive users and their verifiers.",
  );
}

// Schedule this function to run every 30 days
schedule("0 0 1 */1 *", checkInactivityAndNotify);
