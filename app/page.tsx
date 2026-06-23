"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const WHATSAPP_URL = "https://wa.me/message/ZS4UBD6L3MHNL1";

const LOGOS = {
  horizontal: "/fleetvision/brand-assets/fv_primary_home_banner.png",
  icon: "/fleetvision/brand-assets/fv_app_symbol_square.png",
  stacked: "/fleetvision/brand-assets/fv_pricing_vertical_mark.png",
  navbar: "/fleetvision/brand-assets/fv_header_wordmark_compact.png",
  light: "/fleetvision/brand-assets/fv_light_documents_mark.png",
  badge: "/fleetvision/brand-assets/fv_trust_badge_emblem.png",
};

const navItems = [
  { id: "hero", label: "Inicio" },
  { id: "metrics", label: "Funcionalidades" },
  { id: "features", label: "Características" },
  { id: "industries", label: "Sectores" },
  { id: "benefits", label: "Ventajas" },
  { id: "pricing", label: "Planes" },
];

const industries = [
  {
    icon: "⛏️",
    name: "Minería",
    color: "from-amber-500/20 to-yellow-500/20",
    border: "border-amber-500/20",
    glow: "group-hover:shadow-amber-500/10",
    equipment: "CAEX, cargadores frontales, bulldozers, perforadoras y equipos auxiliares",
    focus: "Disponibilidad operacional y control por horas de equipo",
  },
  {
    icon: "🚚",
    name: "Transporte",
    color: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/20",
    glow: "group-hover:shadow-blue-500/10",
    equipment: "Camiones, buses, tractocamiones, ramplas y flotas de ruta",
    focus: "Control por kilometraje, costos, documentación y OT",
  },
  {
    icon: "🌾",
    name: "Agrícola",
    color: "from-lime-500/20 to-emerald-500/20",
    border: "border-lime-500/20",
    glow: "group-hover:shadow-lime-500/10",
    equipment: "Tractores, cosechadoras, pulverizadores, implementos y equipos de temporada",
    focus: "Mantenciones por campaña, horas de uso y disponibilidad estacional",
  },
  {
    icon: "🏗️",
    name: "Construcción",
    color: "from-orange-500/20 to-red-500/20",
    border: "border-orange-500/20",
    glow: "group-hover:shadow-orange-500/10",
    equipment: "Excavadoras, retroexcavadoras, grúas, compactadores y maquinaria pesada",
    focus: "Reducir tiempos detenidos en obras y faenas",
  },
  {
    icon: "🚗",
    name: "Flotas livianas",
    color: "from-emerald-500/20 to-green-500/20",
    border: "border-emerald-500/20",
    glow: "group-hover:shadow-emerald-500/10",
    equipment: "Pickups, furgones, autos corporativos y vehículos de servicio",
    focus: "Control por patente, vencimientos, kilometraje y preventivos",
  },
  {
    icon: "📦",
    name: "Logística",
    color: "from-violet-500/20 to-purple-500/20",
    border: "border-violet-500/20",
    glow: "group-hover:shadow-violet-500/10",
    equipment: "Montacargas, vehículos de reparto, equipos de patio y unidades de bodega",
    focus: "Coordinar mantenimiento sin detener la operación diaria",
  },
  {
    icon: "🛠️",
    name: "Servicios técnicos",
    color: "from-sky-500/20 to-blue-500/20",
    border: "border-sky-500/20",
    glow: "group-hover:shadow-sky-500/10",
    equipment: "Talleres, unidades móviles, técnicos, repuestos y herramientas asignadas",
    focus: "Trazabilidad de trabajos, repuestos usados y horas hombre",
  },
  {
    icon: "🏛️",
    name: "Municipalidades",
    color: "from-cyan-500/20 to-teal-500/20",
    border: "border-cyan-500/20",
    glow: "group-hover:shadow-cyan-500/10",
    equipment: "Camiones recolectores, camionetas, maquinaria vial y vehículos municipales",
    focus: "Control transparente de disponibilidad, costos y mantenimiento programado",
  },
];

const features = [
  {
    title: "Órdenes de Trabajo",
    description: "Controla cada intervención desde la solicitud hasta el cierre técnico.",
    bullets: ["Estados de OT", "Responsables", "Evidencia fotográfica", "Costos asociados"],
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    title: "Plan Preventivo",
    description: "Programa mantenciones por kilometraje, horómetro o fecha planificada.",
    bullets: ["Alertas próximas", "Checklists", "Historial", "Cumplimiento"],
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    title: "Inventario y Repuestos",
    description: "Mantén stock mínimo, proveedores y consumo controlado por OT.",
    bullets: ["Stock mínimo", "Entradas y salidas", "Consumo", "Ubicación"],
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
  {
    title: "KPIs de Mantenimiento",
    description: "Visualiza indicadores clave para tomar decisiones con datos.",
    bullets: ["Disponibilidad", "MTTR", "MTBF", "Costos"],
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    title: "Control de Costos",
    description: "Relaciona repuestos, horas hombre y tiempo detenido por activo.",
    bullets: ["Costo por activo", "Mano de obra", "Repuestos", "Comparativos"],
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Reportes Ejecutivos",
    description: "Genera reportes claros para jefaturas, clientes o auditorías.",
    bullets: ["Dashboard", "Exportación", "Filtros", "Trazabilidad"],
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
];

const benefits = [
  { title: "Implementación rápida", content: "Configuración inicial pensada para avanzar en días y no en meses.", icon: "⚡" },
  { title: "Multiempresa", content: "Gestiona distintas empresas o contratos desde una misma plataforma.", icon: "🏢" },
  { title: "Soporte cercano", content: "Acompañamiento técnico para ajustar la operación a tu realidad.", icon: "🤝" },
  { title: "Trazabilidad completa", content: "Cada activo conserva su historial de mantenciones, costos y documentos.", icon: "🧾" },
  { title: "Diseño profesional", content: "Interfaz clara, moderna y fácil de usar para equipos administrativos y técnicos.", icon: "✨" },
  { title: "Decisiones con datos", content: "KPIs, reportes y alertas para anticipar fallas y reducir detenciones.", icon: "📊" },
];

const plans = [
  {
    name: "Básico",
    price: "$15.000",
    period: "por mes",
    subtitle: "Para operaciones pequeñas",
    description: "Ideal para comenzar a ordenar la mantención de una flota reducida.",
    range: "1 a 3 vehículos",
    features: ["Órdenes de trabajo básicas", "Mantenimiento preventivo", "Historial por activo", "Reportes estándar", "Soporte por correo"],
    button: "Comenzar Prueba",
    featured: false,
    accent: "from-slate-500 to-slate-700",
    border: "border-white/10",
  },
  {
    name: "Profesional",
    price: "$25.000",
    period: "por mes",
    subtitle: "Plan recomendado",
    description: "Para flotas medianas que necesitan control operativo y KPIs claros.",
    range: "3 a 10 vehículos",
    features: ["Mantenimiento predictivo", "KPIs avanzados", "Inventario de repuestos", "Dashboard ejecutivo", "Soporte prioritario 24/7", "Gestión multiusuario"],
    button: "Solicitar Plan Profesional",
    featured: true,
    accent: "from-cyan-500 to-blue-500",
    border: "border-cyan-400/40",
  },
  {
    name: "Enterprise",
    price: "Personalizado",
    period: "cotización",
    subtitle: "Para empresas y contratos",
    description: "Solución adaptable para operaciones con múltiples áreas, sedes o contratos.",
    range: "Vehículos ilimitados",
    features: ["SLA y soporte dedicado", "Integración completa", "Capacitación inicial", "Reportes personalizados", "Permisos avanzados", "Acompañamiento de implementación"],
    button: "Contactar Ventas",
    featured: false,
    accent: "from-violet-500 to-purple-500",
    border: "border-violet-500/20",
  },
];

export default function Home() {
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    rut: "",
    phone: "",
    email: "",
    region: "",
    country: "",
  });
  const [counterValues, setCounterValues] = useState({
    clients: 0,
    assets: 0,
    uptime: 0,
    support: 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      for (const item of navItems) {
        const section = document.getElementById(item.id);
        if (!section) continue;

        const rect = section.getBoundingClientRect();
        if (rect.top <= 130 && rect.bottom >= 130) {
          setActiveSection(item.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    const interval = setInterval(() => {
      setCounterValues((prev) => ({
        clients: prev.clients < 250 ? prev.clients + 5 : 250,
        assets: prev.assets < 15000 ? prev.assets + 300 : 15000,
        uptime: prev.uptime < 99.9 ? Math.min(prev.uptime + 0.3, 99.9) : 99.9,
        support: prev.support < 24 ? prev.support + 0.5 : 24,
      }));
    }, 30);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsMobileMenuOpen(false);
    }
  };

  const openContactForm = () => {
    setShowDemoForm(true);
    setIsMobileMenuOpen(false);
  };

  const resetContactForm = () => {
    setFormData({
      name: "",
      rut: "",
      phone: "",
      email: "",
      region: "",
      country: "",
    });
  };

  const closeContactForm = () => {
    setShowDemoForm(false);
    resetContactForm();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.rut.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.region.trim() || !formData.country.trim()) {
      alert("Por favor, completa todos los campos para que podamos atender tu consulta.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      alert("Ingresa un correo electrónico válido.");
      return;
    }

    alert(`¡Gracias ${formData.name}! Hemos recibido tu solicitud. Te contactaremos pronto a ${formData.email}.`);
    closeContactForm();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-white">
      {/* BACKGROUND PROFESIONAL */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[28%] -left-[15%] h-[900px] w-[900px] rounded-full bg-cyan-600/25 blur-[180px]" />
        <div className="absolute top-[20%] right-[-12%] h-[850px] w-[850px] rounded-full bg-blue-500/20 blur-[170px]" />
        <div className="absolute bottom-[-35%] left-[20%] h-[850px] w-[850px] rounded-full bg-indigo-600/20 blur-[170px]" />
        <div className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:90px_90px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.25)_65%,rgba(2,6,23,0.9)_100%)]" />
        <div className="absolute left-0 top-32 h-px w-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
        <div className="absolute left-0 top-[42%] h-px w-full bg-gradient-to-r from-transparent via-blue-400/10 to-transparent" />
        <div className="absolute right-20 top-28 h-40 w-px bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent" />
        <div className="absolute left-12 bottom-32 h-52 w-px bg-gradient-to-b from-transparent via-blue-400/20 to-transparent" />
        <span className="absolute left-[12%] top-[24%] h-1.5 w-1.5 rounded-full bg-cyan-300/70 shadow-[0_0_20px_rgba(34,211,238,0.9)] animate-floatSlow" />
        <span className="absolute right-[18%] top-[34%] h-1 w-1 rounded-full bg-blue-300/70 shadow-[0_0_18px_rgba(59,130,246,0.9)] animate-floatSlow2" />
        <span className="absolute left-[52%] bottom-[20%] h-1.5 w-1.5 rounded-full bg-sky-300/60 shadow-[0_0_18px_rgba(14,165,233,0.8)] animate-floatSlow" />
      </div>

      {/* NAVBAR */}
      <header className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled ? "border-b border-white/10 bg-slate-950/95 py-2 shadow-2xl shadow-cyan-950/30 backdrop-blur-2xl" : "border-b border-white/5 bg-slate-950/80 py-4 backdrop-blur-xl"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <button onClick={() => scrollToSection("hero")} className="group flex items-center gap-3" aria-label="Ir al inicio de FleetVision">
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-950 shadow-lg shadow-cyan-500/20 transition-transform duration-300 group-hover:scale-105">
              <img src={LOGOS.icon} alt="Icono FleetVision" className="h-full w-full object-cover" />
              <span className="absolute inset-0 rounded-2xl bg-cyan-300/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </span>
            <img src={LOGOS.navbar} alt="FleetVision" className="hidden h-10 w-auto max-w-[210px] object-contain sm:block" />
            <span className="sm:hidden text-xl font-black tracking-tight text-white">
              Fleet<span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Vision</span>
            </span>
            <span className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-bold text-cyan-400">
              CL CHILE
            </span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${activeSection === item.id ? "text-white bg-white/10 shadow-inner shadow-white/5" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
              >
                {item.label}
                {activeSection === item.id && <span className="absolute inset-x-4 -bottom-1 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <button onClick={() => router.push("/login")} className="text-sm font-semibold text-slate-400 transition-all duration-300 hover:scale-105 hover:text-white">
              Iniciar Sesión
            </button>
            <button onClick={openContactForm} className="group relative overflow-hidden rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/40">
              <span className="relative z-10">Solicitar Demo</span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>
          </div>

          <button className="rounded-xl p-2 text-white transition-colors hover:bg-white/10 lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Abrir menú">
            {isMobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-white/10 bg-slate-950/98 px-4 py-5 shadow-2xl backdrop-blur-2xl lg:hidden">
            <div className="mb-4 flex justify-center">
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm font-bold text-cyan-400">Solución chilena para flotas</span>
            </div>
            <div className="space-y-2">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => scrollToSection(item.id)} className="block w-full rounded-xl px-4 py-3 text-left text-base text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
                  {item.label}
                </button>
              ))}
              <button onClick={() => { router.push("/login"); setIsMobileMenuOpen(false); }} className="block w-full rounded-xl px-4 py-3 text-left text-base text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
                Iniciar Sesión
              </button>
              <button onClick={openContactForm} className="mt-3 w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-black text-white shadow-lg shadow-cyan-500/20">
                Solicitar Demo
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="hero" className="relative z-10 scroll-mt-28 pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div className="max-w-2xl animate-fadeUp">
              <div className="mb-7 max-w-md overflow-hidden rounded-3xl border border-cyan-400/15 bg-slate-950/35 p-3 shadow-2xl shadow-cyan-950/25 backdrop-blur-xl">
                <img src={LOGOS.horizontal} alt="FleetVision Plataforma CMMS" className="h-auto w-full object-contain" />
              </div>

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300 shadow-lg shadow-cyan-950/20 backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.8)]" />
                Plataforma CMMS para flotas
              </div>

              <h1 className="mb-6 text-4xl font-black leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl">
                <span className="block">GESTIÓN DE</span>
                <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.15)]">
                  MANTENIMIENTO DE FLOTA
                </span>
              </h1>

              <p className="mb-8 max-w-xl text-lg leading-relaxed text-slate-400/95">
                FleetVision transforma la gestión de tu flota vehicular. Control total del mantenimiento con tecnología preventiva, automatización inteligente y datos claros para maximizar disponibilidad, prevenir fallas y reducir costos.
              </p>

              <div className="mb-10 flex flex-col gap-4 sm:flex-row">
                <button onClick={openContactForm} className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 px-9 py-4 text-base font-black text-white shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-emerald-500/40">
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Comenzar Prueba Gratis
                  </span>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </button>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-white/10 bg-white/[0.04] px-9 py-4 text-center text-base font-bold text-white backdrop-blur-xl transition-all duration-300 hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-emerald-200">
                  Hablar por WhatsApp
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "Clientes", value: `${Math.round(counterValues.clients)}+` },
                  { label: "Activos", value: `${Math.round(counterValues.assets).toLocaleString("es-CL")}+` },
                  { label: "Uptime", value: `${counterValues.uptime.toFixed(1)}%` },
                  { label: "Soporte", value: `${Math.round(counterValues.support)}/7` },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/[0.07]">
                    <div className="text-xl font-black text-white">{stat.value}</div>
                    <div className="mt-1 text-xs font-medium text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fadeUpDelay">
              <div className="absolute -inset-7 rounded-[2rem] bg-gradient-to-r from-cyan-500/25 to-blue-600/25 blur-3xl" />
              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-slate-900/55 shadow-2xl shadow-cyan-950/40 backdrop-blur-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-cyan-500/[0.04]" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
                <div className="relative flex h-14 items-center justify-between border-b border-white/10 px-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.7)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)]" />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                    <img src={LOGOS.icon} alt="" className="h-7 w-7 rounded-lg object-cover shadow-md shadow-cyan-500/20" />
                    <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.9)] animate-pulse" />
                    Dashboard CMMS · Tiempo Real
                  </div>
                </div>

                <div className="relative p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-black text-white">
                      <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /></svg>
                      Órdenes de Trabajo
                    </h3>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">Operación estable</span>
                  </div>

                  <div className="mb-6 grid grid-cols-3 gap-3">
                    {[
                      { label: "OT Ingresadas", value: "42", detail: "+8%", tone: "from-blue-500/15 to-cyan-500/15 border-blue-500/20 text-emerald-300" },
                      { label: "Pendientes", value: "12", detail: "-3", tone: "from-amber-500/15 to-yellow-500/15 border-amber-500/20 text-amber-300" },
                      { label: "Completadas", value: "156", detail: "+12%", tone: "from-emerald-500/15 to-green-500/15 border-emerald-500/20 text-emerald-300" },
                    ].map((card) => (
                      <div key={card.label} className={`rounded-2xl border bg-gradient-to-br ${card.tone} p-4 transition-all duration-300 hover:-translate-y-1 hover:border-white/30`}>
                        <div className="mb-2 text-xs font-semibold text-slate-400">{card.label}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-black text-white">{card.value}</span>
                          <span className={`rounded-full bg-black/20 px-2 py-0.5 text-xs font-bold ${card.tone.split(" ").pop()}`}>{card.detail}</span>
                        </div>
                        <div className="mt-2 h-1 rounded-full bg-white/10">
                          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5 transition-all duration-300 hover:border-cyan-400/40">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                          <div className="font-bold text-white">MTTR Promedio</div>
                          <div className="text-xs text-slate-400">Mean Time To Repair</div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-black text-white">4.2h</div>
                        <div className="mt-1 text-xs font-semibold text-emerald-300">Mejorado 0.8h vs mes anterior</div>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700/70">
                        <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-barGrow" />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5 transition-all duration-300 hover:border-violet-400/40">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-white">Cumplimiento de Mantenimiento</div>
                          <div className="text-xs text-slate-400">Preventivo programado</div>
                        </div>
                        <div className="text-2xl font-black text-white">94%</div>
                      </div>
                      <div className="relative mx-auto my-3 h-32 w-32">
                        <div className="absolute inset-0 rounded-full bg-[conic-gradient(#10b981_0%_94%,#ef4444_94%_100%)] shadow-lg shadow-emerald-500/10" />
                        <div className="absolute inset-5 rounded-full bg-slate-950/90 backdrop-blur-sm" />
                        <div className="absolute inset-0 flex items-center justify-center text-center">
                          <div>
                            <div className="text-2xl font-black text-white">94%</div>
                            <div className="text-xs text-slate-400">Cumplido</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center gap-4 text-xs text-slate-300">
                        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-emerald-500" />Cumplido</span>
                        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-red-500" />Pendiente</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section id="metrics" className="relative z-10 scroll-mt-28 border-y border-white/5 bg-slate-950/35 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">Control operativo completo</p>
            <h2 className="text-3xl font-black text-white sm:text-4xl">Funcionalidades esenciales de FleetVision</h2>
            <p className="mx-auto mt-4 max-w-3xl text-slate-400">Cada módulo está diseñado para entregar orden, trazabilidad y decisiones rápidas en mantenimiento de flotas.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Órdenes de Trabajo", desc: "Crea, asigna, controla y cierra OT con trazabilidad.", icon: "🧾" },
              { title: "Historial de Activos", desc: "Mantenciones, costos, repuestos y responsables por equipo.", icon: "🚚" },
              { title: "Alertas Preventivas", desc: "Notificaciones por fecha, kilometraje u horómetro.", icon: "🔔" },
              { title: "Inventario", desc: "Stock mínimo, consumo por OT y control de bodega.", icon: "📦" },
            ].map((item) => (
              <div key={item.title} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-xl shadow-slate-950/30 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.06]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-500/15 text-2xl ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </div>
                <h3 className="mb-2 text-lg font-black text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{item.desc}</p>
                <div className="mt-5 h-1 w-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {["Prevención de fallas", "Gestión de repuestos", "Reportes automáticos", "Monitoreo continuo", "Cumplimiento", "Optimización de costos"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center text-sm font-bold text-slate-300 transition-all duration-300 hover:border-cyan-400/30 hover:text-white">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARACTERÍSTICAS */}
      <section id="features" className="relative z-10 scroll-mt-28 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-sky-300">Tecnología especializada</p>
            <h2 className="text-3xl font-black text-white sm:text-4xl">Soluciones para todo tipo de flota</h2>
            <p className="mx-auto mt-4 max-w-3xl text-slate-400">Desde flotas livianas hasta maquinaria pesada: FleetVision estructura la información clave para mantener la operación bajo control.</p>
            <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
                <img src={LOGOS.icon} alt="FleetVision icono app" className="mx-auto h-20 w-20 rounded-2xl object-cover shadow-lg shadow-cyan-500/20" />
                <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-400">App / Sidebar</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
                <img src={LOGOS.navbar} alt="FleetVision logo navbar" className="mx-auto h-20 w-full object-contain" />
                <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-400">Navbar / Header</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
                <img src={LOGOS.badge} alt="FleetVision emblema" className="mx-auto h-20 w-20 rounded-2xl object-cover shadow-lg shadow-blue-500/20" />
                <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-400">Sello / Marca</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl shadow-slate-950/20 transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-400/30">
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-sky-500/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/20">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} /></svg>
                </div>
                <h3 className="mb-2 text-lg font-black text-white">{feature.title}</h3>
                <p className="mb-5 text-sm leading-relaxed text-slate-400">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTORES */}
      <section id="industries" className="relative z-10 scroll-mt-28 border-y border-white/5 bg-slate-950/45 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">Sectores que optimizamos</p>
            <h2 className="text-3xl font-black text-white sm:text-4xl">Un CMMS adaptable a tu operación</h2>
            <p className="mx-auto mt-4 max-w-3xl text-slate-400">Cada sector tiene necesidades distintas. FleetVision se organiza para flotas por kilometraje, horómetro, fechas, costos y disponibilidad.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {industries.map((industry) => (
              <div key={industry.name} className={`group relative overflow-hidden rounded-3xl border ${industry.border} bg-slate-900/55 p-5 shadow-xl shadow-slate-950/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/25 ${industry.glow}`}>
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${industry.color} text-3xl ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110`}>
                  {industry.icon}
                </div>
                <h3 className="mb-3 text-lg font-black uppercase tracking-wide text-white">{industry.name}</h3>
                <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="mb-1 text-xs font-bold text-slate-300">Equipos gestionados</p>
                  <p className="text-xs leading-relaxed text-slate-400">{industry.equipment}</p>
                </div>
                <p className="border-t border-white/10 pt-3 text-xs font-semibold leading-relaxed text-cyan-300">{industry.focus}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VENTAJAS */}
      <section id="benefits" className="relative z-10 scroll-mt-28 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">Ventajas competitivas</p>
            <h2 className="text-3xl font-black text-white sm:text-4xl">¿Por qué elegir FleetVision?</h2>
            <p className="mx-auto mt-4 max-w-3xl text-slate-400">Una plataforma clara, moderna y preparada para ordenar la gestión de mantenimiento sin complicar al usuario.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="group rounded-3xl border border-white/10 bg-white/[0.035] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.06]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl ring-1 ring-emerald-400/20 transition-transform duration-300 group-hover:scale-110">
                  {benefit.icon}
                </div>
                <h3 className="mb-2 text-lg font-black text-white">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{benefit.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-slate-900/80 to-slate-950/80 p-6 shadow-xl shadow-cyan-950/20">
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-cyan-400/20 bg-slate-950 shadow-lg shadow-cyan-500/20">
                <img src={LOGOS.icon} alt="FleetVision" className="h-full w-full object-cover" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="mb-2 text-xl font-black text-white">Especialistas en flotas chilenas</h3>
                <p className="leading-relaxed text-slate-300">FleetVision considera operación por región, rutas, tipos de activos, documentación, costos y planificación preventiva para empresas que necesitan control real de mantenimiento.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section id="pricing" className="relative z-10 scroll-mt-28 border-y border-white/5 bg-gradient-to-b from-slate-950 to-slate-900 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mx-auto mb-6 max-w-sm overflow-hidden rounded-3xl border border-violet-500/20 bg-slate-950/40 p-3 shadow-xl shadow-violet-950/20 backdrop-blur-xl">
              <img src={LOGOS.stacked} alt="FleetVision Plataforma CMMS" className="h-auto w-full object-contain" />
            </div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm font-bold text-violet-300">
              <span>🇨🇱</span>
              <span>Precios en pesos chilenos</span>
            </div>
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              Planes para
              <span className="block bg-gradient-to-r from-violet-300 to-purple-400 bg-clip-text text-transparent">Cada Necesidad</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">Elige el punto de partida. Todos los planes pueden ajustarse según la operación, cantidad de activos y módulos requeridos.</p>
          </div>

          <div className="grid items-stretch gap-8 lg:grid-cols-3 lg:gap-7">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative pt-5 ${plan.featured ? "lg:-translate-y-4" : ""}`}>
                {plan.featured && (
                  <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-cyan-500/25">
                    Más popular
                  </div>
                )}
                <div className={`group relative flex h-full min-h-[610px] flex-col overflow-hidden rounded-[2rem] border ${plan.border} bg-slate-900/80 p-7 shadow-2xl shadow-slate-950/30 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-white/25 ${plan.featured ? "ring-1 ring-cyan-400/25" : ""}`}>
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${plan.accent}`} />
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/5 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative mb-6">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-slate-300">{plan.subtitle}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-400">{plan.description}</p>
                  </div>

                  <div className="relative mb-6 rounded-3xl border border-white/10 bg-black/15 p-5">
                    <div className="flex flex-col gap-1">
                      <span className={`${plan.price === "Personalizado" ? "text-3xl xl:text-4xl" : "text-4xl xl:text-5xl"} break-words font-black leading-none text-white`}>{plan.price}</span>
                      <span className="text-sm font-semibold text-slate-400">{plan.period}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/[0.04] px-3 py-2 text-sm font-bold text-cyan-300 ring-1 ring-white/10">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      {plan.range}
                    </div>
                  </div>

                  <ul className="relative mb-8 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r ${plan.accent} text-white`}>
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button onClick={openContactForm} className={`group relative mt-auto overflow-hidden rounded-2xl px-5 py-4 text-sm font-black text-white transition-all duration-300 ${plan.featured ? "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/25 hover:scale-[1.02] hover:shadow-cyan-500/40" : "border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20"}`}>
                    <span className="relative z-10">{plan.button}</span>
                    {plan.featured && <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.035] p-5 text-center text-sm text-slate-400">
            Todos los planes incluyen actualizaciones gratuitas, soporte técnico base y formulario de contacto directo.
            <span className="mt-1 block font-semibold text-cyan-300">Facturación electrónica incluida · Compatible con gestión administrativa chilena</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mx-auto mb-8 max-w-md overflow-hidden rounded-3xl border border-cyan-400/20 bg-slate-950/45 p-3 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
            <img src={LOGOS.horizontal} alt="FleetVision" className="h-auto w-full object-contain" />
          </div>
          <h2 className="mb-6 text-3xl font-black text-white sm:text-4xl">
            ¿Listo para modernizar tu
            <span className="block bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">gestión de mantenimiento?</span>
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400">Completa el formulario o escríbenos por WhatsApp para coordinar una demo según tu tipo de flota.</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button onClick={openContactForm} className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-9 py-4 font-black text-white shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:scale-105">
              Agendar Demo Personalizada
            </button>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-9 py-4 font-black text-emerald-200 transition-all duration-300 hover:scale-105 hover:bg-emerald-500/20">
              Contactar por WhatsApp
            </a>
          </div>
          <p className="mt-8 text-sm text-slate-500">Sin tarjeta requerida · Atención personalizada · Solución chilena para flotas</p>
        </div>
      </section>

      {/* MODAL CONTACTO */}
      {showDemoForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm" onMouseDown={closeContactForm}>
          <div className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-cyan-500/30 bg-slate-900 shadow-2xl shadow-cyan-950/50" onMouseDown={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
            <div className="relative z-10 p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={LOGOS.icon} alt="FleetVision" className="h-12 w-12 rounded-2xl object-cover shadow-lg shadow-cyan-500/20" />
                  <div>
                    <h3 className="text-2xl font-black text-white">Contáctanos</h3>
                    <p className="mt-1 text-sm text-slate-400">Completa el formulario para solicitar demo o prueba gratuita.</p>
                  </div>
                </div>
                <button type="button" onClick={closeContactForm} className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white" aria-label="Cerrar modal">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="mb-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                <div className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-xs leading-relaxed text-cyan-200"><strong>Formulario de contacto:</strong> completa todos los campos para que podamos atender tu consulta y coordinar la mejor alternativa para tu flota.</p>
                </div>
              </div>

              <form onSubmit={handleDemoSubmit} className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    { label: "Nombre o Razón Social *", name: "name", type: "text", placeholder: "Juan Pérez / Mi Empresa S.A." },
                    { label: "RUT *", name: "rut", type: "text", placeholder: "12.345.678-9" },
                    { label: "Teléfono *", name: "phone", type: "tel", placeholder: "+56 9 1234 5678" },
                    { label: "Correo Electrónico *", name: "email", type: "email", placeholder: "contacto@empresa.cl" },
                    { label: "Región *", name: "region", type: "text", placeholder: "Valparaíso" },
                    { label: "País *", name: "country", type: "text", placeholder: "Chile" },
                  ].map((input) => (
                    <div key={input.name} className="rounded-2xl border border-white/10 bg-slate-800/60 p-3 transition-all duration-300 hover:border-cyan-500/30 focus-within:border-cyan-400/60 focus-within:bg-slate-800/80">
                      <label className="mb-1.5 block text-xs font-bold text-cyan-300">{input.label}</label>
                      <input
                        type={input.type}
                        name={input.name}
                        value={formData[input.name as keyof typeof formData]}
                        onChange={handleInputChange}
                        placeholder={input.placeholder}
                        required
                        autoComplete="off"
                        className="w-full border-none bg-transparent text-base text-white placeholder-slate-500 outline-none focus:ring-0"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/40">
                    Enviar Mensaje
                  </button>
                  <button type="button" onClick={closeContactForm} className="flex-1 rounded-2xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP FLOAT */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="group fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-2xl shadow-emerald-500/35 transition-all duration-300 hover:scale-110 hover:shadow-emerald-500/60"
      >
        <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-whatsappPulse" />
        <span className="absolute -inset-2 rounded-full border border-emerald-300/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <svg className="relative z-10 h-8 w-8" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
          <path d="M16.04 3.2c-7.04 0-12.76 5.72-12.76 12.76 0 2.25.59 4.45 1.71 6.39L3.2 28.8l6.61-1.73a12.7 12.7 0 0 0 6.23 1.59h.01c7.04 0 12.76-5.72 12.76-12.76S23.08 3.2 16.04 3.2Zm0 23.3h-.01c-1.93 0-3.82-.52-5.48-1.5l-.39-.23-3.92 1.03 1.05-3.82-.25-.39a10.54 10.54 0 0 1-1.61-5.63c0-5.87 4.77-10.64 10.65-10.64 2.84 0 5.51 1.11 7.52 3.12a10.58 10.58 0 0 1 3.12 7.52c0 5.87-4.78 10.64-10.68 10.64Zm5.84-7.96c-.32-.16-1.9-.94-2.19-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.71-.98-2.34-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.08-1.11 2.64 0 1.56 1.14 3.06 1.3 3.27.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.9-.77 2.17-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" />
        </svg>
        <span className="pointer-events-none absolute right-20 hidden whitespace-nowrap rounded-2xl border border-emerald-400/30 bg-slate-950/95 px-4 py-2 text-sm font-bold text-emerald-200 shadow-xl backdrop-blur-xl transition-all duration-300 group-hover:block">
          Contactar por WhatsApp
        </span>
      </a>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
          <div className="flex flex-col items-center md:items-start">
            <img src={LOGOS.navbar} alt="FleetVision" className="h-12 w-auto max-w-[240px] object-contain" />
            <p className="mt-2 text-sm text-slate-500">Sistema CMMS para gestión de flotas y mantenimiento.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
            <button onClick={() => scrollToSection("features")} className="transition-colors hover:text-white">Características</button>
            <button onClick={() => scrollToSection("industries")} className="transition-colors hover:text-white">Sectores</button>
            <button onClick={() => scrollToSection("pricing")} className="transition-colors hover:text-white">Planes</button>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-emerald-300">WhatsApp</a>
          </div>
        </div>
      </footer>

      <style jsx global>{`
                html { scroll-behavior: smooth; }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes floatSlow {
                    0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.5; }
                    50% { transform: translate3d(18px, -22px, 0); opacity: 1; }
                }

                @keyframes floatSlow2 {
                    0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.45; }
                    50% { transform: translate3d(-18px, 18px, 0); opacity: 1; }
                }

                @keyframes barGrow {
                    from { width: 0%; }
                    to { width: 65%; }
                }

                @keyframes whatsappPulse {
                    0% { transform: scale(1); opacity: 0.45; }
                    70% { transform: scale(1.55); opacity: 0; }
                    100% { transform: scale(1.55); opacity: 0; }
                }

                .animate-fadeUp { animation: fadeUp 0.75s ease both; }
                .animate-fadeUpDelay { animation: fadeUp 0.85s ease 0.12s both; }
                .animate-floatSlow { animation: floatSlow 7s ease-in-out infinite; }
                .animate-floatSlow2 { animation: floatSlow2 8s ease-in-out infinite; }
                .animate-barGrow { animation: barGrow 1.3s ease-out both; }
                .animate-whatsappPulse { animation: whatsappPulse 2s ease-out infinite; }
            `}</style>
    </main>
  );
}
