export const API_CONFIG = {
  local: 'http://localhost:8081',
  pre: 'https://codefm.synology.me:5553',
  pro: 'https://codefm.synology.me:4443'
};

/** Keycloak account portal URLs used by the "recover access" login link */
export const RECOVER_ACCESS_CONFIG = {
  local: 'http://codefm.synology.me:8480/realms/codefm-pre/account/#/',
  pre: 'http://codefm.synology.me:8480/realms/codefm-pre/account/#/',
  pro: 'http://codefm.synology.me:8480/realms/codefm/account/#/'
};

export const getApiUrl = () => {
  const env = import.meta.env.VITE_ENV || 'pre';
  return API_CONFIG[env as keyof typeof API_CONFIG];
};

/** Returns the Keycloak account portal URL for the current environment. */
export const getRecoverAccessUrl = () => {
  const env = import.meta.env.VITE_ENV || 'pre';
  return RECOVER_ACCESS_CONFIG[env as keyof typeof RECOVER_ACCESS_CONFIG];
};
