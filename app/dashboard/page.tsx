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
    marca: string;
    tipo: string;
    año: number;
    empresa_id: string; // NUEVO: Campo para empresa
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
    empresa_id?: string; // NUEVO: Campo para empresa
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

export default function DashboardCompleto() {
    const router = useRouter();
    const referenciaAnimación = useRef<number | null>(null);

    // ==================== ESTADOS PRINCIPALES ====================
    const [cargando, setCargando] = useState(true);
    const [modoOscuro, setModoOscuro] = useState(true);
    const [barraLateralContraída, setBarraLateralContraída] = useState(false);
    const [secciónActiva, setSecciónActiva] = useState('dashboard');
    const [mostrarSelectorEmpresa, setMostrarSelectorEmpresa] = useState(false);

    // ==================== NUEVOS ESTADOS PARA GESTIÓN DE ACTIVOS ====================
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
        empresa_id: '' // NUEVO: Campo para empresa
    });

    // ==================== ESTADOS DE DATOS ====================
    const [empresaActual, setEmpresaActual] = useState<Empresa | null>(null);
    const [empresasDisponibles, setEmpresasDisponibles] = useState<Empresa[]>([]);
    const [datosUsuario, setDatosUsuario] = useState<Usuario | null>(null);

    // ==================== ESTADOS DE EFECTOS VISUALES ====================
    const [efectosHabilitados, setEfectosHabilitados] = useState(true);
    const [intensidadEfectos, setIntensidadEfectos] = useState(1.0);

    // ==================== DATOS DE PRUEBA ====================
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
        { id: '1', título: '¡Bienvenido!', mensaje: 'Selecciona una empresa para comenzar', tipo: 'info', fecha: new Date(), leída: false, icono: '👋' }
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

                    // CARGAR EMPRESAS REALES DESDE SUPABASE
                    await cargarEmpresasDesdeSupabase();
                }

            } catch (error) {
                console.error('Error inicializando dashboard:', error);
            } finally {
                setTimeout(() => setCargando(false), 800);
            }
        };

        inicializarDashboard();
    }, []);

    // NUEVO: Efecto para cargar datos cuando cambia la empresa
    useEffect(() => {
        if (empresaActual) {
            cargarDatosEmpresa(empresaActual.id);
        }
    }, [empresaActual]);

    // ==================== FUNCIONES PARA GESTIÓN MULTIEMPRESA ====================

    // NUEVO: Función para cargar empresas desde Supabase - MODIFICADA PARA DEBUG
    const cargarEmpresasDesdeSupabase = async () => {
        try {
            console.log('Cargando empresas desde Supabase...');

            const { data, error } = await supabase
                .from('empresas')
                .select('*')
                .eq('activo', true)
                .order('nombre');

            if (error) {
                console.error('Error cargando empresas:', error);
                console.error('Detalles del error:', error.message);
                // Si hay error, no cargamos empresas de prueba
                setEmpresasDisponibles([]);
                setMostrarSelectorEmpresa(true);
                return;
            }

            console.log('Empresas encontradas en la base de datos:', data);

            if (data) {
                setEmpresasDisponibles(data);

                // Verificar si hay empresa en sesión
                const empresaId = sessionStorage.getItem('empresa_id');
                const empresaNombre = sessionStorage.getItem('empresa_nombre');

                if (empresaId && empresaNombre) {
                    const empresa = data.find(e => e.id === empresaId);
                    if (empresa) {
                        console.log('Empresa recuperada de sesión:', empresa);
                        setEmpresaActual(empresa);
                    } else {
                        console.log('Empresa guardada en sesión no encontrada en la base de datos');
                        setMostrarSelectorEmpresa(true);
                    }
                } else if (data.length > 0) {
                    console.log('Mostrando selector de empresas porque no hay empresa seleccionada');
                    setMostrarSelectorEmpresa(true);
                }

                if (data.length === 0) {
                    console.log('No se encontraron empresas activas en la base de datos');
                    setMostrarSelectorEmpresa(true);
                }
            } else {
                console.log('No se recibieron datos de empresas');
                setMostrarSelectorEmpresa(true);
            }
        } catch (error) {
            console.error('Error general cargando empresas:', error);
            setEmpresasDisponibles([]);
            setMostrarSelectorEmpresa(true);
        }
    };

    // NUEVO: Función para cargar datos específicos de una empresa - MODIFICADA PARA DEBUG
    const cargarDatosEmpresa = async (empresaId: string) => {
        try {
            console.log(`Cargando datos para empresa ID: ${empresaId}`);
            console.log(`Tipo de ID: ${typeof empresaId}, Longitud: ${empresaId?.length}`);

            // Validar que el ID no sea un string vacío
            if (!empresaId || empresaId.trim() === '') {
                console.error('ID de empresa vacío o inválido');
                return;
            }

            // CARGAR ACTIVOS DE LA EMPRESA
            console.log('Ejecutando consulta de activos...');
            const { data: activosData, error: activosError } = await supabase
                .from('activos')
                .select('*')
                .eq('empresa_id', empresaId)
                .order('created_at', { ascending: false });

            if (activosError) {
                console.error('Error cargando activos:', activosError);
                console.error('Detalles del error:', activosError.message);
                setActivos([]);
                return;
            }

            console.log(`Activos encontrados: ${activosData?.length || 0}`);

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

                console.log('Activos transformados:', activosTransformados);
                setActivos(activosTransformados);
                actualizarMetricasActivos(activosTransformados);
            }

            // CARGAR ÓRDENES DE TRABAJO DE LA EMPRESA
            try {
                console.log('Ejecutando consulta de órdenes de trabajo...');
                const { data: ordenesData, error: ordenesError } = await supabase
                    .from('ordenes_trabajo')
                    .select('*')
                    .eq('empresa_id', empresaId)
                    .order('created_at', { ascending: false });

                if (ordenesError) {
                    console.log('Error cargando órdenes (puede ser normal si la tabla no existe):', ordenesError);
                    setÓrdenesTrabajo([]);
                } else if (ordenesData) {
                    console.log(`Órdenes encontradas: ${ordenesData.length}`);
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

    // NUEVO: Manejar selección de empresa
    const manejarSeleccionarEmpresa = (empresa: Empresa) => {
        sessionStorage.setItem('empresa_id', empresa.id);
        sessionStorage.setItem('empresa_nombre', empresa.nombre);
        setEmpresaActual(empresa);
        setMostrarSelectorEmpresa(false);

        // Mostrar notificación
        setNotificaciones(prev => [{
            id: Date.now().toString(),
            título: 'Empresa Seleccionada',
            mensaje: `Ahora estás trabajando con ${empresa.nombre}`,
            tipo: 'éxito',
            fecha: new Date(),
            leída: false,
            icono: '🏢'
        }, ...prev]);
    };

    // ==================== FUNCIONES PARA GESTIÓN DE ACTIVOS ====================

    // MODIFICADO: Función para agregar nuevo activo (con empresa_id)
    const agregarNuevoActivo = async () => {
        // Validar campos obligatorios
        if (!nuevoActivo.marca || !nuevoActivo.modelo || !nuevoActivo.patente) {
            alert('Por favor complete los campos obligatorios: Marca, Modelo y Patente');
            return;
        }

        // Validar que haya empresa seleccionada
        if (!empresaActual) {
            alert('Debe seleccionar una empresa primero');
            return;
        }

        try {
            // Crear objeto para insertar en Supabase
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
                empresa_id: empresaActual.id // NUEVO: Incluir empresa_id
            };

            console.log('Insertando activo:', activoParaInsertar);

            // Insertar en Supabase
            const { data, error } = await supabase
                .from('activos')
                .insert([activoParaInsertar])
                .select();

            if (error) {
                console.error('Error insertando activo:', error);
                throw error;
            }

            if (data && data[0]) {
                console.log('Activo insertado correctamente:', data[0]);

                // Agregar el nuevo activo al estado local
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

                // Actualizar métricas
                actualizarMetricasActivos([nuevoActivoLocal, ...activos]);

                // Resetear formulario
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

                // Cerrar modal
                setMostrarModalAgregarActivo(false);

                // Mostrar notificación de éxito
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
            alert('Error al agregar el activo. Por favor intente nuevamente.');
        }
    };

    // MODIFICADO: Función para eliminar activo (verificar empresa)
    const eliminarActivo = async (id: string, nombre: string) => {
        if (!confirm(`¿Está seguro de eliminar el activo "${nombre}"?`)) {
            return;
        }

        try {
            // Eliminar de Supabase (con filtro de empresa para seguridad)
            const { error } = await supabase
                .from('activos')
                .delete()
                .eq('id', id)
                .eq('empresa_id', empresaActual?.id); // NUEVO: Filtrar por empresa

            if (error) throw error;

            // Eliminar del estado local
            setActivos(prev => prev.filter(activo => activo.id !== id));

            // Actualizar métricas
            actualizarMetricasActivos(activos.filter(activo => activo.id !== id));

            // Mostrar notificación
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
            alert('Error al eliminar el activo. Por favor intente nuevamente.');
        }
    };

    // Función para actualizar métricas basadas en activos
    const actualizarMetricasActivos = (activosActuales: Activo[]) => {
        const totalActivos = activosActuales.length;
        const activosSaludables = activosActuales.filter(a => a.estado === 'saludable').length;
        const porcentajeSalud = totalActivos > 0 ? (activosSaludables / totalActivos) * 100 : 0;

        setMétricasVivas(prev => prev.map(métrica => {
            if (métrica.id === '1') {
                return { ...métrica, valor: totalActivos };
            }
            if (métrica.id === '2') {
                return { ...métrica, valor: porcentajeSalud };
            }
            return métrica;
        }));
    };

    // ==================== FUNCIONES AUXILIARES ====================
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

    const crearNuevaOrden = async () => {
        if (!empresaActual) {
            alert('Selecciona una empresa primero');
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

    const alternarModoOscuro = () => {
        setModoOscuro(!modoOscuro);
    };

    const alternarEfectos = () => {
        setEfectosHabilitados(!efectosHabilitados);
    };

    const manejarIntensidadEfectos = (nuevaIntensidad: number) => {
        setIntensidadEfectos(nuevaIntensidad);
    };

    const marcarNotificacionesLeídas = () => {
        setNotificaciones(prev => prev.map(n => ({ ...n, leída: true })));
    };

    const eliminarNotificación = (id: string) => {
        setNotificaciones(prev => prev.filter(n => n.id !== id));
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

    // Función para reiniciar selección de empresa (útil para debug)
    const reiniciarSeleccionEmpresa = () => {
        sessionStorage.removeItem('empresa_id');
        sessionStorage.removeItem('empresa_nombre');
        setEmpresaActual(null);
        setMostrarSelectorEmpresa(true);
        setActivos([]);
        setÓrdenesTrabajo([]);
        cargarEmpresasDesdeSupabase();
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
                                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-[#0066ff] flex items-center justify-center text-white font-bold shadow-md shadow-cyan-500/30">
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

                    {/* Barra de progreso */}
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

    // ==================== COMPONENTE DIAGRAMA SEGURO ====================
    const DiagramaTortaComponente = ({ diagrama }: { diagrama: DiagramaTorta }) => {
        const radio = 80;
        const centroX = 100;
        const centroY = 100;
        let ánguloInicio = 0;

        // Validaciones
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

        // Calcular porcentajes
        const datosProcesados = diagrama.datos.map(segmento => {
            const porcentaje = segmento.valor / diagrama.total;
            return {
                ...segmento,
                porcentaje,
                ángulo: porcentaje * 360
            };
        });

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
                                    <path
                                        d={pathData}
                                        fill={segmento.color}
                                        className="transition-opacity duration-300 hover:opacity-80"
                                    />
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
                                    {segmento.valor} ({(segmento.porcentaje * 100).toFixed(1)}%)
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
                        <button
                            onClick={() => alternarCompletarTarea(tarea.id)}
                            className={`p-2 rounded-lg transition-all ${tarea.progreso === 100
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-slate-700/50 text-slate-400'
                                }`}
                        >
                            {tarea.progreso === 100 ? '✅' : '⬜'}
                        </button>
                    </div>

                    {/* Barra de progreso */}
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
                            <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000"
                                style={{ width: `${tarea.progreso}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
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
            ? 'border-red-500/30 bg-red-500/5'
            : alerta.severidad === 'advertencia'
                ? 'border-amber-500/30 bg-amber-500/5'
                : 'border-blue-500/30 bg-blue-500/5'
            } p-4 backdrop-blur-sm transition-all duration-300`}>
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
                        className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-all"
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

    // ==================== COMPONENTE MODAL PARA AGREGAR ACTIVO ====================
    const ModalAgregarActivo = () => {
        const años = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                <div className="relative w-full max-w-md rounded-xl bg-slate-900 border border-cyan-500/30 overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">🚚 Agregar Nuevo Activo</h3>
                            <button
                                onClick={() => setMostrarModalAgregarActivo(false)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Empresa (solo lectura) */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Empresa</label>
                                <div className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white">
                                    {empresaActual?.nombre || 'No seleccionada'}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">El activo se agregará a esta empresa</p>
                            </div>

                            {/* Marca */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Marca *</label>
                                <input
                                    type="text"
                                    value={nuevoActivo.marca}
                                    onChange={(e) => setNuevoActivo({ ...nuevoActivo, marca: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="Ej: Volvo, Mercedes, Scania"
                                />
                            </div>

                            {/* Modelo */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Modelo *</label>
                                <input
                                    type="text"
                                    value={nuevoActivo.modelo}
                                    onChange={(e) => setNuevoActivo({ ...nuevoActivo, modelo: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="Ej: FH16 750, Actros 2663"
                                />
                            </div>

                            {/* Tipo */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Tipo</label>
                                <select
                                    value={nuevoActivo.tipo}
                                    onChange={(e) => setNuevoActivo({ ...nuevoActivo, tipo: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 transition-colors"
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
                                <label className="block text-sm text-slate-400 mb-2">Año</label>
                                <select
                                    value={nuevoActivo.año}
                                    onChange={(e) => setNuevoActivo({ ...nuevoActivo, año: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                >
                                    <option value="">Seleccionar año</option>
                                    {años.map(año => (
                                        <option key={año} value={año}>{año}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Patente */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Patente *</label>
                                <input
                                    type="text"
                                    value={nuevoActivo.patente}
                                    onChange={(e) => setNuevoActivo({ ...nuevoActivo, patente: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="Ej: AB-1234-CD"
                                />
                            </div>

                            {/* Estado */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Estado</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setNuevoActivo({ ...nuevoActivo, estado: 'saludable' })}
                                        className={`py-2 px-3 rounded-lg text-sm transition-colors ${nuevoActivo.estado === 'saludable'
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'}`}
                                    >
                                        Saludable
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNuevoActivo({ ...nuevoActivo, estado: 'advertencia' })}
                                        className={`py-2 px-3 rounded-lg text-sm transition-colors ${nuevoActivo.estado === 'advertencia'
                                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'}`}
                                    >
                                        Advertencia
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNuevoActivo({ ...nuevoActivo, estado: 'crítico' })}
                                        className={`py-2 px-3 rounded-lg text-sm transition-colors ${nuevoActivo.estado === 'crítico'
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'}`}
                                    >
                                        Crítico
                                    </button>
                                </div>
                            </div>

                            {/* Ubicación */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Ubicación</label>
                                <input
                                    type="text"
                                    value={nuevoActivo.ubicación}
                                    onChange={(e) => setNuevoActivo({ ...nuevoActivo, ubicación: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="Ej: Santiago Centro, Valparaíso"
                                />
                            </div>

                            {/* Kilometraje */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Kilometraje (km)</label>
                                <input
                                    type="number"
                                    value={nuevoActivo.kilometraje}
                                    onChange={(e) => setNuevoActivo({ ...nuevoActivo, kilometraje: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="Ej: 125430"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-8">
                            <button
                                onClick={agregarNuevoActivo}
                                disabled={!empresaActual}
                                className={`flex-1 px-4 py-3 rounded-lg text-white font-medium transition-opacity ${empresaActual
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90'
                                    : 'bg-gray-600 cursor-not-allowed'}`}
                            >
                                {empresaActual ? 'Agregar Activo' : 'Selecciona Empresa Primero'}
                            </button>
                            <button
                                onClick={() => setMostrarModalAgregarActivo(false)}
                                className="px-4 py-3 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 mt-4 text-center">
                            Los campos marcados con * son obligatorios. El activo se guardará en {empresaActual?.nombre}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    // ==================== COMPONENTE TARJETA ACTIVO MODIFICADO ====================
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
            <div className="group relative rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/50 to-slate-950/50 p-4 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h4 className="text-sm font-medium text-white mb-1">{activo.nombre}</h4>
                        <p className="text-xs text-slate-400 mb-1">{activo.marca} • {activo.modelo} • {activo.año}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerColorEstado(activo.estado)}`}>
                                {activo.estado.toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-400">{activo.ubicación}</span>
                            <span className="text-xs text-cyan-400">{activo.tipo}</span>
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
                        <div className="flex gap-2">
                            <button className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/30 transition-colors">
                                Programar
                            </button>
                            <button
                                onClick={() => eliminarActivo(activo.id, activo.nombre)}
                                className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors"
                            >
                                Eliminar
                            </button>
                        </div>
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
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // ==================== NUEVO: SELECTOR DE EMPRESA MODIFICADO CON MEJORES MENSAJES ====================
    const SelectorEmpresaModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-xl bg-slate-900 border border-cyan-500/30 overflow-hidden">
                <div className="relative z-10 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white">
                                Seleccionar Empresa
                            </h3>
                            <p className="text-slate-400 text-xs mt-1">
                                Elige la empresa con la que quieres trabajar
                            </p>
                        </div>
                        <div className="h-8 w-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                            <span className="text-cyan-400 font-bold">{empresasDisponibles.length}</span>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {empresasDisponibles.length > 0 ? (
                            empresasDisponibles.map((empresa) => (
                                <button
                                    key={empresa.id}
                                    onClick={() => manejarSeleccionarEmpresa(empresa)}
                                    className="w-full p-3 rounded-lg bg-gradient-to-br from-white/5 to-white/2 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 text-left group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-white text-sm">{empresa.nombre}</h4>
                                            <p className="text-xs text-slate-400 mt-1">ID: {empresa.id?.substring(0, 8)}...</p>
                                            {empresa.rut_text && (
                                                <p className="text-xs text-slate-500 mt-1">RUT: {empresa.rut_text}</p>
                                            )}
                                        </div>
                                        <div className={`h-2.5 w-2.5 rounded-full ${empresa.activo ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <div className="text-3xl mb-2">🏢</div>
                                <p>No tienes empresas asignadas</p>
                                <p className="text-sm">Contacta al administrador</p>
                                <button
                                    onClick={() => cargarEmpresasDesdeSupabase()}
                                    className="mt-4 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors text-sm"
                                >
                                    🔄 Reintentar Cargar Empresas
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Botón de debug para reiniciar selección */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <button
                            onClick={reiniciarSeleccionEmpresa}
                            className="w-full px-4 py-2.5 rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors text-sm mb-3"
                        >
                            🔄 Reiniciar Selección de Empresa
                        </button>

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

        // Métricas basadas en datos REALES
        const totalActivos = activos.length;
        const totalÓrdenes = órdenesTrabajo.length;

        const métricasReales: Métrica[] = [
            {
                id: '1',
                título: 'Vehículos Activos',
                valor: totalActivos,
                unidad: '',
                cambio: 0,
                tendencia: 'estable',
                color: 'emerald',
                salud: totalActivos > 0 ? 95 : 0,
                meta: 15,
                icono: '🚚'
            },
            {
                id: '2',
                título: 'Disponibilidad',
                valor: totalActivos > 0 ? 98.7 : 0,
                unidad: '%',
                cambio: totalActivos > 0 ? 1.2 : 0,
                tendencia: totalActivos > 0 ? 'sube' : 'estable',
                color: 'cyan',
                salud: totalActivos > 0 ? 98 : 0,
                meta: 95,
                icono: '📈'
            },
            {
                id: '3',
                título: 'Alertas Activas',
                valor: alertas.filter(a => !a.resuelta).length,
                unidad: '',
                cambio: 0,
                tendencia: 'estable',
                color: 'amber',
                salud: 98,
                meta: 0,
                icono: '🚨'
            },
            {
                id: '4',
                título: 'Mantenimientos',
                valor: órdenesTrabajo.filter(o => o.tipo === 'Preventivo' && o.estado !== 'completada').length,
                unidad: '',
                cambio: 0,
                tendencia: 'estable',
                color: 'blue',
                salud: 85,
                meta: 10,
                icono: '🔧'
            }
        ];

        // Gráficos basados en datos REALES
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

        // Si no hay empresa seleccionada
        if (!empresaActual) {
            return (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4 text-slate-600">🏢</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Selecciona una Empresa</h3>
                    <p className="text-slate-400 mb-6">Para ver el dashboard, primero selecciona una empresa con la que trabajar</p>
                    <button
                        onClick={() => setMostrarSelectorEmpresa(true)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity"
                    >
                        Seleccionar Empresa
                    </button>
                </div>
            );
        }

        return (
            <>
                {/* Muestra la empresa actual */}
                <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{empresaActual.nombre}</h2>
                            <p className="text-cyan-400">Dashboard Principal</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setMostrarSelectorEmpresa(true)}
                                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                            >
                                Cambiar Empresa
                            </button>
                            <button
                                onClick={reiniciarSeleccionEmpresa}
                                className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-colors text-sm"
                            >
                                🔄 Reiniciar
                            </button>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN DE MÉTRICAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {métricasReales.map((métrica) => (
                        <TarjetaMétrica key={métrica.id} métrica={métrica} />
                    ))}
                </div>

                {/* SECCIÓN DE GRÁFICOS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <DiagramaTortaComponente
                        diagrama={{
                            título: 'Órdenes por Estado',
                            datos: datosÓrdenesPorEstado,
                            total: datosÓrdenesPorEstado.reduce((sum, item) => sum + item.valor, 0) || 1,
                            descripción: totalÓrdenes === 0 ? 'No hay órdenes registradas' : `Total: ${totalÓrdenes} órdenes`
                        }}
                    />

                    <DiagramaTortaComponente
                        diagrama={{
                            título: 'Estado de Activos',
                            datos: datosEstadoActivos,
                            total: datosEstadoActivos.reduce((sum, item) => sum + item.valor, 0) || 1,
                            descripción: totalActivos === 0 ? 'No hay activos registrados' : `Total: ${totalActivos} activos`
                        }}
                    />
                </div>

                {/* SECCIÓN DE TABLAS Y LISTAS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columna izquierda */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Lista de órdenes de trabajo */}
                        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-lg">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">📋 Órdenes de Trabajo</h3>
                                    <p className="text-sm text-cyan-400">
                                        {totalÓrdenes === 0 ? 'No hay órdenes registradas' : `Total: ${totalÓrdenes} órdenes`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={crearNuevaOrden}
                                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                                    >
                                        <span>+</span>
                                        <span>Nueva OT</span>
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
                                    <button
                                        onClick={crearNuevaOrden}
                                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
                                    >
                                        <span>+</span>
                                        <span>Crear Primera OT</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Columna derecha */}
                    <div className="space-y-6">
                        {/* Información de la empresa */}
                        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-lg">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">🏢 Información Empresa</h3>
                                <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                </div>
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

                        {/* Estado del sistema */}
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

    const GestiónActivos = () => {
        if (!empresaActual) {
            return (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4 text-slate-600">🏢</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Selecciona una Empresa</h3>
                    <p className="text-slate-400 mb-6">Para gestionar activos, primero selecciona una empresa</p>
                    <button
                        onClick={() => setMostrarSelectorEmpresa(true)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity"
                    >
                        Seleccionar Empresa
                    </button>
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
                {/* Modal para agregar activo */}
                {mostrarModalAgregarActivo && <ModalAgregarActivo />}

                <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-lg">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">🚚 Gestión de Activos</h3>
                            <p className="text-cyan-400">Vehículos y equipos de {empresaActual.nombre} - {estadísticasActivos.total} activos registrados</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setMostrarModalAgregarActivo(true)}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                            >
                                <span>+</span>
                                <span>Agregar Activo</span>
                            </button>
                            <button
                                onClick={() => setMostrarSelectorEmpresa(true)}
                                className="px-4 py-2 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
                            >
                                Cambiar Empresa
                            </button>
                        </div>
                    </div>

                    {/* Estadísticas rápidas */}
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
                                <p className="text-slate-600 text-sm mb-6">Agrega tu primer vehículo o equipo para comenzar la gestión</p>
                                <button
                                    onClick={() => setMostrarModalAgregarActivo(true)}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
                                >
                                    <span>+</span>
                                    <span>Agregar Primer Activo</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const ÓrdenesTrabajo = () => {
        if (!empresaActual) {
            return (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4 text-slate-600">🏢</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Selecciona una Empresa</h3>
                    <p className="text-slate-400 mb-6">Para gestionar órdenes, primero selecciona una empresa</p>
                    <button
                        onClick={() => setMostrarSelectorEmpresa(true)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity"
                    >
                        Seleccionar Empresa
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-lg">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">📋 Órdenes de Trabajo</h3>
                            <p className="text-cyan-400">Gestión completa de mantenimiento - {empresaActual.nombre}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={crearNuevaOrden}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                            >
                                <span>+</span>
                                <span>Nueva OT</span>
                            </button>
                            <button
                                onClick={() => setMostrarSelectorEmpresa(true)}
                                className="px-4 py-2 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
                            >
                                Cambiar Empresa
                            </button>
                        </div>
                    </div>
                    <ListaÓrdenesTrabajo />
                </div>
            </div>
        );
    };

    // Resto de componentes (PlanMantenimiento, Inventario, Personal, Reportes, Configuración)
    // ... (mantener igual pero añadir validación de empresaActual al inicio de cada uno)

    const PlanMantenimiento = () => {
        if (!empresaActual) {
            return (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4 text-slate-600">🏢</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Selecciona una Empresa</h3>
                    <p className="text-slate-400 mb-6">Para ver el plan de mantenimiento, primero selecciona una empresa</p>
                    <button
                        onClick={() => setMostrarSelectorEmpresa(true)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity"
                    >
                        Seleccionar Empresa
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-lg">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">🔧 Plan de Mantenimiento</h3>
                            <p className="text-cyan-400">Programación preventiva de la flota - {empresaActual.nombre}</p>
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
    };

    // Los componentes Inventario, Personal, Reportes y Configuración siguen igual
    // pero añade la validación de empresaActual al inicio de cada uno como en los anteriores

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

            {/* BARRA LATERAL */}
            <BarraLateral />

            {/* MODAL SELECTOR EMPRESA */}
            {mostrarSelectorEmpresa && <SelectorEmpresaModal />}

            {/* HEADER */}
            <header className={`relative z-10 border-b transition-all duration-500 ${barraLateralContraída ? 'pl-20' : 'pl-64'} ${modoOscuro ? 'bg-slate-950/80 backdrop-blur-lg border-white/10' : 'bg-white/80 backdrop-blur-lg border-gray-200'}`}>
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
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
                            </div>

                            {/* Selector de empresa */}
                            <button
                                onClick={() => setMostrarSelectorEmpresa(true)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 group ${modoOscuro ? 'bg-white/5 border-white/10 hover:border-cyan-500/50' : 'bg-gray-100 border-gray-200 hover:border-cyan-300'}`}
                            >
                                <div className={`h-2 w-2 rounded-full ${empresaActual ? 'bg-emerald-500' : 'bg-red-500'}`} />
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
        </main>
    );
}