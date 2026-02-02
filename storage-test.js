// Test für das WAEngine Storage System
import { WhatsAppClient, write, read, del } from "./src/index.js";

async function storageTest() {
    console.log("💾 WAEngine Storage System Test...");
    
    const client = new WhatsAppClient({
        authDir: "./auth",
        logLevel: "silent",
        browser: ["StorageTest", "1.0.0", ""],
        printQR: true
    });

    client.setPrefix("!");

    // ===== STORAGE COMMANDS =====

    // Setprefix Command mit Storage
    client.addCommand('setprefix', async (msg, args) => {
        if (msg.isGroup && !(await msg.isAdmin())) {
            return msg.reply('❌ Nur Admins können den Prefix ändern!');
        }

        if (args.length === 0) {
            // Aktuellen Prefix aus Storage lesen
            const currentPrefix = msg.read.from("prefixes").get(msg.from) || "!";
            return msg.reply(`🎯 Aktueller Prefix: "${currentPrefix}"`);
        }

        const newPrefix = args[0];
        
        // Validierung
        if (newPrefix.length > 5) {
            return msg.reply('❌ Prefix darf maximal 5 Zeichen lang sein!');
        }

        // In Storage speichern
        msg.write.in("prefixes").set(msg.from, newPrefix);
        
        await msg.reply(`✅ Prefix geändert zu: "${newPrefix}"\n💾 Automatisch gespeichert!`);
    });

    // User Data Commands
    client.addCommand('setdata', async (msg, args) => {
        if (args.length < 2) {
            return msg.reply('❌ Usage: !setdata <key> <value>');
        }

        const [key, ...valueParts] = args;
        const value = valueParts.join(' ');
        const userId = msg.getSender();

        // User-spezifische Daten speichern
        msg.write.in("users").set(`${userId}.${key}`, value);
        
        await msg.reply(`✅ Daten gespeichert!\n🔑 Key: ${key}\n💾 Value: ${value}`);
    });

    client.addCommand('getdata', async (msg, args) => {
        if (args.length === 0) {
            return msg.reply('❌ Usage: !getdata <key>');
        }

        const key = args[0];
        const userId = msg.getSender();
        
        // User-spezifische Daten lesen
        const value = msg.read.from("users").get(`${userId}.${key}`);
        
        if (value) {
            await msg.reply(`📋 Daten gefunden!\n🔑 Key: ${key}\n💾 Value: ${value}`);
        } else {
            await msg.reply(`❌ Keine Daten für Key "${key}" gefunden!`);
        }
    });

    // Counter System
    client.addCommand('count', async (msg, args) => {
        const action = args[0] || 'show';
        const counterId = args[1] || 'default';
        
        switch (action) {
            case 'up':
                msg.write.in("counters").increment(counterId, 1);
                const newCount = msg.read.from("counters").get(counterId);
                await msg.reply(`📈 Counter "${counterId}": ${newCount}`);
                break;
                
            case 'down':
                msg.write.in("counters").increment(counterId, -1);
                const downCount = msg.read.from("counters").get(counterId);
                await msg.reply(`📉 Counter "${counterId}": ${downCount}`);
                break;
                
            case 'reset':
                msg.write.in("counters").set(counterId, 0);
                await msg.reply(`🔄 Counter "${counterId}" zurückgesetzt!`);
                break;
                
            case 'show':
            default:
                const currentCount = msg.read.from("counters").get(counterId) || 0;
                await msg.reply(`📊 Counter "${counterId}": ${currentCount}`);
                break;
        }
    });

    // Todo System
    client.addCommand('todo', async (msg, args) => {
        const action = args[0];
        
        switch (action) {
            case 'add':
                if (args.length < 2) {
                    return msg.reply('❌ Usage: !todo add <task>');
                }
                
                const task = args.slice(1).join(' ');
                const todoItem = {
                    id: Date.now(),
                    task: task,
                    user: msg.getSender(),
                    created: new Date().toISOString(),
                    completed: false
                };
                
                msg.write.in("todos").push(todoItem);
                await msg.reply(`✅ Todo hinzugefügt!\n📝 Task: ${task}\n🆔 ID: ${todoItem.id}`);
                break;
                
            case 'list':
                const todos = msg.read.from("todos").all() || [];
                const userTodos = todos.filter(todo => todo.user === msg.getSender() && !todo.completed);
                
                if (userTodos.length === 0) {
                    await msg.reply('📝 Keine offenen Todos!');
                } else {
                    let list = '📝 **Deine Todos:**\n\n';
                    userTodos.forEach(todo => {
                        list += `🆔 ${todo.id}: ${todo.task}\n`;
                    });
                    await msg.reply(list);
                }
                break;
                
            case 'done':
                if (args.length < 2) {
                    return msg.reply('❌ Usage: !todo done <id>');
                }
                
                const todoId = parseInt(args[1]);
                const allTodos = msg.read.from("todos").all() || [];
                const todoIndex = allTodos.findIndex(todo => todo.id === todoId && todo.user === msg.getSender());
                
                if (todoIndex === -1) {
                    await msg.reply('❌ Todo nicht gefunden!');
                } else {
                    allTodos[todoIndex].completed = true;
                    allTodos[todoIndex].completedAt = new Date().toISOString();
                    
                    msg.write.in("todos").data(allTodos);
                    await msg.reply(`✅ Todo abgeschlossen!\n📝 ${allTodos[todoIndex].task}`);
                }
                break;
                
            default:
                await msg.reply('📝 **Todo Commands:**\n!todo add <task> - Todo hinzufügen\n!todo list - Todos anzeigen\n!todo done <id> - Todo abschließen');
        }
    });

    // Storage Statistics
    client.addCommand('storage', async (msg) => {
        const stats = msg.storage.getStats();
        
        let info = `💾 **Storage Statistics**\n\n`;
        info += `📁 **Files:** ${stats.totalFiles}\n`;
        info += `💽 **Size:** ${stats.totalSizeFormatted}\n`;
        info += `🧠 **Cache:** ${stats.cacheSize} items\n`;
        info += `📂 **Directory:** ${stats.baseDir}\n\n`;
        
        if (stats.files.length > 0) {
            info += `📋 **Files:**\n`;
            stats.files.forEach(file => {
                info += `• ${file}.json\n`;
            });
        }
        
        await msg.reply(info);
    });

    // Backup System
    client.addCommand('backup', async (msg) => {
        const backupPath = msg.storage.backup();
        
        if (backupPath) {
            await msg.reply(`💾 Backup erstellt!\n📂 Path: ${backupPath}`);
        } else {
            await msg.reply('❌ Backup fehlgeschlagen!');
        }
    });

    // ===== GLOBAL STORAGE EXAMPLES =====
    
    // Beispiel: Message Counter
    client.on('message', async (msg) => {
        if (!msg.isCommand) {
            // Message Count erhöhen
            write.in("stats").increment("totalMessages", 1);
            write.in("stats").increment(`chat.${msg.from}`, 1);
            
            // User Message Count
            const userId = msg.getSender();
            write.in("users").increment(`${userId}.messageCount`, 1);
        }
    });

    // ===== HELP COMMAND =====
    client.addCommand('help', async (msg) => {
        const prefix = msg.read.from("prefixes").get(msg.from) || "!";
        
        let help = `🤖 **Storage Bot Commands** (Prefix: "${prefix}")\n\n`;
        help += `**📊 Data Management:**\n`;
        help += `${prefix}setdata <key> <value> - Daten speichern\n`;
        help += `${prefix}getdata <key> - Daten abrufen\n\n`;
        
        help += `**📈 Counter System:**\n`;
        help += `${prefix}count up [name] - Counter erhöhen\n`;
        help += `${prefix}count down [name] - Counter verringern\n`;
        help += `${prefix}count show [name] - Counter anzeigen\n`;
        help += `${prefix}count reset [name] - Counter zurücksetzen\n\n`;
        
        help += `**📝 Todo System:**\n`;
        help += `${prefix}todo add <task> - Todo hinzufügen\n`;
        help += `${prefix}todo list - Todos anzeigen\n`;
        help += `${prefix}todo done <id> - Todo abschließen\n\n`;
        
        help += `**⚙️ System:**\n`;
        help += `${prefix}setprefix <prefix> - Prefix ändern (Admin)\n`;
        help += `${prefix}storage - Storage Statistiken\n`;
        help += `${prefix}backup - Backup erstellen\n`;
        
        await msg.reply(help);
    });

    // ===== EVENTS =====
    client.on('connected', () => {
        console.log("✅ Storage Bot verbunden!");
        console.log("💾 Features:");
        console.log("   - Einfache Storage API: write.in('file').set(key, value)");
        console.log("   - User-spezifische Daten");
        console.log("   - Counter System");
        console.log("   - Todo System");
        console.log("   - Automatic Backup");
        console.log("   - Cache System");
        
        // Startup Statistics
        const stats = client.storage.getStats();
        console.log(`📊 Storage: ${stats.totalFiles} files, ${stats.totalSizeFormatted}`);
    });

    try {
        await client.connect();
        
        console.log("\n💾 Storage Commands:");
        console.log("   - !setdata <key> <value> → Daten speichern");
        console.log("   - !getdata <key> → Daten abrufen");
        console.log("   - !count up/down/show/reset [name] → Counter System");
        console.log("   - !todo add/list/done → Todo System");
        console.log("   - !setprefix <prefix> → Prefix ändern");
        console.log("   - !storage → Storage Statistiken");
        console.log("   - !backup → Backup erstellen");
        
    } catch (error) {
        console.error("❌ Storage Test Fehler:", error);
    }
}

storageTest();