'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

// ==================== INTERFACES ====================
interface Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
}

interface Spark {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
    life: number;
}

interface Glow {
    x: number;
    y: number;
    size: number;
    intensity: number;
    color: string;
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function LoginPage() {
    const router = useRouter();

    // ==================== ESTADOS PRINCIPALES ====================
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

    // Estados para modales
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showTrialRequest, setShowTrialRequest] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);

    // Estados para formularios modales
    const [forgotEmail, setForgotEmail] = useState("");
    const [trialEmail, setTrialEmail] = useState("");
    const [trialName, setTrialName] = useState("");
    const [trialCompany, setTrialCompany] = useState("");
    const [trialPhone, setTrialPhone] = useState("");

    // Estados para el modal de contacto
    const [contactName, setContactName] = useState("");
    const [contactRut, setContactRut] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [contactRegion, setContactRegion] = useState("");
    const [contactCountry, setContactCountry] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactLoading, setContactLoading] = useState(false);
    const [contactSuccess, setContactSuccess] = useState(false);

    // Estados de carga modales
    const [forgotLoading, setForgotLoading] = useState(false);
    const [trialLoading, setTrialLoading] = useState(false);

    // Estados de éxito modales
    const [forgotSuccess, setForgotSuccess] = useState(false);
    const [trialSuccess, setTrialSuccess] = useState(false);

    // ==================== EFECTOS VISUALES ====================
    const [particles, setParticles] = useState<Particle[]>([]);
    const [sparks, setSparks] = useState<Spark[]>([]);
    const [glows, setGlows] = useState<Glow[]>([]);
    const animationFrameRef = useRef<number>(0);

    // Limpiar formulario al cargar
    useEffect(() => {
        setEmail("");
        setPassword("");
        setRememberMe(false);
        setLoginError(null);
        sessionStorage.removeItem('user_data');
        sessionStorage.removeItem('user_id');
        sessionStorage.removeItem('user_email');
        sessionStorage.removeItem('user_role');
        sessionStorage.removeItem('empresa_activa');
        sessionStorage.removeItem('empresa_id');
        sessionStorage.removeItem('empresa_nombre');
        sessionStorage.removeItem('empresas_disponibles');
        localStorage.removeItem('empresa_activa');
        localStorage.removeItem('empresas_disponibles');
    }, []);

    // ==================== GENERACIÓN DE EFECTOS ====================
    const generateEffects = useCallback(() => {
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

        const newParticles: Particle[] = [];
        const newSparks: Spark[] = [];
        const newGlows: Glow[] = [];

        for (let i = 0; i < 40; i++) {
            newParticles.push({
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        for (let i = 0; i < 20; i++) {
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

        for (let i = 0; i < 10; i++) {
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
    }, []);

    // ==================== ANIMACIÓN DE EFECTOS ====================
    useEffect(() => {
        const animate = () => {
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
                intensity: Math.max(0.05, Math.min(0.4, g.intensity + (Math.random() - 0.5) * 0.02)),
                x: (g.x + (Math.random() - 0.5) * 0.1 + 100) % 100,
                y: (g.y + (Math.random() - 0.5) * 0.1 + 100) % 100
            })));

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    useEffect(() => {
        generateEffects();
    }, [generateEffects]);

    // ==================== FUNCIONES DE NOTIFICACIÓN ====================
    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    // ==================== FUNCIONES PRINCIPALES ====================

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError(null);

        if (!email.trim() || !password) {
            showToast("Por favor, completa todos los campos", "warning");
            return;
        }

        setLoading(true);

        try {
            const { error: loginError, data: loginData } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password
            });

            if (loginError) {
                let userMessage = "Error de autenticación. Intenta nuevamente.";
                if (loginError.message.includes("Invalid login credentials")) {
                    userMessage = "❌ Correo o contraseña incorrectos";
                } else if (loginError.message.includes("Email not confirmed")) {
                    userMessage = "📧 Por favor, confirma tu correo electrónico";
                } else if (loginError.message.includes("User not found")) {
                    userMessage = "❌ Correo o contraseña incorrectos";
                } else if (loginError.message.includes("weak password")) {
                    userMessage = "La contraseña es demasiado débil";
                } else {
                    userMessage = `⚠️ ${loginError.message}`;
                }
                throw new Error(userMessage);
            }

            const user = loginData.user;
            if (!user) {
                throw new Error("No se pudo obtener información del usuario");
            }

            console.log("✅ Login exitoso con:", user.email);
            console.log("🆔 User ID:", user.id);

            const { data: relaciones, error: relError } = await supabase
                .from('usuarios_empresas')
                .select('empresa_id')
                .eq('usuario_id', user.id);

            if (relError) {
                console.error("❌ Error usuarios_empresas:", relError);
                await supabase.auth.signOut();
                showToast("Error al cargar tus empresas. Intenta nuevamente.", "error");
                setLoading(false);
                return;
            }

            if (!relaciones || relaciones.length === 0) {
                console.warn("⚠️ Usuario sin empresas asignadas");
                await supabase.auth.signOut();
                showToast("No tienes empresas asignadas. Contacta al administrador.", "warning");
                setLoading(false);
                return;
            }

            const empresaIds = relaciones.map(r => r.empresa_id);
            const { data: empresas, error: empError } = await supabase
                .from('empresas')
                .select('*')
                .in('id', empresaIds);

            if (empError || !empresas) {
                console.error("❌ Error empresas:", empError);
                await supabase.auth.signOut();
                showToast("Error al cargar información de empresas.", "error");
                setLoading(false);
                return;
            }

            const empresasActivas = empresas.filter(e => e.activo === true);

            if (empresasActivas.length === 0) {
                console.warn("⚠️ Usuario sin empresas activas");
                await supabase.auth.signOut();
                showToast("No tienes empresas activas asignadas.", "warning");
                setLoading(false);
                return;
            }

            let usuarioInfo = null;
            try {
                const { data: usuarioData } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle();

                if (usuarioData) {
                    usuarioInfo = usuarioData;
                }
            } catch (dbError) {
                console.log("ℹ️ Información adicional de usuario no crítica:", dbError);
            }

            if (usuarioInfo && usuarioInfo.activo === false) {
                await supabase.auth.signOut();
                showToast("🚫 Tu cuenta está desactivada. Contacta al administrador.", "error");
                setLoading(false);
                return;
            }

            sessionStorage.clear();
            localStorage.removeItem('user_data');
            localStorage.removeItem('user_id');
            localStorage.removeItem('empresa_id');
            localStorage.removeItem('empresa_activa');
            localStorage.removeItem('empresas_disponibles');

            const userData = {
                id: user.id,
                email: user.email || '',
                nombre: usuarioInfo?.nombre || user.email?.split('@')[0] || 'Usuario',
                role: usuarioInfo?.rol || 'ADMIN',
                activo: usuarioInfo?.activo !== false
            };

            sessionStorage.setItem('user_data', JSON.stringify(userData));
            sessionStorage.setItem('user_id', user.id);
            sessionStorage.setItem('user_email', user.email || '');
            sessionStorage.setItem('user_role', userData.role);

            if (empresasActivas.length === 1) {
                const empresa = empresasActivas[0];
                sessionStorage.setItem('empresa_activa', JSON.stringify(empresa));
                sessionStorage.setItem('empresa_id', empresa.id);
                sessionStorage.setItem('empresa_nombre', empresa.nombre);

                console.log("🏢 Empresa auto-seleccionada:", empresa.nombre);
                showToast(`¡Bienvenido ${userData.nombre}!`, "success");

                setTimeout(() => {
                    router.push('/dashboard');
                }, 1000);
            } else {
                sessionStorage.setItem('empresas_disponibles', JSON.stringify(empresasActivas));
                console.log(`🏢 ${empresasActivas.length} empresas disponibles para selección`);
                showToast(`¡Bienvenido ${userData.nombre}!`, "success");

                setTimeout(() => {
                    router.push('/seleccion-empresa');
                }, 1000);
            }

            setEmail("");
            setPassword("");

        } catch (error: any) {
            console.error("❌ Error en login:", error);
            setPassword("");

            const userMessage = error?.message || "Error de autenticación. Intenta nuevamente.";
            setLoginError(userMessage);
            showToast(userMessage, "error");

            setLoading(false);
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 100);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!forgotEmail.trim()) {
            showToast("Por favor, ingresa tu correo electrónico", "warning");
            return;
        }

        setForgotLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw new Error(error.message);

            setForgotSuccess(true);
            showToast("Correo de recuperación enviado", "success");

            setTimeout(() => {
                setShowForgotPassword(false);
                setForgotSuccess(false);
                setForgotEmail("");
            }, 3000);

        } catch (error: any) {
            console.error("Error al recuperar contraseña:", error);
            showToast(error?.message || "Error al enviar correo de recuperación", "error");
        } finally {
            setForgotLoading(false);
        }
    };

    const handleTrialRequest = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!trialEmail.trim() || !trialName.trim() || !trialCompany.trim()) {
            showToast("Por favor, completa todos los campos requeridos", "warning");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trialEmail.trim())) {
            showToast("Ingresa un correo electrónico válido", "warning");
            return;
        }

        setTrialLoading(true);

        try {
            const response = await fetch('/api/trial-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: trialEmail.trim(),
                    name: trialName.trim(),
                    company: trialCompany.trim(),
                    phone: trialPhone.trim(),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error al enviar la solicitud');
            }

            setTrialSuccess(true);
            showToast("¡Solicitud enviada exitosamente!", "success");

            setTimeout(() => {
                setShowTrialRequest(false);
                setTrialSuccess(false);
                setTrialEmail("");
                setTrialName("");
                setTrialCompany("");
                setTrialPhone("");
            }, 3000);

        } catch (error: any) {
            console.error("Error al enviar solicitud:", error);
            showToast(error?.message || "Error al enviar solicitud", "error");
        } finally {
            setTrialLoading(false);
        }
    };

    /**
     * 📞 HANDLE CONTACT FORM - Inserta en Supabase
     */
    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!contactName.trim() || !contactRut.trim() || !contactPhone.trim() || !contactRegion.trim() || !contactCountry.trim() || !contactEmail.trim()) {
            showToast("Por favor, completa todos los campos", "warning");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactEmail.trim())) {
            showToast("Ingresa un correo electrónico válido", "warning");
            return;
        }

        setContactLoading(true);

        try {
            const { error } = await supabase.from('contactos').insert([
                {
                    nombre: contactName.trim(),
                    rut: contactRut.trim(),
                    telefono: contactPhone.trim(),
                    correo: contactEmail.trim(),
                    region: contactRegion.trim(),
                    pais: contactCountry.trim(),
                }
            ]);

            if (error) throw new Error(error.message);

            setContactSuccess(true);
            showToast("¡Mensaje enviado! Te contactaremos pronto.", "success");

            setTimeout(() => {
                setShowContactModal(false);
                setContactSuccess(false);
                resetContactForm();
            }, 3000);

        } catch (error: any) {
            console.error("Error al enviar mensaje:", error);
            showToast(error?.message || "Error al enviar mensaje", "error");
        } finally {
            setContactLoading(false);
        }
    };

    // Función para resetear el formulario de contacto
    const resetContactForm = () => {
        setContactName("");
        setContactRut("");
        setContactPhone("");
        setContactRegion("");
        setContactCountry("");
        setContactEmail("");
    };

    // ==================== COMPONENTES MODALES ====================

    const renderForgotPasswordModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-xl bg-slate-900 border border-cyan-500/30 overflow-hidden animate-fadeIn">
                <div className="relative z-10 p-5">
                    <div className="flex justify-between items-center mb-5">
                        <div>
                            <h3 className="text-lg font-bold text-white">
                                {forgotSuccess ? "✅ Correo Enviado" : "Recuperar Contraseña"}
                            </h3>
                            <p className="text-slate-400 text-xs mt-1">
                                {forgotSuccess ? "Revisa tu correo electrónico" : "Te enviaremos un enlace para restablecer tu contraseña"}
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setShowForgotPassword(false);
                                setForgotSuccess(false);
                                setForgotEmail("");
                            }}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                            aria-label="Cerrar modal"
                        >
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {forgotSuccess ? (
                        <div className="text-center py-4">
                            <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="text-base font-bold text-white mb-2">¡Correo enviado!</h4>
                            <p className="text-slate-300 text-sm mb-3">
                                Hemos enviado un enlace de recuperación a:<br />
                                <span className="text-cyan-400 font-medium">{forgotEmail}</span>
                            </p>
                            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                <p className="text-xs text-cyan-400">
                                    ⚠️ <strong>Importante:</strong> Revisa tu carpeta de spam si no encuentras el correo.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                <div className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-cyan-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="text-xs text-cyan-300">
                                            Ingresa el correo electrónico asociado a tu cuenta de FleetVision.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <div className="relative group">
                                    <div className="relative rounded-lg bg-gradient-to-br from-white/5 to-white/2 border border-white/10 p-3 hover:border-cyan-500/30 transition-all duration-300 backdrop-blur-sm">
                                        <label className="block text-xs font-medium text-cyan-400 mb-1.5 flex items-center gap-1.5">
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
                                            className="w-full bg-transparent border-none text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-base"
                                            aria-required="true"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={forgotLoading}
                                        className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                                    >
                                        {forgotLoading ? (
                                            <span className="flex items-center justify-center gap-1.5">
                                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Enviando...
                                            </span>
                                        ) : 'Enviar Enlace'}
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
    );

    const renderTrialRequestModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-lg rounded-xl bg-slate-900 border border-cyan-500/30 overflow-hidden my-auto animate-fadeIn">
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
                            aria-label="Cerrar modal"
                        >
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {trialSuccess ? (
                        <div className="text-center py-4">
                            <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="text-base font-bold text-white mb-2">¡Solicitud recibida!</h4>
                            <p className="text-slate-300 text-sm mb-4">
                                Te contactaremos en <span className="text-cyan-400 font-medium">menos de 24 horas</span>.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-5 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                <div className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-cyan-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="text-xs text-cyan-300 mb-1.5">
                                            <strong>Prueba gratuita de FleetVision CMMS:</strong> Acceso completo por 14 días.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleTrialRequest} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-3">
                                    <div className="relative group">
                                        <div className="relative rounded-lg bg-gradient-to-br from-white/5 to-white/2 border border-white/10 p-3 hover:border-cyan-500/30 transition-all duration-300 backdrop-blur-sm">
                                            <label className="block text-xs font-medium text-cyan-400 mb-1.5">
                                                Nombre Completo *
                                            </label>
                                            <input
                                                type="text"
                                                value={trialName}
                                                onChange={(e) => setTrialName(e.target.value)}
                                                placeholder="Juan Pérez"
                                                required
                                                className="w-full bg-transparent border-none text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-base"
                                                aria-required="true"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <div className="relative rounded-lg bg-gradient-to-br from-white/5 to-white/2 border border-white/10 p-3 hover:border-cyan-500/30 transition-all duration-300 backdrop-blur-sm">
                                            <label className="block text-xs font-medium text-cyan-400 mb-1.5">
                                                Correo Electrónico *
                                            </label>
                                            <input
                                                type="email"
                                                value={trialEmail}
                                                onChange={(e) => setTrialEmail(e.target.value)}
                                                placeholder="tu@empresa.cl"
                                                required
                                                className="w-full bg-transparent border-none text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-base"
                                                aria-required="true"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <div className="relative rounded-lg bg-gradient-to-br from-white/5 to-white/2 border border-white/10 p-3 hover:border-cyan-500/30 transition-all duration-300 backdrop-blur-sm">
                                            <label className="block text-xs font-medium text-cyan-400 mb-1.5">
                                                Empresa *
                                            </label>
                                            <input
                                                type="text"
                                                value={trialCompany}
                                                onChange={(e) => setTrialCompany(e.target.value)}
                                                placeholder="Nombre de tu empresa"
                                                required
                                                className="w-full bg-transparent border-none text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-base"
                                                aria-required="true"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <div className="relative rounded-lg bg-gradient-to-br from-white/5 to-white/2 border border-white/10 p-3 hover:border-cyan-500/30 transition-all duration-300 backdrop-blur-sm">
                                            <label className="block text-xs font-medium text-cyan-400 mb-1.5">
                                                Teléfono (Opcional)
                                            </label>
                                            <input
                                                type="tel"
                                                value={trialPhone}
                                                onChange={(e) => setTrialPhone(e.target.value)}
                                                placeholder="+56 9 1234 5678"
                                                className="w-full bg-transparent border-none text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-base"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={trialLoading}
                                        className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
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
    );

    // ========================================================
    // ===== MODAL DE CONTACTO SIMPLIFICADO Y FUNCIONAL =====
    // ========================================================
    const renderContactModal = () => {
        const handleClose = () => {
            setShowContactModal(false);
            setContactSuccess(false);
            resetContactForm();
        };

        return (
            <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
                onMouseDown={handleClose}
                style={{ pointerEvents: 'auto' }}
            >
                <div
                    className="relative w-full max-w-lg rounded-xl bg-slate-900 border border-cyan-500/30 shadow-2xl my-auto animate-fadeIn"
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{ pointerEvents: 'auto' }}
                >
                    <div className="relative z-10 p-6">
                        {/* Header con botón cerrar */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    {contactSuccess ? "✅ Mensaje Enviado" : "Contáctanos"}
                                </h3>
                                <p className="text-slate-400 text-xs mt-1">
                                    {contactSuccess ? "Te responderemos a la brevedad" : "Completa el formulario para contactarnos"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                                aria-label="Cerrar modal"
                                style={{ pointerEvents: 'auto' }}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {contactSuccess ? (
                            <div className="text-center py-8">
                                <div className="h-16 w-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="text-xl font-bold text-white mb-2">¡Mensaje enviado!</h4>
                                <p className="text-slate-300 text-sm">
                                    Nos pondremos en contacto contigo en <span className="text-cyan-400 font-medium">menos de 24 horas</span>.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-5 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                    <div className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-xs text-cyan-300">
                                            <strong>Formulario de contacto:</strong> Complete todos los campos para que podamos atender su consulta.
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleContactSubmit} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-3">
                                        {/* Nombre */}
                                        <div className="relative group">
                                            <div className="relative rounded-lg bg-slate-800/60 border border-white/10 p-3 hover:border-cyan-500/30 transition-all duration-300">
                                                <label className="block text-xs font-medium text-cyan-400 mb-1.5">
                                                    Nombre o Razón Social *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={contactName}
                                                    onChange={(e) => setContactName(e.target.value)}
                                                    placeholder="Juan Pérez / Mi Empresa S.A."
                                                    required
                                                    disabled={contactLoading}
                                                    className="w-full bg-transparent border-none text-white placeholder-slate-400 focus:outline-none focus:ring-0 text-base"
                                                    aria-required="true"
                                                    autoComplete="off"
                                                    style={{ pointerEvents: 'auto' }}
                                                />
                                            </div>
                                        </div>

                                        {/* RUT */}
                                        <div className="relative group">
                                            <div className="relative rounded-lg bg-slate-800/60 border border-white/10 p-3 hover:border-cyan-500/30 transition-all duration-300">
                                                <label className="block text-xs font-medium text-cyan-400 mb-1.5">
                                                    RUT *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={contactRut}
                                                    onChange={(e) => setContactRut(e.target.value)}
                                                    placeholder="12.345.678-9"
                                                    required
                                                    disabled={contactLoading}
                                                    className="w-full bg-transparent border-none text-white placeholder-slate-400 focus:outline-none focus:ring-0 text-base"
                                                    aria-required="true"
                                                    autoComplete="off"
                                                    style={{ pointerEvents: 'auto' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Teléfono */}
                                        <div className="relative group">
                                            <div className="relative rounded-lg bg-slate-800/60 border border-white/10 p-3 hover:border-cyan-500/30 transition-all duration-300">
                                                <label className="block text-xs font-medium text-cyan-400 mb-1.5">
                                                    Teléfono *
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={contactPhone}
                                                    onChange={(e) => setContactPhone(e.target.value)}
                                                    placeholder="+56 9 1234 5678"
                                                    required
                                                    disabled={contactLoading}
                                                    className="w-full bg-transparent border-none text-white placeholder-slate-400 focus:outline-none focus:ring-0 text-base"
                                                    aria-required="true"
                                                    autoComplete="off"
                                                    style={{ pointerEvents: 'auto' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Correo */}
                                        <div className="relative group">
                                            <div className="relative rounded-lg bg-slate-800/60 border border-white/10 p-3 hover:border-cyan-500/30 transition-all duration-300">
                                                <label className="block text-xs font-medium text-cyan-400 mb-1.5">
                                                    Correo Electrónico *
                                                </label>
                                                <input
                                                    type="email"
                                                    value={contactEmail}
                                                    onChange={(e) => setContactEmail(e.target.value)}
                                                    placeholder="contacto@empresa.cl"
                                                    required
                                                    disabled={contactLoading}
                                                    className="w-full bg-transparent border-none text-white placeholder-slate-400 focus:outline-none focus:ring-0 text-base"
                                                    aria-required="true"
                                                    autoComplete="off"
                                                    style={{ pointerEvents: 'auto' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Región */}
                                        <div className="relative group">
                                            <div className="relative rounded-lg bg-slate-800/60 border border-white/10 p-3 hover:border-cyan-500/30 transition-all duration-300">
                                                <label className="block text-xs font-medium text-cyan-400 mb-1.5">
                                                    Región *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={contactRegion}
                                                    onChange={(e) => setContactRegion(e.target.value)}
                                                    placeholder="Metropolitana"
                                                    required
                                                    disabled={contactLoading}
                                                    className="w-full bg-transparent border-none text-white placeholder-slate-400 focus:outline-none focus:ring-0 text-base"
                                                    aria-required="true"
                                                    autoComplete="off"
                                                    style={{ pointerEvents: 'auto' }}
                                                />
                                            </div>
                                        </div>

                                        {/* País */}
                                        <div className="relative group">
                                            <div className="relative rounded-lg bg-slate-800/60 border border-white/10 p-3 hover:border-cyan-500/30 transition-all duration-300">
                                                <label className="block text-xs font-medium text-cyan-400 mb-1.5">
                                                    País *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={contactCountry}
                                                    onChange={(e) => setContactCountry(e.target.value)}
                                                    placeholder="Chile"
                                                    required
                                                    disabled={contactLoading}
                                                    className="w-full bg-transparent border-none text-white placeholder-slate-400 focus:outline-none focus:ring-0 text-base"
                                                    aria-required="true"
                                                    autoComplete="off"
                                                    style={{ pointerEvents: 'auto' }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={contactLoading}
                                            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                                            style={{ pointerEvents: 'auto' }}
                                        >
                                            {contactLoading ? (
                                                <span className="flex items-center justify-center gap-1.5">
                                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Enviando...
                                                </span>
                                            ) : 'Enviar Mensaje'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:bg-white/5 hover:text-white transition-colors text-sm"
                                            style={{ pointerEvents: 'auto' }}
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
        );
    };

    // ==================== RENDER PRINCIPAL ====================
    return (
        <main className="relative min-h-screen w-full bg-slate-950 font-sans overflow-hidden">
            {/* Toast de notificaciones */}
            {toast && (
                <div className="fixed top-4 right-4 z-[60] max-w-sm w-full animate-fadeIn">
                    <div className={`rounded-lg p-4 shadow-lg border ${toast.type === 'success' ? 'bg-cyan-900/90 border-cyan-500/50' :
                        toast.type === 'error' ? 'bg-red-900/90 border-red-500/50' :
                            toast.type === 'warning' ? 'bg-amber-900/90 border-amber-500/50' :
                                'bg-cyan-900/90 border-cyan-500/50'
                        } backdrop-blur-sm`}>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                {toast.type === 'success' && <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                {toast.type === 'error' && <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                {toast.type === 'warning' && <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                                {toast.type === 'info' && <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm font-medium text-white`}>{toast.message}</p>
                            </div>
                            <button onClick={() => setToast(null)} className="flex-shrink-0 text-slate-400 hover:text-white transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* BACKGROUND EFFECTS */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] h-[800px] w-[800px] rounded-full bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-transparent opacity-70" style={{ filter: 'blur(150px)' }} />
                <div className="absolute top-[30%] right-[0%] h-[600px] w-[600px] rounded-full bg-gradient-to-b from-cyan-500/25 via-blue-400/15 to-transparent opacity-60" style={{ filter: 'blur(120px)' }} />
                <div className="absolute -bottom-[20%] left-[10%] h-[700px] w-[700px] rounded-full bg-gradient-to-t from-indigo-600/25 via-cyan-500/15 to-transparent opacity-70" style={{ filter: 'blur(140px)' }} />
                <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:80px_80px]" />

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

            {/* RENDER MODALES */}
            {showForgotPassword && renderForgotPasswordModal()}
            {showTrialRequest && renderTrialRequestModal()}
            {showContactModal && renderContactModal()}

            {/* CONTENIDO PRINCIPAL DEL LOGIN */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative h-[400px] w-[400px] rounded-full" style={{
                        background: 'radial-gradient(circle at center, rgba(34, 211, 238, 0.1) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                        animation: 'pulse 3s ease-in-out infinite',
                    }} />
                </div>

                <div className="relative w-full max-w-xs">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-cyan-400/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ filter: 'blur(20px)' }} />

                        <div className="relative rounded-xl border border-white/15 bg-slate-950/80 backdrop-blur-lg shadow-xl overflow-hidden"
                            style={{
                                boxShadow: '0 10px 30px -5px rgba(0, 220, 255, 0.2), 0 0 40px rgba(34, 211, 238, 0.1)',
                                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)'
                            }}
                        >
                            {/* Barra superior */}
                            <div className="h-6 flex items-center justify-between px-3 border-b border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-transparent">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)] animate-pulse" />
                                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.7)] animate-pulse" />
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.7)] animate-pulse" />
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-medium">
                                    <div className="h-1 w-1 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_4px_rgba(34,211,238,0.7)]" />
                                    FleetVision Login
                                </div>
                            </div>

                            <div className="p-4">
                                <header className="text-center mb-4">
                                    <div className="relative inline-block mb-3">
                                        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg opacity-20 animate-pulse" style={{ filter: 'blur(10px)' }} />
                                        <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold shadow-md shadow-cyan-500/30">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="mb-1.5">
                                        <span className="text-xl font-bold text-white">
                                            Fleet<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300">Vision</span>
                                        </span>
                                        <div className="flex items-center justify-center gap-1 mt-1">
                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 text-[10px] font-bold">
                                                🇨🇱 CHILE
                                            </span>
                                            <span className="text-[10px] text-slate-400">Sistema Multiempresa CMMS</span>
                                        </div>
                                    </div>

                                    <h1 className="text-lg font-bold text-white mt-3 mb-1">
                                        Iniciar Sesión
                                    </h1>
                                    <p className="text-slate-400 text-[11px]">
                                        Accede a tu panel de control
                                    </p>
                                </header>

                                {loginError && (
                                    <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-xs text-red-300">{loginError}</p>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleLogin} className="space-y-4">
                                    {/* Email */}
                                    <div className="relative group">
                                        <div className="relative rounded-lg bg-gradient-to-br from-white/5 to-white/2 border border-white/10 p-2.5 hover:border-cyan-500/30 transition-all duration-300 backdrop-blur-sm">
                                            <label className="block text-[10px] font-medium text-cyan-400 mb-1 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                                disabled={loading}
                                                className="w-full bg-transparent border-none text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                aria-required="true"
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>

                                    {/* Contraseña */}
                                    <div className="relative group">
                                        <div className="relative rounded-lg bg-gradient-to-br from-white/5 to-white/2 border border-white/10 p-2.5 hover:border-cyan-500/30 transition-all duration-300 backdrop-blur-sm">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-[10px] font-medium text-cyan-400 flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                    Contraseña
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    disabled={loading}
                                                    className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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
                                                    disabled={loading}
                                                    className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                    aria-required="true"
                                                    autoComplete="off"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    disabled={loading}
                                                    className="text-slate-500 hover:text-cyan-400 p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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

                                    {/* Opciones */}
                                    <div className="flex items-center justify-between px-1">
                                        <label className="flex items-center gap-1.5 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                disabled={loading}
                                                className="sr-only"
                                                id="remember-me"
                                            />
                                            <div className="relative flex items-center justify-center">
                                                <div className={`h-3 w-3 rounded border flex items-center justify-center transition-all duration-200 ${rememberMe ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600 group-hover:border-cyan-400'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    {rememberMe && (
                                                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`text-[10px] text-slate-400 group-hover:text-slate-300 transition-colors cursor-pointer ${loading ? 'opacity-50' : ''}`}>
                                                Recordar sesión
                                            </span>
                                        </label>

                                        <button
                                            type="button"
                                            onClick={() => setShowForgotPassword(true)}
                                            disabled={loading}
                                            className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    </div>

                                    {/* Botón Login */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="group relative w-full px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-600 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed text-sm shadow-md shadow-cyan-500/20 animate-pulse-slow"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {loading ? (
                                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3 3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                    </svg>
                                                    Acceder al Dashboard
                                                </>
                                            )}
                                        </span>
                                        <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400/20 via-blue-300/20 to-cyan-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                                    </button>

                                    <div className="relative flex items-center justify-center my-2">
                                        <div className="flex-grow h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                                        <span className="px-2 text-[10px] text-slate-500">O bien</span>
                                        <div className="flex-grow h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                                    </div>

                                    {/* Botón Contáctanos */}
                                    <button
                                        type="button"
                                        onClick={() => { setContactSuccess(false); setShowContactModal(true); }}
                                        disabled={loading}
                                        className="group relative w-full px-4 py-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-white font-medium hover:bg-cyan-500/20 hover:border-cyan-500/60 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 shadow-md shadow-cyan-500/10"
                                    >
                                        <svg className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        Solicitar Prueba Gratuita
                                    </button>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => router.push('/')}
                                            disabled={loading}
                                            className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            ← Volver al inicio
                                        </button>
                                    </div>
                                </form>

                                <footer className="mt-4 pt-4 border-t border-white/10">
                                    <div className="text-center">
                                        <p className="text-[10px] text-slate-400 mb-2">
                                            SOPORTE TECNICO?{" "}
                                            <button
                                                onClick={() => { setContactSuccess(false); setShowContactModal(true); }}
                                                className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                                            >
                                                Contáctanos
                                            </button>
                                        </p>
                                        <p className="text-[9px] text-slate-500">
                                            © {new Date().getFullYear()} FleetVision Chile • Sistema Multiempresa CMMS
                                        </p>
                                    </div>
                                </footer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(5deg); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes pulse-slow {
                    0%, 100% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.3), 0 0 40px rgba(34, 211, 238, 0.1); }
                    50% { box-shadow: 0 0 30px rgba(34, 211, 238, 0.5), 0 0 60px rgba(34, 211, 238, 0.2); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 2.5s ease-in-out infinite;
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

                ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }

                ::-webkit-scrollbar-track {
                    background: rgba(30, 41, 59, 0.3);
                    border-radius: 4px;
                }

                ::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, rgba(34, 211, 238, 0.4), rgba(56, 189, 248, 0.4));
                    border-radius: 4px;
                }

                ::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, rgba(34, 211, 238, 0.6), rgba(56, 189, 248, 0.6));
                }

                input, select, textarea {
                    font-size: 16px !important;
                }
            `}</style>
        </main>
    );
}