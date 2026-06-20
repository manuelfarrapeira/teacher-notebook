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
- Soporte completo para **Español**, **Gallego**  e **Inglés**
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
- **Gráfica de distribución de notas**: botón en cada columna de ejercicio y en la columna Total que abre un modal con gráfico tipo pie chart mostrando la distribución de alumnos por rangos (Sin nota, Suspenso, Suficiente, Bien, Notable, Sobresaliente)
- **Gráfica radar de rendimiento**: en la ficha de calificaciones del alumno, gráfica tipo radar/araña que muestra las notas por asignatura (todas las de la clase) con áreas para cada trimestre y nota final

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
- **Gráfica de distribución de criterios**: botón en cada columna de rúbrica que abre un modal con gráfico tipo pie chart mostrando la distribución de alumnos por criterio asignado (rango de notas), con descripción del criterio al pasar el ratón

### 🤝 Trabajo Cooperativo (Grupos y Trabajos)
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
- **Trabajos cooperativos** por clase: CRUD completo de asignaciones grupales con título, descripción y trimestre (Q1, Q2, Q3)
- **Calificaciones por grupo** (0–10) en cada trabajo cooperativo, con guardado y eliminación individual
- **Documentos a nivel de trabajo**: subida, descarga y eliminación de documentos adjuntos por asignación (máx. 2 MB)
- **Documentos a nivel de grupo**: subida, descarga y eliminación de documentos específicos de cada grupo dentro de un trabajo
- **Sección expandible de notas** por trabajo: vista colapsable que muestra cada grupo guardado con su nota, input numérico y acciones
- Badge de trimestre con código de color (Q1 azul, Q2 naranja, Q3 verde)
- Requiere grupos guardados para poder crear trabajos cooperativos (aviso visual si no existen)

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
- Panel de ajustes con versión de la aplicación
- Búsqueda manual de actualizaciones
- Selector de idioma

### 🔄 Auto-actualización (OTA)
- Sistema de **actualización automática silenciosa** con Squirrel.Windows (solo entorno **pro**)
- Verificación automática cada 30 minutos y al iniciar la aplicación
- Descarga en segundo plano del nuevo paquete `.nupkg`
- **Notificación flotante** con botón "Reiniciar y actualizar" cuando la descarga termina
- Botón de **buscar actualizaciones manualmente** en la pestaña de Configuración
- Los artefactos se generan en `out/make/squirrel.windows/x64/`
- Para publicar: subir `RELEASES` y `.nupkg` a `https://codefm.synology.me/teacher_notebook/`

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

## 🎨 Sistema de Diseño — "Refined Academic"

La aplicación sigue una identidad visual distintiva denominada **"Refined Academic"**: sofisticada, cálida y profesional, evocando papelería premium y herramientas educativas de alta gama.

### Tipografía
| Fuente | Uso | Peso |
|---|---|---|
| **Playfair Display** | Títulos, encabezados de modales y secciones | 600, 700, 800 |
| **Source Sans 3** | Cuerpo de texto, inputs, botones, UI general | 300–700 |

### Paleta de Colores
| Token | Hex | Uso |
|---|---|---|
| **Primary (Sage)** | `#2c5f4a` | Botones, bordes activos, enlaces, indicadores |
| **Primary Hover** | `#1e4a38` | Hover de botones y elementos primarios |
| **Primary Light** | `#e8f0ec` | Fondos alternos de tablas, badges |
| **Accent (Copper)** | `#c4833c` | Acentos decorativos, borde superior, indicadores |
| **Background** | `#faf8f5` | Fondo general (tono papel cálido) |
| **Card** | `#ffffff` | Fondo de tarjetas y modales |
| **Border** | `#e0d8cf` | Bordes generales (gris cálido) |
| **Text** | `#2d3436` | Texto principal |
| **Text Muted** | `#7a8078` | Texto secundario, placeholders |

### Animaciones
- `modalSlideIn` — Entrada de modales con deslizamiento y escala
- `fadeInUp` — Aparición con desplazamiento ascendente para tarjetas
- `underlineGrow` — Animación del indicador de pestaña activa

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
| `npm run build:web` | Compilar la versión **web** (apunta a producción, salida en `web/`) |
| `npm run build:web:pre` | Compilar la versión web apuntando a preproducción |
| `npm run preview:web` | Previsualizar localmente el build web generado |
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
│   │   ├── LanguageSelector.tsx      # Selector de idioma con dropdown
│   │   │
│   │   ├── modals/                   # Componentes modales
│   │   │   ├── StudentFormModal.tsx      # Formulario de estudiante
│   │   │   ├── StudentGradesModal.tsx    # Calificaciones del estudiante
│   │   │   ├── AssignToClassModal.tsx    # Asignar estudiante a clase
│   │   │   ├── ExerciseFormModal.tsx     # Formulario de ejercicio
│   │   │   ├── GradeFormModal.tsx        # Formulario de calificación
│   │   │   ├── GradeDistributionChartModal.tsx # Gráfica distribución de notas
│   │   │   ├── RubricDistributionChartModal.tsx # Gráfica distribución de criterios
│   │   │   ├── StudentRadarChartModal.tsx  # Gráfica radar de rendimiento del alumno
│   │   │   ├── DocumentsModal.tsx        # Gestión de documentos
│   │   │   ├── GradeDocumentsModal.tsx   # Documentos de calificaciones
│   │   │   ├── GroupAssignmentFormModal.tsx    # Formulario de trabajo cooperativo
│   │   │   ├── GroupAssignmentDocumentsModal.tsx # Documentos de trabajos cooperativos
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
│   ├── domain/                       # 🔵 Dominio (núcleo hexagonal)
│   │   ├── models/                   # Interfaces/tipos puros (sin dependencias)
│   │   │   ├── index.ts             # Barrel export de modelos
│   │   │   ├── Student.ts           # Student, Gender, Shape
│   │   │   ├── School.ts            # School, SchoolClass
│   │   │   ├── Exercise.ts          # Exercise, ExerciseDocument
│   │   │   ├── Grade.ts             # GradeExercise, StudentGrades
│   │   │   ├── Subject.ts           # Subject, ClassSubject
│   │   │   ├── Absence.ts           # Absence
│   │   │   ├── CalendarAlert.ts     # CalendarAlert
│   │   │   ├── ClassRubric.ts       # ClassRubric, StudentCriteriaGroup
│   │   │   ├── Schedule.ts          # ScheduleItem
│   │   │   ├── Skill.ts             # Skill
│   │   │   ├── SkillRubric.ts       # SkillRubric, SkillCriterion
│   │   │   ├── StudentGroup.ts      # SavedGroup, GroupMember
│   │   │   ├── GroupAssignment.ts   # GroupAssignment, GroupAssignmentGrade, GroupAssignmentDocument
│   │   │   └── Api.ts               # ApiError
│   │
│   ├── infrastructure/               # 🟢 Adaptadores de infraestructura
│   │   ├── api/                      # Adaptadores HTTP
│   │   │   ├── index.ts             # Barrel export de servicios
│   │   │   ├── endpoints.ts         # Constantes de endpoints versionados
│   │   │   ├── BaseService.ts       # Clase base HTTP (JWT, errores, CRUD)
│   │   │   ├── AuthService.ts       # Autenticación (login/logout)
│   │   │   ├── StudentService.ts    # Adaptador HTTP para alumnos
│   │   │   ├── SchoolService.ts     # Adaptador HTTP para escuelas
│   │   │   ├── ExerciseService.ts   # Adaptador HTTP para ejercicios/notas/docs
│   │   │   └── ...                  # Un servicio por entidad
│   │   │
│   │   └── config/                   # Configuración de infraestructura
│   │       └── environment.ts       # URLs de API por entorno
│   │
│   ├── contexts/                     # React Contexts
│   │   └── StudentPhotoContext.tsx   # Caché de fotos de estudiantes
│   │
│   ├── lib/                          # Utilidades
│   │   ├── i18n.tsx                 # Sistema de internacionalización
│   │   └── utils.ts                 # Funciones utilitarias
│   │
│   ├── services/                     # ⚠️ DEPRECADO (re-exports → infrastructure/api)
│   ├── config/                       # ⚠️ DEPRECADO (re-export → infrastructure/config)
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

## 🔌 Arquitectura del Proyecto

El proyecto sigue una arquitectura en capas con separación clara entre dominio, infraestructura y UI:

### 🔵 Dominio (`src/domain/`)
El núcleo de la aplicación. Contiene las entidades de negocio sin dependencias externas:
- **`models/`** — Interfaces TypeScript puras (Student, School, Exercise, etc.)

### 🟢 Infraestructura (`src/infrastructure/`)
Adaptadores que comunican con servicios externos:
- **`api/`** — Adaptadores HTTP que comunican con el backend REST
- **`config/`** — Configuración de entorno (URLs de API)

Todos los adaptadores HTTP heredan de `BaseService`, que proporciona:

- ✅ Métodos genéricos CRUD (`get`, `put`, `patch`, `delete`)
- ✅ Inyección automática del token JWT en headers
- ✅ Header `Accept-Language` automático según el idioma seleccionado
- ✅ Manejo centralizado de errores HTTP con `ApiErrorException`
- ✅ Validación de sesión y logout automático ante tokens expirados

### 🟡 UI (`src/components/`)
Capa de presentación React:
- Componentes que importan **tipos del dominio** y **servicios de infraestructura**

### Diagrama de Dependencias

```
┌───────────────────┐     ┌────────────────────┐     ┌──────────────────┐
│   UI (React)      │ ──→ │   DOMINIO          │ ←── │ INFRAESTRUCTURA  │
│   components/     │     │   domain/models/   │     │ infrastructure/  │
│   contexts/       │     │   (sin deps)       │     │   api/ (HTTP)    │
│   lib/            │     │                    │     │   config/        │
└───────────────────┘     └────────────────────┘     └──────────────────┘
```

### Árbol de Servicios

```
BaseService (abstracta — src/infrastructure/api/)
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
├── GroupAssignmentService → Trabajos cooperativos, calificaciones y documentos
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

## 🌐 Despliegue como Aplicación Web (build estático)

Además del empaquetado de escritorio con Electron, el proyecto puede compilarse como una **aplicación web nativa de React** (HTML + JS + CSS estáticos) lista para subir a cualquier servidor web, sin Electron.

### Cómo funciona

El build web reutiliza exactamente el mismo código React de `src/`. El punto de entrada `src/renderer.tsx` ya incluye *fallbacks* para cuando `window.electronAPI` no existe (caso navegador), por lo que **no requiere cambios en el código de la aplicación**.

La configuración vive en un archivo de Vite independiente del de Electron:

- **`vite.config.web.mjs`** — configuración standalone de Vite para web. Características clave:
  - `base: './'` → rutas relativas, de modo que el sitio funciona servido desde cualquier subdirectorio (p. ej. `https://host/teacher-notebook/`).
  - `plugins: [react()]` → usa `@vitejs/plugin-react`. El archivo es **JavaScript ESM (`.mjs`)**, siguiendo la convención del config de Electron (`vite.renderer.config.js`). Se usa `.mjs` y no `.ts`/`.mts` porque el plugin es ESM-only y, además, al ser JS plano evita el chequeo de tipos de TypeScript 4.5 (que con `moduleResolution: node` no resuelve el campo `exports` del plugin y daría un falso error de "módulo no encontrado").
  - `define['import.meta.env.VITE_ENV']` → fija el entorno en tiempo de compilación. Por defecto **`pro`**.
  - `build.outDir: 'web'` con `emptyOutDir: true` → la salida se genera en la carpeta **`web/`**.

### Generar el build

```bash
# Compila apuntando a PRODUCCIÓN (https://codefm.synology.me:4443) → salida en web/
npm run build:web

# (Opcional) Compila apuntando a preproducción
npm run build:web:pre

# Previsualizar localmente lo generado (sirve la carpeta web/ en http://localhost:4173)
npm run preview:web
```

### Resultado (carpeta `web/`)

```
web/
├── index.html                 # HTML de entrada (rutas relativas, CSP con la API de PRO)
├── favicon.ico / favicon.png
├── fonts/                     # Fuentes Playfair Display
└── assets/
    ├── index-[hash].js        # Bundle de la aplicación
    ├── index-[hash].css       # Estilos compilados
    └── *.png                  # Imágenes procesadas
```

### Desplegar

1. Ejecuta `npm run build:web`.
2. Sube **el contenido de la carpeta `web/`** a la raíz (o subdirectorio) de tu servidor web.
3. Asegúrate de que el backend de producción permite peticiones CORS desde el dominio donde se aloje la web.

> **Nota:** El entorno (`pro`/`pre`) queda *embebido* en el bundle en tiempo de compilación. Para cambiar de entorno hay que recompilar con el script correspondiente.

---

## 🚀 Crear una Nueva Versión y Desplegar la Actualización (OTA)

El sistema de auto-actualización usa **Squirrel.Windows** y está habilitado únicamente en el entorno **pro** (producción). A continuación se describe el proceso completo para publicar una nueva versión y que los usuarios con la aplicación instalada reciban la actualización automáticamente.

### Requisitos previos

- Acceso al servidor NAS (`codefm.synology.me`) donde se alojan los artefactos
- La carpeta de hosting es: `https://codefm.synology.me/teacher_notebook/`
- Tener Node.js >= 18.x instalado

### Paso 1 — Incrementar la versión en `package.json`

Antes de generar el nuevo instalador, **actualiza el campo `version`** en `package.json`. Squirrel compara esta versión con la versión instalada del usuario para determinar si hay una actualización disponible.

```json
{
  "version": "1.3.0"
}
```

> ⚠️ **Importante**: Usa [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`). Squirrel **solo detecta la actualización si la nueva versión es superior** a la instalada.

| Tipo de cambio | Ejemplo | Cuándo usar |
|---|---|---|
| **PATCH** | `1.2.1` → `1.2.2` | Corrección de bugs menores |
| **MINOR** | `1.2.2` → `1.3.0` | Nueva funcionalidad retrocompatible |
| **MAJOR** | `1.3.0` → `2.0.0` | Cambios que rompen compatibilidad |

### Paso 2 — Generar el instalador de producción

Ejecuta el comando de build para el entorno **pro**:

```bash
npm run make:pro
```

Este comando:
1. Compila el código TypeScript/React con Vite
2. Empaqueta la aplicación con Electron Forge
3. Genera los artefactos de Squirrel.Windows

### Paso 3 — Localizar los artefactos generados

Los archivos se generan en:

```
out/make/squirrel.windows/x64/
├── RELEASES                              # Manifiesto de versiones
├── teacher-notebook-X.Y.Z-full.nupkg     # Paquete completo de la nueva versión
├── teacher-notebook-X.Y.Z Setup.exe      # Instalador para nuevos usuarios
└── teacher-notebook-X.Y.Z-delta.nupkg    # (Opcional) Paquete delta incremental
```

| Archivo | Descripción |
|---|---|
| `RELEASES` | Archivo de texto que lista todas las versiones disponibles. **Squirrel lo consulta para saber si hay actualizaciones.** |
| `*.full.nupkg` | Paquete NuGet con la aplicación completa. Se descarga cuando hay actualización. |
| `*-delta.nupkg` | Paquete incremental (solo cambios). Se usa automáticamente si existe y es aplicable. |
| `* Setup.exe` | Instalador para usuarios que instalan la app por primera vez. |

### Paso 4 — Subir los artefactos al servidor

Sube los siguientes archivos al directorio de hosting en el NAS:

```
https://codefm.synology.me/teacher_notebook/
```

**Archivos a subir** (reemplazando los anteriores):

1. **`RELEASES`** — ⚡ **Obligatorio**. Debe contener las entradas de la nueva versión.
2. **`teacher-notebook-X.Y.Z-full.nupkg`** — ⚡ **Obligatorio**. El paquete de la nueva versión.
3. **`teacher-notebook-X.Y.Z-delta.nupkg`** — Opcional pero recomendado (actualizaciones más rápidas).
4. **`teacher-notebook-X.Y.Z Setup.exe`** — Para nuevas instalaciones.

> 💡 **Tip**: Mantén también el `.nupkg` de la versión anterior si quieres que Squirrel pueda generar deltas automáticamente.

### Paso 5 — Verificar la publicación

Comprueba que el archivo `RELEASES` es accesible desde un navegador:

```
https://codefm.synology.me/teacher_notebook/RELEASES
```

Debería mostrar algo como:

```
SHA1_HASH teacher-notebook-1.3.0-full.nupkg SIZE
```

### Cómo funciona la actualización automática

Una vez publicados los artefactos, las aplicaciones instaladas detectan la actualización automáticamente:

```
┌─────────────────────────┐
│   App instalada (v1.2.1)│
│                         │
│  1. Al iniciar (10s)    │──→ GET /teacher_notebook/RELEASES
│  2. Cada 30 minutos     │         │
│                         │         ▼
│  3. Compara versión     │    ¿Versión nueva?
│     local vs remota     │     │          │
│                         │    NO         SÍ
│                         │     │          │
│  4. Si hay nueva:       │  (nada)   Descarga .nupkg
│     descarga en segundo │              │
│     plano               │              ▼
│                         │    Notificación flotante:
│  5. Muestra notificación│    "Reiniciar y actualizar"
│     al usuario          │              │
│                         │              ▼
│  6. Al pulsar:          │    autoUpdater.quitAndInstall()
│     reinicia y actualiza│    → Cierra app, instala, reabre
└─────────────────────────┘
```

| Evento | Comportamiento |
|---|---|
| **Inicio de la app** | Verifica actualizaciones a los 10 segundos |
| **Cada 30 minutos** | Consulta periódica al servidor |
| **Actualización disponible** | Descarga silenciosa en segundo plano |
| **Descarga completa** | Aparece notificación flotante con botón "Reiniciar y actualizar" |
| **Botón manual** | En **Configuración** → "Buscar actualizaciones" para verificar manualmente |

### Checklist rápido para nueva versión

```
☐ 1. Incrementar "version" en package.json (ej: "1.2.1" → "1.3.0")
☐ 2. Ejecutar: npm run make:pro
☐ 3. Copiar al servidor:
     - out/make/squirrel.windows/x64/RELEASES
     - out/make/squirrel.windows/x64/teacher-notebook-X.Y.Z-full.nupkg
     - (opcional) teacher-notebook-X.Y.Z-delta.nupkg
     - (opcional) teacher-notebook-X.Y.Z Setup.exe
☐ 4. Verificar: https://codefm.synology.me/teacher_notebook/RELEASES
☐ 5. Esperar que los usuarios reciban la notificación (máx. 30 min)
```

### Solución de problemas

| Problema | Causa | Solución |
|---|---|---|
| No se detecta la actualización | La versión en `package.json` no se incrementó | Verificar que la nueva versión es **mayor** que la instalada |
| Error de red al buscar actualizaciones | El servidor NAS no es accesible | Comprobar que `https://codefm.synology.me/teacher_notebook/RELEASES` responde HTTP 200 |
| La actualización no se aplica | Falta el archivo `.nupkg` en el servidor | Verificar que el `.nupkg` referenciado en `RELEASES` existe en la misma ruta |
| Auto-update no funciona en dev | Es el comportamiento esperado | Solo funciona en builds empaquetados con `VITE_ENV=pro` |
| Error de certificado SSL | Certificado del NAS no es de confianza | Verificar la configuración SSL del servidor |

---

## 👤 Autor

**Manuel Farrapeira**  
📧 mfarrapeira@hotmail.com

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.
