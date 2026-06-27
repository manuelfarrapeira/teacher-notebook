import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

type Locale = 'es' | 'en' | 'ga';

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
      subjects: string;
      skills: string;
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
      searchPlaceholder: string;
      noSchoolsFound: string;
      showFilter: string;
      hideFilter: string;
      searchBy: string;
      filterBySchool: string;
      filterByClass: string;
      filterByTown: string;
      searchSchoolPlaceholder: string;
      searchClassPlaceholder: string;
      searchTownPlaceholder: string;
      clearFilter: string;
      clearAllFilters: string;
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
    subjects: {
      title: string;
      addNew: string;
      name: string;
      namePlaceholder: string;
      edit: string;
      delete: string;
      createTitle: string;
      editTitle: string;
      create: string;
      update: string;
      createSuccess: string;
      updateSuccess: string;
      deleteSuccess: string;
      createError: string;
      updateError: string;
      deleteError: string;
      loadError: string;
      noSubjects: string;
      deleteTitle: string;
      deleteConfirm: string;
      searchSubjects: string;
      noResults: string;
      gridView: string;
      listView: string;
      validation: {
        nameRequired: string;
        nameMinLength: string;
      };
    };
    skills: {
      title: string;
      addNew: string;
      titleLabel: string;
      titlePlaceholder: string;
      description: string;
      descriptionPlaceholder: string;
      edit: string;
      delete: string;
      createTitle: string;
      editTitle: string;
      create: string;
      update: string;
      createSuccess: string;
      updateSuccess: string;
      deleteSuccess: string;
      createError: string;
      updateError: string;
      deleteError: string;
      loadError: string;
      noSkills: string;
      deleteTitle: string;
      deleteConfirm: string;
      searchSkills: string;
      noResults: string;
      gridView: string;
      listView: string;
      validation: {
        titleRequired: string;
        titleMinLength: string;
        titleMaxLength: string;
        descriptionMaxLength: string;
      };
      rubrics: {
        modalTitle: string;
        manageRubrics: string;
        createRubric: string;
        editRubric: string;
        deleteRubric: string;
        rubricTitle: string;
        rubricTitlePlaceholder: string;
        noRubrics: string;
        criteria: string;
        addCriterion: string;
        editCriterion: string;
        deleteCriterion: string;
        criterionDescription: string;
        criterionDescriptionPlaceholder: string;
        gradeStart: string;
        gradeEnd: string;
        qualification: string;
        qualificationPlaceholder: string;
        noCriteria: string;
        deleteRubricTitle: string;
        deleteRubricConfirm: string;
        deleteCriterionTitle: string;
        deleteCriterionConfirm: string;
        createRubricSuccess: string;
        createRubricError: string;
        updateRubricSuccess: string;
        updateRubricError: string;
        deleteRubricSuccess: string;
        deleteRubricError: string;
        createCriterionSuccess: string;
        createCriterionError: string;
        updateCriterionSuccess: string;
        updateCriterionError: string;
        deleteCriterionSuccess: string;
        deleteCriterionError: string;
        loadError: string;
        validation: {
          titleRequired: string;
          titleMaxLength: string;
          descriptionRequired: string;
          descriptionMaxLength: string;
          gradeEndGreaterOrEqual: string;
          gradeOverlap: string;
        };
      };
    };
    classSubjects: {
      title: string;
      assignedSubjects: string;
      availableSubjects: string;
      assignSelected: string;
      noAssignedSubjects: string;
      noAvailableSubjects: string;
      assignSuccess: string;
      removeSuccess: string;
      assignError: string;
      removeError: string;
      manageSubjects: string;
      searchAvailable: string;
      selectAll: string;
      deselectAll: string;
      confirmRemoveTitle: string;
      confirmRemoveMessage: string;
      confirmRemoveBtn: string;
    };
    schedule: {
      title: string;
      addEntry: string;
      editEntry: string;
      noClassSelected: string;
      noEntries: string;
      time: string;
      subject: string;
      start: string;
      end: string;
      day: string;
      monday: string;
      tuesday: string;
      wednesday: string;
      thursday: string;
      friday: string;
      selectDay: string;
      selectSubject: string;
      createSuccess: string;
      updateSuccess: string;
      deleteSuccess: string;
      loadError: string;
      createError: string;
      updateError: string;
      deleteError: string;
      deleteTitle: string;
      deleteConfirm: string;
      validation: {
        startRequired: string;
        endRequired: string;
        endAfterStart: string;
        subjectRequired: string;
        dayRequired: string;
        noOverlap: string;
      };
      addItem: string;
      removeItem: string;
    };
    students: {
      allStudents: string;
      classStudents: string;
      addStudent: string;
      editStudent: string;
      name: string;
      surnames: string;
      dateOfBirth: string;
      additionalInfo: string;
      gender: string;
      genderMale: string;
      genderFemale: string;
      genderPlaceholder: string;
      shape: string;
      shapeSquare: string;
      shapeCircle: string;
      shapeTriangle: string;
      photo: string;
      uploadPhoto: string;
      deletePhoto: string;
      namePlaceholder: string;
      surnamesPlaceholder: string;
      additionalInfoPlaceholder: string;
      assignToClass: string;
      removeFromClass: string;
      addToThisClass: string;
      searchStudents: string;
      gridView: string;
      listView: string;
      confirmAssignTitle: string;
      confirmAssignMessage: string;
      confirmAssign: string;
      removeFromClassTitle: string;
      confirmRemoveMessage: string;
      confirmRemove: string;
      school: string;
      class: string;
      noStudents: string;
      noStudentsInClass: string;
      createSuccess: string;
      updateSuccess: string;
      assignSuccess: string;
      removeSuccess: string;
      photoUploadSuccess: string;
      photoDeleteSuccess: string;
      createError: string;
      updateError: string;
      loadError: string;
      assignError: string;
      removeError: string;
      photoUploadError: string;
      photoDeleteError: string;
      assignedClasses: string;
      noClassesAssigned: string;
      selectSchoolAndClass: string;
      selectSchool: string;
      selectClass: string;
      deleteStudent: string;
      birthdayToday: string;
      deleteTitle: string;
      deleteConfirm: string;
      deleteSuccess: string;
      deleteError: string;
      validation: {
        nameRequired: string;
        surnamesRequired: string;
        dateOfBirthRequired: string;
        dateOfBirthInvalid: string;
        genderRequired: string;
        fileTooLarge: string;
        fileInvalidType: string;
      };
    };
    loadingData: string;
    evalCriteria: {
      title: string;
      selectSubject: string;
      quarter: string;
      quarter1: string;
      quarter2: string;
      quarter3: string;
      createExercise: string;
      editExercise: string;
      editGrade: string;
      createGrade: string;
      exerciseTitle: string;
      exerciseTitlePlaceholder: string;
      description: string;
      descriptionPlaceholder: string;
      percentageGrade: string;
      maxGrade: string;
      grade: string;
      noExercises: string;
      noClassSelected: string;
      selectSubjectFirst: string;
      noGrade: string;
      student: string;
      total: string;
      documents: string;
      uploadDocument: string;
      documentFile: string;
      documentDescription: string;
      documentDescriptionPlaceholder: string;
      noDocuments: string;
      downloadDocument: string;
      downloadError: string;
      editDescription: string;
      deleteDocument: string;
      deleteDocumentTitle: string;
      deleteDocumentConfirm: string;
      deleteExerciseTitle: string;
      deleteExerciseConfirm: string;
      deleteGradeTitle: string;
      deleteGradeConfirm: string;
      createExerciseSuccess: string;
      createExerciseError: string;
      updateExerciseSuccess: string;
      updateExerciseError: string;
      deleteExerciseSuccess: string;
      deleteExerciseError: string;
      createGradeSuccess: string;
      createGradeError: string;
      updateGradeSuccess: string;
      updateGradeError: string;
      deleteGradeSuccess: string;
      deleteGradeError: string;
      uploadDocumentSuccess: string;
      uploadDocumentError: string;
      deleteDocumentSuccess: string;
      deleteDocumentError: string;
      updateDescriptionSuccess: string;
      updateDescriptionError: string;
      loadError: string;
      exerciseInfo: string;
      exportGrades: string;
      exportGradesError: string;
      viewStudentGrades: string;
      studentGradesTitle: string;
      subjectAverage: string;
      quarterAverage: string;
      finalGrade: string;
      noGradesForStudent: string;
      gradeDocuments: string;
      gradeDocumentsTitle: string;
      groupWork: {
        title: string;
        assignment: string;
        group: string;
        grade: string;
        noGroupWork: string;
        notInGroup: string;
        noGrade: string;
        quarter: string;
      };
      chart: {
        title: string;
        failing: string;
        sufficient: string;
        good: string;
        remarkable: string;
        outstanding: string;
        noGrade: string;
        studentsCount: string;
        noDataForChart: string;
      };
      radarChart: {
        title: string;
        noDataForChart: string;
        quarter1: string;
        quarter2: string;
        quarter3: string;
        finalGrade: string;
      };
      validation: {
        titleRequired: string;
        titleMaxLength: string;
        quarterRequired: string;
        percentageRequired: string;
        percentageRange: string;
        percentageExceeds: string;
        maxGradeRequired: string;
        maxGradeRange: string;
        gradeRequired: string;
        gradeRange: string;
        fileRequired: string;
        fileTooLarge: string;
      };
    };
    classRubrics: {
      title: string;
      selectSkill: string;
      manageClassRubrics: string;
      assignRubric: string;
      removeRubric: string;
      noClassSelected: string;
      noSkills: string;
      noRubricsForSkill: string;
      noStudentsInClass: string;
      assignCriterion: string;
      removeCriterion: string;
      removeCriterionTitle: string;
      removeCriterionConfirm: string;
      removeRubricTitle: string;
      removeRubricConfirm: string;
      assignSuccess: string;
      assignError: string;
      removeSuccess: string;
      removeError: string;
      rubricAssignSuccess: string;
      rubricAssignError: string;
      rubricRemoveSuccess: string;
      rubricRemoveError: string;
      loadError: string;
      selectCriterion: string;
      noCriteriaAvailable: string;
      availableRubrics: string;
      assigned: string;
      notAssigned: string;
      noCriterion: string;
      student: string;
      viewStudentCriteria: string;
      studentCriteriaSummary: string;
      noCriteriaForStudent: string;
      skill: string;
      chart: {
        title: string;
        noDataForChart: string;
      };
    };
    attendance: {
      title: string;
      subject: string;
      fullDayAbsence: string;
      fullDayConfirm: string;
      absenceCount: string;
      noClassSelected: string;
      noSubjectsInClass: string;
      createError: string;
      deleteError: string;
      selectStudent: string;
      selectDate: string;
      absenceCreated: string;
      absenceDeleted: string;
      fullDayCreated: string;
      noSubjectsForDay: string;
      today: string;
      monthNames: string[];
      dayAbbreviations: string[];
      summaryTitle: string;
      summaryError: string;
      noAbsences: string;
      totalAbsences: string;
      bySubject: string;
      byMonth: string;
      viewAbsences: string;
    };
    cooperative: {
      title: string;
      generateGroups: string;
      saveGroups: string;
      updateGroups: string;
      deleteAllGroups: string;
      deleteAllTitle: string;
      deleteAllConfirm: string;
      allGroupsLabel: string;
      choosePriority: string;
      priorityDescription: string;
      prioritizeShape: string;
      prioritizeGender: string;
      groupName: string;
      groupNamePlaceholder: string;
      noGroups: string;
      noGroupsHint: string;
      noClassSelected: string;
      dragHint: string;
      unassignedStudents: string;
      unassignedCount: string;
      allStudentsMustBeAssigned: string;
      saveSuccess: string;
      saveError: string;
      deleteSuccess: string;
      deleteError: string;
      loadError: string;
      generateError: string;
      generateDisabledHint: string;
      groupSizeError: string;
      reloadGroups: string;
      collapseGroups: string;
      expandGroups: string;
      groupAssignments: {
        title: string;
        addAssignment: string;
        editAssignment: string;
        deleteAssignment: string;
        deleteAssignmentConfirm: string;
        assignmentTitle: string;
        assignmentTitlePlaceholder: string;
        assignmentDescription: string;
        assignmentDescriptionPlaceholder: string;
        quarter: string;
        grades: string;
        grade: string;
        gradePlaceholder: string;
        gradeRange: string;
        saveGrade: string;
        deleteGrade: string;
        documents: string;
        assignmentDocuments: string;
        groupDocuments: string;
        noDocuments: string;
        uploadDocument: string;
        downloadDocument: string;
        deleteDocument: string;
        deleteDocumentTitle: string;
        deleteDocumentConfirm: string;
        noAssignments: string;
        noAssignmentsHint: string;
        needSavedGroups: string;
        createSuccess: string;
        updateSuccess: string;
        deleteSuccess: string;
        createError: string;
        updateError: string;
        deleteError: string;
        gradeSuccess: string;
        gradeError: string;
        gradeDeleteSuccess: string;
        gradeDeleteError: string;
        loadError: string;
        uploadSuccess: string;
        uploadError: string;
        downloadError: string;
        deleteDocError: string;
        validation: {
          titleRequired: string;
          quarterRequired: string;
          gradeRange: string;
          fileRequired: string;
          fileTooLarge: string;
        };
      };
    };
    calendar: {
      title: string;
      newAlert: string;
      editAlert: string;
      alertTitle: string;
      alertTitlePlaceholder: string;
      alertDescription: string;
      alertDescriptionPlaceholder: string;
      alertDate: string;
      alertStartTime: string;
      alertEndTime: string;
      moreEvents: string;
      months: string[];
      daysShort: string[];
      createSuccess: string;
      updateSuccess: string;
      deleteSuccess: string;
      loadError: string;
      createError: string;
      updateError: string;
      deleteError: string;
      deleteTitle: string;
      deleteConfirm: string;
      todayAlerts: string;
      goToCalendar: string;
      addAlertOn: string;
      previousMonth: string;
      nextMonth: string;
      selectMonth: string;
      selectYear: string;
      close: string;
      moveSuccess: string;
      moveError: string;
      validation: {
        titleRequired: string;
        titleMaxLength: string;
        dateRequired: string;
        endTimeRequiresStart: string;
        endTimeAfterStart: string;
      };
    };
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
    print: string;
    language: {
      es: string;
      en: string;
      ga: string;
    };
  };
  update: {
    downloading: string;
    ready: string;
    installNow: string;
    error: string;
    checkManually: string;
    upToDate: string;
    version: string;
  };
}

export const translations: Record<Locale, Translations> = {
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
        subjects: 'Asignaturas',
        skills: 'Competencias',
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
        searchPlaceholder: 'Buscar colegio o clase...',
        noSchoolsFound: 'No se encontraron colegios o clases con ese nombre',
        showFilter: 'Mostrar filtros',
        hideFilter: 'Ocultar filtros',
        searchBy: 'Buscar por',
        filterBySchool: 'Colegio',
        filterByClass: 'Clase',
        filterByTown: 'Población',
        searchSchoolPlaceholder: 'Escribe el nombre del colegio...',
        searchClassPlaceholder: 'Escribe el nombre de la clase...',
        searchTownPlaceholder: 'Escribe el nombre de la población...',
        clearFilter: 'Limpiar filtro',
        clearAllFilters: 'Limpiar filtros',
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
      subjects: {
        title: 'Gestión de Asignaturas',
        addNew: 'Crear Asignatura',
        name: 'Nombre',
        namePlaceholder: 'Nombre de la asignatura',
        edit: 'Editar',
        delete: 'Eliminar',
        createTitle: 'Crear Asignatura',
        editTitle: 'Editar Asignatura',
        create: 'Crear',
        update: 'Actualizar',
        createSuccess: 'Asignatura creada correctamente',
        updateSuccess: 'Asignatura actualizada correctamente',
        deleteSuccess: 'Asignatura eliminada correctamente',
        createError: 'Error al crear la asignatura',
        updateError: 'Error al actualizar la asignatura',
        deleteError: 'Error al eliminar la asignatura',
        loadError: 'Error al cargar las asignaturas',
        noSubjects: 'No hay asignaturas registradas',
        deleteTitle: 'Eliminar asignatura',
        deleteConfirm: '¿Está seguro que desea eliminar la asignatura "{name}"? Esta acción no se puede deshacer.',
        searchSubjects: 'Buscar asignaturas...',
        noResults: 'No se encontraron asignaturas',
        gridView: 'Vista en cuadrícula',
        listView: 'Vista en lista',
        validation: {
          nameRequired: 'El nombre es obligatorio',
          nameMinLength: 'El nombre debe tener al menos 3 caracteres',
        },
      },
      skills: {
        title: 'Gestión de Competencias',
        addNew: 'Crear Competencia',
        titleLabel: 'Título',
        titlePlaceholder: 'Título de la competencia',
        description: 'Descripción',
        descriptionPlaceholder: 'Descripción de la competencia',
        edit: 'Editar',
        delete: 'Eliminar',
        createTitle: 'Crear Competencia',
        editTitle: 'Editar Competencia',
        create: 'Crear',
        update: 'Actualizar',
        createSuccess: 'Competencia creada correctamente',
        updateSuccess: 'Competencia actualizada correctamente',
        deleteSuccess: 'Competencia eliminada correctamente',
        createError: 'Error al crear la competencia',
        updateError: 'Error al actualizar la competencia',
        deleteError: 'Error al eliminar la competencia',
        loadError: 'Error al cargar las competencias',
        noSkills: 'No hay competencias registradas',
        deleteTitle: 'Eliminar competencia',
        deleteConfirm: '¿Está seguro que desea eliminar la competencia "{name}"? Esta acción no se puede deshacer.',
        searchSkills: 'Buscar competencias...',
        noResults: 'No se encontraron competencias',
        gridView: 'Vista en cuadrícula',
        listView: 'Vista en lista',
        validation: {
          titleRequired: 'El título es obligatorio',
          titleMinLength: 'El título debe tener al menos 3 caracteres',
          titleMaxLength: 'El título no puede superar los 200 caracteres',
          descriptionMaxLength: 'La descripción no puede superar los 200 caracteres',
        },
        rubrics: {
          modalTitle: 'Rúbricas de Competencia',
          manageRubrics: 'Gestionar rúbricas',
          createRubric: 'Crear Rúbrica',
          editRubric: 'Editar Rúbrica',
          deleteRubric: 'Eliminar Rúbrica',
          rubricTitle: 'Título',
          rubricTitlePlaceholder: 'Título de la rúbrica',
          noRubrics: 'No hay rúbricas registradas',
          criteria: 'criterios',
          addCriterion: 'Añadir Criterio',
          editCriterion: 'Editar Criterio',
          deleteCriterion: 'Eliminar Criterio',
          criterionDescription: 'Descripción',
          criterionDescriptionPlaceholder: 'Descripción del criterio',
          gradeStart: 'Nota inicio',
          gradeEnd: 'Nota fin',
          qualification: 'Calificación',
          qualificationPlaceholder: 'Ej: Insuficiente, Bien, Notable...',
          noCriteria: 'No hay criterios registrados',
          deleteRubricTitle: 'Eliminar rúbrica',
          deleteRubricConfirm: '¿Está seguro que desea eliminar la rúbrica "{name}"? Se eliminarán también todos sus criterios. Esta acción no se puede deshacer.',
          deleteCriterionTitle: 'Eliminar criterio',
          deleteCriterionConfirm: '¿Está seguro que desea eliminar el criterio "{name}"? Esta acción no se puede deshacer.',
          createRubricSuccess: 'Rúbrica creada correctamente',
          createRubricError: 'Error al crear la rúbrica',
          updateRubricSuccess: 'Rúbrica actualizada correctamente',
          updateRubricError: 'Error al actualizar la rúbrica',
          deleteRubricSuccess: 'Rúbrica eliminada correctamente',
          deleteRubricError: 'Error al eliminar la rúbrica',
          createCriterionSuccess: 'Criterio creado correctamente',
          createCriterionError: 'Error al crear el criterio',
          updateCriterionSuccess: 'Criterio actualizado correctamente',
          updateCriterionError: 'Error al actualizar el criterio',
          deleteCriterionSuccess: 'Criterio eliminado correctamente',
          deleteCriterionError: 'Error al eliminar el criterio',
          loadError: 'Error al cargar las rúbricas',
          validation: {
            titleRequired: 'El título es obligatorio',
            titleMaxLength: 'El título no puede superar los 200 caracteres',
            descriptionRequired: 'La descripción es obligatoria',
            descriptionMaxLength: 'La descripción no puede superar los 200 caracteres',
            gradeEndGreaterOrEqual: 'La nota fin debe ser mayor o igual que la nota inicio',
            gradeOverlap: 'El rango de notas se solapa con otro criterio existente',
          },
        },
      },
      classSubjects: {
        title: 'Asignaturas de la Clase',
        assignedSubjects: 'Asignaturas asignadas',
        availableSubjects: 'Asignaturas disponibles',
        assignSelected: 'Asignar seleccionadas',
        noAssignedSubjects: 'No hay asignaturas asignadas a esta clase',
        noAvailableSubjects: 'No hay más asignaturas disponibles para asignar',
        assignSuccess: 'Asignaturas asignadas correctamente',
        removeSuccess: 'Asignatura eliminada de la clase',
        assignError: 'Error al asignar asignaturas',
        removeError: 'Error al eliminar asignatura de la clase',
        manageSubjects: 'Gestionar Asignaturas',
        searchAvailable: 'Buscar asignaturas...',
        selectAll: 'Seleccionar todas',
        deselectAll: 'Deseleccionar todas',
        confirmRemoveTitle: 'Eliminar asignatura de la clase',
        confirmRemoveMessage: '¿Estás seguro de que deseas eliminar la asignatura "{name}" de esta clase? Se perderán todos los criterios de evaluación asociados a esta clase y asignatura.',
        confirmRemoveBtn: 'Sí, eliminar',
      },
      schedule: {
        title: 'Horario Escolar',
        addEntry: 'Añadir Horario',
        editEntry: 'Editar Horario',
        noClassSelected: 'Selecciona una clase para ver el horario',
        noEntries: 'No hay horarios registrados para esta clase',
        time: 'Hora',
        subject: 'Asignatura',
        start: 'Hora inicio',
        end: 'Hora fin',
        day: 'Día',
        monday: 'Lunes',
        tuesday: 'Martes',
        wednesday: 'Miércoles',
        thursday: 'Jueves',
        friday: 'Viernes',
        selectDay: 'Selecciona un día',
        selectSubject: 'Selecciona una asignatura',
        createSuccess: 'Horario creado correctamente',
        updateSuccess: 'Horario actualizado correctamente',
        deleteSuccess: 'Horario eliminado correctamente',
        loadError: 'Error al cargar los horarios',
        createError: 'Error al crear el horario',
        updateError: 'Error al actualizar el horario',
        deleteError: 'Error al eliminar el horario',
        deleteTitle: 'Eliminar horario',
        deleteConfirm: '¿Está seguro que desea eliminar este horario? Esta acción no se puede deshacer.',
        validation: {
          startRequired: 'La hora de inicio es obligatoria',
          endRequired: 'La hora de fin es obligatoria',
          endAfterStart: 'La hora de fin debe ser posterior a la de inicio',
          subjectRequired: 'Debe seleccionar una asignatura',
          dayRequired: 'Debe seleccionar un día',
          noOverlap: 'Los horarios no pueden solaparse',
        },
        addItem: 'Añadir asignatura',
        removeItem: 'Eliminar',
      },
      students: {
        allStudents: 'Todos los Alumnos',
        classStudents: 'Alumnos de la Clase',
        addStudent: 'Añadir Alumno',
        editStudent: 'Editar Alumno',
        name: 'Nombre',
        surnames: 'Apellidos',
        dateOfBirth: 'Fecha de Nacimiento',
        additionalInfo: 'Información Adicional',
        gender: 'Género',
        genderMale: 'Masculino',
        genderFemale: 'Femenino',
        genderPlaceholder: 'Seleccionar género',
        shape: 'Figura',
        shapeSquare: 'Cuadrado',
        shapeCircle: 'Círculo',
        shapeTriangle: 'Triángulo',
        photo: 'Foto',
        uploadPhoto: 'Subir Foto',
        deletePhoto: 'Eliminar Foto',
        namePlaceholder: 'Nombre del alumno',
        surnamesPlaceholder: 'Apellidos del alumno',
        additionalInfoPlaceholder: 'Notas adicionales sobre el alumno...',
        assignToClass: 'Asignar a Clase',
        removeFromClass: 'Quitar de Clase',
        addToThisClass: 'Añadir a esta Clase',
        searchStudents: 'Buscar alumnos...',
        gridView: 'Vista en cuadrícula',
        listView: 'Vista en lista',
        confirmAssignTitle: 'Confirmar Asignación',
        confirmAssignMessage: '¿Deseas añadir este alumno a la clase actual?',
        confirmAssign: 'Añadir a Clase',
        removeFromClassTitle: 'Quitar Alumno de la Clase',
        confirmRemoveMessage: '¿Está seguro que desea quitar a {studentName} de la clase "{className}"? Se perderán todas sus notas asociadas a esta clase.',
        confirmRemove: 'Quitar de Clase',
        school: 'Colegio',
        class: 'Clase',
        noStudents: 'No hay alumnos registrados',
        noStudentsInClass: 'No hay alumnos en esta clase',
        createSuccess: 'Alumno creado correctamente',
        updateSuccess: 'Alumno actualizado correctamente',
        assignSuccess: 'Alumno asignado a la clase correctamente',
        removeSuccess: 'Alumno quitado de la clase correctamente',
        photoUploadSuccess: 'Foto subida correctamente',
        photoDeleteSuccess: 'Foto eliminada correctamente',
        createError: 'Error al crear el alumno',
        updateError: 'Error al actualizar el alumno',
        loadError: 'Error al cargar los alumnos',
        assignError: 'Error al asignar el alumno a la clase',
        removeError: 'Error al quitar el alumno de la clase',
        photoUploadError: 'Error al subir la foto',
        photoDeleteError: 'Error al eliminar la foto',
        assignedClasses: 'Clases asignadas',
        noClassesAssigned: 'Sin clases asignadas',
        selectSchoolAndClass: 'Seleccionar Colegio y Clase',
        selectSchool: 'Seleccionar colegio',
        selectClass: 'Seleccionar clase',
        deleteStudent: 'Eliminar Alumno',
        birthdayToday: '¡Hoy es su cumpleaños! 🎂',
        deleteTitle: 'Eliminar alumno',
        deleteConfirm: '¿Está seguro que desea eliminar al alumno "{name}"? Esta acción no se puede deshacer.',
        deleteSuccess: 'Alumno eliminado correctamente',
        deleteError: 'Error al eliminar el alumno',
        validation: {
          nameRequired: 'El nombre es obligatorio',
          surnamesRequired: 'Los apellidos son obligatorios',
          dateOfBirthRequired: 'La fecha de nacimiento es obligatoria',
          dateOfBirthInvalid: 'La fecha de nacimiento no puede ser futura',
          genderRequired: 'El género es obligatorio',
          fileTooLarge: 'El archivo es demasiado grande. Máximo 5MB',
          fileInvalidType: 'Tipo de archivo no válido. Solo se permiten imágenes JPEG y PNG',
        },
      },
      loadingData: 'Cargando datos...',
      evalCriteria: {
        title: 'Criterios de evaluación',
        selectSubject: 'Seleccionar asignatura',
        quarter: 'Trimestre',
        quarter1: 'Trimestre 1',
        quarter2: 'Trimestre 2',
        quarter3: 'Trimestre 3',
        createExercise: 'Crear',
        editExercise: 'Editar',
        editGrade: 'Editar Nota',
        createGrade: 'Añadir Nota',
        exerciseTitle: 'Título del criterio de evaluación',
        exerciseTitlePlaceholder: 'Ej: Examen unidad 3',
        description: 'Descripción',
        descriptionPlaceholder: 'Descripción opcional...',
        percentageGrade: 'Porcentaje nota final',
        maxGrade: 'Nota máxima',
        grade: 'Nota',
        noExercises: 'No hay criterios de evaluación para esta asignatura y trimestre',
        noClassSelected: 'Selecciona una clase para ver los criterios de evaluación',
        selectSubjectFirst: 'No hay asignaturas asignadas a esta clase',
        noGrade: 'Sin nota',
        student: 'Alumno',
        total: 'Total',
        documents: 'Documentos',
        uploadDocument: 'Subir Documento',
        documentFile: 'Archivo',
        documentDescription: 'Descripción del documento',
        documentDescriptionPlaceholder: 'Descripción del documento...',
        noDocuments: 'No hay documentos adjuntos',
        downloadDocument: 'Descargar',
        downloadError: 'Error al descargar el documento',
        editDescription: 'Editar descripción',
        deleteDocument: 'Eliminar documento',
        deleteDocumentTitle: 'Eliminar documento',
        deleteDocumentConfirm: '¿Está seguro que desea eliminar el documento "{name}"? Esta acción no se puede deshacer.',
        deleteExerciseTitle: 'Eliminar criterio de evaluación',
        deleteExerciseConfirm: '¿Está seguro que desea eliminar el criterio de evaluación "{name}"? Se eliminarán también todas sus notas y documentos. Esta acción no se puede deshacer.',
        deleteGradeTitle: 'Eliminar nota',
        deleteGradeConfirm: '¿Está seguro que desea eliminar la nota del criterio de evaluación "{name}"? Esta acción no se puede deshacer.',
        createExerciseSuccess: 'Criterio de evaluación creado correctamente',
        createExerciseError: 'Error al crear el criterio de evaluación',
        updateExerciseSuccess: 'Criterio de evaluación actualizado correctamente',
        updateExerciseError: 'Error al actualizar el criterio de evaluación',
        deleteExerciseSuccess: 'Criterio de evaluación eliminado correctamente',
        deleteExerciseError: 'Error al eliminar el criterio de evaluación',
        createGradeSuccess: 'Nota creada correctamente',
        createGradeError: 'Error al crear la nota',
        updateGradeSuccess: 'Nota actualizada correctamente',
        updateGradeError: 'Error al actualizar la nota',
        deleteGradeSuccess: 'Nota eliminada correctamente',
        deleteGradeError: 'Error al eliminar la nota',
        uploadDocumentSuccess: 'Documento subido correctamente',
        uploadDocumentError: 'Error al subir el documento',
        deleteDocumentSuccess: 'Documento eliminado correctamente',
        deleteDocumentError: 'Error al eliminar el documento',
        updateDescriptionSuccess: 'Descripción actualizada correctamente',
        updateDescriptionError: 'Error al actualizar la descripción',
        loadError: 'Error al cargar los datos de criterios de evaluación',
        exerciseInfo: 'Información del criterio de evaluación',
        exportGrades: 'Exportar Excel',
        exportGradesError: 'Error al exportar los criterios de evaluación',
        viewStudentGrades: 'Ver notas',
        studentGradesTitle: 'Notas de {name}',
        subjectAverage: 'Media',
        quarterAverage: 'Media del trimestre',
        finalGrade: 'Nota Final',
        noGradesForStudent: 'No hay notas registradas para este alumno',
        gradeDocuments: 'Documentos de la nota',
        gradeDocumentsTitle: '{student} - {exercise}',
        groupWork: {
          title: 'Trabajos en grupo',
          assignment: 'Trabajo',
          group: 'Grupo',
          grade: 'Nota',
          noGroupWork: 'No hay trabajos en grupo para esta clase',
          notInGroup: 'Sin grupo asignado',
          noGrade: 'Sin nota',
          quarter: 'Trimestre',
        },
        chart: {
          title: 'Distribución de notas',
          failing: 'Suspenso',
          sufficient: 'Suficiente',
          good: 'Bien',
          remarkable: 'Notable',
          outstanding: 'Sobresaliente',
          noGrade: 'Sin nota',
          studentsCount: 'Alumnos',
          noDataForChart: 'No hay datos para mostrar la gráfica',
        },
        radarChart: {
          title: 'Gráfica de rendimiento',
          noDataForChart: 'No hay asignaturas para mostrar la gráfica',
          quarter1: 'T1',
          quarter2: 'T2',
          quarter3: 'T3',
          finalGrade: 'Final',
        },
        validation: {
          titleRequired: 'El título es obligatorio',
          titleMaxLength: 'El título no puede superar los 60 caracteres',
          quarterRequired: 'El trimestre es obligatorio',
          percentageRequired: 'El porcentaje es obligatorio',
          percentageRange: 'El porcentaje debe estar entre 1 y 100',
          percentageExceeds: 'El porcentaje máximo disponible es {available}%',
          maxGradeRequired: 'La nota máxima es obligatoria',
          maxGradeRange: 'La nota máxima debe estar entre 1 y 20',
          gradeRequired: 'La nota es obligatoria',
          gradeRange: 'La nota debe estar entre 0 y {max}',
          fileRequired: 'Debe seleccionar un archivo',
          fileTooLarge: 'El archivo es demasiado grande. Máximo 2MB',
        },
      },
      classRubrics: {
        title: 'Rúbricas',
        selectSkill: 'Competencia',
        manageClassRubrics: 'Gestionar Rúbricas',
        assignRubric: 'Asignar Rúbrica',
        removeRubric: 'Desasignar Rúbrica',
        noClassSelected: 'Selecciona una clase para ver las rúbricas',
        noSkills: 'No hay competencias registradas',
        noRubricsForSkill: 'No hay rúbricas asignadas para esta competencia',
        noStudentsInClass: 'No hay alumnos en esta clase',
        assignCriterion: 'Asignar Criterio',
        removeCriterion: 'Eliminar Criterio',
        removeCriterionTitle: 'Eliminar criterio',
        removeCriterionConfirm: '¿Está seguro que desea eliminar el criterio de este alumno?',
        removeRubricTitle: 'Desasignar rúbrica',
        removeRubricConfirm: '¿Está seguro que desea desasignar la rúbrica "{name}"? Se eliminarán los criterios asignados a los alumnos.',
        assignSuccess: 'Criterio asignado correctamente',
        assignError: 'Error al asignar el criterio',
        removeSuccess: 'Criterio eliminado correctamente',
        removeError: 'Error al eliminar el criterio',
        rubricAssignSuccess: 'Rúbrica asignada a la clase',
        rubricAssignError: 'Error al asignar la rúbrica',
        rubricRemoveSuccess: 'Rúbrica desasignada de la clase',
        rubricRemoveError: 'Error al desasignar la rúbrica',
        loadError: 'Error al cargar las rúbricas',
        selectCriterion: 'Seleccionar criterio',
        noCriteriaAvailable: 'No hay criterios disponibles para esta rúbrica',
        availableRubrics: 'Rúbricas disponibles',
        assigned: 'Asignada',
        notAssigned: 'No asignada',
        noCriterion: 'Sin criterio',
        student: 'Alumno',
        viewStudentCriteria: 'Ver rúbricas',
        studentCriteriaSummary: 'Resumen de rúbricas',
        noCriteriaForStudent: 'Este alumno no tiene criterios asignados',
        skill: 'Competencia',
        chart: {
          title: 'Distribución de criterios',
          noDataForChart: 'No hay datos para mostrar la gráfica',
        },
      },
      attendance: {
        title: 'Asistencia',
        subject: 'Asignatura',
        fullDayAbsence: 'Ausencia día completo',
        fullDayConfirm: '¿Marcar ausencia en todas las asignaturas para {studentName} el día {date}?',
        absenceCount: 'Total',
        noClassSelected: 'Selecciona una clase para ver la asistencia',
        noSubjectsInClass: 'No hay asignaturas asignadas a esta clase',
        createError: 'Error al registrar la ausencia',
        deleteError: 'Error al eliminar la ausencia',
        selectStudent: 'Seleccionar alumno',
        selectDate: 'Seleccionar fecha',
        absenceCreated: 'Ausencia registrada correctamente',
        absenceDeleted: 'Ausencia eliminada correctamente',
        fullDayCreated: 'Ausencia de día completo registrada',
        noSubjectsForDay: 'No hay asignaturas programadas para ese día',
        today: 'Hoy',
        monthNames: ['Septiembre', 'Octubre', 'Noviembre', 'Diciembre', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
        dayAbbreviations: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'],
        summaryTitle: 'Resumen de faltas',
        summaryError: 'Error al obtener las faltas del alumno',
        noAbsences: 'Este alumno no tiene faltas registradas',
        totalAbsences: 'Total de faltas',
        bySubject: 'Por asignatura',
        byMonth: 'Por mes',
        viewAbsences: 'Ver faltas',
      },
      cooperative: {
        title: 'Cooperativo',
        generateGroups: 'Generar grupos',
        saveGroups: 'Guardar',
        updateGroups: 'Actualizar',
        deleteAllGroups: 'Eliminar todos',
        deleteAllTitle: 'Eliminar todos los grupos',
        deleteAllConfirm: '¿Está seguro que desea eliminar todos los grupos de esta clase? Esta acción no se puede deshacer.',
        allGroupsLabel: 'todos los grupos',
        choosePriority: 'Elegir prioridad',
        priorityDescription: '¿Qué criterio deseas priorizar para formar los grupos?',
        prioritizeShape: 'Priorizar figura',
        prioritizeGender: 'Priorizar género',
        groupName: 'Grupo',
        groupNamePlaceholder: 'Nombre del grupo',
        noGroups: 'No hay grupos creados',
        noGroupsHint: 'Pulsa "Generar grupos" para crear grupos automáticamente',
        noClassSelected: 'Selecciona una clase para gestionar los grupos',
        dragHint: 'Arrastra alumnos aquí',
        unassignedStudents: 'Alumnos sin asignar',
        unassignedCount: '{count} alumnos sin asignar a ningún grupo',
        allStudentsMustBeAssigned: 'Todos los alumnos deben estar asignados a un grupo para poder guardar',
        saveSuccess: 'Grupos guardados correctamente',
        saveError: 'Error al guardar los grupos',
        deleteSuccess: 'Grupos eliminados correctamente',
        deleteError: 'Error al eliminar los grupos',
        loadError: 'Error al cargar los grupos',
        generateError: 'Error al generar los grupos',
        generateDisabledHint: 'Elimina los grupos guardados antes de generar nuevos',
        groupSizeError: 'Cada grupo debe tener entre 3 y 4 miembros',
        reloadGroups: 'Recargar grupos',
        collapseGroups: 'Ocultar grupos',
        expandGroups: 'Mostrar grupos',
        groupAssignments: {
          title: 'Trabajos cooperativos',
          addAssignment: 'Nuevo trabajo',
          editAssignment: 'Editar trabajo',
          deleteAssignment: 'Eliminar trabajo',
          deleteAssignmentConfirm: '¿Está seguro que desea eliminar el trabajo "{name}"? Se eliminarán también las notas y documentos asociados.',
          assignmentTitle: 'Título',
          assignmentTitlePlaceholder: 'Título del trabajo...',
          assignmentDescription: 'Descripción',
          assignmentDescriptionPlaceholder: 'Descripción opcional...',
          quarter: 'Trimestre',
          grades: 'Notas',
          grade: 'Nota',
          gradePlaceholder: '0-10',
          gradeRange: 'La nota debe estar entre 0 y 10',
          saveGrade: 'Guardar nota',
          deleteGrade: 'Eliminar nota',
          documents: 'Documentos',
          assignmentDocuments: 'Documentos del trabajo',
          groupDocuments: 'Documentos del grupo',
          noDocuments: 'No hay documentos',
          uploadDocument: 'Subir documento',
          downloadDocument: 'Descargar documento',
          deleteDocument: 'Eliminar documento',
          deleteDocumentTitle: 'Eliminar documento',
          deleteDocumentConfirm: '¿Está seguro que desea eliminar este documento? Esta acción no se puede deshacer.',
          noAssignments: 'No hay trabajos cooperativos',
          noAssignmentsHint: 'Crea un nuevo trabajo para asignar notas y documentos a los grupos',
          needSavedGroups: 'Debes tener grupos guardados para gestionar trabajos cooperativos',
          createSuccess: 'Trabajo creado correctamente',
          updateSuccess: 'Trabajo actualizado correctamente',
          deleteSuccess: 'Trabajo eliminado correctamente',
          createError: 'Error al crear el trabajo',
          updateError: 'Error al actualizar el trabajo',
          deleteError: 'Error al eliminar el trabajo',
          gradeSuccess: 'Nota guardada correctamente',
          gradeError: 'Error al guardar la nota',
          gradeDeleteSuccess: 'Nota eliminada correctamente',
          gradeDeleteError: 'Error al eliminar la nota',
          loadError: 'Error al cargar los trabajos',
          uploadSuccess: 'Documento subido correctamente',
          uploadError: 'Error al subir el documento',
          downloadError: 'Error al descargar el documento',
          deleteDocError: 'Error al eliminar el documento',
          validation: {
            titleRequired: 'El título es obligatorio',
            quarterRequired: 'El trimestre es obligatorio',
            gradeRange: 'La nota debe estar entre 0 y 10',
            fileRequired: 'Selecciona un archivo',
            fileTooLarge: 'El archivo no puede superar los 2MB',
          },
        },
      },
      calendar: {
        title: 'Calendario',
        newAlert: 'Nueva Alerta',
        editAlert: 'Editar Alerta',
        alertTitle: 'Título',
        alertTitlePlaceholder: 'Título de la alerta...',
        alertDescription: 'Descripción',
        alertDescriptionPlaceholder: 'Descripción opcional...',
        alertDate: 'Fecha',
        alertStartTime: 'Hora de inicio',
        alertEndTime: 'Hora de fin',
        moreEvents: '+{n} más',
        months: [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ],
        daysShort: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        createSuccess: 'Alerta creada correctamente',
        updateSuccess: 'Alerta actualizada correctamente',
        deleteSuccess: 'Alerta eliminada correctamente',
        loadError: 'Error al cargar las alertas',
        createError: 'Error al crear la alerta',
        updateError: 'Error al actualizar la alerta',
        deleteError: 'Error al eliminar la alerta',
        deleteTitle: 'Eliminar alerta',
        deleteConfirm: '¿Está seguro que desea eliminar la alerta "{name}"? Esta acción no se puede deshacer.',
        todayAlerts: 'Alertas de hoy',
        goToCalendar: 'Ir al calendario',
        addAlertOn: 'Añadir alerta el {date}',
        previousMonth: 'Mes anterior',
        nextMonth: 'Mes siguiente',
        selectMonth: 'Seleccionar mes',
        selectYear: 'Seleccionar año',
        close: 'Cerrar',
        moveSuccess: 'Alerta movida correctamente',
        moveError: 'Error al mover la alerta',
        validation: {
          titleRequired: 'El título es obligatorio',
          titleMaxLength: 'El título no puede superar los 100 caracteres',
          dateRequired: 'La fecha es obligatoria',
          endTimeRequiresStart: 'Debes indicar hora de inicio si añades hora de fin',
          endTimeAfterStart: 'La hora de fin debe ser posterior a la hora de inicio',
        },
      },
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
      print: 'Imprimir',
      language: {
        es: 'ESPAÑOL',
        en: 'INGLÉS',
        ga: 'GALEGO'
      }
    },
    update: {
      downloading: 'Descargando nueva versión...',
      ready: 'Nueva versión lista. Reinicia para actualizar.',
      installNow: 'Reiniciar y actualizar',
      error: 'Error al buscar actualizaciones.',
      checkManually: 'Buscar actualizaciones',
      upToDate: 'La aplicación está actualizada.',
      version: 'Versión'
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
        subjects: 'Subjects',
        skills: 'Skills',
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
        searchPlaceholder: 'Search school or class...',
        noSchoolsFound: 'No schools or classes found with that name',
        showFilter: 'Show filters',
        hideFilter: 'Hide filters',
        searchBy: 'Search by',
        filterBySchool: 'School',
        filterByClass: 'Class',
        filterByTown: 'Town',
        searchSchoolPlaceholder: 'Type school name...',
        searchClassPlaceholder: 'Type class name...',
        searchTownPlaceholder: 'Type town name...',
        clearFilter: 'Clear filter',
        clearAllFilters: 'Clear filters',
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
      subjects: {
        title: 'Subject Management',
        addNew: 'Create Subject',
        name: 'Name',
        namePlaceholder: 'Subject name',
        edit: 'Edit',
        delete: 'Delete',
        createTitle: 'Create Subject',
        editTitle: 'Edit Subject',
        create: 'Create',
        update: 'Update',
        createSuccess: 'Subject created successfully',
        updateSuccess: 'Subject updated successfully',
        deleteSuccess: 'Subject deleted successfully',
        createError: 'Error creating subject',
        updateError: 'Error updating subject',
        deleteError: 'Error deleting subject',
        loadError: 'Error loading subjects',
        noSubjects: 'No subjects registered',
        deleteTitle: 'Delete subject',
        deleteConfirm: 'Are you sure you want to delete the subject "{name}"? This action cannot be undone.',
        searchSubjects: 'Search subjects...',
        noResults: 'No subjects found',
        gridView: 'Grid view',
        listView: 'List view',
        validation: {
          nameRequired: 'Name is required',
          nameMinLength: 'Name must be at least 3 characters',
        },
      },
      skills: {
        title: 'Skills Management',
        addNew: 'Create Skill',
        titleLabel: 'Title',
        titlePlaceholder: 'Skill title',
        description: 'Description',
        descriptionPlaceholder: 'Skill description',
        edit: 'Edit',
        delete: 'Delete',
        createTitle: 'Create Skill',
        editTitle: 'Edit Skill',
        create: 'Create',
        update: 'Update',
        createSuccess: 'Skill created successfully',
        updateSuccess: 'Skill updated successfully',
        deleteSuccess: 'Skill deleted successfully',
        createError: 'Error creating skill',
        updateError: 'Error updating skill',
        deleteError: 'Error deleting skill',
        loadError: 'Error loading skills',
        noSkills: 'No skills registered',
        deleteTitle: 'Delete skill',
        deleteConfirm: 'Are you sure you want to delete the skill "{name}"? This action cannot be undone.',
        searchSkills: 'Search skills...',
        noResults: 'No skills found',
        gridView: 'Grid view',
        listView: 'List view',
        validation: {
          titleRequired: 'Title is required',
          titleMinLength: 'Title must be at least 3 characters',
          titleMaxLength: 'Title cannot exceed 200 characters',
          descriptionMaxLength: 'Description cannot exceed 200 characters',
        },
        rubrics: {
          modalTitle: 'Skill Rubrics',
          manageRubrics: 'Manage rubrics',
          createRubric: 'Create Rubric',
          editRubric: 'Edit Rubric',
          deleteRubric: 'Delete Rubric',
          rubricTitle: 'Title',
          rubricTitlePlaceholder: 'Rubric title',
          noRubrics: 'No rubrics registered',
          criteria: 'criteria',
          addCriterion: 'Add Criterion',
          editCriterion: 'Edit Criterion',
          deleteCriterion: 'Delete Criterion',
          criterionDescription: 'Description',
          criterionDescriptionPlaceholder: 'Criterion description',
          gradeStart: 'Grade start',
          gradeEnd: 'Grade end',
          qualification: 'Qualification',
          qualificationPlaceholder: 'E.g.: Insufficient, Good, Outstanding...',
          noCriteria: 'No criteria registered',
          deleteRubricTitle: 'Delete rubric',
          deleteRubricConfirm: 'Are you sure you want to delete the rubric "{name}"? All its criteria will also be deleted. This action cannot be undone.',
          deleteCriterionTitle: 'Delete criterion',
          deleteCriterionConfirm: 'Are you sure you want to delete the criterion "{name}"? This action cannot be undone.',
          createRubricSuccess: 'Rubric created successfully',
          createRubricError: 'Error creating rubric',
          updateRubricSuccess: 'Rubric updated successfully',
          updateRubricError: 'Error updating rubric',
          deleteRubricSuccess: 'Rubric deleted successfully',
          deleteRubricError: 'Error deleting rubric',
          createCriterionSuccess: 'Criterion created successfully',
          createCriterionError: 'Error creating criterion',
          updateCriterionSuccess: 'Criterion updated successfully',
          updateCriterionError: 'Error updating criterion',
          deleteCriterionSuccess: 'Criterion deleted successfully',
          deleteCriterionError: 'Error deleting criterion',
          loadError: 'Error loading rubrics',
          validation: {
            titleRequired: 'Title is required',
            titleMaxLength: 'Title cannot exceed 200 characters',
            descriptionRequired: 'Description is required',
            descriptionMaxLength: 'Description cannot exceed 200 characters',
            gradeEndGreaterOrEqual: 'Grade end must be greater than or equal to grade start',
            gradeOverlap: 'Grade range overlaps with an existing criterion',
          },
        },
      },
      classSubjects: {
        title: 'Class Subjects',
        assignedSubjects: 'Assigned subjects',
        availableSubjects: 'Available subjects',
        assignSelected: 'Assign selected',
        noAssignedSubjects: 'No subjects assigned to this class',
        noAvailableSubjects: 'No more subjects available to assign',
        assignSuccess: 'Subjects assigned successfully',
        removeSuccess: 'Subject removed from class',
        assignError: 'Error assigning subjects',
        removeError: 'Error removing subject from class',
        manageSubjects: 'Manage Subjects',
        searchAvailable: 'Search subjects...',
        selectAll: 'Select all',
        deselectAll: 'Deselect all',
        confirmRemoveTitle: 'Remove subject from class',
        confirmRemoveMessage: 'Are you sure you want to remove the subject "{name}" from this class? All evaluation criteria associated with this class and subject will be lost.',
        confirmRemoveBtn: 'Yes, remove',
      },
      schedule: {
        title: 'School Schedule',
        addEntry: 'Add Schedule',
        editEntry: 'Edit Schedule',
        noClassSelected: 'Select a class to view the schedule',
        noEntries: 'No schedules registered for this class',
        time: 'Time',
        subject: 'Subject',
        start: 'Start time',
        end: 'End time',
        day: 'Day',
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        selectDay: 'Select a day',
        selectSubject: 'Select a subject',
        createSuccess: 'Schedule created successfully',
        updateSuccess: 'Schedule updated successfully',
        deleteSuccess: 'Schedule deleted successfully',
        loadError: 'Error loading schedules',
        createError: 'Error creating schedule',
        updateError: 'Error updating schedule',
        deleteError: 'Error deleting schedule',
        deleteTitle: 'Delete schedule',
        deleteConfirm: 'Are you sure you want to delete this schedule? This action cannot be undone.',
        validation: {
          startRequired: 'Start time is required',
          endRequired: 'End time is required',
          endAfterStart: 'End time must be after start time',
          subjectRequired: 'A subject must be selected',
          dayRequired: 'A day must be selected',
          noOverlap: 'Schedules cannot overlap',
        },
        addItem: 'Add subject',
        removeItem: 'Remove',
      },
      students: {
        allStudents: 'All Students',
        classStudents: 'Class Students',
        addStudent: 'Add Student',
        editStudent: 'Edit Student',
        name: 'Name',
        surnames: 'Surnames',
        dateOfBirth: 'Date of Birth',
        additionalInfo: 'Additional Information',
        gender: 'Gender',
        genderMale: 'Male',
        genderFemale: 'Female',
        genderPlaceholder: 'Select gender',
        shape: 'Shape',
        shapeSquare: 'Square',
        shapeCircle: 'Circle',
        shapeTriangle: 'Triangle',
        photo: 'Photo',
        uploadPhoto: 'Upload Photo',
        deletePhoto: 'Delete Photo',
        namePlaceholder: 'Student name',
        surnamesPlaceholder: 'Student surnames',
        additionalInfoPlaceholder: 'Additional notes about the student...',
        assignToClass: 'Assign to Class',
        removeFromClass: 'Remove from Class',
        addToThisClass: 'Add to this Class',
        searchStudents: 'Search students...',
        gridView: 'Grid view',
        listView: 'List view',
        confirmAssignTitle: 'Confirm Assignment',
        confirmAssignMessage: 'Do you want to add this student to the current class?',
        confirmAssign: 'Add to Class',
        removeFromClassTitle: 'Remove Student from Class',
        confirmRemoveMessage: 'Are you sure you want to remove {studentName} from the class "{className}"? All grades associated with this class will be lost.',
        confirmRemove: 'Remove from Class',
        school: 'School',
        class: 'Class',
        noStudents: 'No students registered',
        noStudentsInClass: 'No students in this class',
        createSuccess: 'Student created successfully',
        updateSuccess: 'Student updated successfully',
        assignSuccess: 'Student assigned to class successfully',
        removeSuccess: 'Student removed from class successfully',
        photoUploadSuccess: 'Photo uploaded successfully',
        photoDeleteSuccess: 'Photo deleted successfully',
        createError: 'Error creating student',
        updateError: 'Error updating student',
        loadError: 'Error loading students',
        assignError: 'Error assigning student to class',
        removeError: 'Error removing student from class',
        photoUploadError: 'Error uploading photo',
        photoDeleteError: 'Error deleting photo',
        assignedClasses: 'Assigned Classes',
        noClassesAssigned: 'No classes assigned',
        selectSchoolAndClass: 'Select School and Class',
        selectSchool: 'Select school',
        selectClass: 'Select class',
        deleteStudent: 'Delete Student',
        birthdayToday: "It's their birthday today! 🎂",
        deleteTitle: 'Delete student',
        deleteConfirm: 'Are you sure you want to delete the student "{name}"? This action cannot be undone.',
        deleteSuccess: 'Student deleted successfully',
        deleteError: 'Error deleting student',
        validation: {
          nameRequired: 'Name is required',
          surnamesRequired: 'Surnames are required',
          dateOfBirthRequired: 'Date of birth is required',
          dateOfBirthInvalid: 'Date of birth cannot be in the future',
          genderRequired: 'Gender is required',
          fileTooLarge: 'File is too large. Maximum 5MB',
          fileInvalidType: 'Invalid file type. Only JPEG and PNG images are allowed',
        },
      },
      loadingData: 'Loading data...',
      evalCriteria: {
        title: 'Evaluation Criteria',
        selectSubject: 'Select subject',
        quarter: 'Quarter',
        quarter1: 'Quarter 1',
        quarter2: 'Quarter 2',
        quarter3: 'Quarter 3',
        createExercise: 'Create',
        editExercise: 'Edit',
        editGrade: 'Edit Grade',
        createGrade: 'Add Grade',
        exerciseTitle: 'Evaluation criterion title',
        exerciseTitlePlaceholder: 'E.g: Unit 3 Exam',
        description: 'Description',
        descriptionPlaceholder: 'Optional description...',
        percentageGrade: 'Percentage final grade',
        maxGrade: 'Max grade',
        grade: 'Grade',
        noExercises: 'No evaluation criteria for this subject and quarter',
        noClassSelected: 'Select a class to view evaluation criteria',
        selectSubjectFirst: 'No subjects assigned to this class',
        noGrade: 'No grade',
        student: 'Student',
        total: 'Total',
        documents: 'Documents',
        uploadDocument: 'Upload Document',
        documentFile: 'File',
        documentDescription: 'Document description',
        documentDescriptionPlaceholder: 'Document description...',
        noDocuments: 'No documents attached',
        downloadDocument: 'Download',
        downloadError: 'Error downloading document',
        editDescription: 'Edit description',
        deleteDocument: 'Delete document',
        deleteDocumentTitle: 'Delete document',
        deleteDocumentConfirm: 'Are you sure you want to delete the document "{name}"? This action cannot be undone.',
        deleteExerciseTitle: 'Delete evaluation criterion',
        deleteExerciseConfirm: 'Are you sure you want to delete the evaluation criterion "{name}"? All grades and documents will also be deleted. This action cannot be undone.',
        deleteGradeTitle: 'Delete grade',
        deleteGradeConfirm: 'Are you sure you want to delete the grade for evaluation criterion "{name}"? This action cannot be undone.',
        createExerciseSuccess: 'Evaluation criterion created successfully',
        createExerciseError: 'Error creating evaluation criterion',
        updateExerciseSuccess: 'Evaluation criterion updated successfully',
        updateExerciseError: 'Error updating evaluation criterion',
        deleteExerciseSuccess: 'Evaluation criterion deleted successfully',
        deleteExerciseError: 'Error deleting evaluation criterion',
        createGradeSuccess: 'Grade created successfully',
        createGradeError: 'Error creating grade',
        updateGradeSuccess: 'Grade updated successfully',
        updateGradeError: 'Error updating grade',
        deleteGradeSuccess: 'Grade deleted successfully',
        deleteGradeError: 'Error deleting grade',
        uploadDocumentSuccess: 'Document uploaded successfully',
        uploadDocumentError: 'Error uploading document',
        deleteDocumentSuccess: 'Document deleted successfully',
        deleteDocumentError: 'Error deleting document',
        updateDescriptionSuccess: 'Description updated successfully',
        updateDescriptionError: 'Error updating description',
        loadError: 'Error loading evaluation criteria data',
        exerciseInfo: 'Evaluation criterion information',
        exportGrades: 'Export Excel',
        exportGradesError: 'Error exporting evaluation criteria',
        viewStudentGrades: 'View grades',
        studentGradesTitle: 'Grades for {name}',
        subjectAverage: 'Average',
        quarterAverage: 'Quarter average',
        finalGrade: 'Final Grade',
        noGradesForStudent: 'No grades recorded for this student',
        gradeDocuments: 'Grade documents',
        gradeDocumentsTitle: 'Documents: {student} - {exercise}',
        groupWork: {
          title: 'Group work',
          assignment: 'Assignment',
          group: 'Group',
          grade: 'Grade',
          noGroupWork: 'No group assignments for this class',
          notInGroup: 'Not assigned to a group',
          noGrade: 'No grade',
          quarter: 'Quarter',
        },
        chart: {
          title: 'Grade distribution',
          failing: 'Failing',
          sufficient: 'Sufficient',
          good: 'Good',
          remarkable: 'Remarkable',
          outstanding: 'Outstanding',
          noGrade: 'No grade',
          studentsCount: 'Students',
          noDataForChart: 'No data available for chart',
        },
        radarChart: {
          title: 'Performance chart',
          noDataForChart: 'No subjects available for chart',
          quarter1: 'Q1',
          quarter2: 'Q2',
          quarter3: 'Q3',
          finalGrade: 'Final',
        },
        validation: {
          titleRequired: 'Title is required',
          titleMaxLength: 'Title cannot exceed 60 characters',
          quarterRequired: 'Quarter is required',
          percentageRequired: 'Percentage is required',
          percentageRange: 'Percentage must be between 1 and 100',
          percentageExceeds: 'Maximum available percentage is {available}%',
          maxGradeRequired: 'Max grade is required',
          maxGradeRange: 'Max grade must be between 1 and 20',
          gradeRequired: 'Grade is required',
          gradeRange: 'Grade must be between 0 and {max}',
          fileRequired: 'You must select a file',
          fileTooLarge: 'File is too large. Maximum 2MB',
        },
      },
      classRubrics: {
        title: 'Rubrics',
        selectSkill: 'Skill',
        manageClassRubrics: 'Manage Rubrics',
        assignRubric: 'Assign Rubric',
        removeRubric: 'Remove Rubric',
        noClassSelected: 'Select a class to view rubrics',
        noSkills: 'No skills registered',
        noRubricsForSkill: 'No rubrics assigned for this skill',
        noStudentsInClass: 'No students in this class',
        assignCriterion: 'Assign Criterion',
        removeCriterion: 'Remove Criterion',
        removeCriterionTitle: 'Remove criterion',
        removeCriterionConfirm: 'Are you sure you want to remove this student\'s criterion?',
        removeRubricTitle: 'Remove rubric',
        removeRubricConfirm: 'Are you sure you want to remove the rubric "{name}"? Student criteria will be deleted.',
        assignSuccess: 'Criterion assigned successfully',
        assignError: 'Error assigning criterion',
        removeSuccess: 'Criterion removed successfully',
        removeError: 'Error removing criterion',
        rubricAssignSuccess: 'Rubric assigned to class',
        rubricAssignError: 'Error assigning rubric',
        rubricRemoveSuccess: 'Rubric removed from class',
        rubricRemoveError: 'Error removing rubric',
        loadError: 'Error loading rubrics',
        selectCriterion: 'Select criterion',
        noCriteriaAvailable: 'No criteria available for this rubric',
        availableRubrics: 'Available rubrics',
        assigned: 'Assigned',
        notAssigned: 'Not assigned',
        noCriterion: 'No criterion',
        student: 'Student',
        viewStudentCriteria: 'View rubrics',
        studentCriteriaSummary: 'Rubrics summary',
        noCriteriaForStudent: 'This student has no criteria assigned',
        skill: 'Skill',
        chart: {
          title: 'Criteria distribution',
          noDataForChart: 'No data available for chart',
        },
      },
      attendance: {
        title: 'Attendance',
        subject: 'Subject',
        fullDayAbsence: 'Full day absence',
        fullDayConfirm: 'Mark absence in all subjects for {studentName} on {date}?',
        absenceCount: 'Total',
        noClassSelected: 'Select a class to view attendance',
        noSubjectsInClass: 'No subjects assigned to this class',
        createError: 'Error recording absence',
        deleteError: 'Error deleting absence',
        selectStudent: 'Select student',
        selectDate: 'Select date',
        absenceCreated: 'Absence recorded successfully',
        absenceDeleted: 'Absence deleted successfully',
        fullDayCreated: 'Full day absence recorded',
        noSubjectsForDay: 'There are no subjects scheduled for that day',
        today: 'Today',
        monthNames: ['September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'],
        dayAbbreviations: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        summaryTitle: 'Absence Summary',
        summaryError: 'Error fetching student absences',
        noAbsences: 'This student has no recorded absences',
        totalAbsences: 'Total absences',
        bySubject: 'By subject',
        byMonth: 'By month',
        viewAbsences: 'View absences',
      },
      cooperative: {
        title: 'Cooperative',
        generateGroups: 'Generate groups',
        saveGroups: 'Save',
        updateGroups: 'Update',
        deleteAllGroups: 'Delete all',
        deleteAllTitle: 'Delete all groups',
        deleteAllConfirm: 'Are you sure you want to delete all groups for this class? This action cannot be undone.',
        allGroupsLabel: 'all groups',
        choosePriority: 'Choose priority',
        priorityDescription: 'Which criterion do you want to prioritize when forming groups?',
        prioritizeShape: 'Prioritize shape',
        prioritizeGender: 'Prioritize gender',
        groupName: 'Group',
        groupNamePlaceholder: 'Group name',
        noGroups: 'No groups created',
        noGroupsHint: 'Click "Generate groups" to create groups automatically',
        noClassSelected: 'Select a class to manage groups',
        dragHint: 'Drag students here',
        unassignedStudents: 'Unassigned students',
        unassignedCount: '{count} students not assigned to any group',
        allStudentsMustBeAssigned: 'All students must be assigned to a group before saving',
        saveSuccess: 'Groups saved successfully',
        saveError: 'Error saving groups',
        deleteSuccess: 'Groups deleted successfully',
        deleteError: 'Error deleting groups',
        loadError: 'Error loading groups',
        generateError: 'Error generating groups',
        generateDisabledHint: 'Delete saved groups before generating new ones',
        groupSizeError: 'Each group must have between 3 and 4 members',
        reloadGroups: 'Reload groups',
        collapseGroups: 'Hide groups',
        expandGroups: 'Show groups',
        groupAssignments: {
          title: 'Group Assignments',
          addAssignment: 'New assignment',
          editAssignment: 'Edit assignment',
          deleteAssignment: 'Delete assignment',
          deleteAssignmentConfirm: 'Are you sure you want to delete the assignment "{name}"? All associated grades and documents will also be deleted.',
          assignmentTitle: 'Title',
          assignmentTitlePlaceholder: 'Assignment title...',
          assignmentDescription: 'Description',
          assignmentDescriptionPlaceholder: 'Optional description...',
          quarter: 'Quarter',
          grades: 'Grades',
          grade: 'Grade',
          gradePlaceholder: '0-10',
          gradeRange: 'Grade must be between 0 and 10',
          saveGrade: 'Save grade',
          deleteGrade: 'Delete grade',
          documents: 'Documents',
          assignmentDocuments: 'Assignment documents',
          groupDocuments: 'Group documents',
          noDocuments: 'No documents',
          uploadDocument: 'Upload document',
          downloadDocument: 'Download document',
          deleteDocument: 'Delete document',
          deleteDocumentTitle: 'Delete document',
          deleteDocumentConfirm: 'Are you sure you want to delete this document? This action cannot be undone.',
          noAssignments: 'No group assignments',
          noAssignmentsHint: 'Create a new assignment to manage grades and documents for groups',
          needSavedGroups: 'You need saved groups to manage group assignments',
          createSuccess: 'Assignment created successfully',
          updateSuccess: 'Assignment updated successfully',
          deleteSuccess: 'Assignment deleted successfully',
          createError: 'Error creating assignment',
          updateError: 'Error updating assignment',
          deleteError: 'Error deleting assignment',
          gradeSuccess: 'Grade saved successfully',
          gradeError: 'Error saving grade',
          gradeDeleteSuccess: 'Grade deleted successfully',
          gradeDeleteError: 'Error deleting grade',
          loadError: 'Error loading assignments',
          uploadSuccess: 'Document uploaded successfully',
          uploadError: 'Error uploading document',
          downloadError: 'Error downloading document',
          deleteDocError: 'Error deleting document',
          validation: {
            titleRequired: 'Title is required',
            quarterRequired: 'Quarter is required',
            gradeRange: 'Grade must be between 0 and 10',
            fileRequired: 'Please select a file',
            fileTooLarge: 'File cannot exceed 2MB',
          },
        },
      },
      calendar: {
        title: 'Calendar',
        newAlert: 'New Alert',
        editAlert: 'Edit Alert',
        alertTitle: 'Title',
        alertTitlePlaceholder: 'Alert title...',
        alertDescription: 'Description',
        alertDescriptionPlaceholder: 'Optional description...',
        alertDate: 'Date',
        alertStartTime: 'Start time',
        alertEndTime: 'End time',
        moreEvents: '+{n} more',
        months: [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ],
        daysShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        createSuccess: 'Alert created successfully',
        updateSuccess: 'Alert updated successfully',
        deleteSuccess: 'Alert deleted successfully',
        loadError: 'Error loading alerts',
        createError: 'Error creating alert',
        updateError: 'Error updating alert',
        deleteError: 'Error deleting alert',
        deleteTitle: 'Delete alert',
        deleteConfirm: 'Are you sure you want to delete the alert "{name}"? This action cannot be undone.',
        todayAlerts: "Today's alerts",
        goToCalendar: 'Go to calendar',
        addAlertOn: 'Add alert on {date}',
        previousMonth: 'Previous month',
        nextMonth: 'Next month',
        selectMonth: 'Select month',
        selectYear: 'Select year',
        close: 'Close',
        moveSuccess: 'Alert moved successfully',
        moveError: 'Error moving alert',
        validation: {
          titleRequired: 'Title is required',
          titleMaxLength: 'Title cannot exceed 100 characters',
          dateRequired: 'Date is required',
          endTimeRequiresStart: 'You must provide a start time if you add an end time',
          endTimeAfterStart: 'End time must be after start time',
        },
      },
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
      print: 'Print',
      language: {
        es: 'SPANISH',
        en: 'ENGLISH',
        ga: 'GALICIAN'
      }
    },
    update: {
      downloading: 'Downloading new version...',
      ready: 'New version ready. Restart to update.',
      installNow: 'Restart and update',
      error: 'Error checking for updates.',
      checkManually: 'Check for updates',
      upToDate: 'The application is up to date.',
      version: 'Version'
    }
  },
  ga: {
    app: {
      title: 'Teacher Notebook'
    },
    login: {
      title: 'Teacher Notebook',
      subtitle: 'O teu espazo educativo dixital',
      tagline: 'Xestión académica profesional',
      username: 'Usuario',
      password: 'Contrasinal',
      usernamePlaceholder: 'o_teu_usuario',
      passwordPlaceholder: '••••••••',
      loginButton: 'Acceder á Aula',
      errors: {
        emptyFields: 'Por favor completa todos os campos.',
        loginFailed: 'Erro no login.',
        sessionExpired: 'A túa sesión caducou. Por favor, inicia sesión de novo.',
        invalidCredentials: 'Verifica as túas credenciais.',
        authError: 'Produciuse un erro ao autenticar'
      }
    },
    dashboard: {
      tabs: {
        students: 'Alumnos',
        classes: 'Clases',
        subjects: 'Materias',
        skills: 'Competencias',
        schedule: 'Calendario',
        timetable: 'Horario',
        settings: 'Configuración',
        schools: 'Colexios'
      },
      logout: 'Pechar Sesión',
      classes: {
        noClasses: 'Non hai clases dispoñibles',
        loadError: 'Erro ao cargar as clases',
        schoolYear: 'Ano escolar',
        addClass: 'Engadir Clase',
        edit: 'Editar',
        delete: 'Eliminar',
        createTitle: 'Crear Clase',
        editTitle: 'Editar Clase',
        name: 'Nome',
        namePlaceholder: 'Ex: 1º ESO A',
        schoolYearPlaceholder: 'Ex: 24/25',
        create: 'Crear',
        update: 'Actualizar',
        createSuccess: 'Clase creada correctamente',
        updateSuccess: 'Clase actualizada correctamente',
        deleteSuccess: 'Clase eliminada correctamente',
        createError: 'Erro ao crear a clase',
        updateError: 'Erro ao actualizar a clase',
        deleteError: 'Erro ao eliminar a clase',
        deleteTitle: 'Eliminar clase',
        deleteConfirm: 'Está seguro de que desexa eliminar a clase "{name}"? Esta acción non se pode desfacer.',
        noClassesInSchool: 'Este colexio non ten clases aínda. Fai clic en "Engadir Clase" para crear unha.',
        searchPlaceholder: 'Buscar colexio ou clase...',
        noSchoolsFound: 'Non se atoparon colexios ou clases con ese nome',
        showFilter: 'Amosar filtros',
        hideFilter: 'Ocultar filtros',
        searchBy: 'Buscar por',
        filterBySchool: 'Colexio',
        filterByClass: 'Clase',
        filterByTown: 'Poboación',
        searchSchoolPlaceholder: 'Escribe o nome do colexio...',
        searchClassPlaceholder: 'Escribe o nome da clase...',
        searchTownPlaceholder: 'Escribe o nome da poboación...',
        clearFilter: 'Limpar filtro',
        clearAllFilters: 'Limpar filtros',
        validation: {
          nameRequired: 'O nome é obrigatorio',
          nameMinLength: 'O nome debe ter polo menos 3 caracteres',
          schoolYearRequired: 'O ano escolar é obrigatorio',
          schoolYearInvalid: 'O formato debe ser NN/NN (ex: 24/25)',
          schoolYearNotConsecutive: 'Os números do ano escolar deben ser consecutivos (ex: 24/25)',
          schoolRequired: 'Debe seleccionar un colexio',
        },
      },
      schools: {
        title: 'Xestión de Colexios',
        subtitle: 'Administra os teus colexios e visualiza información clave',
        addNew: 'Crear Colexio',
        edit: 'Editar',
        editTitle: 'Editar Colexio',
        list: 'Lista de Colexios',
        name: 'Nome',
        town: 'Localidade',
        phone: 'Teléfono',
        namePlaceholder: 'Nome do colexio',
        townPlaceholder: 'Localidade (opcional)',
        phonePlaceholder: '123456789',
        formDescription: 'Completa o formulario para crear un novo colexio. Os campos marcados con * son obrigatorios.',
        submit: 'Crear Colexio',
        update: 'Actualizar Colexio',
        cancel: 'Cancelar',
        noSchools: 'Non hai colexios rexistrados',
        addFirstSchool: 'Fai clic en "Crear Novo Colexio" para comezar',
        createSuccess: 'Colexio creado exitosamente',
        updateSuccess: 'Colexio actualizado exitosamente',
        createError: 'Erro ao crear o colexio',
        updateError: 'Erro ao actualizar o colexio',
        validation: {
          nameRequired: 'O nome é obrigatorio',
          nameMinLength: 'O nome debe ter polo menos 5 caracteres',
          phoneInvalid: 'O teléfono debe ter exactamente 9 díxitos'
        },
        delete: 'Eliminar',
        deleteTitle: 'Eliminar colexio',
        deleteConfirm: 'Está seguro de que quere dar de baixa o colexio "{name}"? Esta acción non se pode desfacer.',
        deleteConfirmBtn: 'Si, eliminar',
        deleteError: 'Erro ao eliminar o colexio',
      },
      subjects: {
        title: 'Xestión de Materias',
        addNew: 'Crear Materia',
        name: 'Nome',
        namePlaceholder: 'Nome da materia',
        edit: 'Editar',
        delete: 'Eliminar',
        createTitle: 'Crear Materia',
        editTitle: 'Editar Materia',
        create: 'Crear',
        update: 'Actualizar',
        createSuccess: 'Materia creada correctamente',
        updateSuccess: 'Materia actualizada correctamente',
        deleteSuccess: 'Materia eliminada correctamente',
        createError: 'Erro ao crear a materia',
        updateError: 'Erro ao actualizar a materia',
        deleteError: 'Erro ao eliminar a materia',
        loadError: 'Erro ao cargar as materias',
        noSubjects: 'Non hai materias rexistradas',
        deleteTitle: 'Eliminar materia',
        deleteConfirm: 'Está seguro de que desexa eliminar a materia "{name}"? Esta acción non se pode desfacer.',
        searchSubjects: 'Buscar materias...',
        noResults: 'Non se atoparon materias',
        gridView: 'Vista en cuadrícula',
        listView: 'Vista en lista',
        validation: {
          nameRequired: 'O nome é obrigatorio',
          nameMinLength: 'O nome debe ter polo menos 3 caracteres',
        },
      },
      skills: {
        title: 'Xestión de Competencias',
        addNew: 'Crear Competencia',
        titleLabel: 'Título',
        titlePlaceholder: 'Título da competencia',
        description: 'Descrición',
        descriptionPlaceholder: 'Descrición da competencia',
        edit: 'Editar',
        delete: 'Eliminar',
        createTitle: 'Crear Competencia',
        editTitle: 'Editar Competencia',
        create: 'Crear',
        update: 'Actualizar',
        createSuccess: 'Competencia creada correctamente',
        updateSuccess: 'Competencia actualizada correctamente',
        deleteSuccess: 'Competencia eliminada correctamente',
        createError: 'Erro ao crear a competencia',
        updateError: 'Erro ao actualizar a competencia',
        deleteError: 'Erro ao eliminar a competencia',
        loadError: 'Erro ao cargar as competencias',
        noSkills: 'Non hai competencias rexistradas',
        deleteTitle: 'Eliminar competencia',
        deleteConfirm: 'Está seguro de que desexa eliminar a competencia "{name}"? Esta acción non se pode desfacer.',
        searchSkills: 'Buscar competencias...',
        noResults: 'Non se atoparon competencias',
        gridView: 'Vista en cuadrícula',
        listView: 'Vista en lista',
        validation: {
          titleRequired: 'O título é obrigatorio',
          titleMinLength: 'O título debe ter polo menos 3 caracteres',
          titleMaxLength: 'O título non pode superar os 200 caracteres',
          descriptionMaxLength: 'A descrición non pode superar os 200 caracteres',
        },
        rubrics: {
          modalTitle: 'Rúbricas de Competencia',
          manageRubrics: 'Xestionar rúbricas',
          createRubric: 'Crear Rúbrica',
          editRubric: 'Editar Rúbrica',
          deleteRubric: 'Eliminar Rúbrica',
          rubricTitle: 'Título',
          rubricTitlePlaceholder: 'Título da rúbrica',
          noRubrics: 'Non hai rúbricas rexistradas',
          criteria: 'criterios',
          addCriterion: 'Engadir Criterio',
          editCriterion: 'Editar Criterio',
          deleteCriterion: 'Eliminar Criterio',
          criterionDescription: 'Descrición',
          criterionDescriptionPlaceholder: 'Descrición do criterio',
          gradeStart: 'Nota inicio',
          gradeEnd: 'Nota fin',
          qualification: 'Cualificación',
          qualificationPlaceholder: 'Ex: Insuficiente, Ben, Notable...',
          noCriteria: 'Non hai criterios rexistrados',
          deleteRubricTitle: 'Eliminar rúbrica',
          deleteRubricConfirm: 'Está seguro de que desexa eliminar a rúbrica "{name}"? Eliminaranse tamén todos os seus criterios. Esta acción non se pode desfacer.',
          deleteCriterionTitle: 'Eliminar criterio',
          deleteCriterionConfirm: 'Está seguro de que desexa eliminar o criterio "{name}"? Esta acción non se pode desfacer.',
          createRubricSuccess: 'Rúbrica creada correctamente',
          createRubricError: 'Erro ao crear a rúbrica',
          updateRubricSuccess: 'Rúbrica actualizada correctamente',
          updateRubricError: 'Erro ao actualizar a rúbrica',
          deleteRubricSuccess: 'Rúbrica eliminada correctamente',
          deleteRubricError: 'Erro ao eliminar a rúbrica',
          createCriterionSuccess: 'Criterio creado correctamente',
          createCriterionError: 'Erro ao crear o criterio',
          updateCriterionSuccess: 'Criterio actualizado correctamente',
          updateCriterionError: 'Erro ao actualizar o criterio',
          deleteCriterionSuccess: 'Criterio eliminado correctamente',
          deleteCriterionError: 'Erro ao eliminar o criterio',
          loadError: 'Erro ao cargar as rúbricas',
          validation: {
            titleRequired: 'O título é obrigatorio',
            titleMaxLength: 'O título non pode superar os 200 caracteres',
            descriptionRequired: 'A descrición é obrigatoria',
            descriptionMaxLength: 'A descrición non pode superar os 200 caracteres',
            gradeEndGreaterOrEqual: 'A nota fin debe ser maior ou igual á nota inicio',
            gradeOverlap: 'O rango de notas solápase con outro criterio existente',
          },
        },
      },
      classSubjects: {
        title: 'Materias da Clase',
        assignedSubjects: 'Materias asignadas',
        availableSubjects: 'Materias dispoñibles',
        assignSelected: 'Asignar seleccionadas',
        noAssignedSubjects: 'Non hai materias asignadas a esta clase',
        noAvailableSubjects: 'Non hai máis materias dispoñibles para asignar',
        assignSuccess: 'Materias asignadas correctamente',
        removeSuccess: 'Materia eliminada da clase',
        assignError: 'Erro ao asignar materias',
        removeError: 'Erro ao eliminar materia da clase',
        manageSubjects: 'Xestionar Materias',
        searchAvailable: 'Buscar materias...',
        selectAll: 'Seleccionar todas',
        deselectAll: 'Deseleccionar todas',
        confirmRemoveTitle: 'Eliminar materia da clase',
        confirmRemoveMessage: 'Está seguro de que desexa eliminar a materia "{name}" desta clase? Perderanse todos os criterios de avaliación asociados a esta clase e materia.',
        confirmRemoveBtn: 'Si, eliminar',
      },
      schedule: {
        title: 'Horario Escolar',
        addEntry: 'Engadir Horario',
        editEntry: 'Editar Horario',
        noClassSelected: 'Selecciona unha clase para ver o horario',
        noEntries: 'Non hai horarios rexistrados para esta clase',
        time: 'Hora',
        subject: 'Materia',
        start: 'Hora inicio',
        end: 'Hora fin',
        day: 'Día',
        monday: 'Luns',
        tuesday: 'Martes',
        wednesday: 'Mércores',
        thursday: 'Xoves',
        friday: 'Venres',
        selectDay: 'Selecciona un día',
        selectSubject: 'Selecciona unha materia',
        createSuccess: 'Horario creado correctamente',
        updateSuccess: 'Horario actualizado correctamente',
        deleteSuccess: 'Horario eliminado correctamente',
        loadError: 'Erro ao cargar os horarios',
        createError: 'Erro ao crear o horario',
        updateError: 'Erro ao actualizar o horario',
        deleteError: 'Erro ao eliminar o horario',
        deleteTitle: 'Eliminar horario',
        deleteConfirm: 'Está seguro de que desexa eliminar este horario? Esta acción non se pode desfacer.',
        validation: {
          startRequired: 'A hora de inicio é obrigatoria',
          endRequired: 'A hora de fin é obrigatoria',
          endAfterStart: 'A hora de fin debe ser posterior á de inicio',
          subjectRequired: 'Debe seleccionar unha materia',
          dayRequired: 'Debe seleccionar un día',
          noOverlap: 'Os horarios non poden solaparse',
        },
        addItem: 'Engadir materia',
        removeItem: 'Eliminar',
      },
      students: {
        allStudents: 'Todos os Alumnos',
        classStudents: 'Alumnos da Clase',
        addStudent: 'Engadir Alumno',
        editStudent: 'Editar Alumno',
        name: 'Nome',
        surnames: 'Apelidos',
        dateOfBirth: 'Data de Nacemento',
        additionalInfo: 'Información Adicional',
        gender: 'Xénero',
        genderMale: 'Masculino',
        genderFemale: 'Feminino',
        genderPlaceholder: 'Seleccionar xénero',
        shape: 'Figura',
        shapeSquare: 'Cadrado',
        shapeCircle: 'Círculo',
        shapeTriangle: 'Triángulo',
        photo: 'Foto',
        uploadPhoto: 'Subir Foto',
        deletePhoto: 'Eliminar Foto',
        namePlaceholder: 'Nome do alumno',
        surnamesPlaceholder: 'Apelidos do alumno',
        additionalInfoPlaceholder: 'Notas adicionais sobre o alumno...',
        assignToClass: 'Asignar a Clase',
        removeFromClass: 'Quitar de Clase',
        addToThisClass: 'Engadir a esta Clase',
        searchStudents: 'Buscar alumnos...',
        gridView: 'Vista en cuadrícula',
        listView: 'Vista en lista',
        confirmAssignTitle: 'Confirmar Asignación',
        confirmAssignMessage: 'Desexas engadir este alumno á clase actual?',
        confirmAssign: 'Engadir a Clase',
        removeFromClassTitle: 'Quitar Alumno da Clase',
        confirmRemoveMessage: 'Está seguro de que desexa quitar a {studentName} da clase "{className}"? Perderanse todas as súas notas asociadas a esta clase.',
        confirmRemove: 'Quitar de Clase',
        school: 'Colexio',
        class: 'Clase',
        noStudents: 'Non hai alumnos rexistrados',
        noStudentsInClass: 'Non hai alumnos nesta clase',
        createSuccess: 'Alumno creado correctamente',
        updateSuccess: 'Alumno actualizado correctamente',
        assignSuccess: 'Alumno asignado á clase correctamente',
        removeSuccess: 'Alumno quitado da clase correctamente',
        photoUploadSuccess: 'Foto subida correctamente',
        photoDeleteSuccess: 'Foto eliminada correctamente',
        createError: 'Erro ao crear o alumno',
        updateError: 'Erro ao actualizar o alumno',
        loadError: 'Erro ao cargar os alumnos',
        assignError: 'Erro ao asignar o alumno á clase',
        removeError: 'Erro ao quitar o alumno da clase',
        photoUploadError: 'Erro ao subir a foto',
        photoDeleteError: 'Erro ao eliminar a foto',
        assignedClasses: 'Clases asignadas',
        noClassesAssigned: 'Sen clases asignadas',
        selectSchoolAndClass: 'Seleccionar Colexio e Clase',
        selectSchool: 'Seleccionar colexio',
        selectClass: 'Seleccionar clase',
        deleteStudent: 'Eliminar Alumno',
        birthdayToday: 'Hoxe é o seu aniversario! 🎂',
        deleteTitle: 'Eliminar alumno',
        deleteConfirm: 'Está seguro de que desexa eliminar o alumno "{name}"? Esta acción non se pode desfacer.',
        deleteSuccess: 'Alumno eliminado correctamente',
        deleteError: 'Erro ao eliminar o alumno',
        validation: {
          nameRequired: 'O nome é obrigatorio',
          surnamesRequired: 'Os apelidos son obrigatorios',
          dateOfBirthRequired: 'A data de nacemento é obrigatoria',
          dateOfBirthInvalid: 'A data de nacemento non pode ser futura',
          genderRequired: 'O xénero é obrigatorio',
          fileTooLarge: 'O arquivo é demasiado grande. Máximo 5MB',
          fileInvalidType: 'Tipo de arquivo non válido. Só se permiten imaxes JPEG e PNG',
        },
      },
      loadingData: 'Cargando datos...',
      evalCriteria: {
        title: 'Criterios de avaliación',
        selectSubject: 'Seleccionar materia',
        quarter: 'Trimestre',
        quarter1: 'Trimestre 1',
        quarter2: 'Trimestre 2',
        quarter3: 'Trimestre 3',
        createExercise: 'Crear',
        editExercise: 'Editar',
        editGrade: 'Editar Nota',
        createGrade: 'Engadir Nota',
        exerciseTitle: 'Título do criterio de avaliación',
        exerciseTitlePlaceholder: 'Ex: Exame unidade 3',
        description: 'Descrición',
        descriptionPlaceholder: 'Descrición opcional...',
        percentageGrade: 'Porcentaxe nota final',
        maxGrade: 'Nota máxima',
        grade: 'Nota',
        noExercises: 'Non hai criterios de avaliación para esta materia e trimestre',
        noClassSelected: 'Selecciona unha clase para ver os criterios de avaliación',
        selectSubjectFirst: 'Non hai materias asignadas a esta clase',
        noGrade: 'Sen nota',
        student: 'Alumno',
        total: 'Total',
        documents: 'Documentos',
        uploadDocument: 'Subir Documento',
        documentFile: 'Arquivo',
        documentDescription: 'Descrición do documento',
        documentDescriptionPlaceholder: 'Descrición do documento...',
        noDocuments: 'Non hai documentos adxuntos',
        downloadDocument: 'Descargar',
        downloadError: 'Erro ao descargar o documento',
        editDescription: 'Editar descrición',
        deleteDocument: 'Eliminar documento',
        deleteDocumentTitle: 'Eliminar documento',
        deleteDocumentConfirm: 'Está seguro de que desexa eliminar o documento "{name}"? Esta acción non se pode desfacer.',
        deleteExerciseTitle: 'Eliminar criterio de avaliación',
        deleteExerciseConfirm: 'Está seguro de que desexa eliminar o criterio de avaliación "{name}"? Eliminaranse tamén todas as súas notas e documentos. Esta acción non se pode desfacer.',
        deleteGradeTitle: 'Eliminar nota',
        deleteGradeConfirm: 'Está seguro de que desexa eliminar a nota do criterio de avaliación "{name}"? Esta acción non se pode desfacer.',
        createExerciseSuccess: 'Criterio de avaliación creado correctamente',
        createExerciseError: 'Erro ao crear o criterio de avaliación',
        updateExerciseSuccess: 'Criterio de avaliación actualizado correctamente',
        updateExerciseError: 'Erro ao actualizar o criterio de avaliación',
        deleteExerciseSuccess: 'Criterio de avaliación eliminado correctamente',
        deleteExerciseError: 'Erro ao eliminar o criterio de avaliación',
        createGradeSuccess: 'Nota creada correctamente',
        createGradeError: 'Erro ao crear a nota',
        updateGradeSuccess: 'Nota actualizada correctamente',
        updateGradeError: 'Erro ao actualizar a nota',
        deleteGradeSuccess: 'Nota eliminada correctamente',
        deleteGradeError: 'Erro ao eliminar a nota',
        uploadDocumentSuccess: 'Documento subido correctamente',
        uploadDocumentError: 'Erro ao subir o documento',
        deleteDocumentSuccess: 'Documento eliminado correctamente',
        deleteDocumentError: 'Erro ao eliminar o documento',
        updateDescriptionSuccess: 'Descrición actualizada correctamente',
        updateDescriptionError: 'Erro ao actualizar a descrición',
        loadError: 'Erro ao cargar os datos de criterios de avaliación',
        exerciseInfo: 'Información do criterio de avaliación',
        exportGrades: 'Exportar Excel',
        exportGradesError: 'Erro ao exportar os criterios de avaliación',
        viewStudentGrades: 'Ver notas',
        studentGradesTitle: 'Notas de {name}',
        subjectAverage: 'Media',
        quarterAverage: 'Media do trimestre',
        finalGrade: 'Nota Final',
        noGradesForStudent: 'Non hai notas rexistradas para este alumno',
        gradeDocuments: 'Documentos da nota',
        gradeDocumentsTitle: '{student} - {exercise}',
        groupWork: {
          title: 'Traballos en grupo',
          assignment: 'Traballo',
          group: 'Grupo',
          grade: 'Nota',
          noGroupWork: 'Non hai traballos en grupo para esta clase',
          notInGroup: 'Sen grupo asignado',
          noGrade: 'Sen nota',
          quarter: 'Trimestre',
        },
        chart: {
          title: 'Distribución de notas',
          failing: 'Suspenso',
          sufficient: 'Suficiente',
          good: 'Ben',
          remarkable: 'Notable',
          outstanding: 'Sobresaínte',
          noGrade: 'Sen nota',
          studentsCount: 'Alumnos',
          noDataForChart: 'Non hai datos para amosar a gráfica',
        },
        radarChart: {
          title: 'Gráfica de rendemento',
          noDataForChart: 'Non hai materias para amosar a gráfica',
          quarter1: 'T1',
          quarter2: 'T2',
          quarter3: 'T3',
          finalGrade: 'Final',
        },
        validation: {
          titleRequired: 'O título é obrigatorio',
          titleMaxLength: 'O título non pode superar os 60 caracteres',
          quarterRequired: 'O trimestre é obrigatorio',
          percentageRequired: 'A porcentaxe é obrigatoria',
          percentageRange: 'A porcentaxe debe estar entre 1 e 100',
          percentageExceeds: 'A porcentaxe máxima dispoñible é {available}%',
          maxGradeRequired: 'A nota máxima é obrigatoria',
          maxGradeRange: 'A nota máxima debe estar entre 1 e 20',
          gradeRequired: 'A nota é obrigatoria',
          gradeRange: 'A nota debe estar entre 0 e {max}',
          fileRequired: 'Debe seleccionar un arquivo',
          fileTooLarge: 'O arquivo é demasiado grande. Máximo 2MB',
        },
      },
      classRubrics: {
        title: 'Rúbricas',
        selectSkill: 'Competencia',
        manageClassRubrics: 'Xestionar Rúbricas',
        assignRubric: 'Asignar Rúbrica',
        removeRubric: 'Desasignar Rúbrica',
        noClassSelected: 'Selecciona unha clase para ver as rúbricas',
        noSkills: 'Non hai competencias rexistradas',
        noRubricsForSkill: 'Non hai rúbricas asignadas para esta competencia',
        noStudentsInClass: 'Non hai alumnos nesta clase',
        assignCriterion: 'Asignar Criterio',
        removeCriterion: 'Eliminar Criterio',
        removeCriterionTitle: 'Eliminar criterio',
        removeCriterionConfirm: 'Está seguro de que desexa eliminar o criterio deste alumno?',
        removeRubricTitle: 'Desasignar rúbrica',
        removeRubricConfirm: 'Está seguro de que desexa desasignar a rúbrica "{name}"? Eliminaranse os criterios asignados aos alumnos.',
        assignSuccess: 'Criterio asignado correctamente',
        assignError: 'Erro ao asignar o criterio',
        removeSuccess: 'Criterio eliminado correctamente',
        removeError: 'Erro ao eliminar o criterio',
        rubricAssignSuccess: 'Rúbrica asignada á clase',
        rubricAssignError: 'Erro ao asignar a rúbrica',
        rubricRemoveSuccess: 'Rúbrica desasignada da clase',
        rubricRemoveError: 'Erro ao desasignar a rúbrica',
        loadError: 'Erro ao cargar as rúbricas',
        selectCriterion: 'Seleccionar criterio',
        noCriteriaAvailable: 'Non hai criterios dispoñibles para esta rúbrica',
        availableRubrics: 'Rúbricas dispoñibles',
        assigned: 'Asignada',
        notAssigned: 'Non asignada',
        noCriterion: 'Sen criterio',
        student: 'Alumno',
        viewStudentCriteria: 'Ver rúbricas',
        studentCriteriaSummary: 'Resumo de rúbricas',
        noCriteriaForStudent: 'Este alumno non ten criterios asignados',
        skill: 'Competencia',
        chart: {
          title: 'Distribución de criterios',
          noDataForChart: 'Non hai datos para amosar a gráfica',
        },
      },
      attendance: {
        title: 'Asistencia',
        subject: 'Materia',
        fullDayAbsence: 'Ausencia día completo',
        fullDayConfirm: 'Marcar ausencia en todas as materias para {studentName} o día {date}?',
        absenceCount: 'Total',
        noClassSelected: 'Selecciona unha clase para ver a asistencia',
        noSubjectsInClass: 'Non hai materias asignadas a esta clase',
        createError: 'Erro ao rexistrar a ausencia',
        deleteError: 'Erro ao eliminar a ausencia',
        selectStudent: 'Seleccionar alumno',
        selectDate: 'Seleccionar data',
        absenceCreated: 'Ausencia rexistrada correctamente',
        absenceDeleted: 'Ausencia eliminada correctamente',
        fullDayCreated: 'Ausencia de día completo rexistrada',
        noSubjectsForDay: 'Non hai materias programadas para ese día',
        today: 'Hoxe',
        monthNames: ['Setembro', 'Outubro', 'Novembro', 'Decembro', 'Xaneiro', 'Febreiro', 'Marzo', 'Abril', 'Maio', 'Xuño'],
        dayAbbreviations: ['Lu', 'Ma', 'Me', 'Xo', 'Ve', 'Sá', 'Do'],
        summaryTitle: 'Resumo de faltas',
        summaryError: 'Erro ao obter as faltas do alumno',
        noAbsences: 'Este alumno non ten faltas rexistradas',
        totalAbsences: 'Total de faltas',
        bySubject: 'Por materia',
        byMonth: 'Por mes',
        viewAbsences: 'Ver faltas',
      },
      cooperative: {
        title: 'Cooperativo',
        generateGroups: 'Xerar grupos',
        saveGroups: 'Gardar',
        updateGroups: 'Actualizar',
        deleteAllGroups: 'Eliminar todos',
        deleteAllTitle: 'Eliminar todos os grupos',
        deleteAllConfirm: 'Está seguro de que desexa eliminar todos os grupos desta clase? Esta acción non se pode desfacer.',
        allGroupsLabel: 'todos os grupos',
        choosePriority: 'Elixir prioridade',
        priorityDescription: 'Que criterio desexas priorizar para formar os grupos?',
        prioritizeShape: 'Priorizar figura',
        prioritizeGender: 'Priorizar xénero',
        groupName: 'Grupo',
        groupNamePlaceholder: 'Nome do grupo',
        noGroups: 'Non hai grupos creados',
        noGroupsHint: 'Preme "Xerar grupos" para crear grupos automaticamente',
        noClassSelected: 'Selecciona unha clase para xestionar os grupos',
        dragHint: 'Arrastra alumnos aquí',
        unassignedStudents: 'Alumnos sen asignar',
        unassignedCount: '{count} alumnos sen asignar a ningún grupo',
        allStudentsMustBeAssigned: 'Todos os alumnos deben estar asignados a un grupo para poder gardar',
        saveSuccess: 'Grupos gardados correctamente',
        saveError: 'Erro ao gardar os grupos',
        deleteSuccess: 'Grupos eliminados correctamente',
        deleteError: 'Erro ao eliminar os grupos',
        loadError: 'Erro ao cargar os grupos',
        generateError: 'Erro ao xerar os grupos',
        generateDisabledHint: 'Elimina os grupos gardados antes de xerar novos',
        groupSizeError: 'Cada grupo debe ter entre 3 e 4 membros',
        reloadGroups: 'Recargar grupos',
        collapseGroups: 'Ocultar grupos',
        expandGroups: 'Amosar grupos',
        groupAssignments: {
          title: 'Traballos cooperativos',
          addAssignment: 'Novo traballo',
          editAssignment: 'Editar traballo',
          deleteAssignment: 'Eliminar traballo',
          deleteAssignmentConfirm: 'Está seguro de que desexa eliminar o traballo "{name}"? Eliminaranse tamén as notas e documentos asociados.',
          assignmentTitle: 'Título',
          assignmentTitlePlaceholder: 'Título do traballo...',
          assignmentDescription: 'Descrición',
          assignmentDescriptionPlaceholder: 'Descrición opcional...',
          quarter: 'Trimestre',
          grades: 'Notas',
          grade: 'Nota',
          gradePlaceholder: '0-10',
          gradeRange: 'A nota debe estar entre 0 e 10',
          saveGrade: 'Gardar nota',
          deleteGrade: 'Eliminar nota',
          documents: 'Documentos',
          assignmentDocuments: 'Documentos do traballo',
          groupDocuments: 'Documentos do grupo',
          noDocuments: 'Non hai documentos',
          uploadDocument: 'Subir documento',
          downloadDocument: 'Descargar documento',
          deleteDocument: 'Eliminar documento',
          deleteDocumentTitle: 'Eliminar documento',
          deleteDocumentConfirm: 'Está seguro de que desexa eliminar este documento? Esta acción non se pode desfacer.',
          noAssignments: 'Non hai traballos cooperativos',
          noAssignmentsHint: 'Crea un novo traballo para asignar notas e documentos aos grupos',
          needSavedGroups: 'Debes ter grupos gardados para xestionar traballos cooperativos',
          createSuccess: 'Traballo creado correctamente',
          updateSuccess: 'Traballo actualizado correctamente',
          deleteSuccess: 'Traballo eliminado correctamente',
          createError: 'Erro ao crear o traballo',
          updateError: 'Erro ao actualizar o traballo',
          deleteError: 'Erro ao eliminar o traballo',
          gradeSuccess: 'Nota gardada correctamente',
          gradeError: 'Erro ao gardar a nota',
          gradeDeleteSuccess: 'Nota eliminada correctamente',
          gradeDeleteError: 'Erro ao eliminar a nota',
          loadError: 'Erro ao cargar os traballos',
          uploadSuccess: 'Documento subido correctamente',
          uploadError: 'Erro ao subir o documento',
          downloadError: 'Erro ao descargar o documento',
          deleteDocError: 'Erro ao eliminar o documento',
          validation: {
            titleRequired: 'O título é obrigatorio',
            quarterRequired: 'O trimestre é obrigatorio',
            gradeRange: 'A nota debe estar entre 0 e 10',
            fileRequired: 'Selecciona un arquivo',
            fileTooLarge: 'O arquivo non pode superar os 2MB',
          },
        },
      },
      calendar: {
        title: 'Calendario',
        newAlert: 'Nova Alerta',
        editAlert: 'Editar Alerta',
        alertTitle: 'Título',
        alertTitlePlaceholder: 'Título da alerta...',
        alertDescription: 'Descrición',
        alertDescriptionPlaceholder: 'Descrición opcional...',
        alertDate: 'Data',
        alertStartTime: 'Hora de inicio',
        alertEndTime: 'Hora de fin',
        moreEvents: '+{n} máis',
        months: [
          'Xaneiro', 'Febreiro', 'Marzo', 'Abril', 'Maio', 'Xuño',
          'Xullo', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Decembro'
        ],
        daysShort: ['Lun', 'Mar', 'Mér', 'Xov', 'Ven', 'Sáb', 'Dom'],
        createSuccess: 'Alerta creada correctamente',
        updateSuccess: 'Alerta actualizada correctamente',
        deleteSuccess: 'Alerta eliminada correctamente',
        loadError: 'Erro ao cargar as alertas',
        createError: 'Erro ao crear a alerta',
        updateError: 'Erro ao actualizar a alerta',
        deleteError: 'Erro ao eliminar a alerta',
        deleteTitle: 'Eliminar alerta',
        deleteConfirm: 'Está seguro de que desexa eliminar a alerta "{name}"? Esta acción non se pode desfacer.',
        todayAlerts: 'Alertas de hoxe',
        goToCalendar: 'Ir ao calendario',
        addAlertOn: 'Engadir alerta o {date}',
        previousMonth: 'Mes anterior',
        nextMonth: 'Mes seguinte',
        selectMonth: 'Seleccionar mes',
        selectYear: 'Seleccionar ano',
        close: 'Pechar',
        moveSuccess: 'Alerta movida correctamente',
        moveError: 'Erro ao mover a alerta',
        validation: {
          titleRequired: 'O título é obrigatorio',
          titleMaxLength: 'O título non pode superar os 100 caracteres',
          dateRequired: 'A data é obrigatoria',
          endTimeRequiresStart: 'Debes indicar hora de inicio se engades hora de fin',
          endTimeAfterStart: 'A hora de fin debe ser posterior á hora de inicio',
        },
      },
      errors: {
        noSchools: 'Non se atoparon colexios.',
        loadSchoolsError: 'Erro ao cargar os colexios. Por favor, inténtao de novo.'
      }
    },
    loading: {
      title: 'Cargando...',
      subtitle: 'Por favor, agarda un momento'
    },
    common: {
      loading: 'Cargando',
      error: 'Erro',
      success: 'Éxito',
      cancel: 'Cancelar',
      save: 'Gardar',
      delete: 'Eliminar',
      edit: 'Editar',
      close: 'Pechar',
      print: 'Imprimir',
      language: {
        es: 'ESPAÑOL',
        en: 'INGLÉS',
        ga: 'GALEGO'
      }
    },
    update: {
      downloading: 'Descargando nova versión...',
      ready: 'Nova versión lista. Reinicia para actualizar.',
      installNow: 'Reiniciar e actualizar',
      error: 'Erro ao buscar actualizacións.',
      checkManually: 'Buscar actualizacións',
      upToDate: 'A aplicación está actualizada.',
      version: 'Versión'
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
    return (stored === 'es' || stored === 'en' || stored === 'ga') ? stored : 'es';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[locale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
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

export function getCurrentLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  return (stored === 'es' || stored === 'en' || stored === 'ga') ? stored : 'es';
}
