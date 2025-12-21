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

**Estas reglas son obligatorias para cualquier cambio, sugerencia o generación de código en este repositorio.**

Última actualización: 2025-12-21

