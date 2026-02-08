"use client";

import { useState } from "react";
import { useTheme } from "@/components/admin/ThemeProvider";

// Mock settings data - in a real app, this would come from an API
interface SettingsGroup {
  id: string;
  name: string;
  description: string;
  settings: Setting[];
}

interface Setting {
  id: string;
  name: string;
  description: string;
  type: "toggle" | "text" | "select" | "number" | "color";
  value: string | boolean | number;
  options?: string[];
}

const mockSettings: SettingsGroup[] = [
  {
    id: "general",
    name: "General Settings",
    description: "Basic configuration for the resort system",
    settings: [
      {
        id: "resort_name",
        name: "Resort Name",
        description: "The name of the resort displayed throughout the system",
        type: "text",
        value: "Island Paradise Resort",
      },
      {
        id: "contact_email",
        name: "Contact Email",
        description: "Primary contact email for system notifications",
        type: "text",
        value: "admin@islandresort.com",
      },
      {
        id: "maintenance_mode",
        name: "Maintenance Mode",
        description:
          "Enable maintenance mode to temporarily disable public access",
        type: "toggle",
        value: false,
      },
    ],
  },
  {
    id: "booking",
    name: "Booking Settings",
    description: "Configure booking rules and policies",
    settings: [
      {
        id: "advance_booking_days",
        name: "Advance Booking Days",
        description:
          "Maximum number of days in advance that bookings can be made",
        type: "number",
        value: 180,
      },
      {
        id: "min_stay_nights",
        name: "Minimum Stay (Nights)",
        description: "Minimum number of nights required for hotel bookings",
        type: "number",
        value: 2,
      },
      {
        id: "cancellation_policy",
        name: "Cancellation Policy",
        description: "Default cancellation policy for bookings",
        type: "select",
        value: "flexible",
        options: ["flexible", "moderate", "strict"],
      },
    ],
  },
  {
    id: "notifications",
    name: "Notification Settings",
    description: "Configure system notifications and alerts",
    settings: [
      {
        id: "email_notifications",
        name: "Email Notifications",
        description: "Send email notifications for new bookings and updates",
        type: "toggle",
        value: true,
      },
      {
        id: "sms_notifications",
        name: "SMS Notifications",
        description: "Send SMS notifications for critical updates",
        type: "toggle",
        value: false,
      },
      {
        id: "notification_frequency",
        name: "Notification Frequency",
        description: "How often to send batch notifications",
        type: "select",
        value: "daily",
        options: ["realtime", "hourly", "daily", "weekly"],
      },
    ],
  },
  {
    id: "appearance",
    name: "Appearance Settings",
    description: "Customize the appearance of the public website",
    settings: [
      {
        id: "primary_color",
        name: "Primary Color",
        description: "Primary brand color used throughout the site",
        type: "color",
        value: "#3B82F6",
      },
      {
        id: "secondary_color",
        name: "Secondary Color",
        description: "Secondary brand color used for accents",
        type: "color",
        value: "#10B981",
      },
      {
        id: "show_testimonials",
        name: "Show Testimonials",
        description: "Display customer testimonials on the homepage",
        type: "toggle",
        value: true,
      },
    ],
  },
];

// Setting input component based on type
const SettingInput = ({
  setting,
  onChange,
}: {
  setting: Setting;
  onChange: (id: string, value: any) => void;
}) => {
  switch (setting.type) {
    case "toggle":
      return (
        <div className="flex items-center">
          <button
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(setting.value as boolean) ? "bg-blue-600" : "bg-gray-700"}`}
            onClick={() => onChange(setting.id, !(setting.value as boolean))}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(setting.value as boolean) ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
          <span className="ml-3 text-sm">
            {(setting.value as boolean) ? "Enabled" : "Disabled"}
          </span>
        </div>
      );
    case "text":
      return (
        <input
          type="text"
          className="w-full px-4 py-2 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={setting.value as string}
          onChange={(e) => onChange(setting.id, e.target.value)}
        />
      );
    case "number":
      return (
        <input
          type="number"
          className="w-full px-4 py-2 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={setting.value as number}
          onChange={(e) => onChange(setting.id, parseInt(e.target.value))}
        />
      );
    case "select":
      return (
        <select
          className="w-full px-4 py-2 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={setting.value as string}
          onChange={(e) => onChange(setting.id, e.target.value)}
        >
          {setting.options?.map((option) => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      );
    case "color":
      return (
        <div className="flex items-center space-x-2">
          <input
            type="color"
            className="h-10 w-10 rounded border border-gray-700 bg-transparent"
            value={setting.value as string}
            onChange={(e) => onChange(setting.id, e.target.value)}
          />
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={setting.value as string}
            onChange={(e) => onChange(setting.id, e.target.value)}
          />
        </div>
      );
    default:
      return null;
  }
};

// Settings group component
const SettingsGroupCard = ({
  group,
  onSettingChange,
}: {
  group: SettingsGroup;
  onSettingChange: (groupId: string, settingId: string, value: any) => void;
}) => {
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300 p-6 mb-8"
      style={{
        background: "var(--glass-background)",
        borderColor: "var(--glass-border)",
        boxShadow: "var(--glass-shadow)",
        backdropFilter: "blur(10px)",
      }}
    >
      <h2 className="text-xl font-bold mb-2">{group.name}</h2>
      <p className="text-gray-400 mb-6">{group.description}</p>

      <div className="space-y-6">
        {group.settings.map((setting) => (
          <div
            key={setting.id}
            className="border-t border-gray-700 border-opacity-50 pt-4"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0 md:pr-4 md:w-1/3">
                <h3 className="text-md font-medium">{setting.name}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {setting.description}
                </p>
              </div>
              <div className="md:w-2/3">
                <SettingInput
                  setting={setting}
                  onChange={(settingId, value) =>
                    onSettingChange(group.id, settingId, value)
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsGroup[]>(mockSettings);
  const [activeTab, setActiveTab] = useState<string>("general");

  // Handle setting change
  const handleSettingChange = (
    groupId: string,
    settingId: string,
    value: any,
  ) => {
    setSettings((prevSettings) => {
      return prevSettings.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            settings: group.settings.map((setting) => {
              if (setting.id === settingId) {
                return { ...setting, value };
              }
              return setting;
            }),
          };
        }
        return group;
      });
    });
  };

  // Handle save settings
  const handleSaveSettings = () => {
    // In a real app, this would send the settings to an API
    console.log("Saving settings:", settings);
    // Show success message
    alert("Settings saved successfully!");
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">System Settings</h1>
        <button
          onClick={handleSaveSettings}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Save Changes
        </button>
      </div>

      {/* Settings Tabs */}
      <div className="flex overflow-x-auto space-x-2 pb-2">
        {settings.map((group) => (
          <button
            key={group.id}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === group.id ? "bg-blue-600 text-white" : "bg-gray-800 bg-opacity-50 text-gray-300 hover:bg-gray-700"}`}
            onClick={() => setActiveTab(group.id)}
          >
            {group.name}
          </button>
        ))}
      </div>

      {/* Active Settings Group */}
      {settings.map((group) => (
        <div
          key={group.id}
          className={activeTab === group.id ? "block" : "hidden"}
        >
          <SettingsGroupCard
            group={group}
            onSettingChange={handleSettingChange}
          />
        </div>
      ))}
    </div>
  );
}
