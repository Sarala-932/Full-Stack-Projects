import arcjet, {tokenBucket} from "@arcjet/node";
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
    ],
});

export default aj;
