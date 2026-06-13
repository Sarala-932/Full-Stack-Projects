import dotenv from "dotenv";
dotenv.config();
const config = {
  mongoURI: process.env.MongoDB,
  port: process.env.PORT,
  clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
  jwtSecret: process.env.JWT_SECRET,
  resendApiKey: process.env.RESEND_API_KEY,
};

export default config;
