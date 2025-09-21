# FooGood - Smart Food Expiry Tracker

En React Native app til at holde styr på fødevarer og deres udløbsdatoer, med AI-drevne opskriftsforslag og smart indkøbsliste.

## Features

- **Pantry Management**: Hold styr på dine fødevarer og deres udløbsdatoer
- **Smart Kategorisering**: Automatisk kategorisering af fødevarer
- **Udløbsadvarsler**: Se varer der udløber snart
- **AI Opskriftsforslag**: Azure OpenAI GPT-4o nano genererer opskrifter baseret på dine tilgængelige ingredienser
- **Intelligent Indkøbsliste**: Automatisk kategoriseret indkøbsliste med progress tracking
- **Stregkode Scanner**: Scan produkter for hurtig tilføjelse
- **Kategori Management**: Tilpas og administrer dine kategorier
- **Custom Icons**: Professionelle ikoner for alle app funktioner

## 🎥 Demo

App demo der viser alle hovedfunktioner:

(https://youtube.com/shorts/K068hlKhzqg?feature=share)

*Kort video der demonstrerer pantry management, AI opskrifter, scanner funktionalitet og indkøbsliste features*

## Teknologi Stack

- **React Native + Expo SDK 54**
- **Azure OpenAI** (GPT-4o nano)
- **AsyncStorage** for lokal data
- **React Navigation** (Tab + Stack navigators)
- **Linear Gradient** til flotte baggrunde
- **Expo Camera** til stregkode scanning
- **Custom Components**: Modulær UI arkitektur

## Screens

1. **Pantry**: Hovedskærm med fødevare oversigt og scanner
2. **Udløber Snart**: Varer der udløber inden for 2 dage
3. **Opskrifter**: AI-genererede opskriftsforslag med Azure OpenAI
4. **Indkøbsliste**: Smart kategoriseret indkøbsliste med progress tracking
5. **Indstillinger**: Kategori management og app statistikker
6. **Kategorier**: Detaljeret kategori administration

## Design Features

- **Custom Icons**: chef.png, shopping.png, settings.png, logo.png, expire.png
- **Banner Mode Headers**: Konsistent elevated header design
- **Runde Navigation Icons**: 32px custom ikoner i navigation bar
- **Visual Feedback**: Opacity changes for focused/unfocused states
- **Gradient Backgrounds**: Flotte lineare gradienter
- **Responsive Design**: Optimeret til mobile enheder


## 🚀 Installation

```bash
# Installer dependencies
npm install

# Start development server
npx expo start

# For production build
npx expo build
```

## 📂 Projekt Struktur

```
src/
├── components/          # Reusable UI components
│   ├── Logo.js         # Custom icon components
│   └── UI.js           # UI components (buttons, headers, etc.)
├── screens/            # App screens
├── services/           # API and business logic
├── styles/             # Styling files
├── utils/              # Utilities and themes
└── context/            # React context for state management
```

## 🔑 Environment Setup

Opret en `.env` fil i root med:

```
AZURE_OPENAI_ENDPOINT=your_endpoint
AZURE_OPENAI_API_KEY=your_api_key
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment
AZURE_OPENAI_API_VERSION=2024-12-01-preview
```

