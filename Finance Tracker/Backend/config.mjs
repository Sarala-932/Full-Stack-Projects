import dotenv from "dotenv";
dotenv.config();

const REQUIRED_ENV_VARS = [
    "MongoDB",
    "PORT",
    "CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "RESEND_API_KEY",
    "ARCJET_KEY",
    "GEMINI_API_KEY",
];

const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables:\n  ${missingVars.join("\n  ")}`);
    process.exit(1);
}

const config = {
    mongoURI: process.env.MongoDB,
    port: process.env.PORT,
    clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    clerkSecretKey: process.env.CLERK_SECRET_KEY,
    jwtSecret: process.env.JWT_SECRET,
    resendApiKey: process.env.RESEND_API_KEY,
    arcjetKey: process.env.ARCJET_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
};

export default config;
