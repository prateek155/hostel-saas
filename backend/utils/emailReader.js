import imaps from "imap-simple";
import { simpleParser } from "mailparser";
import ownerEmailModel from "../models/ownerEmailModel.js";
import emailModel from "../models/emailModel.js";

const emailReader = async () => {
  try {
    let owners;

    // ✅ Safe DB fetch
    try {
      owners = await ownerEmailModel.find();
    } catch (dbError) {
      console.error("❌ DB Error:", dbError.message);
      return;
    }

    if (!owners || owners.length === 0) {
      console.error("⚠️ No owner email configs found.");
      return;
    }

    const globalStatus = owners[0]?.emailSystemEnabled;
    console.error("🌐 GLOBAL STATUS:", globalStatus);

    if (!globalStatus) {
      console.error("⛔ Email system is OFF");
      return;
    }

    for (let owner of owners) {
      if (!owner.emailReaderEnabled) {
        console.error(`⛔ Reader OFF for: ${owner.email}`);
        continue;
      }

      let connection;

      try {
        const config = {
          imap: {
            user: owner.email,
            password: owner.appPassword,
            host: "imap.gmail.com",
            port: 993,
            tls: true,
            authTimeout: 10000, // 🔥 IMPORTANT (prevents hanging)
            tlsOptions: {
              rejectUnauthorized: false,
            },
          },
        };

        console.error("📩 Connecting to:", owner.email);

        connection = await imaps.connect(config);

        await connection.openBox("INBOX");

        const messages = await connection.search(["UNSEEN"], {
          bodies: [""],
          markSeen: false,
        });

        console.error(`📬 ${messages.length} emails for ${owner.email}`);

        const limitedMessages = messages.slice(0, 10);

        for (let item of limitedMessages) {
          try {
            const all = item.parts.find((part) => part.which === "");

            if (!all) continue;

            const parsed = await simpleParser(all.body);

            const messageBody = parsed.text || parsed.textAsHtml || "";
            const fromText = parsed.from?.text || "Unknown";
            const subject = parsed.subject || "(No Subject)";
            const date = parsed.date || new Date();

            const exists = await emailModel.findOne({
              ownerId: owner.ownerId,
              subject,
              date,
            });

            if (exists) {
              console.error("⚠️ Duplicate skipped:", subject);
              continue;
            }

            await emailModel.create({
              ownerId: owner.ownerId,
              from: fromText,
              subject,
              message: messageBody,
              date,
            });

            console.error("✅ Saved:", subject);

            await connection.addFlags(item.attributes.uid, ["\\Seen"]);

          } catch (emailError) {
            console.error("❌ Email process error:", emailError.message);
          }
        }

      } catch (error) {
        console.error(`❌ IMAP error (${owner.email}):`, error.message);
      } finally {
        // 🔥 ALWAYS close connection safely
        if (connection) {
          try {
            connection.end();
          } catch (e) {
            console.error("⚠️ Connection close error:", e.message);
          }
        }
      }
    }

  } catch (err) {
    console.error("❌ emailReader global error:", err.message);
  }
};

export default emailReader;