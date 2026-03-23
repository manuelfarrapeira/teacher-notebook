# 📚 Teacher Notebook

<p align="center">
  <img src="public/favicon.png" alt="Teacher Notebook Logo" width="120" />
</p>

<p align="center">
  <strong>Aplicación de escritorio para la gestión académica integral de docentes</strong>
</p>

<p align="center">
  <a href="#-características">Características</a> •
  <a href="#-stack-tecnológico">Stack</a> •
  <a href="#-instalación">Instalación</a> •
  <a href="#-uso">Uso</a> •
  <a href="#-estructura-del-proyecto">Estructura</a> •
  <a href="#-licencia">Licencia</a>
</p>

---

## 📋 Descripción

**Teacher Notebook** es una aplicación de escritorio multiplataforma construida con **Electron**, **React** y **TypeScript** que ofrece una solución completa de gestión académica para profesores. Permite administrar escuelas, clases, estudiantes, asignaturas, horarios, calendario, calificaciones y criterios de evaluación desde una interfaz moderna, intuitiva y multiidioma.

---

## ✨ Características

### 🔐 Autenticación y Seguridad
- Inicio de sesión seguro con autenticación **JWT** (JSON Web Tokens)
- Gestión automática de sesiones con expiración y logout automático
- Almacenamiento seguro de tokens en `sessionStorage`
- Manejo centralizado de errores de autenticación

### 🌍 Internacionalización (i18n)
- Soporte completo para **Español** e **Inglés**
- Cambio de idioma en tiempo real desde cualquier pantalla
- Persistencia de preferencia de idioma en `localStorage`
- Todas las cadenas de texto gestionadas a través del sistema i18n

### 🏫 Gestión de Escuelas
- **CRUD completo** de centros educativos (crear, leer, actualizar, eliminar)
- Registro de nombre, localidad y teléfono de cada escuela
- Visualización de todas las escuelas del docente
- Validación de formularios con feedback visual en tiempo real

### 📚 Gestión de Clases
- Creación y administración de clases por escuela y año escolar
- Asignación de asignaturas a cada clase
- Filtrado y búsqueda de clases
- Selector de escuela y clase integrado en la barra superior

### 📖 Gestión de Asignaturas
- **CRUD completo** de asignaturas
- Búsqueda de asignaturas por nombre
- Vista en modo **cuadrícula** o **lista** (con persistencia de preferencia)
- Asignación de asignaturas a clases mediante modal dedicado

### 🎓 Gestión de Competencias
- **CRUD completo** de competencias (crear, leer, actualizar, eliminar)
- Título y descripción con límite de 200 caracteres
- Búsqueda de competencias por título o descripción
- Vista en modo **cuadrícula** o **lista** (con persistencia de preferencia)
- Descripción visible debajo del título en la lista
- **Gestión de rúbricas** por competencia: crear, editar y eliminar rúbricas asociadas a cada competencia
- **Gestión de criterios de evaluación** por rúbrica: crear, editar y eliminar criterios con rango de notas (0–10) y descripción
- **Acordeón** para expandir/colapsar criterios dentro de cada rúbrica
- **Validación de solapamiento** de rangos de notas entre criterios de una misma rúbrica

### 👨‍🎓 Gestión de Estudiantes
- **CRUD completo** de estudiantes con datos personales (nombre, apellidos, fecha de nacimiento, género, info adicional)
- **Fotografía de perfil**: subida, visualización y eliminación de fotos con caché inteligente y carga lazy (Intersection Observer)
- **Figura identificativa** (opcional): asignación de una figura geométrica coloreada (🔴 círculo, 🔵 triángulo, 🟢 cuadrado) para identificación visual rápida en la vista de clase, mostrada como badge en la esquina superior derecha de cada tarjeta
- Asignación y desasignación de estudiantes a clases
- Vista por clase o vista global de todos los estudiantes
- Búsqueda y filtrado de estudiantes
- Vista en modo **cuadrícula** o **lista**
- Indicador de **cumpleaños** del estudiante 🎂
- Modal de detalle con información completa del estudiante

### 📝 Criterios de evaluación y Calificaciones
- Gestión de **criterios de evaluación** por asignatura y trimestre (Q1, Q2, Q3)
- Creación de criterios de evaluación con título, descripción, porcentaje de calificación y nota máxima
- **Calificación de estudiantes** por ejercicio con nota y descripción
- **Media ponderada automática** por asignatura y trimestre
- Indicadores visuales de rendimiento (😊 aprobado / 😞 suspenso)
- **Documentos adjuntos**: subida, descarga, edición y eliminación de documentos por ejercicio y por nota de alumno (máx. 2MB)
- Vista completa de calificaciones por estudiante con desglose por asignatura y **descarga de documentos adjuntos** a cada nota
- **Exportación** de datos de calificaciones

### 📋 Gestión de Asistencia
- **Tabla spreadsheet** con todos los días del curso escolar (sept → jun) parametrizado por año escolar
- Columna sticky con nombres de alumnos y contador de faltas
- Control de ausencias **por asignatura** mediante checkboxes
- **Ausencia de día completo** con un solo clic (marca todas las asignaturas)
- Fines de semana marcados en **rojo** y deshabilitados
- **Scroll automático** al día actual al entrar en la pestaña
- Cabecera agrupada por meses para fácil navegación

### 📋 Rúbricas de Clase
- **Tabla de rúbricas** por competencia y clase con alumnos como filas y rúbricas como columnas
- **Selector de competencias** para filtrar rúbricas asignadas a la clase
- **Asignación/desasignación** de rúbricas de competencias a clases desde un modal de gestión
- **Asignación de criterios** de evaluación a alumnos por rúbrica mediante modal de selección
- **Visualización** de rango de notas y descripción del criterio en tooltip
- Columna sticky de alumnos con zebra striping y resaltado de fila al pasar el ratón
- Eliminación de criterios asignados con confirmación

### 🤝 Trabajo Cooperativo (Grupos)
- **Generación automática de grupos** equilibrados de 3-4 alumnos por clase
- Opción de **priorizar diversidad por figura** (shape) o por **género** al generar grupos
- **Drag & drop nativo** (HTML5) para mover alumnos entre grupos manualmente
- **Edición de nombres** de grupo mediante input inline
- **Persistencia** de grupos: guardar, actualizar y eliminar grupos en el servidor
- **Validación de tamaño de grupo**: cada grupo debe tener entre 3 y 4 miembros; el badge de conteo se muestra en rojo si no se cumple
- **Validación de asignación completa**: el botón de guardar se deshabilita hasta que todos los alumnos estén asignados a un grupo y todos los grupos tengan tamaño válido
- Aviso visual cuando quedan alumnos sin asignar con zona de drop dedicada
- Botón de eliminación masiva de todos los grupos con confirmación
- Indicador visual del número de alumnos por grupo con **figura geométrica** (shape) visible
- Foto de perfil y nombre del alumno visibles en cada tarjeta de grupo

### 📅 Calendario Académico
- Calendario mensual interactivo con navegación por mes
- Creación, edición y eliminación de **alertas/eventos** del calendario
- Soporte para hora de inicio y fin en cada evento
- Visualización de múltiples eventos por día con indicadores visuales
- **Alertas del día**: modal automático al iniciar sesión que muestra los eventos activos del día
- Indicador de campana 🔔 en la barra superior cuando hay alertas activas

### 🕐 Horario Semanal
- Gestión de horarios de lunes a viernes por clase
- Asignación de asignaturas a franjas horarias por día
- Creación de múltiples bloques por día con validación de solapamientos
- Edición y eliminación de entradas individuales del horario
- Función de **impresión** del horario semanal
- Modal de gestión rápida de asignaturas de la clase

### ⚙️ Configuración
- Panel de configuración del sistema (en desarrollo)

### 🎨 Interfaz de Usuario
- **Diseño responsivo** adaptado a escritorio y móvil
- Barra lateral de navegación con tabs
- Barra superior con selectores de escuela/clase y menú de usuario
- **Tema visual consistente** con CSS centralizado y Tailwind CSS
- Sistema de modales reutilizables (error, éxito, confirmación de eliminación, carga)
- Animaciones y transiciones suaves
- Iconografía consistente con **Lucide React**
- Pantalla de login con elementos decorativos animados
- Pantalla de carga con spinner animado

### ♿ Accesibilidad
- Uso de HTML semántico (`<dialog>`, `<button>`, `<nav>`, etc.)
- Modales con elemento `<dialog>` nativo de HTML5
- Atributos `aria-label` en elementos interactivos
- Soporte de teclado para navegación y cierre de modales

---

## 🛠 Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| **Electron** | 39.2.6 | Framework para aplicación de escritorio multiplataforma |
| **React** | 19.x | Biblioteca de UI con componentes funcionales y hooks |
| **TypeScript** | ~4.5.4 | Tipado estático y seguridad en el código |
| **Vite** | ^5.4.21 | Bundler ultrarrápido y servidor de desarrollo |
| **Tailwind CSS** | ^4.1.18 | Framework CSS utilitario |
| **Radix UI** | Múltiples | Componentes accesibles y sin estilos predefinidos |
| **Lucide React** | ^0.561.0 | Librería de iconos SVG |
| **Recharts** | ^3.6.0 | Gráficos y visualizaciones |
| **date-fns** | ^4.1.0 | Utilidades de manejo de fechas |
| **Electron Forge** | ^7.10.2 | Herramientas de empaquetado y distribución |
| **PostCSS** | ^8.5.6 | Procesador CSS |

---

## 📦 Instalación

### Prerrequisitos

- **Node.js** >= 18.x
- **npm** o **yarn**

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/teacher-notebook.git
cd teacher-notebook

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (entorno local)
npm run start:local
```

---

## 🚀 Uso

### Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run start:local` | Ejecutar en modo desarrollo (API local) |
| `npm run start:pre` | Ejecutar contra entorno de preproducción |
| `npm run start:pro` | Ejecutar contra entorno de producción |
| `npm run package` | Empaquetar la aplicación |
| `npm run make` | Crear instalador para la plataforma actual |
| `npm run make:pre` | Crear instalador (preproducción) |
| `npm run make:pro` | Crear instalador (producción) |
| `npm run lint` | Ejecutar ESLint |

### Entornos

La aplicación soporta tres entornos configurables:

| Entorno | Variable | URL de API |
|---|---|---|
| Local | `VITE_ENV=local` | `http://localhost:8081` |
| Preproducción | `VITE_ENV=pre` | `https://codefm.synology.me:5553` |
| Producción | `VITE_ENV=pro` | `https://codefm.synology.me:4443` |

---

## 📁 Estructura del Proyecto

```
teacher-notebook/
├── src/
│   ├── components/                    # Componentes React
│   │   ├── Dashboard.tsx             # Componente principal del dashboard
│   │   ├── TopBar.tsx                # Barra superior con selectores
│   │   ├── Sidebar.tsx               # Barra lateral de navegación
│   │   ├── LoginScreen.tsx           # Pantalla de inicio de sesión
│   │   ├── LoadingScreen.tsx         # Pantalla de carga
│   │   ├── UserMenu.tsx              # Menú desplegable de usuario
│   │   ├── RefreshButton.tsx         # Botón de actualizar datos
│   │   │
│   │   ├── tabs/                     # Módulos del dashboard
│   │   │   ├── StudentsTab.tsx       # Gestión de estudiantes
│   │   │   ├── ClassesTab.tsx        # Gestión de clases
│   │   │   ├── SubjectsTab.tsx       # Gestión de asignaturas
│   │   │   ├── SkillsTab.tsx        # Gestión de competencias
│   │   │   ├── SchoolsTab.tsx        # Gestión de escuelas
│   │   │   ├── EvalCriteriaTab.tsx   # Criterios de evaluación y calificaciones
│   │   │   ├── ClassRubricsTab.tsx   # Rúbricas de clase por competencia
│   │   │   ├── AttendanceTab.tsx     # Gestión de asistencia
│   │   │   ├── CooperativeTab.tsx    # Trabajo cooperativo (grupos)
│   │   │   ├── ScheduleTab.tsx       # Calendario académico
│   │   │   ├── TimetableTab.tsx      # Horario semanal
│   │   │   └── SettingsTab.tsx       # Configuración
│   │   │
│   │   ├── selectors/                # Selectores especializados
│   │   │   ├── LanguageSelector.tsx  # Selector de idioma
│   │   │   ├── SchoolSelector.tsx    # Selector de escuela
│   │   │   └── ClassSelector.tsx     # Selector de clase
│   │   │
│   │   ├── modals/                   # Componentes modales
│   │   │   ├── StudentFormModal.tsx      # Formulario de estudiante
│   │   │   ├── StudentGradesModal.tsx    # Calificaciones del estudiante
│   │   │   ├── AssignToClassModal.tsx    # Asignar estudiante a clase
│   │   │   ├── ExerciseFormModal.tsx     # Formulario de ejercicio
│   │   │   ├── GradeFormModal.tsx        # Formulario de calificación
│   │   │   ├── DocumentsModal.tsx        # Gestión de documentos
│   │   │   ├── CalendarAlertFormModal.tsx # Formulario de alerta
│   │   │   ├── ClassSubjectsModal.tsx    # Asignaturas de clase
│   │   │   ├── TodayAlertsModal.tsx      # Alertas del día
│   │   │   ├── ErrorModal.tsx            # Modal de error
│   │   │   ├── SuccessModal.tsx          # Modal de éxito
│   │   │   ├── ConfirmDeleteModal.tsx    # Confirmación de eliminación
│   │   │   └── LoadingModal.tsx          # Modal de carga
│   │   │
│   │   ├── students/                 # Componentes de estudiantes
│   │   │   └── StudentPhoto.tsx      # Foto con lazy loading y caché
│   │   │
│   │   └── ui/                       # Componentes UI base (Radix UI)
│   │
│   ├── services/                     # Servicios de API REST
│   │   ├── BaseService.ts           # Clase base HTTP (JWT, errores, CRUD)
│   │   ├── AuthService.ts           # Autenticación (login/logout)
│   │   ├── SchoolService.ts         # Escuelas y clases
│   │   ├── ClassService.ts          # Operaciones de clases
│   │   ├── StudentService.ts        # Estudiantes y fotos
│   │   ├── SubjectService.ts        # Asignaturas
│   │   ├── SkillService.ts         # Competencias
│   │   ├── SkillRubricService.ts   # Rúbricas y criterios de competencias
│   │   ├── ClassRubricService.ts  # Rúbricas de clase y criterios de alumnos
│   │   ├── ExerciseService.ts       # Ejercicios, calificaciones y documentos
│   │   ├── StudentGroupService.ts   # Grupos cooperativos de alumnos
│   │   ├── CalendarAlertService.ts  # Alertas del calendario
│   │   └── ScheduleService.ts       # Horarios semanales
│   │
│   ├── contexts/                     # React Contexts
│   │   └── StudentPhotoContext.tsx   # Caché de fotos de estudiantes
│   │
│   ├── lib/                          # Utilidades
│   │   ├── i18n.tsx                 # Sistema de internacionalización
│   │   └── utils.ts                 # Funciones utilitarias
│   │
│   ├── config/                       # Configuración
│   │   └── environment.ts           # Variables de entorno por ambiente
│   │
│   ├── index.css                     # Estilos centralizados
│   ├── App.tsx                       # Componente raíz
│   ├── renderer.tsx                  # Entry point del renderer
│   ├── main.ts                       # Entry point principal (Electron)
│   └── preload.ts                    # Preload script de Electron
│
├── public/                           # Recursos estáticos
├── forge.config.ts                   # Configuración de Electron Forge
├── vite.main.config.ts              # Config Vite (proceso principal)
├── vite.preload.config.ts           # Config Vite (preload)
├── vite.renderer.config.js          # Config Vite (renderer)
├── tailwind.config.js               # Configuración de Tailwind CSS
├── tsconfig.json                     # Configuración de TypeScript
└── package.json                      # Dependencias y scripts
```

---

## 🔌 Arquitectura de Servicios

Todos los servicios de API heredan de `BaseService`, que proporciona:

- ✅ Métodos genéricos CRUD (`get`, `post`, `put`, `patch`, `delete`)
- ✅ Inyección automática del token JWT en headers
- ✅ Header `Accept-Language` automático según el idioma seleccionado
- ✅ Manejo centralizado de errores HTTP con `ApiErrorException`
- ✅ Validación de sesión y logout automático ante tokens expirados

```
BaseService (abstracta)
├── AuthService        → Login / Logout / Gestión de sesión
├── SchoolService      → CRUD de escuelas
├── ClassService       → CRUD de clases
├── StudentService     → CRUD de estudiantes + fotos
├── SubjectService     → CRUD de asignaturas + asignación a clases
├── SkillService       → CRUD de competencias
├── SkillRubricService → Rúbricas y criterios de competencias
├── ClassRubricService → Rúbricas de clase y criterios de alumnos
├── ExerciseService    → Ejercicios, calificaciones y documentos
├── StudentGroupService → Grupos cooperativos de alumnos
├── CalendarAlertService → Alertas del calendario
└── ScheduleService    → Horarios semanales
```

---

## 🖥 Capturas de Pantalla

> _Próximamente_

---

## 📄 Distribución

La aplicación se empaqueta con **Electron Forge** y soporta los siguientes formatos:

| Plataforma | Formato |
|---|---|
| **Windows** | Squirrel (.exe installer) |
| **macOS** | ZIP |
| **Linux** | DEB, RPM |

```bash
# Crear instalador
npm run make

# Crear instalador para producción
npm run make:pro
```

---

## 👤 Autor

**Manuel Farrapeira**  
📧 mfarrapeira@hotmail.com

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.
