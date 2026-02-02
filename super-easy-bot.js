// 🤖 SUPER EASY BOT - Nur 8 Zeilen! - KORRIGIERT!
import { EasyBot } from './src/easy-bot.js';

EasyBot.create()
    .when('hi').reply('Hello! 👋')
    .when('test').reply('✅ Working!')
    .when('ping').reply('pong! 🏓')
    .when('help').reply('Commands: hi, test, ping, help')
    .start();