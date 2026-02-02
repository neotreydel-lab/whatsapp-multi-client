// 🎵 Music Plugin mit yt-dlp
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default class MusicPlugin {
    constructor(client) {
        this.client = client;
        this.name = 'music-plugin';
        this.version = '1.0.0';
        this.description = 'Music System mit YouTube Download und Spotify Integration';
    }

    async searchYouTube(query) {
        try {
            const { stdout } = await execAsync(`yt-dlp --dump-json "ytsearch5:${query}"`);
            const results = stdout.trim().split('\n').map(line => JSON.parse(line));
            
            return results.map(video => ({
                id: video.id,
                title: video.title,
                duration: video.duration,
                uploader: video.uploader,
                url: video.webpage_url,
                thumbnail: video.thumbnail
            }));
        } catch (error) {
            console.error('YouTube Search Error:', error);
            return [];
        }
    }

    async getVideoInfo(url) {
        try {
            const { stdout } = await execAsync(`yt-dlp --dump-json "${url}"`);
            const info = JSON.parse(stdout);
            
            return {
                id: info.id,
                title: info.title,
                duration: info.duration,
                uploader: info.uploader,
                description: info.description,
                thumbnail: info.thumbnail,
                formats: info.formats
            };
        } catch (error) {
            console.error('Video Info Error:', error);
            return null;
        }
    }

    async downloadAudio(url, quality = 'best') {
        try {
            const outputPath = `./downloads/%(title)s.%(ext)s`;
            const command = `yt-dlp -x --audio-format mp3 --audio-quality ${quality} -o "${outputPath}" "${url}"`;
            
            const { stdout } = await execAsync(command);
            return { success: true, output: stdout };
        } catch (error) {
            console.error('Download Error:', error);
            return { success: false, error: error.message };
        }
    }

    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    async createPlaylist(userId, name) {
        const playlistId = Date.now().toString();
        this.client.storage.write.in('music').set(`playlists.${playlistId}`, {
            id: playlistId,
            name,
            owner: userId,
            songs: [],
            created: Date.now()
        });
        
        return playlistId;
    }

    async addToPlaylist(playlistId, song) {
        this.client.storage.write.in('music').push(`playlists.${playlistId}.songs`, song);
    }

    async getUserPlaylists(userId) {
        const playlists = this.client.storage.read.from('music').get('playlists') || {};
        return Object.values(playlists).filter(playlist => playlist.owner === userId);
    }

    getCommands() {
        return {
            'music': this.handleMusic.bind(this),
            'youtube': this.handleYouTube.bind(this),
            'download': this.handleDownload.bind(this),
            'playlist': this.handlePlaylist.bind(this),
            'lyrics': this.handleLyrics.bind(this),
            'spotify': this.handleSpotify.bind(this)
        };
    }

    async handleMusic(msg, args) {
        if (args.length === 0) {
            return msg.reply(`🎵 **Music Plugin Commands:**

🔍 !music search <song> - Musik suchen
📺 !youtube <query> - YouTube suchen  
⬇️ !download <url> - Audio downloaden
📋 !playlist - Playlist verwalten
📝 !lyrics <song> - Songtexte suchen
🎧 !spotify - Spotify Features`);
        }

        const action = args[0].toLowerCase();
        const query = args.slice(1).join(' ');

        if (action === 'search') {
            if (!query) return msg.reply('❌ Gib einen Suchbegriff ein!');
            
            await msg.reply('🔍 Suche Musik...');
            const results = await this.searchYouTube(query);
            
            if (results.length === 0) {
                return msg.reply('❌ Keine Ergebnisse gefunden!');
            }

            let resultText = `🎵 **Suchergebnisse für "${query}":**\n\n`;
            results.slice(0, 3).forEach((video, index) => {
                resultText += `${index + 1}. **${video.title}**\n`;
                resultText += `👤 ${video.uploader}\n`;
                resultText += `⏱️ ${this.formatDuration(video.duration)}\n`;
                resultText += `🔗 ${video.url}\n\n`;
            });

            await msg.reply(resultText);
        }
    }

    async handleYouTube(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Verwendung: !youtube <suchbegriff>');
        }

        const query = args.join(' ');
        await msg.reply('📺 Suche auf YouTube...');
        
        const results = await this.searchYouTube(query);
        
        if (results.length === 0) {
            return msg.reply('❌ Keine YouTube Videos gefunden!');
        }

        let resultText = `📺 **YouTube Ergebnisse:**\n\n`;
        results.slice(0, 5).forEach((video, index) => {
            resultText += `${index + 1}. **${video.title}**\n`;
            resultText += `👤 ${video.uploader}\n`;
            resultText += `⏱️ ${this.formatDuration(video.duration)}\n`;
            resultText += `🔗 ${video.url}\n\n`;
        });

        resultText += '⬇️ Download mit: !download <url>';
        await msg.reply(resultText);
    }
    async handleDownload(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Verwendung: !download <youtube-url>');
        }

        const url = args[0];
        await msg.reply('⬇️ Starte Download...');
        
        const result = await this.downloadAudio(url);
        
        if (result.success) {
            await msg.reply('✅ Download erfolgreich! Audio wird verarbeitet...');
        } else {
            await msg.reply(`❌ Download fehlgeschlagen: ${result.error}`);
        }
    }

    async handlePlaylist(msg, args) {
        const userId = msg.getSender();
        
        if (args.length === 0) {
            const playlists = await this.getUserPlaylists(userId);
            
            if (playlists.length === 0) {
                return msg.reply('📋 **Keine Playlists gefunden!**\n\n💡 Erstelle eine mit: !playlist create <name>');
            }
            
            let playlistText = '📋 **Deine Playlists:**\n\n';
            playlists.forEach((playlist, index) => {
                playlistText += `${index + 1}. **${playlist.name}**\n`;
                playlistText += `🎵 ${playlist.songs.length} Songs\n`;
                playlistText += `📅 Erstellt: ${new Date(playlist.created).toLocaleDateString()}\n\n`;
            });
            
            await msg.reply(playlistText);
        }
    }

    async handleLyrics(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Verwendung: !lyrics <song title>');
        }

        const song = args.join(' ');
        await msg.reply(`🔍 Suche Songtexte für "${song}"...`);
        
        // Placeholder - hier würdest du eine Lyrics API verwenden
        await msg.reply(`📝 **Songtexte für "${song}":**\n\n_Lyrics API Integration folgt..._\n\n💡 Verwende eine Lyrics API wie Genius oder AZLyrics`);
    }

    async handleSpotify(msg, args) {
        await msg.reply(`🎧 **Spotify Integration:**\n\n_Spotify API Integration folgt..._\n\n💡 Features:\n• Now Playing\n• Playlists\n• Search\n• Recommendations`);
    }
}