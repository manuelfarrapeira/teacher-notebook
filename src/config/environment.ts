export const API_CONFIG = {
  pre: 'https://codefm.synology.me:5553',
  pro: 'https://codefm.synology.me:4443'
};

export const getApiUrl = () => {
  const env = import.meta.env.VITE_ENV || 'pre';
  return API_CONFIG[env as keyof typeof API_CONFIG];
};
