# Instrucciones para GitHub Copilot en este proyecto

Estas instrucciones deben ser seguidas por Copilot y cualquier asistente de IA en cada nueva petición relacionada con este repositorio.

---

## 📚 Contexto del Proyecto

Este proyecto es una aplicación de escritorio construida con Electron, React y TypeScript para la gestión académica. Toda la estructura, estilos, internacionalización y servicios siguen convenciones estrictas descritas en el archivo `PROJECT_CONTEXT.md` en la raíz del proyecto.

---

## 📝 Reglas y Convenciones a Seguir

1. **Estructura de Carpetas**
   - Los componentes de tabs van en `src/components/tabs/` (un archivo por tab)
   - Los selectores van en `src/components/selectors/`
   - Los modales van en `src/components/modals/`
   - Los componentes base de UI van en `src/components/ui/`
   - Los servicios de API van en `src/services/` y heredan de `BaseService`
   - Los estilos van centralizados en `src/index.css` (no crear archivos CSS nuevos)
   - Las traducciones van en `src/lib/i18n.tsx` (no hardcodear textos)

2. **Nombres y Tipado**
   - Usar PascalCase para archivos y componentes React
   - Todas las props deben estar tipadas con interfaces TypeScript bien documentadas
   - Documentar las props y funciones con JSDoc

3. **Estilos**
   - Usar solo clases CSS definidas en `src/index.css` y utilidades de Tailwind
   - No usar estilos inline ni CSS Modules
   - Prefijar las clases según la sección: `dashboard-`, `login-`, `modal-`, etc.

4. **Internacionalización**
   - Todos los textos deben obtenerse con el hook `useI18n()` y la función `t('clave')`
   - Si se añade un texto nuevo, debe agregarse en ambos idiomas en `src/lib/i18n.tsx`

5. **Servicios API**
   - Todos los servicios deben heredar de `BaseService`
   - No hacer llamadas fetch directas en componentes
   - Manejar errores usando la lógica centralizada de `BaseService`

6. **Componentes**
   - Cada tab, modal o selector debe estar en su propio archivo
   - Usar componentes de `src/components/ui/` para UI estándar
   - Seguir los ejemplos y patrones del archivo `PROJECT_CONTEXT.md`

7. **Checklist para nuevas funcionalidades**
   - Crear archivos en el directorio correcto
   - Usar PascalCase y tipado estricto
   - Agregar traducciones ES/EN
   - Usar solo estilos centralizados
   - Heredar de `BaseService` para nuevos servicios
   - Probar en ambos idiomas y en responsive

8. **Errores comunes a evitar**
   - No hardcodear textos
   - No crear archivos CSS nuevos
   - No usar estilos inline
   - No crear componentes fuera de los directorios estándar
   - No hacer llamadas fetch directas

9. **Referencias**
   - Consultar siempre el archivo `PROJECT_CONTEXT.md` para ejemplos, estructura y convenciones
   - Usar los hooks y utilidades ya definidos en el proyecto

---

## 🎨 Estructura CSS para Tabs

**Cuando crees una nueva tab, SIEMPRE debes seguir esta estructura CSS básica:**

### Estructura Básica Requerida

```tsx
import React from 'react';
import { IconName } from 'lucide-react';
import { useI18n } from '../../lib/i18n';

export function NuevaTab() {
  const { t } = useI18n();

  return (
    <div className="dashboard-card">
      {/* Header (opcional) */}
      <div className="dashboard-section-header">
        <h2 className="dashboard-section-title">{t('dashboard.nueva.title')}</h2>
        <button className="dashboard-add-btn">
          {t('dashboard.nueva.addNew')}
        </button>
      </div>

      {/* Estado vacío o contenido */}
      <div className="dashboard-empty">
        <IconName className="dashboard-empty-icon" />
        <p className="dashboard-empty-text">{t('dashboard.nueva.emptyMessage')}</p>
      </div>
    </div>
  );
}
```

### Clases CSS Disponibles para Tabs

**Contenedores:**
- `dashboard-card` - Contenedor principal de la tab (fondo blanco, borde, padding)

**Headers:**
- `dashboard-section-header` - Contenedor flex para título y botón
- `dashboard-section-title` - Título de la sección (1.25rem, font-weight: 600)

**Botones:**
- `dashboard-add-btn` - Botón de acción principal (azul, hover effect)

**Estados vacíos:**
- `dashboard-empty` - Contenedor centrado para estado vacío
- `dashboard-empty-icon` - Icono del estado vacío (3rem, color gris)
- `dashboard-empty-text` - Texto del estado vacío (color gris)

**Formularios y modales:**
- `modal-overlay` - Overlay de fondo para modales
- `modal-content` - Contenedor del modal (fondo blanco, bordes redondeados)
- `modal-title` - Título del modal
- `modal-body` - Cuerpo del modal (flex column, gap)
- `modal-input` - Input estándar del modal
- `modal-footer` - Footer del modal (flex, justify-end)
- `modal-button` - Botón del modal (base)
- `modal-button cancel` - Botón cancelar (borde, fondo blanco)
- `modal-button save` - Botón guardar (azul, sin borde)

**Listas y estudiantes:**
- `dashboard-search` - Input de búsqueda
- `dashboard-students` - Contenedor de lista de estudiantes
- `dashboard-student` - Item individual de estudiante
- `dashboard-student-info` - Contenedor de info del estudiante
- `dashboard-student-avatar` - Avatar circular del estudiante
- `dashboard-student-name` - Nombre del estudiante
- `dashboard-student-grade` - Grado del estudiante
- `dashboard-badge` - Badge de estado

**Animaciones:**
- `icon-spin` - Animación de rotación para spinners
- `animate-spin` - Animación de rotación (alternativa)

### ❌ NO Hacer

1. **NO usar componentes de shadcn/ui** directamente en tabs:
   ```tsx
   // ❌ INCORRECTO
   import { Card, CardHeader, CardTitle } from '../ui/card';
   <Card><CardHeader>...</CardHeader></Card>
   ```

2. **NO usar Tailwind directamente** para la estructura principal:
   ```tsx
   // ❌ INCORRECTO
   <div className="space-y-6 p-6">
     <div className="bg-white rounded-lg shadow">
   ```

3. **NO usar estilos inline** para estructura:
   ```tsx
   // ❌ INCORRECTO (solo usar para ajustes menores)
   <div style={{ display: 'flex', gap: '1rem' }}>
   ```

### ✅ SÍ Hacer

1. **Usar clases CSS del index.css:**
   ```tsx
   // ✅ CORRECTO
   <div className="dashboard-card">
     <div className="dashboard-section-header">
   ```

2. **Seguir el patrón de otras tabs** (StudentsTab, ClassesTab, etc.)

3. **Consultar `src/index.css`** para ver todas las clases disponibles

### Ejemplo Completo

Ver `src/components/tabs/ClassesTab.tsx` como referencia de una tab simple.
Ver `src/components/tabs/SchoolsTab.tsx` como referencia de una tab con formulario y lista.

---

## ♿️ Accesibilidad y HTML Semántico (actualizado 2025-12-23)

- Siempre usa elementos HTML semánticos en vez de roles ARIA sobre elementos genéricos. Ejemplo: usa `<button>` en vez de `<div role="button">`.
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

### Validación de Campos

1. **Inputs numéricos**: 
   - Filtrar caracteres no numéricos en tiempo real usando `replaceAll(/\D/g, '')`
   - Usar `type="text"` con `inputMode="numeric"` para mejor experiencia en móviles
   - Establecer `maxLength` apropiado

   ```tsx
   const handleInputChange = (field: string, value: string) => {
     if (field === 'tlf') {
       value = value.replaceAll(/\D/g, ''); // Solo números
     }
     setFormData(prev => ({...prev, [field]: value}));
   };
   ```

2. **Indicadores visuales de error**:
   - Inputs con errores deben tener la clase `input-error` que muestra borde rojo
   - Mostrar mensajes de error debajo del input usando clase `form-error-text`
   
   ```tsx
   <input
     className={`modal-input ${formErrors.name ? 'input-error' : ''}`}
     // ...
   />
   {formErrors.name && (
     <p className="form-error-text">{formErrors.name}</p>
   )}
   ```

3. **Foco automático en errores**:
   - Usar `useRef` para crear referencias a los inputs
   - En la función de validación, enfocar el primer campo con error
   
   ```tsx
   const nameInputRef = useRef<HTMLInputElement>(null);
   const tlfInputRef = useRef<HTMLInputElement>(null);
   
   const validateForm = (): boolean => {
     const errors: FormErrors = {};
     // ... validaciones ...
     
     // Focus on first field with error
     if (errors.name) {
       nameInputRef.current?.focus();
     } else if (errors.tlf) {
       tlfInputRef.current?.focus();
     }
     
     return Object.keys(errors).length === 0;
   };
   ```

4. **Clases CSS para errores**:
   - `.input-error` - Borde rojo 2px (#ef4444)
   - `.form-error-text` - Texto de error en rojo
   - `.form-required-asterisk` - Asterisco rojo para campos obligatorios

### Modales

- Los modales deben estar en `src/components/modals/` (no en las tabs)
- Usar componentes reutilizables: `ErrorModal`, `SuccessModal`, `ConfirmDeleteModal`
- Los modales deben usar el elemento `<dialog>` con clase `modal-overlay`
- El contenido del modal debe estar en un `<div>` con clase `modal-content`
- Los modales deben centrarse usando flexbox en el overlay

```tsx
<dialog className="modal-overlay" open={isOpen}>
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
    <div className="modal-content">
      {/* Contenido del modal */}
    </div>
  </div>
</dialog>
```

### Patrones de Formulario

Ver `src/components/tabs/SchoolsTab.tsx` como referencia completa de:
- Validación de formularios con múltiples campos
- Manejo de errores visuales
- Foco automático en campos con error
- Filtrado de entrada en tiempo real
- Integración con modales de error/éxito

---

**Estas reglas son obligatorias para cualquier cambio, sugerencia o generación de código en este repositorio.**

Última actualización: 2025-12-24
