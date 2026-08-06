import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

type PlanSheet = {
    codigo_plan: string;
    nombre: string;
    categoria: string;
    tipo?: string;
    unidad_principal?: string;
    intervalo_base?: number | string;
    version?: string | number;
    descripcion?: string;
    estandar_fleetvision?: boolean | string;
    activo?: boolean | string;
    notas?: string;
};

type TareaSheet = {
    codigo_tarea: string;
    codigo_plan: string;
    categoria?: string;
    orden: number | string;
    sistema?: string;
    componente?: string;
    actividad: string;
    tipo_actividad?: string;
    intervalo: number | string;
    unidad: string;
    criterio_tiempo?: string;
    aplicabilidad?: string;
    tiempo_estimado_h?: number | string;
    especialidad?: string;
    prioridad?: string;
    detiene_equipo?: boolean | string;
    repuesto_insumo_sugerido?: string;
    observaciones?: string;
};

type PayloadPublicacion = {
    planes: PlanSheet[];
    tareas: TareaSheet[];
};

function texto(valor: unknown) {
    return String(valor ?? '').trim();
}

function numero(valor: unknown): number | null {
    if (valor === '' || valor === null || valor === undefined) {
        return null;
    }

    const convertido = Number(
        String(valor).replace(',', '.')
    );

    return Number.isFinite(convertido)
        ? convertido
        : null;
}

function booleano(valor: unknown): boolean {
    if (typeof valor === 'boolean') {
        return valor;
    }

    const limpio = texto(valor).toLowerCase();

    return [
        'true',
        '1',
        'si',
        'sí',
        'yes',
        'activo'
    ].includes(limpio);
}

function normalizarUnidad(valor: unknown) {
    return texto(valor)
        .toLowerCase()
        .replace(/\./g, '');
}

function obtenerTrigger(unidadOriginal: unknown) {
    const unidad = normalizarUnidad(unidadOriginal);

    if (
        unidad === 'km' ||
        unidad === 'kilometro' ||
        unidad === 'kilometros' ||
        unidad === 'kilómetro' ||
        unidad === 'kilómetros'
    ) {
        return 'KILOMETROS';
    }

    if (
        unidad === 'h' ||
        unidad === 'hora' ||
        unidad === 'horas'
    ) {
        return 'HORAS';
    }

    if (
        unidad === 'dia' ||
        unidad === 'dias' ||
        unidad === 'día' ||
        unidad === 'días' ||
        unidad === 'mes' ||
        unidad === 'meses'
    ) {
        return 'TIEMPO';
    }

    throw new Error(
        `Unidad de mantenimiento no reconocida: "${unidadOriginal}"`
    );
}

function obtenerUnidadTiempo(unidadOriginal: unknown) {
    const unidad = normalizarUnidad(unidadOriginal);

    if (
        unidad === 'dia' ||
        unidad === 'dias' ||
        unidad === 'día' ||
        unidad === 'días'
    ) {
        return 'dias';
    }

    if (
        unidad === 'mes' ||
        unidad === 'meses'
    ) {
        return 'meses';
    }

    return null;
}

function extraerCriterioTiempo(valor: unknown) {
    const criterio = texto(valor);

    if (!criterio) {
        return {
            valor: null,
            unidad: null
        };
    }

    const coincidencia = criterio.match(
        /(\d+)\s*(día|dias|día|días|mes|meses|año|años)/i
    );

    if (!coincidencia) {
        return {
            valor: null,
            unidad: null
        };
    }

    const cantidad = Number(coincidencia[1]);

    let unidad = coincidencia[2].toLowerCase();

    if (
        unidad === 'día' ||
        unidad === 'días' ||
        unidad === 'dia' ||
        unidad === 'dias'
    ) {
        unidad = 'dias';
    }

    if (
        unidad === 'mes' ||
        unidad === 'meses'
    ) {
        unidad = 'meses';
    }

    if (
        unidad === 'año' ||
        unidad === 'años'
    ) {
        unidad = 'años';
    }

    return {
        valor: cantidad,
        unidad
    };
}

export async function POST(request: Request) {

    try {

        // ==========================================
        // VARIABLES PRIVADAS
        // ==========================================

        const supabaseUrl =
            process.env.NEXT_PUBLIC_SUPABASE_URL;

        const serviceRoleKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY;

        const secretoEsperado =
            process.env.FLEETVISION_SHEETS_SECRET;

        const empresaFleetVisionId =
            process.env.FLEETVISION_EMPRESA_ID;

        if (
            !supabaseUrl ||
            !serviceRoleKey ||
            !secretoEsperado ||
            !empresaFleetVisionId
        ) {
            console.error(
                'Faltan variables de entorno para publicar planes.'
            );

            return NextResponse.json(
                {
                    ok: false,
                    error:
                        'Configuración incompleta del servidor.'
                },
                {
                    status: 500
                }
            );
        }


        // ==========================================
        // VALIDAR SECRETO
        // ==========================================

        const secretoRecibido =
            request.headers.get(
                'x-fleetvision-secret'
            );

        if (
            !secretoRecibido ||
            secretoRecibido !== secretoEsperado
        ) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'No autorizado.'
                },
                {
                    status: 401
                }
            );
        }


        // ==========================================
        // LEER JSON
        // ==========================================

        const body =
            await request.json() as PayloadPublicacion;

        const planes =
            Array.isArray(body?.planes)
                ? body.planes
                : [];

        const tareas =
            Array.isArray(body?.tareas)
                ? body.tareas
                : [];

        if (planes.length === 0) {
            return NextResponse.json(
                {
                    ok: false,
                    error:
                        'No se recibieron planes.'
                },
                {
                    status: 400
                }
            );
        }

        if (tareas.length === 0) {
            return NextResponse.json(
                {
                    ok: false,
                    error:
                        'No se recibieron tareas.'
                },
                {
                    status: 400
                }
            );
        }


        // ==========================================
        // CLIENTE SUPABASE ADMIN
        // ==========================================

        const supabaseAdmin = createClient(
            supabaseUrl,
            serviceRoleKey,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false
                }
            }
        );


        // ==========================================
        // VALIDAR EMPRESA FLEETVISION
        // ==========================================

        const {
            data: empresaFleetVision,
            error: errorEmpresa
        } = await supabaseAdmin
            .from('empresas')
            .select('id, nombre, activo')
            .eq('id', empresaFleetVisionId)
            .single();

        if (
            errorEmpresa ||
            !empresaFleetVision
        ) {
            console.error(
                'Empresa FleetVision no encontrada:',
                errorEmpresa
            );

            return NextResponse.json(
                {
                    ok: false,
                    error:
                        'No se encontró la empresa interna FLEETVISION.'
                },
                {
                    status: 500
                }
            );
        }


        // ==========================================
        // PREPARAR PLANES
        // ==========================================

        const planesPreparados =
            planes.map((plan) => {

                const codigoPlan =
                    texto(plan.codigo_plan);

                const nombre =
                    texto(plan.nombre);

                if (!codigoPlan) {
                    throw new Error(
                        'Existe un plan sin codigo_plan.'
                    );
                }

                if (!nombre) {
                    throw new Error(
                        `El plan ${codigoPlan} no tiene nombre.`
                    );
                }

                const intervaloBase =
                    numero(plan.intervalo_base);

                const unidadPrincipal =
                    texto(plan.unidad_principal);

                const versionCodigo =
                    texto(plan.version) || '1.0';

                const versionEntera =
                    Math.max(
                        1,
                        parseInt(
                            versionCodigo.split('.')[0],
                            10
                        ) || 1
                    );

                return {
                    empresa_id:
                        empresaFleetVisionId,

                    codigo_plan:
                        codigoPlan,

                    nombre,

                    descripcion:
                        texto(plan.descripcion) ||
                        texto(plan.notas) ||
                        null,

                    activo:
                        plan.activo === undefined
                            ? true
                            : booleano(plan.activo),

                    version:
                        versionEntera,

                    version_codigo:
                        versionCodigo,

                    tipo:
                        texto(plan.tipo) ||
                        'Preventivo',

                    categoria:
                        texto(plan.categoria) ||
                        null,

                    unidad_principal:
                        unidadPrincipal ||
                        null,

                    intervalo_base:
                        intervaloBase,

                    periodo_km:
                        normalizarUnidad(
                            unidadPrincipal
                        ) === 'km'
                            ? intervaloBase
                            : null,

                    es_estandar:
                        true,

                    publicado:
                        true,

                    updated_at:
                        new Date().toISOString()
                };
            });


        // ==========================================
        // UPSERT PLANES
        // ==========================================

        const {
            data: planesGuardados,
            error: errorPlanes
        } = await supabaseAdmin
            .from('planes_mantenimiento')
            .upsert(
                planesPreparados,
                {
                    onConflict:
                        'empresa_id,codigo_plan'
                }
            )
            .select(
                'id, codigo_plan, nombre'
            );

        if (
            errorPlanes ||
            !planesGuardados
        ) {
            console.error(
                'Error publicando planes:',
                errorPlanes
            );

            return NextResponse.json(
                {
                    ok: false,
                    error:
                        'No se pudieron publicar los planes.',
                    detalle:
                        errorPlanes?.message
                },
                {
                    status: 500
                }
            );
        }


        // ==========================================
        // MAPA codigo_plan -> UUID
        // ==========================================

        const mapaPlanes =
            new Map<string, string>();

        for (
            const plan of planesGuardados
        ) {
            mapaPlanes.set(
                plan.codigo_plan,
                plan.id
            );
        }


        // ==========================================
        // PREPARAR TAREAS
        // ==========================================

        const tareasPreparadas =
            tareas.map((tarea) => {

                const codigoTarea =
                    texto(tarea.codigo_tarea);

                const codigoPlan =
                    texto(tarea.codigo_plan);

                const actividad =
                    texto(tarea.actividad);

                if (!codigoTarea) {
                    throw new Error(
                        'Existe una tarea sin codigo_tarea.'
                    );
                }

                if (!codigoPlan) {
                    throw new Error(
                        `La tarea ${codigoTarea} no tiene codigo_plan.`
                    );
                }

                if (!actividad) {
                    throw new Error(
                        `La tarea ${codigoTarea} no tiene actividad.`
                    );
                }

                const planId =
                    mapaPlanes.get(codigoPlan);

                if (!planId) {
                    throw new Error(
                        `La tarea ${codigoTarea} apunta al plan ${codigoPlan}, pero ese plan no existe.`
                    );
                }

                const intervalo =
                    numero(tarea.intervalo);

                if (
                    intervalo === null ||
                    intervalo <= 0
                ) {
                    throw new Error(
                        `Intervalo inválido en ${codigoTarea}.`
                    );
                }

                const unidad =
                    texto(tarea.unidad);

                const triggerTipo =
                    obtenerTrigger(unidad);

                const criterioTiempo =
                    extraerCriterioTiempo(
                        tarea.criterio_tiempo
                    );

                let cadaKm: number | null =
                    null;

                let cadaHoras: number | null =
                    null;

                let cadaTiempoValor:
                    number | null =
                    criterioTiempo.valor;

                let cadaTiempoUnidad:
                    string | null =
                    criterioTiempo.unidad;


                if (
                    triggerTipo ===
                    'KILOMETROS'
                ) {
                    cadaKm = intervalo;
                }


                if (
                    triggerTipo ===
                    'HORAS'
                ) {
                    cadaHoras = intervalo;
                }


                if (
                    triggerTipo ===
                    'TIEMPO'
                ) {
                    cadaTiempoValor =
                        intervalo;

                    cadaTiempoUnidad =
                        obtenerUnidadTiempo(
                            unidad
                        );
                }


                return {
                    plan_id:
                        planId,

                    codigo_tarea:
                        codigoTarea,

                    nombre:
                        actividad,

                    descripcion:
                        null,

                    orden:
                        numero(tarea.orden) ?? 0,

                    sistema:
                        texto(tarea.sistema) ||
                        null,

                    componente:
                        texto(tarea.componente) ||
                        null,

                    tipo_actividad:
                        texto(
                            tarea.tipo_actividad
                        ) || null,

                    aplicabilidad:
                        texto(
                            tarea.aplicabilidad
                        ) || null,

                    trigger_tipo:
                        triggerTipo,

                    sm:
                        null,

                    cada_iteraciones:
                        null,

                    iteracion_cada:
                        null,

                    cada_km:
                        cadaKm,

                    cada_horas:
                        cadaHoras,

                    criterio_tiempo:
                        texto(
                            tarea.criterio_tiempo
                        ) || null,

                    cada_tiempo_valor:
                        cadaTiempoValor,

                    cada_tiempo_unidad:
                        cadaTiempoUnidad,

                    tiempo_estimado_h:
                        numero(
                            tarea.tiempo_estimado_h
                        ),

                    especialidad:
                        texto(
                            tarea.especialidad
                        ) || null,

                    prioridad:
                        texto(
                            tarea.prioridad
                        ) || null,

                    detiene_equipo:
                        booleano(
                            tarea.detiene_equipo
                        ),

                    repuesto_insumo_sugerido:
                        texto(
                            tarea.repuesto_insumo_sugerido
                        ) || null,

                    observaciones:
                        texto(
                            tarea.observaciones
                        ) || null,

                    activa:
                        true,

                    updated_at:
                        new Date().toISOString()
                };
            });


        // ==========================================
        // UPSERT TAREAS
        // ==========================================

        const {
            data: tareasGuardadas,
            error: errorTareas
        } = await supabaseAdmin
            .from(
                'planes_mantenimiento_tareas'
            )
            .upsert(
                tareasPreparadas,
                {
                    onConflict:
                        'plan_id,codigo_tarea'
                }
            )
            .select('id');


        if (errorTareas) {

            console.error(
                'Error publicando tareas:',
                errorTareas
            );

            return NextResponse.json(
                {
                    ok: false,
                    error:
                        'Los planes fueron procesados, pero ocurrió un error al publicar las tareas.',
                    detalle:
                        errorTareas.message
                },
                {
                    status: 500
                }
            );
        }


        // ==========================================
        // RESPUESTA
        // ==========================================

        return NextResponse.json(
            {
                ok: true,

                mensaje:
                    'Biblioteca FleetVision publicada correctamente.',

                empresa: {
                    id:
                        empresaFleetVision.id,

                    nombre:
                        empresaFleetVision.nombre
                },

                planes:
                    planesGuardados.length,

                tareas:
                    tareasGuardadas?.length ??
                    tareasPreparadas.length,

                fecha_publicacion:
                    new Date().toISOString()
            },
            {
                status: 200
            }
        );

    } catch (error) {

        console.error(
            'Error general publicando biblioteca FleetVision:',
            error
        );

        return NextResponse.json(
            {
                ok: false,

                error:
                    error instanceof Error
                        ? error.message
                        : 'Error desconocido.'
            },
            {
                status: 500
            }
        );
    }
}