import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  UserIcon,
  BellIcon,
  MoonIcon,
  ShieldCheckIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    desktop: true,
    taskReminders: true,
    projectUpdates: false,
  });

  const [theme, setTheme] = useState('light');

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const SettingsSection = ({ title, children }) => (
    <div className="card mb-6">
      <h2 className="text-lg font-medium mb-4">{title}</h2>
      {children}
    </div>
  );

  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      type="button"
      className={`${
        enabled ? 'bg-primary' : 'bg-light-gray'
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
      onClick={onChange}
    >
      <span
        className={`${
          enabled ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </button>
  );

  return (
    <div>
      <h1 className="mb-8">Settings</h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl"
      >
        <SettingsSection title="Profile">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <UserIcon className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{currentUser?.email}</h3>
              <p className="text-sm text-dark-gray/70">Free Plan</p>
            </div>
          </div>
          <button className="btn-secondary">Edit Profile</button>
        </SettingsSection>

        <SettingsSection title="Notifications">
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BellIcon className="w-5 h-5 text-dark-gray/70" />
                  <span className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <ToggleSwitch
                  enabled={value}
                  onChange={() => handleNotificationChange(key)}
                />
              </div>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection title="Appearance">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MoonIcon className="w-5 h-5 text-dark-gray/70" />
                <span>Theme</span>
              </div>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="input-field"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="Security">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="w-5 h-5 text-dark-gray/70" />
                <span>Change Password</span>
              </div>
              <button className="btn-secondary">Update</button>
            </div>
          </div>
        </SettingsSection>
      </motion.div>
    </div>
  );
};

export default Settings;
