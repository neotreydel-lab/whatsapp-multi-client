import { getStorage } from "./storage.js";
import { ErrorHandler } from "./error-handler.js";

export class GamingManager {
    constructor(client) {
        this.client = client;
        this.storage = getStorage();
        this.errorHandler = new ErrorHandler();
        this.activeGames = new Map();
        this.gameTemplates = new Map();
        this.playerStats = new Map();
        this.leaderboards = new Map();
        this.tournaments = new Map();
        
        this.initializeGaming();
    }
    
    // ===== INITIALIZATION =====
    
    initializeGaming() {
        this.loadGameData();
        this.registerDefaultGames();
        this.startGameMaintenanceJob();
    }
    
    loadGameData() {
        try {
            const gameData = this.storage.read.from("gaming").get("data") || {};
            this.playerStats = new Map(Object.entries(gameData.playerStats || {}));
            this.leaderboards = new Map(Object.entries(gameData.leaderboards || {}));
            this.tournaments = new Map(Object.entries(gameData.tournaments || {}));
        } catch (error) {
            this.errorHandler.handle(error, 'GamingManager.loadGameData');
        }
    }
    
    registerDefaultGames() {
        // Quiz Game
        this.registerGame('quiz', {
            name: 'Quiz Game',
            description: 'Answer questions to earn points',
            minPlayers: 1,
            maxPlayers: 10,
            duration: 300000, // 5 minutes
            gameLogic: this.quizGameLogic.bind(this)
        });
        
        // Number Guessing Game
        this.registerGame('guess', {
            name: 'Number Guessing',
            description: 'Guess the secret number',
            minPlayers: 1,
            maxPlayers: 5,
            duration: 180000, // 3 minutes
            gameLogic: this.guessGameLogic.bind(this)
        });
        
        // Word Chain Game
        this.registerGame('wordchain', {
            name: 'Word Chain',
            description: 'Create a chain of words',
            minPlayers: 2,
            maxPlayers: 8,
            duration: 600000, // 10 minutes
            gameLogic: this.wordChainLogic.bind(this)
        });
        
        // Trivia Game
        this.registerGame('trivia', {
            name: 'Trivia Challenge',
            description: 'Test your knowledge',
            minPlayers: 1,
            maxPlayers: 15,
            duration: 420000, // 7 minutes
            gameLogic: this.triviaGameLogic.bind(this)
        });
        
        // Math Challenge
        this.registerGame('math', {
            name: 'Math Challenge',
            description: 'Solve math problems quickly',
            minPlayers: 1,
            maxPlayers: 6,
            duration: 240000, // 4 minutes
            gameLogic: this.mathGameLogic.bind(this)
        });
    }
    
    startGameMaintenanceJob() {
        setInterval(() => {
            this.cleanupExpiredGames();
            this.updateLeaderboards();
        }, 60000); // Every minute
    }
    
    // ===== GAME MANAGEMENT =====
    
    registerGame(gameId, gameTemplate) {
        this.gameTemplates.set(gameId, {
            id: gameId,
            ...gameTemplate,
            createdAt: Date.now()
        });
        
        console.log(`🎮 Game registered: ${gameTemplate.name}`);
    }
    
    async startGame(chatId, gameId, options = {}) {
        try {
            const template = this.gameTemplates.get(gameId);
            if (!template) {
                throw new Error(`Game not found: ${gameId}`);
            }
            
            const gameInstanceId = this.generateGameId();
            const game = {
                id: gameInstanceId,
                gameId,
                chatId,
                template,
                players: new Map(),
                state: 'waiting',
                data: {},
                startTime: null,
                endTime: null,
                winner: null,
                scores: new Map(),
                options: {
                    autoStart: options.autoStart || false,
                    maxWaitTime: options.maxWaitTime || 60000,
                    ...options
                },
                createdAt: Date.now()
            };
            
            this.activeGames.set(gameInstanceId, game);
            
            await this.client.sendMessage(chatId, 
                `🎮 *${template.name}* wurde gestartet!\n\n` +
                `📝 ${template.description}\n` +
                `👥 Spieler: ${template.minPlayers}-${template.maxPlayers}\n` +
                `⏱️ Dauer: ${Math.floor(template.duration / 60000)} Minuten\n\n` +
                `Schreibe *!join* um mitzuspielen!`
            );
            
            // Auto-start timer if enabled
            if (game.options.autoStart) {
                setTimeout(() => {
                    this.forceStartGame(gameInstanceId);
                }, game.options.maxWaitTime);
            }
            
            return gameInstanceId;
        } catch (error) {
            this.errorHandler.handle(error, 'GamingManager.startGame');
            throw error;
        }
    }
    
    async joinGame(chatId, playerId, playerName) {
        try {
            const game = this.findActiveGameByChat(chatId);
            if (!game) {
                await this.client.sendMessage(chatId, '❌ Kein aktives Spiel gefunden!');
                return false;
            }
            
            if (game.state !== 'waiting') {
                await this.client.sendMessage(chatId, '❌ Das Spiel hat bereits begonnen!');
                return false;
            }
            
            if (game.players.has(playerId)) {
                await this.client.sendMessage(chatId, '❌ Du bist bereits im Spiel!');
                return false;
            }
            
            if (game.players.size >= game.template.maxPlayers) {
                await this.client.sendMessage(chatId, '❌ Das Spiel ist bereits voll!');
                return false;
            }
            
            game.players.set(playerId, {
                id: playerId,
                name: playerName,
                score: 0,
                joinedAt: Date.now(),
                isActive: true
            });
            
            await this.client.sendMessage(chatId, 
                `✅ ${playerName} ist dem Spiel beigetreten!\n` +
                `👥 Spieler: ${game.players.size}/${game.template.maxPlayers}\n\n` +
                `${game.players.size >= game.template.minPlayers ? 
                    'Schreibe *!start* um das Spiel zu beginnen!' : 
                    `Noch ${game.template.minPlayers - game.players.size} Spieler benötigt!`}`
            );
            
            return true;
        } catch (error) {
            this.errorHandler.handle(error, 'GamingManager.joinGame');
            return false;
        }
    }
    
    async forceStartGame(gameInstanceId) {
        try {
            const game = this.activeGames.get(gameInstanceId);
            if (!game || game.state !== 'waiting') return false;
            
            if (game.players.size < game.template.minPlayers) {
                await this.client.sendMessage(game.chatId, 
                    `❌ Nicht genügend Spieler! Mindestens ${game.template.minPlayers} Spieler benötigt.`
                );
                this.endGame(gameInstanceId, 'cancelled');
                return false;
            }
            
            game.state = 'active';
            game.startTime = Date.now();
            
            await this.client.sendMessage(game.chatId, 
                `🚀 *${game.template.name}* beginnt jetzt!\n\n` +
                `👥 Spieler: ${Array.from(game.players.values()).map(p => p.name).join(', ')}\n` +
                `⏱️ Zeit: ${Math.floor(game.template.duration / 60000)} Minuten`
            );
            
            // Start game logic
            await game.template.gameLogic(game);
            
            // Set end timer
            setTimeout(() => {
                this.endGame(gameInstanceId, 'timeout');
            }, game.template.duration);
            
            return true;
        } catch (error) {
            this.errorHandler.handle(error, 'GamingManager.forceStartGame');
            return false;
        }
    }
    
    async endGame(gameInstanceId, reason = 'completed') {
        try {
            const game = this.activeGames.get(gameInstanceId);
            if (!game) return;
            
            game.state = 'ended';
            game.endTime = Date.now();
            
            // Calculate final scores and winner
            const sortedPlayers = Array.from(game.players.values())
                .sort((a, b) => b.score - a.score);
            
            if (sortedPlayers.length > 0) {
                game.winner = sortedPlayers[0];
            }
            
            // Update player statistics
            for (const player of game.players.values()) {
                this.updatePlayerStats(player.id, game.gameId, player.score, player === game.winner);
            }
            
            // Send results
            await this.sendGameResults(game, reason);
            
            // Update leaderboards
            this.updateGameLeaderboard(game.gameId, sortedPlayers);
            
            // Clean up
            this.activeGames.delete(gameInstanceId);
            
        } catch (error) {
            this.errorHandler.handle(error, 'GamingManager.endGame');
        }
    }
    
    // ===== GAME LOGIC IMPLEMENTATIONS =====
    
    async quizGameLogic(game) {
        const questions = [
            { q: "Was ist die Hauptstadt von Deutschland?", a: ["berlin"], points: 10 },
            { q: "Wie viele Kontinente gibt es?", a: ["7", "sieben"], points: 10 },
            { q: "Welcher Planet ist der Sonne am nächsten?", a: ["merkur"], points: 15 },
            { q: "In welchem Jahr fiel die Berliner Mauer?", a: ["1989"], points: 20 },
            { q: "Wie heißt der größte Ozean der Welt?", a: ["pazifik", "pazifischer ozean"], points: 15 }
        ];
        
        game.data.questions = questions;
        game.data.currentQuestion = 0;
        game.data.questionStartTime = Date.now();
        
        await this.askNextQuestion(game);
    }
    
    async askNextQuestion(game) {
        if (game.data.currentQuestion >= game.data.questions.length) {
            this.endGame(game.id, 'completed');
            return;
        }
        
        const question = game.data.questions[game.data.currentQuestion];
        game.data.questionStartTime = Date.now();
        game.data.answered = new Set();
        
        await this.client.sendMessage(game.chatId, 
            `❓ *Frage ${game.data.currentQuestion + 1}/${game.data.questions.length}*\n\n` +
            `${question.q}\n\n` +
            `💰 Punkte: ${question.points}\n` +
            `⏱️ Zeit: 30 Sekunden`
        );
        
        // Set question timeout
        setTimeout(() => {
            if (game.state === 'active') {
                this.nextQuestion(game);
            }
        }, 30000);
    }
    
    async nextQuestion(game) {
        const question = game.data.questions[game.data.currentQuestion];
        
        await this.client.sendMessage(game.chatId, 
            `⏰ Zeit abgelaufen!\n` +
            `✅ Richtige Antwort: ${question.a[0]}\n\n` +
            `Nächste Frage in 3 Sekunden...`
        );
        
        game.data.currentQuestion++;
        
        setTimeout(() => {
            if (game.state === 'active') {
                this.askNextQuestion(game);
            }
        }, 3000);
    }
    
    async guessGameLogic(game) {
        game.data.secretNumber = Math.floor(Math.random() * 100) + 1;
        game.data.attempts = new Map();
        game.data.maxAttempts = 10;
        
        await this.client.sendMessage(game.chatId, 
            `🔢 *Zahlen-Raten*\n\n` +
            `Ich denke an eine Zahl zwischen 1 und 100!\n` +
            `Du hast ${game.data.maxAttempts} Versuche.\n\n` +
            `Schreibe einfach eine Zahl um zu raten!`
        );
    }
    
    async wordChainLogic(game) {
        game.data.usedWords = new Set();
        game.data.currentWord = null;
        game.data.currentPlayer = Array.from(game.players.keys())[0];
        game.data.chain = [];
        
        const startWords = ['apfel', 'baum', 'computer', 'deutschland', 'elefant'];
        const startWord = startWords[Math.floor(Math.random() * startWords.length)];
        
        game.data.currentWord = startWord;
        game.data.usedWords.add(startWord);
        game.data.chain.push(startWord);
        
        await this.client.sendMessage(game.chatId, 
            `🔗 *Wort-Kette*\n\n` +
            `Startwort: *${startWord}*\n\n` +
            `Das nächste Wort muss mit "${startWord.slice(-1).toUpperCase()}" beginnen!\n` +
            `Spieler: ${game.players.get(game.data.currentPlayer).name}`
        );
    }
    
    async triviaGameLogic(game) {
        const categories = ['Geschichte', 'Wissenschaft', 'Sport', 'Geographie', 'Kultur'];
        game.data.categories = categories;
        game.data.currentCategory = 0;
        game.data.questionsPerCategory = 2;
        game.data.currentCategoryQuestion = 0;
        
        await this.startTriviaCategory(game);
    }
    
    async mathGameLogic(game) {
        game.data.problems = [];
        game.data.currentProblem = 0;
        game.data.totalProblems = 10;
        
        // Generate math problems
        for (let i = 0; i < game.data.totalProblems; i++) {
            const problem = this.generateMathProblem(i + 1);
            game.data.problems.push(problem);
        }
        
        await this.askMathProblem(game);
    }
    
    // ===== MESSAGE HANDLING =====
    
    async handleGameMessage(chatId, playerId, message) {
        try {
            const game = this.findActiveGameByChat(chatId);
            if (!game || game.state !== 'active') return false;
            
            const player = game.players.get(playerId);
            if (!player || !player.isActive) return false;
            
            switch (game.gameId) {
                case 'quiz':
                    return await this.handleQuizAnswer(game, playerId, message);
                case 'guess':
                    return await this.handleGuessAnswer(game, playerId, message);
                case 'wordchain':
                    return await this.handleWordChainAnswer(game, playerId, message);
                case 'trivia':
                    return await this.handleTriviaAnswer(game, playerId, message);
                case 'math':
                    return await this.handleMathAnswer(game, playerId, message);
                default:
                    return false;
            }
        } catch (error) {
            this.errorHandler.handle(error, 'GamingManager.handleGameMessage');
            return false;
        }
    }
    
    async handleQuizAnswer(game, playerId, message) {
        if (game.data.currentQuestion >= game.data.questions.length) return false;
        if (game.data.answered.has(playerId)) return false;
        
        const question = game.data.questions[game.data.currentQuestion];
        const answer = message.toLowerCase().trim();
        const isCorrect = question.a.some(a => a.toLowerCase() === answer);
        
        game.data.answered.add(playerId);
        
        if (isCorrect) {
            const player = game.players.get(playerId);
            const timeBonus = Math.max(0, 30 - Math.floor((Date.now() - game.data.questionStartTime) / 1000));
            const points = question.points + timeBonus;
            
            player.score += points;
            
            await this.client.sendMessage(game.chatId, 
                `✅ ${player.name} hat richtig geantwortet!\n` +
                `💰 +${points} Punkte (${timeBonus} Zeitbonus)`
            );
            
            // Move to next question after short delay
            setTimeout(() => {
                if (game.state === 'active') {
                    this.nextQuestion(game);
                }
            }, 2000);
        }
        
        return true;
    }
    
    async handleGuessAnswer(game, playerId, message) {
        const guess = parseInt(message.trim());
        if (isNaN(guess) || guess < 1 || guess > 100) return false;
        
        const player = game.players.get(playerId);
        const attempts = game.data.attempts.get(playerId) || 0;
        
        if (attempts >= game.data.maxAttempts) {
            await this.client.sendMessage(game.chatId, 
                `❌ ${player.name}, du hast bereits alle Versuche aufgebraucht!`
            );
            return true;
        }
        
        game.data.attempts.set(playerId, attempts + 1);
        
        if (guess === game.data.secretNumber) {
            const points = Math.max(10, 100 - (attempts * 10));
            player.score += points;
            
            await this.client.sendMessage(game.chatId, 
                `🎉 ${player.name} hat die Zahl ${game.data.secretNumber} erraten!\n` +
                `💰 +${points} Punkte`
            );
            
            this.endGame(game.id, 'completed');
        } else {
            const hint = guess < game.data.secretNumber ? 'höher' : 'niedriger';
            const remaining = game.data.maxAttempts - attempts - 1;
            
            await this.client.sendMessage(game.chatId, 
                `${guess < game.data.secretNumber ? '⬆️' : '⬇️'} ${player.name}: ${guess} ist zu ${hint}!\n` +
                `Versuche übrig: ${remaining}`
            );
        }
        
        return true;
    }
    
    // ===== PLAYER STATISTICS =====
    
    updatePlayerStats(playerId, gameId, score, isWinner) {
        const stats = this.playerStats.get(playerId) || {
            totalGames: 0,
            totalWins: 0,
            totalScore: 0,
            gameStats: {},
            achievements: [],
            level: 1,
            experience: 0
        };
        
        stats.totalGames++;
        stats.totalScore += score;
        stats.experience += score;
        
        if (isWinner) {
            stats.totalWins++;
            stats.experience += 50; // Bonus for winning
        }
        
        // Game-specific stats
        if (!stats.gameStats[gameId]) {
            stats.gameStats[gameId] = {
                played: 0,
                won: 0,
                bestScore: 0,
                totalScore: 0
            };
        }
        
        const gameStats = stats.gameStats[gameId];
        gameStats.played++;
        gameStats.totalScore += score;
        gameStats.bestScore = Math.max(gameStats.bestScore, score);
        
        if (isWinner) {
            gameStats.won++;
        }
        
        // Level calculation
        const newLevel = Math.floor(stats.experience / 1000) + 1;
        if (newLevel > stats.level) {
            stats.level = newLevel;
            // Achievement for leveling up
            this.checkAchievements(playerId, stats);
        }
        
        this.playerStats.set(playerId, stats);
        this.saveGameData();
    }
    
    checkAchievements(playerId, stats) {
        const achievements = [];
        
        // Level achievements
        if (stats.level >= 5 && !stats.achievements.includes('level_5')) {
            achievements.push({ id: 'level_5', name: 'Erfahrener Spieler', description: 'Level 5 erreicht' });
        }
        
        // Win achievements
        if (stats.totalWins >= 10 && !stats.achievements.includes('winner_10')) {
            achievements.push({ id: 'winner_10', name: 'Gewinner', description: '10 Spiele gewonnen' });
        }
        
        // Game-specific achievements
        if (stats.totalGames >= 50 && !stats.achievements.includes('veteran')) {
            achievements.push({ id: 'veteran', name: 'Veteran', description: '50 Spiele gespielt' });
        }
        
        // Add new achievements
        achievements.forEach(achievement => {
            if (!stats.achievements.includes(achievement.id)) {
                stats.achievements.push(achievement.id);
            }
        });
        
        return achievements;
    }
    
    // ===== LEADERBOARDS =====
    
    updateGameLeaderboard(gameId, players) {
        const leaderboard = this.leaderboards.get(gameId) || [];
        
        players.forEach(player => {
            const existingIndex = leaderboard.findIndex(p => p.id === player.id);
            
            if (existingIndex >= 0) {
                // Update existing player
                const existing = leaderboard[existingIndex];
                existing.totalScore += player.score;
                existing.gamesPlayed++;
                existing.lastPlayed = Date.now();
                
                if (player.score > existing.bestScore) {
                    existing.bestScore = player.score;
                }
            } else {
                // Add new player
                leaderboard.push({
                    id: player.id,
                    name: player.name,
                    totalScore: player.score,
                    bestScore: player.score,
                    gamesPlayed: 1,
                    lastPlayed: Date.now()
                });
            }
        });
        
        // Sort by total score
        leaderboard.sort((a, b) => b.totalScore - a.totalScore);
        
        // Keep only top 50
        if (leaderboard.length > 50) {
            leaderboard.splice(50);
        }
        
        this.leaderboards.set(gameId, leaderboard);
        this.saveGameData();
    }
    
    async showLeaderboard(chatId, gameId = 'overall', limit = 10) {
        try {
            let leaderboard;
            let title;
            
            if (gameId === 'overall') {
                // Overall leaderboard based on total experience
                leaderboard = Array.from(this.playerStats.entries())
                    .map(([id, stats]) => ({
                        id,
                        name: stats.name || id,
                        score: stats.experience,
                        level: stats.level,
                        wins: stats.totalWins,
                        games: stats.totalGames
                    }))
                    .sort((a, b) => b.score - a.score)
                    .slice(0, limit);
                
                title = '🏆 *Gesamt-Bestenliste*';
            } else {
                leaderboard = (this.leaderboards.get(gameId) || []).slice(0, limit);
                const game = this.gameTemplates.get(gameId);
                title = `🏆 *${game ? game.name : gameId} Bestenliste*`;
            }
            
            if (leaderboard.length === 0) {
                await this.client.sendMessage(chatId, '📊 Noch keine Einträge in der Bestenliste!');
                return;
            }
            
            let message = title + '\n\n';
            
            leaderboard.forEach((player, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                
                if (gameId === 'overall') {
                    message += `${medal} ${player.name}\n`;
                    message += `   💰 ${player.score} XP | 🎯 Level ${player.level}\n`;
                    message += `   🏆 ${player.wins}/${player.games} Siege\n\n`;
                } else {
                    message += `${medal} ${player.name}\n`;
                    message += `   💰 ${player.totalScore} Punkte\n`;
                    message += `   🎯 Bester Score: ${player.bestScore}\n`;
                    message += `   🎮 ${player.gamesPlayed} Spiele\n\n`;
                }
            });
            
            await this.client.sendMessage(chatId, message);
        } catch (error) {
            this.errorHandler.handle(error, 'GamingManager.showLeaderboard');
        }
    }
    
    // ===== TOURNAMENTS =====
    
    async createTournament(chatId, gameId, options = {}) {
        try {
            const template = this.gameTemplates.get(gameId);
            if (!template) {
                throw new Error(`Game not found: ${gameId}`);
            }
            
            const tournamentId = this.generateTournamentId();
            const tournament = {
                id: tournamentId,
                gameId,
                chatId,
                name: options.name || `${template.name} Turnier`,
                description: options.description || `Turnier für ${template.name}`,
                maxParticipants: options.maxParticipants || 16,
                entryFee: options.entryFee || 0,
                prizePool: options.prizePool || 0,
                participants: new Map(),
                rounds: [],
                currentRound: 0,
                state: 'registration',
                startTime: options.startTime || (Date.now() + 300000), // 5 minutes from now
                createdAt: Date.now(),
                createdBy: options.createdBy
            };
            
            this.tournaments.set(tournamentId, tournament);
            
            await this.client.sendMessage(chatId, 
                `🏆 *${tournament.name}*\n\n` +
                `🎮 Spiel: ${template.name}\n` +
                `👥 Max. Teilnehmer: ${tournament.maxParticipants}\n` +
                `💰 Eintritt: ${tournament.entryFee} Punkte\n` +
                `🏅 Preispool: ${tournament.prizePool} Punkte\n\n` +
                `Schreibe *!tournament join ${tournamentId}* um teilzunehmen!\n` +
                `Start: ${new Date(tournament.startTime).toLocaleString()}`
            );
            
            return tournamentId;
        } catch (error) {
            this.errorHandler.handle(error, 'GamingManager.createTournament');
            throw error;
        }
    }
    
    // ===== UTILITY METHODS =====
    
    findActiveGameByChat(chatId) {
        for (const game of this.activeGames.values()) {
            if (game.chatId === chatId && game.state !== 'ended') {
                return game;
            }
        }
        return null;
    }
    
    generateGameId() {
        return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    generateTournamentId() {
        return `tournament_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }
    
    generateMathProblem(difficulty) {
        const operations = ['+', '-', '*'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let a, b, answer;
        
        switch (operation) {
            case '+':
                a = Math.floor(Math.random() * (10 * difficulty)) + 1;
                b = Math.floor(Math.random() * (10 * difficulty)) + 1;
                answer = a + b;
                break;
            case '-':
                a = Math.floor(Math.random() * (10 * difficulty)) + 10;
                b = Math.floor(Math.random() * a) + 1;
                answer = a - b;
                break;
            case '*':
                a = Math.floor(Math.random() * (5 + difficulty)) + 1;
                b = Math.floor(Math.random() * (5 + difficulty)) + 1;
                answer = a * b;
                break;
        }
        
        return {
            question: `${a} ${operation} ${b} = ?`,
            answer,
            points: difficulty * 5
        };
    }
    
    cleanupExpiredGames() {
        const now = Date.now();
        const expiredGames = [];
        
        for (const [gameId, game] of this.activeGames) {
            const maxGameTime = game.template.duration + 300000; // 5 minutes grace period
            if (game.createdAt + maxGameTime < now) {
                expiredGames.push(gameId);
            }
        }
        
        expiredGames.forEach(gameId => {
            this.endGame(gameId, 'expired');
        });
    }
    
    saveGameData() {
        try {
            const gameData = {
                playerStats: Object.fromEntries(this.playerStats),
                leaderboards: Object.fromEntries(this.leaderboards),
                tournaments: Object.fromEntries(this.tournaments)
            };
            
            this.storage.write.to("gaming").set("data", gameData);
        } catch (error) {
            this.errorHandler.handle(error, 'GamingManager.saveGameData');
        }
    }
    
    // ===== PUBLIC API METHODS =====
    
    getAvailableGames() {
        return Array.from(this.gameTemplates.values());
    }
    
    getActiveGames() {
        return Array.from(this.activeGames.values());
    }
    
    getPlayerStats(playerId) {
        return this.playerStats.get(playerId);
    }
    
    async sendGameResults(game, reason) {
        const players = Array.from(game.players.values()).sort((a, b) => b.score - a.score);
        
        let message = `🎮 *${game.template.name}* beendet!\n\n`;
        
        if (reason === 'timeout') {
            message += '⏰ Zeit abgelaufen!\n\n';
        } else if (reason === 'completed') {
            message += '✅ Spiel abgeschlossen!\n\n';
        }
        
        message += '🏆 *Endergebnis:*\n';
        
        players.forEach((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            message += `${medal} ${player.name}: ${player.score} Punkte\n`;
        });
        
        if (game.winner) {
            message += `\n🎉 Gewinner: ${game.winner.name}!`;
        }
        
        await this.client.sendMessage(game.chatId, message);
    }
}