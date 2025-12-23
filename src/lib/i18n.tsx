import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'es' | 'en';

interface Translations {
  app: {
    title: string;
  };
  login: {
    title: string;
    subtitle: string;
    tagline: string;
    username: string;
    password: string;
    usernamePlaceholder: string;
    passwordPlaceholder: string;
    loginButton: string;
    errors: {
      emptyFields: string;
      loginFailed: string;
      sessionExpired: string;
      invalidCredentials: string;
      authError: string;
    };
  };
  dashboard: {
    tabs: {
      students: string;
      classes: string;
      schedule: string;
      timetable: string;
      settings: string;
      schools: string;
    };
    logout: string;
    selectSchool: string;
    selectClass: string;
    refresh: string;
    weeklyTimetable: string;
    addNewItem: string;
    students: {
      title: string;
      addNew: string;
      search: string;
      active: string;
      grade: string;
    };
    classes: {
      noClasses: string;
    };
    schools: {
      title: string;
      subtitle: string;
      addNew: string;
      list: string;
      name: string;
      town: string;
      phone: string;
      namePlaceholder: string;
      townPlaceholder: string;
      phonePlaceholder: string;
      formDescription: string;
      submit: string;
      cancel: string;
      noSchools: string;
      addFirstSchool: string;
      createSuccess: string;
      createError: string;
      validation: {
        nameRequired: string;
        nameMinLength: string;
        phoneInvalid: string;
      };
    };
    loadingData: string;
    errors: {
      noSchools: string;
      loadSchoolsError: string;
      fetchError: string;
      generalError: string;
    };
  };
  loading: {
    title: string;
    subtitle: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    language: {
      es: string;
      en: string;
    };
    tooltip: {
      switchToEnglish: string;
      switchToSpanish: string;
    };
  };
}

const translations: Record<Locale, Translations> = {
  es: {
    app: {
      title: 'Teacher Notebook'
    },
    login: {
      title: 'Teacher Notebook',
      subtitle: 'Tu espacio educativo digital',
      tagline: 'Gestión académica profesional',
      username: 'Usuario',
      password: 'Contraseña',
      usernamePlaceholder: 'tu_usuario',
      passwordPlaceholder: '••••••••',
      loginButton: 'Acceder al Aula',
      errors: {
        emptyFields: 'Por favor completa todos los campos.',
        loginFailed: 'Error en el login.',
        sessionExpired: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        invalidCredentials: 'Verifica tus credenciales.',
        authError: 'Se ha producido un error al autenticar'
      }
    },
    dashboard: {
      tabs: {
        students: 'Estudiantes',
        classes: 'Clases',
        schedule: 'Calendario',
        timetable: 'Horario',
        settings: 'Configuración',
        schools: 'Colegios'
      },
      logout: 'Cerrar Sesión',
      selectSchool: 'Selecciona un colegio',
      selectClass: 'Selecciona una clase',
      refresh: 'Actualizar',
      weeklyTimetable: 'Horario Semanal',
      addNewItem: 'Añadir Nuevo Elemento',
      students: {
        title: 'Estudiantes',
        addNew: 'Añadir Nuevo',
        search: 'Buscar estudiantes...',
        active: 'Activo',
        grade: 'Grado'
      },
      classes: {
        noClasses: 'No hay clases programadas'
      },
      schools: {
        title: 'Gestión de Colegios',
        subtitle: 'Administra tus colegios y visualiza información clave',
        addNew: 'Crear Nuevo Colegio',
        list: 'Lista de Colegios',
        name: 'Nombre',
        town: 'Localidad',
        phone: 'Teléfono',
        namePlaceholder: 'Nombre del colegio',
        townPlaceholder: 'Localidad (opcional)',
        phonePlaceholder: '123456789',
        formDescription: 'Completa el formulario para crear un nuevo colegio. Los campos marcados con * son obligatorios.',
        submit: 'Crear Colegio',
        cancel: 'Cancelar',
        noSchools: 'No hay colegios registrados',
        addFirstSchool: 'Haz clic en "Crear Nuevo Colegio" para empezar',
        createSuccess: 'Colegio creado exitosamente',
        createError: 'Error al crear el colegio',
        validation: {
          nameRequired: 'El nombre es obligatorio',
          nameMinLength: 'El nombre debe tener al menos 5 caracteres',
          phoneInvalid: 'El teléfono debe tener exactamente 9 dígitos'
        }
      },
      loadingData: 'Cargando datos...',
      errors: {
        noSchools: 'No se encontraron colegios.',
        loadSchoolsError: 'Error al cargar los colegios. Por favor, inténtalo de nuevo.',
        fetchError: 'No se pudieron obtener los datos de los colegios.',
        generalError: 'Se ha producido un error al obtener los datos de los colegios.'
      }
    },
    loading: {
      title: 'Cargando...',
      subtitle: 'Por favor, espera un momento'
    },
    common: {
      loading: 'Cargando',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      close: 'Cerrar',
      language: {
        es: 'ES',
        en: 'EN'
      },
      tooltip: {
        switchToEnglish: 'Cambiar a Inglés',
        switchToSpanish: 'Cambiar a Español'
      }
    }
  },
  en: {
    app: {
      title: 'Teacher Notebook'
    },
    login: {
      title: 'Teacher Notebook',
      subtitle: 'Your digital educational space',
      tagline: 'Professional academic management',
      username: 'Username',
      password: 'Password',
      usernamePlaceholder: 'your_username',
      passwordPlaceholder: '••••••••',
      loginButton: 'Access Classroom',
      errors: {
        emptyFields: 'Please fill in all fields.',
        loginFailed: 'Login error.',
        sessionExpired: 'Your session has expired. Please log in again.',
        invalidCredentials: 'Check your credentials.',
        authError: 'An authentication error has occurred'
      }
    },
    dashboard: {
      tabs: {
        students: 'Students',
        classes: 'Classes',
        schedule: 'Schedule',
        timetable: 'Timetable',
        settings: 'Settings',
        schools: 'Schools'
      },
      logout: 'Log Out',
      selectSchool: 'Select a school',
      selectClass: 'Select a class',
      refresh: 'Refresh',
      weeklyTimetable: 'Weekly Timetable',
      addNewItem: 'Add New Item',
      students: {
        title: 'Students',
        addNew: 'Add New',
        search: 'Search students...',
        active: 'Active',
        grade: 'Grade'
      },
      classes: {
        noClasses: 'No classes scheduled'
      },
      schools: {
        title: 'School Management',
        subtitle: 'Manage your schools and view key information',
        addNew: 'Create New School',
        list: 'School List',
        name: 'Name',
        town: 'Town',
        phone: 'Phone',
        namePlaceholder: 'School name',
        townPlaceholder: 'Town (optional)',
        phonePlaceholder: '123456789',
        formDescription: 'Complete the form to create a new school. Fields marked with * are required.',
        submit: 'Create School',
        cancel: 'Cancel',
        noSchools: 'No schools registered',
        addFirstSchool: 'Click "Create New School" to get started',
        createSuccess: 'School created successfully',
        createError: 'Error creating school',
        validation: {
          nameRequired: 'Name is required',
          nameMinLength: 'Name must be at least 5 characters',
          phoneInvalid: 'Phone must be exactly 9 digits'
        }
      },
      loadingData: 'Loading data...',
      errors: {
        noSchools: 'No schools found.',
        loadSchoolsError: 'Error loading schools. Please try again.',
        fetchError: 'Could not retrieve school data.',
        generalError: 'An error occurred while retrieving school data.'
      }
    },
    loading: {
      title: 'Loading...',
      subtitle: 'Please wait a moment'
    },
    common: {
      loading: 'Loading',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      language: {
        es: 'SP',
        en: 'EN'
      },
      tooltip: {
        switchToEnglish: 'Switch to English',
        switchToSpanish: 'Switch to Spanish'
      }
    }
  }
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'teacher_notebook_locale';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === 'es' || stored === 'en') ? stored : 'es';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[locale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

// Función para obtener el locale actual desde servicios (sin hooks)
export function getCurrentLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  return (stored === 'es' || stored === 'en') ? stored : 'es';
}
