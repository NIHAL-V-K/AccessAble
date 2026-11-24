import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom";
// Existing Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

// Accessibility Modules
import AIAssistant from "./pages/AIAssistant";
import TextToSpeech from "./pages/TextToSpeech";
import HapticLearning from "./pages/HapticLearning";
import DocumentReader from "./pages/DocumentReader";

// Voice Navigation
import VoiceNavigation from "./components/VoiceNavigation";

// NEW: Password Recovery Pages
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* NEW: Password Recovery */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      

        {/* Student Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Accessibility Modules */}
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/text-to-speech" element={<TextToSpeech />} />
        <Route path="/haptic-learning" element={<HapticLearning />} />
        <Route path="/document-reader" element={<DocumentReader />} />

      </Routes>

      {/* Available across all pages */}
      <VoiceNavigation />

    </BrowserRouter>
  );
}

export default App;