// 🎨 Creative Plugin
export default class CreativePlugin {
    constructor(client) {
        this.client = client;
        this.name = 'creative-plugin';
        this.version = '1.0.0';
        this.description = 'Kreative Tools für Memes, ASCII-Art, Zitate und mehr';
        
        this.memeTemplates = [
            'Das Gefühl wenn...',
            'Niemand:\nAbsolut niemand:\nIch:',
            'Erwartung vs. Realität',
            'Wenn du denkst es wird besser...\nAber dann:',
            'POV: Du bist...',
            'Das ist fine 🔥',
            'Stonks 📈',
            'Not stonks 📉'
        ];
        
        this.quotes = [
            'Das Leben ist wie ein Fahrrad. Um das Gleichgewicht zu halten, musst du in Bewegung bleiben. - Albert Einstein',
            'Sei du selbst die Veränderung, die du dir wünschst für diese Welt. - Mahatma Gandhi',
            'Der beste Weg, die Zukunft vorherzusagen, ist, sie zu erschaffen. - Peter Drucker',
            'Erfolg ist nicht endgültig, Misserfolg ist nicht fatal: Es ist der Mut weiterzumachen, der zählt. - Winston Churchill',
            'Innovation unterscheidet zwischen einem Anführer und einem Nachfolger. - Steve Jobs',
            'Das Einzige, was wir zu fürchten haben, ist die Furcht selbst. - Franklin D. Roosevelt',
            'Träume nicht dein Leben, lebe deinen Traum. - Mark Twain',
            'Wer kämpft, kann verlieren. Wer nicht kämpft, hat schon verloren. - Bertolt Brecht'
        ];
        
        this.asciiArt = {
            'heart': '♥♥♥♥♥♥♥\n♥     ♥\n♥  ♥  ♥\n ♥   ♥\n  ♥ ♥\n   ♥',
            'star': '    ★\n   ★★★\n  ★★★★★\n ★★★★★★★\n★★★★★★★★★\n ★★★★★★★\n  ★★★★★\n   ★★★\n    ★',
            'smile': '  ☺☺☺☺☺\n ☺       ☺\n☺  ●   ●  ☺\n☺     ◡    ☺\n ☺       ☺\n  ☺☺☺☺☺',
            'cat': ' /\\_/\\\n( o.o )\n > ^ <',
            'dog': '  ∩___∩\n  |       |\n  |  ◉ ◉ |\n  |   ω   |\n  |_______|\n     U U'
        };
    }

    generateMeme(template, text) {
        const memeText = template.replace(/\.\.\./g, text);
        
        return `🎭 **Meme Generator**\n\n${memeText}\n\n😂 Erstellt mit WAEngine Creative Plugin`;
    }

    generateRandomQuote() {
        const quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        
        return `💭 **Zitat des Tages**\n\n"${quote}"\n\n✨ Lass dich inspirieren!`;
    }

    generateAsciiArt(type) {
        const art = this.asciiArt[type.toLowerCase()];
        
        if (!art) {
            return `❌ ASCII-Art "${type}" nicht gefunden!\n\n📝 Verfügbar: ${Object.keys(this.asciiArt).join(', ')}`;
        }
        
        return `🎨 **ASCII-Art: ${type}**\n\n\`\`\`\n${art}\n\`\`\``;
    }

    generateTextArt(text) {
        // Einfache Text-zu-ASCII Konvertierung
        const bigLetters = {
            'A': '  ▄▄▄  \n ▄▀   ▀▄\n█  ▄▄▄  █\n█ ▀   ▀ █\n▀▄     ▄▀\n  ▀▀▀▀▀',
            'B': '██████▄ \n█     █▄\n██████▀ \n█     █▄\n██████▀',
            'C': ' ▄▄▄▄▄▄ \n█      ▄\n█       \n█      ▄\n ▀▀▀▀▀▀',
            'D': '██████▄ \n█     █▄\n█     █▄\n█     █▄\n██████▀',
            'E': '████████\n█       \n██████  \n█       \n████████',
            'F': '████████\n█       \n██████  \n█       \n█',
            'G': ' ▄▄▄▄▄▄▄\n█       \n█  ▄▄▄▄ \n█     █ \n ▀▀▀▀▀▀▀',
            'H': '█     █\n█     █\n███████\n█     █\n█     █',
            'I': '███████\n   █   \n   █   \n   █   \n███████',
            'J': '███████\n     █ \n     █ \n█    █ \n ▀▀▀▀▀',
            'K': '█    █ \n█   █  \n████   \n█   █  \n█    █',
            'L': '█      \n█      \n█      \n█      \n███████',
            'M': '█     █\n██   ██\n█ ▀ ▀ █\n█     █\n█     █',
            'N': '█     █\n██    █\n█ █   █\n█  ██ █\n█   ███',
            'O': ' ▄▄▄▄▄ \n█     █\n█     █\n█     █\n ▀▀▀▀▀',
            'P': '██████▄\n█     █\n██████▀\n█      \n█',
            'Q': ' ▄▄▄▄▄ \n█     █\n█  █  █\n█   ▀▀█\n ▀▀▀▀▀▀',
            'R': '██████▄\n█     █\n██████▀\n█   █  \n█    █',
            'S': ' ▄▄▄▄▄▄\n█      \n ▀▀▀▀▀▄\n      █\n▄▄▄▄▄▀',
            'T': '███████\n   █   \n   █   \n   █   \n   █',
            'U': '█     █\n█     █\n█     █\n█     █\n ▀▀▀▀▀',
            'V': '█     █\n█     █\n█     █\n ▀   ▀ \n   ▀',
            'W': '█     █\n█     █\n█  ▄  █\n█ ▀ ▀ █\n▀     ▀',
            'X': '█     █\n ▀   ▀ \n   ▀   \n ▄   ▄ \n█     █',
            'Y': '█     █\n ▀   ▀ \n   ▀   \n   █   \n   █',
            'Z': '███████\n     ▄▀\n   ▄▀  \n ▄▀    \n███████'
        };
        
        const chars = text.toUpperCase().split('');
        const lines = ['', '', '', '', '', ''];
        
        chars.forEach(char => {
            if (bigLetters[char]) {
                const letterLines = bigLetters[char].split('\n');
                letterLines.forEach((line, index) => {
                    lines[index] += line + ' ';
                });
            } else if (char === ' ') {
                lines.forEach((line, index) => {
                    lines[index] += '   ';
                });
            }
        });
        
        return `🎨 **Text-Art: ${text}**\n\n\`\`\`\n${lines.join('\n')}\n\`\`\``;
    }

    generateColorText(text, style = 'rainbow') {
        const styles = {
            'rainbow': ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣'],
            'fire': ['🔥', '🧡', '❤️', '💛'],
            'ocean': ['🌊', '💙', '🔵', '💎'],
            'nature': ['🌱', '🌿', '🍃', '💚'],
            'space': ['⭐', '🌟', '✨', '🌙']
        };
        
        const colors = styles[style] || styles.rainbow;
        let coloredText = '';
        
        for (let i = 0; i < text.length; i++) {
            if (text[i] !== ' ') {
                coloredText += colors[i % colors.length] + text[i];
            } else {
                coloredText += ' ';
            }
        }
        
        return `🎨 **${style.toUpperCase()} Text**\n\n${coloredText}`;
    }

    generateRandomFact() {
        const facts = [
            'Honig verdirbt nie. Archäologen haben 3000 Jahre alten Honig gefunden, der noch essbar war!',
            'Bananen sind Beeren, aber Erdbeeren nicht.',
            'Ein Oktopus hat drei Herzen und blaues Blut.',
            'Flamingos sind nur rosa wegen ihrer Ernährung.',
            'Wombats haben würfelförmigen Kot.',
            'Seepferdchen sind die einzigen Tiere, bei denen das Männchen schwanger wird.',
            'Pinguine haben Knie, man kann sie nur nicht sehen.',
            'Koalas schlafen 22 Stunden am Tag.',
            'Delfine haben Namen für sich selbst.',
            'Elefanten können nicht springen.'
        ];
        
        const fact = facts[Math.floor(Math.random() * facts.length)];
        
        return `🤯 **Unglaublicher Fakt!**\n\n${fact}\n\n📚 Wissen ist Macht!`;
    }

    generateJoke() {
        const jokes = [
            'Warum nehmen Geister keine Drogen? Weil sie schon high genug sind! 👻',
            'Was ist grün und klopft an der Tür? Ein Klopfsalat! 🥬',
            'Warum können Geister so schlecht lügen? Weil man durch sie hindurchsehen kann! 👻',
            'Was ist weiß und stört beim Essen? Eine Lawine! ⛷️',
            'Warum ist ein Buch über Helium so gut? Man kann es nicht weglegen! 🎈',
            'Was sagt ein großer Stift zum kleinen Stift? Wachs-mal-stift! ✏️',
            'Warum summen Bienen? Weil sie den Text nicht kennen! 🐝',
            'Was ist rot und schlecht für die Zähne? Ein Ziegelstein! 🧱',
            'Warum gehen Ameisen nicht in die Kirche? Weil sie Insekten sind! 🐜',
            'Was ist gelb und kann nicht schwimmen? Ein Bagger! 🚜'
        ];
        
        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        
        return `😂 **Witz des Tages**\n\n${joke}\n\n🎭 Lachen ist die beste Medizin!`;
    }

    generateStoryPrompt() {
        const characters = ['ein mutiger Ritter', 'eine kluge Hexe', 'ein freundlicher Drache', 'ein neugieriger Roboter', 'eine geheimnisvolle Katze'];
        const settings = ['in einem verzauberten Wald', 'auf einem fernen Planeten', 'in einer unterirdischen Stadt', 'in der Zukunft', 'in einem magischen Schloss'];
        const conflicts = ['muss ein Rätsel lösen', 'sucht nach einem verlorenen Schatz', 'rettet die Welt', 'findet neue Freunde', 'entdeckt ein Geheimnis'];
        
        const character = characters[Math.floor(Math.random() * characters.length)];
        const setting = settings[Math.floor(Math.random() * settings.length)];
        const conflict = conflicts[Math.floor(Math.random() * conflicts.length)];
        
        return `📖 **Story-Prompt Generator**\n\n🎭 **Charakter:** ${character}\n🌍 **Setting:** ${setting}\n⚡ **Konflikt:** ${conflict}\n\n✍️ Schreibe deine eigene Geschichte mit diesen Elementen!`;
    }

    getCommands() {
        return {
            'meme': this.handleMeme.bind(this),
            'quote': this.handleQuote.bind(this),
            'ascii': this.handleAscii.bind(this),
            'textart': this.handleTextArt.bind(this),
            'colortext': this.handleColorText.bind(this),
            'fact': this.handleFact.bind(this),
            'joke': this.handleJoke.bind(this),
            'story': this.handleStory.bind(this),
            'inspire': this.handleInspire.bind(this),
            'creative': this.handleCreative.bind(this)
        };
    }

    async handleMeme(msg, args) {
        if (args.length === 0) {
            let memeText = `🎭 **Meme Generator**\n\n📝 **Verfügbare Templates:**\n`;
            this.memeTemplates.forEach((template, index) => {
                memeText += `${index + 1}. ${template}\n`;
            });
            memeText += `\n💡 Verwendung: !meme <nummer> <text>\n📝 Beispiel: !meme 1 Programmieren lernen`;
            
            return msg.reply(memeText);
        }

        const templateIndex = parseInt(args[0]) - 1;
        const text = args.slice(1).join(' ');
        
        if (templateIndex < 0 || templateIndex >= this.memeTemplates.length) {
            return msg.reply(`❌ Template ${args[0]} existiert nicht!\n\n💡 Verwende !meme ohne Parameter für alle Templates.`);
        }
        
        if (!text) {
            return msg.reply('❌ Bitte gib einen Text für das Meme an!');
        }
        
        const meme = this.generateMeme(this.memeTemplates[templateIndex], text);
        await msg.reply(meme);
    }

    async handleQuote(msg, args) {
        const quote = this.generateRandomQuote();
        await msg.reply(quote);
    }

    async handleAscii(msg, args) {
        if (args.length === 0) {
            const available = Object.keys(this.asciiArt).join(', ');
            return msg.reply(`🎨 **ASCII-Art Generator**\n\n📝 Verfügbar: ${available}\n\n💡 Verwendung: !ascii <typ>\n📝 Beispiel: !ascii heart`);
        }

        const type = args[0];
        const art = this.generateAsciiArt(type);
        await msg.reply(art);
    }

    async handleTextArt(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Verwendung: !textart <text>\n\n🎨 Beispiel: !textart HELLO\n💡 Funktioniert am besten mit kurzen Wörtern!');
        }

        const text = args.join(' ');
        
        if (text.length > 10) {
            return msg.reply('❌ Text zu lang! Maximal 10 Zeichen für beste Darstellung.');
        }
        
        const textArt = this.generateTextArt(text);
        await msg.reply(textArt);
    }

    async handleColorText(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Verwendung: !colortext <text> [stil]\n\n🎨 **Stile:** rainbow, fire, ocean, nature, space\n📝 Beispiel: !colortext Hello World rainbow');
        }

        const style = args[args.length - 1];
        const validStyles = ['rainbow', 'fire', 'ocean', 'nature', 'space'];
        
        let text, selectedStyle;
        
        if (validStyles.includes(style)) {
            text = args.slice(0, -1).join(' ');
            selectedStyle = style;
        } else {
            text = args.join(' ');
            selectedStyle = 'rainbow';
        }
        
        const coloredText = this.generateColorText(text, selectedStyle);
        await msg.reply(coloredText);
    }

    async handleFact(msg, args) {
        const fact = this.generateRandomFact();
        await msg.reply(fact);
    }

    async handleJoke(msg, args) {
        const joke = this.generateJoke();
        await msg.reply(joke);
    }

    async handleStory(msg, args) {
        const storyPrompt = this.generateStoryPrompt();
        await msg.reply(storyPrompt);
    }

    async handleInspire(msg, args) {
        const inspirations = [
            this.generateRandomQuote(),
            this.generateRandomFact(),
            this.generateStoryPrompt()
        ];
        
        const inspiration = inspirations[Math.floor(Math.random() * inspirations.length)];
        await msg.reply(inspiration);
    }

    async handleCreative(msg, args) {
        let creativeText = `🎨 **Creative Plugin - Übersicht**\n\n`;
        creativeText += `🎭 **!meme** - Meme Generator mit Templates\n`;
        creativeText += `💭 **!quote** - Inspirierende Zitate\n`;
        creativeText += `🎨 **!ascii** - ASCII-Art erstellen\n`;
        creativeText += `✨ **!textart** - Großer Text-Art\n`;
        creativeText += `🌈 **!colortext** - Bunter Text mit Emojis\n`;
        creativeText += `🤯 **!fact** - Unglaubliche Fakten\n`;
        creativeText += `😂 **!joke** - Lustige Witze\n`;
        creativeText += `📖 **!story** - Story-Prompt Generator\n`;
        creativeText += `✨ **!inspire** - Zufällige Inspiration\n\n`;
        creativeText += `💡 Verwende jeden Befehl ohne Parameter für Details!`;
        
        await msg.reply(creativeText);
    }
}