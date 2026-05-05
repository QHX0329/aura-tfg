import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpenText,
  Boxes,
  Bug,
  Cable,
  Database,
  FileCode2,
  Layers,
  Map,
  Route,
  ShieldCheck,
} from 'lucide-react';

type OverviewCard = {
  title: string;
  description: string;
  tag: string;
  icon: React.ReactNode;
};

type DocItem = {
  title: string;
  description: string;
  href: string;
  cta: string;
};

const withBase = (path: string): string => `${import.meta.env.BASE_URL}${path}`;

const REPO_BLOB_BASE = 'https://github.com/QHX0329/bargain-tfg/blob/main/';

const overviewCards: OverviewCard[] = [
  {
    title: 'Arquitectura del sistema',
    description: 'Separacion por dominios en backend y companion web/mobile con contratos API claros.',
    tag: 'ADR-Driven',
    icon: <Boxes className="h-5 w-5" />,
  },
  {
    title: 'Stack tecnologico',
    description: 'Django + DRF + PostGIS + Celery en backend y React/Expo para experiencia multiplataforma.',
    tag: 'Core Stack',
    icon: <Cable className="h-5 w-5" />,
  },
  {
    title: 'Modulos backend',
    description: 'Users, prices, stores, shopping lists, business, notifications, OCR y optimizer.',
    tag: 'Domain Apps',
    icon: <Database className="h-5 w-5" />,
  },
  {
    title: 'Frontend y UX',
    description: 'Sistema visual coherente con rutas publicas y portal business con auth JWT.',
    tag: 'UX System',
    icon: <Layers className="h-5 w-5" />,
  },
  {
    title: 'Optimizacion y geodatos',
    description: 'Modelo multicriterio precio-distancia-tiempo con soporte geoespacial y rutas.',
    tag: 'Geo + OR',
    icon: <Route className="h-5 w-5" />,
  },
  {
    title: 'Testing y calidad',
    description: 'Suite unitaria/integracion, CI automatizada y seguimiento de tareas por fases.',
    tag: 'CI Quality',
    icon: <Bug className="h-5 w-5" />,
  },
];

const docsIndex: DocItem[] = [
  {
    title: 'Memoria TFG (12 secciones)',
    description: 'Introduccion, objetivos, antecedentes, comparativa, requisitos, diseno e implementacion.',
    href: `${REPO_BLOB_BASE}docs/memoria/`,
    cta: 'Abrir memoria',
  },
  {
    title: 'ADRs y decisiones de arquitectura',
    description: 'Registro de decisiones tecnicas y modelo hibrido de desarrollo.',
    href: `${REPO_BLOB_BASE}docs/decisiones/`,
    cta: 'Ver ADRs',
  },
  {
    title: 'Documentacion API / OpenAPI',
    description: 'Referencia de endpoints y contratos para integracion frontend-backend.',
    href: `${REPO_BLOB_BASE}docs/api/README.md`,
    cta: 'Ir a API docs',
  },
  {
    title: 'Diagramas tecnicos',
    description: 'Arquitectura, clases, ER, secuencia, casos de uso y mockups.',
    href: `${REPO_BLOB_BASE}docs/diagramas/`,
    cta: 'Ver diagramas',
  },
  {
    title: 'Estado del proyecto y tareas',
    description: 'Roadmap por fases, progreso y entregables del TFG.',
    href: `${REPO_BLOB_BASE}TASKS.md`,
    cta: 'Abrir TASKS',
  },
];

const phases = [
  { id: 'F1', label: 'Analisis y Diseno', status: 'Completada' },
  { id: 'F2', label: 'Infraestructura Base', status: 'Completada' },
  { id: 'F3', label: 'Core Backend', status: 'Completada' },
  { id: 'F4', label: 'Frontend', status: 'En progreso' },
  { id: 'F5', label: 'IA + Optimizador + Scraping', status: 'Planificada' },
  { id: 'F6', label: 'Pruebas + Deploy + Cierre', status: 'Planificada' },
];

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.65, ease: 'easeOut' },
} as const;

const DocsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 antialiased">
      <div className="fixed inset-0 -z-10 opacity-85">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(16,185,129,0.18),transparent_33%),radial-gradient(circle_at_84%_10%,rgba(99,102,241,0.22),transparent_35%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,16,0.7),rgba(2,6,12,0.96))]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <a href={withBase('')} className="flex items-center gap-3 text-white">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-400/20 text-emerald-300">
              <BookOpenText className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">BarGAIN Docs</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-slate-300 lg:flex">
            <a href={withBase('')} className="transition hover:text-emerald-300">Inicio</a>
            <a href={withBase('onboarding')} className="transition hover:text-emerald-300">Onboarding</a>
            <a href={withBase('docs')} className="text-emerald-300">Docs</a>
            <a href={withBase('login')} className="transition hover:text-emerald-300">Login</a>
          </nav>
          <a
            href="https://github.com/QHX0329/bargain-tfg"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
          >
            Ver repositorio <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </header>

      <main>
        <motion.section {...reveal} className="mx-auto w-full max-w-7xl px-6 pb-16 pt-16 lg:px-10 lg:pt-24">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Documentacion Tecnica</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
            Arquitectura, requisitos y decisiones de ingenieria
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
            Esta vista resume el nucleo tecnico de BarGAIN para revision academica, tecnica y de producto,
            sin perder trazabilidad con la documentacion completa del repositorio.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="https://github.com/QHX0329/bargain-tfg/tree/main/docs"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-300 px-6 py-3 text-sm font-semibold text-emerald-950"
            >
              Abrir documentacion completa <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </motion.section>

        <motion.section {...reveal} className="mx-auto w-full max-w-7xl px-6 pb-16 lg:px-10">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {overviewCards.map((card) => (
              <article
                key={card.title}
                className="group rounded-3xl bg-slate-900/65 p-6 ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-slate-900/80"
              >
                <div className="inline-flex rounded-xl bg-emerald-400/15 p-3 text-emerald-300">{card.icon}</div>
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{card.description}</p>
                <p className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
                  {card.tag}
                </p>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section {...reveal} className="mx-auto w-full max-w-7xl px-6 pb-16 lg:px-10">
          <div className="rounded-3xl bg-white/[0.03] p-7 ring-1 ring-white/10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-indigo-300">Indice de fuentes</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Bloques de documentacion</h2>
              </div>
              <a
                href="https://github.com/QHX0329/bargain-tfg/tree/main/docs"
                className="text-sm font-semibold text-emerald-300 hover:text-emerald-200"
              >
                Ver carpeta docs completa
              </a>
            </div>

            <div className="mt-7 space-y-3">
              {docsIndex.map((item, index) => (
                <article key={item.title} className="rounded-2xl bg-slate-900/70 p-5 ring-1 ring-white/10">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-3xl">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Bloque {index + 1}</p>
                      <h3 className="mt-1 text-lg font-semibold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm text-slate-300">{item.description}</p>
                    </div>
                    <a
                      href={item.href}
                      className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20"
                    >
                      {item.cta} <FileCode2 className="h-4 w-4 text-emerald-300" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section {...reveal} className="mx-auto w-full max-w-7xl px-6 pb-16 lg:px-10">
          <div className="rounded-3xl bg-slate-900/65 p-7 ring-1 ring-white/10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-emerald-300">Roadmap de entrega</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Progreso por fases</h2>
              </div>
              <p className="rounded-full bg-emerald-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.13em] text-emerald-300">
                Progreso global estimado: 62%
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {phases.map((phase) => {
                const isDone = phase.status === 'Completada';
                const isProgress = phase.status === 'En progreso';
                return (
                  <article key={phase.id} className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/10">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-lg font-semibold text-white">{phase.id}</p>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                          isDone
                            ? 'bg-emerald-400/15 text-emerald-300'
                            : isProgress
                              ? 'bg-indigo-400/15 text-indigo-200'
                              : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {phase.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{phase.label}</p>
                  </article>
                );
              })}
            </div>

            <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-emerald-300 to-indigo-300" />
            </div>
          </div>
        </motion.section>

        <motion.section {...reveal} className="mx-auto w-full max-w-7xl px-6 pb-16 lg:px-10">
          <div className="grid gap-5 rounded-3xl bg-gradient-to-r from-emerald-400/20 to-indigo-400/20 p-7 ring-1 ring-white/15 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-200">Colaboracion</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                Quieres revisar implementacion o colaborar?
              </h3>
              <p className="mt-2 text-sm text-slate-200">
                Podemos recorrer decisiones tecnicas, arquitectura y roadmap de producto directamente sobre el repositorio.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <a
                href="mailto:nicolasparrillageniz@gmail.com"
                className="rounded-xl bg-emerald-300 px-5 py-3 text-sm font-semibold text-emerald-950"
              >
                Contactar
              </a>
              <a
                href={withBase('onboarding')}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/20"
              >
                Ir al onboarding PYME <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </motion.section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-6 text-sm text-slate-400 lg:px-10">
          <p className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            BarGAIN · Engineering docs view
          </p>
          <p className="inline-flex items-center gap-2">
            <Map className="h-4 w-4 text-indigo-300" />
            TFG ETSII-US · 2026
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DocsPage;
