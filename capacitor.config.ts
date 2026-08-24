import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.parttimeearnings.app',
  appName: 'Part Time Earnings',
  webDir: 'mobile',
  server: {
    url: 'https://part-time-earnings.onrender.com/tracker',
    cleartext: false,
    allowNavigation: ['part-time-earnings.onrender.com'],
  },
  android: {
    backgroundColor: '#031b12',
  },
  ios: {
    backgroundColor: '#031b12',
    contentInset: 'automatic',
  },
};

export default config;
