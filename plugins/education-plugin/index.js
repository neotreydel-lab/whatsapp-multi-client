// 📚 Education Plugin
export default class EducationPlugin {
    constructor(client) {
        this.client = client;
        this.name = 'education-plugin';
        this.version = '1.0.0';
        this.description = 'Bildungs-System mit Wikipedia, Wörterbuch, Mathe und Code-Hilfe';
        
        this.mathOperators = {
            '+': (a, b) => a + b,
            '-': (a, b) => a - b,
            '*': (a, b) => a * b,
            '/': (a, b) => a / b,
            '^': (a, b) => Math.pow(a, b),
            'sqrt': (a) => Math.sqrt(a),
            'sin': (a) => Math.sin(a),
            'cos': (a) => Math.cos(a),
            'tan': (a) => Math.tan(a)
        };
    }

    async searchWikipedia(query) {
        try {
            // Verwende HTTP Client für Wikipedia API
            const response = await this.client.http.get(`https://de.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
            
            return {
                title: response.title,
                extract: response.extract,
                url: response.content_urls?.desktop?.page,
                thumbnail: response.thumbnail?.source
            };
        } catch (error) {
            return {
                title: query,
                extract: `Artikel über "${query}" nicht gefunden. Versuche einen anderen Suchbegriff.`,
                url: `https://de.wikipedia.org/wiki/${encodeURIComponent(query)}`,
                thumbnail: null
            };
        }
    }

    async defineWord(word) {
        // Simuliertes Wörterbuch
        const definitions = {
            'javascript': 'Eine Programmiersprache für Web-Entwicklung',
            'node': 'JavaScript-Laufzeitumgebung für Server-Anwendungen',
            'api': 'Application Programming Interface - Schnittstelle zwischen Anwendungen',
            'bot': 'Automatisiertes Programm das Aufgaben ausführt',
            'whatsapp': 'Messaging-Dienst für Smartphones und Computer'
        };
        
        return definitions[word.toLowerCase()] || `Definition für "${word}" nicht gefunden. Versuche !wiki ${word} für mehr Informationen.`;
    }

    solveMath(expression) {
        try {
            // Einfacher Mathe-Parser (sicherheitshalber begrenzt)
            const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, '');
            
            // Verwende Function constructor für sichere Evaluation
            const result = Function(`"use strict"; return (${sanitized})`)();
            
            return {
                expression: expression,
                result: result,
                success: true
            };
        } catch (error) {
            return {
                expression: expression,
                result: 'Ungültiger mathematischer Ausdruck',
                success: false
            };
        }
    }

    explainCode(code, language = 'javascript') {
        const explanations = {
            'console.log': 'Gibt Text in der Konsole aus',
            'function': 'Definiert eine wiederverwendbare Funktion',
            'const': 'Deklariert eine Konstante (unveränderliche Variable)',
            'let': 'Deklariert eine Variable mit Block-Scope',
            'var': 'Deklariert eine Variable mit Function-Scope',
            'if': 'Bedingte Anweisung - führt Code nur aus wenn Bedingung wahr ist',
            'for': 'Schleife - wiederholt Code eine bestimmte Anzahl mal',
            'while': 'Schleife - wiederholt Code solange Bedingung wahr ist',
            'return': 'Gibt einen Wert aus einer Funktion zurück',
            'async': 'Markiert eine Funktion als asynchron',
            'await': 'Wartet auf das Ergebnis einer asynchronen Operation'
        };
        
        let explanation = `💻 **Code-Erklärung (${language}):**\n\n`;
        explanation += `\`\`\`${language}\n${code}\n\`\`\`\n\n`;
        
        // Suche nach bekannten Keywords
        const foundKeywords = [];
        Object.keys(explanations).forEach(keyword => {
            if (code.includes(keyword)) {
                foundKeywords.push(`• **${keyword}**: ${explanations[keyword]}`);
            }
        });
        
        if (foundKeywords.length > 0) {
            explanation += '📝 **Erklärungen:**\n' + foundKeywords.join('\n');
        } else {
            explanation += '💡 Sende kleinere Code-Snippets für detailliertere Erklärungen.';
        }
        
        return explanation;
    }

    getRandomFact() {
        const facts = [
            'Der erste Computer-Bug war tatsächlich ein echter Käfer, der 1947 in einem Computer gefunden wurde.',
            'Das Internet wiegt etwa 50 Gramm - das Gewicht aller Elektronen in Bewegung.',
            'JavaScript wurde in nur 10 Tagen entwickelt.',
            'Das erste YouTube-Video wurde am 23. April 2005 hochgeladen.',
            'Es gibt mehr mögliche Schachspiele als Atome im beobachtbaren Universum.',
            'Der Begriff "Spam" für unerwünschte E-Mails kommt von Monty Python.',
            'Das @-Symbol wird in verschiedenen Sprachen unterschiedlich genannt: Klammeraffe (Deutsch), Snabel-a (Dänisch), oder Elefantenohr (Tschechisch).'
        ];
        
        return facts[Math.floor(Math.random() * facts.length)];
    }

    getCommands() {
        return {
            'wiki': this.handleWiki.bind(this),
            'define': this.handleDefine.bind(this),
            'math': this.handleMath.bind(this),
            'code': this.handleCode.bind(this),
            'learn': this.handleLearn.bind(this),
            'fact': this.handleFact.bind(this),
            'study': this.handleStudy.bind(this)
        };
    }

    async handleWiki(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Verwendung: !wiki <suchbegriff>\n\n📚 Beispiel: !wiki JavaScript');
        }

        const query = args.join(' ');
        await msg.reply(`📚 Suche Wikipedia-Artikel über "${query}"...`);
        
        const article = await this.searchWikipedia(query);
        
        let wikiText = `📚 **Wikipedia: ${article.title}**\n\n`;
        wikiText += `${article.extract}\n\n`;
        wikiText += `🔗 Mehr lesen: ${article.url}`;
        
        await msg.reply(wikiText);
    }

    async handleDefine(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Verwendung: !define <wort>\n\n📖 Beispiel: !define API');
        }

        const word = args.join(' ');
        const definition = await this.defineWord(word);
        
        let defineText = `📖 **Definition: ${word}**\n\n`;
        defineText += definition;
        
        await msg.reply(defineText);
    }

    async handleMath(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Verwendung: !math <ausdruck>\n\n🧮 Beispiele:\n• !math 2 + 2\n• !math 15 * 8\n• !math (10 + 5) / 3');
        }

        const expression = args.join(' ');
        const result = this.solveMath(expression);
        
        let mathText = `🧮 **Mathe-Rechner:**\n\n`;
        mathText += `📝 Ausdruck: ${result.expression}\n`;
        
        if (result.success) {
            mathText += `✅ Ergebnis: ${result.result}`;
        } else {
            mathText += `❌ Fehler: ${result.result}`;
        }
        
        await msg.reply(mathText);
    }

    async handleCode(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Verwendung: !code <code>\n\n💻 Beispiel: !code console.log("Hello World")');
        }

        const code = args.join(' ');
        const explanation = this.explainCode(code);
        
        await msg.reply(explanation);
    }

    async handleLearn(msg, args) {
        if (args.length === 0) {
            const topics = [
                '🌐 **Web Development**: HTML, CSS, JavaScript',
                '🐍 **Python**: Programmierung für Anfänger',
                '⚛️ **React**: Frontend Framework',
                '🟢 **Node.js**: Backend JavaScript',
                '🗄️ **Datenbanken**: SQL, MongoDB',
                '🔧 **Git**: Versionskontrolle',
                '☁️ **Cloud**: AWS, Azure, Google Cloud'
            ];
            
            let learnText = `📚 **Lernthemen:**\n\n`;
            learnText += topics.join('\n') + '\n\n';
            learnText += '💡 Verwende: !learn <thema> für Details';
            
            return msg.reply(learnText);
        }

        const topic = args.join(' ').toLowerCase();
        const resources = {
            'javascript': '📚 **JavaScript lernen:**\n\n• MDN Web Docs\n• JavaScript.info\n• FreeCodeCamp\n• Codecademy\n\n💡 Starte mit Variablen, Funktionen und DOM-Manipulation!',
            'python': '🐍 **Python lernen:**\n\n• Python.org Tutorial\n• Automate the Boring Stuff\n• Python Crash Course\n• Codecademy Python\n\n💡 Perfekt für Anfänger und Automatisierung!',
            'react': '⚛️ **React lernen:**\n\n• React Docs\n• React Tutorial\n• Scrimba React Course\n• Full Stack Open\n\n💡 Lerne erst JavaScript, dann React!',
            'node': '🟢 **Node.js lernen:**\n\n• Node.js Docs\n• The Node.js Handbook\n• Express.js Guide\n• NPM Packages\n\n💡 Ideal für Backend-Entwicklung!'
        };
        
        const resource = resources[topic] || `📚 Ressourcen für "${topic}" nicht gefunden. Versuche: !learn ohne Parameter für verfügbare Themen.`;
        
        await msg.reply(resource);
    }

    async handleFact(msg, args) {
        const fact = this.getRandomFact();
        
        await msg.reply(`💡 **Wusstest du schon?**\n\n${fact}`);
    }

    async handleStudy(msg, args) {
        const userId = msg.getSender();
        
        if (args.length === 0) {
            const studyTime = this.client.storage.read.from('education').get(`${userId}.studyTime`) || 0;
            const studyDays = this.client.storage.read.from('education').get(`${userId}.studyDays`) || 0;
            
            let studyText = `📊 **Deine Lernstatistiken:**\n\n`;
            studyText += `⏱️ Gesamte Lernzeit: ${Math.floor(studyTime / 60)} Minuten\n`;
            studyText += `📅 Lerntage: ${studyDays}\n\n`;
            studyText += `💡 Verwende !study start um eine Lernsession zu beginnen`;
            
            return msg.reply(studyText);
        }

        const action = args[0].toLowerCase();
        
        if (action === 'start') {
            this.client.storage.write.in('education').set(`${userId}.sessionStart`, Date.now());
            await msg.reply('📚 **Lernsession gestartet!**\n\n⏱️ Viel Erfolg beim Lernen!\n💡 Verwende !study stop um die Session zu beenden');
        } else if (action === 'stop') {
            const sessionStart = this.client.storage.read.from('education').get(`${userId}.sessionStart`);
            
            if (!sessionStart) {
                return msg.reply('❌ Keine aktive Lernsession gefunden!');
            }
            
            const sessionTime = Math.floor((Date.now() - sessionStart) / 1000 / 60); // Minuten
            
            this.client.storage.write.in('education').increment(`${userId}.studyTime`, sessionTime);
            this.client.storage.write.in('education').increment(`${userId}.studyDays`, 1);
            this.client.storage.delete.from('education').key(`${userId}.sessionStart`);
            
            await msg.reply(`✅ **Lernsession beendet!**\n\n⏱️ Dauer: ${sessionTime} Minuten\n🎉 Gut gemacht!`);
        }
    }
}