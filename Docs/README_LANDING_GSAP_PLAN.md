# Landing Modernization Plan (GSAP + Performance First)

## Objetivo
Modernizar la landing page con una experiencia visual mas cinematica y contemporanea,
sin perder accesibilidad, compatibilidad y rendimiento en dispositivos low-end.

## Alcance
Secciones actuales:
- Navbar
- Hero
- Stats
- Features
- How It Works
- Pricing
- CTA
- Footer

Regla confirmada:
- La landing (ruta /) siempre usa tema cosmic, sin depender de la preferencia de tema del usuario.

Se mantendra:
- Estructura App Router en src/app/page.tsx
- i18n via useLanguage + keys existentes
- Tokens semanticos de tema (primary, border, muted, etc.)

## Principios Tecnicos
- Performance first: transformar y opacidad antes que propiedades de layout.
- Motion con sentido: pocas animaciones clave, muy bien orquestadas.
- Progressive enhancement: la landing debe verse bien aunque no cargue GSAP.
- Accesibilidad: soporte prefers-reduced-motion y foco en legibilidad.
- Responsividad real: ajustes de animacion por breakpoint con matchMedia.

## Vision Creativa (v1)
Direccion visual propuesta:
- Estetica: producto SaaS premium con narrativa por scroll.
- Sensacion: "pagina viva" con transiciones de capas entre bloques.
- Ritmo: hero impactante, secciones con entradas dirigidas, cierre potente en CTA.

## Arquitectura de Animacion Propuesta

### 1) Base Layer (Foundation)
- Crear utilidades compartidas para:
  - inicializacion GSAP segura en cliente
  - reduced motion guard
  - presets de easings y duraciones
  - helper para matchMedia
- Definir convencion de data-attributes para targets de animacion.

### 2) Section Reveals (ScrollTrigger)
- Cada seccion entra con una coreografia corta (titulo, texto, bloque visual).
- Uso de batch para items repetitivos (cards, pills, stats).
- Sin markers en produccion.

### 3) Scroll Story Effects
- Efecto "sheet/page under reveal":
  - pin de contenedor seccional y desplazamiento vertical controlado
  - capa superior reduce opacidad/escala ligera mientras emerge la siguiente
- Efecto "texto que aparece/desaparece en el mismo plano":
  - timeline scrub con bloques de copy posicionados por fases
  - crossfade + translateY suave para evitar saltos

### 4) Component Upgrades
- Features carousel:
  - mejorar snap y easing de rotacion/stack
  - pausar en hover y en tab oculta
  - teclado y aria reforzados
- Hero mock dashboard:
  - micro parallax en capas internas
  - entrada escalonada de metricas y lista
- Pricing cards:
  - reveal en cascada + hover states fluidos
- CTA:
  - cierre con timeline corto de alto impacto

### 5) Navigation + Continuity
- Navbar con estado reactivo al scroll (compact mode, backdrop intensivo).
- Scroll progress indicator discreto.
- Anchors (#features, #pricing, etc.) con scroll suave y sincronizacion de estado.

## Fases de Implementacion

## Phase 0 - Baseline y Guardrails
Estado: Pending
- Levantar baseline de performance (Lighthouse + Web Vitals).
- Definir presupuestos:
  - LCP <= 2.5s (desktop target)
  - CLS <= 0.1
  - INP <= 200ms
- Validar fallback sin JS y reduced motion.

## Phase 1 - Infra de Motion
Estado: In Progress
- Instalar/validar plugins GSAP necesarios.
- Crear capa de helpers/hooks para animaciones en React.
- Implementar util de breakpoints y reduced motion.

## Phase 2 - Entradas por Seccion
Estado: Done
- Hero, Stats, Features, How It Works, Pricing, CTA.
- Reemplazar transiciones CSS costosas por transform/opacity donde aplique.
- Ajustar timings por viewport.

## Phase 3 - Scroll Narrative Avanzado
Estado: Done
- Implementar transicion tipo hoja/pagina entre bloques principales.
- Implementar narrativa de texto pinned/scrub en una seccion clave.
- Afinar para evitar scroll-jank en moviles.

## Phase 4 - Carousel y Microinteracciones
Estado: Done
- Refactor de carousel de Features con timeline mas estable.
- Gestos/controles accesibles (teclado, foco, labels).
- Mejoras de hover/focus en cards y botones principales.

## Phase 5 - QA, Hardening y Launch
Estado: Pending
- QA cross-browser: Chrome, Edge, Firefox, Safari.
- QA mobile: iOS Safari, Android Chrome.
- Ajustes finales de performance y limpieza de listeners/triggers.
- Documentar decisiones y resultados en este README.

## Matriz de Riesgos
- Riesgo: exceso de ScrollTriggers.
  - Mitigacion: consolidar timelines por seccion y matar triggers en cleanup.
- Riesgo: jank en telefonos de gama baja.
  - Mitigacion: reducir capas animadas, duraciones mas cortas, menos blur.
- Riesgo: conflicto con SSR/hydration.
  - Mitigacion: animaciones solo en cliente y montaje controlado.
- Riesgo: regressions de accesibilidad.
  - Mitigacion: reduced motion, contraste y navegacion por teclado.

## Assets Recomendados (Opcionales)
No son bloqueantes para iniciar, pero elevan mucho el resultado:
- 1 imagen hero high-res (producto en uso) para parallax sutil.
- 1 mini video loop (6-10s, mp4/webm) para background de una seccion.
- 3-6 iconos/ilustraciones unificadas en estilo de marca.
- Paleta de marca final (si deseas salir del look actual).

Placeholders implementados actualmente:
- /placeholders/landing-hero-shot.svg
- /placeholders/landing-hero-video-poster.svg
- /placeholders/landing-hero-loop.mp4 (pendiente de crear por contenido real)

## Backlog de Entregables
- [x] Motion foundation utilities
- [x] Hero timeline
- [x] Section reveal system
- [x] Scroll sheet transition
- [x] Pinned text narrative section
- [x] Features carousel rewrite
- [x] Pricing interaction polish
- [x] CTA finale animation
- [x] Reduced motion mode
- [ ] Perf audit and tuning
- [ ] Cross-browser QA

## Registro de Avance

### 2026-04-01
- Fase trabajada: Phase 1 - Infra de Motion
- Cambios realizados:
  - Instaladas dependencias `gsap` y `@gsap/react`.
  - Creada base en `src/lib/animations/gsap.ts` con registro seguro de plugins, presets de duracion/easing y helper de media queries (desktop/tablet/mobile/reduceMotion).
  - Agregado bootstrap cliente `src/components/landing/landing-motion-bootstrap.tsx` para inicializar defaults de GSAP y sincronizar modo reduced motion via `data-landing-motion`.
  - Integrado bootstrap en `src/app/page.tsx`.
  - Definida convencion de targets con `data-lm-section` y `data-lm-reveal` en Navbar, Hero, Stats, Features, How It Works, Pricing y CTA.
- Issues encontrados: Ninguno bloqueante.
- Decision tomada: Mantener la foundation sin timelines de seccion todavia para preservar progressive enhancement y facilitar rollout por fases.
- Resultado de performance: Pendiente de medir en Phase 0/Phase 5.
- Proximos pasos:
  - Implementar Phase 2 con reveals por seccion usando ScrollTrigger batch sobre la convencion `data-lm-*`.
  - Ajustar timings por breakpoint y validar comportamiento en reduced motion.

### 2026-04-01 (Phase 2)
- Fase trabajada: Phase 2 - Entradas por Seccion
- Cambios realizados:
  - Creado `src/hooks/animations/use-section-reveal.ts`: hook generico con `ScrollTrigger.batch()` que oculta elementos via `gsap.set()` en `useLayoutEffect` (FOUC-free) y los revela con fade+slide al entrar al viewport. Soporta `selector`, `fromY`, `stagger` y `start`.
  - Creado `src/hooks/animations/use-hero-entrance.ts`: timeline secuencial para el Hero (badge → headline → subtitle → cta-row → social-proof → dashboard-mock → hero-assets) con easing `power3.out` y overlap entre items. Reduced motion revierte a reveal instantaneo.
  - Modificados Hero, Stats, Features, HowItWorks, Pricing, CTA: cada seccion obtiene un `containerRef`, llama al hook correspondiente y adjunta el ref al `<section>`.
  - Hero (`hero.tsx`): agregado `data-lm-reveal="social-proof"` al parrafo de social proof.
  - Features (`features.tsx`): selector explícito que excluye `feature-card` para evitar conflicto con la logica de opacidad del carrusel.
  - HowItWorks (`how-it-works.tsx`): eliminado `data-lm-reveal="steps-grid"` para evitar doble animacion sobre contenedor e items individuales. Mantiene `step-item` para stagger en batch.
  - Navbar (`navbar.tsx`): añadido estado `isScrolled` via scroll listener pasivo. Al superar 60px el header gana `border-border`, `bg-background/95` y `shadow-sm` con transicion CSS de 300ms.
- Issues encontrados: Ninguno. Sin errores de TypeScript.
- Decision tomada: `useSectionReveal` usa `container.querySelectorAll()` en lugar de confiar en el scope de gsap.context para el selector de `ScrollTrigger.batch()`, eliminando ambiguedad de scoping en plugins.
- Resultado de performance: Pendiente de medir.
- Proximos pasos: Phase 3 — transicion tipo hoja/pagina entre bloques + narrativa de texto pinned/scrub.

### 2026-04-01 (Phase 3)
- Fase trabajada: Phase 3 - Scroll Narrative Avanzado
- Cambios realizados:
  - Creado `src/hooks/animations/use-scroll-sheet-transition.ts`: hook reutilizable de transicion tipo hoja con `ScrollTrigger` + `scrub` que degrada la seccion actual (scale/opacity/y) mientras la siguiente emerge (translate/opacity).
  - Integrado `useScrollSheetTransition` en `Stats`, `Features`, `HowItWorks` y `Pricing` para continuidad visual entre bloques (`stats -> features -> how-it-works -> pricing -> cta`).
  - Creado `src/hooks/animations/use-pinned-text-narrative.ts`: hook de narrativa pinned/scrub que fija un panel y hace crossfade entre fases por marcadores de paso (`data-lm-step-index`).
  - Refactor de `src/components/landing/how-it-works.tsx` con shell narrativo de dos columnas: panel pinneado de copy + timeline de marcadores/steps, manteniendo i18n y tarjetas de pasos.
- Issues encontrados: Ninguno bloqueante.
- Decision tomada: en `prefers-reduced-motion`, desactivar pin/scrub y dejar reveal estatico para priorizar accesibilidad y evitar jank.
- Resultado de performance: Pendiente de medir en Phase 5 (Lighthouse/Web Vitals).
- Proximos pasos: Phase 4 — refactor de carousel de Features y pulido de microinteracciones (hover/focus, pausa por visibilidad, controles accesibles).

### 2026-04-01 (Phase 4)
- Fase trabajada: Phase 4 - Carousel y Microinteracciones
- Cambios realizados:
  - Refactor completo del carrusel en `src/components/landing/features.tsx`: ahora usa transiciones GSAP por estado activo (x/scale/rotateY/autoAlpha) en lugar de `transition: all`, con offsets responsive y easing centralizado.
  - Autoplay robusto: pausa por hover, foco dentro de la seccion y pestaña oculta (`visibilitychange`), evitando rotaciones en background.
  - Accesibilidad del carrusel: soporte de teclado (`ArrowLeft`, `ArrowRight`, `Home`, `End`), `aria-roledescription="carousel"`, `aria-current` en cards/dots y anuncio `aria-live` del item activo.
  - CTA final animation: nuevo hook `src/hooks/animations/use-cta-finale.ts` con timeline de cierre (shell + icon/title/subtitle + acciones + pills), con fallback estatico en reduced motion.
  - Pulido de microinteracciones en `src/components/landing/pricing.tsx` y `src/components/landing/cta.tsx`: estados hover/focus-visible, elevacion de cards y mejor feedback visual en acciones principales.
- Issues encontrados: Ninguno bloqueante.
- Decision tomada: separar la animacion final de CTA en hook dedicado para mantener el componente limpio y evitar conflicto con reveals genericos.
- Resultado de performance: Pendiente de medir en Phase 5 (Lighthouse/Web Vitals).
- Proximos pasos:
  - Ejecutar perf audit (Lighthouse + Web Vitals) y ajustar duraciones si hay jank en low-end.
  - QA cross-browser/mobile y cierre de hardening (Phase 5).

### YYYY-MM-DD
- Fase trabajada:
- Cambios realizados:
- Issues encontrados:
- Decision tomada:
- Resultado de performance:
- Proximos pasos:

## Criterios de Done
- Animaciones estables en desktop y mobile.
- Sin errores de consola ni fugas de triggers/listeners.
- Buen fallback con reduced motion.
- Lighthouse y Web Vitals dentro de objetivos definidos.
- Narrativa visual coherente de Hero a CTA.
