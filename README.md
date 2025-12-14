# Voice Spectrum Analyzer

A modern, interactive web application that combines real-time audio visualization with live speech-to-text transcription. Experience your voice come to life through beautiful circular visualizations while seeing your words transcribed in real-time.

---
## 🌐 Live Demo  
🔗 [https://chandani-audio-equalizer.netlify.app/](https://chandani-audio-equalizer.netlify.app/)


## ✨ Features

- **Real-time Audio Visualization**: Watch your voice create stunning circular patterns that respond to your speech frequency and amplitude
- **Live Speech-to-Text**: Built-in speech recognition that transcribes your words as you speak
- **Interactive Controls**: Simple start/stop controls with visual feedback
- **Audio Level Indicator**: Real-time display of your microphone's audio levels
- **Copy Transcript**: Easily copy your transcribed text to clipboard
- **Responsive Design**: Works beautifully on desktop and mobile devices
- **Modern UI**: Clean, gradient-based interface with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js (version 16 or higher)
- A modern web browser (Chrome recommended for best speech recognition)
- Microphone access (required for audio features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ChandaniSahu/audio-equalizer.git
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## 📱 Usage

1. **Grant Microphone Permissions**: When prompted, allow microphone access
2. **Start Listening**: Click the "Start Listening" button
3. **Speak Clearly**: Watch the visualization respond to your voice while your words appear in the transcript
4. **Copy Transcript**: Use the "Copy Transcript" button to copy your transcribed text
5. **Stop Listening**: Click "Stop Listening" when finished

## 🛠️ Tech Stack

- **Frontend**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Audio Processing**: Web Audio API
- **Speech Recognition**: Web Speech API
- **Deployment**: Ready for static hosting platforms

## 🎯 Browser Support

- **Chrome**: Full support (recommended)
- **Firefox**: Limited speech recognition support
- **Safari**: Limited speech recognition support
- **Edge**: Full support



### Project Structure

```
src/
├── audioequalizer.jsx    # Main application component
├── main.jsx             # React app entry point
├── App.css             # Global styles
└── index.css           # Tailwind CSS imports
```


## 📄 License

This project is open source and available under the [MIT License](LICENSE).


