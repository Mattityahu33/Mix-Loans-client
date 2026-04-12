import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings as fetchSettings, updateSettings as putSettings } from '../services/settingsService';

const SettingsContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchSettings();
        setSettings(data);
        applySettingsToDOM(data);
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const applySettingsToDOM = (data) => {
    if (data.theme) {
      if (data.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const updated = await putSettings(newSettings);
      setSettings(updated);
      applySettingsToDOM(updated);
      return updated;
    } catch (err) {
      console.error("Failed to update settings:", err);
      throw err;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
