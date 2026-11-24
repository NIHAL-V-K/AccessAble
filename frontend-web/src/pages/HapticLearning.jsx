import { useState, useRef, useEffect } from "react";
import BackToDashboard from "../components/BackToDashboard";

import {
  Accessibility,
  Hand,
  Vibrate,
  CheckCircle2,
  AlertCircle,
  Bell,
  Heart,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Smartphone,
  Info,
  Volume2,
  Zap,
  Trophy,
  Gamepad2,
  VolumeX,
  Music,
  Target,
} from "lucide-react";

import "./HapticLearning.css";

function HapticLearning() {
  const [activePattern, setActivePattern] = useState("");
  const [feedback, setFeedback] = useState("");
  const [customIntensity, setCustomIntensity] = useState(300);
  const [customPause, setCustomPause] = useState(200);
  const [customRepeats, setCustomRepeats] = useState(2);

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const [gamePattern, setGamePattern] = useState(null);
  const [gameOptions, setGameOptions] = useState([]);
  const [gameAnswer, setGameAnswer] = useState("");
  const [gameScore, setGameScore] = useState(0);
  const [gameAttempts, setGameAttempts] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const audioContextRef = useRef(null);
  const timersRef = useRef([]);

  const isSupported =
    typeof navigator !== "undefined" &&
    typeof navigator.vibrate === "function";

  const patterns = [
    {
      id: "success",
      title: "Success",
      description: "A short double vibration indicating a successful action.",
      icon: CheckCircle2,
      color: "success",
      duration: "Short",
      vibration: [150, 100, 150],
      frequencies: [700, 900],
    },
    {
      id: "error",
      title: "Error",
      description: "A longer vibration to indicate an incorrect action.",
      icon: AlertCircle,
      color: "error",
      duration: "Long",
      vibration: [400, 150, 400],
      frequencies: [250, 180],
    },
    {
      id: "notification",
      title: "Notification",
      description: "A gentle vibration to notify you of an update.",
      icon: Bell,
      color: "notification",
      duration: "Medium",
      vibration: [200],
      frequencies: [600],
    },
    {
      id: "heartbeat",
      title: "Heartbeat",
      description: "A rhythmic pattern inspired by a heartbeat.",
      icon: Heart,
      color: "heartbeat",
      duration: "Rhythmic",
      vibration: [100, 100, 250, 300],
      frequencies: [400, 550],
    },
    {
      id: "alert",
      title: "Emergency Alert",
      description: "A repeated vibration pattern for important alerts.",
      icon: Zap,
      color: "alert",
      duration: "Repeated",
      vibration: [500, 150, 500, 150, 500],
      frequencies: [300, 300, 300],
    },
  ];

  // AUDIO INITIALIZATION

  const getAudioContext = () => {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      return null;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    return audioContextRef.current;
  };

  // PLAY ONE AUDIO TONE

  const playTone = (frequency, duration = 180) => {
    if (!audioEnabled) return;

    const context = getAudioContext();

    if (!context) {
      setFeedback("Audio is not supported by this browser.");
      return;
    }

    if (context.state === "suspended") {
      context.resume();
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.15,
      context.currentTime + 0.02
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + duration / 1000
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + duration / 1000 + 0.03);
  };

  // PLAY AUDIO SEQUENCE

  const playAudioSequence = (frequencies, interval = 350) => {
    frequencies.forEach((frequency, index) => {
      const timer = setTimeout(() => {
        playTone(frequency, 180);
      }, index * interval);

      timersRef.current.push(timer);
    });
  };

  // CLEAR ACTIVE TIMERS

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  // PLAY VIBRATION AND AUDIO TOGETHER

  const triggerVibration = (pattern, title, frequencies = []) => {
    clearTimers();

    setActivePattern(title);
    setIsPlaying(true);
    setFeedback("");

    let vibrationStarted = false;

    if (isSupported) {
      try {
        vibrationStarted = navigator.vibrate(pattern);

      } catch {
        vibrationStarted = false;
      }
    }

    if (audioEnabled && frequencies.length > 0) {
      playAudioSequence(frequencies);
    }

    if (vibrationStarted) {
      setFeedback(
        "Audio and vibration feedback activated."
      );
    } else if (audioEnabled) {
      setFeedback(
        "Audio and visual feedback activated. Actual vibration requires a compatible device."
      );
    } else {
      setFeedback(
        "Visual feedback activated. Enable sound or use a compatible mobile device for additional feedback."
      );
    }

    const totalDuration = pattern.reduce(
      (total, value) => total + value,
      0
    );

    const timer = setTimeout(() => {
      setActivePattern("");
      setIsPlaying(false);
    }, Math.max(totalDuration, 1800));

    timersRef.current.push(timer);
  };

  // STOP ALL FEEDBACK

  const stopVibration = () => {
    clearTimers();

    if (isSupported) {
      navigator.vibrate(0);
    }

    setActivePattern("");
    setIsPlaying(false);
    setFeedback("Playback stopped.");
  };

  // CUSTOM PATTERN

  const playCustomPattern = () => {
    const pattern = [];

    for (let i = 0; i < customRepeats; i++) {
      pattern.push(customIntensity);

      if (i !== customRepeats - 1) {
        pattern.push(customPause);
      }
    }

    const frequencies = Array(customRepeats).fill(500);

    triggerVibration(
      pattern,
      "Custom Pattern",
      frequencies
    );
  };

  const resetCustom = () => {
    setCustomIntensity(300);
    setCustomPause(200);
    setCustomRepeats(2);
    stopVibration();
  };

  // AUDIO TOGGLE

  const toggleAudio = () => {
    setAudioEnabled((previous) => !previous);
  };

  // GAME: GENERATE RANDOM PATTERN

  const generateGame = () => {
    stopVibration();

    const randomPattern =
      patterns[Math.floor(Math.random() * patterns.length)];

    const shuffled = [...patterns].sort(
      () => Math.random() - 0.5
    );

    setGamePattern(randomPattern);
    setGameOptions(shuffled);
    setGameAnswer("");
    setGameStarted(true);
  };

  // GAME: PLAY QUESTION

  const playGamePattern = () => {
    if (!gamePattern) return;

    triggerVibration(
      gamePattern.vibration,
      gamePattern.title,
      gamePattern.frequencies
    );
  };

  // GAME: CHECK ANSWER

  const checkGameAnswer = (answer) => {
    if (!gamePattern || gameAnswer) return;

    setGameAnswer(answer);
    setGameAttempts((previous) => previous + 1);

    if (answer === gamePattern.title) {
      setGameScore((previous) => previous + 10);
    }
  };

  // CLEANUP

  useEffect(() => {
    return () => {
      clearTimers();

      if (
        typeof navigator !== "undefined" &&
        typeof navigator.vibrate === "function"
      ) {
        navigator.vibrate(0);
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="haptic-page">

      {/* SIDEBAR */}

      <aside className="haptic-sidebar">

        <div className="haptic-brand">
          <div className="haptic-brand-icon">
            <Accessibility size={25} />
          </div>

          <span>
            access<span>able</span>
          </span>
        </div>

        <div className="haptic-sidebar-label">
          ACCESSIBILITY TOOLS
        </div>

        <div className="haptic-sidebar-item active">
          <Hand size={19} />
          Haptic Learning
        </div>

        <div className="haptic-sidebar-bottom">
          <Sparkles size={22} />

          <h4>Feel the learning.</h4>

          <p>
            Experience digital interaction through touch and vibration.
          </p>
        </div>

        <div className="haptic-sidebar-footer">
          ACCESSABLE AI
          <span>Learning made inclusive.</span>
        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="haptic-main">

        {/* HEADER */}

        <header className="haptic-header">
          <BackToDashboard />

          <div>
            <h2>Haptic Learning</h2>
            <p>Experience learning through touch and vibration.</p>
          </div>

          <div className="haptic-header-actions">

            <button
              className="haptic-audio-toggle"
              onClick={toggleAudio}
              aria-label={audioEnabled ? "Mute audio" : "Enable audio"}
            >
              {audioEnabled ? (
                <Volume2 size={17} />
              ) : (
                <VolumeX size={17} />
              )}

              {audioEnabled ? "Audio On" : "Audio Off"}
            </button>

            <div className="haptic-header-badge">
              <span></span>
              Tactile experience
            </div>

          </div>

        </header>

        {/* CONTENT */}

        <section className="haptic-content">

          {/* INTRODUCTION */}

          <div className="haptic-intro">

            <div className="haptic-intro-icon">
              <Hand size={28} />
            </div>

            <span>INTERACTIVE TOUCH EXPERIENCE</span>

            <h1>
              Feel every interaction.
              <br />
              <span>Learn beyond sight.</span>
            </h1>

            <p>
              Explore different vibration patterns and discover how
              tactile feedback can make digital learning more accessible.
            </p>

          </div>

          {/* DEVICE SUPPORT */}

          <div className={`haptic-device-notice ${isSupported ? "supported" : ""}`}>

            <div className="haptic-device-icon">
              <Smartphone size={22} />
            </div>

            <div>
              <h4>
                {isSupported
                  ? "Vibration API available"
                  : "Visual and Audio Feedback Mode"}
              </h4>

              <p>
                {isSupported
                  ? "Your browser exposes vibration support. Actual vibration also depends on your device and browser."
                  : "Your device does not expose browser vibration. Audio and animated visual feedback are available instead."}
              </p>
            </div>

          </div>

          {/* PATTERN LIBRARY */}

          <div className="haptic-section-heading">

            <div>
              <span>EXPLORE</span>
              <h2>Vibration Pattern Library</h2>
              <p>
                Choose a pattern to experience its tactile feedback.
              </p>
            </div>

            <Vibrate size={25} />

          </div>

          <div className="haptic-pattern-grid">

            {patterns.map((pattern) => {

              const Icon = pattern.icon;
              const isActive = activePattern === pattern.title;

              return (
                <article
                  className={`haptic-pattern-card ${pattern.color} ${
                    isActive ? "playing" : ""
                  }`}
                  key={pattern.id}
                >

                  <div className="haptic-pattern-top">

                    <div className="haptic-pattern-icon">
                      <Icon size={25} />
                    </div>

                    <span className="haptic-duration">
                      {pattern.duration}
                    </span>

                  </div>

                  <h3>{pattern.title}</h3>

                  <p>{pattern.description}</p>

                  <div
                    className={`haptic-wave ${
                      isActive ? "wave-active" : ""
                    }`}
                  >

                    {pattern.vibration
                      .filter((_, index) => index % 2 === 0)
                      .map((_, index) => (
                        <span
                          key={index}
                          style={{
                            height: `${12 + (index % 3) * 7}px`,
                          }}
                        />
                      ))}

                  </div>

                  <button
                    className="haptic-play-button"
                    onClick={() =>
                      triggerVibration(
                        pattern.vibration,
                        pattern.title,
                        pattern.frequencies
                      )
                    }
                  >

                    {isActive ? (
                      <Pause size={16} />
                    ) : (
                      <Play size={16} fill="currentColor" />
                    )}

                    {isActive ? "Playing..." : "Try Pattern"}

                  </button>

                </article>
              );
            })}

          </div>

          {/* STOP BUTTON */}

          {isPlaying && (
            <button
              className="haptic-stop-main"
              onClick={stopVibration}
            >
              <Pause size={17} />
              Stop Feedback
            </button>
          )}

          {/* FEEDBACK STATUS */}

          {feedback && (
            <div className="haptic-feedback-message" role="status">
              <Info size={19} />
              <span>{feedback}</span>
            </div>
          )}

          {/* CUSTOM PATTERN BUILDER */}

          <section className="haptic-custom-card">

            <div className="haptic-section-heading">

              <div>
                <span>PERSONALIZE</span>
                <h2>Create Your Own Pattern</h2>
                <p>
                  Adjust vibration settings to create a custom experience.
                </p>
              </div>

              <Sparkles size={25} />

            </div>

            <div className="haptic-custom-grid">

              <div className="haptic-custom-setting">

                <label>
                  Vibration Duration
                  <strong>{customIntensity} ms</strong>
                </label>

                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={customIntensity}
                  onChange={(e) =>
                    setCustomIntensity(Number(e.target.value))
                  }
                />

                <div className="haptic-range-labels">
                  <span>Short</span>
                  <span>Long</span>
                </div>

              </div>

              <div className="haptic-custom-setting">

                <label>
                  Pause Duration
                  <strong>{customPause} ms</strong>
                </label>

                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={customPause}
                  onChange={(e) =>
                    setCustomPause(Number(e.target.value))
                  }
                />

                <div className="haptic-range-labels">
                  <span>Short</span>
                  <span>Long</span>
                </div>

              </div>

              <div className="haptic-custom-setting">

                <label>
                  Number of Vibrations
                  <strong>{customRepeats}</strong>
                </label>

                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={customRepeats}
                  onChange={(e) =>
                    setCustomRepeats(Number(e.target.value))
                  }
                />

                <div className="haptic-range-labels">
                  <span>1 time</span>
                  <span>5 times</span>
                </div>

              </div>

            </div>

            <div className="haptic-custom-actions">

              <button
                className="haptic-custom-play"
                onClick={playCustomPattern}
              >
                <Play size={17} fill="currentColor" />
                Play Custom Pattern
              </button>

              <button
                className="haptic-custom-reset"
                onClick={resetCustom}
              >
                <RotateCcw size={17} />
                Reset
              </button>

              <button
                className="haptic-custom-stop"
                onClick={stopVibration}
              >
                Stop Feedback
              </button>

            </div>

          </section>

          {/* INTERACTIVE LEARNING GAME */}

          <section className="haptic-game-card">

            <div className="haptic-game-heading">

              <div className="haptic-game-icon">
                <Gamepad2 size={27} />
              </div>

              <div>
                <span>INTERACTIVE ACTIVITY</span>
                <h2>Recognize the Pattern</h2>
                <p>
                  Listen to the pattern and identify the correct feedback.
                </p>
              </div>

            </div>

            <div className="haptic-game-stats">

              <div>
                <Trophy size={19} />
                <span>Score</span>
                <strong>{gameScore}</strong>
              </div>

              <div>
                <Target size={19} />
                <span>Attempts</span>
                <strong>{gameAttempts}</strong>
              </div>

            </div>

            {!gameStarted ? (

              <div className="haptic-game-start">

                <div className="haptic-game-placeholder">
                  <Music size={35} />
                </div>

                <h3>Ready to test your senses?</h3>

                <p>
                  Play a mystery pattern and identify which feedback
                  it represents.
                </p>

                <button
                  className="haptic-game-button"
                  onClick={generateGame}
                >
                  <Play size={17} fill="currentColor" />
                  Start Game
                </button>

              </div>

            ) : (

              <div className="haptic-game-question">

                <div className="haptic-question-label">
                  QUESTION
                </div>

                <h3>Which pattern did you hear or feel?</h3>

                <button
                  className="haptic-game-play"
                  onClick={playGamePattern}
                >
                  <Volume2 size={19} />
                  Play Mystery Pattern
                </button>

                <div className="haptic-game-options">

                  {gameOptions.map((option) => {

                    let optionClass = "";

                    if (gameAnswer) {

                      if (option.title === gamePattern.title) {
                        optionClass = "correct";
                      } else if (option.title === gameAnswer) {
                        optionClass = "incorrect";
                      }

                    }

                    return (
                      <button
                        key={option.id}
                        className={`haptic-game-option ${optionClass}`}
                        disabled={Boolean(gameAnswer)}
                        onClick={() => checkGameAnswer(option.title)}
                      >
                        {option.title}
                      </button>
                    );
                  })}

                </div>

                {gameAnswer && (

                  <div className="haptic-game-result">

                    {gameAnswer === gamePattern.title ? (
                      <>
                        <CheckCircle2 size={21} />
                        Correct! You earned 10 points.
                      </>
                    ) : (
                      <>
                        <AlertCircle size={21} />
                        Not quite! The correct answer was {gamePattern.title}.
                      </>
                    )}

                  </div>

                )}

                {gameAnswer && (

                  <button
                    className="haptic-game-next"
                    onClick={generateGame}
                  >
                    Next Question
                    <Play size={16} />
                  </button>

                )}

              </div>

            )}

          </section>

          {/* LEARNING INFORMATION */}

          <div className="haptic-info-card">

            <div className="haptic-info-icon">
              <Volume2 size={23} />
            </div>

            <div>
              <h4>Why Haptic Learning?</h4>

              <p>
                Haptic feedback provides information through touch.
                It can complement visual and audio information and
                support more inclusive digital interactions.
              </p>
            </div>

          </div>

          {/* FOOTER */}

          <footer className="haptic-footer">

            <p>
              © 2026 AccessAble. Designed around people. Built for everyone.
            </p>

            <span>
              <Accessibility size={16} />
              Accessibility first
            </span>

          </footer>

        </section>

      </main>

    </div>
  );
}

export default HapticLearning;