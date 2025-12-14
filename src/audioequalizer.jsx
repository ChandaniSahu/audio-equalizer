import { useEffect, useRef, useState } from "react";

export default function AudioVisualizer() {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const recognitionRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);


  // Add this function with your other functions
const handleCopyTranscript = () => {
  if (transcript) {
    navigator.clipboard.writeText(transcript);
    setShowCopiedNotification(true);
    setTimeout(() => {
      setShowCopiedNotification(false);
    }, 2000); // Hide after 2 seconds
  }
};

  // ---- Start visualizer and mic ----
  const startAudio = async () => {
    // Clear previous transcript
    setTranscript("");

    try {
      // Get mic stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio Context + analyser
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      drawVisualizer();
      startRecognition();

      setListening(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Unable to access microphone. Please check permissions.");
    }
  };

  const stopAudio = () => {
    // Stop visualizer
    cancelAnimationFrame(animationRef.current);
    // Stop mic tracks
    streamRef.current?.getTracks().forEach((t) => t.stop());
    // Stop recognition
    recognitionRef.current?.stop();
    // Reset audio level
    setAudioLevel(0);
    setListening(false);
  };

  // ---- Circular visualizer ----
  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const analyser = analyserRef.current;
    const buffer = new Uint8Array(analyser.frequencyBinCount);

    const render = () => {
      analyser.getByteFrequencyData(buffer);
      
      // Calculate average audio level for pulse effect
      const avg = buffer.reduce((a, b) => a + b) / buffer.length;
      setAudioLevel(avg);
      
      // Clear with soft fade effect
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 70;
      const pulseRadius = baseRadius + (avg * 0.3);

      // Draw subtle pulse effect
      if (avg > 10) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${avg / 255 * 0.1})`;
        ctx.fill();
      }

      // Draw central circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fill();
      ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw frequency bars
      buffer.forEach((value, i) => {
        const angle = (i / buffer.length) * Math.PI * 2;
        const barHeight = value * 0.8;
        const hue = (i * 360 / buffer.length + avg) % 360;

        const x1 = centerX + Math.cos(angle) * baseRadius;
        const y1 = centerY + Math.sin(angle) * baseRadius;
        const x2 = centerX + Math.cos(angle) * (baseRadius + barHeight);
        const y2 = centerY + Math.sin(angle) * (baseRadius + barHeight);

        // Gradient effect for bars
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, `hsla(${hue}, 90%, 50%, 0.9)`);
        gradient.addColorStop(1, `hsla(${hue}, 90%, 40%, 0.6)`);

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // Draw inner circle with listening indicator
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
      ctx.fillStyle = listening 
        ? `rgba(239, 68, 68, ${0.7 + Math.sin(Date.now() * 0.01) * 0.3})`
        : "rgba(34, 197, 94, 0.8)";
      ctx.fill();

      // Add inner ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, 32, 0, Math.PI * 2);
      ctx.strokeStyle = listening ? "rgba(239, 68, 68, 0.3)" : "rgba(34, 197, 94, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      animationRef.current = requestAnimationFrame(render);
    };

    render();
  };

  // Clear canvas for static state
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    // Clear canvas with a clean background
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw a simple static microphone icon
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = 70;
    
    // Draw central circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fill();
    ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw inner circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(34, 197, 94, 0.8)";
    ctx.fill();
    
    // Add inner ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, 32, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(34, 197, 94, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // ---- Web Speech API ----
  const startRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition API");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let currentText = transcript;
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          currentText += event.results[i][0].transcript + " ";
        } else {
          // Show interim results differently
          currentText = currentText.replace(/\[.*\]/, '') + `${event.results[i][0].transcript}`;
        }
      }
      setTranscript(currentText.trim());
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    // Auto-restart if it stops
    recognition.onend = () => {
      if (listening) {
        setTimeout(() => recognition.start(), 100);
      }
    };

    recognition.start();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Initialize canvas with static state
  useEffect(() => {
    if (!listening) {
      clearCanvas();
    }
  }, [listening]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12 ">
          <div className="inline-block p-3 rounded-2xl bg-white shadow-lg mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Voice Spectrum Analyzer
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            Real-time audio visualization with live transcription
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Left Column - Visualizer */}
          <div className="flex-1 max-w-lg">
            <div 
              className="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="w-full h-auto rounded-3xl shadow-2xl shadow-blue-200/50 border border-gray-100 transition-all duration-300 hover:shadow-blue-300/70"
              ></canvas>
              
              {/* Audio level indicator - Only show when listening */}
              {listening && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full px-5 py-3 shadow-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${listening ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-gray-500 font-medium">Audio Level</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-200"
                            style={{ width: `${(audioLevel / 255) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-blue-600 min-w-[40px]">
                          {Math.round((audioLevel / 255) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Static message overlay - Only show when NOT listening */}
              {!listening &&  (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl pointer-events-none">
                  <div className="text-center p-8 max-w-sm bg-white/80 backdrop-blur-sm rounded-2xl m-6 shadow-lg border border-gray-200">
                    <div className="mb-4">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Ready to Visualize Your Voice
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Click "Start Listening" to begin. Your voice will create beautiful visual patterns as you speak.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="mt-8 flex flex-col items-center">
              <div className="flex gap-4 mb-6">
                {!listening ? (
                  <button
                    onClick={startAudio}
                    className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-lg font-semibold shadow-xl hover:shadow-green-300/50 hover:scale-105 transition-all duration-300 flex items-center gap-3 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="w-4 h-4 bg-white rounded-full group-hover:animate-pulse"></div>
                      <span>Start Listening</span>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={stopAudio}
                    className="px-10 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full text-lg font-semibold shadow-xl hover:shadow-red-300/50 hover:scale-105 transition-all duration-300 flex items-center gap-3 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-500 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                      <span>Stop Listening</span>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </button>
                )}
              </div>
              
              {/* Status indicator */}
              <div className={`px-6 py-3 rounded-full flex items-center gap-3 transition-all duration-300 ${listening ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
                <div className={`w-3 h-3 rounded-full ${listening ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></div>
                <span className={`font-medium ${listening ? 'text-red-700' : 'text-blue-700'}`}>
                  {listening ? 'Microphone Active - Listening...' : 'Ready to Start'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Transcript */}
          <div className="flex-1 max-w-lg w-full mt-8 lg:mt-0">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Live Transcript</h2>
                    <p className="text-sm text-gray-500">Your speech appears here in real-time</p>
                  </div>
                </div>
                <span className="text-sm px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium">
                  {transcript.split(/\s+/).filter(word => word.length > 0).length} words
                </span>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-5 flex-1 overflow-y-auto border border-gray-200 min-h-[300px]">
                {transcript ? (
                  <div className="space-y-4">
                    {transcript.split(/\.|\?|\!/).map((sentence, index) => (
                      sentence.trim() && (
                        <div 
                          key={index} 
                          className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm animate-fadeIn"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <p className="text-gray-700 leading-relaxed flex-1">
                              {sentence.trim()}
                              {sentence.trim().match(/[^.!?]$/) && '.'}
                            </p>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
                      <svg className="w-10 h-10 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-xl font-medium text-gray-500 mb-2">No Transcript Yet</p>
                    <p className="text-center text-gray-400">
                      Click "Start Listening" and speak to see your<br />transcript appear here in real-time
                    </p>
                  </div>
                )}
              </div>
              
              {/* Action buttons for transcript */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setTranscript("")}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!transcript}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Clear Text
                </button>
                <button
                  onClick={handleCopyTranscript}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                  disabled={!transcript}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                  Copy Transcript
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-700">Tips for best results:</h3>
              </div>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Speak clearly and at a moderate pace</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Reduce background noise when possible</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Use Chrome for the best speech recognition</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Keep microphone close for better audio quality</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200 text-center">
          <div className="inline-flex items-center gap-6 text-gray-500 text-sm">
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Speech Recognition</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Real-time Visualization</span>
            </div>
          </div>
          <p className="mt-4 text-gray-400 text-sm">
            Ensure microphone permissions are granted for full functionality
          </p>
        </footer>
        {/* Copy Notification Toast */}
{showCopiedNotification && (
  <div className="fixed bottom-6 right-6 z-50 animate-fadeIn">
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      <span className="font-medium">Transcript copied to clipboard!</span>
    </div>
  </div>
)}
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
