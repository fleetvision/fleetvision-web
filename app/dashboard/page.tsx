'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

// Definición de tipos
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
    activo?: boolean;
}

interface Usuario {
    id: string;
    email: string;
    nombre: string;
    rol: string;
}

export default function DashboardCompleto() {
    const router = useRouter();
    const referenciaAnimación = useRef<number | null>(null);

    // ==================== ESTADOS PRINCIPALES ====================
    const [cargando, setCargando] = useState(true);
    const [modoOscuro, setModoOscuro] = useState(true);
    const [barraLateralContraída, setBarraLateralContraída] = useState(false);
    const [secciónActiva, setSecciónActiva] = useState('dashboard');
    const [mostrarSelectorEmpresa, setMostrarSelectorEmpresa] = useState(false);
    const [notificacionesVisible, setNotificacionesVisible] = useState(false);

    // ==================== ESTADOS DE DATOS ====================
    const [empresaActual, setEmpresaActual] = useState<Empresa | null>(null);
    const [empresasDisponibles, setEmpresasDisponibles] = useState<Empresa[]>([]);
    const [datosUsuario, setDatosUsuario] = useState<Usuario | null>(null);

    // ==================== ESTADOS DE EFECTOS VISUALES ====================
    const [efectosHabilitados, setEfectosHabilitados] = useState(true);
    const [intensidadEfectos, setIntensidadEfectos] = useState(1.0);
    const [efectosBrillo, setEfectosBrillo] = useState<any[]>([]);
    const [partículas, setPartículas] = useState<any[]>([]);
    const [chispas, setChispas] = useState<any[]>([]);

    // ==================== DATOS DE PRUEBA ====================
    const [métricasVivas, setMétricasVivas] = useState<Métrica[]>([
        { id: '1', título: 'Vehículos Activos', valor: 12, unidad: '', cambio: 2, tendencia: 'sube', color: 'emerald', salud: 95, meta: 15, icono: '🚚' },
        { id: '2', título: 'Disponibilidad', valor: 98.7, unidad: '%', cambio: 1.2, tendencia: 'sube', color: 'cyan', salud: 98, meta: 95, icono: '📈' },
        { id: '3', título: 'Alertas Activas', valor: 3, unidad: '', cambio: -1, tendencia: 'baja', color: 'amber', salud: 85, meta: 0, icono: '🚨' },
        { id: '4', título: 'Mantenimientos', valor: 8, unidad: '', cambio: 0, tendencia: 'estable', color: 'blue', salud: 90, meta: 10, icono: '🔧' }
    ]);

    const [tareasUrgentes, setTareasUrgentes] = useState<Tarea[]>([
        { id: '1', título: 'Revisión Motor - Camión 01', prioridad: 'crítica', estado: 'pendiente', progreso: 30, fechaLímite: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), asignadoA: 'Juan Pérez', tipo: 'Mecánica' },
        { id: '2', título: 'Cambio de Neumáticos', prioridad: 'alta', estado: 'en_progreso', progreso: 70, fechaLímite: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), asignadoA: 'María González', tipo: 'Preventivo' },
        { id: '3', título: 'Actualización Software', prioridad: 'media', estado: 'pendiente', progreso: 0, fechaLímite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), asignadoA: 'Carlos López', tipo: 'Sistema' }
    ]);

    const [alertas, setAlertas] = useState<Alerta[]>([
        { id: '1', título: 'Temperatura Motor Alta', severidad: 'crítica', activo: 'Camión 01', fecha: new Date(Date.now() - 2 * 60 * 60 * 1000), resuelta: false, descripción: 'Temperatura excede límite seguro', acciónRequerida: 'Detener vehículo inmediatamente' },
        { id: '2', título: 'Presión de Neumáticos Baja', severidad: 'advertencia', activo: 'Camión 03', fecha: new Date(Date.now() - 5 * 60 * 60 * 1000), resuelta: false, descripción: 'Presión 20% por debajo del mínimo' },
        { id: '3', título: 'Mantenimiento Preventivo Vencido', severidad: 'advertencia', activo: 'Camión 05', fecha: new Date(Date.now() - 24 * 60 * 60 * 1000), resuelta: true }
    ]);

    const [activos, setActivos] = useState<Activo[]>([
        { id: '1', nombre: 'Camión Volvo FH16', modelo: 'FH16 750', estado: 'saludable', ubicación: 'Santiago Centro', patente: 'AB-1234-CD', tiempoActivo: 98.5, próximoMantenimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), kilometraje: 125430 },
        { id: '2', nombre: 'Camión Mercedes Actros', modelo: 'Actros 2663', estado: 'advertencia', ubicación: 'Valparaíso', patente: 'EF-5678-GH', tiempoActivo: 92.3, próximoMantenimiento: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), kilometraje: 187650, alertasActivas: 1 },
        { id: '3', nombre: 'Camión Scania R730', modelo: 'R730 V8', estado: 'saludable', ubicación: 'Concepción', patente: 'IJ-9012-KL', tiempoActivo: 99.1, próximoMantenimiento: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), kilometraje: 89450 },
        { id: '4', nombre: 'Camión Iveco Stralis', modelo: 'Stralis Hi-Way', estado: 'crítico', ubicación: 'Antofagasta', patente: 'MN-3456-OP', tiempoActivo: 85.7, próximoMantenimiento: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), kilometraje: 234120, alertasActivas: 2 },
        { id: '5', nombre: 'Camión Kenworth W900', modelo: 'W900 L', estado: 'saludable', ubicación: 'La Serena', patente: 'QR-7890-ST', tiempoActivo: 96.8, próximoMantenimiento: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), kilometraje: 156780 },
        { id: '6', nombre: 'Camión Mack Anthem', modelo: 'Anthem 70', estado: 'saludable', ubicación: 'Iquique', patente: 'UV-1234-WX', tiempoActivo: 97.4, próximoMantenimiento: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), kilometraje: 103450 }
    ]);

    const [órdenesTrabajo, setÓrdenesTrabajo] = useState<OrdenTrabajo[]>([
        { id: '1', número: 'OT-2024-001', descripción: 'Revisión completa motor', estado: 'completada', prioridad: 'alta', fechaCreación: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), fechaLímite: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), asignadoA: 'Juan Pérez', tipo: 'Correctivo', activo: 'Camión 01', costoEstimado: 500000, costoReal: 480000 },
        { id: '2', número: 'OT-2024-002', descripción: 'Cambio de neumáticos', estado: 'en_progreso', prioridad: 'media', fechaCreación: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), fechaLímite: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), asignadoA: 'María González', tipo: 'Preventivo', activo: 'Camión 03', costoEstimado: 800000, costoReal: 0 },
        { id: '3', número: 'OT-2024-003', descripción: 'Alineación y balanceo', estado: 'asignada', prioridad: 'media', fechaCreación: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), fechaLímite: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), asignadoA: 'Carlos López', tipo: 'Preventivo', activo: 'Camión 05', costoEstimado: 250000, costoReal: 0 },
        { id: '4', número: 'OT-2024-004', descripción: 'Cambio de aceite y filtros', estado: 'creada', prioridad: 'baja', fechaCreación: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), fechaLímite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), asignadoA: 'Pedro Martínez', tipo: 'Preventivo', activo: 'Camión 02', costoEstimado: 150000, costoReal: 0 },
        { id: '5', número: 'OT-2024-005', descripción: 'Reparación sistema eléctrico', estado: 'en_progreso', prioridad: 'alta', fechaCreación: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), fechaLímite: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), asignadoA: 'Ana Silva', tipo: 'Correctivo', activo: 'Camión 04', costoEstimado: 1200000, costoReal: 0 },
        { id: '6', número: 'OT-2024-006', descripción: 'Inspección de frenos', estado: 'cancelada', prioridad: 'media', fechaCreación: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), fechaLímite: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), asignadoA: 'Roberto Díaz', tipo: 'Preventivo', activo: 'Camión 06', costoEstimado: 300000, costoReal: 0 }
    ]);

    const [notificaciones, setNotificaciones] = useState<Notificación[]>([
        { id: '1', título: 'Nueva Alerta Crítica', mensaje: 'Temperatura motor excede límites', tipo: 'alerta', fecha: new Date(Date.now() - 30 * 60 * 1000), leída: false, icono: '🚨' },
        { id: '2', título: 'Mantenimiento Completado', mensaje: 'OT-2024-001 finalizada exitosamente', tipo: 'éxito', fecha: new Date(Date.now() - 2 * 60 * 60 * 1000), leída: false, icono: '✅' },
        { id: '3', título: 'Recordatorio Programación', mensaje: 'Camión 03 requiere mantenimiento en 5 días', tipo: 'recordatorio', fecha: new Date(Date.now() - 5 * 60 * 60 * 1000), leída: true, icono: '📅' },
        { id: '4', título: 'Actualización Sistema', mensaje: 'Nueva versión disponible (v2.3.1)', tipo: 'info', fecha: new Date(Date.now() - 24 * 60 * 60 * 1000), leída: true, icono: '🔄' }
    ]);

    // ==================== EFECTOS (useEffect) ====================
    useEffect(() => {
        const inicializarDashboard = async () => {
            setCargando(true);

            try {
                // Obtener usuario actual
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    setDatosUsuario({
                        id: user.id,
                        email: user.email || '',
                        nombre: user.user_metadata?.nombre || 'Usuario',
                        rol: user.user_metadata?.rol || 'Administrador'
                    });
                }

                // Cargar empresas disponibles (simulación)
                const empresasMock: Empresa[] = [
                    { id: 'emp_001', nombre: 'Transportes del Norte S.A.', activo: true },
                    { id: 'emp_002', nombre: 'Logística Sur Limitada', activo: true },
                    { id: 'emp_003', nombre: 'Distribución Central', activo: false }
                ];

                setEmpresasDisponibles(empresasMock);

                // Verificar si hay empresa en sesión
                const empresaId = sessionStorage.getItem('empresa_id');
                const empresaNombre = sessionStorage.getItem('empresa_nombre');

                if (empresaId && empresaNombre) {
                    setEmpresaActual({ id: empresaId, nombre: empresaNombre, activo: true });
                    cargarDatosEmpresa(empresaId);
                } else if (empresasMock.length > 0) {
                    // Mostrar selector si hay empresas pero ninguna seleccionada
                    setMostrarSelectorEmpresa(true);
                }

            } catch (error) {
                console.error('Error inicializando dashboard:', error);
            } finally {
                setTimeout(() => setCargando(false), 1000);
            }
        };

        inicializarDashboard();
    }, []);

    useEffect(() => {
        generarEfectosVisuales();
    }, [efectosHabilitados, intensidadEfectos]);

    // ==================== FUNCIONES AUXILIARES ====================
    const cargarDatosEmpresa = (empresaId: string) => {
        console.log(`Cargando datos para empresa: ${empresaId}`);
        // Simular carga de datos específicos de la empresa
        setTimeout(() => {
            // Actualizar métricas según empresa
            const nuevasMétricas = [...métricasVivas].map(métrica => ({
                ...métrica,
                valor: métrica.valor + Math.floor(Math.random() * 5) - 2
            }));
            setMétricasVivas(nuevasMétricas);
        }, 500);
    };

    const generarEfectosVisuales = () => {
        if (!efectosHabilitados) {
            setEfectosBrillo([]);
            setPartículas([]);
            setChispas([]);
            return;
        }

        // Generar efectos de brillo
        const nuevosBrillos = Array.from({ length: 5 }, (_, i) => ({
            id: `brillo-${i}`,
            x: Math.random() * 100,
            y: Math.random() * 100,
            radio: 50 + Math.random() * 100,
            intensidad: 0.1 + Math.random() * 0.2,
            color: `rgba(${100 + Math.random() * 155}, ${150 + Math.random() * 105}, 255, 0.3)`
        }));

        // Generar partículas
        const nuevasPartículas = Array.from({ length: 20 * intensidadEfectos }, (_, i) => ({
            id: `partícula-${i}`,
            x: Math.random() * 100,
            y: Math.random() * 100,
            tamaño: 1 + Math.random() * 3,
            color: `rgba(${34 + Math.random() * 50}, ${211 + Math.random() * 44}, 238, 0.7)`,
            velocidad: 0.1 + Math.random() * 0.3,
            vida: 100 + Math.random() * 50
        }));

        // Generar chispas
        const nuevasChispas = Array.from({ length: 5 * intensidadEfectos }, (_, i) => ({
            id: `chispa-${i}`,
            x: Math.random() * 100,
            y: Math.random() * 100,
            tamaño: 2 + Math.random() * 4,
            color: `rgba(255, ${200 + Math.random() * 55}, 100, 0.9)`,
            opacidad: 0.5 + Math.random() * 0.5
        }));

        setEfectosBrillo(nuevosBrillos);
        setPartículas(nuevasPartículas);
        setChispas(nuevasChispas);
    };

    useEffect(() => {
        if (!efectosHabilitados) return;

        const animar = () => {
            // Animar partículas
            setPartículas(prev => prev.map(p => ({
                ...p,
                x: (p.x + p.velocidad) % 100,
                y: (p.y + p.velocidad * 0.5) % 100,
                vida: p.vida - 1,
                tamaño: p.vida > 50 ? p.tamaño : p.tamaño * (p.vida / 50)
            })).filter(p => p.vida > 0));

            // Añadir nuevas partículas si es necesario
            if (partículas.length < 20 * intensidadEfectos) {
                setPartículas(prev => [...prev, {
                    id: `partícula-${Date.now()}`,
                    x: 0,
                    y: Math.random() * 100,
                    tamaño: 1 + Math.random() * 3,
                    color: `rgba(${34 + Math.random() * 50}, ${211 + Math.random() * 44}, 238, 0.7)`,
                    velocidad: 0.1 + Math.random() * 0.3,
                    vida: 100 + Math.random() * 50
                }]);
            }

            // Animar brillos
            setEfectosBrillo(prev => prev.map(b => ({
                ...b,
                intensidad: b.intensidad + Math.sin(Date.now() * b.velocidadPulso) * 0.08,
                radio: b.radio + Math.sin(Date.now() * b.velocidadPulso * 0.5) * 3
            })));

            referenciaAnimación.current = requestAnimationFrame(animar);
        };

        referenciaAnimación.current = requestAnimationFrame(animar);

        return () => {
            if (referenciaAnimación.current) {
                cancelAnimationFrame(referenciaAnimación.current);
            }
        };
    }, [generarEfectosVisuales, efectosHabilitados]);

    // ==================== FUNCIONES DEL DASHBOARD ====================
    const manejarSeleccionarEmpresa = (empresa: any) => {
        sessionStorage.setItem('empresa_id', empresa.id);
        sessionStorage.setItem('empresa_nombre', empresa.nombre);
        setEmpresaActual(empresa);
        setMostrarSelectorEmpresa(false);
        cargarDatosEmpresa(empresa.id);
    };

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
            tarea.id === tareaId
                ? { ...tarea, progreso: tarea.progreso === 100 ? 0 : 100 }
                : tarea
        ));
    };

    const resolverAlerta = (alertaId: string) => {
        setAlertas(prev => prev.map(alerta =>
            alerta.id === alertaId ? { ...alerta, resuelta: true } : alerta
        ));
    };

    const crearNuevaOrden = () => {
        const nuevaOrden: OrdenTrabajo = {
            id: (órdenesTrabajo.length + 1).toString(),
            número: `OT-2024-00${órdenesTrabajo.length + 1}`,
            descripción: 'Nueva orden de trabajo',
            estado: 'creada',
            prioridad: 'media',
            fechaCreación: new Date(),
            fechaLímite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            asignadoA: datosUsuario?.nombre || 'Sin asignar',
            tipo: 'Preventivo',
            activo: 'Nuevo Activo',
            costoEstimado: 0,
            costoReal: 0
        };

        setÓrdenesTrabajo(prev => [nuevaOrden, ...prev]);
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

    const alternarModoOscuro = () => {
        setModoOscuro(!modoOscuro);
    };

    const alternarEfectos = () => {
        setEfectosHabilitados(!efectosHabilitados);
    };

    const manejarIntensidadEfectos = (nuevaIntensidad: number) => {
        setIntensidadEfectos(nuevaIntensidad);
        generarEfectosVisuales();
    };

    const marcarNotificacionesLeídas = () => {
        setNotificaciones(prev => prev.map(n => ({ ...n, leída: true })));
    };

    const eliminarNotificación = (id: string) => {
        setNotificaciones(prev => prev.filter(n => n.id !== id));
    };

    const agregarNuevaAlerta = () => {
        const nuevaAlerta: Alerta = {
            id: (alertas.length + 1).toString(),
            título: 'Prueba de alerta',
            severidad: 'advertencia',
            activo: 'Camión de Prueba',
            fecha: new Date(),
            resuelta: false,
            descripción: 'Esta es una alerta de prueba generada por el sistema',
            acciónRequerida: 'Verificar sistema'
        };
        setAlertas(prev => [nuevaAlerta, ...prev]);
    };

    const calcularEstadísticas = () => {
        const totalVehículos = activos.length;
        const vehículosSaludables = activos.filter(a => a.estado === 'saludable').length;
        const alertasActivas = alertas.filter(a => !a.resuelta).length;
        const tareasPendientes = tareasUrgentes.filter(t => t.progreso < 100).length;
        const órdenesActivas = órdenesTrabajo.filter(o => o.estado === 'en_progreso' || o.estado === 'asignada').length;

        return {
            totalVehículos,
            vehículosSaludables,
            porcentajeSalud: totalVehículos > 0 ? (vehículosSaludables / totalVehículos) * 100 : 0,
            alertasActivas,
            tareasPendientes,
            órdenesActivas
        };
    };

    // ==================== COMPONENTES MODULARES ====================

    const BarraLateral = () => {
        const secciones = [
            {
                id: 'dashboard',
                icono: '🏠',
                etiqueta: 'Dashboard Principal',
                descripción: 'Vista general del sistema'
            },
            {
                id: 'activos',
                icono: '🚚',
                etiqueta: 'Gestión de Activos',
                descripción: 'Vehículos y equipos'
            },
            {
                id: 'ordenes',
                icono: '📋',
                etiqueta: 'Órdenes de Trabajo',
                descripción: 'Crear y gestionar OT'
            },
            {
                id: 'mantenimiento',
                icono: '🔧',
                etiqueta: 'Plan Mantenimiento',
                descripción: 'Programación preventiva'
            },
            {
                id: 'inventario',
                icono: '📦',
                etiqueta: 'Inventario',
                descripción: 'Repuestos y materiales'
            },
            {
                id: 'personal',
                icono: '👥',
                etiqueta: 'Personal',
                descripción: 'Equipo de trabajo'
            },
            {
                id: 'reportes',
                icono: '📊',
                etiqueta: 'Reportes',
                descripción: 'Análisis y estadísticas'
            },
            {
                id: 'configuracion',
                icono: '⚙️',
                etiqueta: 'Configuración',
                descripción: 'Ajustes del sistema'
            },
        ];

        return (
            <aside className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-[#0a0e2a] to-[#1a1b3a] border-r border-cyan-500/20 z-20 transition-all duration-500 ${barraLateralContraída ? 'w-20' : 'w-64'} shadow-xl`}>
                <div className="h-full flex flex-col">
                    {/* Logo y toggle */}
                    <div className={`p-4 border-b border-cyan-500/10 flex items-center ${barraLateralContraída ? 'justify-center' : 'justify-between'} bg-slate-900/50`}>
                        {!barraLateralContraída && (
                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setSecciónActiva('dashboard')}>
                                <div className="relative">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full opacity-20 group-hover:opacity-30 transition-opacity" />
                                    <div className="relative h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-[#0066ff] flex items-center justify-center text-white font-bold shadow-md shadow-cyan-500/30">
                                        <span className="text-sm">F</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-lg font-bold text-white">
                                        Fleet<span className="text-cyan-400">Vision</span>
                                    </span>
                                    <p className="text-[10px] text-slate-400">Gestión de Flotas</p>
                                </div>
                            </div>
                        )}
                        {barraLateralContraída && (
                            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-[#0066ff] flex items-center justify-center text-white font-bold shadow-md shadow-cyan-500/30">
                                <span className="text-sm">F</span>
                            </div>
                        )}
                        <button
                            onClick={() => setBarraLateralContraída(!barraLateralContraída)}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                            title={barraLateralContraída ? "Expandir barra lateral" : "Contraer barra lateral"}
                        >
                            <svg className={`w-5 h-5 text-cyan-400 transition-transform ${barraLateralContraída ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={barraLateralContraída ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
                            </svg>
                        </button>
                    </div>

                    {/* Navegación principal */}
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
                                {/* Efecto de fondo animado */}
                                {secciónActiva === sección.id && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 animate-pulse" />
                                )}

                                <span className="text-lg z-10">{sección.icono}</span>
                                {!barraLateralContraída && (
                                    <div className="z-10 text-left">
                                        <span className="font-medium text-sm block">{sección.etiqueta}</span>
                                        <span className="text-xs text-slate-400">{sección.descripción}</span>
                                    </div>
                                )}

                                {/* Indicador de selección */}
                                {secciónActiva === sección.id && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                                )}

                                {/* Efecto hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </nav>

                    {/* Estado del sistema */}
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
                                    <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-500 opacity-20 animate-ping" />
                                </div>
                                <div className="text-xs text-cyan-400 font-bold">98%</div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        );
    };

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

        const obtenerColorClase = () => {
            switch (métrica.color) {
                case 'emerald': return 'emerald';
                case 'cyan': return 'cyan';
                case 'amber': return 'amber';
                case 'green': return 'green';
                case 'blue': return 'blue';
                case 'red': return 'red';
                default: return 'cyan';
            }
        };

        const colorClase = obtenerColorClase();

        return (
            <div className={`relative group rounded-2xl border border-${colorClase}-500/20 bg-gradient-to-br from-${colorClase}-500/10 to-transparent p-6 backdrop-blur-sm hover:border-${colorClase}-500/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-${colorClase}-500/10`}>
                {/* Efecto de brillo */}
                <div className={`absolute inset-0 bg-gradient-to-br from-${colorClase}-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Animación de pulso */}
                {métrica.animación === 'pulso' && (
                    <div className={`absolute -inset-1 bg-gradient-to-r from-${colorClase}-500/20 to-transparent rounded-2xl animate-pulse`} />
                )}

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
                        <div className={`h-12 w-12 rounded-xl bg-${colorClase}-500/20 flex items-center justify-center text-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
                            {métrica.icono}
                        </div>
                    </div>

                    {/* Barra de progreso animada */}
                    <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                            <span>Puntaje de Salud</span>
                            <span className={obtenerColorSalud(métrica.salud)}>{métrica.salud}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r from-${colorClase}-500 to-${colorClase}-300 rounded-full transition-all duration-1000`}
                                style={{ width: `${métrica.salud}%` }}
                            />
                        </div>
                    </div>

                    {/* Meta vs Actual */}
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

    // ==================== DIAGRAMA TORTA COMPLETAMENTE SEGURO ====================
    const DiagramaTortaComponente = ({ diagrama }: { diagrama: DiagramaTorta }) => {
        const radio = 80;
        const centroX = 100;
        const centroY = 100;
        let ánguloInicio = 0;

        // ==================== VALIDACIONES CRÍTICAS ====================
        // Validar que haya datos para renderizar
        const datosVálidos = diagrama?.datos && Array.isArray(diagrama.datos) && diagrama.datos.length > 0;
        const totalVálido = diagrama?.total && diagrama.total > 0;
        const segmentosVálidos = datosVálidos && diagrama.datos.every(segmento =>
            typeof segmento.valor === 'number' && segmento.valor >= 0
        );

        // No renderizar si no hay datos válidos
        if (!datosVálidos || !totalVálido || !segmentosVálidos) {
            return (
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 rounded-2xl border border-cyan-500/20 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-4">{diagrama?.título || 'Gráfico'}</h3>
                    {diagrama?.descripción && (
                        <p className="text-sm text-slate-400 mb-4">{diagrama.descripción}</p>
                    )}
                    <div className="relative h-64 flex flex-col items-center justify-center">
                        <div className="text-4xl mb-2 text-slate-600">📊</div>
                        <p className="text-slate-500 text-center mb-1">No hay datos disponibles</p>
                        <p className="text-xs text-slate-600">Agrega datos para visualizar el gráfico</p>
                    </div>
                </div>
            );
        }

        // Calcular porcentajes y validar valores
        const datosProcesados = diagrama.datos.map(segmento => {
            const porcentaje = segmento.valor / diagrama.total;
            // Validar que el porcentaje sea un número finito
            const porcentajeVálido = Number.isFinite(porcentaje) ? porcentaje : 0;
            return {
                ...segmento,
                porcentaje: porcentajeVálido,
                ángulo: porcentajeVálido * 360
            };
        });

        // Validar que la suma de porcentajes sea razonable (entre 99% y 101%)
        const sumaPorcentajes = datosProcesados.reduce((sum, segmento) => sum + segmento.porcentaje, 0);
        const porcentajesVálidos = sumaPorcentajes >= 0.99 && sumaPorcentajes <= 1.01;

        if (!porcentajesVálidos) {
            return (
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 rounded-2xl border border-cyan-500/20 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-4">{diagrama.título}</h3>
                    <div className="relative h-64 flex flex-col items-center justify-center">
                        <div className="text-4xl mb-2 text-amber-500">⚠️</div>
                        <p className="text-amber-400 text-center mb-1">Datos inconsistentes</p>
                        <p className="text-xs text-slate-500 text-center">
                            Los porcentajes no suman 100% ({Math.round(sumaPorcentajes * 100)}%)
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 rounded-2xl border border-cyan-500/20 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">{diagrama.título}</h3>
                {diagrama.descripción && (
                    <p className="text-sm text-slate-400 mb-4">{diagrama.descripción}</p>
                )}
                <div className="relative h-64">
                    <svg width="100%" height="100%" viewBox="0 0 200 200" className="transform -rotate-90">
                        {datosProcesados.map((segmento, índice) => {
                            const ánguloFin = ánguloInicio + segmento.ángulo;
                            const radioGrande = radio;
                            const radioPequeño = radio - 20;

                            // Validar ángulos para evitar NaN
                            const ánguloInicioRad = (ánguloInicio * Math.PI) / 180;
                            const ánguloFinRad = (ánguloFin * Math.PI) / 180;

                            // Calcular puntos del arco con validación
                            const calcularPunto = (radioCalc: number, ánguloRad: number) => {
                                const x = centroX + radioCalc * Math.cos(ánguloRad);
                                const y = centroY + radioCalc * Math.sin(ánguloRad);
                                return { x: Number.isFinite(x) ? x : centroX, y: Number.isFinite(y) ? y : centroY };
                            };

                            const puntoInicioGrande = calcularPunto(radioGrande, ánguloInicioRad);
                            const puntoFinGrande = calcularPunto(radioGrande, ánguloFinRad);
                            const puntoInicioPequeño = calcularPunto(radioPequeño, ánguloInicioRad);
                            const puntoFinPequeño = calcularPunto(radioPequeño, ánguloFinRad);

                            const granArco = segmento.ángulo > 180 ? 1 : 0;

                            // Construir el path con validación adicional
                            const pathData = `
                                M ${puntoInicioGrande.x} ${puntoInicioGrande.y}
                                A ${radioGrande} ${radioGrande} 0 ${granArco} 1 ${puntoFinGrande.x} ${puntoFinGrande.y}
                                L ${puntoFinPequeño.x} ${puntoFinPequeño.y}
                                A ${radioPequeño} ${radioPequeño} 0 ${granArco} 0 ${puntoInicioPequeño.x} ${puntoInicioPequeño.y}
                                Z
                            `;

                            const segmentoElement = (
                                <g key={índice} className="group cursor-pointer">
                                    <path
                                        d={pathData}
                                        fill={segmento.color}
                                        className="transition-all duration-300 group-hover:opacity-80 group-hover:scale-105"
                                        transform-origin="100 100"
                                    />
                                    {segmento.valor > 0 && segmento.porcentaje > 0.05 && (
                                        <text
                                            x={centroX + (radio - 10) * Math.cos((ánguloInicio + segmento.ángulo / 2) * Math.PI / 180)}
                                            y={centroY + (radio - 10) * Math.sin((ánguloInicio + segmento.ángulo / 2) * Math.PI / 180)}
                                            textAnchor="middle"
                                            fill="white"
                                            fontSize="10"
                                            transform={`rotate(90 ${centroX + (radio - 10) * Math.cos((ánguloInicio + segmento.ángulo / 2) * Math.PI / 180)} ${centroY + (radio - 10) * Math.sin((ánguloInicio + segmento.ángulo / 2) * Math.PI / 180)})`}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            {segmento.valor}
                                        </text>
                                    )}
                                </g>
                            );

                            ánguloInicio = ánguloFin;
                            return segmentoElement;
                        })}
                    </svg>

                    {/* Centro del diagrama */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <div className="text-2xl font-bold text-white">{diagrama.total}</div>
                        <div className="text-xs text-slate-400">Total</div>
                    </div>
                </div>

                {/* Leyenda */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                    {datosProcesados.map((segmento, índice) => (
                        <div key={índice} className="flex items-center gap-2">
                            <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: segmento.color }}
                            />
                            <div className="flex-1">
                                <div className="text-xs text-slate-300">{segmento.etiqueta}</div>
                                <div className="text-xs text-slate-500">
                                    {segmento.valor} ({Number.isFinite(segmento.porcentaje) ? (segmento.porcentaje * 100).toFixed(1) : '0.0'}%)
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

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
            <div className="group relative rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/50 to-slate-950/50 p-4 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/5">
                {/* Efecto de resplandor al pasar el mouse */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-white mb-1 group-hover:text-cyan-100 transition-colors">{tarea.título}</h4>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerColorPrioridad(tarea.prioridad)}`}>
                                    {tarea.prioridad.toUpperCase()}
                                </span>
                                <span className="text-xs text-slate-400">@{tarea.asignadoA}</span>
                                <span className="text-xs text-slate-500">• {tarea.tipo}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => alternarCompletarTarea(tarea.id)}
                            className={`p-2 rounded-lg transition-all duration-300 ${tarea.progreso === 100
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 hover:scale-110'
                                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700/70 hover:scale-110'
                                }`}
                            title={tarea.progreso === 100 ? "Marcar como pendiente" : "Marcar como completada"}
                        >
                            {tarea.progreso === 100 ? '✅' : '⬜'}
                        </button>
                    </div>

                    {/* Barra de progreso interactiva */}
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
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden group">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000 group-hover:shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                style={{ width: `${tarea.progreso}%` }}
                            />
                        </div>
                    </div>

                    {/* Acciones rápidas */}
                    <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-1.5">
                            <button
                                className="p-1.5 rounded hover:bg-white/10 transition-colors hover:scale-110"
                                title="Asignar a otro"
                            >
                                <span className="text-xs">👤</span>
                            </button>
                            <button
                                className="p-1.5 rounded hover:bg-white/10 transition-colors hover:scale-110"
                                title="Posponer"
                            >
                                <span className="text-xs">📅</span>
                            </button>
                            <button
                                className="p-1.5 rounded hover:bg-white/10 transition-colors hover:scale-110"
                                title="Ver detalles"
                            >
                                <span className="text-xs">👁️</span>
                            </button>
                        </div>
                        <span className="text-xs text-slate-500">
                            Vence: {tarea.fechaLímite.toLocaleDateString('es-CL')}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const TarjetaAlerta = ({ alerta }: { alerta: Alerta }) => (
        <div className={`relative rounded-xl border ${alerta.severidad === 'crítica'
            ? 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10'
            : alerta.severidad === 'advertencia'
                ? 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10'
                : 'border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10'
            } p-4 backdrop-blur-sm transition-all duration-300 ${!alerta.resuelta && 'animate-pulse hover:animate-none'}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`h-2 w-2 rounded-full ${alerta.severidad === 'crítica'
                            ? 'bg-red-500'
                            : alerta.severidad === 'advertencia'
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                            }`} />
                        <h4 className="text-sm font-medium text-white">{alerta.título}</h4>
                    </div>
                    <p className="text-xs text-slate-400 mb-1">Activo: {alerta.activo}</p>
                    <p className="text-xs text-slate-500 mb-2">{alerta.descripción}</p>
                    {alerta.acciónRequerida && (
                        <p className="text-xs text-amber-400 mb-1">📋 {alerta.acciónRequerida}</p>
                    )}
                    <p className="text-xs text-slate-500">
                        {alerta.fecha.toLocaleDateString('es-CL')} {alerta.fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                {!alerta.resuelta && (
                    <button
                        onClick={() => resolverAlerta(alerta.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 hover:scale-105 transition-all"
                    >
                        Resolver
                    </button>
                )}
                {alerta.resuelta && (
                    <span className="px-2 py-1 rounded text-xs bg-emerald-500/20 text-emerald-400">
                        ✅ Resuelta
                    </span>
                )}
            </div>
        </div>
    );

    const TarjetaActivo = ({ activo }: { activo: Activo }) => {
        const obtenerColorEstado = (estado: string) => {
            switch (estado) {
                case 'saludable': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                case 'advertencia': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
                case 'crítico': return 'bg-red-500/20 text-red-400 border-red-500/30';
                default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            }
        };

        const díasHastaMantenimiento = Math.ceil(
            (activo.próximoMantenimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        return (
            <div className="group relative rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/50 to-slate-950/50 p-4 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h4 className="text-sm font-medium text-white mb-1">{activo.nombre}</h4>
                        <p className="text-xs text-slate-400 mb-1">{activo.modelo}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerColorEstado(activo.estado)}`}>
                                {activo.estado.toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-400">{activo.ubicación}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold text-cyan-400">{activo.tiempoActivo}%</div>
                        <div className="text-xs text-slate-400">Tiempo Activo</div>
                    </div>
                </div>

                <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Patente</span>
                        <span className="text-xs font-mono text-white">{activo.patente}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Kilometraje</span>
                        <span className="text-xs text-white">{activo.kilometraje?.toLocaleString()} km</span>
                    </div>
                    {activo.alertasActivas && activo.alertasActivas > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">Alertas Activas</span>
                            <span className="text-xs text-red-400">{activo.alertasActivas}</span>
                        </div>
                    )}
                </div>

                <div className="pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-slate-400">Próximo Mantenimiento</div>
                            <div className={`text-sm ${díasHastaMantenimiento <= 7 ? 'text-red-400' : díasHastaMantenimiento <= 14 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {díasHastaMantenimiento <= 0
                                    ? 'VENCIDO'
                                    : `${díasHastaMantenimiento} días`}
                            </div>
                        </div>
                        <button className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/30 transition-colors">
                            Programar
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const ListaÓrdenesTrabajo = () => (
        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-lg">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">📋 Órdenes de Trabajo</h3>
                    <p className="text-sm text-cyan-400">Gestión de mantenimiento</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={crearNuevaOrden}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        <span>+</span>
                        <span>Nueva OT</span>
                    </button>
                    <button className="px-3 py-2 rounded-xl bg-white/5 text-slate-300 text-sm hover:bg-white/10 transition-colors">
                        🔍 Filtrar
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
                            <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {órdenesTrabajo.map((orden) => {
                            const díasRestantes = Math.ceil((orden.fechaLímite.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                            return (
                                <tr key={orden.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                    <td className="py-3 px-4">
                                        <div className="font-mono text-sm text-cyan-400 font-bold">{orden.número}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="text-sm text-white">{orden.descripción}</div>
                                        <div className="text-xs text-slate-500">{orden.activo}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerColorEstado(orden.estado)}`}>
                                            {obtenerTextoEstado(orden.estado)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${orden.prioridad === 'alta'
                                            ? 'bg-red-500/20 text-red-400'
                                            : orden.prioridad === 'media'
                                                ? 'bg-amber-500/20 text-amber-400'
                                                : 'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {orden.prioridad.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="text-sm text-white">{orden.asignadoA}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="text-sm text-white">{orden.fechaLímite.toLocaleDateString('es-CL')}</div>
                                        <div className={`text-xs ${díasRestantes <= 2 ? 'text-red-400' : díasRestantes <= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                            {díasRestantes > 0 ? `${díasRestantes} días` : 'Vencida'}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Ver detalles">
                                                👁️
                                            </button>
                                            <button className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Editar">
                                                ✏️
                                            </button>
                                            <button className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Completar">
                                                ✅
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const PanelNotificaciones = () => (
        <div className="absolute right-4 top-full mt-2 w-80 bg-slate-900 border border-cyan-500/20 rounded-xl shadow-2xl z-50">
            <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">🔔 Notificaciones</h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={marcarNotificacionesLeídas}
                            className="text-xs text-cyan-400 hover:text-cyan-300"
                        >
                            Marcar todas como leídas
                        </button>
                        <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full">
                            {notificaciones.filter(n => !n.leída).length}
                        </span>
                    </div>
                </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notificaciones.length > 0 ? (
                    notificaciones.map((notificación) => (
                        <div
                            key={notificación.id}
                            className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${!notificación.leída ? 'bg-cyan-500/5' : ''}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`text-lg ${notificación.tipo === 'alerta' ? 'text-red-400' : notificación.tipo === 'éxito' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                                    {notificación.icono}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className={`text-sm font-medium ${!notificación.leída ? 'text-white' : 'text-slate-300'}`}>
                                            {notificación.título}
                                        </h4>
                                        <button
                                            onClick={() => eliminarNotificación(notificación.id)}
                                            className="text-slate-400 hover:text-red-400 text-xs"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">{notificación.mensaje}</p>
                                    <p className="text-xs text-slate-500 mt-2">
                                        {notificación.fecha.toLocaleDateString('es-CL')} {notificación.fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                {!notificación.leída && (
                                    <div className="h-2 w-2 rounded-full bg-cyan-500" />
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center">
                        <div className="text-3xl mb-2">🔕</div>
                        <p className="text-slate-400">No hay notificaciones</p>
                        <p className="text-sm text-slate-500 mt-1">Todo está bajo control</p>
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-white/10">
                <button className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors text-sm">
                    Ver todas las notificaciones
                </button>
            </div>
        </div>
    );

    const SelectorEmpresaModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-xl bg-slate-900 border border-cyan-500/30 overflow-hidden animate-fadeIn">
                <div className="relative z-10 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white">
                                Seleccionar Empresa
                            </h3>
                            <p className="text-slate-400 text-xs mt-1">
                                Tienes acceso a múltiples empresas
                            </p>
                        </div>
                        <div className="h-8 w-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                            <span className="text-cyan-400 font-bold">{empresasDisponibles.length}</span>
                        </div>
                    </div>

                    <div className="mb-5 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                        <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-cyan-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-xs text-cyan-300">
                                    Selecciona la empresa con la que deseas trabajar en esta sesión.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {empresasDisponibles.map((empresa) => (
                            <button
                                key={empresa.id}
                                onClick={() => manejarSeleccionarEmpresa(empresa)}
                                className="w-full p-3 rounded-lg bg-gradient-to-br from-white/5 to-white/2 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 text-left group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-white text-sm">{empresa.nombre}</h4>
                                        <p className="text-xs text-slate-400 mt-1">ID: {empresa.id?.substring(0, 8) || 'N/A'}...</p>
                                    </div>
                                    <div className={`h-2.5 w-2.5 rounded-full ${empresa.activo ? 'bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10">
                        <button
                            onClick={manejarCerrarSesión}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:bg-white/5 hover:text-white transition-colors text-sm"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // ==================== COMPONENTES DE SECCIONES ====================

    const DashboardPrincipal = () => {
        const estadísticas = calcularEstadísticas();

        // Datos seguros para gráficos con validación
        const datosÓrdenesPorEstado = [
            { etiqueta: 'Completadas', valor: 2, color: '#10b981' },
            { etiqueta: 'En Progreso', valor: 2, color: '#3b82f6' },
            { etiqueta: 'Asignadas', valor: 1, color: '#8b5cf6' },
            { etiqueta: 'Creadas', valor: 1, color: '#f59e0b' },
            { etiqueta: 'Canceladas', valor: 1, color: '#ef4444' }
        ].filter(item => item.valor > 0);

        const datosÓrdenesPorTipo = [
            { etiqueta: 'Preventivo', valor: 4, color: '#3b82f6' },
            { etiqueta: 'Correctivo', valor: 3, color: '#ef4444' }
        ].filter(item => item.valor > 0);

        const datosEstadoActivos = [
            { etiqueta: 'Saludable', valor: activos.filter(a => a.estado === 'saludable').length, color: '#10b981' },
            { etiqueta: 'Advertencia', valor: activos.filter(a => a.estado === 'advertencia').length, color: '#f59e0b' },
            { etiqueta: 'Crítico', valor: activos.filter(a => a.estado === 'crítico').length, color: '#ef4444' }
        ].filter(item => item.valor > 0);

        return (
            <>
                {/* Tarjetas de métricas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {métricasVivas.map((métrica) => (
                        <TarjetaMétrica key={métrica.id} métrica={métrica} />
                    ))}
                </div>

                {/* SECCIÓN PRINCIPAL CON DIAGRAMAS - CON VALIDACIÓN */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <DiagramaTortaComponente diagrama={{
                        título: 'Órdenes por Estado',
                        datos: datosÓrdenesPorEstado,
                        total: datosÓrdenesPorEstado.reduce((sum, item) => sum + item.valor, 0) || 1
                    }} />

                    <DiagramaTortaComponente diagrama={{
                        título: 'Órdenes por Tipo',
                        datos: datosÓrdenesPorTipo,
                        total: datosÓrdenesPorTipo.reduce((sum, item) => sum + item.valor, 0) || 1
                    }} />

                    <DiagramaTortaComponente diagrama={{
                        título: 'Estado de Activos',
                        datos: datosEstadoActivos,
                        total: datosEstadoActivos.reduce((sum, item) => sum + item.valor, 0) || 1
                    }} />
                </div>

                {/* SECCIÓN INFERIOR */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columna izquierda - Tareas urgentes */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Lista de órdenes de trabajo */}
                        <ListaÓrdenesTrabajo />

                        {/* Tareas urgentes */}
                        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-lg">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">⚡ Tareas Urgentes</h3>
                                    <p className="text-sm text-cyan-400">Requieren atención inmediata</p>
                                </div>
                                <div className="h-8 w-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                    <span className="text-cyan-400 font-bold">{tareasUrgentes.filter(t => t.progreso < 100).length}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {tareasUrgentes.length > 0 ? (
                                    tareasUrgentes.map((tarea) => (
                                        <TarjetaTarea key={tarea.id} tarea={tarea} />
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        <div className="text-3xl mb-2">🎉</div>
                                        <p>No hay tareas urgentes</p>
                                        <p className="text-sm">¡Todo está bajo control!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Columna derecha */}
                    <div className="space-y-6">
                        {/* Alertas críticas */}
                        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-lg">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">🚨 Alertas Críticas</h3>
                                    <p className="text-sm text-red-400">Atención inmediata requerida</p>
                                </div>
                                <div className="h-8 w-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                                    <span className="text-red-400 font-bold">{alertas.filter(a => !a.resuelta).length}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {alertas.filter(a => !a.resuelta).length > 0 ? (
                                    alertas.filter(a => !a.resuelta).map((alerta) => (
                                        <TarjetaAlerta key={alerta.id} alerta={alerta} />
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-emerald-500/70">
                                        <div className="text-3xl mb-2">✅</div>
                                        <p>No hay alertas activas</p>
                                        <p className="text-sm">Todos los sistemas funcionan correctamente</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Diagrama de costos */}
                        <DiagramaTortaComponente diagrama={{
                            título: 'Distribución de Costos',
                            datos: [
                                { etiqueta: 'Mantenimiento', valor: 45, color: '#3b82f6' },
                                { etiqueta: 'Repuestos', valor: 30, color: '#8b5cf6' },
                                { etiqueta: 'Mano de Obra', valor: 20, color: '#f59e0b' },
                                { etiqueta: 'Otros', valor: 5, color: '#10b981' }
                            ].filter(item => item.valor > 0),
                            total: 100
                        }} />

                        {/* Información del sistema */}
                        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-lg">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">📊 Estadísticas Rápidas</h3>
                                <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                    <span className="text-slate-400 text-sm">Vehículos Totales</span>
                                    <span className="text-white font-medium">{estadísticas.totalVehículos}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                    <span className="text-slate-400 text-sm">Vehículos Saludables</span>
                                    <span className="text-emerald-400 font-medium">{estadísticas.vehículosSaludables}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                    <span className="text-slate-400 text-sm">Alertas Activas</span>
                                    <span className="text-red-400 font-medium">{estadísticas.alertasActivas}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                    <span className="text-slate-400 text-sm">Tareas Pendientes</span>
                                    <span className="text-amber-400 font-medium">{estadísticas.tareasPendientes}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    const GestiónActivos = () => (
        <div className="space-y-6">
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-lg">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">🚚 Gestión de Activos</h3>
                        <p className="text-cyan-400">Vehículos y equipos de la flota</p>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                        <span>+</span>
                        <span>Agregar Activo</span>
                    </button>
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                        <div className="text-2xl font-bold text-emerald-400">{activos.filter(a => a.estado === 'saludable').length}</div>
                        <div className="text-sm text-emerald-300">Saludables</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                        <div className="text-2xl font-bold text-amber-400">{activos.filter(a => a.estado === 'advertencia').length}</div>
                        <div className="text-sm text-amber-300">Advertencia</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20">
                        <div className="text-2xl font-bold text-red-400">{activos.filter(a => a.estado === 'crítico').length}</div>
                        <div className="text-sm text-red-300">Críticos</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20">
                        <div className="text-2xl font-bold text-cyan-400">{activos.length}</div>
                        <div className="text-sm text-cyan-300">Total Activos</div>
                    </div>
                </div>

                {/* Grid de activos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activos.length > 0 ? (
                        activos.map((activo) => (
                            <TarjetaActivo key={activo.id} activo={activo} />
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-12">
                            <div className="text-4xl mb-3 text-slate-600">🚚</div>
                            <p className="text-slate-400 text-lg mb-1">No hay activos registrados</p>
                            <p className="text-slate-600 text-sm">Agrega vehículos para comenzar la gestión</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const ÓrdenesTrabajo = () => (
        <div className="space-y-6">
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-lg">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">📋 Órdenes de Trabajo</h3>
                        <p className="text-cyan-400">Gestión completa de mantenimiento</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={crearNuevaOrden}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                            <span>+</span>
                            <span>Nueva OT</span>
                        </button>
                        <button className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-sm hover:bg-white/10 transition-colors">
                            🔍 Filtrar
                        </button>
                        <button className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-sm hover:bg-white/10 transition-colors">
                            📊 Reportes
                        </button>
                    </div>
                </div>
                <ListaÓrdenesTrabajo />
            </div>
        </div>
    );

    const PlanMantenimiento = () => (
        <div className="space-y-6">
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-lg">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">🔧 Plan de Mantenimiento</h3>
                        <p className="text-cyan-400">Programación preventiva de la flota</p>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity">
                        Generar Plan
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white">📅 Calendario de Mantenimiento</h4>
                        <div className="space-y-3">
                            {activos.length > 0 ? (
                                activos.map((activo) => {
                                    const díasHastaMantenimiento = Math.ceil(
                                        (activo.próximoMantenimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                                    );

                                    return (
                                        <div key={activo.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-white font-medium">{activo.nombre}</span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${díasHastaMantenimiento <= 7
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : díasHastaMantenimiento <= 14
                                                        ? 'bg-amber-500/20 text-amber-400'
                                                        : 'bg-emerald-500/20 text-emerald-400'
                                                    }`}>
                                                    {díasHastaMantenimiento <= 0
                                                        ? 'VENCIDO'
                                                        : `${díasHastaMantenimiento} días`}
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-400">
                                                {activo.próximoMantenimiento.toLocaleDateString('es-CL', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <div className="text-2xl mb-2">📅</div>
                                    <p>No hay activos programados</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold text-white mb-4">📈 Estadísticas</h4>
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                                <div className="text-3xl font-bold text-white mb-2">98.7%</div>
                                <div className="text-sm text-cyan-400">Disponibilidad Flota</div>
                            </div>
                            <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-green-500/10">
                                <div className="text-3xl font-bold text-white mb-2">94%</div>
                                <div className="text-sm text-emerald-400">Mantenimientos a Tiempo</div>
                            </div>
                            <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                                <div className="text-3xl font-bold text-white mb-2">86%</div>
                                <div className="text-sm text-amber-400">Cumplimiento Programación</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const Inventario = () => (
        <div className="space-y-6">
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-lg">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">📦 Inventario</h3>
                        <p className="text-cyan-400">Repuestos y materiales disponibles</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity">
                            + Agregar Repuesto
                        </button>
                        <button className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-sm hover:bg-white/10 transition-colors">
                            📋 Lista de Pedidos
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {['Filtros de Aceite', 'Pastillas de Freno', 'Baterías', 'Neumáticos'].map((categoría, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
                            <div className="text-lg font-bold text-white mb-2">{categoría}</div>
                            <div className="text-sm text-slate-400">Stock: {Math.floor(Math.random() * 50) + 20}</div>
                            <div className="text-xs text-amber-400 mt-1">Mínimo: 10 unidades</div>
                        </div>
                    ))}
                </div>

                <div className="text-center py-8 text-slate-500">
                    <div className="text-4xl mb-2">📊</div>
                    <p>Módulo de inventario en desarrollo</p>
                    <p className="text-sm mt-2">Próximamente: Gestión completa de repuestos y proveedores</p>
                </div>
            </div>
        </div>
    );

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
                            {[
                                'Reporte de Mantenimiento Mensual',
                                'Análisis de Costos por Vehículo',
                                'Eficiencia de Técnicos',
                                'Historial de Fallas',
                                'Cumplimiento de Programación',
                                'Inventario vs Consumo'
                            ].map((reporte, idx) => (
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
                                <div>
                                    <span className="text-white">Modo Oscuro</span>
                                    <p className="text-xs text-slate-400">Activar/desactivar tema oscuro</p>
                                </div>
                                <div
                                    onClick={alternarModoOscuro}
                                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${modoOscuro ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full transform ${modoOscuro ? 'translate-x-6' : ''} transition-transform`} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                <div>
                                    <span className="text-white">Efectos Visuales</span>
                                    <p className="text-xs text-slate-400">Animaciones y partículas</p>
                                </div>
                                <div
                                    onClick={alternarEfectos}
                                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${efectosHabilitados ? 'bg-cyan-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full transform ${efectosHabilitados ? 'translate-x-6' : ''} transition-transform`} />
                                </div>
                            </div>

                            <div className="p-3 rounded-lg bg-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white">Intensidad Efectos</span>
                                    <span className="text-cyan-400 text-sm">{intensidadEfectos.toFixed(1)}x</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="2"
                                    step="0.1"
                                    value={intensidadEfectos}
                                    onChange={(e) => manejarIntensidadEfectos(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500"
                                />
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
                            <button
                                onClick={manejarCerrarSesión}
                                className="w-full px-4 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // ==================== PANTALLA DE CARGA ====================
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

    // ==================== RENDER PRINCIPAL ====================
    return (
        <main className={`relative min-h-screen w-full font-sans overflow-hidden transition-colors duration-500 ${modoOscuro ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* BACKGROUND EFFECTS */}
            {efectosHabilitados && (
                <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                    {/* Gradientes base */}
                    <div className="absolute -top-[10%] -left-[5%] h-[600px] w-[600px] rounded-full bg-gradient-to-r from-cyan-600/20 via-blue-500/15 to-transparent opacity-50" style={{ filter: 'blur(100px)' }} />
                    <div className="absolute top-[20%] right-[0%] h-[500px] w-[500px] rounded-full bg-gradient-to-b from-cyan-500/15 via-blue-400/10 to-transparent opacity-40" style={{ filter: 'blur(90px)' }} />

                    {/* Efectos de brillo */}
                    {efectosBrillo.map((brillo) => (
                        <div
                            key={brillo.id}
                            className="absolute rounded-full"
                            style={{
                                left: `${brillo.x}%`,
                                top: `${brillo.y}%`,
                                width: `${brillo.radio * 2}px`,
                                height: `${brillo.radio * 2}px`,
                                background: `radial-gradient(circle, ${brillo.color} 0%, transparent 70%)`,
                                opacity: brillo.intensidad,
                                filter: `blur(${brillo.radio * 0.5}px)`,
                            }}
                        />
                    ))}

                    {/* Partículas */}
                    {partículas.map((partícula, índice) => (
                        <div
                            key={`partícula-${índice}`}
                            className="absolute rounded-full"
                            style={{
                                left: `${partícula.x}%`,
                                top: `${partícula.y}%`,
                                width: `${partícula.tamaño}px`,
                                height: `${partícula.tamaño}px`,
                                backgroundColor: partícula.color,
                                boxShadow: `0 0 ${partícula.tamaño * 3}px ${partícula.color}`,
                                filter: `blur(${partícula.tamaño * 0.5}px)`,
                                opacity: partícula.vida / 150,
                            }}
                        />
                    ))}

                    {/* Chispas */}
                    {chispas.map((chispa, índice) => (
                        <div
                            key={`chispa-${índice}`}
                            className="absolute rounded-full"
                            style={{
                                left: `${chispa.x}%`,
                                top: `${chispa.y}%`,
                                width: `${chispa.tamaño}px`,
                                height: `${chispa.tamaño}px`,
                                backgroundColor: chispa.color,
                                boxShadow: `0 0 ${chispa.tamaño * 4}px ${chispa.color}`,
                                opacity: chispa.opacidad,
                                filter: `blur(${chispa.tamaño * 0.3}px)`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* BARRA LATERAL */}
            <BarraLateral />

            {/* MODAL SELECTOR EMPRESA */}
            {mostrarSelectorEmpresa && <SelectorEmpresaModal />}

            {/* HEADER */}
            <header className={`relative z-10 border-b border-white/10 transition-all duration-500 ${barraLateralContraída ? 'pl-20' : 'pl-64'} ${modoOscuro ? 'bg-slate-950/80 backdrop-blur-lg' : 'bg-white/80 backdrop-blur-lg border-gray-200'}`}>
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg opacity-20" />
                                <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-[#0066ff] flex items-center justify-center text-white font-bold shadow-md shadow-cyan-500/30">
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
                            {/* Botones de control */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={alternarEfectos}
                                    className={`p-2 rounded-lg ${modoOscuro ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}
                                    title={efectosHabilitados ? "Desactivar efectos" : "Activar efectos"}
                                >
                                    {efectosHabilitados ? '✨' : '🌟'}
                                </button>
                                <button
                                    onClick={alternarModoOscuro}
                                    className={`p-2 rounded-lg ${modoOscuro ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}
                                    title={modoOscuro ? "Modo claro" : "Modo oscuro"}
                                >
                                    {modoOscuro ? '☀️' : '🌙'}
                                </button>
                                <button
                                    onClick={agregarNuevaAlerta}
                                    className={`p-2 rounded-lg ${modoOscuro ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}
                                    title="Simular alerta"
                                >
                                    🚨
                                </button>
                            </div>

                            {/* Selector de empresa */}
                            {empresasDisponibles.length > 0 && (
                                <button
                                    onClick={() => setMostrarSelectorEmpresa(true)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 group ${modoOscuro ? 'bg-white/5 border-white/10 hover:border-cyan-500/50' : 'bg-gray-100 border-gray-200 hover:border-cyan-300'}`}
                                >
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                                    <div className="text-left">
                                        <p className={`text-xs group-hover:${modoOscuro ? 'text-slate-300' : 'text-gray-700'}`}>Empresa</p>
                                        <p className={`text-sm font-medium ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                                            {empresaActual?.nombre || 'Seleccionar'}
                                        </p>
                                    </div>
                                    <svg className={`w-4 h-4 ${modoOscuro ? 'text-slate-400 group-hover:text-cyan-400' : 'text-gray-400 group-hover:text-cyan-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7M5 5l7 7-7 7" />
                                    </svg>
                                </button>
                            )}

                            {/* Perfil de usuario */}
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className={`text-sm font-medium ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>{datosUsuario?.nombre || 'Usuario'}</p>
                                    <p className={`text-xs ${modoOscuro ? 'text-slate-400' : 'text-gray-600'}`}>{datosUsuario?.rol || 'Usuario'}</p>
                                </div>
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${modoOscuro ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400' : 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-500'}`}>
                                    {datosUsuario?.nombre?.charAt(0) || 'U'}
                                </div>
                                <button
                                    onClick={manejarCerrarSesión}
                                    className={`p-2 rounded-lg transition-colors ${modoOscuro ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                                    title="Cerrar sesión"
                                >
                                    <svg className={`w-5 h-5 ${modoOscuro ? 'text-slate-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* CONTENIDO PRINCIPAL */}
            <div className={`relative z-10 px-6 py-8 transition-all duration-500 ${barraLateralContraída ? 'pl-20' : 'pl-64'}`}>
                <div className="max-w-7xl mx-auto">
                    {/* Bienvenida */}
                    <div className="mb-8">
                        <h1 className={`text-3xl font-bold mb-2 ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                            Bienvenido, <span className="text-cyan-500">{datosUsuario?.nombre || 'Usuario'}</span>
                        </h1>
                        <p className={`${modoOscuro ? 'text-slate-400' : 'text-gray-600'}`}>
                            {empresaActual ? `Gestión de flota para ${empresaActual.nombre}` : 'Selecciona una empresa para comenzar'}
                            {!empresaActual && empresasDisponibles.length === 0 && " - No tienes empresas asignadas"}
                        </p>
                    </div>

                    {/* Contenido según sección activa */}
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

            {/* FOOTER */}
            <footer className={`relative z-10 border-t px-6 py-4 transition-all duration-500 ${barraLateralContraída ? 'pl-20' : 'pl-64'} ${modoOscuro ? 'border-white/10 bg-slate-950/80' : 'border-gray-200 bg-white/80'}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className={`text-sm ${modoOscuro ? 'text-slate-500' : 'text-gray-500'}`}>
                        © {new Date().getFullYear()} FleetVision Chile • Sistema Multiempresa de Gestión de Flotas
                    </div>
                    <div className={`text-sm ${modoOscuro ? 'text-slate-500' : 'text-gray-500'}`}>
                        Usuario: <span className="text-cyan-500">{datosUsuario?.email}</span>
                        {empresaActual && (
                            <> | Empresa: <span className="text-blue-500">{empresaActual.nombre}</span></>
                        )}
                    </div>
                </div>
            </footer>

            {/* ESTILOS CSS */}
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                
                /* Scrollbar personalizado */
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
                
                /* Efecto de gradiente animado */
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradientShift 3s ease infinite;
                }
                
                /* Efecto de brillo de texto */
                .text-glow {
                    text-shadow: 0 0 10px currentColor;
                }

                /* Transiciones suaves */
                .transition-all {
                    transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;
                }

                /* Efectos hover mejorados */
                .hover-lift {
                    transition: transform 0.2s ease;
                }
                
                .hover-lift:hover {
                    transform: translateY(-2px);
                }

                /* Gradientes animados */
                .gradient-border {
                    position: relative;
                    border: double 1px transparent;
                    background-image: linear-gradient(var(--bg-color), var(--bg-color)), 
                                      linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899);
                    background-origin: border-box;
                    background-clip: padding-box, border-box;
                    animation: gradientShift 3s ease infinite;
                }
            `}</style>
        </main>
    );
}