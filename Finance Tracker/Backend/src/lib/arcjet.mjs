import arcjet, {tokenBucket, shield, detectBot} from "@arcjet/node";
import config from "../../config.mjs";

const aj = arcjet({
    key: process.env.ARCJET_KEY || config.arcjetKey,
    characteristics: ["userId"],
    rules: [
        tokenBucket({
            mode: "LIVE",
            refillRate: 50,
            interval: 86400, // ✅ per day (24 * 60 * 60 seconds)
            capacity: 50, // ✅ max burst = 50
        }),
        shield({
            mode: "LIVE",
        }),
        detectBot({
            mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
            allow: [
                "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
                "GO_HTTP", // For Inngest
                // See the full list at https://arcjet.com/bot-list
            ],
        }),
    ],
});

export default aj;
