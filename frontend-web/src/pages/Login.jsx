import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Mic, MicOff, Accessibility } from "lucide-react";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const mountedRef = useRef(true);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [voiceStatus, setVoiceStatus] = useState("");
  const [voiceLoginActive, setVoiceLoginActive] = useState(false);

  // Cleanup
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      window.speechSynthesis?.cancel();
    };
  }, []);

  // EMAIL VALIDATION
  const validateEmail = (email) => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      return "Email address is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailRegex.test(trimmedEmail)) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  // PASSWORD VALIDATION
  const validatePassword = (password) => {
    if (!password) {
      return "Password is required.";
    }

    if (password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    return "";
  };

  const validateField = (name, value) => {
    if (name === "email") return validateEmail(value);
    if (name === "password") return validatePassword(value);
    return "";
  };

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    setError("");

    if (touched[name]) {
      setFieldErrors((previous) => ({
        ...previous,
        [name]: validateField(name, value)
      }));
    }
  };

  // INPUT BLUR
  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((previous) => ({
      ...previous,
      [name]: true
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: validateField(name, value)
    }));
  };

  // FORM VALIDATION
  const validateForm = (email, password) => {
    const errors = {
      email: validateEmail(email),
      password: validatePassword(password)
    };

    setFieldErrors(errors);

    setTouched({
      email: true,
      password: true
    });

    return !errors.email && !errors.password;
  };

  // SHARED AUTHENTICATION FUNCTION
  const submitLogin = async (email, password) => {
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/auth/login",
        {
    email: email.trim().toLowerCase(),
    password,
    rememberMe
}
      );

      if (response.data.success) {
        const storage = rememberMe ? localStorage : sessionStorage;

        // Clear old authentication data
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        // Store new authentication data
        storage.setItem("token", response.data.token);
        storage.setItem("user", JSON.stringify(response.data.user));

        setFormData({
          email: "",
          password: ""
        });

        window.speechSynthesis?.cancel();

        navigate("/dashboard");

      } else {
        setError(
          response.data.message ||
          "Unable to login. Please try again."
        );

        setFormData((previous) => ({
          ...previous,
          password: ""
        }));
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to login. Please try again."
      );

      setFormData((previous) => ({
        ...previous,
        password: ""
      }));

    } finally {
      setLoading(false);
    }
  };

  // NORMAL LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!validateForm(formData.email, formData.password)) {
      return;
    }

    await submitLogin(formData.email, formData.password);
  };

  // SPOKEN INSTRUCTIONS
  const speakInstruction = (message, callback) => {
    if (!("speechSynthesis" in window)) {
      setVoiceStatus("Speech output is not supported.");
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(message);

    speech.lang = "en-IN";
    speech.rate = 0.9;

    speech.onend = () => {
      if (callback && mountedRef.current) {
        callback();
      }
    };

    window.speechSynthesis.speak(speech);
  };

  // CONVERT SPOKEN EMAIL
  const convertSpokenEmail = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:]+$/g, "")
      .replace(/\bat\b/g, "@")
      .replace(/\bdot\b/g, ".")
      .replace(/\bunderscore\b/g, "_")
      .replace(/\bhyphen\b/g, "-")
      .replace(/\bdash\b/g, "-")
      .replace(/\s+/g, "")
      .trim();
  };

  // STOP RECOGNITION
  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
  };

  // CANCEL VOICE LOGIN
  const cancelVoiceLogin = () => {
    stopRecognition();

    window.speechSynthesis?.cancel();

    setVoiceLoginActive(false);
    setVoiceStatus("Voice login cancelled.");

    setFormData((previous) => ({
      ...previous,
      password: ""
    }));

    speakInstruction("Voice login cancelled.");
  };

  // SPEECH RECOGNITION
  const listenToUser = (callback) => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceStatus("Voice recognition is not supported.");

      setVoiceLoginActive(false);

      speakInstruction(
        "Voice recognition is not supported. Please use keyboard login."
      );

      return;
    }

    stopRecognition();

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      if (mountedRef.current) {
        setVoiceStatus("Listening. Please speak now.");
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();

      recognitionRef.current = null;

      if (mountedRef.current) {
        callback(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Voice login error:", event.error);

      if (!mountedRef.current) return;

      if (event.error === "not-allowed") {
        setVoiceStatus("Microphone permission denied.");
        setVoiceLoginActive(false);

        speakInstruction(
          "Please allow microphone permission in your browser."
        );
      } else if (event.error === "no-speech") {
        setVoiceStatus("No speech detected. Please try again.");

        speakInstruction(
          "I did not hear anything. Please start voice login again."
        );

        setVoiceLoginActive(false);
      } else {
        setVoiceStatus("Unable to recognize speech.");
        setVoiceLoginActive(false);
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
    };

    try {
      recognition.start();
    } catch (err) {
      console.error(err);
      setVoiceStatus("Unable to start microphone.");
      setVoiceLoginActive(false);
    }
  };

  // START VOICE LOGIN
  const startVoiceLogin = () => {
    if (loading || voiceLoginActive) return;

    setError("");
    setVoiceLoginActive(true);

    setFormData((previous) => ({
      ...previous,
      password: ""
    }));

    speakInstruction(
      "Welcome to AccessAble voice login. " +
      "Please speak your registered email address. " +
      "For example, say shana at gmail dot com.",
      () => {
        listenToUser(processVoiceEmail);
      }
    );
  };

  // PROCESS EMAIL
  const processVoiceEmail = (spokenEmail) => {
    const email = convertSpokenEmail(spokenEmail);
    const emailError = validateEmail(email);

    if (emailError) {
      setVoiceStatus(emailError);

      speakInstruction(
        "I could not recognize a valid email address. " +
        "Please try again.",
        () => listenToUser(processVoiceEmail)
      );

      return;
    }

    setFormData((previous) => ({
      ...previous,
      email,
      password: ""
    }));

    setFieldErrors((previous) => ({
      ...previous,
      email: ""
    }));

    setTouched((previous) => ({
      ...previous,
      email: true
    }));

    speakInstruction(
      "Your email address has been captured. " +
      "Spoken passwords are sensitive and may be processed by your browser's speech recognition service. " +
      "You can type your password instead. " +
      "Say Continue to speak your password or Cancel.",
      () => {
        listenToUser((choice) => {
          const command = choice.toLowerCase();

          if (command.includes("continue")) {
            captureVoicePassword(email);
          } else {
            cancelVoiceLogin();
          }
        });
      }
    );
  };

  // CAPTURE PASSWORD
  const captureVoicePassword = (email) => {
    speakInstruction(
      "Please speak your password. I will not repeat it aloud.",
      () => {
        listenToUser((spokenPassword) => {
          const password = spokenPassword.trim();

          if (!password) {
            speakInstruction(
              "No password was recognized. Please try again.",
              () => captureVoicePassword(email)
            );

            return;
          }

          setFormData((previous) => ({
            ...previous,
            email,
            password
          }));

          setFieldErrors((previous) => ({
            ...previous,
            password: validatePassword(password)
          }));

          setTouched((previous) => ({
            ...previous,
            password: true
          }));

          speakInstruction(
            "Password captured. I will not read it aloud. " +
            "Say Confirm Login to continue, Change Password to try again, or Cancel.",
            () => {
              listenToUser((command) => {
                const choice = command.toLowerCase();

                if (choice.includes("confirm")) {
                  confirmVoiceLogin(email, password);
                } else if (choice.includes("change")) {
                  captureVoicePassword(email);
                } else {
                  cancelVoiceLogin();
                }
              });
            }
          );
        });
      }
    );
  };

  // CONFIRM LOGIN
  const confirmVoiceLogin = async (email, password) => {
    if (!validateForm(email, password)) {
      setVoiceLoginActive(false);
      setVoiceStatus("Please correct your login details.");

      setFormData((previous) => ({
        ...previous,
        password: ""
      }));

      speakInstruction(
        "Your login details do not meet the required format. Please use keyboard login."
      );

      return;
    }

    setVoiceLoginActive(false);
    setVoiceStatus("Submitting login details.");

    await submitLogin(email, password);
  };

  return (
    <div className="login-page">

      <div className="login-left">

        <Link to="/" className="login-logo">
          <span className="logo-icon">
    <Accessibility size={25} strokeWidth={2.5} />
</span>
<span className="logo-text">
    access<span>able</span>
</span>
        </Link>

        <div className="login-content">

          <span className="login-tag">
            ✦ Welcome back
          </span>

          <h1>
            Your journey
            <br />
            towards <span>accessibility</span>
            <br />
            continues here.
          </h1>

          <p>
            Sign in to access your personalized learning
            experience, assistive tools and inclusive
            digital environment.
          </p>

          <div className="login-feature-card">

            <div className="feature-icon">✧</div>

            <div>
              <h3>Technology with a human purpose.</h3>
              <p>
                Making digital experiences accessible for everyone.
              </p>
            </div>

          </div>

        </div>

        <div className="login-footer">
          Designed around people. Built for everyone.
        </div>

      </div>

      <div className="login-right">

        <div className="login-form-container">

          <div className="mobile-logo">
            <Link to="/" className="login-logo">
              <span className="logo-icon">♿</span>
              accessable
            </Link>
          </div>

          <div className="form-heading">

            <span>WELCOME BACK</span>

            <h2>Sign in to AccessAble</h2>

            <p>
              Enter your credentials to continue.
            </p>

          </div>

          {/* VOICE LOGIN */}
          <button
            type="button"
            className="voice-login-button"
            onClick={startVoiceLogin}
            disabled={loading || voiceLoginActive}
          >
            <Mic size={19} />
            Start Voice Login
          </button>

          {voiceLoginActive && (
            <button
              type="button"
              className="voice-login-cancel"
              onClick={cancelVoiceLogin}
            >
              <MicOff size={17} />
              Cancel Voice Login
            </button>
          )}

          {voiceStatus && (
            <div
              className="voice-login-status"
              role="status"
              aria-live="polite"
            >
              {voiceStatus}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* EMAIL */}
            <div className="form-group">

              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="email"
                required
                aria-required="true"
                aria-invalid={Boolean(touched.email && fieldErrors.email)}
                aria-describedby={
                  touched.email && fieldErrors.email
                    ? "email-error"
                    : undefined
                }
              />

              {touched.email && fieldErrors.email && (
                <span
                  className="login-field-error"
                  id="email-error"
                  role="alert"
                >
                  {fieldErrors.email}
                </span>
              )}

            </div>

            {/* PASSWORD */}
            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="password-wrapper">

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="current-password"
                  required
                  aria-required="true"
                  aria-invalid={Boolean(touched.password && fieldErrors.password)}
                  aria-describedby={
                    touched.password && fieldErrors.password
                      ? "password-error"
                      : undefined
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

              {touched.password && fieldErrors.password && (
                <span
                  className="login-field-error"
                  id="password-error"
                  role="alert"
                >
                  {fieldErrors.password}
                </span>
              )}

            </div>

            {/* REMEMBER ME */}
            <div className="login-options">

              <label className="remember-label">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />

                Remember me

              </label>

              <Link to="/forgot-password" className="forgot-password">
    Forgot password?
</Link>

            </div>

            {/* ERROR */}
            {error && (
              <div
                className="login-error"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>

          </form>

          <div className="login-divider">
            <span>NEW TO ACCESSABLE?</span>
          </div>

          <p className="register-text">
            Don't have an account?
            <Link to="/register"> Create an account</Link>
          </p>

          <div className="login-bottom-note">
            Your accessibility journey starts here.
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;