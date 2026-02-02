// HTTP Client für WAEngine
import axios from 'axios';

export class HTTPClient {
    constructor(options = {}) {
        this.timeout = options.timeout || 10000;
        this.retries = options.retries || 3;
        this.baseHeaders = options.headers || {};
        
        // Axios Instance erstellen
        this.axios = axios.create({
            timeout: this.timeout,
            headers: this.baseHeaders
        });
        
        // Stille Initialisierung - keine Console-Spam
    }

    // ===== BASIC HTTP METHODS =====
    
    async get(url, options = {}) {
        return await this.request('GET', url, null, options);
    }

    async post(url, data = null, options = {}) {
        return await this.request('POST', url, data, options);
    }

    async put(url, data = null, options = {}) {
        return await this.request('PUT', url, data, options);
    }

    async delete(url, options = {}) {
        return await this.request('DELETE', url, null, options);
    }

    // ===== CORE REQUEST METHOD =====
    
    async request(method, url, data = null, options = {}) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.retries; attempt++) {
            try {
                const config = {
                    method,
                    url,
                    ...options
                };
                
                if (data) {
                    config.data = data;
                }
                
                const response = await this.axios(config);
                return response.data;
                
            } catch (error) {
                lastError = error;
                
                if (attempt < this.retries && this.shouldRetry(error)) {
                    console.log(`🔄 HTTP Retry ${attempt}/${this.retries} für ${url}`);
                    await this.delay(1000 * attempt); // Exponential backoff
                } else {
                    break;
                }
            }
        }
        
        throw new Error(`HTTP Request failed: ${lastError.message}`);
    }

    shouldRetry(error) {
        // Retry bei Netzwerk-Fehlern oder 5xx Status Codes
        return !error.response || error.response.status >= 500;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ===== API WRAPPERS =====
    
    // Weather API
    async getWeather(city, apiKey = process.env.WEATHER_API_KEY) {
        if (!apiKey) {
            throw new Error('❌ Weather API Key fehlt! Setze WEATHER_API_KEY');
        }
        
        try {
            const data = await this.get(`https://api.openweathermap.org/data/2.5/weather`, {
                params: {
                    q: city,
                    appid: apiKey,
                    units: 'metric',
                    lang: 'de'
                }
            });
            
            return {
                city: data.name,
                country: data.sys.country,
                temperature: Math.round(data.main.temp),
                description: data.weather[0].description,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                icon: data.weather[0].icon
            };
        } catch (error) {
            throw new Error(`Wetter-Fehler: ${error.message}`);
        }
    }

    // News API
    async getNews(category = 'general', apiKey = process.env.NEWS_API_KEY) {
        if (!apiKey) {
            throw new Error('❌ News API Key fehlt! Setze NEWS_API_KEY');
        }
        
        try {
            const data = await this.get(`https://newsapi.org/v2/top-headlines`, {
                params: {
                    country: 'de',
                    category: category,
                    apiKey: apiKey,
                    pageSize: 5
                }
            });
            
            return data.articles.map(article => ({
                title: article.title,
                description: article.description,
                url: article.url,
                source: article.source.name,
                publishedAt: new Date(article.publishedAt).toLocaleDateString('de-DE')
            }));
        } catch (error) {
            throw new Error(`News-Fehler: ${error.message}`);
        }
    }

    // Crypto Prices
    async getCryptoPrice(symbol = 'bitcoin') {
        try {
            const data = await this.get(`https://api.coingecko.com/api/v3/simple/price`, {
                params: {
                    ids: symbol,
                    vs_currencies: 'eur,usd',
                    include_24hr_change: true
                }
            });
            
            const coin = data[symbol];
            return {
                symbol: symbol,
                priceEUR: coin.eur,
                priceUSD: coin.usd,
                change24h: coin.eur_24h_change?.toFixed(2) || 0
            };
        } catch (error) {
            throw new Error(`Crypto-Fehler: ${error.message}`);
        }
    }

    // QR Code Generator
    async generateQRCode(text, size = 200) {
        try {
            const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
            
            // Return URL instead of downloading
            return {
                url: url,
                text: text,
                size: size
            };
        } catch (error) {
            throw new Error(`QR-Code-Fehler: ${error.message}`);
        }
    }

    // URL Shortener
    async shortenUrl(longUrl, apiKey = process.env.BITLY_API_KEY) {
        if (!apiKey) {
            // Fallback zu kostenlosem Service
            try {
                const data = await this.post('https://is.gd/create.php', null, {
                    params: {
                        format: 'json',
                        url: longUrl
                    }
                });
                
                return {
                    shortUrl: data.shorturl,
                    longUrl: longUrl,
                    service: 'is.gd'
                };
            } catch (error) {
                throw new Error(`URL-Shortener-Fehler: ${error.message}`);
            }
        }
        
        // Bitly API
        try {
            const data = await this.post('https://api-ssl.bitly.com/v4/shorten', {
                long_url: longUrl
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return {
                shortUrl: data.link,
                longUrl: longUrl,
                service: 'bitly'
            };
        } catch (error) {
            throw new Error(`Bitly-Fehler: ${error.message}`);
        }
    }

    // Random Facts
    async getRandomFact() {
        try {
            const data = await this.get('https://uselessfacts.jsph.pl/random.json?language=en');
            return data.text;
        } catch (error) {
            throw new Error(`Random-Fact-Fehler: ${error.message}`);
        }
    }

    // Random Joke
    async getRandomJoke() {
        try {
            const data = await this.get('https://official-joke-api.appspot.com/random_joke');
            return `${data.setup}\n\n${data.punchline}`;
        } catch (error) {
            throw new Error(`Joke-Fehler: ${error.message}`);
        }
    }

    // IP Info
    async getIPInfo(ip = '') {
        try {
            const url = ip ? `http://ip-api.com/json/${ip}` : 'http://ip-api.com/json/';
            const data = await this.get(url);
            
            return {
                ip: data.query,
                country: data.country,
                city: data.city,
                region: data.regionName,
                timezone: data.timezone,
                isp: data.isp
            };
        } catch (error) {
            throw new Error(`IP-Info-Fehler: ${error.message}`);
        }
    }

    // Website Screenshot (via API)
    async getWebsiteScreenshot(url, width = 1280, height = 720) {
        try {
            const screenshotUrl = `https://api.screenshotmachine.com/?key=${process.env.SCREENSHOT_API_KEY}&url=${encodeURIComponent(url)}&dimension=${width}x${height}`;
            
            return {
                screenshotUrl: screenshotUrl,
                originalUrl: url,
                dimensions: `${width}x${height}`
            };
        } catch (error) {
            throw new Error(`Screenshot-Fehler: ${error.message}`);
        }
    }
}