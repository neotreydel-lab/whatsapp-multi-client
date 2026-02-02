// 🔌 WAEngine Plugin Manager - Auto-Plugin System
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

export class PluginManager {
    constructor(client) {
        this.client = client;
        this.plugins = new Map();
        this.pluginsDir = './plugins';
        this.availablePlugins = [
            'economy-system',
            'games-plugin',
            'music-plugin',
            'travel-plugin',
            'education-plugin',
            'moderation-plugin',
            'creative-plugin',
            'analytics-plugin'
        ];
        
        this.ensurePluginsDirectory();
    }

    ensurePluginsDirectory() {
        if (!existsSync(this.pluginsDir)) {
            mkdirSync(this.pluginsDir, { recursive: true });
            console.log('📁 Plugins Ordner erstellt');
        }
    }

    async load(pluginName) {
        try {
            console.log(`🔌 Lade Plugin: ${pluginName}`);
            
            // Plugin importieren mit korrekter Windows file:// URL
            const pluginPath = join(process.cwd(), this.pluginsDir, pluginName, 'index.js');
            
            if (!existsSync(pluginPath)) {
                console.log(`📝 Plugin ${pluginName} nicht gefunden - wird übersprungen`);
                return null;
            }
            
            // Windows-kompatible file:// URL erstellen
            const pluginUrl = pathToFileURL(pluginPath).href;
            console.log(`📂 Plugin Pfad: ${pluginUrl}`);
            
            const { default: PluginClass } = await import(pluginUrl);
            
            // Plugin instanziieren
            const plugin = new PluginClass(this.client);
            this.plugins.set(pluginName, plugin);
            
            // Commands registrieren
            await this.registerPluginCommands(plugin);
            
            console.log(`✅ Plugin geladen: ${pluginName} v${plugin.version}`);
            return plugin;
            
        } catch (error) {
            console.error(`❌ Plugin Fehler: ${pluginName}`, error.message);
            return null;
        }
    }

    async loadAllPlugins() {
        console.log('🚀 Lade alle verfügbaren Plugins...');
        
        for (const pluginName of this.availablePlugins) {
            await this.load(pluginName);
        }
        
        console.log(`✅ ${this.plugins.size} Plugins geladen`);
    }

    async registerPluginCommands(plugin) {
        const commands = plugin.getCommands();
        
        Object.entries(commands).forEach(([commandName, handler]) => {
            this.client.addCommand(commandName, async (msg, args) => {
                try {
                    // Plugin-Context zu Message hinzufügen
                    msg.plugin = this.getPluginContext();
                    await handler(msg, args);
                } catch (error) {
                    console.error(`❌ Plugin Command Fehler: ${commandName}`, error);
                    await msg.reply(`❌ Plugin Fehler: ${error.message}`);
                }
            });
        });
    }

    getPluginContext() {
        const context = {};
        this.plugins.forEach((plugin, name) => {
            context[name.replace('-', '_')] = plugin;
        });
        return context;
    }

    get(pluginName) {
        return this.plugins.get(pluginName);
    }

    list() {
        return Array.from(this.plugins.keys());
    }

    getStats() {
        return {
            loaded: this.plugins.size,
            available: this.availablePlugins.length,
            plugins: this.list()
        };
    }
}