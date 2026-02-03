"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showTrialRequest, setShowTrialRequest] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [trialEmail, setTrialEmail] = useState("");
    const [trialName, setTrialName] = useState("");
    const [trialCompany, setTrialCompany] = useState("");
    const [trialPhone, setTrialPhone] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);
    const [trialLoading, setTrialLoading] = useState(false);
    const [forgotSuccess, setForgotSuccess] = useState(false);
    const [trialSuccess, setTrialSuccess] = useState(false);

    // Estados para partículas y efectos
    const [particles, setParticles] = useState<Array<{ x: number, y: number, size: number, speedX: number, speedY: number, color: string }>>([]);
    const [sparks, setSparks] = useState<Array<{ x: number, y: number, size: number, speedX: number, speedY: number, opacity: number, life: number }>>([]);
    const [glows, setGlows] = useState<Array<{ x: number, y: number, size: number, intensity: number, color: string }>>([]);

    // Generar partículas animadas
    useEffect(() => {
        const generateEffects = () => {
            const newParticles = [];
            const newSparks = [];
            const newGlows = [];

            const colors = [
                'rgba(34, 211, 238, 0.3)',
                'rgba(56, 189, 248, 0.25)',
                'rgba(14, 165, 233, 0.2)',
                'rgba(2, 132, 199, 0.15)',
                'rgba(0, 102, 255, 0.1)',
                'rgba(255, 255, 255, 0.08)',
                'rgba(147, 51, 234, 0.15)',
                'rgba(236, 72, 153, 0.1)',
            ];

            const glowColors = [
                'rgba(34, 211, 238, 0.4)',
                'rgba(56, 189, 248, 0.35)',
                'rgba(147, 51, 234, 0.3)',
                'rgba(236, 72, 153, 0.25)',
                'rgba(34, 197, 94, 0.2)',
            ];

            // Partículas normales
            for (let i = 0; i < 50; i++) {
                newParticles.push({
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    size: Math.random() * 3 + 1,
                    speedX: (Math.random() - 0.5) * 0.3,
                    speedY: (Math.random() - 0.5) * 0.3,
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
            }

            // Chispas
            for (let i = 0; i < 30; i++) {
                newSparks.push({
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    size: Math.random() * 1.5 + 0.5,
                    speedX: (Math.random() - 0.5) * 1.2,
                    speedY: (Math.random() - 0.5) * 1.2,
                    opacity: Math.random() * 0.8 + 0.2,
                    life: Math.random() * 100 + 50
                });
            }

            // Destellos
            for (let i = 0; i < 15; i++) {
                newGlows.push({
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    size: Math.random() * 120 + 40,
                    intensity: Math.random() * 0.3 + 0.1,
                    color: glowColors[Math.floor(Math.random() * glowColors.length)]
                });
            }

            setParticles(newParticles);
            setSparks(newSparks);
            setGlows(newGlows);
        };

        generateEffects();
    }, []);

    // Animar partículas y efectos
    useEffect(() => {
        const interval = setInterval(() => {
            setParticles(prev => prev.map(p => ({
                ...p,
                x: (p.x + p.speedX + 100) % 100,
                y: (p.y + p.speedY + 100) % 100
            })));

            setSparks(prev => prev.map(s => {
                const newLife = s.life - 1;
                if (newLife <= 0) {
                    return {
                        x: Math.random() * 100,
                        y: Math.random() * 100,
                        size: Math.random() * 1.5 + 0.5,
                        speedX: (Math.random() - 0.5) * 1.2,
                        speedY: (Math.random() - 0.5) * 1.2,
                        opacity: Math.random() * 0.8 + 0.2,
                        life: Math.random() * 100 + 50
                    };
                }
                return {
                    ...s,
                    x: (s.x + s.speedX + 100) % 100,
                    y: (s.y + s.speedY + 100) % 100,
                    life: newLife,
                    opacity: s.opacity * (newLife / s.life)
                };
            }));

            setGlows(prev => prev.map(g => ({
                ...g,
                intensity: g.intensity + (Math.random() - 0.5) * 0.02,
                x: g.x + (Math.random() - 0.5) * 0.1,
                y: g.y + (Math.random() - 0.5) * 0.1
            })));
        }, 40);

        return () => clearInterval(interval);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simular autenticación
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Redirigir al dashboard
        router.push('/');
        setLoading(false);
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!forgotEmail) {
            alert("Por favor ingresa tu correo electrónico");
            return;
        }

        setForgotLoading(true);

        // Simular envío de contraseña provisional
        await new Promise(resolve => setTimeout(resolve, 2000));

        setForgotSuccess(true);
        setForgotLoading(false);

        setTimeout(() => {
            setShowForgotPassword(false);
            setForgotSuccess(false);
            setForgotEmail("");
        }, 3000);
    };

    const handleTrialRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trialEmail || !trialName || !trialCompany) {
            alert("Por favor completa todos los campos requeridos");
            return;
        }

        setTrialLoading(true);

        // Simular envío de solicitud
        await new Promise(resolve => setTimeout(resolve, 2000));

        setTrialSuccess(true);
        setTrialLoading(false);

        setTimeout(() => {
            setShowTrialRequest(false);
            setTrialSuccess(false);
            setTrialEmail("");
            setTrialName("");
            setTrialCompany("");
            setTrialPhone("");
        }, 3000);
    };

    return (
        <main className="relative min-h-screen w-full bg-slate-950 font-sans overflow-hidden">
            {/* BACKGROUND EFFECTS */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Grandes destellos de fondo */}
                {glows.map((glow, index) => (
                    <div
                        key={`glow-${index}`}
                        className="absolute rounded-full animate-pulse"
                        style={{
                            left: `${glow.x}%`,
                            top: `${glow.y}%`,
                            width: `${glow.size}px`,
                            height: `${glow.size}px`,
                            background: `radial-gradient(circle, ${glow.color} 0%, transparent 70%)`,
                            opacity: glow.intensity,
                            filter: `blur(${glow.size * 0.3}px)`,
                            animation: `pulse ${Math.random() * 4 + 2}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 2}s`,
                        }}
                    />
                ))}

                {/* Gradientes de fondo */}
                <div className="absolute -top-[20%] -left-[10%] h-[800px] w-[800px] rounded-full bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-transparent opacity-70" style={{ filter: 'blur(150px)' }} />
                <div className="absolute top-[30%] right-[0%] h-[600px] w-[600px] rounded-full bg-gradient-to-b from-cyan-500/25 via-blue-400/15 to-transparent opacity-60" style={{ filter: 'blur(120px)' }} />
                <div className="absolute -bottom-[20%] left-[10%] h-[700px] w-[700px] rounded-full bg-gradient-to-t from-indigo-600/25 via-cyan-500/15 to-transparent opacity-70" style={{ filter: 'blur(140px)' }} />

                {/* Grid sutil */}
                <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:80px_80px]" />

                {/* Partículas */}
                {particles.map((particle, index) => (
                    <div
                        key={`particle-${index}`}
                        className="absolute rounded-full"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            backgroundColor: particle.color,
                            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                            filter: `blur(${particle.size * 0.3}px)`,
                            animation: `float ${Math.random() * 10 + 5}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 5}s`,
                        }}
                    />
                ))}

                {/* Chispas */}
                {sparks.map((spark, index) => (
                    <div
                        key={`spark-${index}`}
                        className="absolute rounded-full"
                        style={{
                            left: `${spark.x}%`,
                            top: `${spark.y}%`,
                            width: `${spark.size}px`,
                            height: `${spark.size}px`,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            boxShadow: `0 0 ${spark.size * 3}px rgba(34, 211, 238, 0.7)`,
                            opacity: spark.opacity,
                            filter: `blur(${spark.size * 0.2}px)`,
                        }}
                    />
                ))}
            </div>

            {/* MODAL OLVIDÉ MI CONTRASEÑA */}
            {showForgotPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="relative w-full max-w-md rounded-xl bg-slate-900 border border-emerald-500/30 overflow-hidden">
                        <div className="relative z-10 p-5">
                            <div className="flex justify-between items-center mb-5">
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        {forgotSuccess ? "✅ Contraseña Enviada" : "Recuperar Contraseña"}
                                    </h3>
                                    <p className="text-slate-400 text-xs mt-1">
                                        {forgotSuccess ? "Revisa tu correo electrónico" : "Te enviaremos una contraseña provisional"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowForgotPassword(false);
                                        setForgotSuccess(false);
                                        setForgotEmail("");
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {forgotSuccess ? (
                                <div className="text-center py-4">
                                    <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-base font-bold text-white mb-2">¡Contraseña enviada!</h4>
                                    <p className="text-slate-300 text-sm mb-3">
                                        Hemos enviado una contraseña provisional a:<br />
                                        <span className="text-emerald-400 font-medium">{forgotEmail}</span>
                                    </p>
                                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                        <p className="text-xs text-emerald-400">
                                            ⚠️ <strong>Importante:</strong> Revisa tu carpeta de spam si no encuentras el correo.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                        <div className="flex items-start gap-2">
                                            <svg className="w-4 h-4 text-emerald-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div>
                                                <p className="text-xs text-emerald-300">
                                                    Ingresa el correo electrónico asociado a tu cuenta de FleetVision.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={handleForgotPassword} className="space-y-4">
                                        <div className="relative group">
                                            <div className="relative rounded-lg bg-gradient-to-br from-white/5 to-white/2 border border-white/10 p-3 hover:border-emerald-500/30 transition-all duration-300 backdrop-blur-sm">
                                                <label className="block text-xs font-medium text-emerald-400 mb-1.5 flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    Correo Electrónico *
                                                </label>
                                                <input
                                                    type="email"
                                                    value={forgotEmail}
                                                    onChange={(e) => setForgotEmail(e.target.value)}
                                                    placeholder="tu@empresa.cl"
                                                    required
                                                    className="w-full bg-transparent border-none text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="submit"
                                                disabled={forgotLoading}
                                                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                                            >
                                                {forgotLoading ? (
                                                    <span className="flex items-center justify-center gap-1.5">
                                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Enviando...
                                                    </span>
                                                ) : 'Enviar Contraseña'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowForgotPassword(false);
                                                    setForgotEmail("");
                                                }}
                                                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:bg-white/5 hover:text-white transition-colors text-sm"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL SOLICITAR PRUEBA GRATUITA */}
            {showTrialRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <div className="relative w-full max-w-lg rounded-xl bg-slate-900 border border-sky-500/30 overflow-hidden my-auto">
                        <div className="relative z-10 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        {trialSuccess ? "✅ Solicitud Enviada" : "Solicitar Prueba Gratuita"}
                                    </h3>
                                    <p className="text-slate-400 text-xs mt-1">
                                        {trialSuccess ? "Te contactaremos a la brevedad" : "Completa el formulario para acceder a la prueba"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowTrialRequest(false);
                                        setTrialSuccess(false);
                                        setTrialEmail("");
                                        setTrialName("");
                                        setTrialCompany("");
                                        setTrialPhone("");
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {trialSuccess ? (
                                <div className="text-center py-4">
                                    <div className="h-12 w-12 rounded-full bg-sky-500/20 flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-base font-bold text-white mb-2">¡Solicitud recibida!</h4>
                                    <p className="text-slate-300 text-sm mb-4">
                                        Te contactaremos en <span className="text-sky-400 font-medium">menos de 24 horas</span>.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-5 p-3 rounded-lg bg-sky-500/10 border border-sky-500/20">
                                        <div className="flex items-start gap-2">
                                            <svg className="w-4 h-4 text-sky-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div>
                                                <p className="text-xs text-sky-300 mb-1.5">
                                                    <strong>Prueba gratuita de FleetVision CMMS:</strong> Acceso completo por 14 días.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={handleTrialRequest} className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-3">
                                            <div className="relative group">
                                                <div className="relative rounded-lg bg-gradient-to-br from-white/5 to-white/2 border border-white/10 p-3 hover:border-sky-500/30 transition-all duration-300 backdrop-blur-sm">
                                                    <label className="block text-xs font-medium text-sky-400 mb-1.5">
                                                        Nombre Completo *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={trialName}
                                                        onChange={(e) => setTrialName(e.target.value)}
                                                        placeholder="Juan Pérez"
                                                        required
                                                        className="w-full bg-transparent border-none text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="relative group">
                                                <div className="relative rounded-lg bg-gradient-to-br from-white/5 to-white/2 border border-white/10 p-3 hover:border-sky-500/30 transition-all duration-300 backdrop-blur-sm">
                                                    <label className="block text-xs font-medium text-sky-400 mb-1.5">
                                                        Correo Electrónico *
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={trialEmail}
                                                        onChange={(e) => setTrialEmail(e.target.value)}
                                                        placeholder="tu@empresa.cl"
                                                        required
                                                        className="w-full bg-transparent border-none text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="relative group">
                                                <div className="relative rounded-lg bg-gradient-to-br from-white/5 to-white/2 border border-white/10 p-3 hover:border-sky-500/30 transition-all duration-300 backdrop-blur-sm">
                                                    <label className="block text-xs font-medium text-sky-400 mb-1.5">
                                                        Empresa *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={trialCompany}
                                                        onChange={(e) => setTrialCompany(e.target.value)}
                                                        placeholder="Nombre de tu empresa"
                                                        required
                                                        className="w-full bg-transparent border-none text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="relative group">
                                                <div className="relative rounded-lg bg-gradient-to-br from-white/5 to-white/2 border border-white/10 p-3 hover:border-sky-500/30 transition-all duration-300 backdrop-blur-sm">
                                                    <label className="block text-xs font-medium text-sky-400 mb-1.5">
                                                        Teléfono (Opcional)
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={trialPhone}
                                                        onChange={(e) => setTrialPhone(e.target.value)}
                                                        placeholder="+56 9 1234 5678"
                                                        className="w-full bg-transparent border-none text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="submit"
                                                disabled={trialLoading}
                                                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold hover:shadow-lg hover:shadow-sky-500/20 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                                            >
                                                {trialLoading ? (
                                                    <span className="flex items-center justify-center gap-1.5">
                                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Enviando...
                                                    </span>
                                                ) : 'Solicitar Prueba Gratuita'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowTrialRequest(false);
                                                    setTrialEmail("");
                                                    setTrialName("");
                                                    setTrialCompany("");
                                                    setTrialPhone("");
                                                }}
                                                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:bg-white/5 hover:text-white transition-colors text-sm"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENIDO PRINCIPAL DEL LOGIN */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                {/* Efecto de luz alrededor del formulario */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative h-[400px] w-[400px] rounded-full" style={{
                        background: 'radial-gradient(circle at center, rgba(34, 211, 238, 0.1) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                        animation: 'pulse 3s ease-in-out infinite',
                    }} />
                </div>

                <div className="relative w-full max-w-sm">
                    {/* Tarjeta del formulario */}
                    <div className="relative group">
                        {/* Efecto de brillo alrededor */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ filter: 'blur(20px)' }} />

                        <div className="relative rounded-xl border border-white/15 bg-slate-950/80 backdrop-blur-lg shadow-xl overflow-hidden"
                            style={{
                                boxShadow: '0 10px 30px -5px rgba(0, 220, 255, 0.2), 0 0 40px rgba(34, 211, 238, 0.1)',
                                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)'
                            }}
                        >
                            {/* Barra superior */}
                            <div className="h-8 flex items-center justify-between px-4 border-b border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-transparent">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)] animate-pulse" />
                                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.7)] animate-pulse" />
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.7)] animate-pulse" />
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
                                    <div className="h-1 w-1 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_4px_rgba(34,211,238,0.7)]" />
                                    FleetVision Login
                                </div>
                            </div>

                            {/* Contenido */}
                            <div className="p-6">
                                {/* Logo + Título */}
                                <header className="text-center mb-6">
                                    <div className="relative inline-block mb-4">
                                        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg opacity-20 animate-pulse" style={{ filter: 'blur(10px)' }} />

                                        <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-[#0066ff] flex items-center justify-center text-white font-bold shadow-md shadow-cyan-500/30">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <span className="text-2xl font-bold text-white">
                                            Fleet<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-[#0088ff] to-cyan-300">Vision</span>
                                        </span>
                                        <div className="flex items-center justify-center gap-1.5 mt-1.5">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 text-xs font-bold">
                                                🇨🇱 CHILE
                                            </span>
                                            <span className="text-xs text-slate-400">Gestión Inteligente de Flotas</span>
                                        </div>
                                    </div>

                                    <h1 className="text-xl font-bold text-white mt-4 mb-2">
                                        Iniciar Sesión
                                    </h1>
                                    <p className="text-slate-400 text-xs">
                                        Accede a tu panel de control CMMS
                                    </p>
                                </header>

                                {/* Formulario */}
                                <form onSubmit={handleLogin} className="space-y-5">
                                    {/* Campo Email */}
                                    <div className="relative group">
                                        <div className="relative rounded-lg bg-gradient-to-br from-white/5 to-white/2 border border-white/10 p-3 hover:border-cyan-500/30 transition-all duration-300 backdrop-blur-sm">
                                            <label className="block text-xs font-medium text-cyan-400 mb-1.5 flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                Correo Electrónico
                                            </label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="usuario@empresa.cl"
                                                required
                                                className="w-full bg-transparent border-none text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Campo Contraseña */}
                                    <div className="relative group">
                                        <div className="relative rounded-lg bg-gradient-to-br from-white/5 to-white/2 border border-white/10 p-3 hover:border-blue-500/30 transition-all duration-300 backdrop-blur-sm">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <label className="block text-xs font-medium text-cyan-400 flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                    Contraseña
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
                                                >
                                                    {showPassword ? 'Ocultar' : 'Mostrar'}
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    required
                                                    className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="text-slate-500 hover:text-cyan-400 p-0.5"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        {showPassword ? (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                        ) : (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        )}
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Opciones adicionales */}
                                    <div className="flex items-center justify-between px-1.5">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                    className="sr-only"
                                                />
                                                <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center transition-all duration-200 ${rememberMe ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600 group-hover:border-cyan-400'}`}>
                                                    {rememberMe && (
                                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Recordar sesión</span>
                                        </label>

                                        <button
                                            type="button"
                                            onClick={() => setShowForgotPassword(true)}
                                            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors hover:underline"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    </div>

                                    {/* Botón de login */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="group relative w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-[#0066ff] text-white font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Verificando...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                    </svg>
                                                    Acceder al Dashboard
                                                </>
                                            )}
                                        </span>
                                    </button>

                                    {/* Separador */}
                                    <div className="relative flex items-center justify-center my-3">
                                        <div className="flex-grow h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                                        <span className="px-2 text-xs text-slate-500">O bien</span>
                                        <div className="flex-grow h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                                    </div>

                                    {/* Botón de prueba gratuita */}
                                    <button
                                        type="button"
                                        onClick={() => setShowTrialRequest(true)}
                                        className="group relative w-full px-4 py-2.5 rounded-lg border border-sky-500/30 bg-white/5 text-white font-medium hover:bg-white/10 hover:border-sky-500/50 transition-all duration-300 hover:scale-[1.02] text-sm"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Solicitar Prueba Gratuita
                                        </span>
                                    </button>

                                    {/* Demo alternativa */}
                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => router.push('/')}
                                            className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
                                        >
                                            ← Volver al inicio
                                        </button>
                                    </div>
                                </form>

                                {/* Footer */}
                                <footer className="mt-6 pt-5 border-t border-white/10">
                                    <div className="text-center">
                                        <p className="text-xs text-slate-400 mb-3">
                                            ¿No tienes una cuenta?{" "}
                                            <button
                                                onClick={() => setShowTrialRequest(true)}
                                                className="text-cyan-400 hover:text-cyan-300 hover:underline"
                                            >
                                                Solicita una prueba gratuita
                                            </button>
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            © {new Date().getFullYear()} FleetVision Chile • CMMS Avanzado
                                        </p>
                                    </div>
                                </footer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estilos CSS para animaciones */}
            <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: white;
          -webkit-box-shadow: 0 0 0px 1000px transparent inset;
          transition: background-color 5000s ease-in-out 0s;
        }
        
        ::selection {
          background: rgba(34, 211, 238, 0.3);
          color: white;
        }
      `}</style>
        </main>
    );
}