import config from "../../config.mjs";
import {Resend} from "resend";

const resend = new Resend(config.resendApiKey || "");

export async function sendEmail({to, subject, html}) {
  try {
    const data = await resend.emails.send({
      from: "Finance Tracker <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    return {success: true, data};
  } catch (error) {
    console.error("Failed to send email:", error);
    return {success: false, error};
  }
}
