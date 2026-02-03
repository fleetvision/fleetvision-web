"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation'; // IMPORTANTE: Agregar esta línea

export default function Home() {
  const router = useRouter(); // IMPORTANTE: Agregar esta línea

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [counterValues, setCounterValues] = useState({
    clients: 0,
    assets: 0,
    uptime: 0,
    support: 0
  });

  // ESTADOS PARA FORMULARIOS
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [showTrialForm, setShowTrialForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    schedule: ''
  });
  const [trialData, setTrialData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    cardName: ''
  });
  const [trialLoading, setTrialLoading] = useState(false);

  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Update active section based on scroll
      const sections = ['hero', 'metrics', 'features', 'workflow', 'testimonials', 'pricing', 'contact'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Counter animation
    const interval = setInterval(() => {
      setCounterValues(prev => ({
        clients: prev.clients < 250 ? prev.clients + 5 : 250,
        assets: prev.assets < 15000 ? prev.assets + 300 : 15000,
        uptime: prev.uptime < 99.9 ? prev.uptime + 0.3 : 99.9,
        support: prev.support < 24 ? prev.support + 0.5 : 24
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
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  // FUNCIONES PARA DEMO
  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    alert(`¡Gracias ${formData.name}! Hemos recibido tu solicitud de demo. Te contactaremos pronto a ${formData.email} para coordinar.`);

    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      schedule: ''
    });

    setShowDemoForm(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // FUNCIONES PARA PRUEBA GRATIS CON VERIFICACIÓN DE TARJETA
  const handleTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrialLoading(true);

    // Validación mejorada
    if (!trialData.cardNumber || !trialData.cardExpiry || !trialData.cardCVC || !trialData.cardName) {
      alert('Por favor completa todos los datos de la tarjeta para verificación de identidad.');
      setTrialLoading(false);
      return;
    }

    // Verificar que el nombre en la tarjeta coincida con el nombre del usuario
    if (trialData.cardName.toLowerCase() !== trialData.name.toLowerCase()) {
      alert('El nombre en la tarjeta debe coincidir con tu nombre completo para verificación de identidad.');
      setTrialLoading(false);
      return;
    }

    // Verificar formato de tarjeta (simulación)
    const cardDigits = trialData.cardNumber.replace(/\s/g, '');
    if (cardDigits.length < 15 || cardDigits.length > 19) {
      alert('Por favor ingresa un número de tarjeta válido.');
      setTrialLoading(false);
      return;
    }

    // Simular verificación con servicio externo (Stripe-like)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Aquí iría la integración real con Stripe/Paymentez/etc.
    // Por ahora simulamos verificación exitosa
    const isCardValid = true; // En producción, esto vendría de la API de pago

    if (!isCardValid) {
      alert('No pudimos verificar tu tarjeta. Por favor verifica los datos o usa otra tarjeta.');
      setTrialLoading(false);
      return;
    }

    // Éxito - tarjeta verificada (pero NO cobrada)
    alert(`✅ VERIFICACIÓN EXITOSA\n\n¡Perfecto ${trialData.name}! Tu tarjeta ha sido verificada exitosamente.\n\n📧 Acceso enviado a: ${trialData.email}\n⏰ Prueba activada por 2 días\n💰 No se realizará ningún cargo\n🚫 Puedes cancelar en cualquier momento\n\nRevisa tu correo para las instrucciones de acceso.`);

    // Limpiar formulario
    setTrialData({
      name: '',
      email: '',
      company: '',
      phone: '',
      cardNumber: '',
      cardExpiry: '',
      cardCVC: '',
      cardName: ''
    });

    setTrialLoading(false);
    setShowTrialForm(false);
  };

  const handleTrialInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Formatear número de tarjeta
    if (name === 'cardNumber') {
      const cleaned = value.replace(/\s/g, '').replace(/\D/g, '');
      const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
      setTrialData(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    // Formatear fecha de expiración
    if (name === 'cardExpiry') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length >= 2) {
        const formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
        setTrialData(prev => ({ ...prev, [name]: formatted }));
      } else {
        setTrialData(prev => ({ ...prev, [name]: cleaned }));
      }
      return;
    }

    // Limitar CVC
    if (name === 'cardCVC') {
      const cleaned = value.replace(/\D/g, '').slice(0, 4);
      setTrialData(prev => ({ ...prev, [name]: cleaned }));
      return;
    }

    // Para el nombre de la tarjeta, capitalizar cada palabra
    if (name === 'cardName') {
      const capitalized = value
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setTrialData(prev => ({ ...prev, [name]: capitalized }));
      return;
    }

    setTrialData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200 font-sans overflow-hidden">

      {/* ========================
         BACKGROUND EFFECTS
      ======================== */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-[30%] -left-[15%] h-[1000px] w-[1000px] rounded-full bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-transparent opacity-70" style={{ filter: 'blur(180px)' }} />
        <div className="absolute top-[30%] right-[0%] h-[800px] w-[800px] rounded-full bg-gradient-to-b from-cyan-500/25 via-blue-400/15 to-transparent opacity-60" style={{ filter: 'blur(150px)' }} />
        <div className="absolute -bottom-[30%] left-[15%] h-[900px] w-[900px] rounded-full bg-gradient-to-t from-indigo-600/25 via-cyan-500/15 to-transparent opacity-70" style={{ filter: 'blur(160px)' }} />

        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:120px_120px]" />
        <div className="absolute inset-0 opacity-[0.01] bg-[radial-gradient(circle_at_center,rgba(120,220,255,0.03)_0%,transparent_70%)]" />
        <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-cyan-500/10 opacity-30" style={{ filter: 'blur(120px)' }} />
      </div>

      {/* ========================
         NAVBAR
      ======================== */}
      <header className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled
        ? "border-b border-white/10 bg-slate-950/97 backdrop-blur-xl py-3 shadow-2xl shadow-cyan-900/15"
        : "border-b border-white/5 bg-slate-950/90 backdrop-blur-lg py-4"
        }`}>
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-[#0066ff] flex items-center justify-center text-white font-black shadow-lg shadow-cyan-500/40">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Fleet<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#0088ff]">Vision</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold">
              🇨🇱 CHILE
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { id: 'hero', label: 'Inicio' },
              { id: 'metrics', label: 'Funcionalidades' },
              { id: 'features', label: 'Características' },
              { id: 'industries', label: 'Sectores' },
              { id: 'benefits', label: 'Ventajas' },
              { id: 'pricing', label: 'Planes' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeSection === item.id
                  ? 'text-white bg-white/10 shadow-inner shadow-white/5'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => router.push('/login')}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-300 hover:scale-105"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setShowDemoForm(true)}
              className="relative px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-[#0066ff] text-white font-bold text-sm hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10">Solicitar Demo</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-600 to-[#0055dd] opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-slate-950/97 backdrop-blur-xl border-b border-white/10">
            <div className="px-4 py-6 space-y-2">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold">
                  🇨🇱 SOLUCIÓN CHILENA
                </span>
              </div>
              {[
                { id: 'hero', label: 'Inicio' },
                { id: 'metrics', label: 'Funcionalidades' },
                { id: 'features', label: 'Características' },
                { id: 'industries', label: 'Sectores' },
                { id: 'benefits', label: 'Ventajas' },
                { id: 'pricing', label: 'Planes' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left px-4 py-3 rounded-lg text-base text-slate-300 hover:text-white hover:bg-white/10 transition-colors duration-300"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4 space-y-3">
                <button
                  onClick={() => {
                    router.push('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors duration-300"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => setShowDemoForm(true)}
                  className="w-full px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-[#0066ff] text-white font-bold hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300"
                >
                  Solicitar Demo
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ========================
         HERO SECTION
      ======================== */}
      <section id="hero" className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/15 to-[#0066ff]/15 border border-cyan-500/30 text-cyan-400 text-sm font-bold mb-8">
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                SISTEMA CMMS ESPECIALIZADO 🇨🇱
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                <span className="block">GESTIÓN DE</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-[#0088ff] to-cyan-300">
                  MANTENIMIENTO DE FLOTA
                </span>
              </h1>

              <p className="text-lg text-slate-400/90 mb-10 leading-relaxed">
                FleetVision transforma la gestión de tu flota vehicular. Control total del mantenimiento
                con tecnología predictiva y automatización inteligente para maximizar disponibilidad,
                prevenir fallas y reducir costos.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 mb-14">
                <button
                  onClick={() => setShowTrialForm(true)}
                  className="px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105 text-base"
                >
                  <span className="flex items-center justify-center gap-3">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Comenzar Prueba Gratis
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-5 mb-10">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-300">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Tecnología Preventiva</div>
                    <div className="text-xs text-slate-400">Programa mantenimientos antes de fallas</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-300">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Análisis de Flota</div>
                    <div className="text-xs text-slate-400">Optimización de OT preventivas</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-r from-cyan-500/30 to-[#0066ff]/30 opacity-20" style={{ filter: 'blur(64px)' }} />

              <div
                className="relative rounded-2xl border border-white/20 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden"
                style={{
                  boxShadow: '0 20px 40px -12px rgba(0, 220, 255, 0.25), 0 0 50px rgba(34, 211, 238, 0.15)',
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)'
                }}
              >
                <div className="h-12 flex items-center justify-between px-5 border-b border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-transparent">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                    <span className="h-2 w-2 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.6)]" />
                    <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    Dashboard CMMS - Tiempo Real
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      ÓRDENES DE TRABAJO
                    </h3>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300" style={{ filter: 'blur(8px)' }} />
                        <div className="relative rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 p-3 hover:border-blue-400/40 transition-all duration-300 backdrop-blur-sm">
                          <div className="text-xs text-slate-400 font-medium mb-1">OT Ingresadas</div>
                          <div className="flex items-baseline gap-1">
                            <div className="text-2xl font-bold text-white">42</div>
                            <span className="text-xs text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">+8%</span>
                          </div>
                          <div className="mt-1 text-xs text-slate-500">Últimos 7 días</div>
                        </div>
                      </div>

                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300" style={{ filter: 'blur(8px)' }} />
                        <div className="relative rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 p-3 hover:border-amber-400/40 transition-all duration-300 backdrop-blur-sm">
                          <div className="text-xs text-slate-400 font-medium mb-1">OT Pendientes</div>
                          <div className="flex items-baseline gap-1">
                            <div className="text-2xl font-bold text-white">12</div>
                            <span className="text-xs text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full">-3</span>
                          </div>
                          <div className="mt-1 text-xs text-slate-500">Prioridad alta: 4</div>
                        </div>
                      </div>

                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300" style={{ filter: 'blur(8px)' }} />
                        <div className="relative rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 p-3 hover:border-emerald-400/40 transition-all duration-300 backdrop-blur-sm">
                          <div className="text-xs text-slate-400 font-medium mb-1">OT Completadas</div>
                          <div className="flex items-baseline gap-1">
                            <div className="text-2xl font-bold text-white">156</div>
                            <span className="text-xs text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">+12%</span>
                          </div>
                          <div className="mt-1 text-xs text-slate-500">Este mes</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-[#0066ff]/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300" style={{ filter: 'blur(8px)' }} />
                      <div className="relative rounded-xl bg-gradient-to-br from-cyan-500/10 to-[#0066ff]/10 border border-cyan-500/20 p-4 hover:border-cyan-400/40 transition-all duration-300 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-9 w-9 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">MTTR Promedio</div>
                            <div className="text-xs text-slate-400">Mean Time To Repair</div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white mb-1">4.2h</div>
                          <div className="text-xs text-emerald-400">Mejorado 0.8h vs mes anterior</div>
                        </div>
                        <div className="mt-3 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-500 to-[#0066ff]" style={{ width: '65%' }} />
                        </div>
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300" style={{ filter: 'blur(8px)' }} />
                      <div className="relative rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 p-4 hover:border-violet-400/40 transition-all duration-300 backdrop-blur-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="text-sm font-medium text-white">Cumplimiento de Mantenimiento</div>
                            <div className="text-xs text-slate-400">Preventivo programado</div>
                          </div>
                          <div className="text-xl font-bold text-white">94%</div>
                        </div>

                        <div className="relative h-28 w-28 mx-auto mb-3">
                          <div className="absolute inset-0 rounded-full bg-slate-700/30"></div>
                          <div className="absolute inset-0 rounded-full"
                            style={{
                              background: `conic-gradient(
                                   #10b981 0% 94%,
                                   #ef4444 94% 100%
                                 )`
                            }}>
                          </div>
                          <div className="absolute inset-6 rounded-full bg-slate-900/80 backdrop-blur-sm"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">94%</div>
                              <div className="text-xs text-slate-400">Cumplido</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-center gap-4 text-xs">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                            <span className="text-slate-300">Cumplido</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                            <span className="text-slate-300">Pendiente</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 to-[#0066ff]/30 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300" style={{ filter: 'blur(8px)' }} />
                  <div className="relative h-24 w-24 rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-lg p-4 shadow-xl">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">24/7</div>
                      <div className="text-xs text-cyan-400 font-medium">Soporte Técnico</div>
                      <div className="mt-1.5 h-1 w-6 mx-auto bg-gradient-to-r from-cyan-500 to-[#0066ff] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 pt-14 border-t border-white/10">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-white mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-slate-400">
                  INDUSTRIAS QUE OPTIMIZAMOS
                </span>
              </h3>
              <p className="text-base text-slate-400 max-w-2xl mx-auto">
                Soluciones CMMS adaptadas para cada tipo de flota
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                {
                  initial: "⛏️",
                  name: "MINERÍA",
                  color: "from-amber-500/20 to-yellow-500/20",
                  border: "border-amber-500/20",
                  equipment: "Retroexcavadoras, camiones de carga, perforadoras",
                  focus: "Maximizar disponibilidad en operaciones críticas"
                },
                {
                  initial: "🚚",
                  name: "TRANSPORTE",
                  color: "from-blue-500/20 to-cyan-500/20",
                  border: "border-blue-500/20",
                  equipment: "Flotas de carga, transporte público, vehículos de servicio",
                  focus: "Optimización de rutas y control de costos operativos"
                },
                {
                  initial: "🚗",
                  name: "VEHÍCULOS PARTICULARES",
                  color: "from-emerald-500/20 to-green-500/20",
                  border: "border-emerald-500/20",
                  equipment: "Automóviles corporativos, furgonetas, pickups",
                  focus: "Mantenimiento preventivo programado y gestión de flotas"
                },
                {
                  initial: "📦",
                  name: "LOGÍSTICA AVANZADA",
                  color: "from-violet-500/20 to-purple-500/20",
                  border: "border-violet-500/20",
                  equipment: "Montacargas, vehículos de reparto, sistemas automatizados",
                  focus: "Coordinación de mantenimiento con operaciones logísticas"
                }
              ].map((industry, idx) => (
                <div key={idx} className="relative group">
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${industry.color} rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300`} style={{ filter: 'blur(8px)' }} />
                  <div className={`relative rounded-2xl bg-slate-900/40 backdrop-blur-sm border ${industry.border} p-5 hover:border-white/30 transition-all duration-300 h-full`}>
                    <div className="flex flex-col items-center text-center h-full">
                      <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${industry.color} flex items-center justify-center mb-3 text-2xl`}>
                        {industry.initial}
                      </div>

                      <div className="mb-3">
                        <div className="text-lg font-bold text-white mb-1">{industry.name}</div>
                      </div>

                      <div className="mb-3 flex-grow">
                        <div className="text-sm text-slate-300 mb-1.5">Equipos gestionados:</div>
                        <div className="text-xs text-slate-400 leading-relaxed">{industry.equipment}</div>
                      </div>

                      <div className="mt-auto pt-3 border-t border-white/10 w-full">
                        <div className="text-xs text-cyan-400 font-medium">{industry.focus}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10 max-w-3xl mx-auto">
              <p className="text-slate-400 text-sm leading-relaxed">
                Cada sector tiene necesidades únicas de mantenimiento. FleetVision se adapta para ofrecer
                soluciones específicas que maximicen la disponibilidad y eficiencia de tus equipos,
                sin importar el tipo de flota que gestiones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================
         METRICS SECTION
      ======================== */}
      <section id="metrics" className="relative py-16 border-t border-white/5 bg-gradient-to-b from-transparent to-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Funcionalidades Esenciales de
              <span className="block text-xl sm:text-2xl text-slate-400 mt-2">FleetVision</span>
            </h2>
            <p className="text-base text-slate-400 max-w-3xl mx-auto">
              Características diseñadas para optimizar la gestión de mantenimiento de tu flota
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Control de Órdenes de Trabajo",
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                description: "Gestión completa de OT desde creación hasta cierre con seguimiento en tiempo real",
                color: "from-emerald-500 to-green-500"
              },
              {
                title: "Historial de Mantenimiento",
                icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                description: "Registro digital completo con trazabilidad de cada intervención realizada",
                color: "from-blue-500 to-cyan-500"
              },
              {
                title: "Soporte Especializado",
                icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                description: "Asistencia técnica dedicada para optimizar tu gestión de mantenimiento",
                color: "from-amber-500 to-yellow-500"
              },
              {
                title: "Planificación Preventiva",
                icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                description: "Programación y seguimiento de mantenimientos preventivos",
                color: "from-violet-500 to-purple-500"
              }
            ].map((item) => (
              <div key={item.title} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500" style={{ filter: 'blur(8px)' }} />
                <div className="relative rounded-2xl bg-slate-900/60 border border-white/10 p-6 hover:border-white/20 transition-colors duration-300 h-full">
                  <div className="flex flex-col items-center text-center h-full">
                    <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                    </div>

                    <div className="text-lg font-bold text-white mb-3">{item.title}</div>

                    <div className="text-slate-400 text-sm flex-grow">
                      {item.description}
                    </div>

                    <div className="mt-4 h-1 w-10 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { title: "Prevención de Fallas", desc: "Mantenimiento programado" },
              { title: "Gestión de Repuestos", desc: "Control de inventario" },
              { title: "Reportes Automáticos", desc: "Análisis ejecutivo" },
              { title: "Monitoreo Continuo", desc: "Seguimiento en tiempo real" },
              { title: "Cumplimiento Normativo", desc: "Estándares internacionales" },
              { title: "Optimización de Costos", desc: "Control de gastos" }
            ].map((feature, index) => (
              <div key={index} className="text-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-300">
                <div className="text-base font-bold text-white mb-1.5">{feature.title}</div>
                <div className="text-xs text-slate-400">{feature.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================
         FEATURES SECTION
      ======================== */}
      <section id="features" className="relative py-20 bg-gradient-to-b from-slate-900/30 to-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1.5 rounded-full bg-sky-500/10 text-sky-400 text-sm font-bold mb-4">
              TECNOLOGÍA ESPECIALIZADA
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Soluciones para
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
                Todo Tipo de Flota
              </span>
            </h2>
            <p className="text-base text-slate-400 max-w-3xl mx-auto">
              FleetVision integra mantenimiento preventivo con análisis predictivo para maximizar la vida útil de tus equipos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Mantenimiento Preventivo",
                description: "Programación automática basada en horas de uso y condiciones operativas",
                features: ["Alertas de mantenimiento", "Cronogramas optimizados", "Checklists digitales", "Historial de servicios"]
              },
              {
                icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
                title: "Gestión de Órdenes de Trabajo",
                description: "Control completo del ciclo de vida de cada OT",
                features: ["Asignación de técnicos", "Seguimiento en tiempo real", "Firma digital", "Documentación fotográfica"]
              },
              {
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                title: "KPIs y Métricas",
                description: "Indicadores clave para medir el desempeño del mantenimiento",
                features: ["Disponibilidad de equipos", "Indicador de % de mantenimientos preventivos realizados", "Indicador de MTBF", "Análisis de tendencias"]
              },
              {
                icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Control de Costos",
                description: "Visibilidad total de gastos de mantenimiento",
                features: ["Costos por repuesto", "Análisis de HH (Horas Hombre)", "Tiempo de inactividad", "Creación de Orden de Compra"]
              },
              {
                icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
                title: "Gestión de Inventario",
                description: "Control inteligente de repuestos y componentes",
                features: ["Alertas de stock mínimo", "Proveedores calificados", "Historial de consumo", "Optimización de inventario"]
              },
              {
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                title: "Reportes Automatizados",
                description: "Generación automática de reportes ejecutivos",
                features: ["Personalización total", "Exportación múltiple", "Programación automática", "Dashboards interactivos"]
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500" style={{ filter: 'blur(8px)' }} />
                <div className="relative rounded-2xl bg-slate-900/60 border border-white/10 p-6 hover:border-sky-500/30 transition-all duration-300 hover:translate-y-[-4px]">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                        <div className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                        <span className="text-xs">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================
         BENEFITS SECTION (EXPANDIDO)
      ======================== */}
      <section id="benefits" className="relative py-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold mb-4">
              <span>🇨🇱</span>
              <span>SOLUCIÓN CHILENA</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              ¿Por Qué Elegir
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
                FleetVision?
              </span>
            </h2>
            <p className="text-base text-slate-400 max-w-2xl mx-auto">
              Más de 10 ventajas competitivas que nos diferencian de otras soluciones
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Implementación Rápida",
                content: "Configuración en días, no en meses. Tu equipo estará operativo rápidamente."
              },
              {
                icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                title: "Seguridad Garantizada",
                content: "Datos protegidos con cifrado de nivel empresarial y backups automáticos en servidores locales."
              },
              {
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                title: "Soporte Especializado",
                content: "Equipo técnico chileno dedicado a la gestión de mantenimiento de flotas."
              },
              {
                icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Integración Local",
                content: "Diseñado específicamente para las necesidades y regulaciones chilenas."
              },
              {
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                title: "Reportes Personalizados",
                content: "Dashboards adaptados a los requerimientos específicos de tu industria."
              },
              {
                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Actualizaciones Constantes",
                content: "Mejoras continuas basadas en feedback de clientes chilenos."
              }
            ].map((item, index) => (
              <div key={index} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500" style={{ filter: 'blur(8px)' }} />
                <div className="relative rounded-2xl bg-slate-900/60 border border-white/10 p-6 hover:border-emerald-500/30 transition-all duration-300">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-300 text-sm">{item.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-3 bg-gradient-to-r from-slate-800/40 to-slate-900/40 rounded-2xl border border-cyan-500/20 p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                    <span className="text-2xl">🇨🇱</span>
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-bold text-white mb-2">Especialistas en Flotas Chilenas</h3>
                  <p className="text-slate-300">
                    Conocemos las particularidades del mercado chileno: rutas, clima, tipos de vehículos,
                    regulaciones SII, y necesidades específicas de cada región. FleetVision no es una solución
                    genérica adaptada, fue creada pensando en las flotas chilenas desde el primer día.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================
         PRICING SECTION
      ======================== */}
      <section id="pricing" className="relative py-20 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-400 text-sm font-bold mb-4">
              <span>🇨🇱</span>
              <span>PRECIOS EN PESOS CHILENOS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Planes para
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
                Cada Necesidad
              </span>
            </h2>
            <p className="text-base text-slate-400 max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tu operación de mantenimiento
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Básico",
                price: "$15.000",
                period: "por mes",
                description: "Ideal para flotas pequeñas (1-3 vehículos)",
                features: ["1-3 vehículos", "Órdenes de trabajo básicas", "Mantenimiento preventivo", "Reportes estándar", "Soporte por email"],
                featured: false,
                color: "from-slate-500 to-slate-700"
              },
              {
                name: "Profesional",
                price: "$25.000",
                period: "por mes",
                description: "Para flotas medianas (3-10 vehículos)",
                features: ["3-10 vehículos", "Mantenimiento predictivo", "KPIs avanzados", "API integración", "Soporte prioritario 24/7", "Dashboard ejecutivo"],
                featured: true,
                color: "from-sky-500 to-cyan-500"
              },
              {
                name: "Enterprise",
                price: "Personalizado",
                period: "cotización",
                description: "Soluciones corporativas completas",
                features: ["Vehículos ilimitados", "Análisis predictivo avanzado", "SLA garantizado", "Integración completa", "Soporte dedicado", "Capacitación in situ", "Certificaciones"],
                featured: false,
                color: "from-violet-500 to-purple-500"
              }
            ].map((plan, index) => (
              <div key={index} className={`relative ${plan.featured ? 'lg:-translate-y-3' : ''}`}>
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-xs font-bold">
                      MÁS POPULAR
                    </div>
                  </div>
                )}
                <div className={`rounded-3xl border-2 ${plan.featured ? 'border-sky-500/30' : 'border-white/10'} bg-slate-900/80 backdrop-blur-sm p-6 h-full`}>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl lg:text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-slate-400 text-sm">{plan.period}</span>
                    </div>
                    <p className="text-slate-400 text-sm">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <svg className={`w-4 h-4 ${plan.featured ? 'text-sky-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={`text-sm ${plan.featured ? 'text-white' : 'text-slate-300'}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => plan.name === "Enterprise" ? setShowDemoForm(true) : setShowTrialForm(true)}
                    className={`w-full py-3 rounded-xl font-bold transition-all duration-300 text-sm ${plan.featured
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:shadow-xl hover:shadow-sky-500/30 hover:scale-105'
                      : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                      }`}
                  >
                    {plan.name === "Enterprise" ? "Contactar Ventas" : "Comenzar Prueba"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-400 text-sm">
              Todos los planes incluyen actualizaciones gratuitas y soporte técnico básico.
              <span className="block text-cyan-400 mt-1">Facturación electrónica incluida • Compatible con SII</span>
            </p>
          </div>
        </div>
      </section>

      {/* ========================
         CTA SECTION
      ======================== */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-blue-500/10 to-cyan-500/10" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-sky-500/5" style={{ filter: 'blur(96px)' }} />
        <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-cyan-500/5" style={{ filter: 'blur(96px)' }} />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            ¿Listo para Modernizar tu
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
              Gestión de Mantenimiento?
            </span>
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Comienza a optimizar tu flota con herramientas profesionales de CMMS
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-12">
            <button
              onClick={() => setShowTrialForm(true)}
              className="group relative px-10 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold text-base hover:shadow-xl hover:shadow-sky-500/40 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10">Comenzar Prueba Gratis</span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button
              onClick={() => setShowDemoForm(true)}
              className="px-10 py-4 rounded-2xl border-2 border-white/10 bg-white/5 text-white font-medium text-base hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              Agendar Demo Personalizada
            </button>
          </div>

          <div className="text-sm text-slate-500">
            <p className="mb-3">✅ Tarjeta requerida solo para verificación • Sin cargos durante la prueba</p>
            <p>✅ Prueba de <strong>2 días</strong> • Cancelación instantánea en cualquier momento</p>
            <p className="mt-3 text-xs text-slate-600">🇨🇱 Plataforma diseñada y desarrollada en Chile para empresas chilenas</p>
          </div>
        </div>
      </section>

      {/* ========================
         MODAL PARA PRUEBA GRATIS CON VERIFICACIÓN DE IDENTIDAD
      ======================== */}
      {showTrialForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-emerald-500/30 overflow-hidden my-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />

            <div className="relative z-10 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Prueba Gratuita de 2 Días</h3>
                  <p className="text-slate-400 text-xs mt-1">Verificación de identidad requerida • Sin cargos durante la prueba</p>
                </div>
                <button
                  onClick={() => setShowTrialForm(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-emerald-300 mb-1.5">
                      <strong>Verificación de identidad:</strong> Para proteger nuestra plataforma de uso fraudulento,
                      necesitamos verificar tu identidad mediante tu tarjeta de crédito/débito.
                    </p>
                    <p className="text-xs text-emerald-400">
                      <strong>Importante:</strong> El nombre en la tarjeta debe coincidir con tu nombre completo.
                      <span className="block mt-1">✅ No se realizará ningún cargo durante los 2 días de prueba.</span>
                      <span className="block">✅ Solo verificamos que la tarjeta sea válida y pertenezca a ti.</span>
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleTrialSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={trialData.name}
                      onChange={handleTrialInputChange}
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
                      placeholder="Ej: Juan Pérez Rodríguez"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={trialData.email}
                      onChange={handleTrialInputChange}
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
                      placeholder="tu@empresa.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Empresa *
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={trialData.company}
                      onChange={handleTrialInputChange}
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={trialData.phone}
                      onChange={handleTrialInputChange}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-base font-bold text-white mb-3 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Información de Tarjeta (Solo para verificación)
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Nombre en la Tarjeta *
                        <span className="block text-xs text-emerald-400">(Debe coincidir con tu nombre)</span>
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        value={trialData.cardName}
                        onChange={handleTrialInputChange}
                        required
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
                        placeholder="Ej: JUAN PEREZ RODRIGUEZ"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Número de Tarjeta *
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={trialData.cardNumber}
                        onChange={handleTrialInputChange}
                        required
                        maxLength={19}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Fecha Exp. (MM/AA) *
                      </label>
                      <input
                        type="text"
                        name="cardExpiry"
                        value={trialData.cardExpiry}
                        onChange={handleTrialInputChange}
                        required
                        maxLength={5}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
                        placeholder="MM/AA"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        CVC *
                      </label>
                      <input
                        type="text"
                        name="cardCVC"
                        value={trialData.cardCVC}
                        onChange={handleTrialInputChange}
                        required
                        maxLength={4}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
                        placeholder="123"
                      />
                    </div>

                    <div className="flex items-end">
                      <div className="w-full text-center p-2.5 rounded-xl bg-slate-800/30 border border-slate-700">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          Verificación segura
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Procesamiento seguro • Nivel bancario de seguridad</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="submit"
                    disabled={trialLoading}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                  >
                    {trialLoading ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Verificando identidad...
                      </span>
                    ) : (
                      'Verificar Identidad y Activar Prueba'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTrialForm(false)}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-700 text-slate-400 hover:bg-white/5 hover:text-white transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="text-center text-xs text-slate-500 pt-3 space-y-1.5">
                  <p>Al activar la prueba, aceptas nuestros <a href="#" className="text-emerald-400 hover:text-emerald-300">Términos</a> y <a href="#" className="text-emerald-400 hover:text-emerald-300">Privacidad</a></p>
                  <p className="text-slate-600 text-xs">
                    <strong>Proceso de verificación:</strong> Validamos que la tarjeta sea válida y que el nombre coincida.
                    No se realizarán cargos durante los 2 días de prueba.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================
         MODAL PARA AGENDAR DEMO
      ======================== */}
      {showDemoForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-sky-500/30 overflow-hidden my-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />

            <div className="relative z-10 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Agendar Demo Personalizada</h3>
                <button
                  onClick={() => setShowDemoForm(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleDemoSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors text-sm"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors text-sm"
                      placeholder="tu@empresa.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Empresa *
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors text-sm"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors text-sm"
                      placeholder="+56 9 1234 5678"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      ¿Cuándo prefieres la demo? *
                    </label>
                    <select
                      name="schedule"
                      value={formData.schedule}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors text-sm"
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="asap">Lo antes posible</option>
                      <option value="this_week">Esta semana</option>
                      <option value="next_week">La próxima semana</option>
                      <option value="specific">Fecha específica (lo coordinaremos)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold hover:shadow-xl hover:shadow-sky-500/30 transition-all duration-300 text-sm"
                  >
                    Solicitar Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDemoForm(false)}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-700 text-slate-400 hover:bg-white/5 hover:text-white transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                </div>

                <p className="text-center text-xs text-slate-500 pt-3">
                  Te contactaremos en menos de 24 horas para coordinar la demo personalizada.
                </p>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================
         FOOTER
      ======================== */}
      <footer className="relative border-t border-white/10 bg-slate-950 pt-12 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-sky-500/30">
                  FV
                </div>
                <div>
                  <span className="text-xl font-bold text-white">
                    Fleet<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">Vision</span>
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold">
                      🇨🇱 CHILE
                    </span>
                    <span className="text-xs text-slate-500">Solución 100% chilena</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-6 max-w-md">
                Plataforma CMMS avanzada para gestión predictiva de flotas vehiculares.
                Maximiza disponibilidad, previene fallas y reduce costos.
              </p>
              <div className="flex gap-3">
                {["twitter", "linkedin", "youtube"].map((social) => (
                  <a key={social} href="#" className="h-9 w-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors duration-300">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social === "twitter" ? "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" :
                        social === "linkedin" ? "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" :
                          "M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {[
              {
                title: "Producto",
                links: ["Características", "Funcionalidades", "Seguridad", "Planes", "Demo", "Actualizaciones"]
              },
              {
                title: "Empresa",
                links: ["Sobre Nosotros", "Sectores", "Blog", "Contacto"]
              },
              {
                title: "Recursos",
                links: ["Documentación", "Centro de Ayuda", "Comunidad", "Estado"]
              }
            ].map((column) => (
              <div key={column.title}>
                <h3 className="text-base font-bold text-white mb-4">{column.title}</h3>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-slate-400 text-sm hover:text-white transition-colors duration-300">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-xs text-slate-500">
                © {new Date().getFullYear()} FleetVision Chile. Todos los derechos reservados.
              </div>
              <div className="flex gap-6 text-xs text-slate-500">
                <a href="#" className="hover:text-white transition-colors duration-300">Términos</a>
                <a href="#" className="hover:text-white transition-colors duration-300">Privacidad</a>
                <a href="#" className="hover:text-white transition-colors duration-300">Cookies</a>
                <a href="#" className="hover:text-white transition-colors duration-300">Aviso Legal</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Contact Button */}
      <button
        onClick={() => setShowDemoForm(true)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-xl shadow-sky-500/30 hover:scale-110 transition-transform duration-300 z-40 flex items-center justify-center"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </main>
  );
}