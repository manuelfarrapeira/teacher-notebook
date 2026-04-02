# 📚 Teacher Notebook - Contexto del Proyecto

## 📋 Descripción General

**Teacher Notebook** es una aplicación de escritorio construida con **Electron + React + TypeScript** que proporciona una solución integral de gestión académica para docentes. La aplicación permite administrar estudiantes, clases, horarios y configuraciones en un entorno intuitivo y multiidioma.

### Características Principales
- ✅ Autenticación segura con JWT
- ✅ Interfaz multiidioma (Español e Inglés)
- ✅ Gestión de escuelas, clases y estudiantes
- ✅ Horarios y calendario académico
- ✅ Diseño responsivo con soporte móvil
- ✅ Sistema de notificaciones y carga de datos
- ✅ Persistencia de preferencias de usuario

---

## 🏗️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Electron** | 39.2.6 | Framework para aplicación de escritorio |
| **React** | - | Biblioteca de UI componentes |
| **TypeScript** | ~4.5.4 | Tipado estático |
| **Vite** | ^5.4.21 | Bundler y dev server |
| **Tailwind CSS** | ^4.1.18 | Framework CSS utilitario |
| **Radix UI** | Múltiples | Componentes accesibles |
| **Lucide React** | - | Librería de iconos |
| **PostCSS** | ^8.5.6 | Procesador CSS |

---

## 📁 Estructura del Proyecto (Arquitectura Hexagonal)

```
src/
├── domain/                        # 🔵 NÚCLEO — Modelos y contratos puros
│   ├── models/                    # Interfaces/tipos de dominio (sin dependencias externas)
│   │   ├── index.ts              # Barrel export de todos los modelos
│   │   ├── Student.ts            # Student, Gender, Shape, StudentRequestDTO
│   │   ├── School.ts             # School, SchoolClass, SchoolRequestDTO
│   │   ├── Class.ts              # ClassRequestDTO
│   │   ├── Exercise.ts           # Exercise, ExerciseDocument, QuarterExercises, etc.
│   │   ├── Grade.ts              # GradeExercise, StudentGrades, GradeCreateRequest, etc.
│   │   ├── Subject.ts            # Subject, ClassSubject, SubjectRequestDTO
│   │   ├── Absence.ts            # Absence, AbsenceCreateRequest
│   │   ├── CalendarAlert.ts      # CalendarAlert, CalendarAlertRequestDTO
│   │   ├── ClassRubric.ts        # ClassRubric, StudentCriteriaGroup, etc.
│   │   ├── Schedule.ts           # ScheduleItem, ScheduleCreateRequest, etc.
│   │   ├── Skill.ts              # Skill, SkillRequestDTO
│   │   ├── SkillRubric.ts        # SkillRubric, SkillCriterion, CriterionRequest
│   │   ├── StudentGroup.ts       # SavedGroup, GroupMember, SavedGroupRequest
│   │   └── Api.ts                # ApiError
│   │
│   └── ports/                     # Interfaces de contrato (driven ports)
│       ├── index.ts              # Barrel export de todos los ports
│       ├── StudentPort.ts        # Contrato para operaciones de estudiantes
│       ├── SchoolPort.ts         # Contrato para operaciones de colegios
│       ├── ClassPort.ts          # Contrato para operaciones de clases
│       ├── ExercisePort.ts       # Contrato para ejercicios, notas y documentos
│       ├── SubjectPort.ts        # Contrato para asignaturas
│       ├── AbsencePort.ts        # Contrato para faltas
│       ├── CalendarAlertPort.ts  # Contrato para alertas de calendario
│       ├── ClassRubricPort.ts    # Contrato para rúbricas de clase
│       ├── SchedulePort.ts       # Contrato para horarios
│       ├── SkillPort.ts          # Contrato para competencias
│       ├── SkillRubricPort.ts    # Contrato para rúbricas de competencia
│       ├── StudentGroupPort.ts   # Contrato para grupos cooperativos
│       └── AuthPort.ts           # Contrato para autenticación
│
├── infrastructure/                # 🟢 ADAPTADORES SECUNDARIOS (driven)
│   ├── api/                       # Adaptadores HTTP que implementan los ports
│   │   ├── index.ts              # Barrel export de todos los servicios
│   │   ├── BaseService.ts        # Clase base HTTP (headers, auth, CRUD genérico)
│   │   ├── AuthService.ts        # Adaptador de autenticación
│   │   ├── StudentService.ts     # Adaptador HTTP para estudiantes
│   │   ├── SchoolService.ts      # Adaptador HTTP para colegios
│   │   ├── ClassService.ts       # Adaptador HTTP para clases
│   │   ├── ExerciseService.ts    # Adaptador HTTP para ejercicios/notas/docs
│   │   ├── SubjectService.ts     # Adaptador HTTP para asignaturas
│   │   ├── AbsenceService.ts     # Adaptador HTTP para faltas
│   │   ├── CalendarAlertService.ts # Adaptador HTTP para alertas
│   │   ├── ClassRubricService.ts # Adaptador HTTP para rúbricas de clase
│   │   ├── ScheduleService.ts    # Adaptador HTTP para horarios
│   │   ├── SkillService.ts       # Adaptador HTTP para competencias
│   │   ├── SkillRubricService.ts # Adaptador HTTP para rúbricas
│   │   └── StudentGroupService.ts # Adaptador HTTP para grupos cooperativos
│   │
│   └── config/                    # Configuración de infraestructura
│       └── environment.ts        # URLs de API por entorno
│
├── components/                    # 🟡 ADAPTADOR PRIMARIO (driving) — UI React
│   ├── Dashboard.tsx             # Componente principal del dashboard
│   ├── TopBar.tsx                # Barra superior con selectores
│   ├── Sidebar.tsx               # Barra lateral de navegación
│   ├── LoginScreen.tsx           # Pantalla de inicio de sesión
│   ├── LoadingScreen.tsx         # Pantalla de carga
│   ├── RefreshButton.tsx         # Botón de actualizar datos
│   ├── LanguageSelector.tsx      # Selector de idioma con dropdown
│   │
│   ├── tabs/                     # Tabs del dashboard (cada uno en su archivo)
│   │   ├── StudentsTab.tsx       # Gestión de estudiantes
│   │   ├── ClassesTab.tsx        # Gestión de clases
│   │   ├── ScheduleTab.tsx       # Calendario académico
│   │   ├── TimetableTab.tsx      # Horario semanal
│   │   └── SettingsTab.tsx       # Configuración
│   │
│   ├── modals/                   # Componentes modales
│   │   └── LoadingModal.tsx      # Modal de carga
│   │
│   └── ui/                       # Componentes UI base (Radix UI + custom)
│       ├── button.tsx
│       ├── dialog.tsx
│       └── ...
│
├── lib/                          # Utilidades compartidas
│   ├── i18n.tsx                  # Sistema de internacionalización
│   └── utils.ts                  # Funciones utilitarias
│
├── contexts/                     # React Contexts
│   └── StudentPhotoContext.tsx   # Cache de fotos de alumnos
│
├── services/                     # ⚠️ DEPRECADO — Re-exports hacia infrastructure/api
├── config/                       # ⚠️ DEPRECADO — Re-export hacia infrastructure/config
│
├── index.css                     # Estilos centralizados (Tailwind + custom)
├── App.tsx                       # Componente raíz
├── renderer.tsx                  # Punto de entrada del renderer
├── main.ts                       # Punto de entrada principal
└── preload.ts                    # Preload script de Electron
```

---

## 🎨 Sistema de Estilos

### Ubicación Central
**Todos los estilos CSS se definen en `src/index.css`**

### Estructura
```css
/* 1. Imports Tailwind */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 2. Reset y estilos globales */
* { margin: 0; padding: 0; box-sizing: border-box; }

/* 3. Estilos por sección:
   - Login (login-*)
   - Dashboard (dashboard-*)
   - Components (component-*)
   - UI (ui-*)
   - Animations
*/
```

### Convención de Nombres
- Usar kebab-case para clases CSS
- Prefijo según sección: `login-`, `dashboard-`, `modal-`, etc.
- Estructura: `.{seccion}-{componente}-{estado}`
  - Ejemplo: `.dashboard-tab.active`

### Ejemplo de Integración Tailwind + Custom CSS
```css
.dashboard-card {
  @apply rounded-lg border border-gray-200 shadow-sm p-6 bg-white;
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  @apply shadow-md border-gray-300;
}
```

### 📐 Estructura CSS para Tabs

**⚠️ IMPORTANTE:** Todas las tabs deben seguir la misma estructura CSS básica para mantener consistencia visual y funcional.

#### Estructura Base Requerida para Nuevas Tabs

```typescriptreact
import React from 'react';
import { IconName } from 'lucide-react';
import { useI18n } from '../../lib/i18n';

export function NuevaTab() {
  const { t } = useI18n();

  return (
    <div className="dashboard-card">
      {/* Header con título y botón (opcional) */}
      <div className="dashboard-section-header">
        <h2 className="dashboard-section-title">{t('dashboard.nueva.title')}</h2>
        <button className="dashboard-add-btn">
          {t('dashboard.nueva.addNew')}
        </button>
      </div>

      {/* Estado vacío o contenido principal */}
      <div className="dashboard-empty">
        <IconName className="dashboard-empty-icon" />
        <p className="dashboard-empty-text">{t('dashboard.nueva.emptyMessage')}</p>
      </div>
    </div>
  );
}
```

#### Clases CSS Disponibles

**Contenedores principales:**
| Clase | Descripción | Estilos |
|-------|-------------|---------|
| `dashboard-card` | Contenedor principal de la tab | fondo blanco, borde gris, padding 1.5rem, sombra suave |

**Headers y títulos:**
| Clase | Descripción | Estilos |
|-------|-------------|---------|
| `dashboard-section-header` | Contenedor flex para header | display: flex, justify-content: space-between, align-items: center |
| `dashboard-section-title` | Título de sección | font-size: 1.25rem, font-weight: 600 |

**Botones de acción:**
| Clase | Descripción | Estilos |
|-------|-------------|---------|
| `dashboard-add-btn` | Botón principal de acción | background azul, color blanco, padding, border-radius, hover effect |

**Estados vacíos:**
| Clase | Descripción | Estilos |
|-------|-------------|---------|
| `dashboard-empty` | Contenedor de estado vacío | text-align: center, padding: 2rem |
| `dashboard-empty-icon` | Icono del estado vacío | height: 3rem, width: 3rem, color gris, margin centrado |
| `dashboard-empty-text` | Texto del estado vacío | color: #6b7280 (gris) |

**Listas y estudiantes:**
| Clase | Descripción | Estilos |
|-------|-------------|---------|
| `dashboard-search` | Input de búsqueda | width: 100%, padding: 0.75rem, borde gris, border-radius |
| `dashboard-students` | Contenedor de lista de estudiantes | display: flex, flex-direction: column, gap: 1rem |
| `dashboard-student` | Item individual de estudiante | display: flex, align-items: center, justify-content: space-between, padding: 1rem, borde |
| `dashboard-student-info` | Info del estudiante (avatar + texto) | display: flex, align-items: center, gap: 0.75rem |
| `dashboard-student-avatar` | Avatar circular | width: 2.5rem, height: 2.5rem, border-radius: 50%, background azul claro |
| `dashboard-student-name` | Nombre del estudiante | font-weight: 500 |
| `dashboard-student-grade` | Grado del estudiante | font-size: 0.875rem, color gris |
| `dashboard-badge` | Badge de estado | background gris claro, padding, border-radius, font pequeño |

**Modales y formularios:**
| Clase | Descripción | Estilos |
|-------|-------------|---------|
| `modal-overlay` | Overlay de fondo del modal | position: fixed, inset: 0, background rgba negro 50%, z-index: 50 |
| `modal-content` | Contenedor del modal | background blanco, border-radius, padding: 1.5rem, max-width: 28rem, sombra |
| `modal-title` | Título del modal | font-size: 1.125rem, font-weight: 600 |
| `modal-body` | Cuerpo del modal | display: flex, flex-direction: column, gap: 1rem |
| `modal-input` | Input del formulario | width: 100%, padding: 0.75rem, borde gris, border-radius |
| `modal-footer` | Footer del modal | display: flex, justify-content: flex-end, gap: 0.5rem |
| `modal-button` | Botón base del modal | padding: 0.5rem 1rem, border-radius, cursor pointer |
| `modal-button cancel` | Botón cancelar | borde gris, background blanco |
| `modal-button save` | Botón guardar | background azul, color blanco, sin borde |

**Utilidades y animaciones:**
| Clase | Descripción | Estilos |
|-------|-------------|---------|
| `icon-spin` | Animación de rotación para iconos | animation: spin 1s linear infinite |
| `animate-spin` | Animación de rotación (alternativa) | animation: spin 1s linear infinite |
| `icon-tab` | Tamaño estándar de iconos en tabs | height: 1rem, width: 1rem |

#### ❌ NO Hacer al Crear Tabs

1. **NO usar componentes de shadcn/ui** para la estructura principal:
   ```tsx
   // ❌ INCORRECTO
   import { Card, CardHeader, CardTitle } from '../ui/card';
   
   return (
     <Card>
       <CardHeader>
         <CardTitle>Título</CardTitle>
       </CardHeader>
     </Card>
   );
   ```

2. **NO usar Tailwind directamente** para la estructura base:
   ```tsx
   // ❌ INCORRECTO
   return (
     <div className="space-y-6 p-6 bg-white rounded-lg shadow">
       <div className="flex items-center justify-between">
   ```

3. **NO usar estilos inline** para la estructura principal:
   ```tsx
   // ❌ INCORRECTO (excepto ajustes menores muy específicos)
   <div style={{ display: 'flex', gap: '1rem', padding: '2rem' }}>
   ```

4. **NO crear archivos CSS nuevos** para tabs individuales

#### ✅ SÍ Hacer al Crear Tabs

1. **Usar las clases CSS definidas** en `src/index.css`:
   ```tsx
   // ✅ CORRECTO
   return (
     <div className="dashboard-card">
       <div className="dashboard-section-header">
         <h2 className="dashboard-section-title">{t('title')}</h2>
         <button className="dashboard-add-btn">{t('add')}</button>
       </div>
     </div>
   );
   ```

2. **Seguir el patrón de tabs existentes:**
   - Ver `src/components/tabs/ClassesTab.tsx` para una tab simple
   - Ver `src/components/tabs/StudentsTab.tsx` para una tab con lista
   - Ver `src/components/tabs/SchoolsTab.tsx` para una tab con formulario completo

3. **Consultar `src/index.css`** antes de crear estilos nuevos - probablemente ya exista la clase que necesitas

4. **Mantener la jerarquía:** `dashboard-card` → `dashboard-section-header` / `dashboard-empty` / contenido

#### Ejemplo Completo: Tab Simple

```typescriptreact
// src/components/tabs/TasksTab.tsx
import React from 'react';
import { CheckSquare } from 'lucide-react';
import { useI18n } from '../../lib/i18n';

export function TasksTab() {
  const { t } = useI18n();

  return (
    <div className="dashboard-card">
      <div className="dashboard-empty">
        <CheckSquare className="dashboard-empty-icon" />
        <p className="dashboard-empty-text">{t('dashboard.tasks.noTasks')}</p>
      </div>
    </div>
  );
}
```

#### Ejemplo Completo: Tab con Formulario

```typescriptreact
// src/components/tabs/NotesTab.tsx
import React, { useState } from 'react';
import { FileText, Plus, Loader2 } from 'lucide-react';
import { useI18n } from '../../lib/i18n';

export function NotesTab() {
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="dashboard-card">
      <div className="dashboard-section-header">
        <h2 className="dashboard-section-title">{t('dashboard.notes.title')}</h2>
        <button className="dashboard-add-btn" onClick={() => setShowForm(true)}>
          <Plus size={16} style={{ marginRight: '0.5rem' }} />
          {t('dashboard.notes.addNew')}
        </button>
      </div>

      {showForm && (
        <div className="modal-content" style={{ marginBottom: '1.5rem', maxWidth: '100%' }}>
          <h3 className="modal-title">{t('dashboard.notes.createNote')}</h3>
          <form className="modal-body">
            <input className="modal-input" placeholder={t('dashboard.notes.titlePlaceholder')} />
            <textarea className="modal-input" placeholder={t('dashboard.notes.contentPlaceholder')} />
            <div className="modal-footer">
              <button type="button" className="modal-button cancel" onClick={() => setShowForm(false)}>
                {t('common.cancel')}
              </button>
              <button type="submit" className="modal-button save">
                {t('common.save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
          <Loader2 className="icon-spin" size={32} />
        </div>
      ) : (
        <div className="dashboard-empty">
          <FileText className="dashboard-empty-icon" />
          <p className="dashboard-empty-text">{t('dashboard.notes.noNotes')}</p>
        </div>
      )}
    </div>
  );
}
```

#### Referencias

- **Tabs existentes:** Todos los archivos en `src/components/tabs/`
- **CSS completo:** `src/index.css` (líneas 558-730 aprox.)
- **Ejemplos de referencia:**
  - Tab simple: `ClassesTab.tsx`, `SettingsTab.tsx`
  - Tab con header: `StudentsTab.tsx`
  - Tab completa con formulario: `SchoolsTab.tsx`

---

## 🌍 Sistema de Internacionalización (i18n)

### Ubicación
`src/lib/i18n.tsx`

### Soporta
- **Español** (es)
- **Inglés** (en)

### Estructura de Traducciones
```typescript
interface Translations {
  app: { title: string; };
  login: { /* ... */ };
  dashboard: {
    tabs: { students: string; classes: string; /* ... */ };
    errors: { /* ... */ };
    /* ... */
  };
  common: { /* ... */ };
}

const translations: Record<Locale, Translations> = {
  es: { /* ... */ },
  en: { /* ... */ }
};
```

### Uso
```typescriptreact
// En componentes
import { useI18n } from '../lib/i18n';

export function MiComponente() {
  const { t } = useI18n();
  
  return <h1>{t('app.title')}</h1>;
}

// En servicios (sin hooks)
import { getCurrentLocale } from '../lib/i18n';

const locale = getCurrentLocale(); // Retorna 'es' | 'en'
```

### Almacenamiento
- La preferencia de idioma se guarda en `localStorage` con la clave `teacher_notebook_locale`
- Se carga automáticamente al reiniciar la app

### Agregación de Nuevas Traducciones
1. Abrir `src/lib/i18n.tsx`
2. Agregar la clave en el objeto `translations` tanto para `es` como para `en`
3. Asegurarse de mantener la misma estructura en ambos idiomas
4. Usar en componentes con `t('ruta.a.la.clave')`

---

## 🔐 Servicios y API

### Clase Base: `BaseService`

**Ubicación:** `src/infrastructure/api/BaseService.ts`

Todas las clases de servicio deben heredar de `BaseService`. Proporciona:

✅ **Métodos genéricos CRUD:**
- `get<T>(baseEndpoint, endpoint)` - GET request
- `post<T>(baseEndpoint, endpoint, data)` - POST request
- `put<T>(baseEndpoint, endpoint, data)` - PUT request
- `patch<T>(baseEndpoint, endpoint, data)` - PATCH request
- `delete<T>(baseEndpoint, endpoint)` - DELETE request

✅ **Funcionalidades integradas:**
- Inyección automática del token JWT en headers
- Manejo centralizado de errores HTTP
- Validación de sesión y logout automático
- Soporte para idioma Accept-Language
- Manejo de errores del servidor con detalles

✅ **Headers automáticos:**
```typescript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {token}',
  'Accept-Language': '{locale}' // 'es' o 'en'
}
```

### Crear un Nuevo Servicio

**Ejemplo: `UserService.ts`**

```typescript
import { BaseService } from './BaseService';

export interface User {
  id: number;
  name: string;
  email: string;
}

export class UserService extends BaseService {
  private static readonly BASE_ENDPOINT = '/teacher-notebook/v1';

  // GET todos los usuarios
  static async getUsers(): Promise<User[]> {
    return this.get<User[]>(this.BASE_ENDPOINT, '/users');
  }

  // GET usuario por ID
  static async getUserById(id: number): Promise<User> {
    return this.get<User>(this.BASE_ENDPOINT, `/users/${id}`);
  }

  // POST crear usuario
  static async createUser(userData: Omit<User, 'id'>): Promise<User> {
    return this.post<User>(this.BASE_ENDPOINT, '/users', userData);
  }

  // PUT actualizar usuario
  static async updateUser(id: number, userData: Partial<User>): Promise<User> {
    return this.put<User>(this.BASE_ENDPOINT, `/users/${id}`, userData);
  }

  // DELETE eliminar usuario
  static async deleteUser(id: number): Promise<void> {
    return this.delete<void>(this.BASE_ENDPOINT, `/users/${id}`);
  }
}
```

### Servicio de Escuelas: `SchoolService.ts`

```typescript
export interface SchoolClass {
  id: number;
  schoolId: number;
  name: string;
  schoolYear: string;
}

export interface School {
  id: number;
  name: string;
  town: string;
  tlf: number;
  classes: SchoolClass[];
}

export class SchoolService extends BaseService {
  private static readonly BASE_ENDPOINT = '/teacher-notebook/v1';

  static async getSchools(): Promise<School[]> {
    return this.get<School[]>(this.BASE_ENDPOINT, '/schools');
  }
}
```

---

## 🧩 Componentes

### Estructura General de un Componente

```typescriptreact
import React from 'react';
import { useI18n } from '../lib/i18n';

interface ComponentProps {
  // Props documentadas
  prop1: string;
  prop2?: number;
}

/**
 * Descripción breve del componente
 * @param {ComponentProps} props - Props del componente
 */
export function MiComponente({ prop1, prop2 }: ComponentProps) {
  const { t } = useI18n();
  
  return (
    <div className="mi-componente">
      {/* Contenido */}
    </div>
  );
}
```

### Tipos de Componentes

#### 1️⃣ **Tabs** (Dashboard)
**Directorio:** `src/components/tabs/`

Cada tab es un componente independiente. Se importa en `Dashboard.tsx` y se renderiza según `activeTab`.

**Ejemplo: `StudentsTab.tsx`**
```typescriptreact
interface StudentsTabProps {
  onAddNew: () => void;
}

export function StudentsTab({ onAddNew }: StudentsTabProps) {
  const { t } = useI18n();
  
  return (
    <div className="dashboard-card">
      <h2>{t('dashboard.students.title')}</h2>
      <button onClick={onAddNew}>
        {t('dashboard.students.addNew')}
      </button>
      {/* Contenido del tab */}
    </div>
  );
}
```

**Para agregar una nueva tab:**
1. Crear archivo en `src/components/tabs/NuevaTab.tsx`
2. Importar en `Dashboard.tsx`
3. Agregar entrada en el array de tabs en `Sidebar.tsx`
4. Agregar renderización condicional en `Dashboard.tsx`
5. Agregar traducciones en `src/lib/i18n.tsx` bajo `dashboard.tabs.{nombreTab}`

#### 2️⃣ **Selectores** (Dropdowns especializados)
**Directorio:** `src/components/`

Los selectores reutilizables van directamente en `src/components/`. Los selectores simples que solo se usan en un componente se integran directamente en el archivo correspondiente.

**Ejemplo: `LanguageSelector.tsx`**
Selector de idioma con dropdown personalizado, usado en `LoginScreen.tsx` y `UserMenu.tsx`.

**Para agregar un nuevo selector:**
1. Si se reutiliza en varios archivos: crear archivo en `src/components/NuevoSelector.tsx`
2. Si solo se usa en un componente: integrarlo directamente en ese archivo
3. Usar componentes de Radix UI de `src/components/ui/` o dropdowns personalizados
4. Importar en el componente padre donde se necesite

#### 3️⃣ **Modales**
**Directorio:** `src/components/modals/`

Componentes modales reutilizables para confirmaciones, mensajes de error, éxito, etc.

**Modales disponibles:**

##### `ErrorModal.tsx`
Modal para mostrar mensajes de error.

```typescriptreact
import { ErrorModal } from '../modals/ErrorModal';

<ErrorModal
  isOpen={isErrorOpen}
  message="Error al procesar la solicitud"
  onClose={() => setIsErrorOpen(false)}
/>
```

**Props:**
- `isOpen: boolean` - Controla la visibilidad del modal
- `message: string` - Mensaje de error a mostrar
- `onClose: () => void` - Callback al cerrar el modal

##### `SuccessModal.tsx`
Modal para mostrar mensajes de éxito.

```typescriptreact
import { SuccessModal } from '../modals/SuccessModal';

<SuccessModal
  isOpen={isSuccessOpen}
  message="Operación completada exitosamente"
  onClose={() => setSuccessOpen(false)}
/>
```

**Props:**
- `isOpen: boolean` - Controla la visibilidad del modal
- `message: string` - Mensaje de éxito a mostrar
- `onClose: () => void` - Callback al cerrar el modal

##### `ConfirmDeleteModal.tsx`
Modal para confirmar acciones de eliminación.

```typescriptreact
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';

<ConfirmDeleteModal
  isOpen={isConfirmOpen}
  itemName="Elemento a eliminar"
  title="Confirmar eliminación"
  confirmMessage="¿Está seguro que desea eliminar {name}?"
  onConfirm={handleDelete}
  onCancel={() => setIsConfirmOpen(false)}
  isDeleting={isDeleting}
/>
```

**Props:**
- `isOpen: boolean` - Controla la visibilidad del modal
- `itemName: string` - Nombre del elemento a eliminar (reemplaza {name} en confirmMessage)
- `title: string` - Título del modal
- `confirmMessage: string` - Mensaje de confirmación (puede incluir {name} como placeholder)
- `onConfirm: () => void` - Callback al confirmar
- `onCancel: () => void` - Callback al cancelar
- `isDeleting?: boolean` - Muestra spinner durante la operación de eliminación

##### `LoadingModal.tsx`
Modal para mostrar estado de carga.

```typescriptreact
import { LoadingModal } from '../modals/LoadingModal';

<LoadingModal />
```

**Características:**
- Usa elemento `<dialog>` nativo de HTML5 para mejor accesibilidad
- Backdrop semitransparente automático
- Centrado vertical y horizontal
- Soporte para teclado (Escape para cerrar)
- Estilos consistentes con el resto de la aplicación

**Para agregar un nuevo modal:**
1. Crear archivo en `src/components/modals/NuevoModal.tsx`
2. Usar el elemento `<dialog>` nativo con clase `modal-overlay`
3. Envolver el contenido en un contenedor flex para centrado
4. Usar clase `modal-content` para el contenedor del contenido
5. Implementar props para controlar visibilidad y callbacks
6. Agregar traducciones necesarias en `src/lib/i18n.tsx`
7. Documentar las props con interfaces TypeScript

**Ejemplo de estructura de un nuevo modal:**

```typescriptreact
import React, { useRef } from 'react';
import { useI18n } from '../../lib/i18n';

interface NuevoModalProps {
  isOpen: boolean;
  onClose: () => void;
  // ... otras props
}

export function NuevoModal({ isOpen, onClose }: NuevoModalProps) {
  const { t } = useI18n();
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  return (
    <dialog
      className="modal-overlay"
      open={isOpen}
      aria-label={t('modal.title')}
      onClose={onClose}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className="modal-content" ref={modalRef}>
          <h3 className="modal-title">{t('modal.title')}</h3>
          <div className="modal-body">
            {/* Contenido del modal */}
          </div>
          <div className="modal-footer">
            <button className="modal-button cancel" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button className="modal-button save" onClick={handleSave}>
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
```

---

## 🎯 Convenciones de Codificación

### 📁 Estructura de Carpetas

```
✅ CORRECTO:
src/components/
├── tabs/          # Solo archivos de tabs
│   ├── NewTab.tsx
│   └── AnotherTab.tsx
├── modals/        # Solo archivos de modales
│   └── ConfirmModal.tsx
├── ui/            # Componentes base de UI
├── LanguageSelector.tsx  # Selectores reutilizables
├── Dashboard.tsx  # Componentes raíz/principales

❌ INCORRECTO:
src/components/
├── tabs.tsx           # Debe ir en tabs/
├── modals.tsx         # Debe ir en modals/
└── random-stuff/      # Directorios no estándar
```

### 📝 Nombres de Archivos y Componentes

```typescript
// ✅ CORRECTO - PascalCase para componentes
export function StudentCard() { }
// Archivo: StudentCard.tsx

// ❌ INCORRECTO - camelCase
export function studentCard() { }
// Archivo: studentCard.tsx

// ✅ CORRECTO - Agregar el sufijo "Modal" a los modales
export function ConfirmDeleteModal() { }
// Archivo: ConfirmDeleteModal.tsx
```

### 🎨 Estilos CSS

```typescript
// ✅ CORRECTO - Estilos centralizados en index.css
// Componente:
<div className="dashboard-card">

// index.css:
.dashboard-card {
  @apply rounded-lg shadow-sm p-6;
}

// ❌ INCORRECTO - Inline styles o archivos separados
<div style={{ borderRadius: '8px', padding: '24px' }}>

// ❌ INCORRECTO - CSS Modules
<div className={styles.card}>
```

### 🌐 Traducciones

```typescript
// ✅ CORRECTO
const { t } = useI18n();
return <h1>{t('dashboard.students.title')}</h1>;

// ❌ INCORRECTO - Hardcodear strings
return <h1>Estudiantes</h1>;

// ✅ CORRECTO - Agregar al i18n
// En i18n.tsx:
{
  es: {
    newSection: {
      message: 'Mi mensaje en español'
    },
    en: {
      newSection: {
        message: 'My message in English'
      }
    }
  }
}
```

### 🔗 Servicios API

```typescript
// ✅ CORRECTO - Usar servicios heredados de BaseService
const data = await SchoolService.getSchools();

// ❌ INCORRECTO - Llamadas fetch directas en componentes
const response = await fetch('/api/schools');

// ✅ CORRECTO - Manejo de errores delegado a BaseService
try {
  const data = await SchoolService.getSchools();
  setData(data);
} catch (error) {
  setError(error.message);
}
```

### 📦 Props e Interfaces

```typescript
// ✅ CORRECTO - Interfaces bien documentadas
interface StudentCardProps {
  /** ID único del estudiante */
  studentId: number;
  /** Nombre completo del estudiante */
  name: string;
  /** Callback ejecutado al hacer clic */
  onClick?: (id: number) => void;
}

export function StudentCard({ studentId, name, onClick }: StudentCardProps) {
  return <div onClick={() => onClick?.(studentId)}>{name}</div>;
}

// ❌ INCORRECTO - Props sin tipo o documentación
export function StudentCard(props) {
  return <div onClick={props.onclick}>{props.n}</div>;
}
```

---

## 🚀 Guía de Desarrollo - Tareas Comunes

### ➕ Agregar una Nueva Tab

**Pasos:**

1. **Crear el componente de la tab:**
   ```bash
   # Crear: src/components/tabs/NewFeatureTab.tsx
   ```

2. **Implementar el componente:**
   ```typescriptreact
   import React from 'react';
   import { useI18n } from '../../lib/i18n';

   export function NewFeatureTab() {
     const { t } = useI18n();
     
     return (
       <div className="dashboard-card">
         <h2>{t('dashboard.newFeature.title')}</h2>
         {/* Contenido */}
       </div>
     );
   }
   ```

3. **Agregar traducciones en `src/lib/i18n.tsx`:**
   ```typescript
   dashboard: {
     // ...existing tabs...
     newFeature: {
       title: 'Nueva Característica'
     }
   }
   ```

4. **Importar en `Dashboard.tsx`:**
   ```typescript
   import { NewFeatureTab } from './tabs/NewFeatureTab';
   ```

5. **Agregar en `Sidebar.tsx`:**
   ```typescript
   const tabs = [
     // ...existing tabs...
     { id: 'newFeature', label: t('dashboard.tabs.newFeature'), icon: IconComponent },
   ];
   ```

6. **Renderizar en `Dashboard.tsx`:**
   ```typescript
   {activeTab === 'newFeature' && <NewFeatureTab />}
   ```

### ➕ Agregar un Nuevo Servicio API

**Pasos:**

1. **Crear el modelo de dominio en `src/domain/models/NuevoItem.ts`:**
   ```typescript
   export interface NuevoItem {
     id: number;
     name: string;
   }
   ```
   Y re-exportar en `src/domain/models/index.ts`.

2. **Crear el port en `src/domain/ports/NuevoItemPort.ts`:**
   ```typescript
   import type { NuevoItem } from '../models';
   
   export interface NuevoItemPort {
     getItems(): Promise<NuevoItem[]>;
   }
   ```

3. **Crear el adaptador HTTP en `src/infrastructure/api/NuevoService.ts`:**
   ```typescript
   import { BaseService } from './BaseService';
   import type { NuevoItem } from '../../domain/models';

   export class NuevoService extends BaseService {
     private static readonly BASE_ENDPOINT = '/teacher-notebook/v1';

     static async getItems(): Promise<NuevoItem[]> {
       return this.get<NuevoItem[]>(this.BASE_ENDPOINT, '/items');
     }
   }
   ```

4. **Usar en componentes:**
   ```typescriptreact
   import { NuevoService } from '../../infrastructure/api/NuevoService';
   import type { NuevoItem } from '../../domain/models';

   export function MiComponente() {
     const [items, setItems] = useState<NuevoItem[]>([]);

     useEffect(() => {
       NuevoService.getItems()
         .then(setItems)
         .catch(error => console.error(error));
     }, []);

     return <div>{/* Renderizar items */}</div>;
   }
   ```

### ➕ Crear un Nuevo Modal

**Pasos:**

1. **Crear `src/components/modals/NuevoModal.tsx`:**
   ```typescriptreact
   import React from 'react';
   import { useI18n } from '../../lib/i18n';

   interface NuevoModalProps {
     isOpen: boolean;
     onClose: () => void;
     // ... otras props
   }

   export function NuevoModal({ isOpen, onClose }: NuevoModalProps) {
     const { t } = useI18n();
     
     return (
       <dialog className="modal-overlay" open={isOpen} aria-label={t('modal.title')} onClose={onClose}>
         <div className="modal-content">
           <h3 className="modal-title">{t('modal.title')}</h3>
           <div className="modal-body">
             {/* Contenido del modal */}
           </div>
           <div className="modal-footer">
             <button className="modal-button cancel" onClick={onClose}>
               {t('common.cancel')}
             </button>
             <button className="modal-button save" onClick={handleSave}>
               {t('common.save')}
             </button>
           </div>
         </div>
       </dialog>
     );
   }
   ```

---

## 🔧 Variables de Entorno

**Archivo:** `src/config/environment.ts`

Gestiona las URLs de API según el entorno (local, pre, pro).

```bash
# Ejecutar en diferente ambiente
npm run start:local    # Ambiente local
npm run start:pre      # Ambiente preproducción
npm run start:pro      # Ambiente producción
```

---

## 📝 Checklist para Nuevas Funcionalidades

- [ ] Crear archivos en el directorio correspondiente (`tabs/`, `modals/`, `services/`, etc.)
- [ ] Usar PascalCase para nombres de archivos y componentes
- [ ] Implementar interfaces TypeScript para props
- [ ] Agregar traducciones en `src/lib/i18n.tsx` (español e inglés)
- [ ] Usar `useI18n()` para textos dinámicos (no hardcodear)
- [ ] Heredar de `BaseService` si se crea un nuevo servicio API
- [ ] Agregar estilos en `src/index.css` (no crear archivos CSS separados)
- [ ] Usar componentes de `src/components/ui/` para elementos UI estándar
- [ ] Documentar props con interfaces JSDoc
- [ ] Probar con ambos idiomas (ES/EN)
- [ ] Testear en responsive (desktop y mobile)

---

## 📚 Referencias Rápidas

### Archivos Clave

| Archivo | Propósito |
|---------|----------|
| `src/index.css` | **Todos** los estilos CSS centralizados |
| `src/lib/i18n.tsx` | Sistema de traducciones (ES/EN) |
| `src/infrastructure/api/BaseService.ts` | Clase base para servicios API (adaptadores HTTP) |
| `src/components/Dashboard.tsx` | Componente principal del dashboard |
| `src/components/Sidebar.tsx` | Navegación lateral |
| `forge.config.ts` | Configuración de Electron |

### Hooks Personalizados

```typescript
import { useI18n } from '../lib/i18n';
const { t, locale, setLocale } = useI18n();
```

### Iconos Disponibles

Se usa **Lucide React**:
```typescript
import { Menu, ChevronDown, Users, BookOpen, Calendar, Clock, Settings, LogOut, RefreshCw } from 'lucide-react';
```

### Componentes de Radix UI

```typescript
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
// ... y más en src/components/ui/
```

---

## ⚠️ Errores Comunes a Evitar

| ❌ Error | ✅ Solución |
|--------|-----------|
| Hardcodear strings en componentes | Usar `t('clave')` del i18n |
| CSS en archivos separados | Agregar todo a `src/index.css` |
| Componentes en directorios aleatorios | Seguir estructura: `tabs/`, `modals/`, `components/` |
| Servicios sin heredar de `BaseService` | Siempre extender `BaseService` |
| Llamadas fetch directas en componentes | Usar adaptadores de `src/infrastructure/api/` |
| Props sin tipos TypeScript | Usar interfaces `{ComponentName}Props` |
| Ignorar multiidioma | Siempre agregar traducciones ES/EN |
| Inline styles | Usar clases CSS de `src/index.css` |

---

## 🛠️ Troubleshooting

### Problema: Componente no muestra idioma correcto
**Solución:** Asegúrate de que el archivo está dentro del `I18nProvider` y que las traducciones existen en ambos idiomas.

### Problema: Los estilos no se aplican
**Solución:** Verifica que:
1. La clase CSS existe en `src/index.css`
2. No hay conflicto con Tailwind CSS
3. La clase está correctamente escrita (kebab-case)

### Problema: El servicio no tiene datos
**Solución:**
1. Verifica el token JWT en `AuthService.getAccessToken()`
2. Verifica la URL del API en `src/config/environment.ts`
3. Revisa la consola para errores detallados

### Problema: Modal no se cierra
**Solución:** Asegúrate de que la función `onClose` actualiza correctamente el estado en el componente padre.

---

## 📚 Recursos Útiles

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Lucide Icons](https://lucide.dev)
- [Vite Documentation](https://vitejs.dev)

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0.0  
**Autor:** Manuel Farrapeira

---

## ♿️ Accesibilidad y HTML Semántico (actualizado 2025-12-23)

- Usa siempre elementos HTML semánticos en vez de roles ARIA sobre elementos genéricos. Ejemplo: usa `<button>` en vez de `<div role="button">`.
- Para modales y diálogos, usa el elemento `<dialog>` nativo de HTML5 en vez de `<div role="dialog">` o `<section role="dialog">`.
- No uses roles como `role="document"` o `role="dialog"` en `<div>`, `<section>`, `<article>`, etc. Usa el elemento semántico adecuado.
- Los overlays de modales deben ser `<dialog>` y el contenido interior un `<div>` o estructura semántica.
- No asignes event handlers (onClick, onKeyDown) a elementos no interactivos como `<div>`, `<span>`, `<section>`, etc. Usa `<button>`, `<a>`, `<dialog>`, etc.
- Si necesitas focus trap en un modal, implementa la lógica sobre `<dialog>` y sus hijos interactivos.
- Si SonarQube reporta issues de accesibilidad, semántica o ARIA, prioriza la solución usando HTML5 nativo.
- Ejemplo correcto de modal:

```tsx
<dialog open={isOpen} aria-label={t('common.error')}>
  <div className="modal-content">
    <h3>{t('common.error')}</h3>
    <button onClick={closeModal}>{t('common.close')}</button>
  </div>
</dialog>
```

- No uses `.at(-1)` en arrays si la versión de TypeScript no lo soporta; usa `.slice(-1)[0]`.
- Usa tipado estricto en errores (`unknown` y `instanceof`).
- Extrae ternarios anidados complejos a funciones helpers.
- Convierte condicionales a booleanos explícitos (`Boolean(valor)`).

---

## 📋 Validación de Formularios y UX (actualizado 2025-12-24)

### Principios de Validación

1. **Validación en tiempo real**: Los errores deben limpiarse cuando el usuario comienza a corregir el campo
2. **Feedback visual inmediato**: Borde rojo en inputs con error + mensaje descriptivo
3. **Foco automático**: El cursor debe moverse al primer campo con error tras submit
4. **Filtrado de entrada**: Prevenir caracteres inválidos antes de que se escriban

### Implementación Estándar

#### 1. Estructura de Estado

```tsx
interface FormData {
  name: string;
  town: string;
  tlf: string;
}

interface FormErrors {
  name?: string;
  tlf?: string;
}

const [formData, setFormData] = useState<FormData>({
  name: '',
  town: '',
  tlf: '',
});

const [formErrors, setFormErrors] = useState<FormErrors>({});

// Refs para focus management
const nameInputRef = useRef<HTMLInputElement>(null);
const tlfInputRef = useRef<HTMLInputElement>(null);
```

#### 2. Validación con Focus

```tsx
const validateForm = (): boolean => {
  const errors: FormErrors = {};

  // Validaciones
  if (!formData.name.trim()) {
    errors.name = t('validation.nameRequired');
  } else if (formData.name.trim().length < 5) {
    errors.name = t('validation.nameMinLength');
  }
  
  if (formData.tlf.trim()) {
    const phoneRegex = /^\d{9}$/;
    if (!phoneRegex.test(formData.tlf.trim())) {
      errors.tlf = t('validation.phoneInvalid');
    }
  }

  setFormErrors(errors);
  
  // Focus on first field with error
  if (errors.name) {
    nameInputRef.current?.focus();
  } else if (errors.tlf) {
    tlfInputRef.current?.focus();
  }
  
  return Object.keys(errors).length === 0;
};
```

#### 3. Filtrado de Entrada en Tiempo Real

```tsx
const handleInputChange = (field: keyof FormData, value: string) => {
  // Filter only numbers for phone field
  if (field === 'tlf') {
    value = value.replaceAll(/\D/g, ''); // Remove all non-digit characters
  }
  
  setFormData(prev => ({...prev, [field]: value}));
  
  // Clear error when user starts typing
  if (formErrors[field as keyof FormErrors]) {
    setFormErrors(prev => ({...prev, [field]: undefined}));
  }
};
```

#### 4. Markup del Input con Validación

```tsx
<div>
  <label className="login-label">
    {t('dashboard.schools.name')} 
    <span className="form-required-asterisk">*</span>
  </label>
  <input
    ref={nameInputRef}
    id="name"
    className={`modal-input ${formErrors.name ? 'input-error' : ''}`}
    value={formData.name}
    onChange={(e) => handleInputChange('name', e.target.value)}
    placeholder={t('dashboard.schools.namePlaceholder')}
    disabled={submitting}
  />
  {formErrors.name && (
    <p className="form-error-text">
      {formErrors.name}
    </p>
  )}
</div>

{/* Input numérico */}
<input
  ref={tlfInputRef}
  id="tlf"
  type="text"
  inputMode="numeric"
  className={`modal-input ${formErrors.tlf ? 'input-error' : ''}`}
  value={formData.tlf}
  onChange={(e) => handleInputChange('tlf', e.target.value)}
  maxLength={9}
/>
```

### Clases CSS para Validación

Definidas en `src/index.css`:

```css
/* Input con error */
.modal-input.input-error {
  border: 2px solid #ef4444;
  outline: none;
}

.modal-input.input-error:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Mensaje de error */
.form-error-text {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Asterisco de campo obligatorio */
.form-required-asterisk {
  color: #ef4444;
  margin-left: 0.25rem;
}
```

### Tipos de Validación Comunes

| Tipo | Implementación |
|------|----------------|
| **Campo obligatorio** | `if (!value.trim()) errors.field = t('validation.required')` |
| **Longitud mínima** | `if (value.length < 5) errors.field = t('validation.minLength')` |
| **Email** | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)` |
| **Teléfono (9 dígitos)** | `/^\d{9}$/.test(value)` |
| **Solo números** | `value.replaceAll(/\D/g, '')` en onChange |
| **Solo letras** | `value.replaceAll(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')` |

### Modales de Feedback

Todos los modales deben estar en `src/components/modals/`:

- `ErrorModal` - Mostrar errores del servidor o validación
- `SuccessModal` - Confirmación de acciones exitosas
- `ConfirmDeleteModal` - Confirmación antes de eliminar
- `LoadingModal` - Indicador de carga para operaciones largas

```tsx
<ErrorModal
  isOpen={errorDialogOpen}
  message={errorMessage}
  onClose={() => setErrorDialogOpen(false)}
/>

<SuccessModal
  isOpen={successDialogOpen}
  message={successMessage}
  onClose={() => setSuccessDialogOpen(false)}
/>
```

### Ejemplo Completo de Referencia

Ver `src/components/tabs/SchoolsTab.tsx` para ver la implementación completa de:
- Formulario de creación/edición
- Validación con múltiples campos
- Filtrado de entrada numérica
- Foco automático en errores
- Integración con modales de feedback
- Manejo de estados de carga

---

**Última actualización:** Diciembre 2024 (actualizado 2025-12-24)
