import { quickBot } from "../src/index.js";

// 🚀 QUICKEST WAY TO START - 3 LINES!

quickBot()
    .when("hello").reply("Hi there! 👋")
    .when("ping").reply("Pong! 🏓")
    .start();

console.log("✅ QuickBot started! Send 'hello' or 'ping' to test!");