import imaps from "imap-simple";
import { simpleParser } from "mailparser";
import ownerEmailModel from "../models/ownerEmailModel.js";
import emailModel from "../models/emailModel.js";

const emailReader = async () => {
  let owners;

  // Fetch owners safely
  try {
    owners = await ownerEmailModel.find();
  } catch (dbError) {
    console.log("Failed to fetch owner email configs:", dbError.message);
    return;
  }

  if (!owners || owners.length === 0) {
    console.log("No owner email configs found. Skipping.");
    return;
  }

  // ✅ GLOBAL CHECK (FIXED)
  const globalStatus = owners[0]?.emailSystemEnabled;

  console.log("🌐 GLOBAL STATUS:", globalStatus);

  if (!globalStatus) {
    console.log("⛔ GLOBAL: Email system is OFF");
    return;
  }

  // Loop through users
  for (let owner of owners) {

    // ✅ USER CHECK
    if (!owner.emailReaderEnabled) {
      console.log(`⛔ Email reader OFF for: ${owner.email}`);
      continue;
    }

    try {
      const config = {
        imap: {
          user: owner.email,
          password: owner.appPassword,
          host: "imap.gmail.com",
          port: 993,
          tls: true,
          tlsOptions: {
            rejectUnauthorized: false,
          },
        },
      };

      console.log("📩 Checking inbox for:", owner.email);

      const connection = await imaps.connect(config);
      await connection.openBox("INBOX");

      // Fetch unseen emails
      const messages = await connection.search(["UNSEEN"], {
        bodies: [""],
        markSeen: false,
      });

      console.log(`📬 Found ${messages.length} new email(s) for ${owner.email}`);

      // ✅ LIMIT emails (performance)
      const limitedMessages = messages.slice(0, 10);

      for (let item of limitedMessages) {
        try {
          const all = item.parts.find((part) => part.which === "");

          if (!all) {
            console.log("⚠️ Missing email body, skipping...");
            continue;
          }

          const parsed = await simpleParser(all.body);

          const messageBody = parsed.text || parsed.textAsHtml || "";
          const fromText = parsed.from?.text || "Unknown Sender";
          const subject = parsed.subject || "(No Subject)";
          const date = parsed.date || new Date();

          // ✅ Duplicate check
          const exists = await emailModel.findOne({
            ownerId: owner.ownerId,
            subject,
            date,
          });

          if (exists) {
            console.log("⚠️ Duplicate email skipped:", subject);
            continue;
          }

          // Save email
          await emailModel.create({
            ownerId: owner.ownerId,
            from: fromText,
            subject,
            message: messageBody,
            date,
          });

          console.log("✅ Email saved:", subject);

          // ✅ Mark as read AFTER saving
          await connection.addFlags(item.attributes.uid, ["\\Seen"]);

        } catch (emailError) {
          console.log(
            `❌ Error saving email for ${owner.email}:`,
            emailError.message
          );
        }
      }

      connection.end();

    } catch (error) {
      console.log(`❌ IMAP error for ${owner.email}:`, error.message);
    }
  }
};

export default emailReader;