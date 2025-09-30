import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      profile: {
        title: 'Profile',
        subtitle: 'Manage your account and preferences',
        settings: 'Profile Settings',
        language: 'Language',
        appLanguage: 'App language',
        purchases: 'Purchases & Subscription',
        notifications: 'Notifications',
        legal: 'Legal & Support',
        account: 'Account & Data',
        signOut: 'Sign Out',
      },
    },
  },
  es: {
    translation: {
      profile: {
        title: 'Perfil',
        subtitle: 'Administra tu cuenta y preferencias',
        settings: 'Configuración del perfil',
        language: 'Idioma',
        appLanguage: 'Idioma de la app',
        purchases: 'Compras y suscripción',
        notifications: 'Notificaciones',
        legal: 'Legal y soporte',
        account: 'Cuenta y datos',
        signOut: 'Cerrar sesión',
      },
    },
  },
  fr: {
    translation: {
      profile: {
        title: 'Profil',
        subtitle: 'Gérez votre compte et vos préférences',
        settings: 'Paramètres du profil',
        language: 'Langue',
        appLanguage: "Langue de l'application",
        purchases: 'Achats et abonnement',
        notifications: 'Notifications',
        legal: 'Mentions légales et support',
        account: 'Compte et données',
        signOut: 'Se déconnecter',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
