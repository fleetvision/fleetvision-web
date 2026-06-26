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
    id: string; // auth.users.id
    usuario_id?: string | null; // public.usuarios.id
    email: string;
    nombre: string;
    rol: string;
    rol_empresa?: string | null;
}
interface PlanFeature {
    feature: string;
    habilitado: boolean;
    limite: number | null;
    plan_codigo: string;
    estado_suscripcion: string;
}
interface EmpresaDueno {
    empresa_id: string;
    empresa: string;
    rut: string | null;
    empresa_activa: boolean;
    plan_codigo: string | null;
    nombre_plan: string | null;
    estado_suscripcion: string | null;
    trial_ends_at: string | null;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    total_usuarios: number;
    total_activos: number;
    modo_demo?: boolean | null;
    archivada?: boolean | null;
}

type FiltroEmpresasDueno = 'clientes' | 'trials' | 'demo' | 'archivadas' | 'todos';
type FiltroUsuariosDueno = 'activos' | 'basurero' | 'demo' | 'todos';
interface DiagnosticoDueno {
    categoria: string;
    detalle: string;
    cantidad: number;
    severidad: 'ok' | 'media' | 'alta' | string;
}
interface UsuarioDueno {
    usuario_empresa_id: string;
    usuario_id: string;
    auth_id: string;
    username: string | null;
    apellido: string | null;
    usuario_rol_texto: string | null;
    usuario_activo: boolean;
    empresa_id: string;
    empresa: string;
    empresa_activa: boolean;
    plan_codigo: string | null;
    estado_suscripcion: string | null;
    rol_id: string | null;
    rol_nombre: string;
    rol_codigo: string;
}
type EstadoSolicitudPrueba =
    | 'nueva'
    | 'contactada'
    | 'en_evaluacion'
    | 'convertida'
    | 'rechazada';

interface SolicitudPruebaDueno {
    id: number;
    nombre: string | null;
    rut: string | null;
    telefono: string | null;
    correo: string | null;
    region: string | null;
    pais: string | null;
    estado: EstadoSolicitudPrueba;
    origen: string | null;
    empresa_creada_id: string | null;
    notas_dueno: string | null;
    created_at: string;
    updated_at: string;
}

interface RolEmpresaDueno {
    rol_id: string;
    rol_nombre: string;
    rol_descripcion: string | null;
    rol_codigo: string;
}
interface RolGlobalUsuario {
    rol_global: string;
    nombre: string;
    activo: boolean;
}
interface ModalSistema {
    titulo: string;
    mensaje: string;
    detalle?: string;
    tipo: 'error' | 'exito' | 'advertencia' | 'info';
    icono: string;
}
interface UsuarioParaVincular {
    usuario_id: string;
    auth_id: string;
    username: string | null;
    apellido: string | null;
    usuario_rol_texto: string | null;
    usuario_activo: boolean;
    total_empresas: number;
}
interface NuevaEmpresaDueno {
    nombre: string;
    rut: string;
    plan_codigo: 'gratis' | 'basico' | 'pro' | 'empresa';
    estado_suscripcion: 'trial' | 'activa' | 'vencida' | 'cancelada' | 'suspendida';
    activa: boolean;
}
interface PlanSaasDueno {
    codigo: 'gratis' | 'basico' | 'pro' | 'empresa';
    nombre: string;
    subtitulo: string | null;
    precio: string | null;
    descripcion: string | null;
    color: 'slate' | 'cyan' | 'purple' | 'emerald' | string;
    destacado: boolean;
    activo: boolean;
    orden: number;
    limite_administrador: number | null;
    limite_soporte: number | null;
    limite_tecnico: number | null;
}
// =============================================================
// 🟢 SECCIÓN VERDE – Componente principal DashboardCompleto
// =============================================================
export default function DashboardCompleto() {
    const router = useRouter();
    const referenciaAnimación = useRef<number | null>(null);
    const busquedaUsuarioVincularRef = useRef('');
    const nombreNuevaEmpresaRef = useRef('');
    const rutNuevaEmpresaRef = useRef('');
    const emailCrearUsuarioRef = useRef('');
    const passwordCrearUsuarioRef = useRef('');
    const usernameCrearUsuarioRef = useRef('');
    const apellidoCrearUsuarioRef = useRef('');
    const nombrePlanSaasRef = useRef('');
    const subtituloPlanSaasRef = useRef('');
    const precioPlanSaasRef = useRef('');
    const descripcionPlanSaasRef = useRef('');
    const limiteAdminPlanSaasRef = useRef('');
    const limiteSoportePlanSaasRef = useRef('');
    const limiteTecnicoPlanSaasRef = useRef('');
    const usernameEditarUsuarioRef = useRef('');
    const apellidoEditarUsuarioRef = useRef('');
    const emailEditarUsuarioRef = useRef('');
    const passwordDemoSolicitudRef = useRef('FleetVision123');
    const confirmacionBorrarUsuarioRef = useRef('');

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
    const [featuresPlan, setFeaturesPlan] = useState<PlanFeature[]>([]);
    const [moduloDuenoActivo, setModuloDuenoActivo] = useState<
        'resumen' |
        'empresas' |
        'usuarios' |
        'planes' |
        'solicitudes' |
        'roles' |
        'diagnostico'
    >('resumen');
    const [empresasDueno, setEmpresasDueno] = useState<EmpresaDueno[]>([]);
    const [filtroEmpresasDueno, setFiltroEmpresasDueno] = useState<FiltroEmpresasDueno>('clientes');
    const [cargandoEmpresasDueno, setCargandoEmpresasDueno] = useState(false);
    const [planesSaas, setPlanesSaas] = useState<PlanSaasDueno[]>([]);
    const [cargandoPlanesSaas, setCargandoPlanesSaas] = useState(false);
    const [modalEditarPlanAbierto, setModalEditarPlanAbierto] = useState(false);
    const [planEditando, setPlanEditando] = useState<PlanSaasDueno | null>(null);
    const [guardandoPlanSaas, setGuardandoPlanSaas] = useState(false);
    const [precioPlanPreview, setPrecioPlanPreview] = useState('');

    const [planDestacadoEditando, setPlanDestacadoEditando] = useState(false);
    const [planActivoEditando, setPlanActivoEditando] = useState(true);

    const [limiteAdminIlimitado, setLimiteAdminIlimitado] = useState(false);
    const [limiteSoporteIlimitado, setLimiteSoporteIlimitado] = useState(false);
    const [limiteTecnicoIlimitado, setLimiteTecnicoIlimitado] = useState(false);
    const [empresaGestionSeleccionada, setEmpresaGestionSeleccionada] = useState<EmpresaDueno | null>(null);
    const [guardandoGestionEmpresa, setGuardandoGestionEmpresa] = useState(false);
    const [modalConfirmarSuscripcion, setModalConfirmarSuscripcion] = useState<{
        abierto: boolean;
        empresaId: string;
        empresaNombre: string;
        estado: 'trial' | 'activa' | 'vencida' | 'cancelada' | 'suspendida';
    } | null>(null);
    const [mostrarModalNuevaEmpresa, setMostrarModalNuevaEmpresa] = useState(false);
    const [guardandoNuevaEmpresa, setGuardandoNuevaEmpresa] = useState(false);
    const [nuevaEmpresaDueno, setNuevaEmpresaDueno] = useState<NuevaEmpresaDueno>({
        nombre: '',
        rut: '',
        plan_codigo: 'gratis',
        estado_suscripcion: 'trial',
        activa: true,
    });
    const [diagnosticoDueno, setDiagnosticoDueno] = useState<DiagnosticoDueno[]>([]);
    const [cargandoDiagnosticoDueno, setCargandoDiagnosticoDueno] = useState(false);
    const [solicitudesPrueba, setSolicitudesPrueba] = useState<SolicitudPruebaDueno[]>([]);
    const [cargandoSolicitudesPrueba, setCargandoSolicitudesPrueba] = useState(false);
    const [filtroEstadoSolicitud, setFiltroEstadoSolicitud] = useState<'todas' | EstadoSolicitudPrueba>('todas');
    const [guardandoSolicitudPrueba, setGuardandoSolicitudPrueba] = useState(false);
    const [modalConvertirSolicitudAbierto, setModalConvertirSolicitudAbierto] = useState(false);
    const [solicitudParaConvertir, setSolicitudParaConvertir] = useState<SolicitudPruebaDueno | null>(null);
    const [tipoClienteSolicitud, setTipoClienteSolicitud] = useState<'empresa' | 'persona_natural'>('empresa');
    const [planTrialSolicitud, setPlanTrialSolicitud] = useState<'gratis' | 'basico' | 'pro' | 'empresa'>('pro');
    const [convirtiendoSolicitud, setConvirtiendoSolicitud] = useState(false);
    const [usuariosDueno, setUsuariosDueno] = useState<UsuarioDueno[]>([]);
    const [filtroUsuariosDueno, setFiltroUsuariosDueno] = useState<FiltroUsuariosDueno>('activos');
    const [empresaModoDemo, setEmpresaModoDemo] = useState(false);
    const [empresaNombreActual, setEmpresaNombreActual] = useState('');
    const [rolesEmpresaDueno, setRolesEmpresaDueno] = useState<RolEmpresaDueno[]>([]);
    const [cargandoUsuariosDueno, setCargandoUsuariosDueno] = useState(false);
    const [usuarioGestionSeleccionado, setUsuarioGestionSeleccionado] = useState<UsuarioDueno | null>(null);
    const [guardandoGestionUsuario, setGuardandoGestionUsuario] = useState(false);
    const [mostrarModalVincularUsuario, setMostrarModalVincularUsuario] = useState(false);
    const [buscandoUsuariosVincular, setBuscandoUsuariosVincular] = useState(false);
    const [guardandoVincularUsuario, setGuardandoVincularUsuario] = useState(false);
    const [mostrarModalCrearUsuario, setMostrarModalCrearUsuario] = useState(false);
    const [guardandoCrearUsuario, setGuardandoCrearUsuario] = useState(false);
    const [empresaCrearUsuario, setEmpresaCrearUsuario] = useState('');
    const [rolCrearUsuario, setRolCrearUsuario] = useState('');
    const [activoCrearUsuario, setActivoCrearUsuario] = useState(true);
    // -------------------- ESTADOS PARA EDITAR USUARIO -------------
    const [modalEditarUsuarioAbierto, setModalEditarUsuarioAbierto] = useState(false);
    const [guardandoEditarUsuario, setGuardandoEditarUsuario] = useState(false);
    const [borrandoUsuario, setBorrandoUsuario] = useState(false);
    const [modalBorrarUsuarioAbierto, setModalBorrarUsuarioAbierto] = useState(false);
    const [modoConfirmacionDefinitiva, setModoConfirmacionDefinitiva] = useState(false);
    const [errorModalBorrarUsuario, setErrorModalBorrarUsuario] = useState('');

    const [formEditarUsuario, setFormEditarUsuario] = useState({
        usuario_id: '',
        auth_id: '',
        username: '',
        apellido: '',
        email: '',
        activo: true,
    });
    const [usuariosParaVincular, setUsuariosParaVincular] = useState<UsuarioParaVincular[]>([]);
    const [usuarioSeleccionadoParaVincular, setUsuarioSeleccionadoParaVincular] = useState<UsuarioParaVincular | null>(null);
    const [empresaSeleccionadaParaVincular, setEmpresaSeleccionadaParaVincular] = useState('');
    const [rolSeleccionadoParaVincular, setRolSeleccionadoParaVincular] = useState('');

    const [empresaDestinoUsuario, setEmpresaDestinoUsuario] = useState('');
    const [rolDestinoUsuario, setRolDestinoUsuario] = useState('Administrador');
    const [guardandoCambioEmpresaUsuario, setGuardandoCambioEmpresaUsuario] = useState(false);
    const [modalConfirmarCambioEmpresaUsuario, setModalConfirmarCambioEmpresaUsuario] = useState(false);

    const [modalSistema, setModalSistema] = useState<ModalSistema | null>(null);
    const [esAdminGlobal, setEsAdminGlobal] = useState(false);
    const [rolGlobal, setRolGlobal] = useState<RolGlobalUsuario | null>(null);

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

                const { data: perfilUsuario, error: perfilUsuarioError } = await supabase
                    .from('usuarios')
                    .select('id, username, apellido, rol')
                    .eq('auth_id', user.id)
                    .maybeSingle();

                if (perfilUsuarioError) {
                    console.warn('No se pudo cargar perfil desde public.usuarios:', perfilUsuarioError);
                }

                const nombreDesdePerfil = [
                    perfilUsuario?.username,
                    perfilUsuario?.apellido
                ]
                    .filter(Boolean)
                    .join(' ')
                    .trim();

                setDatosUsuario({
                    id: user.id,
                    usuario_id: perfilUsuario?.id || null,
                    email: user.email || '',
                    nombre:
                        nombreDesdePerfil ||
                        user.user_metadata?.nombre ||
                        user.email?.split('@')[0] ||
                        'Usuario',
                    rol:
                        user.user_metadata?.rol ||
                        perfilUsuario?.rol ||
                        'Usuario',
                    rol_empresa: null,
                });

                await cargarRolGlobalUsuario();
                await cargarEmpresaUsuario();
            } catch (error) {
                console.error('Error inicializando dashboard:', error);
            } finally {
                setTimeout(() => setCargando(false), 800);
            }
        };

        inicializarDashboard();
    }, []);

    // --- Efecto para cargar datos y permisos cuando cambia la empresa ---
    useEffect(() => {
        if (empresaActual) {
            cargarDatosEmpresa(empresaActual.id);
            cargarFeaturesEmpresa(empresaActual.id);

            if (!esAdminGlobal && datosUsuario?.id) {
                cargarRolEmpresaActual(empresaActual.id, datosUsuario.id);
            }
        }
    }, [empresaActual, datosUsuario?.id, esAdminGlobal]);
    // --- Efecto para detectar Modo Demo ---
    useEffect(() => {
        const modoDemoStorage =
            sessionStorage.getItem('empresa_modo_demo') === 'true' ||
            localStorage.getItem('empresa_modo_demo') === 'true';

        const nombreEmpresaStorage =
            sessionStorage.getItem('empresa_nombre') ||
            localStorage.getItem('empresa_nombre') ||
            '';

        setEmpresaModoDemo(modoDemoStorage);
        setEmpresaNombreActual(nombreEmpresaStorage);
    }, []);
    // --- Efecto para cargar todas las empresas cuando el usuario es dueño global ---
    useEffect(() => {
        if (esAdminGlobal && empresasDueno.length === 0) {
            cargarEmpresasDueno();
        }
    }, [esAdminGlobal]);


    // =============================================================
    // 🔵 SECCIÓN AZUL – Funciones de gestión de empresa
    // =============================================================
    const mostrarModalSistema = (
        tipo: 'error' | 'exito' | 'advertencia' | 'info',
        titulo: string,
        mensaje: string,
        detalle?: string
    ) => {
        const iconos = {
            error: '⛔',
            exito: '✅',
            advertencia: '⚠️',
            info: 'ℹ️',
        };

        setModalSistema({
            tipo,
            titulo,
            mensaje,
            detalle,
            icono: iconos[tipo],
        });
    };
    const mostrarAccionDemo = (
        titulo: string = 'Acción simulada',
        mensaje: string = 'Esta acción fue ejecutada en modo demo.'
    ) => {
        mostrarModalSistema(
            'info',
            `🧪 ${titulo}`,
            mensaje,
            'Esta acción no se guardó en Supabase porque la empresa actual está configurada como ambiente de demostración.'
        );
    };

    const cerrarModalSistema = () => {
        setModalSistema(null);
    };
    const formatearRolEmpresaVisual = (rol?: string | null) => {
        const limpio = (rol || '')
            .trim()
            .toLowerCase()
            .replace('é', 'e');

        if (limpio === 'administrador') return 'Administrador';
        if (limpio === 'soporte') return 'Soporte';
        if (limpio === 'tecnico') return 'Técnico';

        return 'Sin rol';
    };

    const cargarRolEmpresaActual = async (empresaId: string, authId: string) => {
        try {
            if (!empresaId || !authId) return;

            const { data: usuarioPublico, error: errorUsuarioPublico } = await supabase
                .from('usuarios')
                .select('id')
                .eq('auth_id', authId)
                .maybeSingle();

            if (errorUsuarioPublico) {
                console.warn('No se pudo buscar public.usuarios para rol empresa:', errorUsuarioPublico);
                return;
            }

            if (!usuarioPublico?.id) {
                console.warn('Usuario sin registro en public.usuarios para auth_id:', authId);
                return;
            }

            const { data: vinculoEmpresa, error: errorVinculoEmpresa } = await supabase
                .from('usuarios_empresas')
                .select('nombre')
                .eq('usuario_id', usuarioPublico.id)
                .eq('empresa_id', empresaId)
                .maybeSingle();

            if (errorVinculoEmpresa) {
                console.warn('No se pudo cargar rol desde usuarios_empresas:', errorVinculoEmpresa);
                return;
            }

            const rolEmpresaVisual = formatearRolEmpresaVisual(vinculoEmpresa?.nombre);

            setDatosUsuario((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    usuario_id: usuarioPublico.id,
                    rol: rolEmpresaVisual,
                    rol_empresa: rolEmpresaVisual,
                };
            });
        } catch (error) {
            console.warn('Error general cargando rol de empresa actual:', error);
        }
    };
    const cargarRolGlobalUsuario = async () => {
        try {
            console.log('Revisando rol global del usuario...');

            const { data, error } = await supabase.rpc('mi_rol_global');

            if (error) {
                console.error('Error revisando rol global:', error);
                setEsAdminGlobal(false);
                setRolGlobal(null);
                return;
            }

            const roles = (data || []) as RolGlobalUsuario[];
            const rolPrincipal = roles[0] || null;

            setRolGlobal(rolPrincipal);
            setEsAdminGlobal(!!rolPrincipal);

            console.log('Rol global cargado:', rolPrincipal);
        } catch (error) {
            console.error('Error general revisando rol global:', error);
            setEsAdminGlobal(false);
            setRolGlobal(null);
        }
    };

    const cargarFeaturesEmpresa = async (empresaId: string) => {
        try {
            console.log('Cargando features del plan para empresa:', empresaId);

            const { data, error } = await supabase.rpc('mis_features_empresa', {
                p_empresa_id: empresaId,
            });

            if (error) {
                console.error('Error cargando features del plan:', error);
                setFeaturesPlan([]);
                return;
            }

            setFeaturesPlan((data || []) as PlanFeature[]);
            console.log('Features del plan cargadas:', data);
        } catch (error) {
            console.error('Error general cargando features del plan:', error);
            setFeaturesPlan([]);
        }
    };
    const limpiarNumeroPrecioPlan = (valor: string | null | undefined) => {
        return (valor || '').replace(/\D/g, '');
    };

    const formatearPrecioMensualPlan = (valor: string) => {
        const limpio = valor.replace(/\D/g, '');

        if (!limpio) return '';

        return `${Number(limpio).toLocaleString('es-CL')}/mes`;
    };

    const mostrarPrecioPlan = (precio: string | null | undefined) => {
        const texto = (precio || '').trim();

        if (!texto) return 'Sin precio';

        if (texto.toLowerCase().includes('/mes')) {
            return texto;
        }

        const soloNumeros = limpiarNumeroPrecioPlan(texto);

        if (soloNumeros) {
            return formatearPrecioMensualPlan(soloNumeros);
        }

        return texto;
    };
    const cargarPlanesSaas = async () => {
        try {
            setCargandoPlanesSaas(true);

            const { data, error } = await supabase.rpc('dueno_listar_planes_saas');

            if (error) {
                console.error('Error cargando planes SaaS:', error);

                mostrarModalSistema(
                    'error',
                    'No se pudieron cargar los planes',
                    error.message || 'Supabase rechazó la consulta de planes.',
                    'Revisa que la función dueno_listar_planes_saas exista y que tengas permisos de dueño.'
                );

                setPlanesSaas([]);
                return;
            }

            setPlanesSaas((data || []) as PlanSaasDueno[]);
        } catch (error: any) {
            console.error('Error general cargando planes SaaS:', error);

            mostrarModalSistema(
                'error',
                'Error inesperado',
                error?.message || 'Ocurrió un error cargando los planes.',
                'Revisa la consola del navegador.'
            );

            setPlanesSaas([]);
        } finally {
            setCargandoPlanesSaas(false);
        }
    };

    const abrirModalEditarPlan = (plan: PlanSaasDueno) => {
        setPlanEditando(plan);

        nombrePlanSaasRef.current = plan.nombre || '';
        subtituloPlanSaasRef.current = plan.subtitulo || '';
        precioPlanSaasRef.current = plan.precio || '';
        descripcionPlanSaasRef.current = plan.descripcion || '';

        limiteAdminPlanSaasRef.current =
            plan.limite_administrador === null ? '' : String(plan.limite_administrador);

        limiteSoportePlanSaasRef.current =
            plan.limite_soporte === null ? '' : String(plan.limite_soporte);

        limiteTecnicoPlanSaasRef.current =
            plan.limite_tecnico === null ? '' : String(plan.limite_tecnico);

        setLimiteAdminIlimitado(plan.limite_administrador === null);
        setLimiteSoporteIlimitado(plan.limite_soporte === null);
        setLimiteTecnicoIlimitado(plan.limite_tecnico === null);

        setPlanDestacadoEditando(plan.destacado);
        setPlanActivoEditando(plan.activo);

        setModalEditarPlanAbierto(true);
    };

    const leerLimitePlan = (
        texto: string,
        ilimitado: boolean,
        nombreRol: string
    ): number | null => {
        if (ilimitado) return null;

        const valorLimpio = texto.trim();

        if (valorLimpio === '') {
            return 0;
        }

        const numero = Number(valorLimpio);

        if (!Number.isInteger(numero) || numero < 0 || numero > 999) {
            throw new Error(`El límite de ${nombreRol} debe ser un número entero entre 0 y 999.`);
        }

        return numero;
    };

    const guardarPlanSaas = async () => {
        if (!planEditando) {
            mostrarModalSistema(
                'advertencia',
                'Plan no seleccionado',
                'No hay un plan seleccionado para guardar.',
                'Cierra el modal y vuelve a abrir Editar plan.'
            );
            return;
        }

        const nombre = nombrePlanSaasRef.current.trim();
        const subtitulo = subtituloPlanSaasRef.current.trim();
        const precioNumero = precioPlanSaasRef.current.trim();
        const precio = formatearPrecioMensualPlan(precioNumero);
        const descripcion = descripcionPlanSaasRef.current.trim();

        if (!nombre) {
            mostrarModalSistema(
                'advertencia',
                'Falta el nombre del plan',
                'Debes ingresar un nombre para el plan.',
                'Ejemplo: Gratis, Básico, Pro o Empresa.'
            );
            return;
        }

        try {
            setGuardandoPlanSaas(true);

            const limiteAdministrador = leerLimitePlan(
                limiteAdminPlanSaasRef.current,
                limiteAdminIlimitado,
                'Administrador'
            );

            const limiteSoporte = leerLimitePlan(
                limiteSoportePlanSaasRef.current,
                limiteSoporteIlimitado,
                'Soporte'
            );

            const limiteTecnico = leerLimitePlan(
                limiteTecnicoPlanSaasRef.current,
                limiteTecnicoIlimitado,
                'Técnico'
            );

            const { data, error } = await supabase.rpc('dueno_actualizar_plan_saas', {
                p_codigo: planEditando.codigo,
                p_nombre: nombre,
                p_subtitulo: subtitulo,
                p_precio: precio,
                p_descripcion: descripcion,
                p_destacado: planDestacadoEditando,
                p_activo: planActivoEditando,
                p_limite_administrador: limiteAdministrador,
                p_limite_soporte: limiteSoporte,
                p_limite_tecnico: limiteTecnico,
            });

            if (error) {
                const detalleError =
                    JSON.stringify(error, null, 2) ||
                    error.message ||
                    error.details ||
                    error.hint ||
                    'Supabase rechazó la actualización, pero no devolvió detalle visible.';

                console.log('Error actualizando plan SaaS completo:', detalleError);

                mostrarModalSistema(
                    'error',
                    'No se pudo actualizar el plan',
                    error.message || 'Supabase rechazó la actualización del plan.',
                    detalleError
                );

                return;
            }

            await cargarPlanesSaas();
            await cargarUsuariosDueno();
            await cargarEmpresasDueno();

            setModalEditarPlanAbierto(false);
            setPlanEditando(null);

            mostrarModalSistema(
                'exito',
                'Plan actualizado correctamente',
                data?.mensaje || `El plan ${nombre} fue actualizado.`,
                'Los límites ya quedaron guardados en Supabase.'
            );
        } catch (error: any) {
            console.error('Error general guardando plan SaaS:', error);

            mostrarModalSistema(
                'advertencia',
                'No se pudo guardar el plan',
                error?.message || 'Ocurrió un error al validar o guardar los límites.',
                'Revisa los valores ingresados.'
            );
        } finally {
            setGuardandoPlanSaas(false);
        }
    };

    const cargarEmpresasDueno = async () => {
        try {
            setCargandoEmpresasDueno(true);
            console.log('Cargando empresas desde Panel Dueño...');

            const { data, error } = await supabase.rpc('dueno_listar_empresas');

            if (error) {
                console.error('Error cargando empresas del Panel Dueño:', error);
                alert('No se pudieron cargar las empresas. Revisa permisos de dueño.');
                setEmpresasDueno([]);
                return;
            }

            setEmpresasDueno((data || []) as EmpresaDueno[]);
            console.log('Empresas cargadas para Panel Dueño:', data);
        } catch (error) {
            console.error('Error general cargando empresas del Panel Dueño:', error);
            setEmpresasDueno([]);
        } finally {
            setCargandoEmpresasDueno(false);
        }
    };
    const cambiarPlanEmpresaDueno = async (
        empresaId: string,
        planCodigo: 'gratis' | 'basico' | 'pro' | 'empresa'
    ) => {
        try {
            setGuardandoGestionEmpresa(true);

            console.log('Intentando cambiar plan:', {
                empresaId,
                planCodigo,
            });

            const { data, error } = await supabase.rpc('dueno_cambiar_plan_empresa', {
                p_empresa_id: empresaId,
                p_plan_codigo: planCodigo,
            });

            if (error) {
                console.error('Error Supabase cambiando plan:', error);

                alert(
                    `No se pudo cambiar el plan.\n\n` +
                    `Código: ${error.code || 'sin código'}\n` +
                    `Mensaje: ${error.message || 'sin mensaje'}\n` +
                    `Detalle: ${error.details || 'sin detalle'}`
                );

                return;
            }

            console.log('Plan cambiado correctamente:', data);

            await cargarEmpresasDueno();
            setEmpresaGestionSeleccionada(null);

            alert(`Plan cambiado correctamente a ${planCodigo}.`);
        } catch (error: any) {
            console.error('Error general cambiando plan:', error);

            alert(
                `Error general cambiando plan:\n\n` +
                `${error?.message || JSON.stringify(error)}`
            );
        } finally {
            setGuardandoGestionEmpresa(false);
        }
    };
    const cambiarEmpresaActualDueno = (empresaId: string) => {
        const empresaSeleccionada = empresasDueno.find(
            (empresa) => empresa.empresa_id === empresaId
        );

        if (!empresaSeleccionada) {
            mostrarModalSistema(
                'advertencia',
                'Empresa no encontrada',
                'No se encontró la empresa seleccionada en la lista del Panel Dueño.',
                'Presiona actualizar empresas e intenta nuevamente.'
            );
            return;
        }

        const nombreEmpresa = empresaSeleccionada.empresa || 'Sin empresa';
        const esDemo =
            empresaSeleccionada.modo_demo === true ||
            nombreEmpresa.trim().toUpperCase() === 'PRUEBA';

        sessionStorage.setItem('empresa_id', empresaSeleccionada.empresa_id);
        sessionStorage.setItem('empresa_nombre', nombreEmpresa);
        sessionStorage.setItem('empresa_modo_demo', String(esDemo));
        sessionStorage.setItem('empresa_activa', String(empresaSeleccionada.empresa_activa));

        localStorage.setItem('empresa_id', empresaSeleccionada.empresa_id);
        localStorage.setItem('empresa_nombre', nombreEmpresa);
        localStorage.setItem('empresa_modo_demo', String(esDemo));
        localStorage.setItem('empresa_activa', String(empresaSeleccionada.empresa_activa));

        setEmpresaModoDemo(esDemo);
        setEmpresaNombreActual(nombreEmpresa);

        setEmpresaActual({
            id: empresaSeleccionada.empresa_id,
            nombre: nombreEmpresa,
            rut_text: empresaSeleccionada.rut || undefined,
            activo: empresaSeleccionada.empresa_activa,
        });

        setSecciónActiva('dashboard');
    };
    const crearEmpresaDueno = async () => {
        const nombreLimpio = nombreNuevaEmpresaRef.current.trim();
        const rutLimpio = rutNuevaEmpresaRef.current.trim();

        if (!nombreLimpio) {
            mostrarModalSistema(
                'advertencia',
                'Falta el nombre de la empresa',
                'Debes escribir el nombre de la empresa antes de crearla.',
                'El RUT puede quedar vacío, pero el nombre es obligatorio.'
            );
            return;
        }

        try {
            setGuardandoNuevaEmpresa(true);

            const { data, error } = await supabase.rpc('dueno_crear_empresa', {
                p_nombre: nombreLimpio,
                p_rut: rutLimpio || null,
                p_plan_codigo: nuevaEmpresaDueno.plan_codigo,
                p_estado_suscripcion: nuevaEmpresaDueno.estado_suscripcion,
                p_activa: nuevaEmpresaDueno.activa,
            });

            if (error) {
                console.error('Error creando empresa:', error);

                mostrarModalSistema(
                    'error',
                    'No se pudo crear la empresa',
                    error.message || 'Supabase rechazó la creación de la empresa.',
                    'Revisa si el RUT ya existe o si la función dueno_crear_empresa está correctamente creada.'
                );

                return;
            }

            console.log('Empresa creada:', data);

            await cargarEmpresasDueno();
            nombreNuevaEmpresaRef.current = '';
            rutNuevaEmpresaRef.current = '';

            setNuevaEmpresaDueno({
                nombre: '',
                rut: '',
                plan_codigo: 'gratis',
                estado_suscripcion: 'trial',
                activa: true,
            });

            setMostrarModalNuevaEmpresa(false);

            mostrarModalSistema(
                'exito',
                'Empresa creada correctamente',
                `La empresa ${nombreLimpio} fue registrada en FleetVision.`,
                'Ya aparece en el módulo Empresas con su plan y estado inicial.'
            );
        } catch (error: any) {
            console.error('Error general creando empresa:', error);

            mostrarModalSistema(
                'error',
                'Error inesperado',
                error?.message || 'Ocurrió un error al crear la empresa.',
                'Intenta nuevamente o revisa la consola del navegador.'
            );
        } finally {
            setGuardandoNuevaEmpresa(false);
        }
    };

    const cambiarEstadoEmpresaDueno = async (empresaId: string, activa: boolean) => {
        try {
            setGuardandoGestionEmpresa(true);

            const { error } = await supabase.rpc('dueno_cambiar_estado_empresa', {
                p_empresa_id: empresaId,
                p_activa: activa,
            });

            if (error) throw error;

            await cargarEmpresasDueno();
            setEmpresaGestionSeleccionada(null);

            alert(activa ? 'Empresa activada correctamente.' : 'Empresa desactivada correctamente.');
        } catch (error) {
            console.error('Error cambiando estado de empresa:', error);
            alert('No se pudo cambiar el estado de la empresa.');
        } finally {
            setGuardandoGestionEmpresa(false);
        }
    };

    const cambiarEstadoSuscripcionDueno = async (
        empresaId: string,
        estado: 'trial' | 'activa' | 'vencida' | 'cancelada' | 'suspendida'
    ) => {
        try {
            setGuardandoGestionEmpresa(true);

            const { data, error } = await supabase.rpc('dueno_cambiar_estado_suscripcion', {
                p_empresa_id: empresaId,
                p_estado: estado,
            });

            if (error) {
                const detalleError =
                    JSON.stringify(error, null, 2) ||
                    error.message ||
                    error.details ||
                    error.hint ||
                    'Supabase rechazó el cambio de estado.';

                console.log('Error cambiando estado de suscripción:', detalleError);

                mostrarModalSistema(
                    'error',
                    'No se pudo cambiar la suscripción',
                    error.message || 'Supabase rechazó el cambio de estado.',
                    detalleError
                );

                return;
            }

            await cargarEmpresasDueno();

            setEmpresaGestionSeleccionada((prev) =>
                prev
                    ? {
                        ...prev,
                        estado_suscripcion: estado,
                    }
                    : prev
            );

            mostrarModalSistema(
                'exito',
                'Suscripción actualizada',
                `La empresa ahora quedó en estado ${estado}.`,
                data?.tabla_actualizada
                    ? `Actualizado en ${data.tabla_actualizada}.${data.columna_actualizada}`
                    : 'Cambio guardado correctamente en Supabase.'
            );
        } catch (error: any) {
            console.log('Error general cambiando estado de suscripción:', error);

            mostrarModalSistema(
                'error',
                'Error inesperado',
                error?.message || 'No se pudo cambiar el estado de suscripción.',
                'Revisa la consola o la función dueno_cambiar_estado_suscripcion.'
            );
        } finally {
            setGuardandoGestionEmpresa(false);
        }
    };
    const abrirModalConfirmarSuscripcion = (
        empresaId: string,
        empresaNombre: string,
        estado: 'trial' | 'activa' | 'vencida' | 'cancelada' | 'suspendida'
    ) => {
        setModalConfirmarSuscripcion({
            abierto: true,
            empresaId,
            empresaNombre,
            estado,
        });
    };

    const cerrarModalConfirmarSuscripcion = () => {
        setModalConfirmarSuscripcion(null);
    };

    const confirmarCambioSuscripcion = async () => {
        if (!modalConfirmarSuscripcion) return;

        const { empresaId, estado } = modalConfirmarSuscripcion;

        cerrarModalConfirmarSuscripcion();

        await cambiarEstadoSuscripcionDueno(empresaId, estado);
    };

    const extenderTrialEmpresaDueno = async (empresaId: string) => {
        const diasTexto = prompt('¿Cuántos días quieres agregar al trial? Ejemplo: 14');

        if (!diasTexto) return;

        const dias = Number(diasTexto);

        if (!Number.isInteger(dias) || dias <= 0 || dias > 365) {
            alert('Debes ingresar un número válido entre 1 y 365.');
            return;
        }

        try {
            setGuardandoGestionEmpresa(true);

            const { error } = await supabase.rpc('dueno_extender_trial_empresa', {
                p_empresa_id: empresaId,
                p_dias: dias,
            });

            if (error) throw error;

            await cargarEmpresasDueno();
            setEmpresaGestionSeleccionada(null);

            alert(`Trial extendido por ${dias} días.`);
        } catch (error) {
            console.error('Error extendiendo trial:', error);
            alert('No se pudo extender el trial.');
        } finally {
            setGuardandoGestionEmpresa(false);
        }
    };
    const cargarDiagnosticoDueno = async () => {
        try {
            setCargandoDiagnosticoDueno(true);
            console.log('Cargando diagnóstico general del Panel Dueño...');

            const { data, error } = await supabase.rpc('dueno_diagnostico_general');

            if (error) {
                console.error('Error cargando diagnóstico:', error);
                alert('No se pudo cargar el diagnóstico general.');
                setDiagnosticoDueno([]);
                return;
            }

            setDiagnosticoDueno((data || []) as DiagnosticoDueno[]);
            console.log('Diagnóstico cargado:', data);
        } catch (error) {
            console.error('Error general cargando diagnóstico:', error);
            setDiagnosticoDueno([]);
        } finally {
            setCargandoDiagnosticoDueno(false);
        }
    };
    const cargarSolicitudesPrueba = async () => {
        try {
            setCargandoSolicitudesPrueba(true);

            const { data, error } = await supabase.rpc('dueno_listar_solicitudes_prueba');

            if (error) {
                console.log('Error cargando solicitudes de prueba:', error);

                mostrarModalSistema(
                    'error',
                    'No se pudieron cargar las solicitudes',
                    error.message || 'Supabase rechazó la consulta.',
                    'Revisa la función dueno_listar_solicitudes_prueba.'
                );

                setSolicitudesPrueba([]);
                return;
            }

            setSolicitudesPrueba((data || []) as SolicitudPruebaDueno[]);
        } catch (error: any) {
            console.log('Error general cargando solicitudes:', error);

            mostrarModalSistema(
                'error',
                'Error inesperado',
                error?.message || 'Ocurrió un error cargando las solicitudes.',
                'Revisa la consola del navegador.'
            );

            setSolicitudesPrueba([]);
        } finally {
            setCargandoSolicitudesPrueba(false);
        }
    };

    const cambiarEstadoSolicitudPrueba = async (
        solicitudId: number,
        estado: EstadoSolicitudPrueba
    ) => {
        try {
            setGuardandoSolicitudPrueba(true);

            const { data, error } = await supabase.rpc('dueno_cambiar_estado_solicitud_prueba', {
                p_contacto_id: solicitudId,
                p_estado: estado,
                p_notas: null,
            });

            if (error) {
                const detalleError =
                    JSON.stringify(error, null, 2) ||
                    error.message ||
                    'Supabase rechazó el cambio de estado.';

                mostrarModalSistema(
                    'error',
                    'No se pudo cambiar el estado',
                    error.message || 'Supabase rechazó el cambio de estado.',
                    detalleError
                );

                return;
            }

            await cargarSolicitudesPrueba();

            mostrarModalSistema(
                'exito',
                'Solicitud actualizada',
                data?.mensaje || 'El estado de la solicitud fue actualizado.',
                `Nuevo estado: ${estado}`
            );
        } catch (error: any) {
            console.log('Error general cambiando solicitud:', error);

            mostrarModalSistema(
                'error',
                'Error inesperado',
                error?.message || 'No se pudo cambiar el estado de la solicitud.',
                'Revisa la consola del navegador.'
            );
        } finally {
            setGuardandoSolicitudPrueba(false);
        }
    };
    const abrirModalConvertirSolicitud = (solicitud: SolicitudPruebaDueno) => {
        console.log('Abriendo modal convertir solicitud:', solicitud);

        setSolicitudParaConvertir(solicitud);
        setTipoClienteSolicitud('empresa');
        setPlanTrialSolicitud('pro');
        setModalConvertirSolicitudAbierto(true);
    };

    const cerrarModalConvertirSolicitud = () => {
        setModalConvertirSolicitudAbierto(false);
        setSolicitudParaConvertir(null);
        setTipoClienteSolicitud('empresa');
        setPlanTrialSolicitud('pro');
    };

    const convertirSolicitudAEmpresa = async () => {
        if (!solicitudParaConvertir) {
            mostrarModalSistema(
                'advertencia',
                'Solicitud no seleccionada',
                'No hay una solicitud seleccionada para crear usuario demo.',
                'Cierra el modal y vuelve a intentarlo.'
            );
            return;
        }

        const passwordTemporal = passwordDemoSolicitudRef.current.trim();

        if (!passwordTemporal || passwordTemporal.length < 6) {
            mostrarModalSistema(
                'advertencia',
                'Contraseña inválida',
                'La contraseña temporal debe tener al menos 6 caracteres.',
                'Ejemplo: FleetVision123'
            );
            return;
        }

        try {
            setConvirtiendoSolicitud(true);

            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError || !session?.access_token) {
                mostrarModalSistema(
                    'error',
                    'Sesión no válida',
                    'No se pudo obtener tu sesión actual.',
                    'Cierra sesión, vuelve a entrar e intenta nuevamente.'
                );
                return;
            }

            const respuesta = await fetch('/api/admin/crear-usuario-demo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    contacto_id: solicitudParaConvertir.id,
                    password: passwordTemporal,
                }),
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok || !resultado.ok) {
                mostrarModalSistema(
                    'error',
                    'No se pudo crear el usuario demo',
                    resultado.error || 'La ruta segura rechazó la creación.',
                    resultado.detalle || 'Revisa la consola o la terminal de Next.js.'
                );
                return;
            }

            await cargarSolicitudesPrueba();
            await cargarUsuariosDueno();
            await cargarEmpresasDueno();

            cerrarModalConvertirSolicitud();

            mostrarModalSistema(
                'exito',
                'Usuario demo creado',
                resultado.mensaje || 'El acceso demo fue creado correctamente.',
                `Usuario: ${resultado.usuario?.username || 'creado'} · Correo: ${resultado.usuario?.email || solicitudParaConvertir.correo || 'sin correo'} · Contraseña temporal: ${passwordTemporal}`
            );
        } catch (error: any) {
            console.log('Error creando usuario demo:', error);

            mostrarModalSistema(
                'error',
                'Error inesperado',
                error?.message || 'No se pudo crear el usuario demo.',
                'Revisa la consola del navegador y la terminal de Next.js.'
            );
        } finally {
            setConvirtiendoSolicitud(false);
        }
    };
    const obtenerEstadoSolicitudVisual = (estado: string | null) => {
        switch (estado) {
            case 'nueva':
                return {
                    texto: 'Nueva',
                    clase: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
                    icono: '🆕',
                };
            case 'contactada':
                return {
                    texto: 'Contactada',
                    clase: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
                    icono: '📞',
                };
            case 'en_evaluacion':
                return {
                    texto: 'En evaluación',
                    clase: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
                    icono: '🔎',
                };
            case 'convertida':
                return {
                    texto: 'Convertida',
                    clase: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
                    icono: '✅',
                };
            case 'rechazada':
                return {
                    texto: 'Rechazada',
                    clase: 'border-red-500/30 bg-red-500/10 text-red-300',
                    icono: '❌',
                };
            default:
                return {
                    texto: 'Sin estado',
                    clase: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
                    icono: 'ℹ️',
                };
        }
    };

    const solicitudesFiltradas = solicitudesPrueba.filter((solicitud) => {
        if (filtroEstadoSolicitud === 'todas') return true;

        return solicitud.estado === filtroEstadoSolicitud;
    });

    const cargarUsuariosDueno = async () => {
        try {
            setCargandoUsuariosDueno(true);
            console.log('Cargando usuarios del Panel Dueño...');

            const [respuestaUsuarios, respuestaRoles] = await Promise.all([
                supabase.rpc('dueno_listar_usuarios_empresas'),
                supabase.rpc('dueno_listar_roles_empresa'),
            ]);

            if (respuestaUsuarios.error) {
                console.error('Error cargando usuarios:', respuestaUsuarios.error);
                alert('No se pudieron cargar los usuarios.');
                setUsuariosDueno([]);
                return;
            }

            if (respuestaRoles.error) {
                console.error('Error cargando roles:', respuestaRoles.error);
                setRolesEmpresaDueno([]);
            } else {
                setRolesEmpresaDueno((respuestaRoles.data || []) as RolEmpresaDueno[]);
            }

            setUsuariosDueno((respuestaUsuarios.data || []) as UsuarioDueno[]);

            console.log('Usuarios cargados:', respuestaUsuarios.data);
            console.log('Roles cargados:', respuestaRoles.data);
        } catch (error) {
            console.error('Error general cargando usuarios del Panel Dueño:', error);
            setUsuariosDueno([]);
        } finally {
            setCargandoUsuariosDueno(false);
        }
    };
    const cambiarRolUsuarioDueno = async (
        usuarioEmpresaId: string,
        rolId: string
    ) => {
        try {
            setGuardandoGestionUsuario(true);

            console.log('Cambiando rol de usuario:', {
                usuarioEmpresaId,
                rolId,
            });

            const { data, error } = await supabase.rpc('dueno_cambiar_rol_usuario_empresa', {
                p_usuario_empresa_id: usuarioEmpresaId,
                p_rol_id: rolId,
            });

            if (error) {
                console.error('Error Supabase cambiando rol:', error);

                mostrarModalSistema(
                    'advertencia',
                    'No se pudo cambiar el rol',
                    error.message || 'El sistema bloqueó este cambio por seguridad.',
                    'Revisa el plan de la empresa y los límites permitidos para administrador, soporte y técnico.'
                );

                return;
            }

            console.log('Rol cambiado correctamente:', data);

            await cargarUsuariosDueno();
            setUsuarioGestionSeleccionado(null);

            mostrarModalSistema(
                'exito',
                'Rol cambiado correctamente',
                'El usuario fue actualizado y el cambio quedó guardado en FleetVision.'
            );
        } catch (error: any) {
            console.error('Error general cambiando rol:', error);

            mostrarModalSistema(
                'error',
                'Error inesperado',
                error?.message || 'Ocurrió un problema al intentar cambiar el rol.',
                'Intenta nuevamente o revisa la consola del navegador.'
            );
        } finally {
            setGuardandoGestionUsuario(false);
        }
    };
    const cambiarEmpresaUsuarioDueno = async () => {
        if (!usuarioGestionSeleccionado) {
            mostrarModalSistema(
                'advertencia',
                'Usuario no seleccionado',
                'No hay un usuario seleccionado para cambiar de empresa.',
                'Cierra el modal y vuelve a abrir Gestionar.'
            );
            return;
        }

        const empresaDestino =
            empresaDestinoUsuario || usuarioGestionSeleccionado.empresa_id;

        const rolDestino =
            rolDestinoUsuario || usuarioGestionSeleccionado.rol_nombre || 'Administrador';

        if (!empresaDestino) {
            mostrarModalSistema(
                'advertencia',
                'Selecciona una empresa',
                'Debes elegir la empresa destino antes de guardar.',
                'El usuario quedará vinculado a esa empresa.'
            );
            return;
        }

        try {
            setGuardandoCambioEmpresaUsuario(true);

            const { data, error } = await supabase.rpc('dueno_cambiar_empresa_usuario', {
                p_usuario_empresa_id: usuarioGestionSeleccionado.usuario_empresa_id || null,
                p_usuario_id: usuarioGestionSeleccionado.usuario_id,
                p_empresa_id_destino: empresaDestino,
                p_rol_nombre: rolDestino,
            });

            if (error) {
                console.error('Error cambiando empresa del usuario:', error);

                mostrarModalSistema(
                    'error',
                    'No se pudo cambiar la empresa',
                    error.message || 'Supabase rechazó el cambio de empresa.',
                    error.details || 'Revisa la función dueno_cambiar_empresa_usuario.'
                );

                return;
            }

            await cargarUsuariosDueno();
            await cargarEmpresasDueno();

            setUsuarioGestionSeleccionado(null);
            setEmpresaDestinoUsuario('');
            setRolDestinoUsuario('Administrador');

            mostrarModalSistema(
                'exito',
                'Usuario movido correctamente',
                data?.mensaje || 'El usuario fue cambiado de empresa.',
                `Nueva empresa: ${data?.empresa || 'actualizada'} · Rol: ${data?.rol || rolDestino}`
            );
        } catch (error: any) {
            console.error('Error general cambiando empresa del usuario:', error);

            mostrarModalSistema(
                'error',
                'Error inesperado',
                error?.message || 'Ocurrió un problema al cambiar la empresa del usuario.',
                'Revisa la consola del navegador.'
            );
        } finally {
            setGuardandoCambioEmpresaUsuario(false);
        }
    };

    const abrirModalEditarUsuario = (usuario: UsuarioDueno) => {
        setFormEditarUsuario({
            usuario_id: usuario.usuario_id || '',
            auth_id: usuario.auth_id || '',
            username: usuario.username || '',
            apellido: usuario.apellido || '',
            email: '',
            activo: usuario.usuario_activo ?? true,
        });

        setModalEditarUsuarioAbierto(true);
    };
    const guardarEditarUsuario = async () => {
        const username = usernameEditarUsuarioRef.current.trim();
        const apellido = apellidoEditarUsuarioRef.current.trim();
        const email = emailEditarUsuarioRef.current.trim().toLowerCase();

        if (!formEditarUsuario.usuario_id) {
            mostrarModalSistema(
                'advertencia',
                'Usuario no válido',
                'No se encontró el ID del usuario que quieres editar.',
                'Cierra el modal, vuelve a abrir Gestionar e intenta nuevamente.'
            );
            return;
        }

        if (!formEditarUsuario.auth_id) {
            mostrarModalSistema(
                'advertencia',
                'Auth ID no encontrado',
                'No se encontró el auth_id del usuario.',
                'Este dato es necesario para modificar el correo en Supabase Auth.'
            );
            return;
        }

        if (!username) {
            mostrarModalSistema(
                'advertencia',
                'Falta el nombre de usuario',
                'Debes ingresar un nombre de usuario.',
                'Ejemplo: tecnico1, soporte_avalos, juan.'
            );
            return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            mostrarModalSistema(
                'advertencia',
                'Correo inválido',
                'El correo ingresado no tiene un formato válido.',
                'Ejemplo válido: usuario@empresa.cl'
            );
            return;
        }

        try {
            setGuardandoEditarUsuario(true);

            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !sessionData.session?.access_token) {
                mostrarModalSistema(
                    'error',
                    'Sesión no válida',
                    'No se pudo obtener tu sesión actual.',
                    'Cierra sesión, vuelve a entrar e intenta nuevamente.'
                );
                return;
            }

            const respuesta = await fetch('/api/admin/editar-usuario', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionData.session.access_token}`,
                },
                body: JSON.stringify({
                    usuario_id: formEditarUsuario.usuario_id,
                    auth_id: formEditarUsuario.auth_id,
                    username,
                    apellido,
                    email,
                    activo: formEditarUsuario.activo,
                }),
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok || !resultado.ok) {
                mostrarModalSistema(
                    'advertencia',
                    'No se pudo editar el usuario',
                    resultado.error || 'La ruta segura rechazó la edición del usuario.',
                    resultado.detalle || 'Revisa si el username ya existe o si el correo ya está registrado.'
                );
                return;
            }

            await cargarUsuariosDueno();

            usernameEditarUsuarioRef.current = '';
            apellidoEditarUsuarioRef.current = '';
            emailEditarUsuarioRef.current = '';

            setModalEditarUsuarioAbierto(false);
            setUsuarioGestionSeleccionado(null);

            setFormEditarUsuario({
                usuario_id: '',
                auth_id: '',
                username: '',
                apellido: '',
                email: '',
                activo: true,
            });

            mostrarModalSistema(
                'exito',
                'Usuario actualizado correctamente',
                resultado.mensaje || 'Los datos del usuario fueron actualizados.',
                'El cambio ya aparece en el módulo Usuarios del Panel Dueño.'
            );
        } catch (error: any) {
            console.error('Error general editando usuario:', error);

            mostrarModalSistema(
                'error',
                'Error inesperado',
                error?.message || 'Ocurrió un problema al editar el usuario.',
                'Revisa la consola del navegador y la terminal de Next.js.'
            );
        } finally {
            setGuardandoEditarUsuario(false);
        }
    };
    const abrirModalBorrarUsuario = () => {
        if (!usuarioGestionSeleccionado) {
            mostrarModalSistema(
                'advertencia',
                'Usuario no seleccionado',
                'No hay un usuario seleccionado para borrar.',
                'Cierra el modal y vuelve a abrir Gestionar.'
            );
            return;
        }

        confirmacionBorrarUsuarioRef.current = '';
        setModoConfirmacionDefinitiva(false);
        setErrorModalBorrarUsuario('');
        setModalBorrarUsuarioAbierto(true);
    };

    const ejecutarBorradoUsuarioSeguro = async (confirmacion = '') => {
        if (!usuarioGestionSeleccionado) {
            mostrarModalSistema(
                'advertencia',
                'Usuario no seleccionado',
                'No hay un usuario seleccionado para borrar.',
                'Cierra el modal y vuelve a abrir Gestionar.'
            );
            return;
        }

        try {
            setBorrandoUsuario(true);
            setErrorModalBorrarUsuario('');

            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !sessionData.session?.access_token) {
                setModalBorrarUsuarioAbierto(false);

                mostrarModalSistema(
                    'error',
                    'Sesión no válida',
                    'No se pudo obtener tu sesión actual.',
                    'Cierra sesión, vuelve a entrar e intenta nuevamente.'
                );
                return;
            }

            const respuesta = await fetch('/api/admin/borrar-usuario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionData.session.access_token}`,
                },
                body: JSON.stringify({
                    usuario_id: usuarioGestionSeleccionado.usuario_id,
                    auth_id: usuarioGestionSeleccionado.auth_id,
                    empresa_id: usuarioGestionSeleccionado.empresa_id,
                    usuario_empresa_id: usuarioGestionSeleccionado.usuario_empresa_id,
                    confirmacion,
                }),
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok || !resultado.ok) {
                setModalBorrarUsuarioAbierto(false);

                mostrarModalSistema(
                    'advertencia',
                    'No se pudo revisar el usuario',
                    resultado.error || 'La ruta segura rechazó la revisión.',
                    resultado.detalle || 'Revisa la consola o la terminal de Next.js.'
                );
                return;
            }

            if (resultado.accion === 'requiere_confirmacion_definitiva') {
                confirmacionBorrarUsuarioRef.current = '';
                setModoConfirmacionDefinitiva(true);
                setErrorModalBorrarUsuario('');
                return;
            }

            await cargarUsuariosDueno();
            await cargarEmpresasDueno();

            setModalBorrarUsuarioAbierto(false);
            setUsuarioGestionSeleccionado(null);

            if (resultado.accion === 'borrado_definitivo') {
                mostrarModalSistema(
                    'exito',
                    'Usuario eliminado definitivamente',
                    resultado.mensaje || 'El usuario fue eliminado correctamente.',
                    resultado.detalle || 'Se eliminó de la empresa, de public.usuarios y de Supabase Auth.'
                );
                return;
            }

            if (resultado.accion === 'vinculo_eliminado') {
                mostrarModalSistema(
                    'info',
                    'Vínculo eliminado',
                    resultado.mensaje || 'El usuario fue desvinculado de esta empresa.',
                    resultado.detalle || 'No se eliminó porque todavía pertenece a otra empresa.'
                );
                return;
            }

            if (resultado.accion === 'desactivado_por_historial') {
                mostrarModalSistema(
                    'advertencia',
                    'Usuario desactivado por trazabilidad',
                    resultado.mensaje || 'El usuario tiene historial y no se eliminó.',
                    resultado.detalle || 'Se dejó inactivo para conservar trazabilidad.'
                );
                return;
            }

            if (resultado.accion === 'desactivado_por_revision_insegura') {
                mostrarModalSistema(
                    'advertencia',
                    'Usuario desactivado por seguridad',
                    resultado.mensaje || 'No se pudo revisar toda la trazabilidad.',
                    resultado.detalle || 'Se dejó inactivo para evitar pérdida de historial.'
                );
                return;
            }

            mostrarModalSistema(
                'exito',
                'Acción completada',
                resultado.mensaje || 'La acción sobre el usuario fue completada.',
                resultado.detalle || ''
            );
        } catch (error: any) {
            console.error('Error general borrando usuario:', error);

            setModalBorrarUsuarioAbierto(false);

            mostrarModalSistema(
                'error',
                'Error inesperado',
                error?.message || 'Ocurrió un problema al borrar el usuario.',
                'Revisa la consola del navegador y la terminal de Next.js.'
            );
        } finally {
            setBorrandoUsuario(false);
        }
    };

    const confirmarBorradoDefinitivo = async () => {
        const texto = confirmacionBorrarUsuarioRef.current.trim();

        if (texto !== 'BORRAR DEFINITIVO') {
            setErrorModalBorrarUsuario(
                'Debes escribir exactamente BORRAR DEFINITIVO para continuar.'
            );
            return;
        }

        await ejecutarBorradoUsuarioSeguro('BORRAR DEFINITIVO');
    };
    const abrirModalVincularUsuario = async () => {
        setMostrarModalVincularUsuario(true);
        setUsuarioSeleccionadoParaVincular(null);
        setEmpresaSeleccionadaParaVincular('');
        setRolSeleccionadoParaVincular('');
        setUsuariosParaVincular([]);
        busquedaUsuarioVincularRef.current = '';

        try {
            if (empresasDueno.length === 0) {
                await cargarEmpresasDueno();
            }

            if (rolesEmpresaDueno.length === 0 || usuariosDueno.length === 0) {
                await cargarUsuariosDueno();
            }
        } catch (error) {
            console.error('Error preparando modal de vincular usuario:', error);

            mostrarModalSistema(
                'error',
                'No se pudieron cargar los datos',
                'No fue posible cargar empresas o roles para vincular el usuario.',
                'Intenta presionar Actualizar usuarios o revisa la consola del navegador.'
            );
        }
    };
    const buscarUsuariosParaVincular = async () => {
        try {
            setBuscandoUsuariosVincular(true);

            const busqueda = busquedaUsuarioVincularRef.current.trim();

            const { data, error } = await supabase.rpc('dueno_buscar_usuarios_para_vincular', {
                p_busqueda: busqueda,
            });

            if (error) {
                console.error('Error buscando usuarios para vincular:', error);

                mostrarModalSistema(
                    'error',
                    'No se pudieron buscar usuarios',
                    error.message || 'Supabase rechazó la búsqueda de usuarios.',
                    'Revisa que la función dueno_buscar_usuarios_para_vincular exista y que tengas permisos de dueño.'
                );

                setUsuariosParaVincular([]);
                return;
            }

            setUsuariosParaVincular((data || []) as UsuarioParaVincular[]);
        } catch (error: any) {
            console.error('Error general buscando usuarios:', error);

            mostrarModalSistema(
                'error',
                'Error inesperado',
                error?.message || 'Ocurrió un error al buscar usuarios.',
                'Intenta nuevamente o revisa la consola del navegador.'
            );

            setUsuariosParaVincular([]);
        } finally {
            setBuscandoUsuariosVincular(false);
        }
    };

    const vincularUsuarioEmpresaDueno = async () => {
        if (!usuarioSeleccionadoParaVincular) {
            mostrarModalSistema(
                'advertencia',
                'Selecciona un usuario',
                'Debes elegir un usuario de la lista antes de vincularlo.',
                'Primero busca por username, apellido o ID y luego selecciona un usuario.'
            );
            return;
        }

        if (!empresaSeleccionadaParaVincular) {
            mostrarModalSistema(
                'advertencia',
                'Selecciona una empresa',
                'Debes elegir la empresa donde quieres vincular este usuario.',
                'El usuario quedará asociado a esa empresa.'
            );
            return;
        }

        if (!rolSeleccionadoParaVincular) {
            mostrarModalSistema(
                'advertencia',
                'Selecciona un rol',
                'Debes elegir el rol que tendrá este usuario en la empresa.',
                'El sistema validará automáticamente si el plan permite ese rol.'
            );
            return;
        }

        try {
            setGuardandoVincularUsuario(true);

            const { data, error } = await supabase.rpc('dueno_vincular_usuario_empresa', {
                p_usuario_id: usuarioSeleccionadoParaVincular.usuario_id,
                p_empresa_id: empresaSeleccionadaParaVincular,
                p_rol_id: rolSeleccionadoParaVincular,
            });

            if (error) {
                console.error('Error vinculando usuario:', error);

                mostrarModalSistema(
                    'advertencia',
                    'No se pudo vincular el usuario',
                    error.message || 'El sistema bloqueó esta vinculación.',
                    'Revisa si el plan de la empresa permite más usuarios o más roles de ese tipo.'
                );

                return;
            }

            console.log('Usuario vinculado correctamente:', data);

            await cargarUsuariosDueno();
            await cargarEmpresasDueno();

            setMostrarModalVincularUsuario(false);
            setUsuarioSeleccionadoParaVincular(null);
            setEmpresaSeleccionadaParaVincular('');
            setRolSeleccionadoParaVincular('');
            setUsuariosParaVincular([]);
            busquedaUsuarioVincularRef.current = '';

            mostrarModalSistema(
                'exito',
                'Usuario vinculado correctamente',
                'El usuario fue asociado a la empresa y el rol quedó guardado.',
                'Ya aparecerá en el módulo Usuarios del Panel Dueño.'
            );
        } catch (error: any) {
            console.error('Error general vinculando usuario:', error);

            mostrarModalSistema(
                'error',
                'Error inesperado',
                error?.message || 'Ocurrió un error al vincular el usuario.',
                'Intenta nuevamente o revisa la consola del navegador.'
            );
        } finally {
            setGuardandoVincularUsuario(false);
        }
    };
    const abrirModalCrearUsuario = async () => {
        setMostrarModalCrearUsuario(true);
        setEmpresaCrearUsuario('');
        setRolCrearUsuario('');
        setActivoCrearUsuario(true);

        emailCrearUsuarioRef.current = '';
        passwordCrearUsuarioRef.current = '';
        usernameCrearUsuarioRef.current = '';
        apellidoCrearUsuarioRef.current = '';

        try {
            if (empresasDueno.length === 0) {
                await cargarEmpresasDueno();
            }

            if (rolesEmpresaDueno.length === 0) {
                await cargarUsuariosDueno();
            }
        } catch (error) {
            console.error('Error preparando modal crear usuario:', error);

            mostrarModalSistema(
                'error',
                'No se pudieron cargar los datos',
                'No fue posible cargar empresas o roles para crear el usuario.',
                'Intenta presionar Actualizar usuarios o revisa la consola del navegador.'
            );
        }
    };

    const crearUsuarioNuevoDueno = async () => {
        const email = emailCrearUsuarioRef.current.trim().toLowerCase();
        const password = passwordCrearUsuarioRef.current.trim();
        const username = usernameCrearUsuarioRef.current.trim();
        const apellido = apellidoCrearUsuarioRef.current.trim();

        if (!email) {
            mostrarModalSistema(
                'advertencia',
                'Falta el correo',
                'Debes ingresar el correo del nuevo usuario.',
                'Este correo será usado para iniciar sesión.'
            );
            return;
        }

        if (!password || password.length < 6) {
            mostrarModalSistema(
                'advertencia',
                'Contraseña inválida',
                'La contraseña debe tener al menos 6 caracteres.',
                'Usa una contraseña temporal y luego el usuario podrá cambiarla.'
            );
            return;
        }

        if (!username) {
            mostrarModalSistema(
                'advertencia',
                'Falta el nombre de usuario',
                'Debes ingresar el nombre del usuario.',
                'Ejemplo: juan, tecnico1, soporte_avalos.'
            );
            return;
        }

        if (!empresaCrearUsuario) {
            mostrarModalSistema(
                'advertencia',
                'Selecciona una empresa',
                'Debes elegir la empresa donde quedará vinculado el usuario.',
                'El usuario quedará asociado a esa empresa desde su creación.'
            );
            return;
        }

        if (!rolCrearUsuario) {
            mostrarModalSistema(
                'advertencia',
                'Selecciona un rol',
                'Debes elegir el rol inicial del usuario.',
                'El sistema validará automáticamente los límites del plan.'
            );
            return;
        }

        try {
            setGuardandoCrearUsuario(true);

            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !sessionData.session?.access_token) {
                mostrarModalSistema(
                    'error',
                    'Sesión no válida',
                    'No se pudo obtener tu sesión actual.',
                    'Cierra sesión, vuelve a entrar e intenta nuevamente.'
                );
                return;
            }

            const rolSeleccionado = rolesEmpresaDueno.find(
                (rol) => rol.rol_id === rolCrearUsuario
            );

            const respuesta = await fetch('/api/admin/crear-usuario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionData.session.access_token}`,
                },
                body: JSON.stringify({
                    email,
                    password,
                    username,
                    apellido,
                    rol_texto: rolSeleccionado?.rol_codigo || 'usuario',
                    empresa_id: empresaCrearUsuario,
                    rol_id: rolCrearUsuario,
                    activo: activoCrearUsuario,
                }),
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok || !resultado.ok) {
                mostrarModalSistema(
                    'advertencia',
                    'No se pudo crear el usuario',
                    resultado.error || 'La ruta segura rechazó la creación del usuario.',
                    resultado.detalle || 'Revisa si el correo ya existe o si el plan permite ese rol.'
                );
                return;
            }

            await cargarUsuariosDueno();
            await cargarEmpresasDueno();

            emailCrearUsuarioRef.current = '';
            passwordCrearUsuarioRef.current = '';
            usernameCrearUsuarioRef.current = '';
            apellidoCrearUsuarioRef.current = '';

            setEmpresaCrearUsuario('');
            setRolCrearUsuario('');
            setActivoCrearUsuario(true);
            setMostrarModalCrearUsuario(false);

            mostrarModalSistema(
                'exito',
                'Usuario creado correctamente',
                `El usuario ${username} fue creado y vinculado a la empresa.`,
                'Ya puede iniciar sesión con el correo y contraseña que definiste.'
            );
        } catch (error: any) {
            console.error('Error general creando usuario nuevo:', error);

            mostrarModalSistema(
                'error',
                'Error inesperado',
                error?.message || 'Ocurrió un problema al crear el usuario.',
                'Revisa la consola del navegador y la terminal de Next.js.'
            );
        } finally {
            setGuardandoCrearUsuario(false);
        }
    };

    const fijarFechaTrialEmpresaDueno = async (empresaId: string) => {
        const fechaTexto = prompt('Ingresa la fecha exacta de término del trial. Ejemplo: 2026-07-01');

        if (!fechaTexto) return;

        const fecha = new Date(`${fechaTexto}T23:59:59`);

        if (Number.isNaN(fecha.getTime())) {
            alert('Fecha inválida. Usa formato YYYY-MM-DD, por ejemplo: 2026-07-01.');
            return;
        }

        try {
            setGuardandoGestionEmpresa(true);

            const { error } = await supabase.rpc('dueno_fijar_trial_empresa', {
                p_empresa_id: empresaId,
                p_trial_ends_at: fecha.toISOString(),
            });

            if (error) throw error;

            await cargarEmpresasDueno();
            setEmpresaGestionSeleccionada(null);

            alert(`Trial fijado hasta ${fecha.toLocaleDateString('es-CL')}.`);
        } catch (error) {
            console.error('Error fijando fecha de trial:', error);
            alert('No se pudo fijar la fecha del trial.');
        } finally {
            setGuardandoGestionEmpresa(false);
        }
    };

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
                    próximoMantenimiento: new Date(
                        activo.proximo_mantenimiento || Date.now() + 30 * 24 * 60 * 60 * 1000
                    ),
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
                    .order('fecha_creacion', { ascending: false });

                if (ordenesError) {
                    console.log('Error cargando órdenes:', ordenesError);
                    setÓrdenesTrabajo([]);
                } else if (ordenesData) {
                    const ordenesTransformadas: OrdenTrabajo[] = ordenesData.map((orden: any) => ({
                        id: orden.id,
                        número: orden.numero_ot || orden.numero || `OT-${orden.id.substring(0, 8)}`,
                        descripción: orden.descripcion,
                        estado: orden.estado || 'creada',
                        prioridad: orden.prioridad || 'media',
                        fechaCreación: new Date(orden.fecha_creacion || orden.created_at || Date.now()),
                        fechaLímite: new Date(orden.fecha_limite || Date.now()),
                        asignadoA: orden.asignado_a || 'Sin asignar',
                        tipo: orden.tipo || 'Preventivo',
                        activo: orden.activo || orden.activo_id || 'Sin activo',
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

            if (empresaModoDemo) {
                const demoId =
                    typeof crypto !== 'undefined' && crypto.randomUUID
                        ? crypto.randomUUID()
                        : `demo-${Date.now()}`;

                const nuevaOrdenDemo: OrdenTrabajo = {
                    id: demoId,
                    número: `DEMO-${demoId.substring(0, 8)}`,
                    descripción: 'Nueva orden de trabajo demo',
                    estado: 'creada',
                    prioridad: 'media',
                    fechaCreación: new Date(),
                    fechaLímite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    asignadoA: datosUsuario?.nombre || 'Usuario demo',
                    tipo: 'Preventivo',
                    activo: 'Activo de prueba',
                    costoEstimado: 0,
                    costoReal: 0,
                    empresa_id: empresaActual.id
                };

                setÓrdenesTrabajo(prev => [nuevaOrdenDemo, ...prev]);

                mostrarAccionDemo(
                    'OT simulada correctamente',
                    'La orden de trabajo fue creada visualmente para la demostración, pero no se guardó en Supabase.'
                );

                return;
            }

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

            mostrarModalSistema(
                'error',
                'No se pudo crear la orden',
                'Ocurrió un error al crear la orden de trabajo.',
                error instanceof Error ? error.message : 'Error desconocido'
            );
        }
    };

    const manejarCrearNuevaOrden = () => {
        if (empresaModoDemo) {
            mostrarAccionDemo(
                'Modo demo activado',
                'Puedes probar el flujo de órdenes de trabajo. Al crear la OT, será simulada y no quedará registrada en Supabase.'
            );
        }

        crearNuevaOrden();
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
        const tieneFeatureSidebar = (feature: string) => {
            return featuresPlan.some(
                (item) => item.feature === feature && item.habilitado === true
            );
        };

        type RolSidebar = 'administrador' | 'soporte' | 'tecnico' | 'sin_rol';

        const normalizarRolSidebar = (rol?: string | null): RolSidebar => {
            const limpio = (rol || '')
                .trim()
                .toLowerCase()
                .replace('é', 'e')
                .replace('ñ', 'n');

            if (limpio === 'administrador') return 'administrador';
            if (limpio === 'soporte') return 'soporte';
            if (limpio === 'tecnico') return 'tecnico';

            // Algunas cuentas antiguas tienen rol "dueno" en public.usuarios.
            // Para el sidebar de empresa, eso se trata como administrador.
            if (limpio === 'dueno' || limpio === 'owner') return 'administrador';

            return 'sin_rol';
        };

        const obtenerRolSidebarActual = (): RolSidebar => {
            if (esAdminGlobal) {
                return 'administrador';
            }

            const datosUsuarioConRol = datosUsuario as (Usuario & {
                rol_empresa?: string | null;
                rol_nombre?: string | null;
            }) | null;

            const rolDesdeDatosUsuario = normalizarRolSidebar(
                datosUsuarioConRol?.rol_empresa ||
                datosUsuarioConRol?.rol_nombre ||
                datosUsuarioConRol?.rol
            );

            if (rolDesdeDatosUsuario !== 'sin_rol') {
                return rolDesdeDatosUsuario;
            }

            if (typeof window === 'undefined') return 'sin_rol';

            try {
                const userDataRaw =
                    sessionStorage.getItem('user_data') ||
                    localStorage.getItem('user_data');

                const userData = userDataRaw ? JSON.parse(userDataRaw) : null;

                const rolDesdeStorage = normalizarRolSidebar(
                    userData?.rol_empresa ||
                    userData?.rol_nombre ||
                    userData?.rol ||
                    sessionStorage.getItem('user_role') ||
                    localStorage.getItem('user_role')
                );

                return rolDesdeStorage;
            } catch {
                return normalizarRolSidebar(
                    sessionStorage.getItem('user_role') ||
                    localStorage.getItem('user_role')
                );
            }
        };

        const rolSidebarActual = obtenerRolSidebarActual();
        console.log('ROL SIDEBAR ACTUAL:', rolSidebarActual);


        const secciones = [
            {
                id: 'dashboard',
                feature: 'dashboard',
                icono: '🏠',
                etiqueta: 'Dashboard Principal',
                descripción: 'Vista general del sistema',
                rolesPermitidos: ['administrador', 'soporte', 'tecnico'] as RolSidebar[],
            },
            {
                id: 'activos',
                feature: 'activos',
                icono: '🚚',
                etiqueta: 'Gestión de Activos',
                descripción: 'Vehículos y equipos',
                rolesPermitidos: ['administrador', 'soporte', 'tecnico'] as RolSidebar[],
            },
            {
                id: 'ordenes',
                feature: 'ordenes_trabajo',
                icono: '📋',
                etiqueta: 'Órdenes de Trabajo',
                descripción: 'Crear y gestionar OT',
                rolesPermitidos: ['administrador', 'soporte', 'tecnico'] as RolSidebar[],
            },
            {
                id: 'mantenimiento',
                feature: 'mantenimiento_basico',
                icono: '🔧',
                etiqueta: 'Plan Mantenimiento',
                descripción: 'Programación preventiva',
                rolesPermitidos: ['administrador', 'soporte'] as RolSidebar[],
            },
            {
                id: 'inventario',
                feature: 'inventario_basico',
                icono: '📦',
                etiqueta: 'Inventario',
                descripción: 'Repuestos y materiales',
                rolesPermitidos: ['administrador', 'soporte'] as RolSidebar[],
            },
            {
                id: 'personal',
                feature: 'usuarios',
                icono: '👥',
                etiqueta: 'Personal',
                descripción: 'Equipo de trabajo',
                rolesPermitidos: ['administrador'] as RolSidebar[],
            },
            {
                id: 'reportes',
                feature: 'reportes_demo',
                icono: '📊',
                etiqueta: 'Reportes',
                descripción: 'Análisis y estadísticas',
                rolesPermitidos: ['administrador', 'soporte'] as RolSidebar[],
            },
            {
                id: 'configuracion',
                feature: 'configuracion',
                icono: '⚙️',
                etiqueta: 'Configuración',
                descripción: 'Ajustes del sistema',
                rolesPermitidos: ['administrador'] as RolSidebar[],
            },
            {
                id: 'desarrollador',
                feature: 'admin_global',
                soloAdminGlobal: true,
                icono: '🛡️',
                etiqueta: 'Panel Dueño',
                descripción: 'Empresas, planes y usuarios',
                rolesPermitidos: ['administrador'] as RolSidebar[],
            },
        ];

        const seccionesVisibles = secciones.filter((seccion) => {
            if (esAdminGlobal) {
                return true;
            }

            if (seccion.soloAdminGlobal) {
                return false;
            }

            return seccion.rolesPermitidos.includes(rolSidebarActual);
        });

        const seccionesPermitidas = seccionesVisibles.filter((seccion) => {
            // Dueño global ve todo
            if (esAdminGlobal) {
                return true;
            }

            // Panel Dueño solo lo ve el dueño global
            if (seccion.soloAdminGlobal) {
                return false;
            }

            // Para la barra lateral mandan los permisos por rol.
            // No usamos tieneFeatureSidebar aquí porque está bloqueando módulos visibles.
            return true;
        });
        const generarParticulas = () => {
            const particulas = [];
            const tamaños = ['particula-xs', 'particula-sm', 'particula-md', 'particula-lg', 'particula-xl'];

            for (let i = 0; i < 35; i++) {
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
                {/* PARTÍCULAS */}
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
                            title={barraLateralContraída ? "Expandir" : "Contraer"}
                        >
                            <svg
                                className={`w-5 h-5 text-cyan-400 transition-transform ${barraLateralContraída ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d={barraLateralContraída ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"}
                                />
                            </svg>
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {seccionesPermitidas.map((sección) => (
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

                        {!barraLateralContraída &&
                            (esAdminGlobal || empresaModoDemo || seccionesPermitidas.length < seccionesVisibles.length) && (
                                <div className={`mt-4 rounded-xl border p-3 ${esAdminGlobal
                                    ? 'border-purple-500/20 bg-purple-500/10'
                                    : empresaModoDemo
                                        ? 'border-cyan-500/20 bg-cyan-500/10'
                                        : 'border-amber-500/20 bg-amber-500/10'
                                    }`}>
                                    <p className={`text-xs font-bold ${esAdminGlobal
                                        ? 'text-purple-300'
                                        : empresaModoDemo
                                            ? 'text-cyan-300'
                                            : 'text-amber-300'
                                        }`}>
                                        {esAdminGlobal
                                            ? `Modo ${rolGlobal?.nombre || 'Dueño'}`
                                            : empresaModoDemo
                                                ? '🧪 Modo Demo'
                                                : 'Plan limitado'}
                                    </p>

                                    <p className="mt-1 text-[11px] text-slate-400">
                                        {esAdminGlobal
                                            ? 'Tienes acceso completo al Panel Dueño de FleetVision.'
                                            : empresaModoDemo
                                                ? 'Ambiente de prueba comercial. Algunas acciones reales pueden estar bloqueadas.'
                                                : 'Algunas funciones están bloqueadas por el plan actual de la empresa.'
                                        }
                                    </p>
                                </div>
                            )}
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
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                                            style={{ width: '98%' }}
                                        />
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
                    <button onClick={manejarCrearNuevaOrden} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
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
                                    <button onClick={manejarCrearNuevaOrden} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
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
                                    <button onClick={manejarCrearNuevaOrden} className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto">
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
                                onClick={manejarCrearNuevaOrden}
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
                                onClick={() => {
                                    if (empresaModoDemo) {
                                        mostrarAccionDemo(
                                            'Orden de trabajo simulada',
                                            'En modo demo puedes revisar el flujo de órdenes de trabajo, pero no se guardará ninguna OT real en Supabase.'
                                        );
                                        return;
                                    }

                                    crearNuevaOrden();
                                }}
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

    /** Panel Dueño / Desarrollador */
    const PanelDesarrollador = () => {
        const modulosActivos = featuresPlan.filter((feature) => feature.habilitado).length;
        const modulosBloqueados = featuresPlan.filter((feature) => !feature.habilitado).length;

        const formatearFecha = (fecha: string | null) => {
            if (!fecha) return 'Sin fecha';

            try {
                return new Date(fecha).toLocaleDateString('es-CL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                });
            } catch {
                return 'Fecha inválida';
            }
        };

        const obtenerEstadoSuscripcion = (estado: string | null) => {
            switch (estado) {
                case 'trial':
                    return {
                        texto: 'Trial',
                        clase: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                    };
                case 'activa':
                    return {
                        texto: 'Activa',
                        clase: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                    };
                case 'vencida':
                    return {
                        texto: 'Vencida',
                        clase: 'bg-red-500/20 text-red-300 border-red-500/30',
                    };
                case 'cancelada':
                    return {
                        texto: 'Cancelada',
                        clase: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
                    };
                case 'suspendida':
                    return {
                        texto: 'Suspendida',
                        clase: 'bg-red-500/20 text-red-300 border-red-500/30',
                    };
                default:
                    return {
                        texto: 'Sin suscripción',
                        clase: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
                    };
            }
        };


        const obtenerLimiteRolPorPlan = (planCodigo: string | null, rolCodigo: string) => {
            const plan = (planCodigo || 'gratis').toLowerCase();
            const rol = rolCodigo.toLowerCase();

            const planDesdeSupabase = planesSaas.find(
                (item) => item.codigo.toLowerCase() === plan
            );

            if (planDesdeSupabase) {
                if (rol === 'administrador') return planDesdeSupabase.limite_administrador;
                if (rol === 'soporte') return planDesdeSupabase.limite_soporte;
                if (rol === 'tecnico') return planDesdeSupabase.limite_tecnico;

                return 0;
            }

            if (plan === 'empresa') {
                return null;
            }

            const limitesFallback: Record<string, Record<string, number>> = {
                gratis: {
                    administrador: 1,
                    soporte: 0,
                    tecnico: 0,
                },
                basico: {
                    administrador: 1,
                    soporte: 1,
                    tecnico: 1,
                },
                pro: {
                    administrador: 1,
                    soporte: 1,
                    tecnico: 1,
                },
            };

            return limitesFallback[plan]?.[rol] ?? 0;
        };

        const contarUsuariosConRolEnEmpresa = (
            empresaId: string,
            rolCodigo: string,
            usuarioEmpresaActualId: string
        ) => {
            return usuariosDueno.filter((usuario) =>
                usuario.empresa_id === empresaId &&
                usuario.usuario_empresa_id !== usuarioEmpresaActualId &&
                usuario.rol_codigo === rolCodigo
            ).length;
        };
        const contarUsuariosConRolEnEmpresaTotal = (
            empresaId: string,
            rolCodigo: string
        ) => {
            return usuariosDueno.filter((usuario) =>
                usuario.empresa_id === empresaId &&
                (usuario.rol_codigo || '').toLowerCase() === rolCodigo.toLowerCase()
            ).length;
        };

        const obtenerEstadoVisualRol = (
            usuario: UsuarioDueno,
            rol: RolEmpresaDueno
        ) => {
            const limite = obtenerLimiteRolPorPlan(usuario.plan_codigo, rol.rol_codigo);
            const actuales = contarUsuariosConRolEnEmpresa(
                usuario.empresa_id,
                rol.rol_codigo,
                usuario.usuario_empresa_id
            );

            const esRolActual = usuario.rol_id === rol.rol_id;
            const plan = usuario.plan_codigo || 'gratis';

            if (esRolActual) {
                return {
                    bloqueado: false,
                    texto: 'Rol actual',
                    detalle: 'Este usuario ya tiene este rol.',
                    limite,
                    actuales,
                };
            }

            if (limite === null) {
                return {
                    bloqueado: false,
                    texto: 'Disponible',
                    detalle: 'Plan Empresa sin límite de usuarios por rol.',
                    limite,
                    actuales,
                };
            }

            if (limite === 0) {
                return {
                    bloqueado: true,
                    texto: `Bloqueado por plan ${plan}`,
                    detalle: `El plan ${plan} no permite usuarios con rol ${rol.rol_nombre}.`,
                    limite,
                    actuales,
                };
            }

            if (actuales >= limite) {
                return {
                    bloqueado: true,
                    texto: 'Límite alcanzado',
                    detalle: `El plan ${plan} permite máximo ${limite} usuario(s) con rol ${rol.rol_nombre}.`,
                    limite,
                    actuales,
                };
            }

            return {
                bloqueado: false,
                texto: 'Disponible',
                detalle: `Disponible: ${actuales}/${limite} usados.`,
                limite,
                actuales,
            };
        };
        const planesFleetVision: {
            codigo: 'gratis' | 'basico' | 'pro' | 'empresa';
            nombre: string;
            subtitulo: string;
            precio: string;
            descripcion: string;
            color: 'slate' | 'cyan' | 'purple' | 'emerald';
            destacado?: boolean;
            funciones: string[];
        }[] = [
                {
                    codigo: 'gratis',
                    nombre: 'Gratis',
                    subtitulo: 'Inicio controlado',
                    precio: '$0',
                    descripcion: 'Plan de entrada para pruebas, demos y empresas pequeñas.',
                    color: 'slate',
                    funciones: [
                        '1 administrador',
                        'Sin soporte',
                        'Sin técnico',
                        'Acceso limitado por plan',
                    ],
                },
                {
                    codigo: 'basico',
                    nombre: 'Básico',
                    subtitulo: 'Operación inicial',
                    precio: 'Definir precio',
                    descripcion: 'Para empresas que comienzan a ordenar usuarios, activos y mantenimiento.',
                    color: 'cyan',
                    funciones: [
                        '1 administrador',
                        '1 soporte',
                        '1 técnico',
                        'Ideal para flotas pequeñas',
                    ],
                },
                {
                    codigo: 'pro',
                    nombre: 'Pro',
                    subtitulo: 'Gestión avanzada',
                    precio: 'Definir precio',
                    descripcion: 'Plan principal para clientes con mayor control operativo.',
                    color: 'purple',
                    destacado: true,
                    funciones: [
                        '1 administrador',
                        '1 soporte',
                        '1 técnico',
                        'Mejor para clientes SaaS activos',
                    ],
                },
                {
                    codigo: 'empresa',
                    nombre: 'Empresa',
                    subtitulo: 'Sin límites por rol',
                    precio: 'A medida',
                    descripcion: 'Para clientes grandes, flotas complejas o contratos personalizados.',
                    color: 'emerald',
                    funciones: [
                        'Administradores ilimitados',
                        'Soporte ilimitado',
                        'Técnicos ilimitados',
                        'Personalización empresarial',
                    ],
                },
            ];

        const rolesControladosPlanes = [
            {
                codigo: 'administrador',
                nombre: 'Administrador',
                icono: '👑',
            },
            {
                codigo: 'soporte',
                nombre: 'Soporte',
                icono: '🧩',
            },
            {
                codigo: 'tecnico',
                nombre: 'Técnico',
                icono: '🔧',
            },
        ];

        const contarEmpresasPorPlan = (planCodigo: string) => {
            return empresasDueno.filter(
                (empresa) => (empresa.plan_codigo || 'gratis').toLowerCase() === planCodigo
            ).length;
        };

        const contarUsuariosPorPlan = (planCodigo: string) => {
            return usuariosDueno.filter(
                (usuario) => (usuario.plan_codigo || 'gratis').toLowerCase() === planCodigo
            ).length;
        };

        const contarActivosPorPlan = (planCodigo: string) => {
            return empresasDueno
                .filter((empresa) => (empresa.plan_codigo || 'gratis').toLowerCase() === planCodigo)
                .reduce((total, empresa) => total + (empresa.total_activos || 0), 0);
        };

        const contarEmpresasActivasPorPlan = (planCodigo: string) => {
            return empresasDueno.filter(
                (empresa) =>
                    (empresa.plan_codigo || 'gratis').toLowerCase() === planCodigo &&
                    empresa.empresa_activa
            ).length;
        };

        const contarEmpresasTrialPorPlan = (planCodigo: string) => {
            return empresasDueno.filter(
                (empresa) =>
                    (empresa.plan_codigo || 'gratis').toLowerCase() === planCodigo &&
                    empresa.estado_suscripcion === 'trial'
            ).length;
        };

        const obtenerClasePlan = (color: string | null | undefined) => {
            const colorSeguro = (color || 'slate').toLowerCase();
            switch (colorSeguro) {
                case 'cyan':
                    return {
                        card: 'border-cyan-500/30 bg-cyan-500/10 shadow-cyan-500/10',
                        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
                        texto: 'text-cyan-300',
                        boton: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20',
                    };
                case 'purple':
                    return {
                        card: 'border-purple-500/30 bg-purple-500/10 shadow-purple-500/10',
                        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                        texto: 'text-purple-300',
                        boton: 'border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20',
                    };
                case 'emerald':
                    return {
                        card: 'border-emerald-500/30 bg-emerald-500/10 shadow-emerald-500/10',
                        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                        texto: 'text-emerald-300',
                        boton: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20',
                    };
                default:
                    return {
                        card: 'border-slate-600/50 bg-slate-800/30 shadow-slate-500/5',
                        badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
                        texto: 'text-slate-300',
                        boton: 'border-slate-600 bg-slate-800/40 text-slate-300 hover:bg-slate-700/50',
                    };
            }
        };

        const obtenerLimiteTextoPlan = (planCodigo: string, rolCodigo: string) => {
            const limite = obtenerLimiteRolPorPlan(planCodigo, rolCodigo);

            if (limite === null) return 'Ilimitado';

            return `${limite}`;
        };
        const mostrarLimiteRolTexto = (
            limite: number | null,
            rolSingular: string,
            rolPlural: string
        ) => {
            if (limite === null) {
                return `${rolPlural} ilimitados`;
            }

            if (limite === 0) {
                return `Sin ${rolSingular.toLowerCase()}`;
            }

            if (limite === 1) {
                return `1 ${rolSingular.toLowerCase()}`;
            }

            return `${limite} ${rolPlural.toLowerCase()}`;
        };

        const obtenerFuncionesPlan = (plan: PlanSaasDueno) => {
            return [
                mostrarLimiteRolTexto(
                    plan.limite_administrador,
                    'Administrador',
                    'Administradores'
                ),
                mostrarLimiteRolTexto(
                    plan.limite_soporte,
                    'Soporte',
                    'Soportes'
                ),
                mostrarLimiteRolTexto(
                    plan.limite_tecnico,
                    'Técnico',
                    'Técnicos'
                ),
                plan.codigo === 'empresa'
                    ? 'Personalización empresarial'
                    : plan.codigo === 'pro'
                        ? 'Mejor para clientes SaaS activos'
                        : plan.codigo === 'basico'
                            ? 'Ideal para flotas pequeñas'
                            : 'Acceso limitado por plan',
            ];
        };

        const planesParaMostrar = planesSaas.length > 0
            ? planesSaas
            : planesFleetVision.map((plan) => ({
                codigo: plan.codigo,
                nombre: plan.nombre,
                subtitulo: plan.subtitulo,
                precio: plan.precio,
                descripcion: plan.descripcion,
                color: plan.color,
                destacado: plan.destacado || false,
                activo: true,
                orden: 0,
                limite_administrador: obtenerLimiteRolPorPlan(plan.codigo, 'administrador'),
                limite_soporte: obtenerLimiteRolPorPlan(plan.codigo, 'soporte'),
                limite_tecnico: obtenerLimiteRolPorPlan(plan.codigo, 'tecnico'),
            }));
        const esEmpresaDemoDueno = (empresa: EmpresaDueno) => {
            return (
                empresa.modo_demo === true ||
                (empresa.empresa || '').trim().toUpperCase() === 'PRUEBA'
            );
        };

        const esEmpresaArchivadaDueno = (empresa: EmpresaDueno) => {
            return empresa.archivada === true || empresa.empresa_activa === false;
        };

        const empresasClientesDueno = empresasDueno.filter((empresa) => {
            return (
                !esEmpresaDemoDueno(empresa) &&
                !esEmpresaArchivadaDueno(empresa) &&
                empresa.estado_suscripcion !== 'trial'
            );
        });

        const empresasTrialsDueno = empresasDueno.filter((empresa) => {
            return (
                !esEmpresaDemoDueno(empresa) &&
                !esEmpresaArchivadaDueno(empresa) &&
                empresa.estado_suscripcion === 'trial'
            );
        });

        const empresasDemoDueno = empresasDueno.filter((empresa) => {
            return esEmpresaDemoDueno(empresa);
        });

        const empresasArchivadasDueno = empresasDueno.filter((empresa) => {
            return esEmpresaArchivadaDueno(empresa);
        });

        const empresasFiltradasDueno = (() => {
            if (filtroEmpresasDueno === 'clientes') return empresasClientesDueno;
            if (filtroEmpresasDueno === 'trials') return empresasTrialsDueno;
            if (filtroEmpresasDueno === 'demo') return empresasDemoDueno;
            if (filtroEmpresasDueno === 'archivadas') return empresasArchivadasDueno;

            return empresasDueno;
        })();

        const esUsuarioDemoDueno = (usuario: UsuarioDueno) => {
            return (usuario.empresa || '').trim().toUpperCase() === 'PRUEBA';
        };

        const usuariosActivosDueno = usuariosDueno.filter((usuario) => {
            return usuario.usuario_activo && !esUsuarioDemoDueno(usuario);
        });

        const usuariosBasureroDueno = usuariosDueno.filter((usuario) => {
            return !usuario.usuario_activo;
        });

        const usuariosDemoDueno = usuariosDueno.filter((usuario) => {
            return esUsuarioDemoDueno(usuario);
        });

        const usuariosFiltradosDueno = (() => {
            if (filtroUsuariosDueno === 'activos') return usuariosActivosDueno;
            if (filtroUsuariosDueno === 'basurero') return usuariosBasureroDueno;
            if (filtroUsuariosDueno === 'demo') return usuariosDemoDueno;

            return usuariosDueno;
        })();

        const filtrosEmpresasDueno: {
            clave: FiltroEmpresasDueno;
            texto: string;
            total: number;
            icono: string;
        }[] = [
                { clave: 'clientes', texto: 'Clientes', total: empresasClientesDueno.length, icono: '🏢' },
                { clave: 'trials', texto: 'Trials', total: empresasTrialsDueno.length, icono: '⏳' },
                { clave: 'demo', texto: 'Demo', total: empresasDemoDueno.length, icono: '🧪' },
                { clave: 'archivadas', texto: 'Archivadas', total: empresasArchivadasDueno.length, icono: '🗄️' },
                { clave: 'todos', texto: 'Todos', total: empresasDueno.length, icono: '📋' },
            ];

        const filtrosUsuariosDueno: {
            clave: FiltroUsuariosDueno;
            texto: string;
            total: number;
            icono: string;
        }[] = [
                { clave: 'activos', texto: 'Activos', total: usuariosActivosDueno.length, icono: '✅' },
                { clave: 'basurero', texto: 'Basurero', total: usuariosBasureroDueno.length, icono: '🗑️' },
                { clave: 'demo', texto: 'Demo', total: usuariosDemoDueno.length, icono: '🧪' },
                { clave: 'todos', texto: 'Todos', total: usuariosDueno.length, icono: '📋' },
            ];

        const obtenerRolVisibleUsuarioDueno = (usuario: UsuarioDueno) => {
            const rolBase = (
                usuario.rol_nombre ||
                usuario.usuario_rol_texto ||
                usuario.rol_codigo ||
                ''
            ).trim();

            if (!rolBase || rolBase.toLowerCase() === 'sin rol') {
                return 'Sin rol';
            }

            const rolNormalizado = rolBase.toLowerCase();

            if (rolNormalizado === 'administrador') return 'Administrador';
            if (rolNormalizado === 'soporte') return 'Soporte';
            if (rolNormalizado === 'tecnico') return 'Técnico';
            if (rolNormalizado === 'técnico') return 'Técnico';
            if (rolNormalizado === 'dueno') return 'Dueño';
            if (rolNormalizado === 'dueño') return 'Dueño';

            return rolBase.charAt(0).toUpperCase() + rolBase.slice(1);
        };
        const normalizarRolParaLimiteDueno = (rol: string) => {
            const limpio = (rol || '')
                .trim()
                .toLowerCase()
                .replace('é', 'e');

            if (limpio === 'administrador') return 'administrador';
            if (limpio === 'soporte') return 'soporte';
            if (limpio === 'tecnico') return 'tecnico';

            return limpio || 'sin_rol';
        };

        const obtenerLimiteRolEmpresaDueno = (
            empresa: EmpresaDueno,
            rol: string
        ): number | null => {
            const planCodigo = (empresa.plan_codigo || 'gratis').toLowerCase();

            const plan = planesSaas.find(
                (planItem) => planItem.codigo.toLowerCase() === planCodigo
            );

            if (!plan) {
                return null;
            }

            const rolCodigo = normalizarRolParaLimiteDueno(rol);

            if (rolCodigo === 'administrador') {
                return plan.limite_administrador;
            }

            if (rolCodigo === 'soporte') {
                return plan.limite_soporte;
            }

            if (rolCodigo === 'tecnico') {
                return plan.limite_tecnico;
            }

            return null;
        };

        const mostrarLimiteBadgeDueno = (limite: number | null) => {
            if (limite === null) return 'Ilimitado';

            return String(limite);
        };

        const resumenRolesPorEmpresaDueno = empresasDueno
            .map((empresa) => {
                const usuariosEmpresa = usuariosDueno.filter(
                    (usuario) => usuario.empresa_id === empresa.empresa_id
                );

                const usuariosActivosEmpresa = usuariosEmpresa.filter(
                    (usuario) => usuario.usuario_activo
                );

                const rolesControlados = ['Administrador', 'Soporte', 'Técnico'];

                const rolesControladosResumen = rolesControlados.map((rol) => {
                    const total = usuariosEmpresa.filter(
                        (usuario) => obtenerRolVisibleUsuarioDueno(usuario) === rol
                    ).length;

                    const limite = obtenerLimiteRolEmpresaDueno(empresa, rol);

                    return {
                        rol,
                        total,
                        limite,
                        excedido: limite !== null && total > limite,
                    };
                });

                const totalSinRol = usuariosEmpresa.filter(
                    (usuario) => obtenerRolVisibleUsuarioDueno(usuario) === 'Sin rol'
                ).length;

                const roles = [
                    ...rolesControladosResumen.filter(
                        (rol) => rol.total > 0 || rol.limite !== null
                    ),
                    ...(totalSinRol > 0
                        ? [
                            {
                                rol: 'Sin rol',
                                total: totalSinRol,
                                limite: null,
                                excedido: false,
                            },
                        ]
                        : []),
                ];

                const rolesConExceso = roles.filter((rol) => rol.excedido);

                return {
                    empresa,
                    usuariosEmpresa,
                    totalUsuarios: usuariosEmpresa.length,
                    totalUsuariosActivos: usuariosActivosEmpresa.length,
                    roles,
                    rolesConExceso,
                };
            })
            .sort((a, b) => b.totalUsuarios - a.totalUsuarios);

        const totalUsuariosRolesDueno = usuariosDueno.length;

        const totalEmpresasConUsuariosDueno = resumenRolesPorEmpresaDueno.filter(
            (item) => item.totalUsuarios > 0
        ).length;

        const totalUsuariosSinRolDueno = usuariosDueno.filter(
            (usuario) => obtenerRolVisibleUsuarioDueno(usuario) === 'Sin rol'
        ).length;
        const totalEmpresasExcedidasDueno = resumenRolesPorEmpresaDueno.filter(
            (item) => item.rolesConExceso.length > 0
        ).length;
        const tarjetas = [
            {
                modulo: 'empresas',
                titulo: 'Empresas',
                icono: '🏢',
                descripcion: 'Gestionar empresas, planes, estado y trial.',
                estado: 'Conectado',
                color: 'cyan',
                accion: async () => {
                    setModuloDuenoActivo('empresas');

                    if (empresasDueno.length === 0) {
                        await cargarEmpresasDueno();
                    }
                },
            },
            {
                modulo: 'usuarios',
                titulo: 'Usuarios',
                icono: '👥',
                descripcion: 'Crear, vincular, editar, bloquear y borrar usuarios de forma segura.',
                estado: 'Conectado',
                color: 'emerald',
                accion: async () => {
                    setModuloDuenoActivo('usuarios');

                    if (usuariosDueno.length === 0 || rolesEmpresaDueno.length === 0) {
                        await cargarUsuariosDueno();
                    }

                    if (empresasDueno.length === 0) {
                        await cargarEmpresasDueno();
                    }
                },
            },
            {
                modulo: 'planes',
                titulo: 'Planes',
                icono: '💳',
                descripcion: 'Visualizar y editar gratis, básico, pro y empresa con límites reales.',
                estado: 'Conectado',
                color: 'amber',
                accion: async () => {
                    setModuloDuenoActivo('planes');

                    if (planesSaas.length === 0) {
                        await cargarPlanesSaas();
                    }

                    if (empresasDueno.length === 0) {
                        await cargarEmpresasDueno();
                    }

                    if (usuariosDueno.length === 0) {
                        await cargarUsuariosDueno();
                    }
                },
            },
            {
                modulo: 'solicitudes',
                titulo: 'Solicitudes de prueba',
                icono: '🧪',
                descripcion: 'Gestionar interesados que completaron el formulario del home.',
                estado: 'Conectado',
                color: 'cyan',
                accion: async () => {
                    setModuloDuenoActivo('solicitudes');

                    if (solicitudesPrueba.length === 0) {
                        await cargarSolicitudesPrueba();
                    }
                },
            },
            {
                modulo: 'roles',
                titulo: 'Roles y permisos',
                icono: '🔐',
                descripcion: 'Ver usuarios por empresa, cantidad de usuarios y roles asignados.',
                estado: 'Conectado',
                color: 'purple',
                accion: async () => {
                    setModuloDuenoActivo('roles');

                    if (empresasDueno.length === 0) {
                        await cargarEmpresasDueno();
                    }

                    if (usuariosDueno.length === 0 || rolesEmpresaDueno.length === 0) {
                        await cargarUsuariosDueno();
                    }

                    if (planesSaas.length === 0) {
                        await cargarPlanesSaas();
                    }
                },
            },
            {
                modulo: 'diagnostico',
                titulo: 'Diagnóstico',
                icono: '🧪',
                descripcion: 'Revisar empresas, usuarios, vínculos y configuración general.',
                estado: 'Conectado',
                color: 'red',
                accion: async () => {
                    setModuloDuenoActivo('diagnostico');

                    if (diagnosticoDueno.length === 0) {
                        await cargarDiagnosticoDueno();
                    }
                },
            },
        ];

        return (
            <div className="space-y-6">
                {/* Header principal */}
                <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-slate-900/90 to-slate-950/90 p-6 backdrop-blur-lg shadow-xl shadow-purple-500/10">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-bold text-purple-300">🛡️ Acceso interno</p>

                            <h3 className="mt-2 text-3xl font-black text-white">
                                Panel Dueño / Desarrollador
                            </h3>

                            <p className="mt-2 max-w-3xl text-sm text-slate-400">
                                Desde aquí podrás controlar empresas, planes, usuarios, roles y permisos.
                                Por seguridad, esta sección solo aparece para usuarios con rol global.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4 text-right">
                            <p className="text-xs text-slate-400">Rol global actual</p>

                            <p className="mt-1 text-xl font-black text-purple-300">
                                {rolGlobal?.nombre || 'Dueño'}
                            </p>

                            <p className="mt-1 text-[11px] text-slate-500">
                                {rolGlobal?.rol_global || 'dueno'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Métricas superiores */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
                        <p className="text-sm text-slate-400">Empresa actual</p>

                        <p className="mt-2 text-2xl font-black text-cyan-300">
                            {empresaActual?.nombre || 'Sin empresa'}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                        <p className="text-sm text-slate-400">Módulos habilitados</p>

                        <p className="mt-2 text-2xl font-black text-emerald-300">
                            {modulosActivos}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
                        <p className="text-sm text-slate-400">Módulos bloqueados</p>

                        <p className="mt-2 text-2xl font-black text-amber-300">
                            {modulosBloqueados}
                        </p>
                    </div>
                </div>

                {/* Tarjetas de módulos */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    {tarjetas.map((tarjeta) => (
                        <div
                            key={tarjeta.titulo}
                            className="rounded-3xl border border-slate-700/60 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-5 shadow-lg shadow-black/20 transition-all hover:-translate-y-1 hover:border-purple-500/40 hover:shadow-purple-500/10"
                        >
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-2xl">
                                    {tarjeta.icono}
                                </div>

                                <span
                                    className={`rounded-full border px-3 py-1 text-[11px] font-bold ${tarjeta.estado === 'Conectado'
                                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                                        : 'border-purple-500/20 bg-purple-500/10 text-purple-300'
                                        }`}
                                >
                                    {tarjeta.estado}
                                </span>
                            </div>

                            <h4 className="text-lg font-black text-white">
                                {tarjeta.titulo}
                            </h4>

                            <p className="mt-2 text-sm text-slate-400">
                                {tarjeta.descripcion}
                            </p>

                            <button
                                type="button"
                                className="mt-5 w-full rounded-2xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-400 transition-all hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-300"
                                onClick={tarjeta.accion}
                            >
                                Abrir módulo
                            </button>
                        </div>
                    ))}
                </div>

                {/* Módulo Empresas */}
                {moduloDuenoActivo === 'empresas' && (
                    <div className="rounded-3xl border border-cyan-500/20 bg-slate-950/70 p-6 shadow-xl shadow-cyan-500/5">
                        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-sm font-bold text-cyan-300">🏢 Módulo conectado</p>

                                <h4 className="mt-1 text-2xl font-black text-white">
                                    Empresas registradas
                                </h4>

                                <p className="mt-1 text-sm text-slate-400">
                                    Aquí puedes revisar empresas, planes, usuarios, activos y estado de suscripción.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => setMostrarModalNuevaEmpresa(true)}
                                    className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-300 transition-all hover:bg-emerald-500/20"
                                >
                                    + Nueva empresa
                                </button>

                                <button
                                    type="button"
                                    onClick={cargarEmpresasDueno}
                                    className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-bold text-cyan-300 transition-all hover:bg-cyan-500/20"
                                >
                                    Actualizar empresas
                                </button>
                            </div>
                        </div>
                        <div className="mb-6 flex flex-wrap gap-3">
                            {filtrosEmpresasDueno.map((filtro) => {
                                const activo = filtroEmpresasDueno === filtro.clave;

                                return (
                                    <button
                                        key={filtro.clave}
                                        type="button"
                                        onClick={() => setFiltroEmpresasDueno(filtro.clave)}
                                        className={`rounded-2xl border px-4 py-3 text-sm font-black transition-all ${activo
                                            ? 'border-cyan-500/40 bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/10'
                                            : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-cyan-500/30 hover:text-cyan-300'
                                            }`}
                                    >
                                        {filtro.icono} {filtro.texto}
                                        <span className="ml-2 rounded-full bg-slate-950/70 px-2 py-1 text-xs">
                                            {filtro.total}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        {cargandoEmpresasDueno ? (
                            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-8 text-center">
                                <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />

                                <p className="text-sm font-bold text-cyan-300">
                                    Cargando empresas...
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Consultando información segura desde Supabase.
                                </p>
                            </div>
                        ) : empresasFiltradasDueno.length === 0 ? (
                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6 text-center">
                                <p className="text-sm font-bold text-amber-300">
                                    No hay empresas para mostrar.
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Presiona “Actualizar empresas” para volver a consultar.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-2xl border border-slate-800">
                                <table className="w-full min-w-[950px] text-left text-sm">
                                    <thead className="bg-slate-900/90">
                                        <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                                            <th className="px-4 py-4">Empresa</th>
                                            <th className="px-4 py-4">Estado</th>
                                            <th className="px-4 py-4">Plan</th>
                                            <th className="px-4 py-4">Suscripción</th>
                                            <th className="px-4 py-4">Trial termina</th>
                                            <th className="px-4 py-4 text-center">Usuarios</th>
                                            <th className="px-4 py-4 text-center">Activos</th>
                                            <th className="px-4 py-4">Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {empresasFiltradasDueno.map((empresa) => {
                                            const estadoSuscripcion = obtenerEstadoSuscripcion(
                                                empresa.estado_suscripcion
                                            );

                                            return (
                                                <tr
                                                    key={empresa.empresa_id}
                                                    className="border-b border-slate-900 bg-slate-950/40 text-slate-300 transition-colors hover:bg-cyan-500/5"
                                                >
                                                    <td className="px-4 py-4">
                                                        <div className="font-black text-white">
                                                            {empresa.empresa}
                                                        </div>

                                                        <div className="mt-1 text-xs text-slate-500">
                                                            {empresa.rut || 'Sin RUT'}
                                                        </div>

                                                        <div className="mt-1 text-[10px] text-slate-600">
                                                            {empresa.empresa_id}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-bold ${empresa.empresa_activa
                                                                ? 'bg-emerald-500/20 text-emerald-300'
                                                                : 'bg-red-500/20 text-red-300'
                                                                }`}
                                                        >
                                                            {empresa.empresa_activa ? 'Activa' : 'Inactiva'}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                                                            {empresa.nombre_plan || empresa.plan_codigo || 'Sin plan'}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <span
                                                            className={`rounded-full border px-3 py-1 text-xs font-bold ${estadoSuscripcion.clase}`}
                                                        >
                                                            {estadoSuscripcion.texto}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4 text-slate-300">
                                                        {formatearFecha(empresa.trial_ends_at)}
                                                    </td>

                                                    <td className="px-4 py-4 text-center">
                                                        <span className="rounded-xl bg-purple-500/10 px-3 py-2 font-black text-purple-300">
                                                            {empresa.total_usuarios}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4 text-center">
                                                        <span className="rounded-xl bg-emerald-500/10 px-3 py-2 font-black text-emerald-300">
                                                            {empresa.total_activos}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <button
                                                            type="button"
                                                            className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-bold text-slate-400 transition-colors hover:border-cyan-500/40 hover:text-cyan-300"
                                                            onClick={() => setEmpresaGestionSeleccionada(empresa)}
                                                        >
                                                            Gestionar
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Módulo Usuarios */}
                {moduloDuenoActivo === 'usuarios' && (
                    <div className="rounded-3xl border border-emerald-500/20 bg-slate-950/70 p-6 shadow-xl shadow-emerald-500/5">
                        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-sm font-bold text-emerald-300">
                                    👥 Módulo conectado
                                </p>

                                <h4 className="mt-1 text-2xl font-black text-white">
                                    Usuarios por empresa
                                </h4>

                                <p className="mt-1 text-sm text-slate-400">
                                    Revisa usuarios, empresa asignada, plan, estado y rol actual.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={abrirModalCrearUsuario}
                                    className="rounded-2xl border border-purple-500/30 bg-purple-500/10 px-5 py-3 text-sm font-bold text-purple-300 transition-all hover:bg-purple-500/20"
                                >
                                    + Crear usuario nuevo
                                </button>

                                <button
                                    type="button"
                                    onClick={abrirModalVincularUsuario}
                                    className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-300 transition-all hover:bg-emerald-500/20"
                                >
                                    + Vincular existente
                                </button>

                                <button
                                    type="button"
                                    onClick={cargarUsuariosDueno}
                                    className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-bold text-cyan-300 transition-all hover:bg-cyan-500/20"
                                >
                                    Actualizar usuarios
                                </button>
                            </div>
                        </div>

                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                                <p className="text-sm text-slate-400">Usuarios vinculados</p>
                                <p className="mt-2 text-2xl font-black text-emerald-300">
                                    {usuariosDueno.length}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
                                <p className="text-sm text-slate-400">Roles disponibles</p>
                                <p className="mt-2 text-2xl font-black text-cyan-300">
                                    {rolesEmpresaDueno.length}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-5">
                                <p className="text-sm text-slate-400">Administradores</p>
                                <p className="mt-2 text-2xl font-black text-purple-300">
                                    {usuariosDueno.filter((u) => u.rol_codigo === 'administrador').length}
                                </p>
                            </div>
                        </div>

                        {cargandoUsuariosDueno ? (
                            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-8 text-center">
                                <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />

                                <p className="text-sm font-bold text-emerald-300">
                                    Cargando usuarios...
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Consultando usuarios y roles desde Supabase.
                                </p>
                            </div>
                        ) : usuariosDueno.length === 0 ? (
                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6 text-center">
                                <p className="text-sm font-bold text-amber-300">
                                    No hay usuarios vinculados para mostrar.
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Presiona “Actualizar usuarios” para volver a consultar.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-2xl border border-slate-800">
                                <table className="w-full min-w-[1050px] text-left text-sm">
                                    <thead className="bg-slate-900/90">
                                        <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                                            <th className="px-4 py-4">Usuario</th>
                                            <th className="px-4 py-4">Empresa</th>
                                            <th className="px-4 py-4">Plan</th>
                                            <th className="px-4 py-4">Suscripción</th>
                                            <th className="px-4 py-4">Rol empresa</th>
                                            <th className="px-4 py-4">Rol texto</th>
                                            <th className="px-4 py-4">Estado</th>
                                            <th className="px-4 py-4">Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {usuariosDueno.map((usuario) => (
                                            <tr
                                                key={usuario.usuario_empresa_id}
                                                className="border-b border-slate-900 bg-slate-950/40 text-slate-300 transition-colors hover:bg-emerald-500/5"
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="font-black text-white">
                                                        {usuario.username || 'Sin username'}
                                                    </div>

                                                    <div className="mt-1 text-xs text-slate-500">
                                                        {usuario.apellido || 'Sin apellido'}
                                                    </div>

                                                    <div className="mt-1 text-[10px] text-slate-600">
                                                        auth: {usuario.auth_id}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="font-bold text-white">
                                                        {usuario.empresa}
                                                    </div>

                                                    <span
                                                        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${usuario.empresa_activa
                                                            ? 'bg-emerald-500/20 text-emerald-300'
                                                            : 'bg-red-500/20 text-red-300'
                                                            }`}
                                                    >
                                                        {usuario.empresa_activa ? 'Empresa activa' : 'Empresa inactiva'}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                                                        {usuario.plan_codigo || 'Sin plan'}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-300">
                                                        {usuario.estado_suscripcion || 'Sin estado'}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`rounded-full border px-3 py-1 text-xs font-bold ${usuario.rol_codigo === 'administrador'
                                                            ? 'border-purple-500/20 bg-purple-500/10 text-purple-300'
                                                            : usuario.rol_codigo === 'soporte'
                                                                ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300'
                                                                : usuario.rol_codigo === 'tecnico'
                                                                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                                                                    : 'border-slate-500/20 bg-slate-500/10 text-slate-300'
                                                            }`}
                                                    >
                                                        {usuario.rol_nombre || 'Sin rol'}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4 text-slate-400">
                                                    {usuario.usuario_rol_texto || 'Sin dato'}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-bold ${usuario.usuario_activo
                                                            ? 'bg-emerald-500/20 text-emerald-300'
                                                            : 'bg-red-500/20 text-red-300'
                                                            }`}
                                                    >
                                                        {usuario.usuario_activo ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <button
                                                        type="button"
                                                        className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-bold text-slate-400 transition-colors hover:border-emerald-500/40 hover:text-emerald-300"
                                                        onClick={() => setUsuarioGestionSeleccionado(usuario)}
                                                    >
                                                        Gestionar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
                {/* Módulo Roles y permisos */}
                {moduloDuenoActivo === 'roles' && (
                    <div className="rounded-3xl border border-purple-500/20 bg-slate-950/70 p-6 shadow-xl shadow-purple-500/5">
                        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-sm font-bold text-purple-300">
                                    🔐 Módulo conectado
                                </p>

                                <h4 className="mt-1 text-2xl font-black text-white">
                                    Roles y usuarios por empresa
                                </h4>

                                <p className="mt-1 text-sm text-slate-400">
                                    Aquí puedes ver cuántos usuarios tiene cada empresa y qué rol tiene cada usuario.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        await cargarEmpresasDueno();
                                        await cargarUsuariosDueno();
                                    }}
                                    className="rounded-2xl border border-purple-500/30 bg-purple-500/10 px-5 py-3 text-sm font-bold text-purple-300 transition-all hover:bg-purple-500/20"
                                >
                                    Actualizar roles
                                </button>
                            </div>
                        </div>

                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
                                <p className="text-xs font-bold text-slate-400">
                                    Usuarios totales
                                </p>

                                <p className="mt-2 text-3xl font-black text-cyan-300">
                                    {totalUsuariosRolesDueno}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                                <p className="text-xs font-bold text-slate-400">
                                    Empresas con usuarios
                                </p>

                                <p className="mt-2 text-3xl font-black text-emerald-300">
                                    {totalEmpresasConUsuariosDueno}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
                                <p className="text-xs font-bold text-slate-400">
                                    Alertas de roles
                                </p>

                                <p className="mt-2 text-3xl font-black text-amber-300">
                                    {totalEmpresasExcedidasDueno}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Sin rol: {totalUsuariosSinRolDueno}
                                </p>
                            </div>
                        </div>

                        {cargandoUsuariosDueno || cargandoEmpresasDueno ? (
                            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-8 text-center">
                                <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />

                                <p className="text-sm font-bold text-purple-300">
                                    Cargando roles y usuarios...
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Consultando empresas y vínculos de usuarios desde Supabase.
                                </p>
                            </div>
                        ) : resumenRolesPorEmpresaDueno.length === 0 ? (
                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6 text-center">
                                <p className="text-sm font-bold text-amber-300">
                                    No hay datos de roles para mostrar.
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Presiona “Actualizar roles” para volver a consultar.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                                {resumenRolesPorEmpresaDueno.map((item) => (
                                    <div
                                        key={item.empresa.empresa_id}
                                        className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5"
                                    >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <h5 className="text-xl font-black text-white">
                                                    {item.empresa.empresa}
                                                </h5>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {item.empresa.rut || 'Sin RUT'}
                                                </p>

                                                <p className="mt-1 text-[10px] text-slate-600">
                                                    {item.empresa.empresa_id}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-black text-cyan-300">
                                                    👥 {item.totalUsuarios} usuarios
                                                </span>

                                                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-300">
                                                    ✅ {item.totalUsuariosActivos} activos
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {item.roles.length === 0 ? (
                                                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-bold text-slate-400">
                                                    Sin usuarios vinculados
                                                </span>
                                            ) : (
                                                item.roles.map((rol) => (
                                                    <span
                                                        key={`${item.empresa.empresa_id}-${rol.rol}`}
                                                        className={`rounded-full border px-3 py-1 text-xs font-black ${rol.excedido
                                                            ? 'border-red-500/40 bg-red-500/10 text-red-300'
                                                            : rol.rol === 'Administrador'
                                                                ? 'border-purple-500/30 bg-purple-500/10 text-purple-300'
                                                                : rol.rol === 'Soporte'
                                                                    ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                                                                    : rol.rol === 'Técnico'
                                                                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                                                                        : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                                                            }`}
                                                    >
                                                        {rol.excedido ? '⚠️ ' : ''}
                                                        {rol.rol}: {rol.total}

                                                        {rol.rol !== 'Sin rol' && (
                                                            <>
                                                                {' / '}
                                                                {mostrarLimiteBadgeDueno(rol.limite)}
                                                            </>
                                                        )}
                                                    </span>
                                                ))
                                            )}
                                        </div>

                                        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800">
                                            {item.usuariosEmpresa.length === 0 ? (
                                                <div className="bg-slate-900/50 p-4 text-sm text-slate-500">
                                                    Esta empresa no tiene usuarios vinculados.
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-slate-800">
                                                    {item.usuariosEmpresa.map((usuario) => {
                                                        const rolVisible = obtenerRolVisibleUsuarioDueno(usuario);

                                                        return (
                                                            <div
                                                                key={usuario.usuario_empresa_id}
                                                                className="flex flex-col gap-3 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between"
                                                            >
                                                                <div>
                                                                    <p className="font-black text-white">
                                                                        {usuario.username || 'Sin nombre'}
                                                                        {usuario.apellido ? ` ${usuario.apellido}` : ''}
                                                                    </p>

                                                                    <p className="mt-1 text-xs text-slate-500">
                                                                        Usuario ID: {usuario.usuario_id}
                                                                    </p>

                                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                                        <span
                                                                            className={`rounded-full px-3 py-1 text-xs font-black ${usuario.usuario_activo
                                                                                ? 'bg-emerald-500/10 text-emerald-300'
                                                                                : 'bg-red-500/10 text-red-300'
                                                                                }`}
                                                                        >
                                                                            {usuario.usuario_activo ? 'Activo' : 'Inactivo'}
                                                                        </span>

                                                                        <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-black text-purple-300">
                                                                            {rolVisible}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => setUsuarioGestionSeleccionado(usuario)}
                                                                    className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-400 transition-colors hover:border-purple-500/40 hover:text-purple-300"
                                                                >
                                                                    Gestionar usuario
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {/* Módulo Diagnóstico */}
                {/* Módulo Planes */}
                {moduloDuenoActivo === 'planes' && (
                    <div className="rounded-3xl border border-amber-500/20 bg-slate-950/70 p-6 shadow-xl shadow-amber-500/5">
                        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-sm font-bold text-amber-300">
                                    💳 Módulo conectado
                                </p>

                                <h4 className="mt-1 text-2xl font-black text-white">
                                    Planes FleetVision
                                </h4>

                                <p className="mt-1 text-sm text-slate-400">
                                    Visualiza límites por rol, empresas activas, usuarios vinculados y activos por plan.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        await cargarEmpresasDueno();
                                        await cargarUsuariosDueno();

                                        mostrarModalSistema(
                                            'exito',
                                            'Planes actualizados',
                                            'La información de empresas, usuarios y límites fue recargada.',
                                            'Los valores del módulo Planes ya están sincronizados con Supabase.'
                                        );
                                    }}
                                    className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-sm font-black text-amber-300 transition-all hover:bg-amber-500/20"
                                >
                                    Actualizar planes
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setModuloDuenoActivo('empresas');
                                        cargarEmpresasDueno();
                                    }}
                                    className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-black text-cyan-300 transition-all hover:bg-cyan-500/20"
                                >
                                    Ir a empresas
                                </button>
                            </div>
                        </div>

                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
                                <p className="text-sm text-slate-400">Planes definidos</p>
                                <p className="mt-2 text-3xl font-black text-amber-300">
                                    {planesParaMostrar.length}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
                                <p className="text-sm text-slate-400">Empresas registradas</p>
                                <p className="mt-2 text-3xl font-black text-cyan-300">
                                    {empresasDueno.length}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                                <p className="text-sm text-slate-400">Usuarios vinculados</p>
                                <p className="mt-2 text-3xl font-black text-emerald-300">
                                    {usuariosDueno.length}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-5">
                                <p className="text-sm text-slate-400">Empresas trial</p>
                                <p className="mt-2 text-3xl font-black text-purple-300">
                                    {
                                        empresasDueno.filter(
                                            (empresa) => empresa.estado_suscripcion === 'trial'
                                        ).length
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
                            {planesParaMostrar.map((plan) => {
                                const clases = obtenerClasePlan(plan.color);
                                const empresasPlan = contarEmpresasPorPlan(plan.codigo);
                                const empresasActivasPlan = contarEmpresasActivasPorPlan(plan.codigo);
                                const usuariosPlan = contarUsuariosPorPlan(plan.codigo);
                                const activosPlan = contarActivosPorPlan(plan.codigo);
                                const empresasTrialPlan = contarEmpresasTrialPorPlan(plan.codigo);

                                return (
                                    <div
                                        key={plan.codigo}
                                        className={`relative rounded-3xl border p-5 shadow-xl ${clases.card}`}
                                    >
                                        {plan.destacado && (
                                            <div className="absolute right-4 top-4 rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-purple-200">
                                                Recomendado
                                            </div>
                                        )}

                                        <div className="mb-5">
                                            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${clases.badge}`}>
                                                {plan.subtitulo}
                                            </span>

                                            <h5 className="mt-4 text-2xl font-black text-white">
                                                {plan.nombre}
                                            </h5>

                                            <p className={`mt-1 text-2xl font-black ${clases.texto}`}>
                                                {mostrarPrecioPlan(plan.precio)}
                                            </p>

                                            <p className="mt-3 min-h-[60px] text-sm text-slate-400">
                                                {plan.descripcion}
                                            </p>
                                        </div>

                                        <div className="mb-5 grid grid-cols-2 gap-3">
                                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                                                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                                                    Empresas
                                                </p>
                                                <p className="mt-1 text-xl font-black text-white">
                                                    {empresasPlan}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                                                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                                                    Activas
                                                </p>
                                                <p className="mt-1 text-xl font-black text-emerald-300">
                                                    {empresasActivasPlan}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                                                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                                                    Usuarios
                                                </p>
                                                <p className="mt-1 text-xl font-black text-cyan-300">
                                                    {usuariosPlan}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                                                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                                                    Activos
                                                </p>
                                                <p className="mt-1 text-xl font-black text-amber-300">
                                                    {activosPlan}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                                                Límites por rol
                                            </p>

                                            {rolesControladosPlanes.map((rol) => (
                                                <div
                                                    key={`${plan.codigo}-${rol.codigo}`}
                                                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2"
                                                >
                                                    <span className="text-sm font-bold text-slate-300">
                                                        {rol.icono} {rol.nombre}
                                                    </span>

                                                    <span className={`text-sm font-black ${clases.texto}`}>
                                                        {obtenerLimiteTextoPlan(plan.codigo, rol.codigo)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-5 space-y-2">
                                            {obtenerFuncionesPlan(plan).map((funcion) => (
                                                <div
                                                    key={`${plan.codigo}-${funcion}`}
                                                    className="flex items-center gap-2 text-sm text-slate-300"
                                                >
                                                    <span className={clases.texto}>✓</span>
                                                    <span>{funcion}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => abrirModalEditarPlan(plan as PlanSaasDueno)}
                                            className={`mt-5 w-full rounded-2xl border px-4 py-3 text-sm font-black transition-all ${clases.boton}`}
                                        >
                                            ✏️ Editar plan
                                        </button>
                                        <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3">
                                            <p className="text-xs font-black text-amber-300">
                                                Trial en este plan: {empresasTrialPlan}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Control visual conectado a empresas actuales.
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 rounded-3xl border border-slate-700/60 bg-slate-950/80 p-5">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h5 className="text-xl font-black text-white">
                                        Empresas por plan
                                    </h5>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Resumen rápido para revisar distribución comercial y uso actual.
                                    </p>
                                </div>
                            </div>

                            {empresasDueno.length === 0 ? (
                                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-center">
                                    <p className="font-bold text-amber-300">
                                        No hay empresas cargadas.
                                    </p>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Presiona “Actualizar planes” para consultar Supabase.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                                    <table className="w-full min-w-[900px] text-left text-sm">
                                        <thead className="bg-slate-900/90">
                                            <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                                                <th className="px-4 py-4">Empresa</th>
                                                <th className="px-4 py-4">Plan</th>
                                                <th className="px-4 py-4">Suscripción</th>
                                                <th className="px-4 py-4 text-center">Usuarios</th>
                                                <th className="px-4 py-4 text-center">Activos</th>
                                                <th className="px-4 py-4">Estado</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {empresasDueno.map((empresa) => {
                                                const estadoSuscripcion = obtenerEstadoSuscripcion(
                                                    empresa.estado_suscripcion
                                                );

                                                return (
                                                    <tr
                                                        key={`planes-${empresa.empresa_id}`}
                                                        className="border-b border-slate-900 transition-colors hover:bg-white/[0.02]"
                                                    >
                                                        <td className="px-4 py-4">
                                                            <p className="font-black text-white">
                                                                {empresa.empresa}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {empresa.rut || 'Sin RUT'}
                                                            </p>
                                                        </td>

                                                        <td className="px-4 py-4">
                                                            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-black uppercase text-amber-300">
                                                                {empresa.plan_codigo || 'sin plan'}
                                                            </span>
                                                        </td>

                                                        <td className="px-4 py-4">
                                                            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${estadoSuscripcion.clase}`}>
                                                                {estadoSuscripcion.texto}
                                                            </span>
                                                        </td>

                                                        <td className="px-4 py-4 text-center font-black text-cyan-300">
                                                            {empresa.total_usuarios || 0}
                                                        </td>

                                                        <td className="px-4 py-4 text-center font-black text-emerald-300">
                                                            {empresa.total_activos || 0}
                                                        </td>

                                                        <td className="px-4 py-4">
                                                            <span
                                                                className={`rounded-full px-3 py-1 text-xs font-black ${empresa.empresa_activa
                                                                    ? 'bg-emerald-500/20 text-emerald-300'
                                                                    : 'bg-red-500/20 text-red-300'
                                                                    }`}
                                                            >
                                                                {empresa.empresa_activa ? 'Activa' : 'Inactiva'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* Módulo Solicitudes de prueba gratuita */}
                {moduloDuenoActivo === 'solicitudes' && (
                    <div className="rounded-3xl border border-cyan-500/20 bg-slate-950/70 p-6 shadow-xl shadow-cyan-500/5">
                        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-sm font-bold text-cyan-300">
                                    🧪 Módulo conectado
                                </p>

                                <h4 className="mt-1 text-2xl font-black text-white">
                                    Solicitudes de prueba gratuita
                                </h4>

                                <p className="mt-1 text-sm text-slate-400">
                                    Revisa los contactos que llegan desde el formulario del home y gestiona su avance comercial.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={cargarSolicitudesPrueba}
                                disabled={cargandoSolicitudesPrueba}
                                className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-black text-cyan-300 transition-all hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {cargandoSolicitudesPrueba ? 'Actualizando...' : 'Actualizar solicitudes'}
                            </button>
                        </div>

                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
                            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
                                <p className="text-sm text-slate-400">Total</p>
                                <p className="mt-2 text-3xl font-black text-cyan-300">
                                    {solicitudesPrueba.length}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
                                <p className="text-sm text-slate-400">Nuevas</p>
                                <p className="mt-2 text-3xl font-black text-blue-300">
                                    {solicitudesPrueba.filter((s) => s.estado === 'nueva').length}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                                <p className="text-sm text-slate-400">Contactadas</p>
                                <p className="mt-2 text-3xl font-black text-emerald-300">
                                    {solicitudesPrueba.filter((s) => s.estado === 'contactada').length}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
                                <p className="text-sm text-slate-400">En evaluación</p>
                                <p className="mt-2 text-3xl font-black text-amber-300">
                                    {solicitudesPrueba.filter((s) => s.estado === 'en_evaluacion').length}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-5">
                                <p className="text-sm text-slate-400">Convertidas</p>
                                <p className="mt-2 text-3xl font-black text-purple-300">
                                    {solicitudesPrueba.filter((s) => s.estado === 'convertida').length}
                                </p>
                            </div>
                        </div>

                        <div className="mb-5 flex flex-wrap gap-3">
                            {[
                                { codigo: 'todas', nombre: 'Todas' },
                                { codigo: 'nueva', nombre: 'Nuevas' },
                                { codigo: 'contactada', nombre: 'Contactadas' },
                                { codigo: 'en_evaluacion', nombre: 'En evaluación' },
                                { codigo: 'convertida', nombre: 'Convertidas' },
                                { codigo: 'rechazada', nombre: 'Rechazadas' },
                            ].map((filtro) => (
                                <button
                                    key={filtro.codigo}
                                    type="button"
                                    onClick={() => setFiltroEstadoSolicitud(filtro.codigo as any)}
                                    className={`rounded-2xl border px-4 py-2 text-sm font-black transition-all ${filtroEstadoSolicitud === filtro.codigo
                                        ? 'border-cyan-400/50 bg-cyan-500/20 text-cyan-200'
                                        : 'border-slate-700 bg-slate-900/40 text-slate-400 hover:border-cyan-500/30 hover:text-cyan-300'
                                        }`}
                                >
                                    {filtro.nombre}
                                </button>
                            ))}
                        </div>

                        {solicitudesFiltradas.length === 0 ? (
                            <div className="rounded-3xl border border-slate-700/60 bg-slate-950/80 p-8 text-center">
                                <p className="text-4xl">📭</p>
                                <h5 className="mt-3 text-xl font-black text-white">
                                    No hay solicitudes para mostrar
                                </h5>
                                <p className="mt-1 text-sm text-slate-400">
                                    Cuando alguien complete el formulario del home, aparecerá aquí.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-3xl border border-slate-800">
                                <table className="w-full min-w-[1100px] text-left text-sm">
                                    <thead className="bg-slate-900/90">
                                        <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                                            <th className="px-4 py-4">Contacto</th>
                                            <th className="px-4 py-4">Empresa / RUT</th>
                                            <th className="px-4 py-4">Ubicación</th>
                                            <th className="px-4 py-4">Estado</th>
                                            <th className="px-4 py-4">Fecha</th>
                                            <th className="px-4 py-4">Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {solicitudesFiltradas.map((solicitud) => {
                                            const estadoVisual = obtenerEstadoSolicitudVisual(solicitud.estado);

                                            return (
                                                <tr
                                                    key={`solicitud-${solicitud.id}`}
                                                    className="border-b border-slate-900 transition-colors hover:bg-white/[0.02]"
                                                >
                                                    <td className="px-4 py-4">
                                                        <p className="font-black text-white">
                                                            {solicitud.nombre || 'Sin nombre'}
                                                        </p>

                                                        <p className="text-xs text-cyan-300">
                                                            {solicitud.correo || 'Sin correo'}
                                                        </p>

                                                        <p className="text-xs text-slate-500">
                                                            {solicitud.telefono || 'Sin teléfono'}
                                                        </p>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <p className="font-bold text-slate-200">
                                                            {solicitud.nombre || 'Sin empresa'}
                                                        </p>

                                                        <p className="text-xs text-slate-500">
                                                            RUT: {solicitud.rut || 'Sin RUT'}
                                                        </p>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <p className="font-bold text-slate-300">
                                                            {solicitud.region || 'Sin región'}
                                                        </p>

                                                        <p className="text-xs text-slate-500">
                                                            {solicitud.pais || 'Sin país'}
                                                        </p>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${estadoVisual.clase}`}>
                                                            {estadoVisual.icono} {estadoVisual.texto}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <p className="font-bold text-slate-300">
                                                            {solicitud.created_at
                                                                ? new Date(solicitud.created_at).toLocaleDateString('es-CL')
                                                                : 'Sin fecha'}
                                                        </p>

                                                        <p className="text-xs text-slate-500">
                                                            {solicitud.created_at
                                                                ? new Date(solicitud.created_at).toLocaleTimeString('es-CL', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })
                                                                : ''}
                                                        </p>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => abrirModalConvertirSolicitud(solicitud)}
                                                                disabled={
                                                                    guardandoSolicitudPrueba ||
                                                                    convirtiendoSolicitud ||
                                                                    solicitud.estado === 'convertida'
                                                                }
                                                                className="w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-300 transition-all hover:border-emerald-400/60 hover:bg-emerald-500/20 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                {solicitud.estado === 'convertida'
                                                                    ? '✅ Demo creado'
                                                                    : '🚀 Crear demo'}
                                                            </button>

                                                            <div className="grid grid-cols-2 gap-2">
                                                                {([
                                                                    {
                                                                        codigo: 'contactada',
                                                                        texto: 'Contactada',
                                                                        icono: '📞',
                                                                        clase: 'hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300',
                                                                    },
                                                                    {
                                                                        codigo: 'en_evaluacion',
                                                                        texto: 'Evaluar',
                                                                        icono: '🔎',
                                                                        clase: 'hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-300',
                                                                    },
                                                                    {
                                                                        codigo: 'convertida',
                                                                        texto: 'Convertida',
                                                                        icono: '✅',
                                                                        clase: 'hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-300',
                                                                    },
                                                                    {
                                                                        codigo: 'rechazada',
                                                                        texto: 'Rechazar',
                                                                        icono: '❌',
                                                                        clase: 'hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300',
                                                                    },
                                                                ] as {
                                                                    codigo: EstadoSolicitudPrueba;
                                                                    texto: string;
                                                                    icono: string;
                                                                    clase: string;
                                                                }[]).map((estado) => {
                                                                    const activo = solicitud.estado === estado.codigo;

                                                                    return (
                                                                        <button
                                                                            key={`${solicitud.id}-${estado.codigo}`}
                                                                            type="button"
                                                                            onClick={() =>
                                                                                cambiarEstadoSolicitudPrueba(
                                                                                    solicitud.id,
                                                                                    estado.codigo
                                                                                )
                                                                            }
                                                                            disabled={guardandoSolicitudPrueba || activo}
                                                                            className={`rounded-xl border px-3 py-2 text-xs font-black transition-all disabled:cursor-not-allowed disabled:opacity-50 ${activo
                                                                                ? 'border-cyan-500/40 bg-cyan-500/20 text-cyan-200'
                                                                                : `border-slate-700 bg-slate-900 text-slate-300 ${estado.clase}`
                                                                                }`}
                                                                        >
                                                                            {activo ? 'Actual' : `${estado.icono} ${estado.texto}`}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
                {moduloDuenoActivo === 'diagnostico' && (
                    <div className="rounded-3xl border border-blue-500/20 bg-slate-950/70 p-6 shadow-xl shadow-blue-500/5">
                        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-sm font-bold text-blue-300">🧪 Módulo conectado</p>

                                <h4 className="mt-1 text-2xl font-black text-white">
                                    Diagnóstico general del sistema
                                </h4>

                                <p className="mt-1 text-sm text-slate-400">
                                    Revisión automática de empresas, suscripciones, activos y vínculos de usuarios.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={cargarDiagnosticoDueno}
                                className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 text-sm font-bold text-blue-300 transition-all hover:bg-blue-500/20"
                            >
                                Actualizar diagnóstico
                            </button>
                        </div>

                        {cargandoDiagnosticoDueno ? (
                            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-8 text-center">
                                <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />

                                <p className="text-sm font-bold text-blue-300">
                                    Cargando diagnóstico...
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Revisando estado general de FleetVision.
                                </p>
                            </div>
                        ) : diagnosticoDueno.length === 0 ? (
                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6 text-center">
                                <p className="text-sm font-bold text-amber-300">
                                    No hay datos de diagnóstico para mostrar.
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Presiona “Actualizar diagnóstico” para volver a consultar.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {diagnosticoDueno.map((item, index) => {
                                    const esOk = item.severidad === 'ok';
                                    const esAlta = item.severidad === 'alta';

                                    return (
                                        <div
                                            key={`${item.categoria}-${item.detalle}-${index}`}
                                            className={`rounded-2xl border p-5 ${esOk
                                                ? 'border-emerald-500/20 bg-emerald-500/10'
                                                : esAlta
                                                    ? 'border-red-500/20 bg-red-500/10'
                                                    : 'border-amber-500/20 bg-amber-500/10'
                                                }`}
                                        >
                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-bold ${esOk
                                                        ? 'bg-emerald-500/20 text-emerald-300'
                                                        : esAlta
                                                            ? 'bg-red-500/20 text-red-300'
                                                            : 'bg-amber-500/20 text-amber-300'
                                                        }`}
                                                >
                                                    {item.severidad.toUpperCase()}
                                                </span>

                                                <span className="text-2xl font-black text-white">
                                                    {item.cantidad}
                                                </span>
                                            </div>

                                            <p className="text-sm font-bold text-white">
                                                {item.categoria}
                                            </p>

                                            <p className="mt-1 text-sm text-slate-400">
                                                {item.detalle}
                                            </p>

                                            <p
                                                className={`mt-4 text-xs font-bold ${esOk
                                                    ? 'text-emerald-300'
                                                    : esAlta
                                                        ? 'text-red-300'
                                                        : 'text-amber-300'
                                                    }`}
                                            >
                                                {esOk
                                                    ? '✅ Sin problemas detectados'
                                                    : '⚠️ Requiere revisión'}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Módulos próximos */}
                {moduloDuenoActivo !== 'resumen' &&
                    moduloDuenoActivo !== 'empresas' &&
                    moduloDuenoActivo !== 'usuarios' &&
                    moduloDuenoActivo !== 'planes' &&
                    moduloDuenoActivo !== 'solicitudes' &&
                    moduloDuenoActivo !== 'roles' &&
                    moduloDuenoActivo !== 'diagnostico' && (
                        <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-6">
                            <h4 className="text-xl font-black text-amber-300">
                                🚧 Módulo en preparación
                            </h4>

                            <p className="mt-2 text-sm text-slate-400">
                                Este módulo ya quedó reservado en la estructura del Panel Dueño.
                                Lo conectaremos después con funciones seguras de Supabase.
                            </p>
                        </div>
                    )}

                {/* Resumen técnico */}
                {moduloDuenoActivo === 'resumen' && (
                    <div className="rounded-3xl border border-cyan-500/20 bg-slate-950/70 p-6">
                        <h4 className="text-xl font-black text-white">
                            📌 Próximo paso técnico
                        </h4>

                        <p className="mt-2 text-sm text-slate-400">
                            El Panel Dueño ya detecta el rol global. Ahora los módulos Empresas, Usuarios
                            y Diagnóstico están conectados a Supabase de forma segura.
                        </p>
                    </div>
                )}

                {/* Modal Gestión Empresa */}
                {/* Modal Nueva Empresa */}
                {mostrarModalNuevaEmpresa && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/30 p-6 shadow-2xl shadow-emerald-500/10">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold text-emerald-300">
                                        🏢 Nueva empresa
                                    </p>

                                    <h3 className="mt-1 text-2xl font-black text-white">
                                        Crear empresa en FleetVision
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Registra una empresa nueva con plan inicial y estado de suscripción.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setMostrarModalNuevaEmpresa(false)}
                                    className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                                >
                                    Cerrar
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-300">
                                        Nombre empresa *
                                    </label>

                                    <input
                                        type="text"
                                        defaultValue={nombreNuevaEmpresaRef.current}
                                        onChange={(e) => {
                                            nombreNuevaEmpresaRef.current = e.target.value;
                                        }}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-emerald-500"
                                        placeholder="Ej: Transportes Avalos"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-300">
                                        RUT empresa
                                    </label>

                                    <input
                                        type="text"
                                        defaultValue={rutNuevaEmpresaRef.current}
                                        onChange={(e) => {
                                            rutNuevaEmpresaRef.current = e.target.value;
                                        }}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-emerald-500"
                                        placeholder="Ej: 76.123.456-7"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-300">
                                        Plan inicial
                                    </label>

                                    <select
                                        value={nuevaEmpresaDueno.plan_codigo}
                                        onChange={(e) =>
                                            setNuevaEmpresaDueno({
                                                ...nuevaEmpresaDueno,
                                                plan_codigo: e.target.value as NuevaEmpresaDueno['plan_codigo'],
                                            })
                                        }
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition-colors focus:border-emerald-500"
                                    >
                                        <option value="gratis">Gratis</option>
                                        <option value="basico">Básico</option>
                                        <option value="pro">Pro</option>
                                        <option value="empresa">Empresa</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-300">
                                        Estado suscripción
                                    </label>

                                    <select
                                        value={nuevaEmpresaDueno.estado_suscripcion}
                                        onChange={(e) =>
                                            setNuevaEmpresaDueno({
                                                ...nuevaEmpresaDueno,
                                                estado_suscripcion: e.target.value as NuevaEmpresaDueno['estado_suscripcion'],
                                            })
                                        }
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition-colors focus:border-emerald-500"
                                    >
                                        <option value="trial">Trial</option>
                                        <option value="activa">Activa</option>
                                        <option value="vencida">Vencida</option>
                                        <option value="cancelada">Cancelada</option>
                                        <option value="suspendida">Suspendida</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                                <label className="flex cursor-pointer items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-black text-white">
                                            Empresa activa
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Si está activa, podrá aparecer en la gestión normal del sistema.
                                        </p>
                                    </div>

                                    <input
                                        type="checkbox"
                                        checked={nuevaEmpresaDueno.activa}
                                        onChange={(e) =>
                                            setNuevaEmpresaDueno({
                                                ...nuevaEmpresaDueno,
                                                activa: e.target.checked,
                                            })
                                        }
                                        className="h-5 w-5 accent-emerald-500"
                                    />
                                </label>
                            </div>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setMostrarModalNuevaEmpresa(false)}
                                    disabled={guardandoNuevaEmpresa}
                                    className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    onClick={crearEmpresaDueno}
                                    disabled={guardandoNuevaEmpresa}
                                    className="rounded-2xl border border-emerald-500/30 bg-emerald-500/20 px-5 py-3 text-sm font-black text-emerald-300 transition-all hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {guardandoNuevaEmpresa ? 'Creando empresa...' : 'Crear empresa'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {empresaGestionSeleccionada && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/40 p-6 shadow-2xl shadow-cyan-500/10">

                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold text-cyan-300">
                                        🏢 Gestión de empresa
                                    </p>

                                    <h3 className="mt-1 text-2xl font-black text-white">
                                        {empresaGestionSeleccionada.empresa}
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        ID: {empresaGestionSeleccionada.empresa_id}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setEmpresaGestionSeleccionada(null)}
                                    className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                                >
                                    Cerrar
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                                    <p className="text-xs text-slate-400">Plan actual</p>

                                    <p className="mt-1 text-xl font-black text-cyan-300">
                                        {empresaGestionSeleccionada.nombre_plan ||
                                            empresaGestionSeleccionada.plan_codigo ||
                                            'Sin plan'}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
                                    <p className="text-xs text-slate-400">Suscripción</p>

                                    <p className="mt-1 text-xl font-black text-purple-300">
                                        {empresaGestionSeleccionada.estado_suscripcion || 'Sin estado'}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                                    <p className="text-xs text-slate-400">Estado empresa</p>

                                    <p
                                        className={`mt-1 text-xl font-black ${empresaGestionSeleccionada.empresa_activa
                                            ? 'text-emerald-300'
                                            : 'text-red-300'
                                            }`}
                                    >
                                        {empresaGestionSeleccionada.empresa_activa ? 'Activa' : 'Inactiva'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/60 p-5">
                                <div>
                                    <h4 className="text-lg font-black text-white">
                                        💳 Cambiar plan
                                    </h4>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Selecciona el plan que tendrá esta empresa. El trial usa la configuración actual de FleetVision.
                                    </p>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                                    {(['gratis', 'basico', 'pro', 'empresa'] as const).map((plan) => (
                                        <button
                                            key={plan}
                                            type="button"
                                            disabled={guardandoGestionEmpresa}
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        `¿Cambiar ${empresaGestionSeleccionada.empresa} al plan ${plan}?`
                                                    )
                                                ) {
                                                    cambiarPlanEmpresaDueno(
                                                        empresaGestionSeleccionada.empresa_id,
                                                        plan
                                                    );
                                                }
                                            }}
                                            className={`rounded-2xl border px-4 py-3 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${empresaGestionSeleccionada.plan_codigo === plan
                                                ? 'border-cyan-500/60 bg-cyan-500/20 text-cyan-200 shadow-lg shadow-cyan-500/10'
                                                : 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
                                                }`}
                                        >
                                            {plan.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-950/60 p-5">
                                <h4 className="text-lg font-black text-white">
                                    📌 Estado de suscripción
                                </h4>

                                <p className="mt-1 text-xs text-slate-500">
                                    Controla si la empresa está en trial, activa, vencida, cancelada o suspendida.
                                </p>

                                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                                    {(['trial', 'activa', 'vencida', 'cancelada', 'suspendida'] as const).map(
                                        (estado) => (
                                            <button
                                                key={estado}
                                                type="button"
                                                disabled={guardandoGestionEmpresa}
                                                onClick={() =>
                                                    abrirModalConfirmarSuscripcion(
                                                        empresaGestionSeleccionada.empresa_id,
                                                        empresaGestionSeleccionada.empresa,
                                                        estado
                                                    )
                                                }
                                                className={`rounded-2xl border px-4 py-3 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${empresaGestionSeleccionada.estado_suscripcion === estado
                                                    ? 'border-purple-500/60 bg-purple-500/20 text-purple-200 shadow-lg shadow-purple-500/10'
                                                    : 'border-purple-500/20 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20'
                                                    }`}
                                            >
                                                {estado.toUpperCase()}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-5">
                                    <h4 className="text-lg font-black text-white">
                                        ⏳ Trial
                                    </h4>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Puedes agregar días o fijar una fecha exacta para el término del trial.
                                    </p>

                                    <div className="mt-4 grid grid-cols-1 gap-3">
                                        <button
                                            type="button"
                                            disabled={guardandoGestionEmpresa}
                                            onClick={() =>
                                                extenderTrialEmpresaDueno(
                                                    empresaGestionSeleccionada.empresa_id
                                                )
                                            }
                                            className="w-full rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-300 transition-all hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Extender trial por días
                                        </button>

                                        <button
                                            type="button"
                                            disabled={guardandoGestionEmpresa}
                                            onClick={() =>
                                                fijarFechaTrialEmpresaDueno(
                                                    empresaGestionSeleccionada.empresa_id
                                                )
                                            }
                                            className="w-full rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-300 transition-all hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Fijar fecha exacta
                                        </button>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-5">
                                    <h4 className="text-lg font-black text-white">
                                        🏢 Empresa
                                    </h4>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Activa o desactiva el acceso de esta empresa.
                                    </p>

                                    <button
                                        type="button"
                                        disabled={guardandoGestionEmpresa}
                                        onClick={() => {
                                            const nuevoEstado =
                                                !empresaGestionSeleccionada.empresa_activa;

                                            if (
                                                confirm(
                                                    `${nuevoEstado ? '¿Activar' : '¿Desactivar'} empresa ${empresaGestionSeleccionada.empresa}?`
                                                )
                                            ) {
                                                cambiarEstadoEmpresaDueno(
                                                    empresaGestionSeleccionada.empresa_id,
                                                    nuevoEstado
                                                );
                                            }
                                        }}
                                        className={`mt-4 w-full rounded-2xl border px-4 py-3 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${empresaGestionSeleccionada.empresa_activa
                                            ? 'border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20'
                                            : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                                            }`}
                                    >
                                        {empresaGestionSeleccionada.empresa_activa
                                            ? 'Desactivar empresa'
                                            : 'Activar empresa'}
                                    </button>
                                </div>
                            </div>

                            {guardandoGestionEmpresa && (
                                <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-center text-sm font-bold text-cyan-300">
                                    Guardando cambios...
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Modal Vincular Usuario */}
                <button
                    type="button"
                    onClick={abrirModalCrearUsuario}
                    className="rounded-2xl border border-purple-500/30 bg-purple-500/10 px-5 py-3 text-sm font-bold text-purple-300 transition-all hover:bg-purple-500/20"
                >
                    + Crear usuario nuevo
                </button>
                {/* Modal Crear Usuario Nuevo */}
                {mostrarModalCrearUsuario && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl border border-purple-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950/30 p-6 shadow-2xl shadow-purple-500/10">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold text-purple-300">
                                        👤 Crear usuario nuevo
                                    </p>

                                    <h3 className="mt-1 text-2xl font-black text-white">
                                        Crear usuario en FleetVision
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Crea un usuario real en Supabase Auth, asígnalo a una empresa y define su rol inicial.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setMostrarModalCrearUsuario(false)}
                                    className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                                >
                                    Cerrar
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-300">
                                        Nombre de usuario *
                                    </label>

                                    <input
                                        type="text"
                                        defaultValue={usernameCrearUsuarioRef.current}
                                        onChange={(e) => {
                                            usernameCrearUsuarioRef.current = e.target.value;
                                        }}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-purple-500"
                                        placeholder="Ej: tecnico1"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-300">
                                        Apellido / nombre completo
                                    </label>

                                    <input
                                        type="text"
                                        defaultValue={apellidoCrearUsuarioRef.current}
                                        onChange={(e) => {
                                            apellidoCrearUsuarioRef.current = e.target.value;
                                        }}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-purple-500"
                                        placeholder="Ej: Juan Pérez"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-300">
                                        Correo *
                                    </label>

                                    <input
                                        type="email"
                                        defaultValue={emailCrearUsuarioRef.current}
                                        onChange={(e) => {
                                            emailCrearUsuarioRef.current = e.target.value;
                                        }}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-purple-500"
                                        placeholder="usuario@empresa.cl"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-300">
                                        Contraseña temporal *
                                    </label>

                                    <input
                                        type="password"
                                        defaultValue={passwordCrearUsuarioRef.current}
                                        onChange={(e) => {
                                            passwordCrearUsuarioRef.current = e.target.value;
                                        }}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-purple-500"
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-300">
                                        Empresa *
                                    </label>

                                    <select
                                        value={empresaCrearUsuario}
                                        onChange={(e) => setEmpresaCrearUsuario(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition-colors focus:border-purple-500"
                                    >
                                        <option value="">Seleccionar empresa</option>

                                        {empresasDueno.map((empresa) => (
                                            <option key={empresa.empresa_id} value={empresa.empresa_id}>
                                                {empresa.empresa} · {empresa.plan_codigo || 'sin plan'}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-300">
                                        Rol inicial *
                                    </label>

                                    <select
                                        value={rolCrearUsuario}
                                        onChange={(e) => setRolCrearUsuario(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition-colors focus:border-purple-500"
                                    >
                                        <option value="">Seleccionar rol</option>

                                        {rolesEmpresaDueno
                                            .filter((rol) =>
                                                ['administrador', 'soporte', 'tecnico'].includes(rol.rol_codigo)
                                            )
                                            .map((rol) => (
                                                <option key={rol.rol_id} value={rol.rol_id}>
                                                    {rol.rol_nombre}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                                <label className="flex cursor-pointer items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-black text-white">
                                            Usuario activo
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Si está activo, podrá usar el sistema inmediatamente.
                                        </p>
                                    </div>

                                    <input
                                        type="checkbox"
                                        checked={activoCrearUsuario}
                                        onChange={(e) => setActivoCrearUsuario(e.target.checked)}
                                        className="h-5 w-5 accent-purple-500"
                                    />
                                </label>
                            </div>

                            <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                                <p className="text-sm font-bold text-amber-300">
                                    🔐 Creación segura
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    El usuario se crea en Supabase Auth usando una ruta segura del servidor. Luego se registra en la tabla usuarios, se vincula a la empresa y se valida el límite del plan.
                                </p>
                            </div>

                            {guardandoCrearUsuario && (
                                <div className="mt-4 rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4 text-center text-sm font-bold text-purple-300">
                                    Creando usuario...
                                </div>
                            )}

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setMostrarModalCrearUsuario(false)}
                                    disabled={guardandoCrearUsuario}
                                    className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    onClick={crearUsuarioNuevoDueno}
                                    disabled={guardandoCrearUsuario}
                                    className="rounded-2xl border border-purple-500/30 bg-purple-500/20 px-5 py-3 text-sm font-black text-purple-300 transition-all hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {guardandoCrearUsuario ? 'Creando usuario...' : 'Crear usuario'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {mostrarModalVincularUsuario && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/30 p-6 shadow-2xl shadow-emerald-500/10">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold text-emerald-300">
                                        👥 Añadir usuario
                                    </p>

                                    <h3 className="mt-1 text-2xl font-black text-white">
                                        Vincular usuario a empresa
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Busca un usuario existente, selecciona empresa y asigna rol.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setMostrarModalVincularUsuario(false)}
                                    className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                                >
                                    Cerrar
                                </button>
                            </div>

                            <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-5">
                                <h4 className="text-lg font-black text-white">
                                    🔎 Buscar usuario existente
                                </h4>

                                <p className="mt-1 text-xs text-slate-500">
                                    Puedes buscar por username, apellido, usuario_id o auth_id.
                                </p>

                                <div className="mt-4 flex flex-col gap-3 md:flex-row">
                                    <input
                                        type="text"
                                        defaultValue={busquedaUsuarioVincularRef.current}
                                        onChange={(e) => {
                                            busquedaUsuarioVincularRef.current = e.target.value;
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                buscarUsuariosParaVincular();
                                            }
                                        }}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-emerald-500"
                                        placeholder="Ej: myke, avalos, uuid..."
                                    />

                                    <button
                                        type="button"
                                        onClick={buscarUsuariosParaVincular}
                                        disabled={buscandoUsuariosVincular}
                                        className="rounded-2xl border border-emerald-500/30 bg-emerald-500/20 px-5 py-3 text-sm font-black text-emerald-300 transition-all hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {buscandoUsuariosVincular ? 'Buscando...' : 'Buscar'}
                                    </button>
                                </div>

                                <div className="mt-4 max-h-64 overflow-y-auto rounded-2xl border border-slate-800 bg-black/20">
                                    {usuariosParaVincular.length === 0 ? (
                                        <div className="p-5 text-center text-sm text-slate-500">
                                            Busca un usuario para mostrar resultados.
                                        </div>
                                    ) : (
                                        usuariosParaVincular.map((usuario) => {
                                            const seleccionado =
                                                usuarioSeleccionadoParaVincular?.usuario_id === usuario.usuario_id;

                                            return (
                                                <button
                                                    key={usuario.usuario_id}
                                                    type="button"
                                                    onClick={() => setUsuarioSeleccionadoParaVincular(usuario)}
                                                    className={`w-full border-b border-slate-800 p-4 text-left transition-all last:border-b-0 ${seleccionado
                                                        ? 'bg-emerald-500/20 text-emerald-200'
                                                        : 'text-slate-300 hover:bg-white/[0.03]'
                                                        }`}
                                                >
                                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                        <div>
                                                            <p className="font-black text-white">
                                                                {usuario.username || 'Usuario sin username'}
                                                            </p>

                                                            <p className="text-xs text-slate-500">
                                                                {usuario.apellido || 'Sin apellido'} · Rol texto: {usuario.usuario_rol_texto || 'Sin rol'}
                                                            </p>

                                                            <p className="mt-1 text-[10px] text-slate-600">
                                                                ID: {usuario.usuario_id}
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className={`rounded-full px-2 py-1 text-[10px] font-black ${usuario.usuario_activo
                                                                ? 'bg-emerald-500/20 text-emerald-300'
                                                                : 'bg-red-500/20 text-red-300'
                                                                }`}>
                                                                {usuario.usuario_activo ? 'Activo' : 'Inactivo'}
                                                            </span>

                                                            <span className="rounded-full bg-cyan-500/20 px-2 py-1 text-[10px] font-black text-cyan-300">
                                                                {usuario.total_empresas} empresa(s)
                                                            </span>

                                                            {seleccionado && (
                                                                <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[10px] font-black text-emerald-300">
                                                                    Seleccionado
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-300">
                                        Empresa destino
                                    </label>

                                    <select
                                        value={empresaSeleccionadaParaVincular}
                                        onChange={(e) => setEmpresaSeleccionadaParaVincular(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition-colors focus:border-emerald-500"
                                    >
                                        <option value="">Seleccionar empresa</option>

                                        {empresasDueno.map((empresa) => (
                                            <option key={empresa.empresa_id} value={empresa.empresa_id}>
                                                {empresa.empresa} · {empresa.plan_codigo || 'sin plan'}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-300">
                                        Rol en la empresa
                                    </label>

                                    <select
                                        value={rolSeleccionadoParaVincular}
                                        onChange={(e) => setRolSeleccionadoParaVincular(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition-colors focus:border-emerald-500"
                                    >
                                        <option value="">Seleccionar rol</option>

                                        {rolesEmpresaDueno
                                            .filter((rol) =>
                                                ['administrador', 'soporte', 'tecnico'].includes(rol.rol_codigo)
                                            )
                                            .map((rol) => (
                                                <option key={rol.rol_id} value={rol.rol_id}>
                                                    {rol.rol_nombre}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                                <p className="text-sm font-bold text-amber-300">
                                    📌 Validación automática
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Al vincular, Supabase validará si el plan permite ese rol. Si el plan está en Gratis, solo permitirá 1 administrador y bloqueará soporte/técnico.
                                </p>
                            </div>

                            {guardandoVincularUsuario && (
                                <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center text-sm font-bold text-emerald-300">
                                    Vinculando usuario...
                                </div>
                            )}

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setMostrarModalVincularUsuario(false)}
                                    disabled={guardandoVincularUsuario}
                                    className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    onClick={vincularUsuarioEmpresaDueno}
                                    disabled={guardandoVincularUsuario}
                                    className="rounded-2xl border border-emerald-500/30 bg-emerald-500/20 px-5 py-3 text-sm font-black text-emerald-300 transition-all hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {guardandoVincularUsuario ? 'Vinculando usuario...' : 'Vincular usuario'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Gestión Usuario */}
                {usuarioGestionSeleccionado && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/30 p-6 shadow-2xl shadow-emerald-500/10">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold text-emerald-300">
                                        👥 Gestión de usuario
                                    </p>

                                    <h3 className="mt-1 text-2xl font-black text-white">
                                        {usuarioGestionSeleccionado.username || 'Usuario sin username'}
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {usuarioGestionSeleccionado.apellido || 'Sin apellido'} · {usuarioGestionSeleccionado.empresa}
                                    </p>

                                    <p className="mt-1 text-[10px] text-slate-600">
                                        Usuario empresa ID: {usuarioGestionSeleccionado.usuario_empresa_id}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!usuarioGestionSeleccionado) return;

                                            usernameEditarUsuarioRef.current = usuarioGestionSeleccionado.username || '';
                                            apellidoEditarUsuarioRef.current = usuarioGestionSeleccionado.apellido || '';
                                            emailEditarUsuarioRef.current = '';

                                            setFormEditarUsuario({
                                                usuario_id: usuarioGestionSeleccionado.usuario_id || '',
                                                auth_id: usuarioGestionSeleccionado.auth_id || '',
                                                username: usuarioGestionSeleccionado.username || '',
                                                apellido: usuarioGestionSeleccionado.apellido || '',
                                                email: '',
                                                activo: usuarioGestionSeleccionado.usuario_activo ?? true,
                                            });

                                            setModalEditarUsuarioAbierto(true);
                                        }}
                                        className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-black text-cyan-300 transition-all hover:border-cyan-400/60 hover:bg-cyan-500/20 hover:text-cyan-200"
                                    >
                                        ✏️ Editar usuario
                                    </button>
                                    <button
                                        type="button"
                                        onClick={abrirModalBorrarUsuario}
                                        disabled={borrandoUsuario}
                                        className="mt-4 w-full rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-black text-red-300 transition-all hover:border-red-400/60 hover:bg-red-500/20 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {borrandoUsuario ? 'Revisando usuario...' : '🗑️ Borrar usuario inteligente'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setUsuarioGestionSeleccionado(null)}
                                        className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                                    <p className="text-xs text-slate-400">Empresa</p>

                                    <p className="mt-1 text-xl font-black text-emerald-300">
                                        {usuarioGestionSeleccionado.empresa}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                                    <p className="text-xs text-slate-400">Plan empresa</p>

                                    <p className="mt-1 text-xl font-black text-cyan-300">
                                        {usuarioGestionSeleccionado.plan_codigo || 'Sin plan'}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
                                    <p className="text-xs text-slate-400">Rol actual</p>

                                    <p className="mt-1 text-xl font-black text-purple-300">
                                        {usuarioGestionSeleccionado.rol_nombre || 'Sin rol'}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <h4 className="text-lg font-black text-white">
                                            🏢 Cambiar empresa del usuario
                                        </h4>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Mueve este usuario a otra empresa y asigna el rol que tendrá en esa empresa.
                                        </p>
                                    </div>

                                    <span className="rounded-full border border-cyan-500/30 bg-slate-950/60 px-3 py-1 text-xs font-black text-cyan-300">
                                        Actual: {usuarioGestionSeleccionado.empresa}
                                    </span>
                                </div>

                                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-xs font-bold text-slate-400">
                                            Empresa destino
                                        </label>

                                        <select
                                            value={empresaDestinoUsuario || usuarioGestionSeleccionado.empresa_id || ''}
                                            onChange={(e) => setEmpresaDestinoUsuario(e.target.value)}
                                            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold text-white outline-none transition-all focus:border-cyan-500"
                                        >
                                            <option value="">Selecciona empresa</option>

                                            {empresasDueno
                                                .filter((empresa) => empresa.empresa_activa)
                                                .map((empresa) => (
                                                    <option key={empresa.empresa_id} value={empresa.empresa_id}>
                                                        {empresa.empresa}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-xs font-bold text-slate-400">
                                            Rol en la empresa destino
                                        </label>

                                        <select
                                            value={rolDestinoUsuario}
                                            onChange={(e) => setRolDestinoUsuario(e.target.value)}
                                            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold text-white outline-none transition-all focus:border-cyan-500"
                                        >
                                            <option value="Administrador">Administrador</option>
                                            <option value="Soporte">Soporte</option>
                                            <option value="Tecnico">Técnico</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs text-slate-500">
                                        Esto moverá el vínculo del usuario en usuarios_empresas y guardará el rol en la columna nombre.
                                    </p>

                                    <button
                                        type="button"
                                        disabled={guardandoCambioEmpresaUsuario}
                                        onClick={() => setModalConfirmarCambioEmpresaUsuario(true)}
                                        className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-black text-cyan-300 transition-all hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {guardandoCambioEmpresaUsuario ? 'Guardando cambio...' : 'Guardar cambio de empresa'}
                                    </button>
                                </div>
                            </div>
                            <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/60 p-5">
                                <h4 className="text-lg font-black text-white">
                                    🔐 Cambiar rol de empresa
                                </h4>

                                <p className="mt-1 text-xs text-slate-500">
                                    El sistema respetará automáticamente los límites del plan actual.
                                </p>

                                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                                    {rolesEmpresaDueno
                                        .filter((rol) =>
                                            ['administrador', 'soporte', 'tecnico'].includes(rol.rol_codigo)
                                        )
                                        .map((rol) => {
                                            const estadoRol = obtenerEstadoVisualRol(
                                                usuarioGestionSeleccionado,
                                                rol
                                            );

                                            const esRolActual = usuarioGestionSeleccionado.rol_id === rol.rol_id;
                                            const bloqueado = estadoRol.bloqueado;

                                            return (
                                                <button
                                                    key={rol.rol_id}
                                                    type="button"
                                                    disabled={guardandoGestionUsuario || bloqueado || esRolActual}
                                                    onClick={() => {
                                                        if (bloqueado) {
                                                            mostrarModalSistema(
                                                                'advertencia',
                                                                'Rol bloqueado por el plan',
                                                                estadoRol.detalle,
                                                                'Puedes cambiar el plan de la empresa desde el módulo Empresas para habilitar más roles.'
                                                            );
                                                            return;
                                                        }

                                                        if (
                                                            confirm(
                                                                `¿Cambiar a ${usuarioGestionSeleccionado.username || 'este usuario'} al rol ${rol.rol_nombre}?`
                                                            )
                                                        ) {
                                                            cambiarRolUsuarioDueno(
                                                                usuarioGestionSeleccionado.usuario_empresa_id,
                                                                rol.rol_id
                                                            );
                                                        }
                                                    }}
                                                    className={`relative overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all ${esRolActual
                                                        ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-200 shadow-lg shadow-emerald-500/10'
                                                        : bloqueado
                                                            ? 'cursor-not-allowed border-red-500/20 bg-red-500/10 text-red-300 opacity-80'
                                                            : 'border-slate-700 bg-slate-950/60 text-slate-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300'
                                                        } disabled:cursor-not-allowed disabled:opacity-70`}
                                                >
                                                    {bloqueado && (
                                                        <div className="absolute right-3 top-3 rounded-full bg-red-500/20 px-2 py-1 text-[10px] font-black text-red-300">
                                                            🔒 Bloqueado
                                                        </div>
                                                    )}

                                                    {esRolActual && (
                                                        <div className="absolute right-3 top-3 rounded-full bg-emerald-500/20 px-2 py-1 text-[10px] font-black text-emerald-300">
                                                            ✅ Actual
                                                        </div>
                                                    )}

                                                    <div className="text-xl">
                                                        {rol.rol_codigo === 'administrador'
                                                            ? '👑'
                                                            : rol.rol_codigo === 'soporte'
                                                                ? '🧩'
                                                                : '🔧'}
                                                    </div>

                                                    <div className="mt-2 text-sm font-black">
                                                        {rol.rol_nombre}
                                                    </div>

                                                    <div className="mt-1 text-xs opacity-70">
                                                        {rol.rol_descripcion || 'Sin descripción'}
                                                    </div>

                                                    <div
                                                        className={`mt-4 rounded-xl border px-3 py-2 text-xs ${bloqueado
                                                            ? 'border-red-500/20 bg-red-500/10 text-red-300'
                                                            : esRolActual
                                                                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                                                                : 'border-white/10 bg-white/[0.03] text-slate-400'
                                                            }`}
                                                    >
                                                        <p className="font-bold">
                                                            {estadoRol.texto}
                                                        </p>

                                                        <p className="mt-1 opacity-80">
                                                            {estadoRol.detalle}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                </div>
                            </div>

                            <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-amber-300">
                                            📌 Límites del plan
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Plan actual de la empresa:
                                            <span className="ml-1 font-black uppercase text-amber-200">
                                                {usuarioGestionSeleccionado.plan_codigo || 'gratis'}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-200">
                                        Control automático activo
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                                    {['administrador', 'soporte', 'tecnico'].map((rolCodigo) => {
                                        const limite = obtenerLimiteRolPorPlan(
                                            usuarioGestionSeleccionado.plan_codigo,
                                            rolCodigo
                                        );

                                        const usados = contarUsuariosConRolEnEmpresaTotal(
                                            usuarioGestionSeleccionado.empresa_id,
                                            rolCodigo
                                        );

                                        const nombreRol =
                                            rolCodigo === 'administrador'
                                                ? 'Administrador'
                                                : rolCodigo === 'soporte'
                                                    ? 'Soporte'
                                                    : 'Técnico';

                                        const iconoRol =
                                            rolCodigo === 'administrador'
                                                ? '👑'
                                                : rolCodigo === 'soporte'
                                                    ? '🧩'
                                                    : '🔧';

                                        return (
                                            <div
                                                key={rolCodigo}
                                                className={`rounded-2xl border p-3 ${limite === 0
                                                    ? 'border-red-500/20 bg-red-500/10'
                                                    : limite === null
                                                        ? 'border-emerald-500/20 bg-emerald-500/10'
                                                        : 'border-amber-500/20 bg-slate-950/40'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-black text-white">
                                                        {iconoRol} {nombreRol}
                                                    </p>

                                                    {limite === 0 ? (
                                                        <span className="rounded-full bg-red-500/20 px-2 py-1 text-[10px] font-black text-red-300">
                                                            Bloqueado
                                                        </span>
                                                    ) : limite === null ? (
                                                        <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[10px] font-black text-emerald-300">
                                                            Ilimitado
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-amber-500/20 px-2 py-1 text-[10px] font-black text-amber-300">
                                                            {usados}/{limite}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="mt-2 text-xs text-slate-400">
                                                    {limite === 0
                                                        ? `El plan no permite usuarios con rol ${nombreRol}.`
                                                        : limite === null
                                                            ? `El plan Empresa no tiene límite para ${nombreRol}.`
                                                            : `El plan permite máximo ${limite} usuario(s) con rol ${nombreRol}.`}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {guardandoGestionUsuario && (
                                <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center text-sm font-bold text-emerald-300">
                                    Guardando cambio de rol...
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* Modal Editar Usuario */}
                {/* Modal Editar Plan SaaS */}
                {modalEditarPlanAbierto && planEditando && (
                    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
                        <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/20 p-6 shadow-2xl shadow-amber-500/10">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-black text-amber-300">
                                        💳 Editar plan SaaS
                                    </p>

                                    <h3 className="mt-1 text-2xl font-black text-white">
                                        Plan {planEditando.nombre}
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Modifica información comercial, límites por rol y estado del plan.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setModalEditarPlanAbierto(false);
                                        setPlanEditando(null);
                                    }}
                                    className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                                >
                                    Cerrar
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                        Nombre del plan *
                                    </label>

                                    <input
                                        type="text"
                                        defaultValue={planEditando.nombre}
                                        onChange={(e) => {
                                            nombrePlanSaasRef.current = e.target.value;
                                        }}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
                                        placeholder="Ej: Pro"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                        Subtítulo
                                    </label>

                                    <input
                                        type="text"
                                        defaultValue={planEditando.subtitulo || ''}
                                        onChange={(e) => {
                                            subtituloPlanSaasRef.current = e.target.value;
                                        }}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
                                        placeholder="Ej: Gestión avanzada"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                        Precio
                                    </label>

                                    <input
                                        type="text"
                                        defaultValue={planEditando.precio || ''}
                                        onChange={(e) => {
                                            precioPlanSaasRef.current = e.target.value;
                                        }}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
                                        placeholder="Ej: $29.990 / mes"
                                    />
                                </div>

                                <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3">
                                    <button
                                        type="button"
                                        onClick={() => setPlanDestacadoEditando(!planDestacadoEditando)}
                                        className={`flex-1 rounded-xl border px-4 py-3 text-sm font-black transition-all ${planDestacadoEditando
                                            ? 'border-purple-500/30 bg-purple-500/20 text-purple-200'
                                            : 'border-slate-700 bg-slate-900 text-slate-400'
                                            }`}
                                    >
                                        {planDestacadoEditando ? '⭐ Destacado' : 'Sin destacado'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPlanActivoEditando(!planActivoEditando)}
                                        className={`flex-1 rounded-xl border px-4 py-3 text-sm font-black transition-all ${planActivoEditando
                                            ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-200'
                                            : 'border-red-500/30 bg-red-500/20 text-red-200'
                                            }`}
                                    >
                                        {planActivoEditando ? 'Activo' : 'Inactivo'}
                                    </button>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                        Descripción
                                    </label>

                                    <textarea
                                        defaultValue={planEditando.descripcion || ''}
                                        onChange={(e) => {
                                            descripcionPlanSaasRef.current = e.target.value;
                                        }}
                                        rows={3}
                                        className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
                                        placeholder="Describe para quién está pensado este plan..."
                                    />
                                </div>
                            </div>

                            <div className="mt-6 rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5">
                                <div className="mb-4">
                                    <p className="text-sm font-black text-amber-300">
                                        🔐 Límites por rol
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Usa números para límites exactos o marca “Ilimitado” para planes empresariales.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                                        <p className="mb-3 text-sm font-black text-white">
                                            👑 Administrador
                                        </p>

                                        <input
                                            type="number"
                                            min={0}
                                            disabled={limiteAdminIlimitado}
                                            defaultValue={
                                                planEditando.limite_administrador === null
                                                    ? ''
                                                    : planEditando.limite_administrador
                                            }
                                            onChange={(e) => {
                                                limiteAdminPlanSaasRef.current = e.target.value;
                                            }}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none disabled:opacity-40"
                                            placeholder="0"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLimiteAdminIlimitado(!limiteAdminIlimitado);

                                                if (!limiteAdminIlimitado) {
                                                    limiteAdminPlanSaasRef.current = '';
                                                }
                                            }}
                                            className={`mt-3 w-full rounded-xl border px-3 py-2 text-xs font-black transition-all ${limiteAdminIlimitado
                                                ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-300'
                                                : 'border-slate-700 bg-slate-900 text-slate-400'
                                                }`}
                                        >
                                            {limiteAdminIlimitado ? 'Ilimitado activo' : 'Marcar ilimitado'}
                                        </button>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                                        <p className="mb-3 text-sm font-black text-white">
                                            🧩 Soporte
                                        </p>

                                        <input
                                            type="number"
                                            min={0}
                                            disabled={limiteSoporteIlimitado}
                                            defaultValue={
                                                planEditando.limite_soporte === null
                                                    ? ''
                                                    : planEditando.limite_soporte
                                            }
                                            onChange={(e) => {
                                                limiteSoportePlanSaasRef.current = e.target.value;
                                            }}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none disabled:opacity-40"
                                            placeholder="0"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLimiteSoporteIlimitado(!limiteSoporteIlimitado);

                                                if (!limiteSoporteIlimitado) {
                                                    limiteSoportePlanSaasRef.current = '';
                                                }
                                            }}
                                            className={`mt-3 w-full rounded-xl border px-3 py-2 text-xs font-black transition-all ${limiteSoporteIlimitado
                                                ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-300'
                                                : 'border-slate-700 bg-slate-900 text-slate-400'
                                                }`}
                                        >
                                            {limiteSoporteIlimitado ? 'Ilimitado activo' : 'Marcar ilimitado'}
                                        </button>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                                        <p className="mb-3 text-sm font-black text-white">
                                            🔧 Técnico
                                        </p>

                                        <input
                                            type="number"
                                            min={0}
                                            disabled={limiteTecnicoIlimitado}
                                            defaultValue={
                                                planEditando.limite_tecnico === null
                                                    ? ''
                                                    : planEditando.limite_tecnico
                                            }
                                            onChange={(e) => {
                                                limiteTecnicoPlanSaasRef.current = e.target.value;
                                            }}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none disabled:opacity-40"
                                            placeholder="0"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLimiteTecnicoIlimitado(!limiteTecnicoIlimitado);

                                                if (!limiteTecnicoIlimitado) {
                                                    limiteTecnicoPlanSaasRef.current = '';
                                                }
                                            }}
                                            className={`mt-3 w-full rounded-xl border px-3 py-2 text-xs font-black transition-all ${limiteTecnicoIlimitado
                                                ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-300'
                                                : 'border-slate-700 bg-slate-900 text-slate-400'
                                                }`}
                                        >
                                            {limiteTecnicoIlimitado ? 'Ilimitado activo' : 'Marcar ilimitado'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                                <p className="text-sm font-black text-cyan-300">
                                    ℹ️ Importante
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Estos cambios se guardan en Supabase. Después conectaremos crear, vincular y cambiar rol para que respeten estos límites editables.
                                </p>
                            </div>

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setModalEditarPlanAbierto(false);
                                        setPlanEditando(null);
                                    }}
                                    className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-400 transition-all hover:border-slate-500 hover:bg-slate-800 hover:text-white"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    onClick={guardarPlanSaas}
                                    disabled={guardandoPlanSaas}
                                    className="rounded-2xl border border-amber-500/40 bg-amber-500/20 px-5 py-3 text-sm font-black text-amber-200 transition-all hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {guardandoPlanSaas ? 'Guardando...' : 'Guardar plan'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Modal Borrar Usuario Inteligente */}
                {modalBorrarUsuarioAbierto && usuarioGestionSeleccionado && (
                    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-2xl rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-950/40 via-slate-950 to-slate-900 p-6 shadow-2xl shadow-red-500/10">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-black text-red-300">
                                        🛡️ Eliminación segura
                                    </p>

                                    <h3 className="mt-1 text-2xl font-black text-white">
                                        Borrar usuario inteligente
                                    </h3>

                                    <p className="mt-2 text-sm text-slate-400">
                                        FleetVision revisará vínculos e historial antes de permitir una eliminación definitiva.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setModalBorrarUsuarioAbierto(false);
                                        setModoConfirmacionDefinitiva(false);
                                        setErrorModalBorrarUsuario('');
                                    }}
                                    className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                                >
                                    Cerrar
                                </button>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                                    Usuario seleccionado
                                </p>

                                <h4 className="mt-2 text-xl font-black text-white">
                                    {usuarioGestionSeleccionado.username || 'Sin nombre'}
                                </h4>

                                <p className="mt-1 text-sm text-slate-400">
                                    {usuarioGestionSeleccionado.apellido || 'Sin apellido'} · {usuarioGestionSeleccionado.empresa}
                                </p>

                                <p className="mt-1 text-xs text-slate-600">
                                    Auth ID: {usuarioGestionSeleccionado.auth_id}
                                </p>
                            </div>

                            {!modoConfirmacionDefinitiva && (
                                <>
                                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                                        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                                            <p className="text-sm font-black text-amber-300">
                                                1. Revisión
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                Se revisará si tiene historial asociado.
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                                            <p className="text-sm font-black text-cyan-300">
                                                2. Vínculos
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                Si tiene más empresas, solo se desvincula.
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                                            <p className="text-sm font-black text-emerald-300">
                                                3. Trazabilidad
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                Si hay historial, no se borra; se desactiva.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                                        <p className="text-sm font-black text-red-300">
                                            ⚠️ Acción delicada
                                        </p>

                                        <p className="mt-1 text-sm text-slate-300">
                                            Este proceso está protegido para evitar pérdida de trazabilidad. FleetVision no eliminará información si detecta historial o si no puede verificarlo con seguridad.
                                        </p>
                                    </div>

                                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setModalBorrarUsuarioAbierto(false);
                                                setModoConfirmacionDefinitiva(false);
                                                setErrorModalBorrarUsuario('');
                                            }}
                                            className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-400 transition-all hover:border-slate-500 hover:bg-slate-800 hover:text-white"
                                        >
                                            Cancelar
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => ejecutarBorradoUsuarioSeguro()}
                                            disabled={borrandoUsuario}
                                            className="rounded-2xl border border-red-500/40 bg-red-500/20 px-5 py-3 text-sm font-black text-red-200 transition-all hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {borrandoUsuario ? 'Revisando trazabilidad...' : 'Revisar eliminación segura'}
                                        </button>
                                    </div>
                                </>
                            )}

                            {modoConfirmacionDefinitiva && (
                                <>
                                    <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                                        <p className="text-sm font-black text-emerald-300">
                                            ✅ Sin historial detectado
                                        </p>

                                        <p className="mt-1 text-sm text-slate-300">
                                            FleetVision no encontró historial asociado para este usuario. Aun así, para proteger el sistema, debes confirmar manualmente la eliminación definitiva.
                                        </p>
                                    </div>

                                    <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-red-300">
                                            Confirmación requerida
                                        </label>

                                        <p className="mb-3 text-sm text-slate-300">
                                            Escribe exactamente:
                                            <span className="mx-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 font-black text-red-200">
                                                BORRAR DEFINITIVO
                                            </span>
                                        </p>

                                        <input
                                            type="text"
                                            defaultValue=""
                                            onChange={(e) => {
                                                confirmacionBorrarUsuarioRef.current = e.target.value;
                                                setErrorModalBorrarUsuario('');
                                            }}
                                            className="w-full rounded-2xl border border-red-500/30 bg-slate-950 px-4 py-3 text-sm font-bold text-white outline-none transition-all placeholder:text-slate-600 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                                            placeholder="Escribe BORRAR DEFINITIVO"
                                        />

                                        {errorModalBorrarUsuario && (
                                            <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-300">
                                                {errorModalBorrarUsuario}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setModalBorrarUsuarioAbierto(false);
                                                setModoConfirmacionDefinitiva(false);
                                                setErrorModalBorrarUsuario('');
                                            }}
                                            className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-400 transition-all hover:border-slate-500 hover:bg-slate-800 hover:text-white"
                                        >
                                            Cancelar
                                        </button>

                                        <button
                                            type="button"
                                            onClick={confirmarBorradoDefinitivo}
                                            disabled={borrandoUsuario}
                                            className="rounded-2xl border border-red-500/40 bg-red-500 px-5 py-3 text-sm font-black text-white transition-all hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {borrandoUsuario ? 'Eliminando...' : 'Confirmar borrado definitivo'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
                {modalEditarUsuarioAbierto && (
                    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-2xl rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/30 p-6 shadow-2xl shadow-cyan-500/10">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold text-cyan-300">
                                        ✏️ Editar usuario
                                    </p>

                                    <h3 className="mt-1 text-2xl font-black text-white">
                                        Modificar datos básicos
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Puedes corregir nombre, apellido, correo o estado del usuario.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setModalEditarUsuarioAbierto(false)}
                                    className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                                >
                                    Cerrar
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                        Nombre de usuario *
                                    </label>

                                    <input
                                        type="text"
                                        defaultValue={formEditarUsuario.username}
                                        onChange={(e) => {
                                            usernameEditarUsuarioRef.current = e.target.value;
                                        }}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                                        placeholder="Ej: tecnico1"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                        Apellido / nombre completo
                                    </label>

                                    <input
                                        type="text"
                                        defaultValue={formEditarUsuario.apellido}
                                        onChange={(e) => {
                                            apellidoEditarUsuarioRef.current = e.target.value;
                                        }}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                                        placeholder="Ej: Juan Pérez"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                        Nuevo correo
                                    </label>

                                    <input
                                        type="email"
                                        defaultValue=""
                                        onChange={(e) => {
                                            emailEditarUsuarioRef.current = e.target.value;
                                        }}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                                        placeholder="Déjalo vacío si no quieres cambiar el correo"
                                    />

                                    <p className="mt-2 text-xs text-slate-500">
                                        El correo se cambia en Supabase Auth. Tu tabla usuarios no guarda email.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormEditarUsuario((prev) => ({
                                            ...prev,
                                            activo: !prev.activo,
                                        }))
                                    }
                                    className={`md:col-span-2 rounded-2xl border p-4 text-left transition-all ${formEditarUsuario.activo
                                        ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20'
                                        : 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20'
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="font-black text-white">
                                                {formEditarUsuario.activo
                                                    ? 'Usuario activo'
                                                    : 'Usuario inactivo'}
                                            </p>

                                            <p className="mt-1 text-sm text-slate-400">
                                                {formEditarUsuario.activo
                                                    ? 'El usuario puede usar FleetVision normalmente.'
                                                    : 'El usuario queda bloqueado lógicamente en el sistema.'}
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-black ${formEditarUsuario.activo
                                                ? 'bg-emerald-500/20 text-emerald-300'
                                                : 'bg-red-500/20 text-red-300'
                                                }`}
                                        >
                                            {formEditarUsuario.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </button>
                            </div>

                            <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                                <p className="text-sm font-black text-amber-300">
                                    ⚠️ Edición controlada
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Esta opción solo corrige datos básicos. No cambia empresa, no elimina vínculos y no borra usuarios.
                                </p>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setModalEditarUsuarioAbierto(false)}
                                    className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-400 transition-all hover:border-slate-500 hover:bg-slate-800 hover:text-white"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    onClick={guardarEditarUsuario}
                                    disabled={guardandoEditarUsuario}
                                    className="rounded-2xl border border-cyan-500/30 bg-cyan-500/20 px-5 py-3 text-sm font-black text-cyan-300 transition-all hover:bg-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {guardandoEditarUsuario ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Modal Confirmar Suscripción */}
                {modalConfirmarSuscripcion?.abierto && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-xl rounded-3xl border border-purple-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950/30 p-6 shadow-2xl shadow-purple-500/10">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-black text-purple-300">
                                        📌 Confirmar cambio
                                    </p>

                                    <h3 className="mt-1 text-2xl font-black text-white">
                                        Cambiar suscripción
                                    </h3>

                                    <p className="mt-2 text-sm text-slate-400">
                                        Revisa bien antes de modificar el estado de suscripción de esta empresa.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={cerrarModalConfirmarSuscripcion}
                                    className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                                >
                                    Cerrar
                                </button>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                                    Empresa
                                </p>

                                <h4 className="mt-2 text-2xl font-black text-white">
                                    {modalConfirmarSuscripcion.empresaNombre}
                                </h4>

                                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Acción
                                        </p>
                                        <p className="mt-1 text-sm font-black text-slate-200">
                                            Cambiar estado de suscripción
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4">
                                        <p className="text-xs font-bold uppercase tracking-wide text-purple-300">
                                            Nuevo estado
                                        </p>
                                        <p className="mt-1 text-lg font-black uppercase text-purple-200">
                                            {modalConfirmarSuscripcion.estado}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                                <p className="text-sm font-black text-amber-300">
                                    ⚠️ Cambio administrativo
                                </p>

                                <p className="mt-1 text-sm text-slate-300">
                                    Esta acción modifica el estado comercial de la empresa. FleetVision registrará el cambio para trazabilidad del Panel Dueño.
                                </p>
                            </div>

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={cerrarModalConfirmarSuscripcion}
                                    className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-400 transition-all hover:border-slate-500 hover:bg-slate-800 hover:text-white"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    onClick={confirmarCambioSuscripcion}
                                    disabled={guardandoGestionEmpresa}
                                    className="rounded-2xl border border-purple-500/40 bg-purple-500/20 px-5 py-3 text-sm font-black text-purple-200 transition-all hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {guardandoGestionEmpresa
                                        ? 'Guardando...'
                                        : `Confirmar cambio a ${modalConfirmarSuscripcion.estado}`}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Modal Confirmar Cambio Empresa Usuario */}
                {modalConfirmarCambioEmpresaUsuario && usuarioGestionSeleccionado && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-xl rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-2xl shadow-cyan-500/10">
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-2xl">
                                    🏢
                                </div>

                                <div className="flex-1">
                                    <p className="text-sm font-black text-cyan-300">
                                        Confirmar cambio de empresa
                                    </p>

                                    <h3 className="mt-1 text-2xl font-black text-white">
                                        ¿Mover este usuario?
                                    </h3>

                                    <p className="mt-2 text-sm text-slate-400">
                                        Estás a punto de cambiar la empresa y el rol de este usuario dentro de FleetVision.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Usuario
                                        </p>

                                        <p className="mt-1 text-lg font-black text-white">
                                            {usuarioGestionSeleccionado.username || 'Sin nombre'}
                                            {usuarioGestionSeleccionado.apellido
                                                ? ` ${usuarioGestionSeleccionado.apellido}`
                                                : ''}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Rol destino
                                        </p>

                                        <p className="mt-1 text-lg font-black text-purple-300">
                                            {rolDestinoUsuario || usuarioGestionSeleccionado.rol_nombre || 'Sin rol'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Empresa actual
                                        </p>

                                        <p className="mt-1 text-lg font-black text-slate-300">
                                            {usuarioGestionSeleccionado.empresa}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Empresa destino
                                        </p>

                                        <p className="mt-1 text-lg font-black text-cyan-300">
                                            {empresasDueno.find(
                                                (empresa) =>
                                                    empresa.empresa_id ===
                                                    (empresaDestinoUsuario || usuarioGestionSeleccionado.empresa_id)
                                            )?.empresa || 'Empresa seleccionada'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                                <p className="text-xs font-bold text-amber-300">
                                    ⚠️ Esta acción no borra al usuario.
                                </p>

                                <p className="mt-1 text-xs text-amber-100/70">
                                    Solo actualizará su empresa y rol en usuarios_empresas. El sistema respetará los límites configurados en el plan.
                                </p>
                            </div>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setModalConfirmarCambioEmpresaUsuario(false)}
                                    className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-black text-slate-300 transition-all hover:border-slate-500 hover:bg-slate-800"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    disabled={guardandoCambioEmpresaUsuario}
                                    onClick={async () => {
                                        setModalConfirmarCambioEmpresaUsuario(false);
                                        await cambiarEmpresaUsuarioDueno();
                                    }}
                                    className="rounded-2xl border border-cyan-500/30 bg-cyan-500/20 px-5 py-3 text-sm font-black text-cyan-300 transition-all hover:bg-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {guardandoCambioEmpresaUsuario ? 'Guardando...' : 'Sí, mover usuario'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Sistema Bonito */}
                {modalSistema && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                        <div
                            className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl ${modalSistema.tipo === 'error'
                                ? 'border-red-500/30 bg-gradient-to-br from-red-950/80 via-slate-950 to-slate-900 shadow-red-500/10'
                                : modalSistema.tipo === 'advertencia'
                                    ? 'border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-900 shadow-amber-500/10'
                                    : modalSistema.tipo === 'exito'
                                        ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-950/50 via-slate-950 to-slate-900 shadow-emerald-500/10'
                                        : 'border-cyan-500/30 bg-gradient-to-br from-cyan-950/50 via-slate-950 to-slate-900 shadow-cyan-500/10'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl ${modalSistema.tipo === 'error'
                                        ? 'bg-red-500/20 text-red-300'
                                        : modalSistema.tipo === 'advertencia'
                                            ? 'bg-amber-500/20 text-amber-300'
                                            : modalSistema.tipo === 'exito'
                                                ? 'bg-emerald-500/20 text-emerald-300'
                                                : 'bg-cyan-500/20 text-cyan-300'
                                        }`}
                                >
                                    {modalSistema.icono}
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-white">
                                        {modalSistema.titulo}
                                    </h3>

                                    <p className="mt-2 text-sm text-slate-300">
                                        {modalSistema.mensaje}
                                    </p>

                                    {modalSistema.detalle && (
                                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                                Detalle
                                            </p>

                                            <p className="mt-1 text-sm text-slate-400">
                                                {modalSistema.detalle}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={cerrarModalSistema}
                                    className={`rounded-2xl px-5 py-3 text-sm font-black text-white transition-all ${modalSistema.tipo === 'error'
                                        ? 'bg-red-500 hover:bg-red-400'
                                        : modalSistema.tipo === 'advertencia'
                                            ? 'bg-amber-500 hover:bg-amber-400'
                                            : modalSistema.tipo === 'exito'
                                                ? 'bg-emerald-500 hover:bg-emerald-400'
                                                : 'bg-cyan-500 hover:bg-cyan-400'
                                        }`}
                                >
                                    Entendido
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        );
    };
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

                            {/* Empresa actual / selector para Dueño global */}
                            {empresaActual && (
                                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />

                                    <div className="text-left">
                                        <p className="text-[10px] text-slate-400">
                                            {esAdminGlobal ? 'Empresa global' : 'Empresa'}
                                        </p>

                                        {esAdminGlobal ? (
                                            <select
                                                value={empresaActual.id}
                                                onChange={(e) => cambiarEmpresaActualDueno(e.target.value)}
                                                className="max-w-[180px] cursor-pointer rounded-lg border border-cyan-500/20 bg-slate-950 px-2 py-1 text-sm font-black text-white outline-none transition-all hover:border-cyan-400/50 focus:border-cyan-400"
                                            >
                                                {empresasDueno.length === 0 && (
                                                    <option value={empresaActual.id}>
                                                        {empresaActual.nombre}
                                                    </option>
                                                )}

                                                {empresasDueno
                                                    .filter((empresa) => empresa.empresa_activa)
                                                    .map((empresa) => (
                                                        <option
                                                            key={empresa.empresa_id}
                                                            value={empresa.empresa_id}
                                                        >
                                                            {empresa.empresa}
                                                        </option>
                                                    ))}
                                            </select>
                                        ) : (
                                            <p className="text-sm font-medium text-white">
                                                {empresaActual.nombre}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Perfil de usuario */}
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className={`text-sm font-black ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
                                        {esAdminGlobal ? 'Dueño FleetVision' : datosUsuario?.nombre || 'Usuario'}
                                    </p>

                                    <p className={`text-xs ${modoOscuro ? 'text-slate-400' : 'text-gray-600'}`}>
                                        {esAdminGlobal
                                            ? `Acceso global${rolGlobal?.nombre ? ` · ${rolGlobal.nombre}` : ''}`
                                            : datosUsuario?.rol || 'Usuario'}
                                    </p>
                                </div>

                                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${esAdminGlobal
                                    ? 'border border-purple-500/40 bg-purple-500/20 text-purple-300'
                                    : modoOscuro
                                        ? 'border border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400'
                                        : 'border border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-500'
                                    }`}>
                                    {esAdminGlobal ? 'D' : datosUsuario?.nombre?.charAt(0) || 'U'}
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
                    {secciónActiva === 'desarrollador' && esAdminGlobal && <PanelDesarrollador />}
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