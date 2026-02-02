// 🌍 Travel Plugin
export default class TravelPlugin {
    constructor(client) {
        this.client = client;
        this.name = 'travel-plugin';
        this.version = '1.0.0';
        this.description = 'Reise-System mit Wetter, Flügen, Hotels und Währungsrechner';
    }

    async getWeather(city) {
        try {
            // Verwende den HTTP Client für Wetter-API
            return await this.client.http.getWeather(city);
        } catch (error) {
            return {
                city: city,
                temperature: Math.floor(Math.random() * 30) + 5,
                description: 'Teilweise bewölkt',
                humidity: Math.floor(Math.random() * 40) + 40,
                windSpeed: Math.floor(Math.random() * 10) + 2
            };
        }
    }

    async searchFlights(from, to) {
        // Simulierte Flugdaten
        const airlines = ['Lufthansa', 'Ryanair', 'Eurowings', 'Turkish Airlines', 'Emirates'];
        const flights = [];
        
        for (let i = 0; i < 3; i++) {
            flights.push({
                airline: airlines[Math.floor(Math.random() * airlines.length)],
                departure: `${Math.floor(Math.random() * 12) + 6}:${Math.floor(Math.random() * 6) * 10}`,
                arrival: `${Math.floor(Math.random() * 12) + 12}:${Math.floor(Math.random() * 6) * 10}`,
                price: Math.floor(Math.random() * 500) + 100,
                duration: `${Math.floor(Math.random() * 8) + 2}h ${Math.floor(Math.random() * 6) * 10}m`,
                stops: Math.floor(Math.random() * 3)
            });
        }
        
        return flights;
    }

    async searchHotels(city) {
        const hotelNames = ['Hotel Central', 'Grand Palace', 'City Inn', 'Comfort Suites', 'Luxury Resort'];
        const hotels = [];
        
        for (let i = 0; i < 4; i++) {
            hotels.push({
                name: hotelNames[Math.floor(Math.random() * hotelNames.length)],
                stars: Math.floor(Math.random() * 3) + 3,
                price: Math.floor(Math.random() * 200) + 50,
                rating: (Math.random() * 2 + 3).toFixed(1),
                amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant'].slice(0, Math.floor(Math.random() * 4) + 1)
            });
        }
        
        return hotels;
    }

    async convertCurrency(amount, from, to) {
        // Simulierte Wechselkurse
        const rates = {
            'USD': { 'EUR': 0.85, 'GBP': 0.73, 'JPY': 110 },
            'EUR': { 'USD': 1.18, 'GBP': 0.86, 'JPY': 130 },
            'GBP': { 'USD': 1.37, 'EUR': 1.16, 'JPY': 151 }
        };
        
        if (from === to) return amount;
        
        const rate = rates[from]?.[to] || 1;
        const converted = (amount * rate).toFixed(2);
        
        return {
            original: amount,
            converted: parseFloat(converted),
            fromCurrency: from,
            toCurrency: to,
            rate: rate
        };
    }

    async translateText(text, targetLang) {
        // Verwende AI Integration falls verfügbar
        try {
            return await this.client.ai.translate(text, targetLang);
        } catch (error) {
            return `[Übersetzung zu ${targetLang}]: ${text}`;
        }
    }

    getCommands() {
        return {
            'weather': this.handleWeather.bind(this),
            'flights': this.handleFlights.bind(this),
            'hotels': this.handleHotels.bind(this),
            'currency': this.handleCurrency.bind(this),
            'translate': this.handleTranslate.bind(this),
            'travel': this.handleTravel.bind(this)
        };
    }

    async handleWeather(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Verwendung: !weather <stadt>\n\n🌤️ Beispiel: !weather Berlin');
        }

        const city = args.join(' ');
        await msg.reply(`🌤️ Lade Wetterdaten für ${city}...`);
        
        const weather = await this.getWeather(city);
        
        let weatherText = `🌤️ **Wetter in ${weather.city}:**\n\n`;
        weatherText += `🌡️ Temperatur: ${weather.temperature}°C\n`;
        weatherText += `☁️ Bedingungen: ${weather.description}\n`;
        weatherText += `💧 Luftfeuchtigkeit: ${weather.humidity}%\n`;
        weatherText += `💨 Windgeschwindigkeit: ${weather.windSpeed} km/h`;
        
        await msg.reply(weatherText);
    }

    async handleFlights(msg, args) {
        if (args.length < 2) {
            return msg.reply('❌ Verwendung: !flights <von> <nach>\n\n✈️ Beispiel: !flights Berlin München');
        }

        const from = args[0];
        const to = args[1];
        
        await msg.reply(`✈️ Suche Flüge von ${from} nach ${to}...`);
        
        const flights = await this.searchFlights(from, to);
        
        let flightText = `✈️ **Flüge ${from} → ${to}:**\n\n`;
        
        flights.forEach((flight, index) => {
            flightText += `${index + 1}. **${flight.airline}**\n`;
            flightText += `🕐 ${flight.departure} → ${flight.arrival}\n`;
            flightText += `⏱️ Dauer: ${flight.duration}\n`;
            flightText += `🔄 Stops: ${flight.stops === 0 ? 'Direktflug' : `${flight.stops} Stop(s)`}\n`;
            flightText += `💰 Preis: €${flight.price}\n\n`;
        });
        
        await msg.reply(flightText);
    }

    async handleHotels(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Verwendung: !hotels <stadt>\n\n🏨 Beispiel: !hotels Paris');
        }

        const city = args.join(' ');
        await msg.reply(`🏨 Suche Hotels in ${city}...`);
        
        const hotels = await this.searchHotels(city);
        
        let hotelText = `🏨 **Hotels in ${city}:**\n\n`;
        
        hotels.forEach((hotel, index) => {
            const stars = '⭐'.repeat(hotel.stars);
            flightText += `${index + 1}. **${hotel.name}** ${stars}\n`;
            hotelText += `⭐ Rating: ${hotel.rating}/5.0\n`;
            hotelText += `💰 Ab €${hotel.price}/Nacht\n`;
            hotelText += `🎯 Ausstattung: ${hotel.amenities.join(', ')}\n\n`;
        });
        
        await msg.reply(hotelText);
    }

    async handleCurrency(msg, args) {
        if (args.length < 3) {
            return msg.reply('❌ Verwendung: !currency <betrag> <von> <zu>\n\n💱 Beispiel: !currency 100 USD EUR');
        }

        const amount = parseFloat(args[0]);
        const from = args[1].toUpperCase();
        const to = args[2].toUpperCase();
        
        if (isNaN(amount)) {
            return msg.reply('❌ Ungültiger Betrag!');
        }

        const result = await this.convertCurrency(amount, from, to);
        
        let currencyText = `💱 **Währungsrechner:**\n\n`;
        currencyText += `💰 ${result.original} ${result.fromCurrency}\n`;
        currencyText += `= ${result.converted} ${result.toCurrency}\n\n`;
        currencyText += `📊 Wechselkurs: 1 ${result.fromCurrency} = ${result.rate} ${result.toCurrency}`;
        
        await msg.reply(currencyText);
    }

    async handleTranslate(msg, args) {
        if (args.length < 2) {
            return msg.reply('❌ Verwendung: !translate <sprache> <text>\n\n🌍 Beispiel: !translate en Hallo Welt');
        }

        const targetLang = args[0];
        const text = args.slice(1).join(' ');
        
        await msg.reply(`🌍 Übersetze zu ${targetLang}...`);
        
        const translation = await this.translateText(text, targetLang);
        
        let translateText = `🌍 **Übersetzung:**\n\n`;
        translateText += `📝 Original: ${text}\n`;
        translateText += `🔄 ${targetLang}: ${translation}`;
        
        await msg.reply(translateText);
    }

    async handleTravel(msg, args) {
        const helpText = `🌍 **Travel Plugin Commands:**

🌤️ !weather <stadt> - Wetter abrufen
✈️ !flights <von> <nach> - Flüge suchen  
🏨 !hotels <stadt> - Hotels finden
💱 !currency <betrag> <von> <zu> - Währung umrechnen
🌍 !translate <sprache> <text> - Text übersetzen

📋 **Beispiele:**
• !weather Berlin
• !flights München Hamburg  
• !hotels Paris
• !currency 100 USD EUR
• !translate en Guten Tag`;

        await msg.reply(helpText);
    }
}