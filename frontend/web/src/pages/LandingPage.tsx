import React from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  ArrowRight,
  BookOpenText,
  Bot,
  Building2,
  ClipboardList,
  Coins,
  Github,
  Mail,
  MapPinned,
  Route as RouteIcon,
  ScanLine,
  Smartphone,
  Sliders,
  Store,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Stack', href: '#stack' },
  { label: 'Docs', href: 'docs', isRoute: true },
];

const stack = [
  'Django',
  'PostgreSQL · PostGIS',
  'React Native',
  'Expo',
  'Celery',
  'OR-Tools',
  'Google Gemini',
  'Google Vision',
  'OpenRouteService',
];

const steps = [
  {
    n: '01',
    icon: <ClipboardList className="h-5 w-5" />,
    title: 'Añades tu lista de la compra',
    description:
      'Escríbela a mano, dictala o sube una foto: el OCR digitaliza listas manuscritas y tickets sin que muevas un dedo.',
  },
  {
    n: '02',
    icon: <RouteIcon className="h-5 w-5" />,
    title: 'BarGAIN busca y calcula',
    description:
      'Comparamos precios en 5 cadenas indexadas (Mercadona, Carrefour, Lidl, DIA, Alcampo) y calculamos rutas ponderando precio, distancia y tiempo.',
  },
  {
    n: '03',
    icon: <MapPinned className="h-5 w-5" />,
    title: 'Eliges entre el Top-3 de rutas',
    description:
      'Tres rutas óptimas en menos de 5 segundos, con desglose de precio total y distancia. Tú decides qué pesa más.',
  },
];

const features = [
  {
    icon: <Sliders className="h-5 w-5" />,
    title: 'Optimización multicriterio',
    description:
      'Precio, distancia y tiempo con pesos que tú configuras. Hasta 4 paradas por ruta y radio de búsqueda hasta 10 km.',
    accent: 'emerald',
  },
  {
    icon: <ScanLine className="h-5 w-5" />,
    title: 'OCR de listas y tickets',
    description:
      'Google Cloud Vision convierte una foto borrosa de la nevera en una lista normalizada lista para optimizar.',
    accent: 'indigo',
  },
  {
    icon: <Bot className="h-5 w-5" />,
    title: 'Asistente IA contextual',
    description:
      'Gemini 2.0 Flash responde sobre tu compra: solo entra al trapo en consultas relacionadas con la cesta.',
    accent: 'emerald',
  },
  {
    icon: <Store className="h-5 w-5" />,
    title: 'Portal PYME',
    description:
      'Gestiona precios, lanza promociones y conviértete en una opción visible para los clientes de tu zona.',
    accent: 'indigo',
  },
] as const;

const revealProps = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, ease: 'easeOut' as const },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const horizontalStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const horizontalItem: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const withBase = (path: string): string => `${import.meta.env.BASE_URL}${path}`;

/* ─────────────────────── Hero flow animation (SVG) ───────────────────────
   Conceptual flow: lista → comparación de supermercados → ruta óptima.
   Uses pathLength animations + staggered nodes. No invented metrics. */
const HeroFlowAnimation: React.FC = () => {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-[28px] bg-slate-900/60 p-6 ring-1 ring-white/10 backdrop-blur sm:aspect-[5/4]">
      <div className="absolute -right-24 -top-28 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="absolute -bottom-28 -left-16 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-slate-400">
          <span>Lista → Comparación → Ruta</span>
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            Flujo conceptual
          </span>
        </div>

        <svg viewBox="0 0 500 380" className="mt-3 h-full w-full">
          <defs>
            <linearGradient id="flowA" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <linearGradient id="flowB" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <radialGradient id="pinGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* COLUMN 1 — Lista */}
          <motion.g
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <rect x="20" y="60" width="120" height="240" rx="14" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" />
            <text x="34" y="86" fill="#94a3b8" fontSize="11" fontFamily="ui-sans-serif, system-ui" letterSpacing="2">LISTA</text>
            {['Pan', 'Leche', 'Huevos', 'Manzanas', 'Aceite'].map((item, i) => (
              <motion.g
                key={item}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
              >
                <rect x="34" y={104 + i * 36} width="14" height="14" rx="3" fill="none" stroke="#34d399" strokeWidth="1.5" />
                <motion.path
                  d={`M37 ${112 + i * 36} l3 3 l6 -7`}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.45 + i * 0.08 }}
                />
                <text x="58" y={116 + i * 36} fill="#e2e8f0" fontSize="13" fontFamily="ui-sans-serif, system-ui">{item}</text>
              </motion.g>
            ))}
          </motion.g>

          {/* Connector 1 → 2 */}
          <motion.path
            d="M140 180 C 170 180, 180 180, 200 180"
            fill="none"
            stroke="url(#flowA)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="2 5"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.9 }}
          />

          {/* COLUMN 2 — Supermercados / comparación */}
          <motion.g
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {[
              { y: 70, name: 'Mercadona', price: '12,40', best: false },
              { y: 122, name: 'Carrefour', price: '11,80', best: true },
              { y: 174, name: 'Lidl', price: '12,05', best: false },
              { y: 226, name: 'DIA', price: '12,90', best: false },
              { y: 278, name: 'Alcampo', price: '12,55', best: false },
            ].map((s) => (
              <motion.g key={s.name} variants={staggerItem}>
                <rect
                  x="200"
                  y={s.y}
                  width="160"
                  height="40"
                  rx="10"
                  fill={s.best ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.04)'}
                  stroke={s.best ? 'rgba(52,211,153,0.55)' : 'rgba(255,255,255,0.1)'}
                />
                <circle cx="216" cy={s.y + 20} r="6" fill={s.best ? '#34d399' : '#475569'} />
                <text x="232" y={s.y + 25} fill="#e2e8f0" fontSize="13" fontFamily="ui-sans-serif, system-ui">{s.name}</text>
                <text x="346" y={s.y + 25} fill={s.best ? '#34d399' : '#94a3b8'} fontSize="13" textAnchor="end" fontFamily="ui-sans-serif, system-ui" fontWeight={s.best ? 600 : 400}>{s.price} €</text>
              </motion.g>
            ))}
          </motion.g>

          {/* Connector 2 → 3 */}
          <motion.path
            d="M360 180 C 380 180, 390 180, 410 180"
            fill="none"
            stroke="url(#flowB)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="2 5"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.6 }}
          />

          {/* COLUMN 3 — Ruta */}
          <motion.g
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 1.7 }}
          >
            <rect x="400" y="60" width="80" height="240" rx="14" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" />
            <text x="414" y="86" fill="#94a3b8" fontSize="11" fontFamily="ui-sans-serif, system-ui" letterSpacing="2">RUTA</text>

            {/* Pin glow */}
            <circle cx="440" cy="120" r="22" fill="url(#pinGlow)" />
            <circle cx="440" cy="220" r="22" fill="url(#pinGlow)" />

            {/* Route path */}
            <motion.path
              d="M440 110 C 410 140, 470 170, 440 200 S 410 250, 440 280"
              fill="none"
              stroke="url(#flowA)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, delay: 1.8, ease: 'easeInOut' }}
            />

            {[110, 170, 220, 280].map((cy, i) => (
              <motion.circle
                key={cy}
                cx="440"
                cy={cy}
                r={i === 0 ? 7 : 5}
                fill={i === 0 ? '#34d399' : i === 3 ? '#818cf8' : '#cbd5e1'}
                stroke="#0f172a"
                strokeWidth="2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 1.9 + i * 0.15 }}
              />
            ))}
          </motion.g>
        </svg>

        <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
          <div className="rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10">
            <div className="text-slate-500">Cadenas</div>
            <div className="mt-0.5 font-semibold text-slate-200">5 indexadas</div>
          </div>
          <div className="rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10">
            <div className="text-slate-500">Optimización</div>
            <div className="mt-0.5 font-semibold text-slate-200">&lt; 5 s</div>
          </div>
          <div className="rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10">
            <div className="text-slate-500">Resultado</div>
            <div className="mt-0.5 font-semibold text-emerald-300">Top-3 rutas</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 antialiased">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 opacity-80">
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(16,185,129,0.18),transparent_32%),radial-gradient(circle_at_80%_8%,rgba(99,102,241,0.22),transparent_34%),radial-gradient(circle_at_55%_84%,rgba(59,130,246,0.14),transparent_28%)]"
          animate={{
            backgroundPosition: ['0% 0%', '100% 50%', '0% 100%', '0% 0%'],
          }}
          transition={{ duration: 22, ease: 'linear', repeat: Infinity }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,16,0.66),rgba(2,6,12,0.98))]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <a href="#top" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-400/20 text-emerald-300">
              <Coins className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">BarGAIN</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-slate-300 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.isRoute ? withBase(item.href) : item.href}
                className="transition hover:text-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a
              href={withBase('login')}
              className="hidden rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 lg:inline-flex"
            >
              Área negocio
            </a>
            <a
              href={withBase('onboarding')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-[0_0_35px_rgba(16,185,129,0.25)] transition hover:from-emerald-300 hover:to-emerald-400"
            >
              Acceder como comercio <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <motion.section
          {...revealProps}
          className="mx-auto grid w-full max-w-7xl gap-10 px-6 pb-24 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:pt-24"
        >
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Compra inteligente · TFG
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.4rem]">
              Tu lista. Cinco supermercados. Tres rutas óptimas.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-slate-300">
              BarGAIN pondera precio, distancia y tiempo entre cadenas y comercios locales para decirte
              dónde comprar mejor. Sin métricas infladas: el motor calcula el Top-3 de rutas en menos de
              cinco segundos sobre datos reales.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={withBase('onboarding')}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:brightness-110"
              >
                Acceder como comercio <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={withBase('login')}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 ring-1 ring-white/15 transition hover:bg-white/10"
              >
                Área de negocio <Building2 className="h-4 w-4" />
              </a>
              <a
                href={withBase('docs')}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/0 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:text-emerald-300"
              >
                Ver docs <BookOpenText className="h-4 w-4" />
              </a>
            </div>
          </div>

          <HeroFlowAnimation />
        </motion.section>

        {/* CÓMO FUNCIONA */}
        <motion.section
          id="como-funciona"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="mx-auto w-full max-w-7xl px-6 pb-28 lg:px-10"
        >
          <motion.div variants={staggerItem} className="mb-12 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Cómo funciona</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white lg:text-4xl">
              Tres pasos. Cero fricción.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Desde tu lista hasta la ruta de la compra real, sin que tengas que abrir cinco apps a la vez.
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step, idx) => (
              <motion.article
                key={step.n}
                variants={staggerItem}
                className="group relative overflow-hidden rounded-3xl bg-slate-900/65 p-7 ring-1 ring-white/10"
              >
                <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl transition group-hover:bg-emerald-400/20" />
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Paso {step.n}
                    </span>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                      {step.icon}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-white">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-300">{step.description}</p>
                  {idx < steps.length - 1 && (
                    <div className="pointer-events-none absolute right-0 top-1/2 hidden h-px w-6 -translate-y-1/2 translate-x-full bg-gradient-to-r from-emerald-400/40 to-transparent md:block" />
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* FUNCIONALIDADES — Bento */}
        <motion.section
          id="funcionalidades"
          {...revealProps}
          className="mx-auto w-full max-w-7xl px-6 pb-28 lg:px-10"
        >
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">Funcionalidades</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white lg:text-4xl">
                Lo que hay debajo del capó
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-400">
              Cuatro piezas que trabajan juntas: optimizador, OCR, asistente y portal para comercios.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {features.map((f) => (
              <motion.article
                key={f.title}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className="group relative overflow-hidden rounded-3xl bg-slate-900/65 p-7 ring-1 ring-white/10"
              >
                <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                  <div className={`absolute -right-20 -top-16 h-48 w-48 rounded-full blur-3xl ${f.accent === 'emerald' ? 'bg-emerald-400/20' : 'bg-indigo-400/20'}`} />
                  <div className={`absolute -bottom-20 -left-12 h-40 w-40 rounded-full blur-3xl ${f.accent === 'emerald' ? 'bg-indigo-400/20' : 'bg-emerald-400/20'}`} />
                </div>
                <div className="relative space-y-4">
                  <div className={`inline-flex rounded-xl p-3 ${f.accent === 'emerald' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-indigo-400/15 text-indigo-300'}`}>
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-white">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-300">{f.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* STACK */}
        <motion.section
          id="stack"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={horizontalStagger}
          className="mx-auto w-full max-w-7xl px-6 pb-28 lg:px-10"
        >
          <motion.div variants={horizontalItem} className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Stack tecnológico</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white lg:text-3xl">
                Construido sobre piezas reales y probadas
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-500">
              Sin marketing tecnológico: este es el stack que mueve la plataforma hoy.
            </p>
          </motion.div>

          <div className="flex flex-wrap gap-3">
            {stack.map((s) => (
              <motion.span
                key={s}
                variants={horizontalItem}
                className="rounded-full bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-200 ring-1 ring-white/10 transition hover:bg-white/[0.07] hover:text-emerald-300"
              >
                {s}
              </motion.span>
            ))}
          </div>
        </motion.section>

        {/* CTA SPLIT */}
        <motion.section
          {...revealProps}
          className="mx-auto w-full max-w-7xl px-6 pb-28 lg:px-10"
        >
          <div className="grid gap-5 md:grid-cols-2">
            {/* Usuarios */}
            <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-400/20 to-fuchsia-500/10 p-8 ring-1 ring-indigo-300/25">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl" />
              <div className="relative space-y-4">
                <div className="inline-flex rounded-xl bg-indigo-400/20 p-3 text-indigo-200">
                  <Smartphone className="h-5 w-5" />
                </div>
                <p className="text-xs uppercase tracking-[0.18em] text-indigo-200">Para usuarios</p>
                <h3 className="text-2xl font-semibold tracking-tight text-white">
                  Próximamente en iOS y Android
                </h3>
                <p className="text-sm leading-relaxed text-indigo-50/85">
                  La app móvil de BarGAIN está en desarrollo. Aún no hay descarga pública: estamos
                  cerrando la beta antes de publicarla.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-50/90 ring-1 ring-white/15">
                    iOS · próximamente
                  </span>
                  <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-50/90 ring-1 ring-white/15">
                    Android · próximamente
                  </span>
                </div>
              </div>
            </article>

            {/* Comercios */}
            <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-400/20 to-emerald-700/10 p-8 ring-1 ring-emerald-300/30">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
              <div className="relative space-y-4">
                <div className="inline-flex rounded-xl bg-emerald-400/20 p-3 text-emerald-300">
                  <Store className="h-5 w-5" />
                </div>
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">Para comercios y PYMEs</p>
                <h3 className="text-2xl font-semibold tracking-tight text-white">
                  Activa tu escaparate local
                </h3>
                <p className="text-sm leading-relaxed text-emerald-50/85">
                  Publica precios, lanza promociones y conviértete en una opción visible para los
                  clientes que ya están comprando en tu zona.
                </p>
                <a
                  href={withBase('onboarding')}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-200"
                >
                  Acceder como comercio <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </article>
          </div>
        </motion.section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 text-sm text-slate-400 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-400/20 text-emerald-300">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">BarGAIN</p>
              <p className="text-xs text-slate-500">
                Nicolás Parrilla Geniz · TFG Ingeniería del Software · Universidad de Sevilla
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <a
              href="https://github.com/QHX0329/bargain-tfg"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 transition hover:text-emerald-300"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <a
              href="mailto:nicolasparrillageniz@gmail.com"
              className="inline-flex items-center gap-2 transition hover:text-emerald-300"
            >
              <Mail className="h-4 w-4" />
              Contacto
            </a>
            <a href={withBase('docs')} className="transition hover:text-emerald-300">
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
