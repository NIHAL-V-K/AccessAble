import { useState, useEffect, useRef } from "react";
import BackToDashboard from "../components/BackToDashboard";

import {
  Volume2,
  Play,
  Pause,
  Square,
  RotateCcw,
  Trash2,
  Headphones,
  Accessibility,
  Sparkles,
  FileAudio,
  Gauge,
  Languages,
  Mic2
} from "lucide-react";

import "./TextToSpeech.css";

function TextToSpeech() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const utteranceRef = useRef(null);

  // LOAD AVAILABLE BROWSER VOICES
  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();

      setVoices(availableVoices);

      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    loadVoices();

    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // PLAY TEXT
  const handlePlay = () => {
    if (!text.trim()) {
      alert("Please enter some text first.");
      return;
    }

    if (!("speechSynthesis" in window)) {
      alert("Text-to-Speech is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const voice = voices.find(
      (item) => item.name === selectedVoice
    );

    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;

    window.speechSynthesis.speak(utterance);
  };

  // PAUSE SPEECH
  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  // RESUME SPEECH
  const handleResume = () => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  // STOP SPEECH
  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  // CLEAR TEXT
  const handleClear = () => {
    handleStop();
    setText("");
  };

  // RESET SETTINGS
  const handleReset = () => {
    handleStop();
    setRate(1);
    setPitch(1);

    if (voices.length > 0) {
      setSelectedVoice(voices[0].name);
    }
  };

  return (
    <div className="tts-page">

      {/* SIDEBAR */}

      <aside className="tts-sidebar">

        <div className="tts-brand">
          <div className="tts-brand-icon">
            <Accessibility size={25} />
          </div>

          <span>access<span>able</span></span>
        </div>

        <div className="tts-sidebar-label">
          ACCESSIBILITY TOOLS
        </div>

        <div className="tts-sidebar-item active">
          <Volume2 size={19} />
          Text to Speech
        </div>

        <div className="tts-sidebar-bottom">
          <Sparkles size={22} />

          <h4>Every word matters.</h4>

          <p>
            Making digital content more accessible through audio.
          </p>
        </div>

        <div className="tts-sidebar-footer">
          ACCESSABLE AI
          <span>Learning made inclusive.</span>
        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="tts-main">

        {/* HEADER */}

        <header className="tts-header">
          <BackToDashboard />
          <div>
            <h2>Text to Speech</h2>
            <p>Turn written content into spoken words.</p>
          </div>

          <div className="tts-header-badge">
            <span></span>
            Audio accessibility
          </div>
        </header>

        {/* CONTENT */}

        <section className="tts-content">

          {/* INTRO */}

          <div className="tts-intro">
            <div className="tts-intro-icon">
              <Headphones size={27} />
            </div>

            <span>ACCESSIBLE READING EXPERIENCE</span>

            <h1>
              Listen instead of read.
              <br />
              <span>Learn your way.</span>
            </h1>

            <p>
              Paste your text, choose a voice and listen to your
              content at a comfortable speed.
            </p>
          </div>

          {/* TEXT INPUT CARD */}

          <div className="tts-card">

            <div className="tts-card-header">
              <div>
                <h3>
                  <FileAudio size={19} />
                  Your text
                </h3>

                <p>Enter or paste the content you want to hear.</p>
              </div>

              <button
                className="tts-clear-button"
                onClick={handleClear}
              >
                <Trash2 size={15} />
                Clear
              </button>
            </div>

            <textarea
              className="tts-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing or paste your text here..."
              aria-label="Text to convert into speech"
            />

            <div className="tts-text-footer">
              <span>{text.length} characters</span>
              <span>{text.trim() ? text.trim().split(/\s+/).length : 0} words</span>
            </div>

            {/* VOICE SETTINGS */}

            <div className="tts-settings">

              <div className="tts-setting">
                <label>
                  <Languages size={17} />
                  Voice
                </label>

                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  disabled={voices.length === 0}
                >
                  {voices.length === 0 && (
                    <option value="">Loading voices...</option>
                  )}

                  {voices.map((voice) => (
                    <option
                      key={voice.name}
                      value={voice.name}
                    >
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div className="tts-setting">
                <label>
                  <Gauge size={17} />
                  Speech Speed
                  <strong>{rate.toFixed(1)}x</strong>
                </label>

                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                />

                <div className="tts-range-labels">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>

              <div className="tts-setting">
                <label>
                  <Mic2 size={17} />
                  Voice Pitch
                  <strong>{pitch.toFixed(1)}</strong>
                </label>

                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(Number(e.target.value))}
                />

                <div className="tts-range-labels">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

            </div>

            {/* PLAYBACK CONTROLS */}

            <div className="tts-controls">

              {!isSpeaking ? (
                <button
                  className="tts-play-button"
                  onClick={handlePlay}
                  disabled={!text.trim()}
                >
                  <Play size={19} fill="currentColor" />
                  Play Speech
                </button>
              ) : (
                <button
                  className="tts-play-button"
                  onClick={isPaused ? handleResume : handlePause}
                >
                  {isPaused ? (
                    <>
                      <Play size={19} fill="currentColor" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause size={19} />
                      Pause
                    </>
                  )}
                </button>
              )}

              <button
                className="tts-stop-button"
                onClick={handleStop}
                disabled={!isSpeaking}
              >
                <Square size={16} />
                Stop
              </button>

              <button
                className="tts-reset-button"
                onClick={handleReset}
              >
                <RotateCcw size={16} />
                Reset settings
              </button>

            </div>

          </div>

          {/* INFORMATION */}

          <div className="tts-info">
            <div className="tts-info-icon">
              <Volume2 size={21} />
            </div>

            <div>
              <h4>Listen at your own pace</h4>
              <p>
                Choose the voice and speed that feel comfortable.
                Available voices depend on your browser and operating system.
              </p>
            </div>
          </div>

        </section>

      </main>

    </div>
  );
}

export default TextToSpeech;