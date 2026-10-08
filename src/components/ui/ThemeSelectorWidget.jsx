import { useState, useEffect } from 'react';
import { CATEGORY_PALETTES, GLOBAL_THEME_PRESETS, applyCustomHexTheme } from '../../utils/categoryColors';

export default function ThemeSelectorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('eventpro_theme') || 'auto';
  });
  const [customColor, setCustomColor] = useState(() => {
    return localStorage.getItem('eventpro_custom_color') || '#ec4899';
  });
  const [autoCycle, setAutoCycle] = useState(false);
  const [sampleIndex, setSampleIndex] = useState(0);

  const categoriesList = Object.values(CATEGORY_PALETTES);

  useEffect(() => {
    localStorage.setItem('eventpro_theme', activeTheme);
    document.body.setAttribute('data-theme-mode', activeTheme);
    if (activeTheme === 'custom') {
      applyCustomHexTheme(customColor);
    } else {
      document.body.style.backgroundImage = '';
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--primary-hover');
      document.documentElement.style.removeProperty('--primary-muted');
      document.documentElement.style.removeProperty('--grad-primary');
    }
  }, [activeTheme, customColor]);

  const handleCustomColorChange = (e) => {
    const val = e.target.value;
    setCustomColor(val);
    localStorage.setItem('eventpro_custom_color', val);
    setActiveTheme('custom');
  };

  // Handle auto-cycling preview mode if enabled
  useEffect(() => {
    if (!autoCycle) return;
    const interval = setInterval(() => {
      setSampleIndex(prev => (prev + 1) % categoriesList.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [autoCycle, categoriesList.length]);

  const currentSample = categoriesList[sampleIndex];

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-sm font-black uppercase"
        title="UI Theme & Auto-Color Settings"
        style={{
          background: 'var(--surface-hover)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)'
        }}
      >
        <span className="text-xs" style={{ display: 'none', mdDisplay: 'inline' }}>
          {activeTheme === 'auto' ? 'Auto-Colors' : 'Theme'}
        </span>
        <span
          style={{
            width: 10, height: 10, borderRadius: '50%',
            background: activeTheme === 'custom' ? customColor : activeTheme === 'auto' ? currentSample.primary : GLOBAL_THEME_PRESETS.find(p => p.id === activeTheme)?.primary || '#ea580c',
            boxShadow: 'none'
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 300,
            maxHeight: '80vh',
            overflowY: 'auto',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
            padding: 16,
            zIndex: 1000,
          }}
        >
          <div className="flex justify-between items-center mb-xs">
            <span className="text-xs font-black uppercase" style={{ color: 'var(--text)' }}>
              Pick Any UI Theme & Background Color
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-faint)', padding: '2px 6px' }}
            >
              Close
            </button>
          </div>

          <p className="text-xs mb-md" style={{ color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Choose preset theme background gradients or pick your own custom background accent color!
          </p>

          {/* Custom Color Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              borderRadius: 'var(--radius)',
              background: 'var(--bg-subtle)',
              border: activeTheme === 'custom' ? `1.5px solid ${customColor}` : '1px solid var(--border)',
              marginBottom: 12
            }}
          >
            <span className="text-xs font-bold flex items-center gap-xs">
              <span>Pick Any Color:</span>
            </span>
            <input
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              style={{
                width: 32, height: 28, border: 'none', background: 'none', cursor: 'pointer'
              }}
              title="Click to choose any color"
            />
          </div>

          {/* Theme Preset Selector */}
          <div className="flex flex-col gap-xs mb-md" style={{ maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
            {GLOBAL_THEME_PRESETS.filter(p => p.id !== 'custom').map(preset => (
              <button
                key={preset.id}
                onClick={() => setActiveTheme(preset.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius)',
                  border: activeTheme === preset.id ? `1.5px solid ${preset.primary}` : '1px solid var(--border)',
                  background: activeTheme === preset.id ? 'var(--bg-subtle)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span className="text-xs font-bold">{preset.label}</span>
                <span
                  style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: preset.primary
                  }}
                />
              </button>
            ))}
          </div>

          {/* Category Color Live Demo */}
          <div
            style={{
              background: currentSample.bgLight,
              border: `1px solid ${currentSample.border}`,
              borderRadius: 'var(--radius)',
              padding: 10,
              transition: 'all 0.4s ease'
            }}
          >
            <div className="flex justify-between items-center mb-xs">
              <span className="text-xs font-black" style={{ color: currentSample.badgeText }}>
                {currentSample.name} Palette
              </span>
              <button
                onClick={() => setAutoCycle(!autoCycle)}
                className="text-xs font-bold"
                style={{ color: currentSample.primary, cursor: 'pointer' }}
              >
                {autoCycle ? 'Pause' : 'Demo Cycle'}
              </button>
            </div>
            <div
              style={{
                height: 6,
                background: currentSample.gradient,
                borderRadius: 3,
                marginBottom: 6
              }}
            />
            <div className="flex gap-xs">
              <span className="badge" style={{ background: currentSample.badgeBg, color: currentSample.badgeText, borderColor: currentSample.border }}>
                {currentSample.tag}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
