// 🔌 WAEngine Plugin Manager - Auto-Plugin System
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export class PluginManager {
    constructor(client) {
        this.client = client;
        this.plugins = new Map();
        this.pluginsDir = './plugins';
        this.availablePlugins = [
            'economy-system',
            'games-plugin'
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
            
            // Plugin-Pfad validieren
            if (!pluginName || typeof pluginName !== 'string') {
                throw new Error('Ungültiger Plugin-Name');
            }
            
            // Sanitize Plugin-Name (Sicherheit)
            const sanitizedName = pluginName.replace(/[^a-zA-Z0-9-_]/g, '');
            if (!sanitizedName) {
                throw new Error('Plugin-Name enthält ungültige Zeichen');
            }
            
            const pluginPath = join(process.cwd(), this.pluginsDir, sanitizedName, 'index.js');
            
            if (!existsSync(pluginPath)) {
                console.log(`📝 Plugin ${sanitizedName} nicht gefunden - wird übersprungen`);
                return null;
            }
            
            // Plugin-Struktur validieren vor Import
            const pluginModule = await import(pluginPath);
            
            if (!pluginModule.default) {
                throw new Error(`Plugin ${sanitizedName} hat keinen default export`);
            }
            
            const PluginClass = pluginModule.default;
            
            // Validiere Plugin-Klasse
            if (typeof PluginClass !== 'function') {
                throw new Error(`Plugin ${sanitizedName} default export ist keine Klasse`);
            }
            
            // Plugin instanziieren mit Error-Handling
            let plugin;
            try {
                plugin = new PluginClass(this.client);
            } catch (constructorError) {
                throw new Error(`Plugin ${sanitizedName} Konstruktor-Fehler: ${constructorError.message}`);
            }
            
            // Validiere Plugin-Interface
            if (!plugin.name || !plugin.version) {
                throw new Error(`Plugin ${sanitizedName} fehlt name oder version`);
            }
            
            if (typeof plugin.getCommands !== 'function') {
                console.warn(`⚠️ Plugin ${sanitizedName} hat keine getCommands() Methode`);
                plugin.getCommands = () => [];
            }
            
            // Plugin registrieren
            this.plugins.set(sanitizedName, plugin);
            
            // Commands registrieren mit Error-Handling
            try {
                await this.registerPluginCommands(plugin);
            } catch (commandError) {
                console.warn(`⚠️ Plugin ${sanitizedName} Commands konnten nicht registriert werden:`, commandError.message);
            }
            
            console.log(`✅ Plugin geladen: ${plugin.name} v${plugin.version}`);
            return plugin;
            
        } catch (error) {
            console.error(`❌ Plugin Fehler: ${pluginName}`, error.message);
            
            // Plugin aus Map entfernen falls teilweise geladen
            if (this.plugins.has(pluginName)) {
                this.plugins.delete(pluginName);
            }
            
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