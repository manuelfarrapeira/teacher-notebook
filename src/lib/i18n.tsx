import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

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
    classes: {
      noClasses: string;
      loadError: string;
      schoolYear: string;
      addClass: string;
      edit: string;
      delete: string;
      createTitle: string;
      editTitle: string;
      name: string;
      namePlaceholder: string;
      schoolYearPlaceholder: string;
      create: string;
      update: string;
      createSuccess: string;
      updateSuccess: string;
      deleteSuccess: string;
      createError: string;
      updateError: string;
      deleteError: string;
      deleteTitle: string;
      deleteConfirm: string;
      noClassesInSchool: string;
      validation: {
        nameRequired: string;
        nameMinLength: string;
        schoolYearRequired: string;
        schoolYearInvalid: string;
        schoolYearNotConsecutive: string;
        schoolRequired: string;
      };
    };
    schools: {
      title: string;
      subtitle: string;
      addNew: string;
      edit: string;
      editTitle: string;
      list: string;
      name: string;
      town: string;
      phone: string;
      namePlaceholder: string;
      townPlaceholder: string;
      phonePlaceholder: string;
      formDescription: string;
      submit: string;
      update: string;
      cancel: string;
      noSchools: string;
      addFirstSchool: string;
      createSuccess: string;
      updateSuccess: string;
      createError: string;
      updateError: string;
      validation: {
        nameRequired: string;
        nameMinLength: string;
        phoneInvalid: string;
      };
      delete: string;
      deleteTitle: string;
      deleteConfirm: string;
      deleteConfirmBtn: string;
      deleteError: string;
    };
    loadingData: string;
    errors: {
      noSchools: string;
      loadSchoolsError: string;
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
        students: 'Alumnos',
        classes: 'Clases',
        schedule: 'Calendario',
        timetable: 'Horario',
        settings: 'Configuración',
        schools: 'Colegios'
      },
      logout: 'Cerrar Sesión',
      classes: {
        noClasses: 'No hay clases disponibles',
        loadError: 'Error al cargar las clases',
        schoolYear: 'Año escolar',
        addClass: 'Añadir Clase',
        edit: 'Editar',
        delete: 'Eliminar',
        createTitle: 'Crear Clase',
        editTitle: 'Editar Clase',
        name: 'Nombre',
        namePlaceholder: 'Ej: 1º ESO A',
        schoolYearPlaceholder: 'Ej: 24/25',
        create: 'Crear',
        update: 'Actualizar',
        createSuccess: 'Clase creada correctamente',
        updateSuccess: 'Clase actualizada correctamente',
        deleteSuccess: 'Clase eliminada correctamente',
        createError: 'Error al crear la clase',
        updateError: 'Error al actualizar la clase',
        deleteError: 'Error al eliminar la clase',
        deleteTitle: 'Eliminar clase',
        deleteConfirm: '¿Está seguro que desea eliminar la clase "{name}"? Esta acción no se puede deshacer.',
        noClassesInSchool: 'Este colegio no tiene clases todavía. Haz clic en "Añadir Clase" para crear una.',
        validation: {
          nameRequired: 'El nombre es obligatorio',
          nameMinLength: 'El nombre debe tener al menos 3 caracteres',
          schoolYearRequired: 'El año escolar es obligatorio',
          schoolYearInvalid: 'El formato debe ser NN/NN (ej: 24/25)',
          schoolYearNotConsecutive: 'Los números del año escolar deben ser consecutivos (ej: 24/25)',
          schoolRequired: 'Debe seleccionar un colegio',
        },
      },
      schools: {
        title: 'Gestión de Colegios',
        subtitle: 'Administra tus colegios y visualiza información clave',
        addNew: 'Crear Colegio',
        edit: 'Editar',
        editTitle: 'Editar Colegio',
        list: 'Lista de Colegios',
        name: 'Nombre',
        town: 'Localidad',
        phone: 'Teléfono',
        namePlaceholder: 'Nombre del colegio',
        townPlaceholder: 'Localidad (opcional)',
        phonePlaceholder: '123456789',
        formDescription: 'Completa el formulario para crear un nuevo colegio. Los campos marcados con * son obligatorios.',
        submit: 'Crear Colegio',
        update: 'Actualizar Colegio',
        cancel: 'Cancelar',
        noSchools: 'No hay colegios registrados',
        addFirstSchool: 'Haz clic en "Crear Nuevo Colegio" para empezar',
        createSuccess: 'Colegio creado exitosamente',
        updateSuccess: 'Colegio actualizado exitosamente',
        createError: 'Error al crear el colegio',
        updateError: 'Error al actualizar el colegio',
        validation: {
          nameRequired: 'El nombre es obligatorio',
          nameMinLength: 'El nombre debe tener al menos 5 caracteres',
          phoneInvalid: 'El teléfono debe tener exactamente 9 dígitos'
        },
        delete: 'Eliminar',
        deleteTitle: 'Eliminar colegio',
        deleteConfirm: '¿Está seguro que quiere dar de baja el colegio "{name}"? Esta acción no se puede deshacer.',
        deleteConfirmBtn: 'Sí, eliminar',
        deleteError: 'Error al eliminar el colegio',
      },
      loadingData: 'Cargando datos...',
      errors: {
        noSchools: 'No se encontraron colegios.',
        loadSchoolsError: 'Error al cargar los colegios. Por favor, inténtalo de nuevo.'
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
        es: 'ESPAÑOL',
        en: 'INGLÉS'
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
      classes: {
        noClasses: 'No classes available',
        loadError: 'Error loading classes',
        schoolYear: 'School year',
        addClass: 'Add Class',
        edit: 'Edit',
        delete: 'Delete',
        createTitle: 'Create Class',
        editTitle: 'Edit Class',
        name: 'Name',
        namePlaceholder: 'E.g: 1st Grade A',
        schoolYearPlaceholder: 'E.g: 24/25',
        create: 'Create',
        update: 'Update',
        createSuccess: 'Class created successfully',
        updateSuccess: 'Class updated successfully',
        deleteSuccess: 'Class deleted successfully',
        createError: 'Error creating class',
        updateError: 'Error updating class',
        deleteError: 'Error deleting class',
        deleteTitle: 'Delete class',
        deleteConfirm: 'Are you sure you want to delete the class "{name}"? This action cannot be undone.',
        noClassesInSchool: 'This school has no classes yet. Click "Add Class" to create one.',
        validation: {
          nameRequired: 'Name is required',
          nameMinLength: 'Name must be at least 3 characters',
          schoolYearRequired: 'School year is required',
          schoolYearInvalid: 'Format must be NN/NN (e.g: 24/25)',
          schoolYearNotConsecutive: 'School year numbers must be consecutive (e.g: 24/25)',
          schoolRequired: 'A school must be selected',
        },
      },
      schools: {
        title: 'School Management',
        subtitle: 'Manage your schools and view key information',
        addNew: 'Create School',
        edit: 'Edit',
        editTitle: 'Edit School',
        list: 'School List',
        name: 'Name',
        town: 'Town',
        phone: 'Phone',
        namePlaceholder: 'School name',
        townPlaceholder: 'Town (optional)',
        phonePlaceholder: '123456789',
        formDescription: 'Complete the form to create a new school. Fields marked with * are required.',
        submit: 'Create School',
        update: 'Update School',
        cancel: 'Cancel',
        noSchools: 'No schools registered',
        addFirstSchool: 'Click "Create New School" to get started',
        createSuccess: 'School created successfully',
        updateSuccess: 'School updated successfully',
        createError: 'Error creating school',
        updateError: 'Error updating school',
        validation: {
          nameRequired: 'Name is required',
          nameMinLength: 'Name must be at least 5 characters',
          phoneInvalid: 'Phone must be exactly 9 digits'
        },
        delete: 'Delete',
        deleteTitle: 'Delete school',
        deleteConfirm: 'Are you sure you want to delete the school "{name}"? This action cannot be undone.',
        deleteConfirmBtn: 'Yes, delete',
        deleteError: 'Error deleting school',
      },
      loadingData: 'Loading data...',
      errors: {
        noSchools: 'No schools found.',
        loadSchoolsError: 'Error loading schools. Please try again.'
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
        es: 'SPANISH',
        en: 'ENGLISH'
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

export function I18nProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [locale, setLocale] = useState<Locale>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === 'es' || stored === 'en') ? stored : 'es';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const t = (key: string): string => {
    const keys = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const contextValue = useMemo(() => ({ locale, setLocale, t }), [locale]);

  return (
    <I18nContext.Provider value={contextValue}>
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
