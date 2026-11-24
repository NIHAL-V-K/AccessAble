import {
  X,
  Type,
  Contrast,
  BookOpen,
  AlignLeft,
  RotateCcw,
  Volume2,
  Check
} from "lucide-react";

import "./AccessibilitySettings.css";

function AccessibilitySettings({
  settings,
  onChange,
  onClose
}) {
  const updateSetting = (key, value) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  const resetSettings = () => {
    onChange({
      fontSize: "medium",
      highContrast: false,
      dyslexiaFont: false,
      textSpacing: false,
      readAloud: true
    });
  };

  return (
    <div className="accessibility-overlay" onClick={onClose}>
      <div
        className="accessibility-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="accessibility-header">
          <div className="accessibility-title">
            <div className="accessibility-icon">
              <BookOpen size={22} />
            </div>

            <div>
              <h2>Accessibility Settings</h2>
              <p>Make your learning experience comfortable.</p>
            </div>
          </div>

          <button
            className="accessibility-close"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={21} />
          </button>
        </div>

        <div className="accessibility-content">

          {/* Font Size */}
          <div className="accessibility-option">
            <div className="option-heading">
              <div className="option-icon">
                <Type size={20} />
              </div>

              <div>
                <h3>Font Size</h3>
                <p>Adjust the text size for better readability.</p>
              </div>
            </div>

            <div className="font-size-options">
              {["small", "medium", "large"].map((size) => (
                <button
                  key={size}
                  className={`font-size-button ${
                    settings.fontSize === size ? "selected" : ""
                  }`}
                  onClick={() => updateSetting("fontSize", size)}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}

                  {settings.fontSize === size && (
                    <Check size={15} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast */}
          <div className="accessibility-option">
            <div className="option-heading">
              <div className="option-icon">
                <Contrast size={20} />
              </div>

              <div>
                <h3>High Contrast Mode</h3>
                <p>Increase contrast between text and background.</p>
              </div>
            </div>

            <label className="accessibility-switch">
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) =>
                  updateSetting("highContrast", e.target.checked)
                }
              />
              <span className="switch-slider"></span>
            </label>
          </div>

          {/* Dyslexia Friendly Font */}
          <div className="accessibility-option">
            <div className="option-heading">
              <div className="option-icon">
                <BookOpen size={20} />
              </div>

              <div>
                <h3>Dyslexia-Friendly Font</h3>
                <p>Use an alternative font for easier reading.</p>
              </div>
            </div>

            <label className="accessibility-switch">
              <input
                type="checkbox"
                checked={settings.dyslexiaFont}
                onChange={(e) =>
                  updateSetting("dyslexiaFont", e.target.checked)
                }
              />
              <span className="switch-slider"></span>
            </label>
          </div>

          {/* Text Spacing */}
          <div className="accessibility-option">
            <div className="option-heading">
              <div className="option-icon">
                <AlignLeft size={20} />
              </div>

              <div>
                <h3>Increased Text Spacing</h3>
                <p>Add more space between letters and lines.</p>
              </div>
            </div>

            <label className="accessibility-switch">
              <input
                type="checkbox"
                checked={settings.textSpacing}
                onChange={(e) =>
                  updateSetting("textSpacing", e.target.checked)
                }
              />
              <span className="switch-slider"></span>
            </label>
          </div>

          {/* Read Aloud */}
          <div className="accessibility-option">
            <div className="option-heading">
              <div className="option-icon">
                <Volume2 size={20} />
              </div>

              <div>
                <h3>Read Aloud Support</h3>
                <p>Enable text-to-speech controls for messages.</p>
              </div>
            </div>

            <label className="accessibility-switch">
              <input
                type="checkbox"
                checked={settings.readAloud}
                onChange={(e) =>
                  updateSetting("readAloud", e.target.checked)
                }
              />
              <span className="switch-slider"></span>
            </label>
          </div>

        </div>

        <div className="accessibility-footer">
          <button
            className="reset-accessibility"
            onClick={resetSettings}
          >
            <RotateCcw size={16} />
            Reset to Default
          </button>

          <button
            className="save-accessibility"
            onClick={onClose}
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}

export default AccessibilitySettings;