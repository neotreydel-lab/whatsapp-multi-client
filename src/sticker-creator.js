// 🎨 WAEngine Sticker Creator mit Sharp Integration
import sharp from 'sharp';
import { readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import axios from 'axios';

export class StickerCreator {
    constructor(message) {
        this.message = message;
        this.client = message.client;
        this.tempDir = './temp-stickers';
        
        // Erstelle temp Ordner falls nicht vorhanden
        this.ensureTempDir();
    }

    ensureTempDir() {
        try {
            if (!existsSync(this.tempDir)) {
                mkdirSync(this.tempDir, { recursive: true });
            }
        } catch (error) {
            console.log('⚠️ Temp-Ordner konnte nicht erstellt werden:', error.message);
        }
    }

    get sticker() {
        return {
            fromMedia: async (mediaBuffer, options = {}) => {
                try {
                    const {
                        pack = 'WAEngine',
                        author = 'Bot',
                        quality = 'high',
                        crop = true,
                        animated = false
                    } = options;

                    console.log('🎨 Erstelle Sticker mit Sharp...');

                    let processedBuffer;

                    if (animated) {
                        // Für animierte Sticker (GIF/WebP)
                        processedBuffer = await this.processAnimatedSticker(mediaBuffer, options);
                    } else {
                        // Für statische Sticker
                        processedBuffer = await this.processStaticSticker(mediaBuffer, options);
                    }

                    // Sticker-Metadaten für WhatsApp
                    const stickerMessage = {
                        sticker: processedBuffer,
                        mimetype: animated ? 'image/webp' : 'image/webp'
                    };

                    // Sende Sticker
                    const result = await this.client.socket.sendMessage(this.message.from, stickerMessage);
                    console.log('✅ Sticker erfolgreich gesendet');
                    return result;

                } catch (error) {
                    console.error('❌ Fehler beim Erstellen des Stickers:', error);
                    throw new Error(`Sticker konnte nicht erstellt werden: ${error.message}`);
                }
            },

            fromImage: async (imagePath, options = {}) => {
                try {
                    console.log('🖼️ Erstelle Sticker aus Bild:', imagePath);
                    
                    let imageBuffer;
                    
                    if (typeof imagePath === 'string') {
                        if (imagePath.startsWith('http')) {
                            // URL - lade herunter
                            console.log('📥 Lade Bild von URL...');
                            const response = await axios.get(imagePath, { 
                                responseType: 'arraybuffer',
                                timeout: 10000
                            });
                            imageBuffer = Buffer.from(response.data);
                        } else {
                            // Lokaler Pfad
                            console.log('📁 Lade lokales Bild...');
                            imageBuffer = readFileSync(imagePath);
                        }
                    } else {
                        // Bereits ein Buffer
                        imageBuffer = imagePath;
                    }

                    return await this.sticker.fromMedia(imageBuffer, options);

                } catch (error) {
                    console.error('❌ Fehler beim Laden des Bildes:', error);
                    throw new Error(`Bild konnte nicht geladen werden: ${error.message}`);
                }
            },

            fromVideo: async (videoPath, options = {}) => {
                try {
                    console.log('🎥 Erstelle animierten Sticker aus Video:', videoPath);
                    
                    const {
                        duration = 6, // Max 6 Sekunden für Sticker
                        fps = 15,
                        ...stickerOptions
                    } = options;

                    let videoBuffer;
                    
                    if (typeof videoPath === 'string') {
                        if (videoPath.startsWith('http')) {
                            const response = await axios.get(videoPath, { 
                                responseType: 'arraybuffer',
                                timeout: 15000
                            });
                            videoBuffer = Buffer.from(response.data);
                        } else {
                            videoBuffer = readFileSync(videoPath);
                        }
                    } else {
                        videoBuffer = videoPath;
                    }

                    // Video zu animiertem WebP konvertieren
                    const animatedOptions = {
                        ...stickerOptions,
                        animated: true,
                        duration: duration,
                        fps: fps
                    };

                    return await this.sticker.fromMedia(videoBuffer, animatedOptions);

                } catch (error) {
                    console.error('❌ Fehler beim Erstellen des Video-Stickers:', error);
                    throw new Error(`Video-Sticker konnte nicht erstellt werden: ${error.message}`);
                }
            },

            fromText: async (text, options = {}) => {
                try {
                    console.log('📝 Erstelle Text-Sticker:', text);
                    
                    const {
                        backgroundColor = '#FFFFFF',
                        textColor = '#000000',
                        fontSize = 64,
                        fontFamily = 'Arial',
                        width = 512,
                        height = 512,
                        padding = 50,
                        ...stickerOptions
                    } = options;

                    // Erstelle Text-Bild mit Sharp
                    const textImage = await this.createTextImage(text, {
                        backgroundColor,
                        textColor,
                        fontSize,
                        fontFamily,
                        width,
                        height,
                        padding
                    });

                    return await this.sticker.fromMedia(textImage, stickerOptions);

                } catch (error) {
                    console.error('❌ Fehler beim Text-Sticker:', error);
                    throw new Error(`Text-Sticker konnte nicht erstellt werden: ${error.message}`);
                }
            },

            fromUrl: async (url, options = {}) => {
                try {
                    console.log('🌐 Erstelle Sticker aus URL:', url);
                    
                    // Lade von URL mit Timeout
                    const response = await axios.get(url, { 
                        responseType: 'arraybuffer',
                        timeout: 10000,
                        headers: {
                            'User-Agent': 'WAEngine/1.0.8'
                        }
                    });

                    if (response.status !== 200) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    const mediaBuffer = Buffer.from(response.data);
                    const contentType = response.headers['content-type'];

                    console.log('📄 Content-Type:', contentType);

                    // Bestimme Typ basierend auf Content-Type
                    if (contentType?.includes('image/gif') || contentType?.includes('video/')) {
                        return await this.sticker.fromVideo(mediaBuffer, { ...options, animated: true });
                    } else if (contentType?.startsWith('image/')) {
                        return await this.sticker.fromImage(mediaBuffer, options);
                    } else {
                        // Versuche als Bild
                        return await this.sticker.fromMedia(mediaBuffer, options);
                    }

                } catch (error) {
                    console.error('❌ Fehler beim Laden von URL:', error);
                    throw new Error(`URL konnte nicht geladen werden: ${error.message}`);
                }
            }
        };
    }

    async processStaticSticker(imageBuffer, options = {}) {
        const {
            quality = 'high',
            crop = true,
            width = 512,
            height = 512
        } = options;

        try {
            let sharpImage = sharp(imageBuffer);

            // Hole Metadaten
            const metadata = await sharpImage.metadata();
            console.log(`📊 Bild-Info: ${metadata.width}x${metadata.height}, Format: ${metadata.format}`);

            // Resize und Crop Logic
            if (crop) {
                // Quadratisch croppen (zentriert)
                const size = Math.min(metadata.width, metadata.height);
                const left = Math.floor((metadata.width - size) / 2);
                const top = Math.floor((metadata.height - size) / 2);
                
                sharpImage = sharpImage
                    .extract({ left, top, width: size, height: size })
                    .resize(width, height, { 
                        fit: 'cover',
                        position: 'center'
                    });
            } else {
                // Proportional resize
                sharpImage = sharpImage.resize(width, height, { 
                    fit: 'inside',
                    withoutEnlargement: false,
                    background: { r: 255, g: 255, b: 255, alpha: 0 }
                });
            }

            // Qualitäts-Einstellungen
            const qualitySettings = {
                high: { quality: 90, effort: 6 },
                medium: { quality: 75, effort: 4 },
                low: { quality: 60, effort: 2 }
            };

            const settings = qualitySettings[quality] || qualitySettings.high;

            // Zu WebP konvertieren (optimal für WhatsApp Sticker)
            const processedBuffer = await sharpImage
                .webp(settings)
                .toBuffer();

            console.log(`✅ Sticker verarbeitet: ${processedBuffer.length} bytes`);
            return processedBuffer;

        } catch (error) {
            console.error('❌ Sharp Verarbeitungsfehler:', error);
            throw error;
        }
    }

    async processAnimatedSticker(mediaBuffer, options = {}) {
        const {
            quality = 'high',
            width = 512,
            height = 512,
            duration = 6,
            fps = 15
        } = options;

        try {
            console.log('🎬 Verarbeite animierten Sticker...');

            // Für animierte Sticker - vereinfachte Verarbeitung
            // In einer vollständigen Implementation würdest du FFmpeg verwenden
            let sharpImage = sharp(mediaBuffer, { animated: true });

            const metadata = await sharpImage.metadata();
            console.log(`📊 Animiertes Bild-Info: ${metadata.width}x${metadata.height}, Seiten: ${metadata.pages}`);

            // Resize für animierte WebP
            const processedBuffer = await sharpImage
                .resize(width, height, { 
                    fit: 'cover',
                    position: 'center'
                })
                .webp({ 
                    quality: quality === 'high' ? 80 : quality === 'medium' ? 60 : 40,
                    effort: 4
                })
                .toBuffer();

            console.log(`✅ Animierter Sticker verarbeitet: ${processedBuffer.length} bytes`);
            return processedBuffer;

        } catch (error) {
            console.error('❌ Animierter Sticker Fehler:', error);
            // Fallback: Als statisches Bild verarbeiten
            console.log('🔄 Fallback: Verarbeite als statisches Bild...');
            return await this.processStaticSticker(mediaBuffer, options);
        }
    }

    async createTextImage(text, options = {}) {
        const {
            backgroundColor = '#FFFFFF',
            textColor = '#000000',
            fontSize = 64,
            width = 512,
            height = 512,
            padding = 50
        } = options;

        try {
            console.log('🎨 Erstelle Text-Bild mit Sharp...');

            // SVG für Text erstellen (Sharp unterstützt SVG-Text)
            const textSvg = `
                <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100%" height="100%" fill="${backgroundColor}"/>
                    <text x="50%" y="50%" 
                          font-family="Arial, sans-serif" 
                          font-size="${fontSize}" 
                          fill="${textColor}" 
                          text-anchor="middle" 
                          dominant-baseline="middle"
                          style="word-wrap: break-word;">
                        ${text}
                    </text>
                </svg>
            `;

            // SVG zu Buffer konvertieren
            const textBuffer = await sharp(Buffer.from(textSvg))
                .png()
                .toBuffer();

            console.log('✅ Text-Bild erstellt');
            return textBuffer;

        } catch (error) {
            console.error('❌ Text-Bild Fehler:', error);
            
            // Fallback: Einfaches farbiges Rechteck
            console.log('🔄 Fallback: Erstelle einfaches Bild...');
            return await sharp({
                create: {
                    width: width,
                    height: height,
                    channels: 4,
                    background: backgroundColor
                }
            })
            .png()
            .toBuffer();
        }
    }

    // Convenience Methods
    async fromMedia(mediaBuffer, options = {}) {
        return await this.sticker.fromMedia(mediaBuffer, options);
    }

    async fromImage(imagePath, options = {}) {
        return await this.sticker.fromImage(imagePath, options);
    }

    async fromVideo(videoPath, options = {}) {
        return await this.sticker.fromVideo(videoPath, options);
    }

    async fromText(text, options = {}) {
        return await this.sticker.fromText(text, options);
    }

    async fromUrl(url, options = {}) {
        return await this.sticker.fromUrl(url, options);
    }

    // Cleanup
    cleanup() {
        try {
            // Temp-Dateien löschen falls vorhanden
            if (existsSync(this.tempDir)) {
                const files = readdirSync(this.tempDir);
                files.forEach(file => {
                    try {
                        unlinkSync(join(this.tempDir, file));
                    } catch (error) {
                        // Ignoriere Fehler beim Löschen
                    }
                });
            }
        } catch (error) {
            // Ignoriere Cleanup-Fehler
        }
    }
}