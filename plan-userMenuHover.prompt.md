# Plan: Menú de Usuario con Hover

## Objetivo
Reemplazar el botón de cerrar sesión y el selector de idioma en el sidebar por un botón de usuario circular que, al pasar el ratón por encima, despliega un menú con:
- Nombre del usuario
- Selector de idioma
- Botón de cerrar sesión

## Archivos a Modificar

### 1. Crear `src/components/UserMenu.tsx`
**Nuevo archivo** que contendrá el componente del menú de usuario.

**Características:**
- Botón circular con icono de usuario
- Dropdown que se abre con hover (onMouseEnter/onMouseLeave)
- También se puede abrir con click
- Cierre automático al hacer click fuera
- Contenido del menú:
  - Header con icono de usuario y nombre
  - Separador
  - Selector de idioma integrado
  - Separador
  - Botón de logout en rojo

**Props:**
```typescript
interface UserMenuProps {
  userName: string;
  onLogout: () => void;
}
```

### 2. Modificar `src\App.tsx`
- Pasar el prop `userName` al componente `Dashboard`
- Línea 73: Cambiar `<Dashboard onLogout={handleLogout} />` por `<Dashboard onLogout={handleLogout} userName={userName} />`

### 3. Modificar `src\components\Dashboard.tsx`
- Actualizar la interfaz `DashboardProps` para incluir `userName: string`
- Importar el componente `UserMenu`
- Reemplazar la sección `dashboard-logout-section` actual (líneas 115-120) con el nuevo componente `UserMenu`

**Cambios específicos:**
```typescript
// Importación
import { UserMenu } from './UserMenu';

// Interfaz
interface DashboardProps {
  onLogout: () => void;
  userName: string;
}

// Componente
export function Dashboard({ onLogout, userName }: Readonly<DashboardProps>) {

// JSX (reemplazar dashboard-logout-section)
<div className="dashboard-logout-section">
  <UserMenu userName={userName} onLogout={onLogout} />
</div>
```

### 4. Modificar `src/index.css`
Agregar los nuevos estilos CSS al final del archivo.

**Estilos necesarios:**
- `.user-menu-container` - Contenedor con position relative
- `.user-menu-button` - Botón circular con icono de usuario
- `.user-menu-dropdown` - Dropdown que se abre hacia arriba
- `.user-menu-header` - Header con nombre de usuario
- `.user-menu-name` - Estilo del nombre
- `.user-menu-divider` - Separadores
- `.user-menu-item` - Contenedor para el selector de idioma
- `.user-menu-logout` - Botón de logout en rojo
- `@keyframes slideUp` - Animación de apertura

**Actualizar también:**
- `.dashboard-logout-section` - Agregar `align-items: center` para centrar el botón

## Estructura del Componente UserMenu

```
<div className="user-menu-container">
  <button className="user-menu-button" onMouseEnter + onClick>
    <User icon />
  </button>
  
  {isOpen && (
    <div className="user-menu-dropdown" onMouseLeave>
      <div className="user-menu-header">
        <User icon /> + userName
      </div>
      
      <divider />
      
      <div className="user-menu-item">
        <LanguageSelector />
      </div>
      
      <divider />
      
      <button className="user-menu-logout" onClick={onLogout}>
        <LogOut icon /> + t('dashboard.logout')
      </button>
    </div>
  )}
</div>
```

## Comportamiento

1. **Hover**: Al pasar el ratón sobre el botón, se abre el menú
2. **Click**: También se puede hacer click para abrir/cerrar
3. **Mouse Leave**: Al salir del dropdown, se cierra automáticamente
4. **Click Outside**: Si se hace click fuera del componente, se cierra
5. **Animación**: El menú aparece con una animación suave de abajo hacia arriba

## Estilos Clave

- Botón circular de 40x40px con icono centrado
- Dropdown con sombra pronunciada y bordes redondeados
- Se abre hacia arriba (bottom: calc(100% + 0.5rem))
- Botón de logout en rojo (#dc2626) con hover en rojo claro
- Ancho mínimo del dropdown: 220px
- Animación slideUp de 0.2s

## Integración con Componentes Existentes

- **LanguageSelector**: Se reutiliza el componente existente
- **Traducción**: Se usa `useI18n()` para el texto del logout
- **Iconos**: Se usan `User` y `LogOut` de lucide-react

## Consideraciones

1. El selector de idioma dentro del menú debe tener width 100%
2. El dropdown del selector de idioma debe abrirse correctamente dentro del menú de usuario
3. El z-index del menú debe ser alto (1000) para asegurar visibilidad
4. Los clicks dentro del dropdown no deben cerrar el menú (excepto en logout)

