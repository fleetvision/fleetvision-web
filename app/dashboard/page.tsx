'use client';
// =============================================================
// 🟣 SECCIÓN MORADA – Importaciones y definiciones de tipos
// =============================================================
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import type { CSSProperties } from 'react';

// -------------------------------------------------------------
// 🟦 Tipos de datos (interfaces)
// -------------------------------------------------------------
interface DiagramaTorta {
    título: string;
    datos: {
        etiqueta: string;
        valor: number;
        color: string;
    }[];
    total: number;
    descripción?: string;
}

interface Métrica {
    id: string;
    título: string;
    valor: number;
    unidad: string;
    cambio: number;
    tendencia: 'sube' | 'baja' | 'estable';
    color: 'emerald' | 'cyan' | 'amber' | 'green' | 'blue' | 'red';
    salud: number;
    meta: number;
    icono: string;
    animación?: 'pulso' | 'none';
}

interface Tarea {
    id: string;
    título: string;
    descripción?: string;
    prioridad: 'crítica' | 'alta' | 'media' | 'baja';
    estado: string;
    progreso: number;
    fechaLímite: Date;
    asignadoA: string;
    tipo: string;
}

interface Alerta {
    id: string;
    título: string;
    severidad: 'crítica' | 'advertencia' | 'informativa';
    activo: string;
    fecha: Date;
    resuelta: boolean;
    descripción?: string;
    acciónRequerida?: string;
}

interface Activo {
    id: string;
    nombre: string;
    modelo: string;
    estado: 'saludable' | 'advertencia' | 'crítico';
    ubicación: string;
    patente: string;
    tiempoActivo: number;
    próximoMantenimiento: Date;
    kilometraje?: number;
    alertasActivas?: number;
    marca: string;
    tipo: string;
    año: number;
    empresa_id: string;
}

interface OrdenTrabajo {
    id: string;
    número: string;
    descripción: string;
    estado: 'creada' | 'asignada' | 'en_progreso' | 'completada' | 'cancelada';
    prioridad: 'alta' | 'media' | 'baja';
    fechaCreación: Date;
    fechaLímite: Date;
    asignadoA: string;
    tipo: string;
    activo: string;
    costoEstimado: number;
    costoReal: number;
    empresa_id?: string;
}

interface Notificación {
    id: string;
    título: string;
    mensaje: string;
    tipo: 'alerta' | 'éxito' | 'info' | 'recordatorio';
    fecha: Date;
    leída: boolean;
    icono: string;
}

interface Empresa {
    id: string;
    nombre: string;
    rut_text?: string;
    activo?: boolean;
    created_at?: string;
}

interface Usuario {
    id: string;
    email: string;
    nombre: string;
    rol: string;
}

// =============================================================
// 🟢 SECCIÓN VERDE – Componente principal DashboardCompleto
// =============================================================
export default function DashboardCompleto() {
    const router = useRouter();
    const referenciaAnimación = useRef<number | null>(null);

    // -------------------- ESTADOS PRINCIPALES --------------------
    const [cargando, setCargando] = useState(true);
    const [modoOscuro, setModoOscuro] = useState(true);
    const [barraLateralContraída, setBarraLateralContraída] = useState(false);
    const [secciónActiva, setSecciónActiva] = useState('dashboard');

    // -------------------- ESTADOS PARA GESTIÓN DE ACTIVOS --------
    const [mostrarModalAgregarActivo, setMostrarModalAgregarActivo] = useState(false);
    const [nuevoActivo, setNuevoActivo] = useState({
        marca: '',
        modelo: '',
        tipo: '',
        año: new Date().getFullYear(),
        patente: '',
        estado: 'saludable' as 'saludable' | 'advertencia' | 'crítico',
        ubicación: '',
        kilometraje: 0,
        tiempoActivo: 100,
        empresa_id: ''
    });

    // -------------------- ESTADOS DE DATOS ------------------------
    const [empresaActual, setEmpresaActual] = useState<Empresa | null>(null);
    const [datosUsuario, setDatosUsuario] = useState<Usuario | null>(null);

    // -------------------- ESTADOS DE EFECTOS VISUALES ------------
    const [efectosHabilitados, setEfectosHabilitados] = useState(true);
    const [intensidadEfectos, setIntensidadEfectos] = useState(1.0);

    // -------------------- DATOS DE PRUEBA / ESTADO INICIAL --------
    const [métricasVivas, setMétricasVivas] = useState<Métrica[]>([
        { id: '1', título: 'Vehículos Activos', valor: 0, unidad: '', cambio: 0, tendencia: 'estable', color: 'emerald', salud: 0, meta: 15, icono: '🚚' },
        { id: '2', título: 'Disponibilidad', valor: 0, unidad: '%', cambio: 0, tendencia: 'estable', color: 'cyan', salud: 0, meta: 95, icono: '📈' },
        { id: '3', título: 'Alertas Activas', valor: 0, unidad: '', cambio: 0, tendencia: 'estable', color: 'amber', salud: 98, meta: 0, icono: '🚨' },
        { id: '4', título: 'Mantenimientos', valor: 0, unidad: '', cambio: 0, tendencia: 'estable', color: 'blue', salud: 85, meta: 10, icono: '🔧' }
    ]);

    const [activos, setActivos] = useState<Activo[]>([]);
    const [tareasUrgentes, setTareasUrgentes] = useState<Tarea[]>([]);
    const [alertas, setAlertas] = useState<Alerta[]>([]);
    const [órdenesTrabajo, setÓrdenesTrabajo] = useState<OrdenTrabajo[]>([]);
    const [notificaciones, setNotificaciones] = useState<Notificación[]>([
        { id: '1', título: '¡Bienvenido!', mensaje: 'Sistema cargado correctamente', tipo: 'info', fecha: new Date(), leída: false, icono: '👋' }
    ]);

    // =============================================================
    // 🟡 SECCIÓN AMARILLA – Efectos (useEffect)
    // =============================================================

    // --- Efecto de inicialización (carga de usuario y empresa) ---
    useEffect(() => {
        const inicializarDashboard = async () => {
            setCargando(true);
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError || !user) {
                    router.replace('/login');
                    return;
                }
                if (user) {
                    setDatosUsuario({
                        id: user.id,
                        email: user.email || '',
                        nombre: user.user_metadata?.nombre || 'Usuario',
                        rol: user.user_metadata?.rol || 'Administrador'
                    });
                    await cargarEmpresaUsuario();
                }
            } catch (error) {
                console.error('Error inicializando dashboard:', error);
            } finally {
                setTimeout(() => setCargando(false), 800);
            }
        };
        inicializarDashboard();
    }, []);

    // --- Efecto para cargar datos cuando cambia la empresa ---
    useEffect(() => {
        if (empresaActual) {
            cargarDatosEmpresa(empresaActual.id);
        }
    }, [empresaActual]);

    // =============================================================
    // 🔵 SECCIÓN AZUL – Funciones de gestión de empresa
    // =============================================================

    const cargarEmpresaUsuario = async () => {
        try {
            console.log('Cargando empresa para el usuario...');
            const { data, error } = await supabase
                .from('empresas')
                .select('*')
                .eq('activo', true)
                .order('nombre')
                .limit(1);

            if (error) {
                console.error('Error cargando empresa:', error);
                return;
            }

            if (data && data.length > 0) {
                const empresaId = sessionStorage.getItem('empresa_id');
                let empresa = null;
                if (empresaId) {
                    empresa = data.find(e => e.id === empresaId);
                }
                if (!empresa) {
                    empresa = data[0];
                    sessionStorage.setItem('empresa_id', empresa.id);
                    sessionStorage.setItem('empresa_nombre', empresa.nombre);
                }
                setEmpresaActual(empresa);
                console.log('Empresa cargada:', empresa.nombre);
            } else {
                console.warn('No se encontraron empresas activas');
            }
        } catch (error) {
            console.error('Error cargando empresa usuario:', error);
        }
    };

    const cargarDatosEmpresa = async (empresaId: string) => {
        try {
            console.log(`Cargando datos para empresa ID: ${empresaId}`);
            if (!empresaId || empresaId.trim() === '') {
                console.error('ID de empresa vacío o inválido');
                return;
            }

            const { data: activosData, error: activosError } = await supabase
                .from('activos')
                .select('*')
                .eq('empresa_id', empresaId)
                .order('created_at', { ascending: false });

            if (activosError) {
                console.error('Error cargando activos:', activosError);
                setActivos([]);
                return;
            }

            if (activosData) {
                const activosTransformados: Activo[] = activosData.map((activo: any) => ({
                    id: activo.id,
                    nombre: `${activo.marca} ${activo.modelo}`,
                    modelo: activo.modelo,
                    estado: activo.estado || 'saludable',
                    ubicación: activo.ubicacion || 'Sin ubicación',
                    patente: activo.patente || 'SIN PATENTE',
                    tiempoActivo: activo.tiempo_activo || 100,
                    próximoMantenimiento: new Date(activo.proximo_mantenimiento || Date.now() + 30 * 24 * 60 * 60 * 1000),
                    kilometraje: activo.kilometraje,
                    alertasActivas: activo.alertas_activas,
                    marca: activo.marca,
                    tipo: activo.tipo || 'Camión',
                    año: activo.año || new Date().getFullYear(),
                    empresa_id: activo.empresa_id
                }));
                setActivos(activosTransformados);
                actualizarMetricasActivos(activosTransformados);
            }

            try {
                const { data: ordenesData, error: ordenesError } = await supabase
                    .from('ordenes_trabajo')
                    .select('*')
                    .eq('empresa_id', empresaId)
                    .order('created_at', { ascending: false });

                if (ordenesError) {
                    console.log('Error cargando órdenes:', ordenesError);
                    setÓrdenesTrabajo([]);
                } else if (ordenesData) {
                    const ordenesTransformadas: OrdenTrabajo[] = ordenesData.map((orden: any) => ({
                        id: orden.id,
                        número: orden.numero || `OT-${orden.id.substring(0, 8)}`,
                        descripción: orden.descripcion,
                        estado: orden.estado || 'creada',
                        prioridad: orden.prioridad || 'media',
                        fechaCreación: new Date(orden.created_at),
                        fechaLímite: new Date(orden.fecha_limite),
                        asignadoA: orden.asignado_a || 'Sin asignar',
                        tipo: orden.tipo || 'Preventivo',
                        activo: orden.activo,
                        costoEstimado: orden.costo_estimado || 0,
                        costoReal: orden.costo_real || 0,
                        empresa_id: orden.empresa_id
                    }));
                    setÓrdenesTrabajo(ordenesTransformadas);
                }
            } catch (ordenesError) {
                console.log('Excepción al cargar órdenes:', ordenesError);
                setÓrdenesTrabajo([]);
            }
        } catch (error) {
            console.error(`Error general cargando datos para empresa ${empresaId}:`, error);
        }
    };

    // =============================================================
    // 🟠 SECCIÓN NARANJA – Funciones de gestión de activos
    // =============================================================

    const agregarNuevoActivo = async () => {
        if (!nuevoActivo.marca || !nuevoActivo.modelo || !nuevoActivo.patente) {
            alert('Por favor complete los campos obligatorios: Marca, Modelo y Patente');
            return;
        }
        if (!empresaActual) {
            alert('No hay empresa seleccionada');
            return;
        }

        try {
            const activoParaInsertar = {
                marca: nuevoActivo.marca,
                modelo: nuevoActivo.modelo,
                tipo: nuevoActivo.tipo,
                año: nuevoActivo.año,
                patente: nuevoActivo.patente,
                estado: nuevoActivo.estado,
                ubicacion: nuevoActivo.ubicación,
                kilometraje: nuevoActivo.kilometraje,
                tiempo_activo: nuevoActivo.tiempoActivo,
                proximo_mantenimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date().toISOString(),
                user_id: datosUsuario?.id,
                empresa_id: empresaActual.id
            };

            const { data, error } = await supabase
                .from('activos')
                .insert([activoParaInsertar])
                .select();

            if (error) throw error;

            if (data && data[0]) {
                const nuevoActivoLocal: Activo = {
                    id: data[0].id,
                    nombre: `${nuevoActivo.marca} ${nuevoActivo.modelo}`,
                    modelo: nuevoActivo.modelo,
                    estado: nuevoActivo.estado,
                    ubicación: nuevoActivo.ubicación,
                    patente: nuevoActivo.patente,
                    tiempoActivo: nuevoActivo.tiempoActivo,
                    próximoMantenimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    kilometraje: nuevoActivo.kilometraje,
                    marca: nuevoActivo.marca,
                    tipo: nuevoActivo.tipo,
                    año: nuevoActivo.año,
                    empresa_id: empresaActual.id
                };
                setActivos(prev => [nuevoActivoLocal, ...prev]);
                actualizarMetricasActivos([nuevoActivoLocal, ...activos]);
                setNuevoActivo({
                    marca: '',
                    modelo: '',
                    tipo: '',
                    año: new Date().getFullYear(),
                    patente: '',
                    estado: 'saludable',
                    ubicación: '',
                    kilometraje: 0,
                    tiempoActivo: 100,
                    empresa_id: ''
                });
                setMostrarModalAgregarActivo(false);
                setNotificaciones(prev => [{
                    id: Date.now().toString(),
                    título: 'Activo Agregado',
                    mensaje: `Se agregó ${nuevoActivo.marca} ${nuevoActivo.modelo} correctamente`,
                    tipo: 'éxito',
                    fecha: new Date(),
                    leída: false,
                    icono: '✅'
                }, ...prev]);
            }
        } catch (error) {
            console.error('Error agregando activo:', error);
            alert('Error al agregar el activo.');
        }
    };

    const eliminarActivo = async (id: string, nombre: string) => {
        if (!confirm(`¿Está seguro de eliminar el activo "${nombre}"?`)) return;
        try {
            const { error } = await supabase
                .from('activos')
                .delete()
                .eq('id', id)
                .eq('empresa_id', empresaActual?.id);
            if (error) throw error;
            setActivos(prev => prev.filter(activo => activo.id !== id));
            actualizarMetricasActivos(activos.filter(activo => activo.id !== id));
            setNotificaciones(prev => [{
                id: Date.now().toString(),
                título: 'Activo Eliminado',
                mensaje: `Se eliminó ${nombre} correctamente`,
                tipo: 'info',
                fecha: new Date(),
                leída: false,
                icono: '🗑️'
            }, ...prev]);
        } catch (error) {
            console.error('Error eliminando activo:', error);
            alert('Error al eliminar el activo.');
        }
    };

    const actualizarMetricasActivos = (activosActuales: Activo[]) => {
        const totalActivos = activosActuales.length;
        const activosSaludables = activosActuales.filter(a => a.estado === 'saludable').length;
        const porcentajeSalud = totalActivos > 0 ? (activosSaludables / totalActivos) * 100 : 0;
        setMétricasVivas(prev => prev.map(métrica => {
            if (métrica.id === '1') return { ...métrica, valor: totalActivos };
            if (métrica.id === '2') return { ...métrica, valor: porcentajeSalud };
            return métrica;
        }));
    };

    // =============================================================
    // 🟣 SECCIÓN MORADA – Funciones auxiliares
    // =============================================================

    const manejarCerrarSesión = async () => {
        try {
            await supabase.auth.signOut();
            sessionStorage.clear();
            localStorage.clear();
            router.push('/login');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    const alternarCompletarTarea = (tareaId: string) => {
        setTareasUrgentes(prev => prev.map(tarea =>
            tarea.id === tareaId ? { ...tarea, progreso: tarea.progreso === 100 ? 0 : 100 } : tarea
        ));
    };

    const resolverAlerta = (alertaId: string) => {
        setAlertas(prev => prev.map(alerta =>
            alerta.id === alertaId ? { ...alerta, resuelta: true } : alerta
        ));
    };

    const crearNuevaOrden = async () => {
        if (!empresaActual) {
            alert('No hay empresa seleccionada');
            return;
        }
        try {
            const nuevaOrdenData = {
                descripcion: 'Nueva orden de trabajo',
                estado: 'creada',
                prioridad: 'media',
                fecha_limite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                asignado_a: datosUsuario?.nombre || 'Sin asignar',
                tipo: 'Preventivo',
                activo: 'Nuevo Activo',
                costo_estimado: 0,
                costo_real: 0,
                empresa_id: empresaActual.id,
                created_at: new Date().toISOString()
            };
            const { data, error } = await supabase
                .from('ordenes_trabajo')
                .insert([nuevaOrdenData])
                .select();
            if (error) throw error;
            if (data && data[0]) {
                const nuevaOrden: OrdenTrabajo = {
                    id: data[0].id,
                    número: `OT-${data[0].id.substring(0, 8)}`,
                    descripción: 'Nueva orden de trabajo',
                    estado: 'creada',
                    prioridad: 'media',
                    fechaCreación: new Date(),
                    fechaLímite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    asignadoA: datosUsuario?.nombre || 'Sin asignar',
                    tipo: 'Preventivo',
                    activo: 'Nuevo Activo',
                    costoEstimado: 0,
                    costoReal: 0,
                    empresa_id: empresaActual.id
                };
                setÓrdenesTrabajo(prev => [nuevaOrden, ...prev]);
            }
        } catch (error) {
            console.error('Error creando orden:', error);
        }
    };

    const obtenerColorEstado = (estado: string) => {
        switch (estado) {
            case 'completada': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'en_progreso': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'asignada': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'creada': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'cancelada': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const obtenerTextoEstado = (estado: string) => {
        switch (estado) {
            case 'completada': return 'Completada';
            case 'en_progreso': return 'En Progreso';
            case 'asignada': return 'Asignada';
            case 'creada': return 'Creada';
            case 'cancelada': return 'Cancelada';
            default: return estado;
        }
    };

    const alternarModoOscuro = () => setModoOscuro(!modoOscuro);
    const alternarEfectos = () => setEfectosHabilitados(!efectosHabilitados);
    const manejarIntensidadEfectos = (nuevaIntensidad: number) => setIntensidadEfectos(nuevaIntensidad);
    const marcarNotificacionesLeídas = () => setNotificaciones(prev => prev.map(n => ({ ...n, leída: true })));
    const eliminarNotificación = (id: string) => setNotificaciones(prev => prev.filter(n => n.id !== id));

    const calcularEstadísticas = () => {
        const totalVehículos = activos.length;
        const vehículosSaludables = activos.filter(a => a.estado === 'saludable').length;
        const alertasActivas = alertas.filter(a => !a.resuelta).length;
        const tareasPendientes = tareasUrgentes.filter(t => t.progreso < 100).length;
        const órdenesActivas = órdenesTrabajo.filter(o => o.estado === 'en_progreso' || o.estado === 'asignada').length;
        return { totalVehículos, vehículosSaludables, porcentajeSalud: totalVehículos > 0 ? (vehículosSaludables / totalVehículos) * 100 : 0, alertasActivas, tareasPendientes, órdenesActivas };
    };

    // =============================================================
    // 🔴 SECCIÓN ROJA – Componentes de UI
    // =============================================================

    /** Barra lateral de navegación con partículas y borde neón */
    const BarraLateral = () => {
        const secciones = [
            { id: 'dashboard', icono: '🏠', etiqueta: 'Dashboard Principal', descripción: 'Vista general del sistema' },
            { id: 'activos', icono: '🚚', etiqueta: 'Gestión de Activos', descripción: 'Vehículos y equipos' },
            { id: 'ordenes', icono: '📋', etiqueta: 'Órdenes de Trabajo', descripción: 'Crear y gestionar OT' },
            { id: 'mantenimiento', icono: '🔧', etiqueta: 'Plan Mantenimiento', descripción: 'Programación preventiva' },
            { id: 'inventario', icono: '📦', etiqueta: 'Inventario', descripción: 'Repuestos y materiales' },
            { id: 'personal', icono: '👥', etiqueta: 'Personal', descripción: 'Equipo de trabajo' },
            { id: 'reportes', icono: '📊', etiqueta: 'Reportes', descripción: 'Análisis y estadísticas' },
            { id: 'configuracion', icono: '⚙️', etiqueta: 'Configuración', descripción: 'Ajustes del sistema' },
        ];

        // =============================================================
        // 🟣 GENERACIÓN DE PARTÍCULAS – Puedes ajustar:
        // - Cantidad: cambiar el 30 en el bucle for
        // - Tamaños: modificar el array 'tamaños'
        // - Velocidad: ajustar el animationDelay (0-10s)
        // =============================================================
        const generarParticulas = () => {
            const particulas = [];
            const tamaños = ['particula-xs', 'particula-sm', 'particula-md', 'particula-lg', 'particula-xl'];
            for (let i = 0; i < 35; i++) { // Aumentado a 35 partículas para más efecto
                const size = tamaños[Math.floor(Math.random() * tamaños.length)];
                const top = Math.random() * 100;
                const left = Math.random() * 100;
                const delay = Math.random() * 10;
                particulas.push(
                    <div
                        key={i}
                        className={`particula ${size}`}
                        style={{
                            top: `${top}%`,
                            left: `${left}%`,
                            animationDelay: `${delay}s`,
                        }}
                    />
                );
            }
            return particulas;
        };

        return (
            <aside
                className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-[#0a0e2a] to-[#1a1b3a] border-r border-cyan-500/20 z-20 transition-all duration-500 ${barraLateralContraída ? 'w-20' : 'w-64'} shadow-xl sidebar-neon barra-lateral ${efectosHabilitados ? 'efectos-activos' : 'efectos-off'}`}
                style={{ zoom: "var(--zoom-sidebar)" } as CSSProperties}
            >
                {/* ============================================================= */}
                {/* PARTÍCULAS (pelotitas pequeñitas) */}
                {/* ============================================================= */}
                <div className="particulas-container">
                    {generarParticulas()}
                </div>

                <div className="h-full flex flex-col relative z-10">
                    <div className={`p-4 border-b border-cyan-500/10 flex items-center ${barraLateralContraída ? 'justify-center' : 'justify-between'} bg-slate-900/50`}>
                        {!barraLateralContraída && (
                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setSecciónActiva('dashboard')}>
                                <div className="relative">
                                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-[#0066ff] flex items-center justify-center text-white font-bold shadow-md shadow-cyan-500/30">
                                        <span className="text-sm">F</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-lg font-bold text-white">Fleet<span className="text-cyan-400">Vision</span></span>
                                    <p className="text-[10px] text-slate-400">Gestión de Flotas</p>
                                </div>
                            </div>
                        )}
                        {barraLateralContraída && (
                            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-[#0066ff] flex items-center justify-center text-white font-bold shadow-md shadow-cyan-500/30">
                                <span className="text-sm">F</span>
                            </div>
                        )}
                        <button onClick={() => setBarraLateralContraída(!barraLateralContraída)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title={barraLateralContraída ? "Expandir" : "Contraer"}>
                            <svg className={`w-5 h-5 text-cyan-400 transition-transform ${barraLateralContraída ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={barraLateralContraída ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
                            </svg>
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {secciones.map((sección) => (
                            <button
                                key={sección.id}
                                onClick={() => setSecciónActiva(sección.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${secciónActiva === sección.id
                                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-white shadow-lg shadow-cyan-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5 hover:border hover:border-white/10'
                                    }`}
                                title={barraLateralContraída ? sección.etiqueta : undefined}
                            >
                                <span className="text-lg z-10">{sección.icono}</span>
                                {!barraLateralContraída && (
                                    <div className="z-10 text-left">
                                        <span className="font-medium text-sm block">{sección.etiqueta}</span>
                                        <span className="text-xs text-slate-400">{sección.descripción}</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className={`p-4 border-t border-cyan-500/10 bg-slate-900/30 ${barraLateralContraída ? 'text-center' : ''}`}>
                        {!barraLateralContraída ? (
                            <>
                                <div className="mb-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-slate-400">Salud Sistema</span>
                                        <span className="text-xs font-bold text-emerald-400">98%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" style={{ width: '98%' }} />
                                    </div>
                                </div>
                                <div className="text-xs text-slate-400">
                                    <div className="flex items-center justify-between mb-1">
                                        <span>Vehículos Activos</span>
                                        <span className="text-cyan-400">{activos.length}/{activos.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Tiempo Activo</span>
                                        <span className="text-emerald-400">96.1%</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <div className="relative">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 mx-auto animate-pulse" />
                                </div>
                                <div className="text-xs text-cyan-400 font-bold">98%</div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        );
    };

    // =============================================================
    // 🟣 GENERACIÓN DE PARTÍCULAS PARA EL FONDO DEL CONTENIDO
    // =============================================================
    const generarParticulasFondo = () => {
        const particulas = [];
        const tamaños = ['particula-xs', 'particula-sm', 'particula-md', 'particula-lg', 'particula-xl'];
        for (let i = 0; i < 50; i++) {
            const size = tamaños[Math.floor(Math.random() * tamaños.length)];
            const top = Math.random() * 100;
            const left = Math.random() * 100;
            const delay = Math.random() * 10;
            particulas.push(
                <div
                    key={`fondo-${i}`}
                    className={`particula ${size}`}
                    style={{
                        top: `${top}%`,
                        left: `${left}%`,
                        animationDelay: `${delay}s`,
                    }}
                />
            );
        }
        return particulas;
    };

    /** Tarjeta de métrica (con barra de salud y meta) */
    const TarjetaMétrica = ({ métrica }: { métrica: Métrica }) => {
        const obtenerIconoTendencia = () => {
            switch (métrica.tendencia) {
                case 'sube': return '↗';
                case 'baja': return '↘';
                default: return '→';
            }
        };
        const obtenerColorSalud = (salud: number) => {
            if (salud >= 90) return 'text-emerald-400';
            if (salud >= 75) return 'text-amber-400';
            return 'text-red-400';
        };
        const colorClase = métrica.color;
        return (
            <div className={`relative group rounded-2xl border border-${colorClase}-500/20 bg-gradient-to-br from-${colorClase}-500/10 to-transparent p-6 backdrop-blur-sm hover:border-${colorClase}-500/40 transition-all duration-300 hover:scale-[1.02]`}>
                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-slate-300 text-sm mb-1">{métrica.título}</p>
                            <div className="flex items-end gap-2">
                                <p className={`text-3xl font-bold text-${colorClase}-400`}>{métrica.valor}{métrica.unidad}</p>
                                <span className={`text-sm ${métrica.tendencia === 'sube' ? 'text-emerald-400' : métrica.tendencia === 'baja' ? 'text-red-400' : 'text-amber-400'}`}>
                                    {obtenerIconoTendencia()} {Math.abs(métrica.cambio)}{métrica.unidad}
                                </span>
                            </div>
                        </div>
                        <div className={`h-12 w-12 rounded-xl bg-${colorClase}-500/20 flex items-center justify-center text-2xl backdrop-blur-sm`}>
                            {métrica.icono}
                        </div>
                    </div>
                    <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                            <span>Puntaje de Salud</span>
                            <span className={obtenerColorSalud(métrica.salud)}>{métrica.salud}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r from-${colorClase}-500 to-${colorClase}-300 rounded-full transition-all duration-1000`} style={{ width: `${métrica.salud}%` }} />
                        </div>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center justify-between">
                        <span>Meta: {métrica.meta}{métrica.unidad}</span>
                        <span className={`${métrica.valor >= métrica.meta ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {métrica.valor >= métrica.meta ? '✅ En Meta' : '⚠️ Bajo Meta'}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    /** Componente de diagrama de torta (seguro) */
    const DiagramaTortaComponente = ({ diagrama }: { diagrama: DiagramaTorta }) => {
        const radio = 80;
        const centroX = 100;
        const centroY = 100;
        let ánguloInicio = 0;
        const datosVálidos = diagrama?.datos && Array.isArray(diagrama.datos) && diagrama.datos.length > 0;
        const totalVálido = diagrama?.total && diagrama.total > 0;

        if (!datosVálidos || !totalVálido) {
            return (
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 rounded-2xl border border-cyan-500/20 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-4">{diagrama?.título || 'Gráfico'}</h3>
                    <div className="relative h-64 flex flex-col items-center justify-center">
                        <div className="text-4xl mb-2 text-slate-600">📊</div>
                        <p className="text-slate-500 text-center mb-1">No hay datos disponibles</p>
                    </div>
                </div>
            );
        }

        const datosProcesados = diagrama.datos.map(segmento => {
            const porcentaje = segmento.valor / diagrama.total;
            return { ...segmento, porcentaje, ángulo: porcentaje * 360 };
        });

        return (
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 rounded-2xl border border-cyan-500/20 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">{diagrama.título}</h3>
                {diagrama.descripción && <p className="text-sm text-slate-400 mb-4">{diagrama.descripción}</p>}
                <div className="relative h-64">
                    <svg width="100%" height="100%" viewBox="0 0 200 200" className="transform -rotate-90">
                        {datosProcesados.map((segmento, índice) => {
                            const ánguloFin = ánguloInicio + segmento.ángulo;
                            const radioGrande = radio;
                            const radioPequeño = radio - 20;
                            const ánguloInicioRad = (ánguloInicio * Math.PI) / 180;
                            const ánguloFinRad = (ánguloFin * Math.PI) / 180;
                            const calcularPunto = (radioCalc: number, ánguloRad: number) => ({
                                x: centroX + radioCalc * Math.cos(ánguloRad),
                                y: centroY + radioCalc * Math.sin(ánguloRad)
                            });
                            const puntoInicioGrande = calcularPunto(radioGrande, ánguloInicioRad);
                            const puntoFinGrande = calcularPunto(radioGrande, ánguloFinRad);
                            const puntoInicioPequeño = calcularPunto(radioPequeño, ánguloInicioRad);
                            const puntoFinPequeño = calcularPunto(radioPequeño, ánguloFinRad);
                            const granArco = segmento.ángulo > 180 ? 1 : 0;
                            const pathData = `
                                M ${puntoInicioGrande.x} ${puntoInicioGrande.y}
                                A ${radioGrande} ${radioGrande} 0 ${granArco} 1 ${puntoFinGrande.x} ${puntoFinGrande.y}
                                L ${puntoFinPequeño.x} ${puntoFinPequeño.y}
                                A ${radioPequeño} ${radioPequeño} 0 ${granArco} 0 ${puntoInicioPequeño.x} ${puntoInicioPequeño.y}
                                Z
                            `;
                            const segmentoElement = (
                                <g key={índice}>
                                    <path d={pathData} fill={segmento.color} className="transition-opacity duration-300 hover:opacity-80" />
                                </g>
                            );
                            ánguloInicio = ánguloFin;
                            return segmentoElement;
                        })}
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <div className="text-2xl font-bold text-white">{diagrama.total}</div>
                        <div className="text-xs text-slate-400">Total</div>
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                    {datosProcesados.map((segmento, índice) => (
                        <div key={índice} className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: segmento.color }} />
                            <div className="flex-1">
                                <div className="text-xs text-slate-300">{segmento.etiqueta}</div>
                                <div className="text-xs text-slate-500">{segmento.valor} ({(segmento.porcentaje * 100).toFixed(1)}%)</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    /** Tarjeta de tarea individual */
    const TarjetaTarea = ({ tarea }: { tarea: Tarea }) => {
        const obtenerColorPrioridad = (prioridad: string) => {
            switch (prioridad) {
                case 'crítica': return 'bg-red-500/20 text-red-400 border-red-500/30';
                case 'alta': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
                case 'media': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            }
        };
        const díasRestantes = Math.ceil((tarea.fechaLímite.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return (
            <div className="group relative rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/50 to-slate-950/50 p-4 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300">
                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-white mb-1">{tarea.título}</h4>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerColorPrioridad(tarea.prioridad)}`}>
                                    {tarea.prioridad.toUpperCase()}
                                </span>
                                <span className="text-xs text-slate-400">@{tarea.asignadoA}</span>
                                <span className="text-xs text-slate-500">• {tarea.tipo}</span>
                            </div>
                        </div>
                        <button onClick={() => alternarCompletarTarea(tarea.id)} className={`p-2 rounded-lg transition-all ${tarea.progreso === 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'}`}>
                            {tarea.progreso === 100 ? '✅' : '⬜'}
                        </button>
                    </div>
                    <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                            <span>Progreso</span>
                            <div className="flex items-center gap-2">
                                <span className="text-cyan-400">{tarea.progreso}%</span>
                                <span className={`text-xs ${díasRestantes <= 2 ? 'text-red-400' : díasRestantes <= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {díasRestantes > 0 ? `${díasRestantes} días` : 'Vencida'}
                                </span>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000" style={{ width: `${tarea.progreso}%` }} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Vence: {tarea.fechaLímite.toLocaleDateString('es-CL')}</span>
                    </div>
                </div>
            </div>
        );
    };

    /** Tarjeta de alerta */
    const TarjetaAlerta = ({ alerta }: { alerta: Alerta }) => (
        <div className={`relative rounded-xl border ${alerta.severidad === 'crítica' ? 'border-red-500/30 bg-red-500/5' : alerta.severidad === 'advertencia' ? 'border-amber-500/30 bg-amber-500/5' : 'border-blue-500/30 bg-blue-500/5'} p-4 backdrop-blur-sm transition-all duration-300`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`h-2 w-2 rounded-full ${alerta.severidad === 'crítica' ? 'bg-red-500' : alerta.severidad === 'advertencia' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                        <h4 className="text-sm font-medium text-white">{alerta.título}</h4>
                    </div>
                    <p className="text-xs text-slate-400 mb-1">Activo: {alerta.activo}</p>
                    <p className="text-xs text-slate-500 mb-2">{alerta.descripción}</p>
                    {alerta.acciónRequerida && <p className="text-xs text-amber-400 mb-1">📋 {alerta.acciónRequerida}</p>}
                    <p className="text-xs text-slate-500">{alerta.fecha.toLocaleDateString('es-CL')} {alerta.fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {!alerta.resuelta && (
                    <button onClick={() => resolverAlerta(alerta.id)} className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-all">
                        Resolver
                    </button>
                )}
                {alerta.resuelta && <span className="px-2 py-1 rounded text-xs bg-emerald-500/20 text-emerald-400">✅ Resuelta</span>}
            </div>
        </div>
    );

    /** Modal para agregar activo - Versión profesional */
    const ModalAgregarActivo = () => {
        const años = Array.from({ length: 35 }, (_, i) => new Date().getFullYear() - i);

        const marcaValida = nuevoActivo.marca.trim().length > 0;
        const modeloValido = nuevoActivo.modelo.trim().length > 0;
        const patenteValida = nuevoActivo.patente.trim().length > 0;
        const formularioValido = marcaValida && modeloValido && patenteValida && !!empresaActual;

        const normalizarPatente = (valor: string) => {
            return valor.toUpperCase().replace(/[^A-Z0-9-]/g, '');
        };

        const obtenerIconoTipo = (tipo: string) => {
            const tipoNormalizado = tipo?.toLowerCase() || '';

            if (tipoNormalizado.includes('camión') || tipoNormalizado.includes('camion')) return '🚚';
            if (tipoNormalizado.includes('trailer')) return '🚛';
            if (tipoNormalizado.includes('vehículo') || tipoNormalizado.includes('vehiculo')) return '🚙';
            if (tipoNormalizado.includes('maquinaria')) return '🚜';
            if (tipoNormalizado.includes('equipo')) return '⚙️';

            return '🚛';
        };

        const obtenerColorEstadoPreview = (estado: string) => {
            switch (estado) {
                case 'saludable':
                    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
                case 'advertencia':
                    return 'border-amber-500/30 bg-amber-500/10 text-amber-400';
                case 'crítico':
                    return 'border-red-500/30 bg-red-500/10 text-red-400';
                default:
                    return 'border-slate-500/30 bg-slate-500/10 text-slate-400';
            }
        };

        const CampoRequerido = ({ activo }: { activo: boolean }) => (
            <span className={`text-xs font-bold ${activo ? 'text-emerald-400' : 'text-red-400'}`}>
                {activo ? '✓' : '*'}
            </span>
        );

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/40 shadow-2xl shadow-cyan-500/10">
                    {/* Fondo decorativo */}
                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
                    <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

                    <div className="relative z-10 flex max-h-[92vh] flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-cyan-500/10 bg-slate-950/40 px-6 py-5">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-3xl shadow-lg shadow-cyan-500/30">
                                    🚚
                                </div>

                                <div>
                                    <h3 className="text-2xl font-black text-white">
                                        Agregar Nuevo Activo
                                    </h3>
                                    <p className="text-sm text-cyan-400">
                                        Registro de vehículo, equipo o maquinaria para la flota
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setMostrarModalAgregarActivo(false)}
                                className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-400 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                                title="Cerrar"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Contenido */}
                        <div className="grid flex-1 overflow-y-auto lg:grid-cols-[1.35fr_0.65fr]">
                            {/* Formulario */}
                            <div className="p-6">
                                <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="text-2xl">🏢</div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Empresa seleccionada</p>
                                            <p className="text-sm text-cyan-400">
                                                {empresaActual?.nombre || 'No seleccionada'}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                El activo quedará asociado a esta empresa.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    {/* Marca */}
                                    <div>
                                        <label className="mb-2 flex items-center justify-between text-sm text-slate-400">
                                            <span>Marca</span>
                                            <CampoRequerido activo={marcaValida} />
                                        </label>

                                        <input
                                            type="text"
                                            value={nuevoActivo.marca}
                                            onChange={(e) => setNuevoActivo({ ...nuevoActivo, marca: e.target.value })}
                                            className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500"
                                            placeholder="Ej: Volvo, Mercedes, Scania"
                                        />
                                    </div>

                                    {/* Modelo */}
                                    <div>
                                        <label className="mb-2 flex items-center justify-between text-sm text-slate-400">
                                            <span>Modelo</span>
                                            <CampoRequerido activo={modeloValido} />
                                        </label>

                                        <input
                                            type="text"
                                            value={nuevoActivo.modelo}
                                            onChange={(e) => setNuevoActivo({ ...nuevoActivo, modelo: e.target.value })}
                                            className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500"
                                            placeholder="Ej: FH16 750, Actros 2663"
                                        />
                                    </div>

                                    {/* Tipo */}
                                    <div>
                                        <label className="mb-2 block text-sm text-slate-400">
                                            Tipo de activo
                                        </label>

                                        <select
                                            value={nuevoActivo.tipo}
                                            onChange={(e) => setNuevoActivo({ ...nuevoActivo, tipo: e.target.value })}
                                            className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition-colors focus:border-cyan-500"
                                        >
                                            <option value="">Seleccionar tipo</option>
                                            <option value="Camión">Camión</option>
                                            <option value="Trailer">Trailer</option>
                                            <option value="Vehículo Liviano">Vehículo Liviano</option>
                                            <option value="Maquinaria">Maquinaria</option>
                                            <option value="Equipo">Equipo</option>
                                        </select>
                                    </div>

                                    {/* Año */}
                                    <div>
                                        <label className="mb-2 block text-sm text-slate-400">
                                            Año
                                        </label>

                                        <select
                                            value={nuevoActivo.año}
                                            onChange={(e) => setNuevoActivo({ ...nuevoActivo, año: parseInt(e.target.value) })}
                                            className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition-colors focus:border-cyan-500"
                                        >
                                            {años.map((año) => (
                                                <option key={año} value={año}>
                                                    {año}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Patente */}
                                    <div>
                                        <label className="mb-2 flex items-center justify-between text-sm text-slate-400">
                                            <span>Patente / Identificador</span>
                                            <CampoRequerido activo={patenteValida} />
                                        </label>

                                        <input
                                            type="text"
                                            value={nuevoActivo.patente}
                                            onChange={(e) => setNuevoActivo({ ...nuevoActivo, patente: normalizarPatente(e.target.value) })}
                                            className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 font-mono text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500"
                                            placeholder="Ej: AB-1234"
                                        />
                                    </div>

                                    {/* Kilometraje */}
                                    <div>
                                        <label className="mb-2 block text-sm text-slate-400">
                                            Kilometraje / Medidor
                                        </label>

                                        <input
                                            type="number"
                                            value={nuevoActivo.kilometraje}
                                            onChange={(e) => setNuevoActivo({ ...nuevoActivo, kilometraje: parseInt(e.target.value) || 0 })}
                                            className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500"
                                            placeholder="Ej: 125430"
                                            min="0"
                                        />
                                    </div>

                                    {/* Ubicación */}
                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm text-slate-400">
                                            Ubicación
                                        </label>

                                        <input
                                            type="text"
                                            value={nuevoActivo.ubicación}
                                            onChange={(e) => setNuevoActivo({ ...nuevoActivo, ubicación: e.target.value })}
                                            className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500"
                                            placeholder="Ej: Patio norte, taller, faena, base operacional"
                                        />
                                    </div>

                                    {/* Estado */}
                                    <div className="md:col-span-2">
                                        <label className="mb-3 block text-sm text-slate-400">
                                            Estado inicial del activo
                                        </label>

                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                            <button
                                                type="button"
                                                onClick={() => setNuevoActivo({ ...nuevoActivo, estado: 'saludable' })}
                                                className={`rounded-2xl border px-4 py-4 text-left transition-all ${nuevoActivo.estado === 'saludable'
                                                    ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-500/10'
                                                    : 'border-slate-700 bg-slate-950/50 text-slate-400 hover:border-emerald-500/30 hover:text-emerald-300'
                                                    }`}
                                            >
                                                <div className="text-xl">✅</div>
                                                <div className="mt-2 text-sm font-bold">Saludable</div>
                                                <div className="text-xs opacity-70">Operativo sin alertas</div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setNuevoActivo({ ...nuevoActivo, estado: 'advertencia' })}
                                                className={`rounded-2xl border px-4 py-4 text-left transition-all ${nuevoActivo.estado === 'advertencia'
                                                    ? 'border-amber-500/50 bg-amber-500/20 text-amber-300 shadow-lg shadow-amber-500/10'
                                                    : 'border-slate-700 bg-slate-950/50 text-slate-400 hover:border-amber-500/30 hover:text-amber-300'
                                                    }`}
                                            >
                                                <div className="text-xl">⚠️</div>
                                                <div className="mt-2 text-sm font-bold">Advertencia</div>
                                                <div className="text-xs opacity-70">Requiere seguimiento</div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setNuevoActivo({ ...nuevoActivo, estado: 'crítico' })}
                                                className={`rounded-2xl border px-4 py-4 text-left transition-all ${nuevoActivo.estado === 'crítico'
                                                    ? 'border-red-500/50 bg-red-500/20 text-red-300 shadow-lg shadow-red-500/10'
                                                    : 'border-slate-700 bg-slate-950/50 text-slate-400 hover:border-red-500/30 hover:text-red-300'
                                                    }`}
                                            >
                                                <div className="text-xl">🚨</div>
                                                <div className="mt-2 text-sm font-bold">Crítico</div>
                                                <div className="text-xs opacity-70">Atención prioritaria</div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Vista previa */}
                            <div className="border-t border-cyan-500/10 bg-slate-950/40 p-6 lg:border-l lg:border-t-0">
                                <h4 className="mb-4 text-lg font-black text-white">
                                    👁️ Vista previa
                                </h4>

                                <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-5 shadow-xl shadow-black/20">
                                    <div className="mb-4 flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-2xl">
                                                {obtenerIconoTipo(nuevoActivo.tipo)}
                                            </div>

                                            <div>
                                                <p className="text-sm font-black text-white">
                                                    {nuevoActivo.marca || 'Marca'} {nuevoActivo.modelo || 'Modelo'}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {nuevoActivo.tipo || 'Tipo no definido'} · {nuevoActivo.año}
                                                </p>
                                            </div>
                                        </div>

                                        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${obtenerColorEstadoPreview(nuevoActivo.estado)}`}>
                                            {nuevoActivo.estado.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                                            <span className="text-xs text-slate-500">Patente</span>
                                            <span className="font-mono text-xs font-bold text-cyan-400">
                                                {nuevoActivo.patente || 'SIN PATENTE'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                                            <span className="text-xs text-slate-500">Ubicación</span>
                                            <span className="text-xs text-white">
                                                {nuevoActivo.ubicación || 'Sin ubicación'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                                            <span className="text-xs text-slate-500">Medidor</span>
                                            <span className="text-xs font-bold text-white">
                                                {Number(nuevoActivo.kilometraje || 0).toLocaleString('es-CL')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                                    <p className="text-sm font-bold text-amber-300">📌 Campos obligatorios</p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Marca, modelo y patente son necesarios para registrar el activo correctamente.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col gap-3 border-t border-cyan-500/10 bg-slate-950/50 px-6 py-5 md:flex-row md:items-center md:justify-between">
                            <p className="text-xs text-slate-500">
                                Los campos marcados con * son obligatorios. El activo se guardará en {empresaActual?.nombre}.
                            </p>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setMostrarModalAgregarActivo(false)}
                                    className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
                                >
                                    Cancelar
                                </button>

                                <button
                                    onClick={agregarNuevoActivo}
                                    disabled={!formularioValido}
                                    className={`rounded-2xl px-6 py-3 text-sm font-bold text-white transition-all ${formularioValido
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] hover:opacity-90'
                                        : 'cursor-not-allowed bg-slate-700 text-slate-400'
                                        }`}
                                >
                                    {formularioValido ? 'Agregar Activo' : 'Completa los obligatorios'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };


    /** Tarjeta de activo - Versión profesional */
    const TarjetaActivo = ({ activo }: { activo: Activo }) => {
        const obtenerColorEstado = (estado: string) => {
            switch (estado) {
                case 'saludable':
                    return {
                        texto: 'Saludable',
                        icono: '✅',
                        clase: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                        barra: 'from-emerald-500 to-cyan-500',
                    };
                case 'advertencia':
                    return {
                        texto: 'Advertencia',
                        icono: '⚠️',
                        clase: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                        barra: 'from-amber-500 to-orange-500',
                    };
                case 'crítico':
                    return {
                        texto: 'Crítico',
                        icono: '🚨',
                        clase: 'bg-red-500/20 text-red-400 border-red-500/30',
                        barra: 'from-red-500 to-orange-500',
                    };
                default:
                    return {
                        texto: estado || 'Sin estado',
                        icono: '⚙️',
                        clase: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
                        barra: 'from-slate-500 to-slate-400',
                    };
            }
        };

        const obtenerIconoTipo = (tipo: string) => {
            const tipoNormalizado = tipo?.toLowerCase() || '';

            if (tipoNormalizado.includes('camión') || tipoNormalizado.includes('camion')) return '🚚';
            if (tipoNormalizado.includes('trailer')) return '🚛';
            if (tipoNormalizado.includes('vehículo') || tipoNormalizado.includes('vehiculo')) return '🚙';
            if (tipoNormalizado.includes('maquinaria')) return '🚜';
            if (tipoNormalizado.includes('equipo')) return '⚙️';

            return '🚛';
        };

        const obtenerTextoMantenimiento = (dias: number) => {
            if (dias < 0) return `${Math.abs(dias)} días vencido`;
            if (dias === 0) return 'Hoy';
            if (dias === 1) return '1 día';
            return `${dias} días`;
        };

        const obtenerColorMantenimiento = (dias: number) => {
            if (dias < 0) return 'text-red-400';
            if (dias <= 7) return 'text-orange-400';
            if (dias <= 14) return 'text-amber-400';
            return 'text-emerald-400';
        };

        const obtenerBadgeMantenimiento = (dias: number) => {
            if (dias < 0) {
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            }

            if (dias <= 7) {
                return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            }

            if (dias <= 14) {
                return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            }

            return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        };

        const fechaMantenimiento = activo.próximoMantenimiento instanceof Date
            ? activo.próximoMantenimiento
            : new Date(activo.próximoMantenimiento);

        const díasHastaMantenimiento = Math.ceil(
            (fechaMantenimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        const estado = obtenerColorEstado(activo.estado);
        const tiempoActivo = Number(activo.tiempoActivo || 0);
        const kilometraje = Number(activo.kilometraje || 0);
        const tieneAlertas = Number(activo.alertasActivas || 0) > 0;

        return (
            <div className="group relative overflow-hidden rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-5 backdrop-blur-lg shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-cyan-500/10">
                <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-cyan-500/5 blur-3xl transition-all group-hover:bg-cyan-500/10" />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-13 w-13 min-h-13 min-w-13 items-center justify-center rounded-2xl bg-cyan-500/10 text-3xl">
                                {obtenerIconoTipo(activo.tipo)}
                            </div>

                            <div>
                                <h4 className="text-base font-black text-white">
                                    {activo.nombre}
                                </h4>

                                <p className="mt-1 text-xs text-slate-400">
                                    {activo.marca} · {activo.modelo} · {activo.año}
                                </p>

                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span className={`rounded-full border px-2 py-1 text-[11px] font-bold ${estado.clase}`}>
                                        {estado.icono} {estado.texto}
                                    </span>

                                    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[11px] font-bold text-cyan-300">
                                        {activo.tipo || 'Sin tipo'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-2xl font-black text-cyan-400">
                                {tiempoActivo}%
                            </div>
                            <div className="text-[11px] text-slate-500">
                                Tiempo activo
                            </div>
                        </div>
                    </div>

                    {/* Datos principales */}
                    <div className="mb-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-xs text-slate-500">Patente</p>
                            <p className="mt-1 font-mono text-sm font-black text-white">
                                {activo.patente || 'SIN PATENTE'}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-xs text-slate-500">Ubicación</p>
                            <p className="mt-1 text-sm font-bold text-white">
                                {activo.ubicación || 'Sin ubicación'}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-xs text-slate-500">Kilometraje / Medidor</p>
                            <p className="mt-1 text-sm font-black text-cyan-300">
                                {kilometraje.toLocaleString('es-CL')}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-xs text-slate-500">Alertas activas</p>
                            <p className={`mt-1 text-sm font-black ${tieneAlertas ? 'text-red-400' : 'text-emerald-400'}`}>
                                {tieneAlertas ? activo.alertasActivas : 0}
                            </p>
                        </div>
                    </div>

                    {/* Tiempo activo */}
                    <div className="mb-4 rounded-2xl border border-cyan-500/10 bg-cyan-500/5 p-4">
                        <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="text-slate-400">Disponibilidad operacional</span>
                            <span className="font-bold text-cyan-300">{tiempoActivo}%</span>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                            <div
                                className={`h-full rounded-full bg-gradient-to-r ${estado.barra}`}
                                style={{ width: `${Math.min(Math.max(tiempoActivo, 0), 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Mantenimiento */}
                    <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs text-slate-500">Próximo mantenimiento</p>

                                <p className="mt-1 text-sm font-bold text-white">
                                    {fechaMantenimiento.toLocaleDateString('es-CL', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>

                            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${obtenerBadgeMantenimiento(díasHastaMantenimiento)}`}>
                                {díasHastaMantenimiento < 0 ? '🚨' : díasHastaMantenimiento <= 7 ? '⚠️' : '📅'} {obtenerTextoMantenimiento(díasHastaMantenimiento)}
                            </span>
                        </div>

                        <p className={`mt-3 text-xs font-bold ${obtenerColorMantenimiento(díasHastaMantenimiento)}`}>
                            {díasHastaMantenimiento < 0
                                ? 'Mantenimiento vencido. Revisar planificación.'
                                : díasHastaMantenimiento <= 7
                                    ? 'Mantenimiento próximo. Programar atención.'
                                    : díasHastaMantenimiento <= 14
                                        ? 'Mantenimiento dentro de las próximas dos semanas.'
                                        : 'Mantenimiento bajo control.'}
                        </p>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                        <button
                            type="button"
                            className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-300 transition-colors hover:bg-cyan-500/20"
                            title="Función visual. La programación real se puede conectar después."
                        >
                            Programar
                        </button>

                        <button
                            onClick={() => eliminarActivo(activo.id, activo.nombre)}
                            className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/20"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    /** Lista de órdenes de trabajo (tabla) */
    const ListaÓrdenesTrabajo = () => (
        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-lg">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">📋 Órdenes de Trabajo</h3>
                    <p className="text-sm text-cyan-400">Gestión de mantenimiento</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={crearNuevaOrden} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                        <span>+</span>
                        <span>Nueva OT</span>
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium">Número</th>
                            <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium">Descripción</th>
                            <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium">Estado</th>
                            <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium">Prioridad</th>
                            <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium">Asignado a</th>
                            <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium">Vence</th>
                        </tr>
                    </thead>
                    <tbody>
                        {órdenesTrabajo.map((orden) => {
                            const díasRestantes = Math.ceil((orden.fechaLímite.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                            return (
                                <tr key={orden.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-3 px-4"><div className="font-mono text-sm text-cyan-400 font-bold">{orden.número}</div></td>
                                    <td className="py-3 px-4">
                                        <div className="text-sm text-white">{orden.descripción}</div>
                                        <div className="text-xs text-slate-500">{orden.activo}</div>
                                    </td>
                                    <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerColorEstado(orden.estado)}`}>{obtenerTextoEstado(orden.estado)}</span></td>
                                    <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs ${orden.prioridad === 'alta' ? 'bg-red-500/20 text-red-400' : orden.prioridad === 'media' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>{orden.prioridad.toUpperCase()}</span></td>
                                    <td className="py-3 px-4"><div className="text-sm text-white">{orden.asignadoA}</div></td>
                                    <td className="py-3 px-4">
                                        <div className="text-sm text-white">{orden.fechaLímite.toLocaleDateString('es-CL')}</div>
                                        <div className={`text-xs ${díasRestantes <= 2 ? 'text-red-400' : díasRestantes <= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>{díasRestantes > 0 ? `${díasRestantes} días` : 'Vencida'}</div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // =============================================================
    // 🟢 SECCIÓN VERDE (Continuación) – Componentes de secciones (Dashboard, Activos, Órdenes, etc.)
    // =============================================================

    /** Dashboard Principal */
    const DashboardPrincipal = () => {
        const estadísticas = calcularEstadísticas();
        const totalActivos = activos.length;
        const totalÓrdenes = órdenesTrabajo.length;

        const métricasReales: Métrica[] = [
            { id: '1', título: 'Vehículos Activos', valor: totalActivos, unidad: '', cambio: 0, tendencia: 'estable', color: 'emerald', salud: totalActivos > 0 ? 95 : 0, meta: 15, icono: '🚚' },
            { id: '2', título: 'Disponibilidad', valor: totalActivos > 0 ? 98.7 : 0, unidad: '%', cambio: totalActivos > 0 ? 1.2 : 0, tendencia: totalActivos > 0 ? 'sube' : 'estable', color: 'cyan', salud: totalActivos > 0 ? 98 : 0, meta: 95, icono: '📈' },
            { id: '3', título: 'Alertas Activas', valor: alertas.filter(a => !a.resuelta).length, unidad: '', cambio: 0, tendencia: 'estable', color: 'amber', salud: 98, meta: 0, icono: '🚨' },
            { id: '4', título: 'Mantenimientos', valor: órdenesTrabajo.filter(o => o.tipo === 'Preventivo' && o.estado !== 'completada').length, unidad: '', cambio: 0, tendencia: 'estable', color: 'blue', salud: 85, meta: 10, icono: '🔧' }
        ];

        const datosÓrdenesPorEstado = totalÓrdenes > 0 ? [
            { etiqueta: 'Completadas', valor: órdenesTrabajo.filter(o => o.estado === 'completada').length, color: '#10b981' },
            { etiqueta: 'En Progreso', valor: órdenesTrabajo.filter(o => o.estado === 'en_progreso').length, color: '#3b82f6' },
            { etiqueta: 'Asignadas', valor: órdenesTrabajo.filter(o => o.estado === 'asignada').length, color: '#8b5cf6' },
            { etiqueta: 'Creadas', valor: órdenesTrabajo.filter(o => o.estado === 'creada').length, color: '#f59e0b' },
            { etiqueta: 'Canceladas', valor: órdenesTrabajo.filter(o => o.estado === 'cancelada').length, color: '#ef4444' }
        ].filter(item => item.valor > 0) : [];

        const datosEstadoActivos = totalActivos > 0 ? [
            { etiqueta: 'Saludable', valor: activos.filter(a => a.estado === 'saludable').length, color: '#10b981' },
            { etiqueta: 'Advertencia', valor: activos.filter(a => a.estado === 'advertencia').length, color: '#f59e0b' },
            { etiqueta: 'Crítico', valor: activos.filter(a => a.estado === 'crítico').length, color: '#ef4444' }
        ].filter(item => item.valor > 0) : [];

        if (!empresaActual) {
            return (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4 text-slate-600">🏢</div>
                    <h3 className="text-2xl font-bold text-white mb-2">No hay empresa asignada</h3>
                    <p className="text-slate-400 mb-6">Contacta al administrador para asignar una empresa.</p>
                </div>
            );
        }

        return (
            <>
                <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{empresaActual.nombre}</h2>
                            <p className="text-cyan-400">Dashboard Principal</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {métricasReales.map((métrica) => <TarjetaMétrica key={métrica.id} métrica={métrica} />)}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <DiagramaTortaComponente diagrama={{
                        título: 'Órdenes por Estado',
                        datos: datosÓrdenesPorEstado,
                        total: datosÓrdenesPorEstado.reduce((sum, item) => sum + item.valor, 0) || 1,
                        descripción: totalÓrdenes === 0 ? 'No hay órdenes registradas' : `Total: ${totalÓrdenes} órdenes`
                    }} />
                    <DiagramaTortaComponente diagrama={{
                        título: 'Estado de Activos',
                        datos: datosEstadoActivos,
                        total: datosEstadoActivos.reduce((sum, item) => sum + item.valor, 0) || 1,
                        descripción: totalActivos === 0 ? 'No hay activos registrados' : `Total: ${totalActivos} activos`
                    }} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-lg">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">📋 Órdenes de Trabajo</h3>
                                    <p className="text-sm text-cyan-400">{totalÓrdenes === 0 ? 'No hay órdenes registradas' : `Total: ${totalÓrdenes} órdenes`}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={crearNuevaOrden} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                                        <span>+</span><span>Nueva OT</span>
                                    </button>
                                </div>
                            </div>
                            {totalÓrdenes > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium">Número</th>
                                                <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium">Descripción</th>
                                                <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium">Estado</th>
                                                <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium">Prioridad</th>
                                                <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium">Asignado a</th>
                                                <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium">Vence</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {órdenesTrabajo.map((orden) => {
                                                const díasRestantes = Math.ceil((orden.fechaLímite.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                                return (
                                                    <tr key={orden.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                        <td className="py-3 px-4"><div className="font-mono text-sm text-cyan-400 font-bold">{orden.número}</div></td>
                                                        <td className="py-3 px-4">
                                                            <div className="text-sm text-white">{orden.descripción}</div>
                                                            <div className="text-xs text-slate-500">{orden.activo}</div>
                                                        </td>
                                                        <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerColorEstado(orden.estado)}`}>{obtenerTextoEstado(orden.estado)}</span></td>
                                                        <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs ${orden.prioridad === 'alta' ? 'bg-red-500/20 text-red-400' : orden.prioridad === 'media' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>{orden.prioridad.toUpperCase()}</span></td>
                                                        <td className="py-3 px-4"><div className="text-sm text-white">{orden.asignadoA}</div></td>
                                                        <td className="py-3 px-4">
                                                            <div className="text-sm text-white">{orden.fechaLímite.toLocaleDateString('es-CL')}</div>
                                                            <div className={`text-xs ${díasRestantes <= 2 ? 'text-red-400' : díasRestantes <= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>{díasRestantes > 0 ? `${díasRestantes} días` : 'Vencida'}</div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-4xl mb-4 text-slate-600">📋</div>
                                    <h4 className="text-lg font-medium text-slate-400 mb-2">No hay órdenes de trabajo</h4>
                                    <p className="text-slate-500 text-sm mb-4">Crea tu primera orden de trabajo para comenzar</p>
                                    <button onClick={crearNuevaOrden} className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto">
                                        <span>+</span><span>Crear Primera OT</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-lg">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">🏢 Información Empresa</h3>
                                <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center"><div className="h-2 w-2 rounded-full bg-emerald-500" /></div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                    <span className="text-slate-400 text-sm">Nombre</span>
                                    <span className="text-white font-medium">{empresaActual.nombre}</span>
                                </div>
                                {empresaActual.rut_text && (
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                        <span className="text-slate-400 text-sm">RUT</span>
                                        <span className="text-white font-medium">{empresaActual.rut_text}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                    <span className="text-slate-400 text-sm">Vehículos Totales</span>
                                    <span className="text-white font-medium">{estadísticas.totalVehículos}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                    <span className="text-slate-400 text-sm">Vehículos Saludables</span>
                                    <span className="text-emerald-400 font-medium">{estadísticas.vehículosSaludables}</span>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-lg">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">📈 Resumen del Sistema</h3>
                                <div className={`h-6 w-6 rounded-full ${totalActivos > 0 ? 'bg-emerald-500/20' : 'bg-amber-500/20'} flex items-center justify-center`}>
                                    <div className={`h-2 w-2 rounded-full ${totalActivos > 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm text-slate-400 mb-1">Estado General</div>
                                    <div className={`text-lg font-bold ${totalActivos > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {totalActivos > 0 ? '✅ Sistema Operativo' : '⚠️ Sin Datos'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    /** Gestión de Activos */
    const GestiónActivos = () => {
        if (!empresaActual) {
            return (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4 text-slate-600">🏢</div>
                    <h3 className="text-2xl font-bold text-white mb-2">No hay empresa asignada</h3>
                    <p className="text-slate-400 mb-6">Contacta al administrador.</p>
                </div>
            );
        }

        const estadísticasActivos = {
            total: activos.length,
            saludables: activos.filter(a => a.estado === 'saludable').length,
            advertencia: activos.filter(a => a.estado === 'advertencia').length,
            críticos: activos.filter(a => a.estado === 'crítico').length,
        };

        return (
            <div className="space-y-6">
                {mostrarModalAgregarActivo && <ModalAgregarActivo />}
                <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-lg">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">🚚 Gestión de Activos</h3>
                            <p className="text-cyan-400">Vehículos y equipos de {empresaActual.nombre} - {estadísticasActivos.total} activos registrados</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setMostrarModalAgregarActivo(true)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                                <span>+</span><span>Agregar Activo</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                            <div className="text-2xl font-bold text-emerald-400">{estadísticasActivos.saludables}</div>
                            <div className="text-sm text-emerald-300">Saludables</div>
                            <div className="text-xs text-slate-400 mt-1">{estadísticasActivos.total > 0 ? Math.round((estadísticasActivos.saludables / estadísticasActivos.total) * 100) : 0}% del total</div>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                            <div className="text-2xl font-bold text-amber-400">{estadísticasActivos.advertencia}</div>
                            <div className="text-sm text-amber-300">Advertencia</div>
                            <div className="text-xs text-slate-400 mt-1">{estadísticasActivos.total > 0 ? Math.round((estadísticasActivos.advertencia / estadísticasActivos.total) * 100) : 0}% del total</div>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20">
                            <div className="text-2xl font-bold text-red-400">{estadísticasActivos.críticos}</div>
                            <div className="text-sm text-red-300">Críticos</div>
                            <div className="text-xs text-slate-400 mt-1">{estadísticasActivos.total > 0 ? Math.round((estadísticasActivos.críticos / estadísticasActivos.total) * 100) : 0}% del total</div>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20">
                            <div className="text-2xl font-bold text-cyan-400">{estadísticasActivos.total}</div>
                            <div className="text-sm text-cyan-300">Total Activos</div>
                            <div className="text-xs text-slate-400 mt-1">Registrados en el sistema</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activos.length > 0 ? (
                            activos.map((activo) => <TarjetaActivo key={activo.id} activo={activo} />)
                        ) : (
                            <div className="col-span-3 text-center py-12">
                                <div className="text-4xl mb-3 text-slate-600">🚚</div>
                                <p className="text-slate-400 text-lg mb-1">No hay activos registrados</p>
                                <p className="text-slate-600 text-sm mb-6">Agrega tu primer vehículo o equipo para comenzar la gestión</p>
                                <button onClick={() => setMostrarModalAgregarActivo(true)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto">
                                    <span>+</span><span>Agregar Primer Activo</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    /** Órdenes de Trabajo - Vista Kanban / Lista / Taller */
    const ÓrdenesTrabajo = () => {
        type VistaOrdenesTrabajo = 'kanban' | 'lista' | 'taller';

        const [vistaOrdenesTrabajo, setVistaOrdenesTrabajo] = useState<VistaOrdenesTrabajo>('kanban');

        if (!empresaActual) {
            return (
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="text-center max-w-md rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-8 backdrop-blur-lg">
                        <div className="text-5xl mb-4 text-slate-600">🏢</div>
                        <h3 className="text-2xl font-bold text-white mb-2">No hay empresa asignada</h3>
                        <p className="text-slate-400 mb-6">Contacta al administrador.</p>
                    </div>
                </div>
            );
        }

        const obtenerDiasRestantes = (fecha: Date) => {
            const fechaLimite = fecha instanceof Date ? fecha : new Date(fecha);
            const diferencia = fechaLimite.getTime() - Date.now();
            return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
        };

        const obtenerColorPrioridad = (prioridad: string) => {
            switch (prioridad) {
                case 'alta':
                    return 'bg-red-500/20 text-red-400 border-red-500/30';
                case 'media':
                    return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
                case 'baja':
                    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                default:
                    return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            }
        };

        const obtenerIconoTipo = (tipo: string) => {
            const tipoNormalizado = tipo?.toLowerCase() || '';

            if (tipoNormalizado.includes('preventivo')) return '🛡️';
            if (tipoNormalizado.includes('correctivo')) return '🔧';
            if (tipoNormalizado.includes('predictivo')) return '📡';
            if (tipoNormalizado.includes('inspección') || tipoNormalizado.includes('inspeccion')) return '🔍';

            return '🛠️';
        };

        const obtenerColorPlazo = (diasRestantes: number) => {
            if (diasRestantes < 0) return 'text-red-400';
            if (diasRestantes <= 2) return 'text-orange-400';
            if (diasRestantes <= 5) return 'text-amber-400';
            return 'text-emerald-400';
        };

        const obtenerTextoPlazo = (diasRestantes: number) => {
            if (diasRestantes < 0) return '⚠️ Vencida';
            if (diasRestantes === 0) return '⏰ Hoy';
            if (diasRestantes === 1) return '1 día';
            return `${diasRestantes} días`;
        };

        const vistasOrdenes: {
            id: VistaOrdenesTrabajo;
            icono: string;
            titulo: string;
            descripcion: string;
        }[] = [
                {
                    id: 'kanban',
                    icono: '🧩',
                    titulo: 'Kanban',
                    descripcion: 'Vista por estado',
                },
                {
                    id: 'lista',
                    icono: '📋',
                    titulo: 'Lista',
                    descripcion: 'Vista técnica',
                },
                {
                    id: 'taller',
                    icono: '🧰',
                    titulo: 'Taller',
                    descripcion: 'Vista mecánica',
                },
            ];

        const columnasKanban = [
            {
                id: 'creada',
                titulo: 'Pendientes',
                subtitulo: 'Órdenes recién creadas',
                icono: '📝',
                color: 'from-pink-500/25 to-rose-500/10',
                borde: 'border-pink-500/30',
                texto: 'text-pink-300',
                fondoHeader: 'bg-pink-500/20',
            },
            {
                id: 'asignada',
                titulo: 'Asignadas',
                subtitulo: 'Ya tienen responsable',
                icono: '👷',
                color: 'from-orange-500/25 to-amber-500/10',
                borde: 'border-orange-500/30',
                texto: 'text-orange-300',
                fondoHeader: 'bg-orange-500/20',
            },
            {
                id: 'en_progreso',
                titulo: 'En Progreso',
                subtitulo: 'Trabajo en ejecución',
                icono: '🔧',
                color: 'from-cyan-500/25 to-blue-500/10',
                borde: 'border-cyan-500/30',
                texto: 'text-cyan-300',
                fondoHeader: 'bg-cyan-500/20',
            },
            {
                id: 'completada',
                titulo: 'Completadas',
                subtitulo: 'OT finalizadas',
                icono: '✅',
                color: 'from-emerald-500/25 to-green-500/10',
                borde: 'border-emerald-500/30',
                texto: 'text-emerald-300',
                fondoHeader: 'bg-emerald-500/20',
            },
        ];

        const totalOrdenes = órdenesTrabajo.length;

        const ordenesVencidas = órdenesTrabajo.filter((orden) => {
            const dias = obtenerDiasRestantes(orden.fechaLímite);
            return dias < 0 && orden.estado !== 'completada' && orden.estado !== 'cancelada';
        }).length;

        const ordenesPendientes = órdenesTrabajo.filter((orden) => orden.estado === 'creada').length;
        const ordenesAsignadas = órdenesTrabajo.filter((orden) => orden.estado === 'asignada').length;
        const ordenesEnProgreso = órdenesTrabajo.filter((orden) => orden.estado === 'en_progreso').length;
        const ordenesCompletadas = órdenesTrabajo.filter((orden) => orden.estado === 'completada').length;

        const costoEstimadoTotal = órdenesTrabajo.reduce(
            (total, orden) => total + Number(orden.costoEstimado || 0),
            0
        );

        const porcentajeAvance = totalOrdenes > 0
            ? Math.round((ordenesCompletadas / totalOrdenes) * 100)
            : 0;

        const renderSelectorVista = () => (
            <div className="flex items-center gap-2 rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-2 shadow-inner shadow-cyan-500/5">
                {vistasOrdenes.map((vista) => (
                    <button
                        key={vista.id}
                        onClick={() => setVistaOrdenesTrabajo(vista.id)}
                        title={vista.descripcion}
                        className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-300 ${vistaOrdenesTrabajo === vista.id
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 scale-[1.03]'
                            : 'text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <span className="text-xl">{vista.icono}</span>
                        <span className="hidden text-xs font-bold xl:block">
                            {vista.titulo}
                        </span>
                    </button>
                ))}
            </div>
        );

        const renderTarjetaKanban = (orden: OrdenTrabajo) => {
            const diasRestantes = obtenerDiasRestantes(orden.fechaLímite);

            return (
                <div
                    key={orden.id}
                    className="group rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:bg-slate-900/90"
                >
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                            <p className="font-mono text-xs font-bold text-cyan-400">
                                {orden.número}
                            </p>
                            <h5 className="mt-1 text-sm font-bold text-white">
                                {orden.descripción}
                            </h5>
                        </div>

                        <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold ${obtenerColorPrioridad(orden.prioridad)}`}>
                            {orden.prioridad.toUpperCase()}
                        </span>
                    </div>

                    <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                        <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-slate-400">🚛 Activo</span>
                            <span className="text-white font-medium">{orden.activo}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-slate-400">👤 Asignado</span>
                            <span className="text-white">{orden.asignadoA}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">{obtenerIconoTipo(orden.tipo)} Tipo</span>
                            <span className="text-cyan-300">{orden.tipo}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                        <div>
                            <p className="text-[11px] text-slate-500">Vence</p>
                            <p className="text-xs text-white">
                                {orden.fechaLímite.toLocaleDateString('es-CL')}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className={`text-xs font-bold ${obtenerColorPlazo(diasRestantes)}`}>
                                {obtenerTextoPlazo(diasRestantes)}
                            </p>

                            <p className="text-[11px] text-slate-500">
                                ${Number(orden.costoEstimado || 0).toLocaleString('es-CL')}
                            </p>
                        </div>
                    </div>
                </div>
            );
        };

        const renderVistaKanban = () => (
            <>
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
                    {columnasKanban.map((columna) => {
                        const ordenesColumna = órdenesTrabajo.filter(
                            (orden) => orden.estado === columna.id
                        );

                        return (
                            <div
                                key={columna.id}
                                className={`min-h-[620px] rounded-3xl border ${columna.borde} bg-gradient-to-br ${columna.color} p-4 backdrop-blur-xl shadow-xl shadow-black/20`}
                            >
                                <div className={`mb-4 rounded-2xl border ${columna.borde} ${columna.fondoHeader} p-4`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950/40 text-2xl">
                                                {columna.icono}
                                            </div>
                                            <div>
                                                <h4 className={`text-lg font-black ${columna.texto}`}>
                                                    {columna.titulo}
                                                </h4>
                                                <p className="text-xs text-slate-400">
                                                    {columna.subtitulo}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/50 text-sm font-bold text-white">
                                            {ordenesColumna.length}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {ordenesColumna.length > 0 ? (
                                        ordenesColumna.map((orden) => renderTarjetaKanban(orden))
                                    ) : (
                                        <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-6 text-center">
                                            <div>
                                                <div className="mb-3 text-4xl opacity-50">{columna.icono}</div>
                                                <p className="text-sm font-medium text-slate-400">
                                                    Sin órdenes
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    No hay OT en esta etapa.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {órdenesTrabajo.some((orden) => orden.estado === 'cancelada') && (
                    <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-5 backdrop-blur-lg">
                        <h4 className="mb-4 text-lg font-bold text-red-300">🚫 Órdenes Canceladas</h4>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {órdenesTrabajo
                                .filter((orden) => orden.estado === 'cancelada')
                                .map((orden) => (
                                    <div
                                        key={orden.id}
                                        className="rounded-2xl border border-red-500/20 bg-slate-950/60 p-4"
                                    >
                                        <p className="font-mono text-xs font-bold text-red-400">
                                            {orden.número}
                                        </p>
                                        <p className="mt-1 text-sm font-bold text-white">
                                            {orden.descripción}
                                        </p>
                                        <p className="mt-2 text-xs text-slate-400">
                                            🚛 {orden.activo}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </>
        );

        const renderVistaLista = () => (
            <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 backdrop-blur-lg shadow-xl shadow-black/20">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h4 className="text-xl font-black text-white">📋 Vista Técnica de OT</h4>
                        <p className="text-sm text-slate-400">
                            Listado ordenado para control administrativo, mantenimiento y seguimiento operacional.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-300">
                            Total: {totalOrdenes}
                        </span>
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-300">
                            Avance: {porcentajeAvance}%
                        </span>
                    </div>
                </div>

                {órdenesTrabajo.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="px-4 py-3 text-left text-xs text-slate-400">N° OT</th>
                                    <th className="px-4 py-3 text-left text-xs text-slate-400">Descripción</th>
                                    <th className="px-4 py-3 text-left text-xs text-slate-400">Activo</th>
                                    <th className="px-4 py-3 text-left text-xs text-slate-400">Tipo</th>
                                    <th className="px-4 py-3 text-left text-xs text-slate-400">Estado</th>
                                    <th className="px-4 py-3 text-left text-xs text-slate-400">Prioridad</th>
                                    <th className="px-4 py-3 text-left text-xs text-slate-400">Responsable</th>
                                    <th className="px-4 py-3 text-left text-xs text-slate-400">Vence</th>
                                    <th className="px-4 py-3 text-right text-xs text-slate-400">Costo Est.</th>
                                </tr>
                            </thead>

                            <tbody>
                                {órdenesTrabajo.map((orden) => {
                                    const diasRestantes = obtenerDiasRestantes(orden.fechaLímite);

                                    return (
                                        <tr key={orden.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="font-mono text-sm font-bold text-cyan-400">
                                                    {orden.número}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {orden.fechaCreación.toLocaleDateString('es-CL')}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 text-sm font-medium text-white">
                                                {orden.descripción}
                                            </td>

                                            <td className="px-4 py-4 text-sm text-slate-300">
                                                🚛 {orden.activo}
                                            </td>

                                            <td className="px-4 py-4 text-sm text-slate-300">
                                                {obtenerIconoTipo(orden.tipo)} {orden.tipo}
                                            </td>

                                            <td className="px-4 py-4">
                                                <span className={`rounded-full border px-2 py-1 text-xs font-bold ${obtenerColorEstado(orden.estado)}`}>
                                                    {obtenerTextoEstado(orden.estado)}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span className={`rounded-full border px-2 py-1 text-xs font-bold ${obtenerColorPrioridad(orden.prioridad)}`}>
                                                    {orden.prioridad.toUpperCase()}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 text-sm text-slate-300">
                                                👤 {orden.asignadoA}
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="text-sm text-white">
                                                    {orden.fechaLímite.toLocaleDateString('es-CL')}
                                                </div>
                                                <div className={`text-xs font-bold ${obtenerColorPlazo(diasRestantes)}`}>
                                                    {obtenerTextoPlazo(diasRestantes)}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 text-right text-sm font-bold text-white">
                                                ${Number(orden.costoEstimado || 0).toLocaleString('es-CL')}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-700 p-12 text-center">
                        <div className="mb-3 text-5xl opacity-50">📋</div>
                        <p className="text-slate-400">No hay órdenes para mostrar en lista.</p>
                    </div>
                )}
            </div>
        );

        const renderVistaTaller = () => (
            <div className="space-y-6">
                <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-amber-950/20 p-6 backdrop-blur-lg shadow-xl shadow-black/20">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h4 className="text-2xl font-black text-white">🧰 Vista Taller / Maquinaria Pesada</h4>
                            <p className="text-sm text-slate-400">
                                Pensada para mecánicos, supervisores y control de mantenimiento en terreno.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            <div className="rounded-2xl border border-pink-500/20 bg-pink-500/10 p-3 text-center">
                                <p className="text-xl font-black text-pink-300">{ordenesPendientes}</p>
                                <p className="text-[11px] text-slate-400">Pendientes</p>
                            </div>

                            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-3 text-center">
                                <p className="text-xl font-black text-orange-300">{ordenesAsignadas}</p>
                                <p className="text-[11px] text-slate-400">Asignadas</p>
                            </div>

                            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-center">
                                <p className="text-xl font-black text-cyan-300">{ordenesEnProgreso}</p>
                                <p className="text-[11px] text-slate-400">En progreso</p>
                            </div>

                            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
                                <p className="text-xl font-black text-emerald-300">{ordenesCompletadas}</p>
                                <p className="text-[11px] text-slate-400">Completadas</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-slate-400">Avance operacional</span>
                            <span className="font-bold text-emerald-400">{porcentajeAvance}%</span>
                        </div>

                        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700"
                                style={{ width: `${porcentajeAvance}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {órdenesTrabajo.length > 0 ? (
                        órdenesTrabajo.map((orden) => {
                            const diasRestantes = obtenerDiasRestantes(orden.fechaLímite);

                            return (
                                <div
                                    key={orden.id}
                                    className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-cyan-950/20 p-5 shadow-xl shadow-black/20 transition-all hover:-translate-y-1 hover:border-cyan-500/40"
                                >
                                    <div className="mb-4 flex items-start justify-between">
                                        <div>
                                            <p className="font-mono text-xs font-bold text-cyan-400">
                                                {orden.número}
                                            </p>
                                            <h4 className="mt-1 text-lg font-black text-white">
                                                {orden.descripción}
                                            </h4>
                                        </div>

                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-2xl">
                                            🧰
                                        </div>
                                    </div>

                                    <div className="mb-4 grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                                            <p className="text-xs text-slate-500">Activo</p>
                                            <p className="text-sm font-bold text-white">🚛 {orden.activo}</p>
                                        </div>

                                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                                            <p className="text-xs text-slate-500">Tipo</p>
                                            <p className="text-sm font-bold text-cyan-300">
                                                {obtenerIconoTipo(orden.tipo)} {orden.tipo}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                                            <p className="text-xs text-slate-500">Responsable</p>
                                            <p className="text-sm font-bold text-white">👷 {orden.asignadoA}</p>
                                        </div>

                                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                                            <p className="text-xs text-slate-500">Costo estimado</p>
                                            <p className="text-sm font-bold text-emerald-400">
                                                💰 ${Number(orden.costoEstimado || 0).toLocaleString('es-CL')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mb-4 flex flex-wrap gap-2">
                                        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${obtenerColorEstado(orden.estado)}`}>
                                            {obtenerTextoEstado(orden.estado)}
                                        </span>

                                        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${obtenerColorPrioridad(orden.prioridad)}`}>
                                            Prioridad {orden.prioridad.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="border-t border-white/10 pt-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-slate-500">Fecha límite</p>
                                                <p className="text-sm font-bold text-white">
                                                    {orden.fechaLímite.toLocaleDateString('es-CL')}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-xs text-slate-500">Estado plazo</p>
                                                <p className={`text-sm font-black ${obtenerColorPlazo(diasRestantes)}`}>
                                                    {obtenerTextoPlazo(diasRestantes)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full rounded-3xl border border-dashed border-slate-700 bg-slate-950/40 p-14 text-center">
                            <div className="mb-4 text-6xl opacity-50">🧰</div>
                            <h4 className="text-xl font-black text-white mb-2">Sin órdenes para taller</h4>
                            <p className="text-sm text-slate-400">
                                Cuando crees una OT, aparecerá aquí en formato operativo.
                            </p>

                            <button
                                onClick={crearNuevaOrden}
                                className="mx-auto mt-6 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.03] hover:opacity-90"
                            >
                                <span className="text-xl">➕</span>
                                <span>Crear OT</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );

        return (
            <div className="space-y-6">
                {/* ENCABEZADO */}
                <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-blue-950/50 p-6 backdrop-blur-lg shadow-xl shadow-cyan-500/10">
                    <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
                    <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-3xl shadow-lg shadow-cyan-500/30">
                                    {vistaOrdenesTrabajo === 'kanban' && '🧩'}
                                    {vistaOrdenesTrabajo === 'lista' && '📋'}
                                    {vistaOrdenesTrabajo === 'taller' && '🧰'}
                                </div>

                                <div>
                                    <h3 className="text-3xl font-black text-white tracking-tight">
                                        {vistaOrdenesTrabajo === 'kanban' && 'Kanban de Órdenes de Trabajo'}
                                        {vistaOrdenesTrabajo === 'lista' && 'Lista Técnica de Órdenes'}
                                        {vistaOrdenesTrabajo === 'taller' && 'Taller de Mantenimiento'}
                                    </h3>

                                    <p className="text-sm text-cyan-400">
                                        Gestión visual de mantenimiento · {empresaActual.nombre}
                                    </p>
                                </div>
                            </div>

                            <p className="max-w-3xl text-sm text-slate-400">
                                Organiza tus OT por estado, responsable, activo y prioridad. Diseñado para
                                operación de flotas, mantenimiento preventivo/correctivo y control técnico.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {renderSelectorVista()}

                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                <p className="text-xs text-slate-400">Total OT</p>
                                <p className="text-2xl font-bold text-white">{totalOrdenes}</p>
                            </div>

                            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                                <p className="text-xs text-red-300">Vencidas</p>
                                <p className="text-2xl font-bold text-red-400">{ordenesVencidas}</p>
                            </div>

                            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                                <p className="text-xs text-emerald-300">Costo Est.</p>
                                <p className="text-lg font-bold text-emerald-400">
                                    ${costoEstimadoTotal.toLocaleString('es-CL')}
                                </p>
                            </div>

                            <button
                                onClick={crearNuevaOrden}
                                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.03] hover:opacity-90"
                            >
                                <span className="text-xl">➕</span>
                                <span>Nueva OT</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* CONTENIDO SEGÚN VISTA */}
                {vistaOrdenesTrabajo === 'kanban' && renderVistaKanban()}
                {vistaOrdenesTrabajo === 'lista' && renderVistaLista()}
                {vistaOrdenesTrabajo === 'taller' && renderVistaTaller()}
            </div>
        );
    };

    /** Plan de Mantenimiento - Vista Profesional *///////////////////////////////////////////////////////
    const PlanMantenimiento = () => {
        if (!empresaActual) {
            return (
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="text-center max-w-md rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-8 backdrop-blur-lg">
                        <div className="text-5xl mb-4 text-slate-600">🏢</div>
                        <h3 className="text-2xl font-bold text-white mb-2">No hay empresa asignada</h3>
                        <p className="text-slate-400 mb-6">
                            Para generar un plan de mantenimiento, primero debes tener una empresa activa.
                        </p>
                    </div>
                </div>
            );
        }

        const normalizarFecha = (fecha: Date) => {
            return fecha instanceof Date ? fecha : new Date(fecha);
        };

        const obtenerDiasHastaMantenimiento = (fecha: Date) => {
            const fechaMantenimiento = normalizarFecha(fecha);
            const diferencia = fechaMantenimiento.getTime() - Date.now();
            return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
        };

        const formatearFechaCorta = (fecha: Date) => {
            return normalizarFecha(fecha).toLocaleDateString('es-CL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        };

        const formatearFechaLarga = (fecha: Date) => {
            return normalizarFecha(fecha).toLocaleDateString('es-CL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        };

        const obtenerEstadoPlan = (dias: number) => {
            if (dias < 0) {
                return {
                    texto: 'Vencido',
                    detalle: 'Fuera de plazo',
                    icono: '🚨',
                    clase: 'bg-red-500/20 text-red-400 border-red-500/30',
                    barra: 'from-red-500 to-orange-500',
                    prioridad: 1,
                };
            }

            if (dias <= 7) {
                return {
                    texto: 'Crítico',
                    detalle: 'Atender esta semana',
                    icono: '⚠️',
                    clase: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
                    barra: 'from-orange-500 to-amber-500',
                    prioridad: 2,
                };
            }

            if (dias <= 14) {
                return {
                    texto: 'Próximo',
                    detalle: 'Programar pronto',
                    icono: '⏰',
                    clase: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                    barra: 'from-amber-500 to-yellow-500',
                    prioridad: 3,
                };
            }

            if (dias <= 30) {
                return {
                    texto: 'Programado',
                    detalle: 'Dentro del mes',
                    icono: '📅',
                    clase: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
                    barra: 'from-cyan-500 to-blue-500',
                    prioridad: 4,
                };
            }

            return {
                texto: 'Controlado',
                detalle: 'Sin urgencia',
                icono: '✅',
                clase: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                barra: 'from-emerald-500 to-green-500',
                prioridad: 5,
            };
        };

        const obtenerIntervaloPorTipo = (tipo: string) => {
            const tipoNormalizado = tipo?.toLowerCase() || '';

            if (tipoNormalizado.includes('maquinaria')) return 250;
            if (tipoNormalizado.includes('camión')) return 10000;
            if (tipoNormalizado.includes('camion')) return 10000;
            if (tipoNormalizado.includes('transporte')) return 10000;
            if (tipoNormalizado.includes('trailer')) return 10000;
            if (tipoNormalizado.includes('vehículo liviano')) return 10000;
            if (tipoNormalizado.includes('vehiculo liviano')) return 10000;
            if (tipoNormalizado.includes('agrícola')) return 250;
            if (tipoNormalizado.includes('agricola')) return 250;

            return 500;
        };

        const obtenerUnidadPorTipo = (tipo: string) => {
            const tipoNormalizado = tipo?.toLowerCase() || '';

            if (tipoNormalizado.includes('camión')) return 'km';
            if (tipoNormalizado.includes('camion')) return 'km';
            if (tipoNormalizado.includes('transporte')) return 'km';
            if (tipoNormalizado.includes('trailer')) return 'km';
            if (tipoNormalizado.includes('vehículo liviano')) return 'km';
            if (tipoNormalizado.includes('vehiculo liviano')) return 'km';

            return 'h';
        };

        const obtenerIconoActivo = (tipo: string) => {
            const tipoNormalizado = tipo?.toLowerCase() || '';

            if (tipoNormalizado.includes('camión')) return '🚚';
            if (tipoNormalizado.includes('camion')) return '🚚';
            if (tipoNormalizado.includes('transporte')) return '🚛';
            if (tipoNormalizado.includes('trailer')) return '🚛';
            if (tipoNormalizado.includes('vehículo liviano')) return '🚙';
            if (tipoNormalizado.includes('vehiculo liviano')) return '🚙';
            if (tipoNormalizado.includes('maquinaria')) return '🚜';
            if (tipoNormalizado.includes('agrícola')) return '🌾';
            if (tipoNormalizado.includes('agricola')) return '🌾';

            return '⚙️';
        };

        const obtenerCostoReferencial = (activo: Activo) => {
            const tipo = activo.tipo?.toLowerCase() || '';

            if (tipo.includes('maquinaria')) return 850000;
            if (tipo.includes('camión')) return 650000;
            if (tipo.includes('camion')) return 650000;
            if (tipo.includes('transporte')) return 650000;
            if (tipo.includes('trailer')) return 380000;
            if (tipo.includes('vehículo liviano')) return 180000;
            if (tipo.includes('vehiculo liviano')) return 180000;
            if (tipo.includes('agrícola')) return 420000;
            if (tipo.includes('agricola')) return 420000;

            return 300000;
        };

        const obtenerProximoMedidor = (activo: Activo) => {
            const intervalo = obtenerIntervaloPorTipo(activo.tipo);
            const unidad = obtenerUnidadPorTipo(activo.tipo);
            const medidorActual = Number(activo.kilometraje || 0);
            const proximo = medidorActual <= 0
                ? intervalo
                : Math.ceil((medidorActual + 1) / intervalo) * intervalo;

            return {
                intervalo,
                unidad,
                medidorActual,
                proximo,
                restante: Math.max(proximo - medidorActual, 0),
            };
        };

        const obtenerTipoMantenimiento = (dias: number, activo: Activo) => {
            if (activo.estado === 'crítico') {
                return {
                    tipo: 'Correctivo Prioritario',
                    icono: '🚨',
                    clase: 'text-red-400',
                };
            }

            if (dias <= 7) {
                return {
                    tipo: 'Preventivo Urgente',
                    icono: '🔧',
                    clase: 'text-orange-400',
                };
            }

            if (dias <= 30) {
                return {
                    tipo: 'Preventivo Programado',
                    icono: '🛡️',
                    clase: 'text-cyan-400',
                };
            }

            return {
                tipo: 'Seguimiento Operacional',
                icono: '📡',
                clase: 'text-emerald-400',
            };
        };

        const activosOrdenados = [...activos].sort((a, b) => {
            const diasA = obtenerDiasHastaMantenimiento(a.próximoMantenimiento);
            const diasB = obtenerDiasHastaMantenimiento(b.próximoMantenimiento);
            return diasA - diasB;
        });

        const totalActivos = activos.length;

        const activosVencidos = activos.filter((activo) => {
            return obtenerDiasHastaMantenimiento(activo.próximoMantenimiento) < 0;
        }).length;

        const activosCriticos7Dias = activos.filter((activo) => {
            const dias = obtenerDiasHastaMantenimiento(activo.próximoMantenimiento);
            return dias >= 0 && dias <= 7;
        }).length;

        const activosProximos14Dias = activos.filter((activo) => {
            const dias = obtenerDiasHastaMantenimiento(activo.próximoMantenimiento);
            return dias > 7 && dias <= 14;
        }).length;

        const activosProgramados30Dias = activos.filter((activo) => {
            const dias = obtenerDiasHastaMantenimiento(activo.próximoMantenimiento);
            return dias > 14 && dias <= 30;
        }).length;

        const activosControlados = activos.filter((activo) => {
            const dias = obtenerDiasHastaMantenimiento(activo.próximoMantenimiento);
            return dias > 30;
        }).length;

        const activosEnRiesgo = activos.filter((activo) => {
            const dias = obtenerDiasHastaMantenimiento(activo.próximoMantenimiento);
            return dias <= 14 || activo.estado === 'crítico';
        });

        const mantenimientos30Dias = activos.filter((activo) => {
            const dias = obtenerDiasHastaMantenimiento(activo.próximoMantenimiento);
            return dias <= 30;
        });

        const disponibilidadPromedio = totalActivos > 0
            ? Math.round(activos.reduce((total, activo) => total + Number(activo.tiempoActivo || 0), 0) / totalActivos)
            : 0;

        const cumplimientoProgramacion = totalActivos > 0
            ? Math.round(((totalActivos - activosVencidos) / totalActivos) * 100)
            : 0;

        const mantenimientosATiempo = totalActivos > 0
            ? Math.round(((totalActivos - activosVencidos - activosCriticos7Dias) / totalActivos) * 100)
            : 0;

        const costoEstimado30Dias = mantenimientos30Dias.reduce((total, activo) => {
            return total + obtenerCostoReferencial(activo);
        }, 0);

        const resumenPorTipo = activos.reduce((acumulador, activo) => {
            const tipo = activo.tipo || 'Sin tipo';

            if (!acumulador[tipo]) {
                acumulador[tipo] = {
                    total: 0,
                    vencidos: 0,
                    proximos: 0,
                    controlados: 0,
                    icono: obtenerIconoActivo(tipo),
                };
            }

            const dias = obtenerDiasHastaMantenimiento(activo.próximoMantenimiento);

            acumulador[tipo].total += 1;

            if (dias < 0) {
                acumulador[tipo].vencidos += 1;
            } else if (dias <= 14) {
                acumulador[tipo].proximos += 1;
            } else {
                acumulador[tipo].controlados += 1;
            }

            return acumulador;
        }, {} as Record<string, {
            total: number;
            vencidos: number;
            proximos: number;
            controlados: number;
            icono: string;
        }>);

        const manejarGenerarPlan = () => {
            setNotificaciones(prev => [{
                id: Date.now().toString(),
                título: 'Plan de mantenimiento generado',
                mensaje: `Se generó una propuesta preventiva para ${empresaActual.nombre}`,
                tipo: 'éxito',
                fecha: new Date(),
                leída: false,
                icono: '🔧',
            }, ...prev]);

            alert('Plan de mantenimiento generado como propuesta visual. El siguiente paso será guardarlo en Supabase.');
        };

        const TarjetaResumen = ({
            titulo,
            valor,
            subtitulo,
            icono,
            clase,
            borde,
        }: {
            titulo: string;
            valor: string | number;
            subtitulo: string;
            icono: string;
            clase: string;
            borde: string;
        }) => (
            <div className={`rounded-2xl border ${borde} bg-slate-900/70 p-5 backdrop-blur-lg shadow-xl shadow-black/10`}>
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-sm text-slate-400">{titulo}</p>
                        <p className={`mt-1 text-3xl font-black ${clase}`}>{valor}</p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-2xl">
                        {icono}
                    </div>
                </div>

                <p className="text-xs text-slate-500">{subtitulo}</p>
            </div>
        );

        const TarjetaActivoMantenimiento = ({ activo }: { activo: Activo }) => {
            const dias = obtenerDiasHastaMantenimiento(activo.próximoMantenimiento);
            const estadoPlan = obtenerEstadoPlan(dias);
            const medidor = obtenerProximoMedidor(activo);
            const mantenimiento = obtenerTipoMantenimiento(dias, activo);
            const costo = obtenerCostoReferencial(activo);

            return (
                <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-5 backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-2xl">
                                {obtenerIconoActivo(activo.tipo)}
                            </div>

                            <div>
                                <h4 className="text-base font-black text-white">
                                    {activo.nombre}
                                </h4>

                                <p className="text-xs text-slate-400">
                                    {activo.marca} · {activo.modelo} · {activo.año}
                                </p>

                                <p className="mt-1 text-xs text-cyan-400">
                                    Patente: {activo.patente}
                                </p>
                            </div>
                        </div>

                        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${estadoPlan.clase}`}>
                            {estadoPlan.icono} {estadoPlan.texto}
                        </span>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-xs text-slate-500">Fecha programada</p>
                            <p className="text-sm font-bold text-white">
                                {formatearFechaCorta(activo.próximoMantenimiento)}
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-xs text-slate-500">Plazo</p>
                            <p className={`text-sm font-bold ${estadoPlan.clase.split(' ')[1]}`}>
                                {dias < 0 ? `${Math.abs(dias)} días vencido` : `${dias} días`}
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-xs text-slate-500">Medidor actual</p>
                            <p className="text-sm font-bold text-white">
                                {medidor.medidorActual.toLocaleString('es-CL')} {medidor.unidad}
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-xs text-slate-500">Próximo intervalo</p>
                            <p className="text-sm font-bold text-cyan-300">
                                {medidor.proximo.toLocaleString('es-CL')} {medidor.unidad}
                            </p>
                        </div>
                    </div>

                    <div className="mb-4 rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs text-slate-500">Tipo sugerido</p>
                                <p className={`text-sm font-bold ${mantenimiento.clase}`}>
                                    {mantenimiento.icono} {mantenimiento.tipo}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-xs text-slate-500">Costo ref.</p>
                                <p className="text-sm font-black text-emerald-400">
                                    ${costo.toLocaleString('es-CL')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                        <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-slate-400">Estado de planificación</span>
                            <span className="text-slate-300">{estadoPlan.detalle}</span>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                            <div
                                className={`h-full rounded-full bg-gradient-to-r ${estadoPlan.barra}`}
                                style={{
                                    width: dias < 0 ? '100%' : dias <= 7 ? '85%' : dias <= 14 ? '65%' : dias <= 30 ? '45%' : '20%',
                                }}
                            />
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <div className="space-y-6">
                {/* ENCABEZADO PRINCIPAL */}
                <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-emerald-950/40 p-6 backdrop-blur-lg shadow-xl shadow-cyan-500/10">
                    <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl" />
                    <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <div className="flex items-center gap-4 mb-3">
                                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-4xl shadow-lg shadow-emerald-500/30">
                                    🔧
                                </div>

                                <div>
                                    <h3 className="text-3xl font-black text-white tracking-tight">
                                        Plan Maestro de Mantenimiento
                                    </h3>

                                    <p className="text-sm text-cyan-400">
                                        Programación preventiva, control de vencimientos y priorización técnica · {empresaActual.nombre}
                                    </p>
                                </div>
                            </div>

                            <p className="max-w-4xl text-sm text-slate-400 leading-relaxed">
                                Esta vista permite controlar el calendario de mantenimiento de la flota,
                                detectar equipos vencidos, priorizar activos críticos, estimar costos y
                                proyectar trabajos preventivos según fecha, medidor, kilometraje u horas de operación.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                <p className="text-xs text-slate-400">Activos</p>
                                <p className="text-2xl font-black text-white">{totalActivos}</p>
                            </div>

                            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                                <p className="text-xs text-red-300">Vencidos</p>
                                <p className="text-2xl font-black text-red-400">{activosVencidos}</p>
                            </div>

                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                                <p className="text-xs text-amber-300">Próximos</p>
                                <p className="text-2xl font-black text-amber-400">
                                    {activosCriticos7Dias + activosProximos14Dias}
                                </p>
                            </div>

                            <button
                                onClick={manejarGenerarPlan}
                                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.03] hover:opacity-90"
                            >
                                <span className="text-xl">⚙️</span>
                                <span>Generar Plan</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPIS */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <TarjetaResumen
                        titulo="Disponibilidad Promedio"
                        valor={`${disponibilidadPromedio}%`}
                        subtitulo="Promedio de tiempo activo de la flota"
                        icono="📈"
                        clase="text-cyan-400"
                        borde="border-cyan-500/20"
                    />

                    <TarjetaResumen
                        titulo="Mantenimientos a Tiempo"
                        valor={`${mantenimientosATiempo}%`}
                        subtitulo="Activos sin urgencia crítica inmediata"
                        icono="✅"
                        clase="text-emerald-400"
                        borde="border-emerald-500/20"
                    />

                    <TarjetaResumen
                        titulo="Cumplimiento Plan"
                        valor={`${cumplimientoProgramacion}%`}
                        subtitulo="Programación sin vencimientos activos"
                        icono="📅"
                        clase="text-blue-400"
                        borde="border-blue-500/20"
                    />

                    <TarjetaResumen
                        titulo="Costo 30 días"
                        valor={`$${costoEstimado30Dias.toLocaleString('es-CL')}`}
                        subtitulo="Estimación referencial de próximos trabajos"
                        icono="💰"
                        clase="text-amber-400"
                        borde="border-amber-500/20"
                    />

                    <TarjetaResumen
                        titulo="Activos en Riesgo"
                        valor={activosEnRiesgo.length}
                        subtitulo="Vencidos, críticos o próximos a 14 días"
                        icono="🚨"
                        clase="text-red-400"
                        borde="border-red-500/20"
                    />
                </div>

                {/* RESUMEN OPERACIONAL */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="xl:col-span-2 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 backdrop-blur-lg shadow-xl shadow-black/20">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
                            <div>
                                <h4 className="text-2xl font-black text-white">📊 Estado General del Plan</h4>
                                <p className="text-sm text-slate-400">
                                    Distribución de mantenimiento según urgencia operacional.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-right">
                                <p className="text-xs text-cyan-300">Flota evaluada</p>
                                <p className="text-xl font-black text-white">{totalActivos} activos</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Cumplimiento de programación</span>
                                    <span className="font-black text-emerald-400">{cumplimientoProgramacion}%</span>
                                </div>

                                <div className="h-4 w-full overflow-hidden rounded-full bg-slate-800">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700"
                                        style={{ width: `${cumplimientoProgramacion}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center">
                                    <p className="text-3xl font-black text-red-400">{activosVencidos}</p>
                                    <p className="text-xs text-slate-400">Vencidos</p>
                                </div>

                                <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 text-center">
                                    <p className="text-3xl font-black text-orange-400">{activosCriticos7Dias}</p>
                                    <p className="text-xs text-slate-400">0-7 días</p>
                                </div>

                                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-center">
                                    <p className="text-3xl font-black text-amber-400">{activosProximos14Dias}</p>
                                    <p className="text-xs text-slate-400">8-14 días</p>
                                </div>

                                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-center">
                                    <p className="text-3xl font-black text-cyan-400">{activosProgramados30Dias}</p>
                                    <p className="text-xs text-slate-400">15-30 días</p>
                                </div>

                                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
                                    <p className="text-3xl font-black text-emerald-400">{activosControlados}</p>
                                    <p className="text-xs text-slate-400">Controlados</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 backdrop-blur-lg shadow-xl shadow-black/20">
                        <h4 className="text-xl font-black text-white mb-1">🧠 Recomendación Técnica</h4>
                        <p className="text-sm text-slate-400 mb-5">
                            Priorización sugerida según criticidad, fecha y condición.
                        </p>

                        <div className="space-y-3">
                            {activosVencidos > 0 && (
                                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                                    <p className="text-sm font-bold text-red-300">🚨 Acción inmediata</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Existen {activosVencidos} activos con mantenimiento vencido. Deben ser revisados antes de seguir operando.
                                    </p>
                                </div>
                            )}

                            {activosCriticos7Dias > 0 && (
                                <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
                                    <p className="text-sm font-bold text-orange-300">⚠️ Programar esta semana</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Hay {activosCriticos7Dias} mantenimientos dentro de los próximos 7 días.
                                    </p>
                                </div>
                            )}

                            {totalActivos === 0 && (
                                <div className="rounded-2xl border border-slate-700 bg-slate-950/40 p-4 text-center">
                                    <div className="text-4xl mb-3 opacity-50">🚚</div>
                                    <p className="text-sm text-slate-400">
                                        Agrega activos para construir el plan preventivo.
                                    </p>
                                </div>
                            )}

                            {totalActivos > 0 && activosVencidos === 0 && activosCriticos7Dias === 0 && (
                                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                                    <p className="text-sm font-bold text-emerald-300">✅ Plan bajo control</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        No se detectan mantenimientos vencidos ni críticos para esta semana.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RESUMEN POR TIPO */}
                <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 backdrop-blur-lg shadow-xl shadow-black/20">
                    <div className="mb-6">
                        <h4 className="text-2xl font-black text-white">🚛 Resumen por Tipo de Activo</h4>
                        <p className="text-sm text-slate-400">
                            Control del plan agrupado por familia de equipo.
                        </p>
                    </div>

                    {Object.keys(resumenPorTipo).length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {Object.entries(resumenPorTipo).map(([tipo, resumen]) => (
                                <div
                                    key={tipo}
                                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-cyan-500/30 hover:bg-white/[0.06]"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-3xl mb-2">{resumen.icono}</p>
                                            <h5 className="text-lg font-black text-white">{tipo}</h5>
                                            <p className="text-xs text-slate-500">{resumen.total} activos</p>
                                        </div>

                                        <div className="rounded-full bg-slate-950/70 px-3 py-1 text-sm font-bold text-cyan-400">
                                            {resumen.total}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400">Vencidos</span>
                                            <span className="font-bold text-red-400">{resumen.vencidos}</span>
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400">Próximos</span>
                                            <span className="font-bold text-amber-400">{resumen.proximos}</span>
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400">Controlados</span>
                                            <span className="font-bold text-emerald-400">{resumen.controlados}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-10 text-center">
                            <div className="text-5xl mb-4 opacity-50">🚛</div>
                            <p className="text-slate-400">No hay activos para agrupar.</p>
                        </div>
                    )}
                </div>

                {/* LISTADO DE PLANIFICACIÓN */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="xl:col-span-2 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 backdrop-blur-lg shadow-xl shadow-black/20">
                        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h4 className="text-2xl font-black text-white">📅 Calendario de Mantenimiento</h4>
                                <p className="text-sm text-slate-400">
                                    Activos ordenados por fecha de vencimiento.
                                </p>
                            </div>

                            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-300">
                                {activosOrdenados.length} programados
                            </span>
                        </div>

                        {activosOrdenados.length > 0 ? (
                            <div className="space-y-4">
                                {activosOrdenados.map((activo) => (
                                    <TarjetaActivoMantenimiento key={activo.id} activo={activo} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 px-6 py-14 text-center">
                                <div className="text-6xl mb-4 opacity-50">📅</div>
                                <h4 className="text-xl font-black text-white mb-2">
                                    No hay activos programados
                                </h4>
                                <p className="text-sm text-slate-400">
                                    Cuando agregues activos, aparecerán aquí con su calendario preventivo.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 backdrop-blur-lg shadow-xl shadow-black/20">
                            <h4 className="text-xl font-black text-white mb-1">📌 Próximos 30 días</h4>
                            <p className="text-sm text-slate-400 mb-5">
                                Carga de trabajo estimada del mes.
                            </p>

                            {mantenimientos30Dias.length > 0 ? (
                                <div className="space-y-3">
                                    {mantenimientos30Dias.slice(0, 6).map((activo) => {
                                        const dias = obtenerDiasHastaMantenimiento(activo.próximoMantenimiento);
                                        const estado = obtenerEstadoPlan(dias);

                                        return (
                                            <div
                                                key={activo.id}
                                                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-bold text-white">
                                                            {obtenerIconoActivo(activo.tipo)} {activo.nombre}
                                                        </p>

                                                        <p className="text-xs text-slate-500 mt-1">
                                                            {formatearFechaCorta(activo.próximoMantenimiento)}
                                                        </p>
                                                    </div>

                                                    <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${estado.clase}`}>
                                                        {dias < 0 ? 'Vencido' : `${dias}d`}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {mantenimientos30Dias.length > 6 && (
                                        <p className="text-center text-xs text-slate-500">
                                            +{mantenimientos30Dias.length - 6} mantenimientos adicionales
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center">
                                    <div className="text-4xl mb-3 opacity-50">✅</div>
                                    <p className="text-sm text-slate-400">
                                        No hay mantenimientos urgentes dentro de los próximos 30 días.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 backdrop-blur-lg shadow-xl shadow-black/20">
                            <h4 className="text-xl font-black text-white mb-1">🛠️ Matriz Preventiva</h4>
                            <p className="text-sm text-slate-400 mb-5">
                                Intervalos referenciales por familia.
                            </p>

                            <div className="space-y-3">
                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-300">🚜 Maquinaria / Agrícola</span>
                                        <span className="text-sm font-bold text-cyan-400">250 h</span>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-300">🚚 Transporte / Camión</span>
                                        <span className="text-sm font-bold text-cyan-400">10.000 km</span>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-300">🚙 Vehículo liviano</span>
                                        <span className="text-sm font-bold text-cyan-400">10.000 km</span>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-300">⚙️ Equipo general</span>
                                        <span className="text-sm font-bold text-cyan-400">500 h</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLA TÉCNICA */}
                <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 backdrop-blur-lg shadow-xl shadow-black/20">
                    <div className="mb-6">
                        <h4 className="text-2xl font-black text-white">📋 Tabla Técnica del Plan</h4>
                        <p className="text-sm text-slate-400">
                            Vista administrativa para controlar fechas, medidores, intervalos, costos y prioridad.
                        </p>
                    </div>

                    {activosOrdenados.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1100px]">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Activo</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Tipo</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Patente</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Fecha</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Estado</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Medidor</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Próximo</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Costo Ref.</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {activosOrdenados.map((activo) => {
                                        const dias = obtenerDiasHastaMantenimiento(activo.próximoMantenimiento);
                                        const estado = obtenerEstadoPlan(dias);
                                        const medidor = obtenerProximoMedidor(activo);
                                        const costo = obtenerCostoReferencial(activo);

                                        return (
                                            <tr
                                                key={activo.id}
                                                className="border-b border-white/5 transition-colors hover:bg-white/5"
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-xl">
                                                            {obtenerIconoActivo(activo.tipo)}
                                                        </div>

                                                        <div>
                                                            <p className="text-sm font-bold text-white">{activo.nombre}</p>
                                                            <p className="text-xs text-slate-500">
                                                                {activo.marca} · {activo.modelo} · {activo.año}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4 text-sm text-slate-300">
                                                    {activo.tipo}
                                                </td>

                                                <td className="px-4 py-4 font-mono text-sm text-cyan-400">
                                                    {activo.patente}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <p className="text-sm text-white">
                                                        {formatearFechaCorta(activo.próximoMantenimiento)}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {formatearFechaLarga(activo.próximoMantenimiento)}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${estado.clase}`}>
                                                        {estado.icono} {estado.texto}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4 text-right text-sm text-slate-300">
                                                    {medidor.medidorActual.toLocaleString('es-CL')} {medidor.unidad}
                                                </td>

                                                <td className="px-4 py-4 text-right text-sm font-bold text-cyan-400">
                                                    {medidor.proximo.toLocaleString('es-CL')} {medidor.unidad}
                                                </td>

                                                <td className="px-4 py-4 text-right text-sm font-bold text-emerald-400">
                                                    ${costo.toLocaleString('es-CL')}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 px-6 py-14 text-center">
                            <div className="text-6xl mb-4 opacity-50">📋</div>
                            <h4 className="text-xl font-black text-white mb-2">
                                Sin datos técnicos disponibles
                            </h4>
                            <p className="text-sm text-slate-400">
                                Agrega activos para construir la tabla técnica del plan de mantenimiento.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    /** Inventario - Gestión Profesional de Repuestos */
    const Inventario = () => {
        if (!empresaActual) {
            return (
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="text-center max-w-md rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-8 backdrop-blur-lg">
                        <div className="text-5xl mb-4 text-slate-600">🏢</div>
                        <h3 className="text-2xl font-bold text-white mb-2">No hay empresa asignada</h3>
                        <p className="text-slate-400 mb-6">
                            Para gestionar inventario, primero debes tener una empresa activa.
                        </p>
                    </div>
                </div>
            );
        }

        type RepuestoInventario = {
            id: string;
            codigo: string;
            nombre: string;
            categoria: string;
            sistema: string;
            stockActual: number;
            stockMinimo: number;
            stockMaximo: number;
            unidad: string;
            ubicacion: string;
            proveedor: string;
            costoUnitario: number;
            criticidad: 'crítica' | 'alta' | 'media' | 'baja';
            rotacion: 'alta' | 'media' | 'baja';
            aplicacion: string;
            ultimaEntrada: string;
        };

        const repuestos: RepuestoInventario[] = [
            {
                id: '1',
                codigo: 'FLT-ACE-001',
                nombre: 'Filtro de aceite motor',
                categoria: 'Filtros',
                sistema: 'Lubricación',
                stockActual: 18,
                stockMinimo: 12,
                stockMaximo: 40,
                unidad: 'un',
                ubicacion: 'Rack A-01',
                proveedor: 'Proveedor CAT / Alternativo',
                costoUnitario: 18500,
                criticidad: 'alta',
                rotacion: 'alta',
                aplicacion: 'Camiones, maquinaria y equipos diésel',
                ultimaEntrada: '2026-01-12',
            },
            {
                id: '2',
                codigo: 'FLT-COM-002',
                nombre: 'Filtro de combustible',
                categoria: 'Filtros',
                sistema: 'Combustible',
                stockActual: 9,
                stockMinimo: 15,
                stockMaximo: 45,
                unidad: 'un',
                ubicacion: 'Rack A-02',
                proveedor: 'Bosch / Fleetguard',
                costoUnitario: 22500,
                criticidad: 'crítica',
                rotacion: 'alta',
                aplicacion: 'Motores diésel common rail',
                ultimaEntrada: '2026-01-08',
            },
            {
                id: '3',
                codigo: 'ACE-15W40-020',
                nombre: 'Aceite motor 15W40',
                categoria: 'Lubricantes',
                sistema: 'Motor',
                stockActual: 120,
                stockMinimo: 80,
                stockMaximo: 250,
                unidad: 'L',
                ubicacion: 'Bodega Aceites B-01',
                proveedor: 'Shell / Mobil / Copec',
                costoUnitario: 4200,
                criticidad: 'alta',
                rotacion: 'alta',
                aplicacion: 'Mantenciones preventivas cada intervalo',
                ultimaEntrada: '2026-01-18',
            },
            {
                id: '4',
                codigo: 'ACE-HID-068',
                nombre: 'Aceite hidráulico ISO 68',
                categoria: 'Lubricantes',
                sistema: 'Hidráulico',
                stockActual: 45,
                stockMinimo: 60,
                stockMaximo: 180,
                unidad: 'L',
                ubicacion: 'Bodega Aceites B-02',
                proveedor: 'Mobil / Terpel',
                costoUnitario: 3900,
                criticidad: 'crítica',
                rotacion: 'media',
                aplicacion: 'Sistemas hidráulicos, levante e implementos',
                ultimaEntrada: '2026-01-05',
            },
            {
                id: '5',
                codigo: 'FRN-PAD-004',
                nombre: 'Pastillas de freno',
                categoria: 'Frenos',
                sistema: 'Frenos',
                stockActual: 26,
                stockMinimo: 10,
                stockMaximo: 35,
                unidad: 'jgo',
                ubicacion: 'Rack C-03',
                proveedor: 'Brembo / Alternativo',
                costoUnitario: 48500,
                criticidad: 'alta',
                rotacion: 'media',
                aplicacion: 'Vehículos livianos y camionetas',
                ultimaEntrada: '2026-01-10',
            },
            {
                id: '6',
                codigo: 'BAT-12V-090',
                nombre: 'Batería 12V 90Ah',
                categoria: 'Eléctrico',
                sistema: 'Arranque y carga',
                stockActual: 4,
                stockMinimo: 6,
                stockMaximo: 15,
                unidad: 'un',
                ubicacion: 'Rack D-01',
                proveedor: 'Bosch / Hankook',
                costoUnitario: 135000,
                criticidad: 'crítica',
                rotacion: 'media',
                aplicacion: 'Camionetas, camiones y equipos auxiliares',
                ultimaEntrada: '2025-12-28',
            },
            {
                id: '7',
                codigo: 'NEU-295-80R22',
                nombre: 'Neumático 295/80R22.5',
                categoria: 'Neumáticos',
                sistema: 'Rodado',
                stockActual: 14,
                stockMinimo: 8,
                stockMaximo: 24,
                unidad: 'un',
                ubicacion: 'Patio Neumáticos N-01',
                proveedor: 'Michelin / Bridgestone',
                costoUnitario: 385000,
                criticidad: 'alta',
                rotacion: 'media',
                aplicacion: 'Transporte pesado',
                ultimaEntrada: '2026-01-15',
            },
            {
                id: '8',
                codigo: 'COR-ACC-001',
                nombre: 'Correa de accesorios',
                categoria: 'Motor',
                sistema: 'Accesorios motor',
                stockActual: 7,
                stockMinimo: 5,
                stockMaximo: 20,
                unidad: 'un',
                ubicacion: 'Rack E-02',
                proveedor: 'Gates / Continental',
                costoUnitario: 26500,
                criticidad: 'media',
                rotacion: 'media',
                aplicacion: 'Alternador, bomba agua, compresor A/C',
                ultimaEntrada: '2026-01-02',
            },
        ];

        const movimientosInventario = [
            {
                id: '1',
                tipo: 'Entrada',
                icono: '📥',
                repuesto: 'Aceite motor 15W40',
                cantidad: '+80 L',
                fecha: '18-01-2026',
                responsable: 'Bodega Central',
                color: 'text-emerald-400',
            },
            {
                id: '2',
                tipo: 'Salida',
                icono: '📤',
                repuesto: 'Filtro de combustible',
                cantidad: '-6 un',
                fecha: '17-01-2026',
                responsable: 'OT Preventiva',
                color: 'text-amber-400',
            },
            {
                id: '3',
                tipo: 'Reserva',
                icono: '🔒',
                repuesto: 'Batería 12V 90Ah',
                cantidad: '2 un',
                fecha: '15-01-2026',
                responsable: 'Mantención Correctiva',
                color: 'text-cyan-400',
            },
        ];

        const proveedoresInventario = [
            {
                nombre: 'Proveedor Principal',
                tipo: 'Filtros y componentes críticos',
                cumplimiento: 96,
                entregas: '24-48 h',
                estado: 'Operativo',
                icono: '🏭',
            },
            {
                nombre: 'Lubricantes Zona Centro',
                tipo: 'Aceites y fluidos',
                cumplimiento: 92,
                entregas: '48-72 h',
                estado: 'Operativo',
                icono: '🛢️',
            },
            {
                nombre: 'Neumáticos Minería/Transporte',
                tipo: 'Rodado pesado',
                cumplimiento: 88,
                entregas: '3-5 días',
                estado: 'Evaluar',
                icono: '🛞',
            },
        ];

        const obtenerEstadoStock = (item: RepuestoInventario) => {
            if (item.stockActual <= 0) {
                return {
                    texto: 'Sin stock',
                    icono: '🚫',
                    clase: 'bg-red-500/20 text-red-400 border-red-500/30',
                    barra: 'from-red-500 to-red-400',
                    prioridad: 1,
                };
            }

            if (item.stockActual < item.stockMinimo) {
                return {
                    texto: 'Bajo mínimo',
                    icono: '🚨',
                    clase: 'bg-red-500/20 text-red-400 border-red-500/30',
                    barra: 'from-red-500 to-orange-500',
                    prioridad: 2,
                };
            }

            if (item.stockActual === item.stockMinimo) {
                return {
                    texto: 'En mínimo',
                    icono: '⚠️',
                    clase: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                    barra: 'from-amber-500 to-yellow-500',
                    prioridad: 3,
                };
            }

            if (item.stockActual >= item.stockMaximo) {
                return {
                    texto: 'Sobrestock',
                    icono: '📦',
                    clase: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                    barra: 'from-blue-500 to-cyan-500',
                    prioridad: 4,
                };
            }

            return {
                texto: 'Disponible',
                icono: '✅',
                clase: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                barra: 'from-emerald-500 to-cyan-500',
                prioridad: 5,
            };
        };

        const obtenerColorCriticidad = (criticidad: string) => {
            switch (criticidad) {
                case 'crítica':
                    return 'bg-red-500/20 text-red-400 border-red-500/30';
                case 'alta':
                    return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
                case 'media':
                    return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
                default:
                    return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            }
        };

        const obtenerColorRotacion = (rotacion: string) => {
            switch (rotacion) {
                case 'alta':
                    return 'text-emerald-400';
                case 'media':
                    return 'text-cyan-400';
                default:
                    return 'text-slate-400';
            }
        };

        const obtenerIconoCategoria = (categoria: string) => {
            const categoriaNormalizada = categoria.toLowerCase();

            if (categoriaNormalizada.includes('filtro')) return '🧃';
            if (categoriaNormalizada.includes('lubricante')) return '🛢️';
            if (categoriaNormalizada.includes('freno')) return '🛑';
            if (categoriaNormalizada.includes('eléctrico')) return '⚡';
            if (categoriaNormalizada.includes('electrico')) return '⚡';
            if (categoriaNormalizada.includes('neumático')) return '🛞';
            if (categoriaNormalizada.includes('neumatico')) return '🛞';
            if (categoriaNormalizada.includes('motor')) return '⚙️';

            return '📦';
        };

        const calcularPorcentajeStock = (item: RepuestoInventario) => {
            if (item.stockMaximo <= 0) return 0;
            return Math.min(Math.round((item.stockActual / item.stockMaximo) * 100), 100);
        };

        const repuestosOrdenados = [...repuestos].sort((a, b) => {
            const estadoA = obtenerEstadoStock(a);
            const estadoB = obtenerEstadoStock(b);

            if (estadoA.prioridad !== estadoB.prioridad) {
                return estadoA.prioridad - estadoB.prioridad;
            }

            return a.nombre.localeCompare(b.nombre);
        });

        const totalItems = repuestos.length;

        const itemsBajoMinimo = repuestos.filter((item) => item.stockActual < item.stockMinimo).length;

        const itemsCriticos = repuestos.filter((item) => item.criticidad === 'crítica').length;

        const valorTotalInventario = repuestos.reduce((total, item) => {
            return total + item.stockActual * item.costoUnitario;
        }, 0);

        const valorReposicionMinima = repuestos.reduce((total, item) => {
            if (item.stockActual >= item.stockMinimo) return total;
            return total + (item.stockMinimo - item.stockActual) * item.costoUnitario;
        }, 0);

        const unidadesTotales = repuestos.reduce((total, item) => total + item.stockActual, 0);

        const categorias = repuestos.reduce((acumulador, item) => {
            if (!acumulador[item.categoria]) {
                acumulador[item.categoria] = {
                    totalItems: 0,
                    stockTotal: 0,
                    bajoMinimo: 0,
                    valor: 0,
                    icono: obtenerIconoCategoria(item.categoria),
                };
            }

            acumulador[item.categoria].totalItems += 1;
            acumulador[item.categoria].stockTotal += item.stockActual;
            acumulador[item.categoria].valor += item.stockActual * item.costoUnitario;

            if (item.stockActual < item.stockMinimo) {
                acumulador[item.categoria].bajoMinimo += 1;
            }

            return acumulador;
        }, {} as Record<string, {
            totalItems: number;
            stockTotal: number;
            bajoMinimo: number;
            valor: number;
            icono: string;
        }>);

        const repuestosBajoMinimo = repuestos.filter((item) => item.stockActual < item.stockMinimo);

        const manejarAgregarRepuesto = () => {
            setNotificaciones(prev => [{
                id: Date.now().toString(),
                título: 'Módulo de inventario',
                mensaje: 'Próximo paso: crear formulario real para agregar repuestos a Supabase.',
                tipo: 'info',
                fecha: new Date(),
                leída: false,
                icono: '📦',
            }, ...prev]);

            alert('Próximo paso: crear formulario para agregar repuestos reales al inventario.');
        };

        const TarjetaKpiInventario = ({
            titulo,
            valor,
            subtitulo,
            icono,
            borde,
            clase,
        }: {
            titulo: string;
            valor: string | number;
            subtitulo: string;
            icono: string;
            borde: string;
            clase: string;
        }) => (
            <div className={`rounded-2xl border ${borde} bg-slate-900/70 p-5 backdrop-blur-lg shadow-xl shadow-black/10`}>
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-sm text-slate-400">{titulo}</p>
                        <p className={`mt-1 text-3xl font-black ${clase}`}>{valor}</p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-2xl">
                        {icono}
                    </div>
                </div>

                <p className="text-xs text-slate-500">{subtitulo}</p>
            </div>
        );

        const TarjetaRepuesto = ({ item }: { item: RepuestoInventario }) => {
            const estado = obtenerEstadoStock(item);
            const porcentajeStock = calcularPorcentajeStock(item);
            const cantidadCompra = Math.max(item.stockMaximo - item.stockActual, 0);

            return (
                <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-5 backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-2xl">
                                {obtenerIconoCategoria(item.categoria)}
                            </div>

                            <div>
                                <p className="font-mono text-xs font-bold text-cyan-400">{item.codigo}</p>
                                <h4 className="mt-1 text-base font-black text-white">{item.nombre}</h4>
                                <p className="mt-1 text-xs text-slate-400">{item.sistema} · {item.categoria}</p>
                            </div>
                        </div>

                        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${estado.clase}`}>
                            {estado.icono} {estado.texto}
                        </span>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-xs text-slate-500">Stock actual</p>
                            <p className="text-lg font-black text-white">
                                {item.stockActual} {item.unidad}
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-xs text-slate-500">Mínimo</p>
                            <p className="text-lg font-black text-amber-400">
                                {item.stockMinimo} {item.unidad}
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-xs text-slate-500">Ubicación</p>
                            <p className="text-sm font-bold text-cyan-300">{item.ubicacion}</p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-xs text-slate-500">Costo unit.</p>
                            <p className="text-sm font-bold text-emerald-400">
                                ${item.costoUnitario.toLocaleString('es-CL')}
                            </p>
                        </div>
                    </div>

                    <div className="mb-4 rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-3">
                        <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-slate-400">Nivel de stock</span>
                            <span className="font-bold text-white">{porcentajeStock}%</span>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                            <div
                                className={`h-full rounded-full bg-gradient-to-r ${estado.barra}`}
                                style={{ width: `${porcentajeStock}%` }}
                            />
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                            <div>
                                <p className="text-slate-500">Mín.</p>
                                <p className="font-bold text-amber-400">{item.stockMinimo}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Actual</p>
                                <p className="font-bold text-white">{item.stockActual}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Máx.</p>
                                <p className="font-bold text-cyan-400">{item.stockMaximo}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${obtenerColorCriticidad(item.criticidad)}`}>
                            Criticidad {item.criticidad.toUpperCase()}
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-bold text-slate-300">
                            Rotación <span className={obtenerColorRotacion(item.rotacion)}>{item.rotacion.toUpperCase()}</span>
                        </span>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs text-slate-500">Aplicación</p>
                                <p className="text-xs text-slate-300">{item.aplicacion}</p>
                            </div>

                            <div className="text-right">
                                <p className="text-xs text-slate-500">Compra sugerida</p>
                                <p className="text-sm font-black text-cyan-400">
                                    {cantidadCompra} {item.unidad}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <div className="space-y-6">
                {/* ENCABEZADO */}
                <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-blue-950/40 p-6 backdrop-blur-lg shadow-xl shadow-cyan-500/10">
                    <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl" />
                    <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <div className="flex items-center gap-4 mb-3">
                                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 text-4xl shadow-lg shadow-cyan-500/30">
                                    📦
                                </div>

                                <div>
                                    <h3 className="text-3xl font-black text-white tracking-tight">
                                        Inventario Técnico de Repuestos
                                    </h3>

                                    <p className="text-sm text-cyan-400">
                                        Control de stock, repuestos críticos, costos y abastecimiento · {empresaActual.nombre}
                                    </p>
                                </div>
                            </div>

                            <p className="max-w-4xl text-sm text-slate-400 leading-relaxed">
                                Gestiona repuestos, lubricantes, filtros, neumáticos y componentes críticos
                                para mantener la disponibilidad de la flota. Esta vista ayuda a detectar
                                stock bajo, estimar compras y priorizar materiales esenciales para mantenimiento.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                <p className="text-xs text-slate-400">Ítems</p>
                                <p className="text-2xl font-black text-white">{totalItems}</p>
                            </div>

                            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                                <p className="text-xs text-red-300">Bajo mínimo</p>
                                <p className="text-2xl font-black text-red-400">{itemsBajoMinimo}</p>
                            </div>

                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                                <p className="text-xs text-amber-300">Críticos</p>
                                <p className="text-2xl font-black text-amber-400">{itemsCriticos}</p>
                            </div>

                            <button
                                onClick={manejarAgregarRepuesto}
                                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.03] hover:opacity-90"
                            >
                                <span className="text-xl">➕</span>
                                <span>Agregar Repuesto</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPIS */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <TarjetaKpiInventario
                        titulo="Valor Inventario"
                        valor={`$${valorTotalInventario.toLocaleString('es-CL')}`}
                        subtitulo="Valor aproximado del stock disponible"
                        icono="💰"
                        borde="border-emerald-500/20"
                        clase="text-emerald-400"
                    />

                    <TarjetaKpiInventario
                        titulo="Reposición Mínima"
                        valor={`$${valorReposicionMinima.toLocaleString('es-CL')}`}
                        subtitulo="Monto requerido para volver a stock mínimo"
                        icono="🧾"
                        borde="border-amber-500/20"
                        clase="text-amber-400"
                    />

                    <TarjetaKpiInventario
                        titulo="Unidades Totales"
                        valor={unidadesTotales}
                        subtitulo="Cantidad física entre repuestos y materiales"
                        icono="📦"
                        borde="border-cyan-500/20"
                        clase="text-cyan-400"
                    />

                    <TarjetaKpiInventario
                        titulo="Bajo Mínimo"
                        valor={itemsBajoMinimo}
                        subtitulo="Ítems que requieren compra o reposición"
                        icono="🚨"
                        borde="border-red-500/20"
                        clase="text-red-400"
                    />

                    <TarjetaKpiInventario
                        titulo="Categorías"
                        valor={Object.keys(categorias).length}
                        subtitulo="Familias de repuestos disponibles"
                        icono="🗂️"
                        borde="border-blue-500/20"
                        clase="text-blue-400"
                    />
                </div>

                {/* ALERTAS Y RESUMEN */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="xl:col-span-2 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 backdrop-blur-lg shadow-xl shadow-black/20">
                        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h4 className="text-2xl font-black text-white">📊 Resumen por Categoría</h4>
                                <p className="text-sm text-slate-400">
                                    Distribución de stock y valor por familia de repuestos.
                                </p>
                            </div>

                            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-300">
                                {Object.keys(categorias).length} categorías
                            </span>
                        </div>

                        {Object.keys(categorias).length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {Object.entries(categorias).map(([categoria, resumen]) => (
                                    <div
                                        key={categoria}
                                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-cyan-500/30 hover:bg-white/[0.06]"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <p className="text-3xl mb-2">{resumen.icono}</p>
                                                <h5 className="text-lg font-black text-white">{categoria}</h5>
                                                <p className="text-xs text-slate-500">{resumen.totalItems} ítems</p>
                                            </div>

                                            <div className="rounded-full bg-slate-950/70 px-3 py-1 text-sm font-bold text-cyan-400">
                                                {resumen.stockTotal}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-400">Bajo mínimo</span>
                                                <span className="font-bold text-red-400">{resumen.bajoMinimo}</span>
                                            </div>

                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-400">Valor stock</span>
                                                <span className="font-bold text-emerald-400">
                                                    ${resumen.valor.toLocaleString('es-CL')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-10 text-center">
                                <div className="text-5xl mb-4 opacity-50">📦</div>
                                <p className="text-slate-400">No hay categorías disponibles.</p>
                            </div>
                        )}
                    </div>

                    <div className="rounded-3xl border border-red-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 backdrop-blur-lg shadow-xl shadow-black/20">
                        <h4 className="text-xl font-black text-white mb-1">🚨 Alertas de Stock</h4>
                        <p className="text-sm text-slate-400 mb-5">
                            Repuestos bajo mínimo o críticos.
                        </p>

                        {repuestosBajoMinimo.length > 0 ? (
                            <div className="space-y-3">
                                {repuestosBajoMinimo.map((item) => {
                                    const faltante = item.stockMinimo - item.stockActual;

                                    return (
                                        <div
                                            key={item.id}
                                            className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-bold text-white">
                                                        {obtenerIconoCategoria(item.categoria)} {item.nombre}
                                                    </p>

                                                    <p className="text-xs text-slate-400 mt-1">
                                                        Stock: {item.stockActual} / Mínimo: {item.stockMinimo}
                                                    </p>
                                                </div>

                                                <span className="rounded-full border border-red-500/30 bg-red-500/20 px-2 py-1 text-[10px] font-bold text-red-300">
                                                    Faltan {faltante}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
                                <div className="text-4xl mb-3">✅</div>
                                <p className="text-sm font-bold text-emerald-300">
                                    Stock bajo control
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    No hay repuestos bajo mínimo.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* LISTADO DE REPUESTOS */}
                <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 backdrop-blur-lg shadow-xl shadow-black/20">
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h4 className="text-2xl font-black text-white">📦 Repuestos y Materiales</h4>
                            <p className="text-sm text-slate-400">
                                Vista operacional ordenada por criticidad y nivel de stock.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-300">
                                {repuestosOrdenados.length} ítems
                            </span>

                            <span className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300">
                                {itemsBajoMinimo} bajo mínimo
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        {repuestosOrdenados.map((item) => (
                            <TarjetaRepuesto key={item.id} item={item} />
                        ))}
                    </div>
                </div>

                {/* PROVEEDORES Y MOVIMIENTOS */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 backdrop-blur-lg shadow-xl shadow-black/20">
                        <h4 className="text-2xl font-black text-white mb-1">🏭 Proveedores Estratégicos</h4>
                        <p className="text-sm text-slate-400 mb-6">
                            Referencia para abastecimiento y continuidad operacional.
                        </p>

                        <div className="space-y-4">
                            {proveedoresInventario.map((proveedor) => (
                                <div
                                    key={proveedor.nombre}
                                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-2xl">
                                                {proveedor.icono}
                                            </div>

                                            <div>
                                                <h5 className="text-base font-black text-white">{proveedor.nombre}</h5>
                                                <p className="text-xs text-slate-400">{proveedor.tipo}</p>
                                            </div>
                                        </div>

                                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                                            {proveedor.estado}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                                            <p className="text-xs text-slate-500">Cumplimiento</p>
                                            <p className="text-lg font-black text-cyan-400">{proveedor.cumplimiento}%</p>
                                        </div>

                                        <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                                            <p className="text-xs text-slate-500">Entrega</p>
                                            <p className="text-lg font-black text-white">{proveedor.entregas}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 backdrop-blur-lg shadow-xl shadow-black/20">
                        <h4 className="text-2xl font-black text-white mb-1">🔁 Últimos Movimientos</h4>
                        <p className="text-sm text-slate-400 mb-6">
                            Entradas, salidas y reservas recientes.
                        </p>

                        <div className="space-y-4">
                            {movimientosInventario.map((movimiento) => (
                                <div
                                    key={movimiento.id}
                                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-2xl">
                                                {movimiento.icono}
                                            </div>

                                            <div>
                                                <p className="text-sm font-black text-white">{movimiento.repuesto}</p>
                                                <p className="text-xs text-slate-400">
                                                    {movimiento.tipo} · {movimiento.responsable}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className={`text-sm font-black ${movimiento.color}`}>
                                                {movimiento.cantidad}
                                            </p>
                                            <p className="text-xs text-slate-500">{movimiento.fecha}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* TABLA TÉCNICA */}
                <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 backdrop-blur-lg shadow-xl shadow-black/20">
                    <div className="mb-6">
                        <h4 className="text-2xl font-black text-white">📋 Tabla Técnica de Inventario</h4>
                        <p className="text-sm text-slate-400">
                            Control administrativo para compras, costos, proveedores, stock mínimo y ubicación física.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1200px]">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Código</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Repuesto</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Categoría</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Estado</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Stock</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Mín.</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Máx.</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Ubicación</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Costo Unit.</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Proveedor</th>
                                </tr>
                            </thead>

                            <tbody>
                                {repuestosOrdenados.map((item) => {
                                    const estado = obtenerEstadoStock(item);

                                    return (
                                        <tr
                                            key={item.id}
                                            className="border-b border-white/5 transition-colors hover:bg-white/5"
                                        >
                                            <td className="px-4 py-4 font-mono text-sm font-bold text-cyan-400">
                                                {item.codigo}
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="text-sm font-bold text-white">{item.nombre}</p>
                                                <p className="text-xs text-slate-500">{item.aplicacion}</p>
                                            </td>

                                            <td className="px-4 py-4 text-sm text-slate-300">
                                                {obtenerIconoCategoria(item.categoria)} {item.categoria}
                                            </td>

                                            <td className="px-4 py-4">
                                                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${estado.clase}`}>
                                                    {estado.icono} {estado.texto}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 text-right text-sm font-bold text-white">
                                                {item.stockActual} {item.unidad}
                                            </td>

                                            <td className="px-4 py-4 text-right text-sm text-amber-400">
                                                {item.stockMinimo}
                                            </td>

                                            <td className="px-4 py-4 text-right text-sm text-cyan-400">
                                                {item.stockMaximo}
                                            </td>

                                            <td className="px-4 py-4 text-sm text-slate-300">
                                                {item.ubicacion}
                                            </td>

                                            <td className="px-4 py-4 text-right text-sm font-bold text-emerald-400">
                                                ${item.costoUnitario.toLocaleString('es-CL')}
                                            </td>

                                            <td className="px-4 py-4 text-sm text-slate-300">
                                                {item.proveedor}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    /** Personal */
    const Personal = () => (
        <div className="space-y-6">
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-lg">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">👥 Personal</h3>
                        <p className="text-cyan-400">Equipo de trabajo y técnicos</p>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity">
                        + Agregar Personal
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {['Juan Pérez', 'María González', 'Carlos López', 'Pedro Martínez', 'Ana Silva', 'Roberto Díaz'].map((nombre, idx) => (
                        <div key={idx} className="group p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-cyan-500/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-400 font-bold text-lg">
                                    {nombre.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-white font-medium">{nombre}</div>
                                    <div className="text-sm text-slate-400">Técnico Mecánico</div>
                                    <div className="text-xs text-amber-400 mt-1">3 OT activas</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    /** Reportes */
    const Reportes = () => (
        <div className="space-y-6">
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-lg">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">📊 Reportes</h3>
                        <p className="text-cyan-400">Análisis y estadísticas detalladas</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity">
                            📥 Exportar PDF
                        </button>
                        <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium hover:opacity-90 transition-opacity">
                            📈 Generar Reporte
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-lg font-bold text-white mb-4">📅 Reportes Disponibles</h4>
                        <div className="space-y-2">
                            {['Reporte de Mantenimiento Mensual', 'Análisis de Costos por Vehículo', 'Eficiencia de Técnicos', 'Historial de Fallas', 'Cumplimiento de Programación', 'Inventario vs Consumo'].map((reporte, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-between">
                                    <span className="text-white">{reporte}</span>
                                    <span className="text-cyan-400 text-sm">→</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white mb-4">📊 Métricas Clave</h4>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                                <div className="text-2xl font-bold text-white">$1.2M</div>
                                <div className="text-sm text-cyan-400">Costo Total Mantenimiento</div>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10">
                                <div className="text-2xl font-bold text-white">23.5%</div>
                                <div className="text-sm text-emerald-400">Reducción de Costos vs 2023</div>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                                <div className="text-2xl font-bold text-white">98.7%</div>
                                <div className="text-sm text-amber-400">Disponibilidad Operativa</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    /** Configuración */
    const Configuración = () => (
        <div className="space-y-6">
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-lg">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">⚙️ Configuración</h3>
                        <p className="text-cyan-400">Ajustes y preferencias del sistema</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white">🔧 Ajustes Generales</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                <div><span className="text-white">Modo Oscuro</span><p className="text-xs text-slate-400">Activar/desactivar tema oscuro</p></div>
                                <div onClick={alternarModoOscuro} className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${modoOscuro ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                                    <div className={`bg-white w-4 h-4 rounded-full transform ${modoOscuro ? 'translate-x-6' : ''} transition-transform`} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                <div><span className="text-white">Efectos Visuales</span><p className="text-xs text-slate-400">Animaciones y partículas</p></div>
                                <div onClick={alternarEfectos} className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${efectosHabilitados ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                                    <div className={`bg-white w-4 h-4 rounded-full transform ${efectosHabilitados ? 'translate-x-6' : ''} transition-transform`} />
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white">Intensidad Efectos</span>
                                    <span className="text-cyan-400 text-sm">{intensidadEfectos.toFixed(1)}x</span>
                                </div>
                                <input type="range" min="0.1" max="2" step="0.1" value={intensidadEfectos} onChange={(e) => manejarIntensidadEfectos(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white mb-4">👤 Perfil de Usuario</h4>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-400 font-bold text-2xl">
                                    {datosUsuario?.nombre?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-white">{datosUsuario?.nombre}</div>
                                    <div className="text-slate-400">{datosUsuario?.email}</div>
                                    <div className="text-sm text-cyan-400 mt-1">{datosUsuario?.rol}</div>
                                </div>
                            </div>
                            <button onClick={manejarCerrarSesión} className="w-full px-4 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm">
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // =============================================================
    // ⚪ SECCIÓN BLANCA – Render principal
    // =============================================================

    if (cargando) {
        return (
            <main className="relative min-h-screen w-full bg-slate-950 font-sans overflow-hidden flex items-center justify-center">
                <div className="text-center">
                    <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-[#0066ff] flex items-center justify-center text-white font-bold shadow-md shadow-cyan-500/30 mx-auto mb-4">
                        <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <p className="text-cyan-400 text-sm font-medium">Inicializando FleetVision...</p>
                    <p className="text-slate-500 text-xs mt-2">Cargando sistema de gestión de flotas</p>
                </div>
            </main>
        );
    }

    // =============================================================
    // 🔴 APLICACIÓN DE CLASES PARA MODO Y EFECTOS
    // =============================================================
    // El <main> recibe las clases que activan los estilos CSS:
    // - modo-oscuro o modo-claro (según estado)
    // - efectos-activos o efectos-off (según toggle)
    // =============================================================
    return (
        <main
            className={`relative min-h-screen w-full font-sans overflow-hidden transition-colors duration-700 ease-in-out bg-slate-950 ${modoOscuro ? 'modo-oscuro' : 'modo-claro'} ${efectosHabilitados ? 'efectos-activos' : 'efectos-off'}`}
            style={{ backgroundColor: modoOscuro ? '#0f172a' : '#f0f4f8' }}
        >
            {/* ============================================================= */}
            {/* 🟢 BRILLO DE FONDO (neblina) – se activa con efectos */}
            {/* ============================================================= */}
            <div className={`fondo-brillo ${efectosHabilitados ? 'efectos-activos' : ''}`} />

            {/* ============================================================= */}
            {/* 🟣 PARTÍCULAS DE FONDO – detrás de todo el contenido */}
            {/* ============================================================= */}
            <div className="particulas-container-fondo">
                {generarParticulasFondo()}
            </div>

            {/* ============================================================= */}
            {/* 🔴 ZOOM BARRA IZQUIERDA – aplicado dentro del componente BarraLateral */}
            {/* ============================================================= */}
            <BarraLateral />

            {/* ============================================================= */}
            {/* 🔴 ZOOM HEADER SUPERIOR – se controla desde dashboard/layout.tsx */}
            {/* ============================================================= */}
            <header
                className={`relative z-10 border-b transition-all duration-700 ease-in-out ${barraLateralContraída ? 'pl-20' : 'pl-64'} ${modoOscuro ? 'bg-slate-950/80 backdrop-blur-lg border-white/10' : 'bg-gray-100/80 backdrop-blur-lg border-gray-300'}`}
                style={{ zoom: "var(--zoom-header)" } as CSSProperties}
            >
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                {/* LOGO CON BRILLO CONDICIONAL */}
                                <div className={`relative h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-[#0066ff] flex items-center justify-center text-white font-bold shadow-md shadow-cyan-500/30 ${efectosHabilitados ? 'glow-effect' : ''}`}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-[#0088ff] to-cyan-300">
                                    Fleet<span className="text-cyan-500">Vision</span>
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 text-xs font-bold">
                                        🇨🇱 CHILE
                                    </span>
                                    <span className={`text-xs ${modoOscuro ? 'text-slate-400' : 'text-gray-600'}`}>Sistema de Gestión de Flotas</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Controles con emojis ☀️🌙 */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={alternarEfectos}
                                    className={`p-2 rounded-lg ${modoOscuro ? 'hover:bg-white/10' : 'hover:bg-gray-200'} transition-colors text-xl`}
                                    title={efectosHabilitados ? "Desactivar efectos" : "Activar efectos"}
                                >
                                    {efectosHabilitados ? '✨' : '⭐'}
                                </button>
                                <button
                                    onClick={alternarModoOscuro}
                                    className={`p-2 rounded-lg ${modoOscuro ? 'hover:bg-white/10' : 'hover:bg-gray-200'} transition-colors text-xl`}
                                    title={modoOscuro ? "Modo claro" : "Modo oscuro"}
                                >
                                    {modoOscuro ? '☀️' : '🌙'}
                                </button>
                            </div>

                            {/* MOSTRAR EMPRESA DE FORMA ESTÁTICA */}
                            {empresaActual && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <div className="text-left">
                                        <p className="text-[10px] text-slate-400">Empresa</p>
                                        <p className="text-sm font-medium text-white">{empresaActual.nombre}</p>
                                    </div>
                                </div>
                            )}

                            {/* Perfil de usuario */}
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className={`text-sm font-medium ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>{datosUsuario?.nombre || 'Usuario'}</p>
                                    <p className={`text-xs ${modoOscuro ? 'text-slate-400' : 'text-gray-600'}`}>{datosUsuario?.rol || 'Usuario'}</p>
                                </div>
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${modoOscuro ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400' : 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-500'}`}>
                                    {datosUsuario?.nombre?.charAt(0) || 'U'}
                                </div>
                                <button
                                    onClick={manejarCerrarSesión}
                                    className={`p-2 rounded-lg transition-colors ${modoOscuro ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
                                    title="Cerrar sesión"
                                >
                                    <svg className={`w-5 h-5 ${modoOscuro ? 'text-slate-400 hover:text-red-400' : 'text-gray-600 hover:text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ============================================================= */}
            {/* 🔴 ZOOM CONTENIDO PRINCIPAL – se controla desde dashboard/layout.tsx */}
            {/* ============================================================= */}
            <div
                className={`relative z-10 px-6 py-8 transition-all duration-700 ease-in-out ${barraLateralContraída ? 'pl-20' : 'pl-64'}`}
                style={{ zoom: "var(--zoom-main)" } as CSSProperties}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className={`text-3xl font-bold mb-2 ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
                            Bienvenido, <span className="text-cyan-500">{datosUsuario?.nombre || 'Usuario'}</span>
                        </h1>
                        <p className={`${modoOscuro ? 'text-slate-400' : 'text-gray-600'}`}>
                            {empresaActual ? `Gestión de flota para ${empresaActual.nombre}` : 'No hay empresa asignada'}
                        </p>
                    </div>

                    {secciónActiva === 'dashboard' && <DashboardPrincipal />}
                    {secciónActiva === 'activos' && <GestiónActivos />}
                    {secciónActiva === 'ordenes' && <ÓrdenesTrabajo />}
                    {secciónActiva === 'mantenimiento' && <PlanMantenimiento />}
                    {secciónActiva === 'inventario' && <Inventario />}
                    {secciónActiva === 'personal' && <Personal />}
                    {secciónActiva === 'reportes' && <Reportes />}
                    {secciónActiva === 'configuracion' && <Configuración />}
                </div>
            </div>

            {/* Footer */}
            <footer
                className={`fixed bottom-0 left-0 right-0 z-20 border-t px-6 py-3 transition-all duration-700 ease-in-out ${barraLateralContraída ? 'pl-20' : 'pl-64'} ${modoOscuro ? 'border-white/10 bg-slate-950/90 backdrop-blur-sm' : 'border-gray-300 bg-gray-100/90 backdrop-blur-sm'}`}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
                    <div className={`${modoOscuro ? 'text-slate-500' : 'text-gray-500'}`}>
                        © {new Date().getFullYear()} FleetVision Chile • Sistema Multiempresa de Gestión de Flotas
                    </div>
                    <div className={`${modoOscuro ? 'text-slate-500' : 'text-gray-500'}`}>
                        Usuario: <span className="text-cyan-500">{datosUsuario?.email}</span>
                        {empresaActual && (
                            <> | Empresa: <span className="text-blue-500">{empresaActual.nombre}</span></>
                        )}
                    </div>
                </div>
            </footer>
        </main>
    );
}