import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "./VoiceNavigation.css";

function VoiceNavigation() {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Voice navigation is ready");

  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);
  const restartTimerRef = useRef(null);
  const startRecognitionRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticationPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset-password/");

  // TEXT TO SPEECH
  const speak = useCallback((message) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = "en-IN";
    speech.rate = 0.9;

    window.speechSynthesis.speak(speech);
  }, []);

  // PAGE INSTRUCTIONS
  const getPageInstructions = useCallback((path) => {
    const instructions = {
      "/":
        "Welcome to AccessAble. Say Login or Register to continue.",

      "/dashboard":
        "You are on your Dashboard. Say Open Resources, Open AI Assistant, Open Document Reader, Open Text to Speech, or Open Haptic Learning.",

      "/ai-assistant":
        "You are on the AI Assistant page. You can interact with your assistant using voice input.",

      "/document-reader":
        "You are on the Document Reader page. Upload a document and say Read Document.",

      "/text-to-speech":
        "You are on the Text to Speech page. Enter text and listen to it.",

      "/haptic-learning":
        "You are on the Haptic Learning page. Explore vibration patterns and interactive activities."
    };

    return (
      instructions[path] ||
      "You are on an AccessAble page. Say What can I say for available commands."
    );
  }, []);

  // STOP LISTENING
  const stopListening = useCallback(() => {
    listeningRef.current = false;

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    if (recognitionRef.current) {
      const recognition = recognitionRef.current;
      recognitionRef.current = null;

      try {
        recognition.stop();
      } catch (error) {
        console.log("Recognition already stopped.");
      }
    }

    setIsListening(false);
    setStatus("Voice navigation stopped");

    speak("Voice navigation stopped.");
  }, [speak]);

  // VOICE COMMAND HANDLER
  const handleCommand = useCallback((transcript) => {
    const command = transcript.toLowerCase().trim();

    console.log("Voice command received:", command);

    setStatus(`Command: ${transcript}`);

    // HELP
    if (
      command.includes("what can i say") ||
      command.includes("help") ||
      command.includes("available commands")
    ) {
      speak(
        "Available commands are Open Dashboard, Open Resources, Open AI Assistant, Open Document Reader, Open Text to Speech, Open Haptic Learning, Go Back, Repeat Instructions and Stop Listening."
      );
    }

    // REPEAT INSTRUCTIONS
    else if (
      command.includes("repeat instructions") ||
      command === "repeat"
    ) {
      speak(getPageInstructions(location.pathname));
    }

    // RESOURCES
    else if (
      command.includes("open resources") ||
      command.includes("go to resources") ||
      command.includes("show resources") ||
      command === "resources"
    ) {
      setStatus("Opening Resources");

      navigate("/dashboard", {
        state: { openSection: "Resources" }
      });

      speak("Opening Resources.");
    }

    // DOCUMENT READER
    else if (
      command.includes("open document reader") ||
      command.includes("go to document reader") ||
      command.includes("show document reader") ||
      command === "read document"
    ) {
      setStatus("Opening Document Reader");

      navigate("/document-reader");

      speak("Opening Document Reader.");
    }

    // DASHBOARD
    else if (
      command.includes("open dashboard") ||
      command.includes("go to dashboard") ||
      command === "dashboard"
    ) {
      setStatus("Opening Dashboard");

      navigate("/dashboard", {
        state: null
      });

      speak("Opening Dashboard.");
    }

    // AI ASSISTANT
    else if (
      command.includes("open ai assistant") ||
      command.includes("open assistant") ||
      command.includes("go to ai assistant") ||
      command.includes("open ai")
    ) {
      setStatus("Opening AI Assistant");

      navigate("/ai-assistant");

      speak("Opening AI Assistant.");
    }

    // TEXT TO SPEECH
    else if (
      command.includes("open text to speech") ||
      command.includes("go to text to speech") ||
      command.includes("text to speech")
    ) {
      setStatus("Opening Text to Speech");

      navigate("/text-to-speech");

      speak("Opening Text to Speech.");
    }

    // HAPTIC LEARNING
    else if (
      command.includes("open haptic learning") ||
      command.includes("go to haptic learning") ||
      command.includes("haptic learning")
    ) {
      setStatus("Opening Haptic Learning");

      navigate("/haptic-learning");

      speak("Opening Haptic Learning.");
    }

    // LOGIN
    else if (
      command.includes("open login") ||
      command === "login"
    ) {
      setStatus("Opening Login");

      navigate("/login");

      speak("Opening Login page.");
    }

    // REGISTER
    else if (
      command.includes("open register") ||
      command === "register" ||
      command.includes("sign up")
    ) {
      setStatus("Opening Registration");

      navigate("/register");

      speak("Opening Registration page.");
    }

    // GO BACK
    else if (
      command.includes("go back") ||
      command.includes("previous page")
    ) {
      setStatus("Going back");

      navigate(-1);

      speak("Going back.");
    }

    // STOP LISTENING
    else if (command.includes("stop listening")) {
      stopListening();
    }

    // UNKNOWN COMMAND
    else {
      setStatus(`Command not recognised: ${transcript}`);

      speak(
        "Sorry, I did not understand that command. Say What can I say for help."
      );
    }

  }, [
    navigate,
    speak,
    stopListening,
    getPageInstructions,
    location.pathname
  ]);

  // CREATE AND START A NEW RECOGNITION INSTANCE
  const startRecognition = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition || !listeningRef.current) return;

    // Clear any existing instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (error) {
        console.log("Previous recognition instance closed.");
      }
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      if (listeningRef.current) {
        setIsListening(true);
        setStatus("Listening for your commands...");
      }
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript =
            event.results[i][0].transcript.trim();

          if (transcript) {
            handleCommand(transcript);
          }
        }
      }
    };

    recognition.onerror = (event) => {
      console.error("Voice navigation error:", event.error);

      if (event.error === "not-allowed" ||
          event.error === "service-not-allowed") {
        listeningRef.current = false;

        setIsListening(false);
        setStatus("Microphone permission denied");

        speak("Please allow microphone access in your browser settings.");
      } else if (event.error === "no-speech") {
        setStatus("No speech detected. Keep speaking clearly.");
      } else if (event.error !== "aborted") {
        setStatus(`Voice recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }

      // Restart only when the user still wants voice navigation
      if (listeningRef.current) {
        restartTimerRef.current = setTimeout(() => {
          if (listeningRef.current) {
            startRecognitionRef.current?.();
          }
        }, 500);
      } else {
        setIsListening(false);
      }
    };

    try {
      recognition.start();
    } catch (error) {
      console.error("Unable to start recognition:", error);
      setStatus("Unable to start voice recognition");
    }

  }, [handleCommand, speak]);

  // KEEP LATEST START FUNCTION
  useEffect(() => {
    startRecognitionRef.current = startRecognition;
  }, [startRecognition]);

  // START LISTENING
  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("Voice recognition is not supported");

      speak("Voice recognition is not supported in this browser.");

      return;
    }

    if (listeningRef.current) return;

    listeningRef.current = true;

    setStatus("Starting voice navigation...");

    setIsListening(true);

    speak(
      "Voice navigation activated. I am listening."
    );

    // Start recognition after the activation announcement
    const startTimer = setTimeout(() => {
      if (listeningRef.current) {
        startRecognitionRef.current?.();
      }
    }, 1200);

    restartTimerRef.current = startTimer;

  }, [speak]);

  // KEYBOARD SHORTCUT
  useEffect(() => {
    const handleKeyboard = (event) => {
      if (isAuthenticationPage) return;

      if (
        event.altKey &&
        event.shiftKey &&
        event.key.toLowerCase() === "v"
      ) {
        event.preventDefault();

        if (listeningRef.current) {
          stopListening();
        } else {
          startListening();
        }
      }
    };

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };

  }, [
    startListening,
    stopListening,
    isAuthenticationPage
  ]);

  // STOP ON LOGIN AND REGISTER
  useEffect(() => {
    if (isAuthenticationPage) {
      listeningRef.current = false;

      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }

      recognitionRef.current?.stop();
      recognitionRef.current = null;

      setIsListening(false);
      setStatus("Voice navigation is ready");

      window.speechSynthesis?.cancel();
    }

  }, [isAuthenticationPage]);

  // PAGE ANNOUNCEMENTS
  const previousPath = useRef(location.pathname);

  useEffect(() => {
    if (isAuthenticationPage) {
      previousPath.current = location.pathname;
      return;
    }

    if (previousPath.current !== location.pathname) {
      previousPath.current = location.pathname;

      const timer = setTimeout(() => {
        speak(getPageInstructions(location.pathname));
      }, 600);

      return () => clearTimeout(timer);
    }

  }, [
    location.pathname,
    isAuthenticationPage,
    speak,
    getPageInstructions
  ]);

  // CLEANUP
  useEffect(() => {
    return () => {
      listeningRef.current = false;

      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.log("Recognition cleanup completed.");
        }
      }

      window.speechSynthesis?.cancel();
    };
  }, []);

  // HIDE ON AUTHENTICATION PAGES
  if (isAuthenticationPage) {
    return null;
  }

  return (
    <div className="voice-navigation">

      <button
        type="button"
        className={`voice-navigation-button ${
          isListening ? "listening" : ""
        }`}
        onClick={
          isListening
            ? stopListening
            : startListening
        }
        aria-label={
          isListening
            ? "Stop voice navigation"
            : "Start voice navigation"
        }
        aria-pressed={isListening}
      >
        {isListening ? (
          <MicOff size={20} />
        ) : (
          <Mic size={20} />
        )}

        <span>
          {isListening
            ? "Stop Listening"
            : "Voice Navigation"}
        </span>
      </button>

      <div
        className="voice-navigation-status"
        role="status"
        aria-live="polite"
      >
        <Volume2 size={16} />
        <span>{status}</span>
      </div>

    </div>
  );
}

export default VoiceNavigation;
