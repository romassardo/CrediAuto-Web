# 🎨 Guía de Diseño UI/UX - CrediAuto

## 📋 Índice
1. [Identidad Visual](#identidad-visual)
2. [Sistema de Colores](#sistema-de-colores)
3. [Tipografía](#tipografía)
4. [Espaciado y Layout](#espaciado-y-layout)
5. [Componentes Base](#componentes-base)
6. [Patrones de Diseño](#patrones-de-diseño)
7. [Estados y Interacciones](#estados-y-interacciones)
8. [Formularios](#formularios)
9. [Elementos Decorativos](#elementos-decorativos)
10. [Responsive Design](#responsive-design)
11. [Accesibilidad](#accesibilidad)
12. [Implementación Técnica](#implementación-técnica)

---

## 🎯 Identidad Visual

### Logo y Marca
- **Logo principal**: `crediexpress-logo.png` (400x98px)
- **Logo sin fondo**: `crediexpress-logo-sinfondo.png` (para fondos complejos)
- **Uso del logo**: Siempre mantener proporciones, tamaño mínimo 120px de ancho
- **Posicionamiento**: Superior izquierdo en headers, centrado en heros

### Personalidad de Marca
- **Confiable**: Colores sólidos, tipografía legible
- **Profesional**: Espaciado generoso, jerarquía clara
- **Moderno**: Gradientes sutiles, bordes redondeados
- **Accesible**: Contrastes altos, elementos grandes

---

## 🎨 Sistema de Colores

### Colores Primarios
```css
/* Azul Corporativo - Color principal de la marca */
--brand-primary-600: #2e3192;  /* Botones principales, títulos destacados */
--brand-primary-700: #1f2266;  /* Hover states, énfasis */
--brand-primary-800: #16184b;  /* Gradientes profundos, fondos oscuros */

/* Amarillo Acento - Color secundario vibrante */
--brand-accent-500: #ffc20e;   /* CTAs secundarios, highlights, elementos decorativos */
```

### Colores de Estado
```css
--state-success-500: #00a859;  /* Confirmaciones, éxito */
--state-warning-500: #ff6b35;  /* Advertencias, atención */
--state-error-500: #e53935;    /* Errores, validaciones */
```

### Colores Neutros
```css
--color-bg: #ffffff;           /* Fondo principal */
--color-surface: #f5f7fa;      /* Tarjetas, secciones */
--color-text: #333333;         /* Texto principal */
--border-200: #e6eaf0;         /* Bordes sutiles */
```

### Uso de Gradientes
```css
/* Gradiente principal - Fondos de sección */
background: linear-gradient(135deg, from-white via-slate-50 to-blue-50);

/* Gradiente de marca - Botones importantes */
background: linear-gradient(90deg, var(--brand-primary-600), var(--brand-primary-700));

/* Gradiente de acento - Elementos destacados */
background: linear-gradient(90deg, var(--brand-accent-500), #ffd700);

/* Gradiente de texto - Títulos especiales */
background: linear-gradient(90deg, var(--brand-accent-500), #ffd700);
background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## ✍️ Tipografía

### Jerarquía de Títulos
```css
/* H1 - Títulos principales de página */
font-size: 3.5rem;    /* 56px */
font-weight: 700;     /* Bold */
line-height: 1.1;
letter-spacing: -0.02em;

/* H2 - Títulos de sección */
font-size: 2.5rem;    /* 40px */
font-weight: 700;
line-height: 1.2;

/* H3 - Subtítulos */
font-size: 1.5rem;    /* 24px */
font-weight: 600;     /* Semibold */
line-height: 1.3;
```

### Texto de Cuerpo
```css
/* Texto principal */
font-size: 1rem;      /* 16px */
line-height: 1.6;
color: var(--color-text);

/* Texto grande - Leads, descripciones importantes */
font-size: 1.25rem;   /* 20px */
line-height: 1.6;
color: #6b7280;

/* Texto pequeño - Metadatos, ayudas */
font-size: 0.875rem;  /* 14px */
line-height: 1.5;
color: #6b7280;
```

### Pesos y Estilos
- **Regular (400)**: Texto de cuerpo
- **Medium (500)**: Enlaces, labels
- **Semibold (600)**: Subtítulos, elementos destacados
- **Bold (700)**: Títulos principales, botones

---

## 📐 Espaciado y Layout

### Sistema de Espaciado (Múltiplos de 4px)
```css
--spacing-1: 0.25rem;  /* 4px  - Espaciado mínimo */
--spacing-2: 0.5rem;   /* 8px  - Elementos muy cercanos */
--spacing-3: 0.75rem;  /* 12px - Padding interno pequeño */
--spacing-4: 1rem;     /* 16px - Espaciado base */
--spacing-6: 1.5rem;   /* 24px - Separación entre elementos */
--spacing-8: 2rem;     /* 32px - Separación entre secciones */
--spacing-12: 3rem;    /* 48px - Espaciado grande */
--spacing-16: 4rem;    /* 64px - Separación entre bloques principales */
```

### Grid System
```css
/* Container principal */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Grid de 2 columnas - Patrón principal */
.grid-cols-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

/* Grid responsive */
@media (max-width: 1024px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
```

### Bordes Redondeados
```css
--radius-sm: 4px;      /* Elementos pequeños */
--radius-md: 8px;      /* Botones, inputs */
--radius-lg: 12px;     /* Tarjetas */
--radius-xl: 16px;     /* Secciones grandes */
--radius-2xl: 24px;    /* Elementos destacados */
```

---

## 🧩 Componentes Base

### Botones

#### Botón Primario
```tsx
<Button className="bg-brand-primary-600 hover:bg-brand-primary-700 text-white shadow-lg shadow-brand-primary-600/25 px-8 py-4 text-lg font-semibold transition-all">
  Texto del Botón
</Button>
```

#### Botón Secundario (Outline)
```tsx
<Button variant="outline" className="border-2 border-brand-primary-600 text-brand-primary-600 hover:bg-brand-primary-600 hover:text-white px-8 py-4 text-lg font-semibold transition-all">
  Texto del Botón
</Button>
```

#### Botón de Acento
```tsx
<Button className="bg-brand-accent-500 hover:bg-yellow-400 text-gray-900 font-bold px-8 py-4 text-lg shadow-xl shadow-black/20 transition-all transform hover:scale-105">
  Texto del Botón
</Button>
```

### Tarjetas (Cards)

#### Tarjeta Base
```tsx
<div className="bg-white rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden">
  <div className="p-8">
    {/* Contenido */}
  </div>
</div>
```

#### Tarjeta con Gradiente de Header
```tsx
<div className="bg-white rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden">
  <div className="bg-gradient-to-r from-brand-primary-600 via-brand-primary-700 to-brand-primary-800 px-8 py-8 text-center relative overflow-hidden">
    {/* Elementos decorativos */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-accent-500/20 rounded-full translate-y-12 -translate-x-12"></div>
    
    {/* Contenido del header */}
    <div className="relative">
      <h2 className="text-3xl font-bold text-white mb-2">Título</h2>
      <p className="text-brand-primary-100 text-lg">Descripción</p>
    </div>
  </div>
  <div className="p-8">
    {/* Contenido principal */}
  </div>
</div>
```

### Badges y Etiquetas

#### Badge Informativo
```tsx
<div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-accent-500/10 border border-brand-accent-500/20">
  <span className="text-sm font-medium text-brand-primary-600">✨ Texto del badge</span>
</div>
```

#### Badge de Estado
```tsx
<div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 border border-green-200">
  <span className="text-xs font-medium text-green-800">Activo</span>
</div>
```---

## 🎭 Patrones de Diseño

### Secciones Hero

#### Estructura Base
```tsx
<section className="relative overflow-hidden bg-white">
  {/* Imagen de fondo con overlay */}
  <div className="absolute inset-0">
    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-white/40 z-10"></div>
    <Image src="..." fill className="object-cover object-center" />
  </div>
  
  {/* Gradiente adicional */}
  <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-600/5 via-transparent to-brand-accent-500/5 z-20"></div>
  
  {/* Contenido */}
  <div className="container mx-auto px-6 sm:px-8 py-20 sm:py-32 relative z-30">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      {/* Columna izquierda - Texto */}
      <div className="space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-accent-500/10 border border-brand-accent-500/20">
          <span className="text-sm font-medium text-brand-primary-600 drop-shadow-sm">✨ Mensaje destacado</span>
        </div>
        
        {/* Título principal */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight drop-shadow-lg">
          <span className="text-brand-primary-600 drop-shadow-md">Palabra</span>
          <br />
          <span className="text-gray-900 drop-shadow-md">clave</span>
          <br />
          <span className="bg-gradient-to-r from-brand-accent-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-md">destacada</span>
        </h1>
        
        {/* Descripción */}
        <p className="text-xl text-gray-600 max-w-prose leading-relaxed drop-shadow-sm">
          Descripción principal con <span className="font-semibold text-brand-primary-600 drop-shadow-sm">palabras destacadas</span>.
        </p>
        
        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="bg-brand-primary-600 hover:bg-brand-primary-700 text-white shadow-lg shadow-brand-primary-600/25 px-8 py-4 text-lg font-semibold transition-all">
            CTA Principal
          </Button>
          <Button variant="outline" size="lg" className="border-2 border-brand-primary-600 text-brand-primary-600 hover:bg-brand-primary-600 hover:text-white px-8 py-4 text-lg font-semibold transition-all">
            CTA Secundario
          </Button>
        </div>
      </div>
      
      {/* Columna derecha - Visual */}
      <div className="relative flex items-center justify-center">
        {/* Contenido visual */}
      </div>
    </div>
  </div>
</section>
```

### Secciones de Contenido

#### Patrón Estándar
```tsx
<section className="bg-gradient-to-br from-white via-gray-50 to-slate-100 py-20 sm:py-28 relative overflow-hidden">
  {/* Elementos decorativos */}
  <div className="absolute top-16 right-20 w-20 h-20 bg-brand-accent-500/10 rounded-full blur-xl"></div>
  <div className="absolute bottom-20 left-16 w-28 h-28 bg-brand-primary-600/10 rounded-full blur-xl"></div>
  
  <div className="container mx-auto px-6 sm:px-8 relative">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      {/* Contenido */}
    </div>
  </div>
</section>
```

### Mockups y Elementos Visuales

#### Dashboard Mockup
```tsx
<div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-200 transform rotate-3 hover:rotate-1 transition-transform duration-500">
  <div className="space-y-4">
    {/* Header del dashboard */}
    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-primary-600 rounded-lg flex items-center justify-center">
          <Building className="w-4 h-4 text-white" />
        </div>
        <div className="text-sm font-semibold text-gray-800">Título Dashboard</div>
      </div>
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
      </div>
    </div>
    
    {/* Contenido del mockup */}
    {/* ... */}
  </div>
</div>
```

---

## ⚡ Estados y Interacciones

### Transiciones Base
```css
/* Transición estándar para la mayoría de elementos */
transition: all 0.3s ease;

/* Transición para hover en botones */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Transición para transformaciones */
transition: transform 0.5s ease;
```

### Estados de Hover
```css
/* Botones */
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(46, 49, 146, 0.25);
}

/* Tarjetas */
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* Enlaces */
.link:hover {
  color: var(--brand-primary-700);
  text-decoration: underline;
}
```

### Estados de Focus
```css
/* Focus visible para accesibilidad */
:focus-visible {
  outline: 2px solid var(--brand-accent-500);
  outline-offset: 2px;
}

/* Focus en inputs */
.input:focus {
  border-color: var(--brand-primary-600);
  box-shadow: 0 0 0 3px rgba(46, 49, 146, 0.1);
}
```

### Animaciones
```css
/* Pulse para elementos decorativos */
@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.8; }
}

/* Bounce para elementos llamativos */
@keyframes bounce {
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
  40%, 43% { transform: translate3d(0, -8px, 0); }
  70% { transform: translate3d(0, -4px, 0); }
  90% { transform: translate3d(0, -2px, 0); }
}

/* Spin para loaders */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```---

## 📝 Formularios

### Estructura Base de Formulario
```tsx
<form className="p-8 space-y-8">
  {/* Sección del formulario */}
  <div className="space-y-6">
    <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
      <div className="w-8 h-8 bg-brand-primary-600 rounded-full flex items-center justify-center shadow-sm">
        <User className="w-4 h-4 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900">Título de Sección</h3>
    </div>

    {/* Campos del formulario */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Campo individual */}
    </div>
  </div>
</form>
```

### Campos de Input
```tsx
<div>
  <label htmlFor="campo" className="block text-sm font-medium text-gray-700 mb-2">
    Etiqueta del Campo *
  </label>
  <input
    type="text"
    id="campo"
    name="campo"
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm"
    placeholder="Texto de ayuda"
    required
  />
</div>
```

### Checkbox y Términos
```tsx
<div className="flex items-start gap-3">
  <input
    type="checkbox"
    id="terminos"
    className="mt-1 w-4 h-4 text-brand-primary-600 border-gray-300 rounded focus:ring-brand-primary-600"
    required
  />
  <label htmlFor="terminos" className="text-sm text-gray-600 leading-relaxed">
    Acepto los <Link href="#" className="text-brand-primary-600 hover:underline font-medium">términos y condiciones</Link>.
  </label>
</div>
```

### Botón de Envío
```tsx
<button
  type="submit"
  disabled={!isFormValid || isSubmitting}
  className="w-full bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 hover:from-brand-primary-700 hover:to-brand-primary-800 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
>
  {isSubmitting ? (
    <>
      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      Procesando...
    </>
  ) : (
    <>
      <Icon className="w-5 h-5" />
      Texto del Botón
    </>
  )}
</button>
```

---

## ✨ Elementos Decorativos

### Círculos de Fondo
```tsx
{/* Elementos decorativos de fondo */}
<div className="absolute top-20 left-10 w-32 h-32 bg-brand-primary-600/10 rounded-full blur-xl animate-pulse"></div>
<div className="absolute bottom-20 right-10 w-24 h-24 bg-brand-accent-500/10 rounded-full blur-xl animate-bounce"></div>
<div className="absolute top-1/2 left-1/4 w-16 h-16 bg-brand-accent-500/5 rounded-full blur-lg animate-pulse"></div>
```

### Elementos Flotantes Pequeños
```tsx
{/* Elementos decorativos flotantes */}
<div className="absolute top-12 right-12 w-6 h-6 bg-brand-primary-600 rounded-full opacity-60 animate-pulse"></div>
<div className="absolute bottom-16 left-16 w-4 h-4 bg-brand-accent-500 rounded-full opacity-60 animate-pulse delay-300"></div>
<div className="absolute top-1/2 -right-6 w-8 h-8 bg-gradient-to-r from-brand-primary-600 to-brand-accent-500 rounded-full opacity-40 animate-pulse delay-700"></div>
```

### Gradientes de Overlay
```tsx
{/* Overlay para imágenes de fondo */}
<div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-white/40 z-10"></div>

{/* Gradiente sutil de marca */}
<div className="absolute inset-0 bg-gradient-to-br from-brand-primary-600/5 via-transparent to-brand-accent-500/5 z-20"></div>
```

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
/* Base: 320px+ (mobile) */

/* Small: 640px+ (large mobile) */
@media (min-width: 640px) { }

/* Medium: 768px+ (tablet) */
@media (min-width: 768px) { }

/* Large: 1024px+ (desktop) */
@media (min-width: 1024px) { }

/* Extra Large: 1280px+ (large desktop) */
@media (min-width: 1280px) { }
```

### Patrones Responsive

#### Grid Responsive
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
  {/* En mobile: 1 columna, en desktop: 2 columnas */}
</div>
```

#### Espaciado Responsive
```tsx
<div className="py-12 sm:py-20 lg:py-28">
  {/* Padding vertical que crece con el tamaño de pantalla */}
</div>
```

#### Tipografía Responsive
```tsx
<h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold">
  {/* Tamaño de fuente que escala */}
</h1>
```

#### Navegación Responsive
```tsx
<nav className="hidden md:flex items-center space-x-6">
  {/* Navegación oculta en mobile, visible en desktop */}
</nav>
```---

## ♿ Accesibilidad

### Contraste de Colores
- **Texto normal**: Mínimo 4.5:1 con el fondo
- **Texto grande**: Mínimo 3:1 con el fondo
- **Elementos interactivos**: Mínimo 3:1 con elementos adyacentes

### Navegación por Teclado
```tsx
{/* Focus visible */}
<button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2">
  Botón Accesible
</button>

{/* Skip links */}
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand-primary-600 text-white px-4 py-2 rounded">
  Saltar al contenido principal
</a>
```

### Semántica HTML
```tsx
{/* Estructura semántica */}
<header role="banner">
  <nav role="navigation" aria-label="Navegación principal">
    {/* Enlaces de navegación */}
  </nav>
</header>

<main role="main">
  <section aria-labelledby="hero-title">
    <h1 id="hero-title">Título Principal</h1>
  </section>
</main>

{/* ARIA labels */}
<button aria-describedby="hero-title" aria-label="Comenzar proceso de solicitud">
  Comenzar ahora
</button>
```

---

## 🛠️ Implementación Técnica

### Variables CSS Personalizadas
```css
/* En globals.css */
:root {
  /* Colores de marca */
  --brand-primary-600: #2e3192;
  --brand-primary-700: #1f2266;
  --brand-primary-800: #16184b;
  --brand-accent-500: #ffc20e;
  
  /* Estados */
  --state-success-500: #00a859;
  --state-warning-500: #ff6b35;
  --state-error-500: #e53935;
  
  /* Espaciado */
  --spacing-4: 1rem;
  --spacing-8: 2rem;
  --spacing-16: 4rem;
  
  /* Bordes */
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}
```

### Clases Utilitarias Personalizadas
```css
/* Utilidades específicas del proyecto */
.text-brand-primary {
  color: var(--brand-primary-600);
}

.bg-brand-primary {
  background-color: var(--brand-primary-600);
}

.gradient-brand {
  background: linear-gradient(90deg, var(--brand-primary-600), var(--brand-primary-700));
}

.shadow-brand {
  box-shadow: 0 10px 25px rgba(46, 49, 146, 0.25);
}
```

---

## 📋 Checklist de Implementación

### ✅ Para Cada Nueva Página
- [ ] Aplicar gradiente de fondo base: `bg-gradient-to-br from-white via-slate-50 to-blue-50`
- [ ] Incluir elementos decorativos de fondo (círculos difuminados)
- [ ] Usar container con padding: `container mx-auto px-6 sm:px-8`
- [ ] Implementar grid responsive: `grid grid-cols-1 lg:grid-cols-2 gap-16`
- [ ] Añadir espaciado vertical: `py-20 sm:py-28`
- [ ] Incluir badge informativo en la parte superior
- [ ] Aplicar jerarquía tipográfica correcta
- [ ] Añadir transiciones y estados hover
- [ ] Verificar contraste de colores
- [ ] Probar navegación por teclado

### ✅ Para Cada Componente
- [ ] Usar colores del sistema definido
- [ ] Aplicar espaciado consistente
- [ ] Incluir estados de hover y focus
- [ ] Añadir transiciones suaves
- [ ] Verificar responsive design
- [ ] Incluir atributos de accesibilidad
- [ ] Usar iconos de Lucide React
- [ ] Aplicar sombras apropiadas

### ✅ Para Formularios
- [ ] Usar estructura de secciones con iconos
- [ ] Aplicar estilos de input consistentes
- [ ] Incluir validación visual
- [ ] Añadir estados de loading
- [ ] Implementar mensajes de error/éxito
- [ ] Verificar accesibilidad de labels
- [ ] Probar navegación por teclado

---

## 🎯 Conclusión

Esta guía establece los fundamentos visuales y de experiencia de usuario para CrediAuto. Cada elemento ha sido diseñado para transmitir confianza, profesionalismo y modernidad, manteniendo siempre la accesibilidad y usabilidad como prioridades.

### Principios Clave a Recordar:
1. **Consistencia**: Usar siempre los mismos patrones y componentes
2. **Jerarquía**: Mantener una estructura visual clara
3. **Accesibilidad**: Considerar todos los usuarios desde el diseño
4. **Performance**: Optimizar imágenes y animaciones
5. **Responsive**: Diseñar mobile-first

### Próximos Pasos:
- Aplicar esta guía a todas las páginas nuevas
- Revisar páginas existentes para asegurar consistencia
- Actualizar componentes según evolucione el diseño
- Realizar pruebas de usabilidad regulares

---

*Guía creada el 24 de Agosto de 2025 - Versión 1.0*