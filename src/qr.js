import qrcode from "qrcode-terminal";
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";
import { generateTerminalQR, generateQRWithRetry, checkTerminalQRCompatibility, debugQRSystem as debugQRSystemFromFix } from "./qr-terminal-fix.js";

const execAsync = promisify(exec);

let browser = null;
let page = null;
let httpServer = null;
let lastQRTime = 0;
let qrDisplayCount = 0;
let qrCleanupTimer = null;
let browserCleanupTimer = null;

// Cross-Platform Browser Detection
const BROWSERS = {
    windows: [
        'msedge.exe',
        'chrome.exe', 
        'firefox.exe',
        'brave.exe',
        'opera.exe'
    ],
    darwin: [
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Firefox.app/Contents/MacOS/firefox',
        '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
        '/Applications/Safari.app/Contents/MacOS/Safari'
    ],
    linux: [
        'microsoft-edge',
        'google-chrome',
        'chromium-browser',
        'firefox',
        'brave-browser',
        'opera'
    ]
};

export async function generateQRCode(qrData = null, options = {}) {
    try {
        // QR-Spam Prevention - nur alle 30 Sekunden im Terminal anzeigen
        const now = Date.now();
        const timeSinceLastQR = now - lastQRTime;
        const shouldShowTerminalQR = timeSinceLastQR > 30000 || qrDisplayCount === 0;

        // Terminal-Größe prüfen für bessere QR-Anzeige
        const terminalWidth = process.stdout.columns || 80;
        const terminalHeight = process.stdout.rows || 24;
        
        if (qrData && shouldShowTerminalQR) {
            // Terminal leeren für saubere QR-Anzeige
            if (options.clearTerminal !== false) {
                console.clear();
            }
            
            console.log("📱 WAEngine QR-Code - Einmal scannen und fertig!");
            console.log("=".repeat(Math.min(50, terminalWidth - 2)));
            console.log(`🖥️ Terminal: ${terminalWidth}x${terminalHeight}`);
            
            // Warnung bei kleinem Terminal
            if (terminalWidth < 60) {
                console.log("⚠️ TERMINAL ZU SCHMAL - QR extra klein angezeigt!");
                console.log("💡 Vergrößere das Terminal-Fenster für bessere QR-Anzeige");
                console.log("");
            }
            
            try {
                // IMMER kleine QR-Größe verwenden (wegen "zu groß" Problem)
                let qrOptions = { small: true }; // IMMER klein!
                
                console.log("📱 Verwende extra kleine QR-Größe");
                console.log("");
                qrcode.generate(qrData, qrOptions);
                console.log("");
                console.log("✅ QR-Code erfolgreich angezeigt (extra klein)");
                
            } catch (qrError) {
                console.error("❌ QR-Code Generierung fehlgeschlagen:", qrError.message);
                console.log("📋 QR-Daten für externe QR-App:");
                console.log(qrData);
                console.log("💡 Kopiere die Daten in eine QR-Generator Website");
            }
            
            console.log("=".repeat(Math.min(50, terminalWidth - 2)));
            console.log("📲 WhatsApp Anleitung:");
            console.log("   1. Öffne WhatsApp auf deinem Handy");
            console.log("   2. Gehe zu Einstellungen → Verknüpfte Geräte");
            console.log("   3. Tippe auf 'Gerät verknüpfen'");
            console.log("   4. Scanne den QR-Code OBEN");
            console.log("=".repeat(Math.min(50, terminalWidth - 2)));
            console.log("⏳ Warte auf QR-Scan...");
            
            lastQRTime = now;
            qrDisplayCount++;
        } else if (qrData && !shouldShowTerminalQR) {
            // Nur kurze Info ohne QR-Spam
            console.log(`🔄 QR-Code aktualisiert (${qrDisplayCount + 1}. Mal) - Browser verwenden oder 30s warten`);
            qrDisplayCount++;
        }

        // Browser QR NUR wenn explizit aktiviert (nicht mehr automatisch)
        if (qrData && options.openBrowser === true) {
            await openUniversalBrowser(qrData);
        }

        return { browser, page };
        
    } catch (error) {
        console.error("❌ QR-System Fehler:", error.message);
        
        // Robuster Fallback
        if (qrData && qrDisplayCount === 0) {
            console.log("📱 Fallback: Einfacher QR-Code");
            try {
                // Minimaler QR-Code als Fallback
                qrcode.generate(qrData, { small: true });
                console.log("📱 Terminal QR-Code verfügbar (siehe oben)");
            } catch (fallbackError) {
                console.log("❌ Auch Fallback-QR fehlgeschlagen");
                console.log("🌐 Verwende Browser oder externe QR-App");
                console.log(`📋 QR-Daten: ${qrData}`);
            }
            qrDisplayCount++;
        }
        
        return null;
    }
}

// QR-Code Status zurücksetzen (für neue Sessions)
export function resetQRStatus() {
    lastQRTime = 0;
    qrDisplayCount = 0;
    
    // Clear all timers
    if (qrCleanupTimer) {
        clearTimeout(qrCleanupTimer);
        qrCleanupTimer = null;
    }
    
    if (browserCleanupTimer) {
        clearTimeout(browserCleanupTimer);
        browserCleanupTimer = null;
    }
    
    console.log("🔄 QR-Status zurückgesetzt");
}

// Automatic cleanup after timeout
export function scheduleQRCleanup(timeoutMs = 120000) {
    if (qrCleanupTimer) {
        clearTimeout(qrCleanupTimer);
    }
    
    qrCleanupTimer = setTimeout(async () => {
        console.log("⏰ QR-Code Timeout - automatische Bereinigung");
        await closeBrowser();
        resetQRStatus();
    }, timeoutMs);
}

// QR-Code manuell anzeigen (für Debugging)
export function forceShowQR(qrData) {
    lastQRTime = 0; // Reset Timer
    return generateQRCode(qrData);
}

async function openUniversalBrowser(qrData) {
    try {
        const platform = os.platform();
        console.log(`🖥️ Erkannte Plattform: ${platform}`);
        
        // 1. Versuche Playwright (wenn verfügbar)
        try {
            await openWithPlaywright(qrData);
            return;
        } catch (playwrightError) {
            console.log("⚠️ Playwright nicht verfügbar, versuche System-Browser...");
        }
        
        // 2. Versuche HTTP Server + System Browser
        await openWithSystemBrowser(qrData, platform);
        
    } catch (error) {
        console.log("⚠️ Browser-Öffnung fehlgeschlagen:", error.message);
        console.log("📱 Verwende Terminal QR-Code (siehe oben)");
    }
}

async function openWithPlaywright(qrData) {
    try {
        const { chromium } = await import("playwright");
        
        // Versuche verschiedene Browser-Channels
        const channels = ['msedge', 'chrome', 'chromium'];
        
        for (const channel of channels) {
            try {
                console.log(`🌐 Versuche ${channel}...`);
                browser = await chromium.launch({
                    channel,
                    headless: false,
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                });
                
                page = await browser.newPage();
                const html = await generateQRHTML(qrData);
                await page.setContent(html);
                
                console.log(`✅ ${channel} erfolgreich geöffnet!`);
                return;
                
            } catch (channelError) {
                console.log(`⚠️ ${channel} nicht verfügbar`);
                if (browser) {
                    await browser.close();
                    browser = null;
                }
            }
        }
        
        throw new Error("Kein Playwright-Browser verfügbar");
        
    } catch (error) {
        throw new Error(`Playwright Fehler: ${error.message}`);
    }
}

async function openWithSystemBrowser(qrData, platform) {
    try {
        // HTTP Server starten
        const port = await startHTTPServer(qrData);
        const url = `http://localhost:${port}`;
        
        console.log(`🌐 HTTP Server gestartet: ${url}`);
        
        // System-Browser öffnen
        await openSystemBrowser(url, platform);
        
    } catch (error) {
        throw new Error(`System-Browser Fehler: ${error.message}`);
    }
}

async function startHTTPServer(qrData) {
    return new Promise(async (resolve, reject) => {
        const http = await import('http');
        const port = 3000 + Math.floor(Math.random() * 1000); // Random Port
        
        const html = await generateQRHTML(qrData);
        
        httpServer = http.default.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
        });
        
        httpServer.listen(port, 'localhost', () => {
            console.log(`📡 HTTP Server läuft auf Port ${port}`);
            resolve(port);
        });
        
        httpServer.on('error', (error) => {
            reject(error);
        });
    });
}

async function openSystemBrowser(url, platform) {
    try {
        let command;
        
        switch (platform) {
            case 'win32':
                // Windows - versuche verschiedene Browser
                command = `start "" "${url}"`;
                break;
                
            case 'darwin':
                // macOS - versuche verschiedene Browser
                command = `open "${url}"`;
                break;
                
            case 'linux':
                // Linux - versuche verschiedene Browser
                command = `xdg-open "${url}" || sensible-browser "${url}" || x-www-browser "${url}"`;
                break;
                
            default:
                throw new Error(`Unbekannte Plattform: ${platform}`);
        }
        
        console.log(`🚀 Öffne Browser: ${command}`);
        await execAsync(command);
        console.log("✅ System-Browser geöffnet!");
        
    } catch (error) {
        // Versuche spezifische Browser
        await trySpecificBrowsers(url, platform);
    }
}

async function trySpecificBrowsers(url, platform) {
    const browsers = BROWSERS[platform === 'win32' ? 'windows' : platform] || [];
    
    for (const browserPath of browsers) {
        try {
            let command;
            
            if (platform === 'win32') {
                command = `"${browserPath}" "${url}"`;
            } else {
                command = `"${browserPath}" "${url}"`;
            }
            
            console.log(`🔍 Versuche: ${browserPath}`);
            await execAsync(command);
            console.log(`✅ ${browserPath} erfolgreich geöffnet!`);
            return;
            
        } catch (error) {
            console.log(`⚠️ ${browserPath} nicht verfügbar`);
        }
    }
    
    throw new Error("Kein Browser gefunden");
}

async function generateQRHTML(qrData) {
    // QR-Code als Data URL generieren (async für ES Modules)
    let qrCodeDataURL;
    try {
        const QRCode = await import('qrcode');
        qrCodeDataURL = await QRCode.toDataURL(qrData, {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
    } catch (error) {
        console.error("❌ QR-Code DataURL Fehler:", error);
        qrCodeDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkVycm9yPC90ZXh0Pjwvc3ZnPg==';
    }

    return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WAEngine - QR Code Scanner</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: white;
        }
        
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(15px);
            border-radius: 25px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 500px;
            width: 100%;
        }
        
        .logo {
            font-size: 3em;
            margin-bottom: 10px;
        }
        
        h1 {
            margin-bottom: 30px;
            font-size: 2.2em;
            font-weight: 600;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .qr-container {
            background: white;
            padding: 25px;
            border-radius: 20px;
            margin: 30px 0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            display: inline-block;
        }
        
        .qr-code {
            width: 300px;
            height: 300px;
            max-width: 100%;
            height: auto;
            border-radius: 10px;
        }
        
        .warning {
            background: rgba(255, 193, 7, 0.2);
            border: 2px solid #ffc107;
            border-radius: 15px;
            padding: 20px;
            margin: 25px 0;
            font-weight: 600;
            font-size: 1.1em;
        }
        
        .instructions {
            font-size: 1.1em;
            line-height: 1.8;
            margin-top: 25px;
        }
        
        .step {
            margin: 12px 0;
            padding: 15px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            border-left: 4px solid #ffc107;
            text-align: left;
        }
        
        .platform-info {
            margin-top: 20px;
            padding: 15px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            font-size: 0.9em;
            opacity: 0.8;
        }
        
        .refresh-info {
            margin-top: 20px;
            font-size: 0.9em;
            opacity: 0.7;
        }
        
        @media (max-width: 600px) {
            .container {
                padding: 25px;
                margin: 10px;
            }
            
            h1 {
                font-size: 1.8em;
            }
            
            .qr-code {
                width: 250px;
            }
            
            .step {
                padding: 12px;
                font-size: 1em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🚀</div>
        <h1>WAEngine QR Scanner</h1>
        
        <div class="qr-container">
            <img src="${qrCodeDataURL}" alt="QR Code" class="qr-code" />
        </div>
        
        <div class="warning">
            ⚠️ Scanne NUR diesen QR-Code!<br>
            Nicht den Standard WhatsApp Web QR-Code!
        </div>
        
        <div class="instructions">
            <div class="step">📱 1. Öffne WhatsApp auf deinem Handy</div>
            <div class="step">⚙️ 2. Gehe zu Einstellungen</div>
            <div class="step">🔗 3. Tippe auf "Verknüpfte Geräte"</div>
            <div class="step">📷 4. Tippe auf "Gerät verknüpfen"</div>
            <div class="step">🎯 5. Scanne den QR-Code oben</div>
        </div>
        
        <div class="platform-info">
            🖥️ Plattform: <span id="platform">Wird erkannt...</span><br>
            🌐 Browser: <span id="browser">Wird erkannt...</span>
        </div>
        
        <div class="refresh-info">
            🔄 Seite wird alle 45 Sekunden aktualisiert
        </div>
    </div>
    
    <script>
        // Platform Detection
        const platform = navigator.platform;
        const userAgent = navigator.userAgent;
        
        document.getElementById('platform').textContent = platform;
        
        let browserName = 'Unbekannt';
        if (userAgent.includes('Edg/')) browserName = 'Microsoft Edge';
        else if (userAgent.includes('Chrome/')) browserName = 'Google Chrome';
        else if (userAgent.includes('Firefox/')) browserName = 'Mozilla Firefox';
        else if (userAgent.includes('Safari/')) browserName = 'Safari';
        else if (userAgent.includes('Opera/')) browserName = 'Opera';
        
        document.getElementById('browser').textContent = browserName;
        
        // Auto-refresh QR code every 45 seconds
        setTimeout(() => {
            console.log('🔄 QR-Code wird aktualisiert...');
            location.reload();
        }, 45000);
        
        // Visual feedback
        let dots = 0;
        setInterval(() => {
            dots = (dots + 1) % 4;
            const loading = '.'.repeat(dots);
            document.title = \`WAEngine QR Scanner\${loading}\`;
        }, 500);
        
        console.log('🚀 WAEngine QR Scanner geladen');
        console.log('📱 Scanne den QR-Code mit WhatsApp');
    </script>
</body>
</html>`;
}

export async function closeBrowser() {
    try {
        // Clear all timers first
        if (qrCleanupTimer) {
            clearTimeout(qrCleanupTimer);
            qrCleanupTimer = null;
        }
        
        if (browserCleanupTimer) {
            clearTimeout(browserCleanupTimer);
            browserCleanupTimer = null;
        }
        
        // Playwright Browser schließen mit Timeout
        if (browser) {
            try {
                await Promise.race([
                    browser.close(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Browser close timeout')), 5000))
                ]);
                console.log("🔴 Playwright Browser geschlossen");
            } catch (closeError) {
                console.log("⚠️ Browser close timeout - force killing");
                try {
                    await browser.close({ force: true });
                } catch (forceError) {
                    console.log("⚠️ Force close failed, browser may remain open");
                }
            } finally {
                browser = null;
                page = null;
            }
        }
        
        // HTTP Server schließen mit Timeout
        if (httpServer) {
            try {
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Server close timeout'));
                    }, 3000);
                    
                    httpServer.close((err) => {
                        clearTimeout(timeout);
                        if (err) reject(err);
                        else resolve();
                    });
                });
                console.log("🔴 HTTP Server geschlossen");
            } catch (serverError) {
                console.log("⚠️ Server close timeout - force destroying");
                try {
                    httpServer.closeAllConnections?.();
                } catch (destroyError) {
                    // Silent fail
                }
            } finally {
                httpServer = null;
            }
        }
        
    } catch (error) {
        console.error("❌ Fehler beim Schließen:", error.message);
    } finally {
        // Ensure cleanup even on error
        browser = null;
        page = null;
        httpServer = null;
    }
}

// Hilfsfunktion um QR-Code als Data URL zu generieren (für zukünftige Features)
async function generateQRCodeDataURL(qrData) {
    try {
        const QRCode = await import('qrcode');
        return await QRCode.toDataURL(qrData, {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
    } catch (error) {
        console.error("❌ Fehler beim QR-Code DataURL:", error);
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkVycm9yPC90ZXh0Pjwvc3ZnPg==';
    }
}

// Export für zukünftige Verwendung
export { generateQRCodeDataURL, checkTerminalQRCompatibility, debugQRSystemFromFix as debugQRSystem, generateTerminalQR };
// ===== ERWEITERTE QR-CODE FUNKTIONEN =====

// Terminal-Kompatibilität prüfen
export function checkTerminalCompatibility() {
    const terminalWidth = process.stdout.columns || 80;
    const terminalHeight = process.stdout.rows || 24;
    const platform = os.platform();
    
    const compatibility = {
        width: terminalWidth,
        height: terminalHeight,
        platform: platform,
        supportsQR: terminalWidth >= 40 && terminalHeight >= 15,
        recommendedSize: terminalWidth >= 100 ? 'normal' : 'small',
        issues: []
    };
    
    if (terminalWidth < 40) {
        compatibility.issues.push('Terminal zu schmal für QR-Code');
    }
    
    if (terminalHeight < 15) {
        compatibility.issues.push('Terminal zu niedrig für QR-Code');
    }
    
    if (platform === 'win32' && !process.env.WT_SESSION) {
        compatibility.issues.push('Windows CMD hat begrenzte QR-Unterstützung');
    }
    
    return compatibility;
}

// QR-Code mit Fallback-Strategien
export async function generateRobustQR(qrData, options = {}) {
    const compatibility = checkTerminalCompatibility();
    
    console.log(`🖥️ Terminal: ${compatibility.width}x${compatibility.height} (${compatibility.platform})`);
    
    if (compatibility.issues.length > 0) {
        console.log("⚠️ Terminal-Probleme erkannt:");
        compatibility.issues.forEach(issue => console.log(`   • ${issue}`));
    }
    
    // Strategie 1: Terminal QR (wenn kompatibel)
    if (compatibility.supportsQR && !options.skipTerminal) {
        try {
            const qrOptions = {
                small: compatibility.recommendedSize === 'small'
            };
            
            console.log("📱 QR-Code im Terminal:");
            qrcode.generate(qrData, qrOptions);
            console.log("✅ Terminal QR-Code angezeigt");
            
        } catch (terminalError) {
            console.log("❌ Terminal QR-Code fehlgeschlagen:", terminalError.message);
        }
    } else {
        console.log("⚠️ Terminal nicht kompatibel für QR-Code");
    }
    
    // Strategie 2: Browser QR (immer versuchen)
    try {
        await openUniversalBrowser(qrData);
        console.log("✅ Browser QR-Code geöffnet");
    } catch (browserError) {
        console.log("❌ Browser QR-Code fehlgeschlagen:", browserError.message);
    }
    
    // Strategie 3: QR-Daten als Text (Fallback)
    if (!compatibility.supportsQR || options.showData) {
        console.log("📋 QR-Daten (für externe QR-Apps):");
        console.log(qrData);
        console.log("💡 Kopiere die Daten in eine QR-Generator App");
    }
    
    return {
        terminalShown: compatibility.supportsQR,
        browserAttempted: true,
        compatibility: compatibility
    };
}

// QR-Code Debugging-Informationen (verwende die aus qr-terminal-fix.js)
// export function debugQRSystem() {
//     const compatibility = checkTerminalCompatibility();
//     console.log("\n🔍 QR-SYSTEM DEBUG INFO:");
//     console.log("=".repeat(50));
//     console.log(`Platform: ${compatibility.platform}`);
//     console.log(`Terminal: ${compatibility.width}x${compatibility.height}`);
//     console.log(`QR Support: ${compatibility.supportsQR ? '✅' : '❌'}`);
//     console.log(`Recommended Size: ${compatibility.recommendedSize}`);
//     
//     if (compatibility.issues.length > 0) {
//         console.log("Issues:");
//         compatibility.issues.forEach(issue => console.log(`  • ${issue}`));
//     }
//     
//     console.log(`Node Version: ${process.version}`);
//     console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
//     console.log(`Terminal Type: ${process.env.TERM || 'unknown'}`);
//     console.log(`Windows Terminal: ${process.env.WT_SESSION ? 'Yes' : 'No'}`);
//     console.log("=".repeat(50));
//     
//     return compatibility;
// }

// QR-Code mit Retry-Mechanismus (aus qr-terminal-fix.js importiert)
// Diese Funktion ist bereits in qr-terminal-fix.js definiert