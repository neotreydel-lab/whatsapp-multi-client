// 🎲 Games Plugin
export default class GamesPlugin {
    constructor(client) {
        this.client = client;
        this.name = 'games-plugin';
        this.version = '1.0.0';
        this.description = 'Spiele-System mit Quiz, Würfel, RPS und mehr';
        
        this.quizQuestions = [
            { question: 'Was ist die Hauptstadt von Deutschland?', answers: ['Berlin', 'München', 'Hamburg', 'Köln'], correct: 0 },
            { question: 'Welches Jahr war die erste Mondlandung?', answers: ['1967', '1969', '1971', '1973'], correct: 1 },
            { question: 'Wer hat JavaScript erfunden?', answers: ['Bill Gates', 'Steve Jobs', 'Brendan Eich', 'Mark Zuckerberg'], correct: 2 },
            { question: 'Was ist 15 × 8?', answers: ['110', '120', '130', '140'], correct: 1 },
            { question: 'Welcher Planet ist der größte?', answers: ['Saturn', 'Jupiter', 'Neptun', 'Uranus'], correct: 1 }
        ];
    }

    rollDice(sides = 6) {
        return Math.floor(Math.random() * sides) + 1;
    }

    flipCoin() {
        return Math.random() < 0.5 ? 'Kopf' : 'Zahl';
    }

    playRPS(playerChoice) {
        const choices = ['rock', 'paper', 'scissors'];
        const botChoice = choices[Math.floor(Math.random() * 3)];
        
        const wins = {
            rock: 'scissors',
            paper: 'rock', 
            scissors: 'paper'
        };
        
        let result;
        if (playerChoice === botChoice) {
            result = 'tie';
        } else if (wins[playerChoice] === botChoice) {
            result = 'win';
        } else {
            result = 'lose';
        }
        
        return { playerChoice, botChoice, result };
    }

    getRandomQuestion() {
        return this.quizQuestions[Math.floor(Math.random() * this.quizQuestions.length)];
    }

    async startQuiz(userId, groupId) {
        const question = this.getRandomQuestion();
        const quizId = Date.now().toString();
        
        this.client.storage.write.in('games').set(`quiz.${quizId}`, {
            question: question.question,
            answers: question.answers,
            correct: question.correct,
            userId,
            groupId,
            startTime: Date.now(),
            answered: false
        });
        
        return { quizId, question };
    }

    async answerQuiz(quizId, answerIndex, userId) {
        const quiz = this.client.storage.read.from('games').get(`quiz.${quizId}`);
        
        if (!quiz || quiz.answered) {
            return { success: false, error: 'Quiz nicht gefunden oder bereits beantwortet' };
        }
        
        if (userId !== quiz.userId) {
            return { success: false, error: 'Das ist nicht dein Quiz!' };
        }
        
        const isCorrect = answerIndex === quiz.correct;
        const timeTaken = Date.now() - quiz.startTime;
        
        this.client.storage.write.in('games').set(`quiz.${quizId}.answered`, true);
        
        this.client.storage.write.in('games').increment(`stats.${userId}.quizzes`, 1);
        if (isCorrect) {
            this.client.storage.write.in('games').increment(`stats.${userId}.correct`, 1);
        }
        
        return {
            success: true,
            correct: isCorrect,
            correctAnswer: quiz.answers[quiz.correct],
            timeTaken: Math.round(timeTaken / 1000)
        };
    }

    async getLeaderboard(game = 'quiz') {
        const stats = this.client.storage.read.from('games').get('stats') || {};
        const leaderboard = [];
        
        Object.entries(stats).forEach(([userId, userStats]) => {
            if (userStats[game]) {
                leaderboard.push({
                    userId,
                    score: userStats.correct || 0,
                    total: userStats.quizzes || 0,
                    percentage: userStats.quizzes ? Math.round((userStats.correct / userStats.quizzes) * 100) : 0
                });
            }
        });
        
        leaderboard.sort((a, b) => b.score - a.score);
        return leaderboard.slice(0, 10);
    }
    getCommands() {
        return {
            'dice': this.handleDice.bind(this),
            'flip': this.handleFlip.bind(this),
            'rps': this.handleRPS.bind(this),
            'quiz': this.handleQuiz.bind(this),
            'answer': this.handleAnswer.bind(this),
            'gamestats': this.handleGameStats.bind(this),
            'gameleaderboard': this.handleGameLeaderboard.bind(this),
            'number': this.handleNumberGuess.bind(this)
        };
    }

    async handleDice(msg, args) {
        const sides = parseInt(args[0]) || 6;
        if (sides < 2 || sides > 100) {
            return msg.reply('❌ Würfel muss zwischen 2 und 100 Seiten haben!');
        }
        
        const result = this.rollDice(sides);
        await msg.reply(`🎲 **Würfel Ergebnis:**\n\n🎯 ${result} (von ${sides})`);
    }

    async handleFlip(msg, args) {
        const result = this.flipCoin();
        const emoji = result === 'Kopf' ? '🪙' : '💰';
        
        await msg.reply(`${emoji} **Münzwurf:**\n\n🎯 ${result}!`);
    }

    async handleRPS(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Verwendung: !rps <rock/paper/scissors>\n\n🪨 Rock\n📄 Paper\n✂️ Scissors');
        }
        
        const playerChoice = args[0].toLowerCase();
        const validChoices = ['rock', 'paper', 'scissors'];
        
        if (!validChoices.includes(playerChoice)) {
            return msg.reply('❌ Ungültige Wahl! Verwende: rock, paper oder scissors');
        }
        
        const game = this.playRPS(playerChoice);
        const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
        
        let resultText = `🎮 **Schere-Stein-Papier**\n\n`;
        resultText += `👤 Du: ${emojis[game.playerChoice]}\n`;
        resultText += `🤖 Bot: ${emojis[game.botChoice]}\n\n`;
        
        if (game.result === 'win') {
            resultText += '🎉 **Du gewinnst!**';
        } else if (game.result === 'lose') {
            resultText += '😔 **Du verlierst!**';
        } else {
            resultText += '🤝 **Unentschieden!**';
        }
        
        await msg.reply(resultText);
    }

    async handleQuiz(msg, args) {
        const userId = msg.getSender();
        const groupId = msg.from;
        
        const { quizId, question } = await this.startQuiz(userId, groupId);
        
        let quizText = `🧠 **Quiz Zeit!**\n\n`;
        quizText += `❓ ${question.question}\n\n`;
        
        question.answers.forEach((answer, index) => {
            quizText += `${index + 1}. ${answer}\n`;
        });
        
        quizText += `\n💡 Antworte mit: !answer ${quizId} <1-4>`;
        
        await msg.reply(quizText);
    }

    async handleAnswer(msg, args) {
        if (args.length < 2) {
            return msg.reply('❌ Verwendung: !answer <quiz-id> <antwort-nummer>');
        }
        
        const quizId = args[0];
        const answerIndex = parseInt(args[1]) - 1;
        const userId = msg.getSender();
        
        if (isNaN(answerIndex) || answerIndex < 0 || answerIndex > 3) {
            return msg.reply('❌ Antwort muss zwischen 1 und 4 sein!');
        }
        
        const result = await this.answerQuiz(quizId, answerIndex, userId);
        
        if (!result.success) {
            return msg.reply(`❌ ${result.error}`);
        }
        
        let resultText = `📊 **Quiz Ergebnis:**\n\n`;
        
        if (result.correct) {
            resultText += `✅ **Richtig!**\n`;
        } else {
            resultText += `❌ **Falsch!**\n`;
            resultText += `💡 Richtige Antwort: ${result.correctAnswer}\n`;
        }
        
        resultText += `⏱️ Zeit: ${result.timeTaken}s`;
        
        await msg.reply(resultText);
    }

    async handleGameStats(msg, args) {
        const userId = msg.getSender();
        const stats = this.client.storage.read.from('games').get(`stats.${userId}`) || {};
        
        const quizzes = stats.quizzes || 0;
        const correct = stats.correct || 0;
        const percentage = quizzes ? Math.round((correct / quizzes) * 100) : 0;
        
        let statsText = `📊 **Deine Game Stats:**\n\n`;
        statsText += `🧠 Quiz gespielt: ${quizzes}\n`;
        statsText += `✅ Richtige Antworten: ${correct}\n`;
        statsText += `📈 Erfolgsquote: ${percentage}%`;
        
        await msg.reply(statsText);
    }

    async handleGameLeaderboard(msg, args) {
        const leaderboard = await this.getLeaderboard('quiz');
        
        if (leaderboard.length === 0) {
            return msg.reply('📊 **Leaderboard ist leer!**\n\n🎮 Spiele !quiz um auf die Liste zu kommen');
        }
        
        let lbText = '🏆 **Quiz Leaderboard**\n\n';
        
        leaderboard.forEach((entry, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            lbText += `${medal} @${entry.userId.split('@')[0]}\n`;
            lbText += `✅ ${entry.score}/${entry.total} (${entry.percentage}%)\n\n`;
        });
        
        await msg.reply(lbText);
    }

    async handleNumberGuess(msg, args) {
        const userId = msg.getSender();
        const activeGame = this.client.storage.read.from('games').get(`number.${userId}`);
        
        if (!activeGame) {
            // Neues Spiel starten
            const number = Math.floor(Math.random() * 100) + 1;
            this.client.storage.write.in('games').set(`number.${userId}`, {
                number,
                attempts: 0,
                startTime: Date.now()
            });
            
            return msg.reply('🔢 **Zahlenraten gestartet!**\n\n🎯 Ich denke an eine Zahl zwischen 1 und 100\n💡 Rate mit: !number <zahl>');
        }
        
        if (args.length === 0) {
            return msg.reply('❌ Gib eine Zahl zwischen 1 und 100 ein!');
        }
        
        const guess = parseInt(args[0]);
        if (isNaN(guess) || guess < 1 || guess > 100) {
            return msg.reply('❌ Zahl muss zwischen 1 und 100 sein!');
        }
        
        activeGame.attempts++;
        this.client.storage.write.in('games').set(`number.${userId}.attempts`, activeGame.attempts);
        
        if (guess === activeGame.number) {
            const timeTaken = Math.round((Date.now() - activeGame.startTime) / 1000);
            this.client.storage.delete.from('games').key(`number.${userId}`);
            
            await msg.reply(`🎉 **Richtig geraten!**\n\n🎯 Die Zahl war: ${activeGame.number}\n🔢 Versuche: ${activeGame.attempts}\n⏱️ Zeit: ${timeTaken}s`);
        } else if (guess < activeGame.number) {
            await msg.reply(`📈 **Zu niedrig!**\n\n🔢 Versuch ${activeGame.attempts}: ${guess}\n💡 Die Zahl ist höher`);
        } else {
            await msg.reply(`📉 **Zu hoch!**\n\n🔢 Versuch ${activeGame.attempts}: ${guess}\n💡 Die Zahl ist niedriger`);
        }
    }
}