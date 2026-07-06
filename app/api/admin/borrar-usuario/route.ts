import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type BorrarUsuarioBody = {
    usuario_id?: string;
    auth_id?: string;
    empresa_id?: string;
    usuario_empresa_id?: string;
    confirmacion?: string;
};

function respuestaError(error: string, detalle: string, status = 400, extra?: Record<string, unknown>) {
    return NextResponse.json(
        {
            ok: false,
            error,
            detalle,
            ...(extra || {}),
        },
        { status }
    );
}

function obtenerEnv() {
    const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.SUPABASE_URL ||
        '';

    const supabaseAnonKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        '';

    const supabaseServiceRoleKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_KEY ||
        process.env.SUPABASE_SERVICE_ROLE ||
        '';

    const faltantes = [
        !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
        !supabaseAnonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null,
        !supabaseServiceRoleKey ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
    ].filter(Boolean) as string[];

    return {
        supabaseUrl,
        supabaseAnonKey,
        supabaseServiceRoleKey,
        faltantes,
    };
}

export async function POST(request: Request) {
    const {
        supabaseUrl,
        supabaseAnonKey,
        supabaseServiceRoleKey,
        faltantes,
    } = obtenerEnv();

    if (faltantes.length > 0) {
        return respuestaError(
            'Faltan variables de entorno de Supabase.',
            `No se pudieron leer estas variables en la API: ${faltantes.join(', ')}. Si están en Vercel, revisa que estén en Production y haz Redeploy.`,
            500,
            { faltantes }
        );
    }

    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return respuestaError(
            'Sesión no enviada.',
            'Debes enviar el token del usuario autenticado.',
            401
        );
    }

    const token = authHeader.replace('Bearer ', '').trim();

    const supabaseUsuario = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });

    const registrarAuditoria = async (
        adminAuthId: string | null,
        accion: string,
        entidad: string,
        entidadId: string | null,
        detalle: Record<string, any>
    ) => {
        try {
            await supabaseAdmin.from('auditoria_dueno').insert({
                admin_auth_id: adminAuthId,
                accion,
                entidad,
                entidad_id: entidadId,
                detalle,
            });
        } catch (error) {
            console.warn('No se pudo registrar auditoría. No se bloquea la acción:', error);
        }
    };

    const contarHistorial = async (
        tabla: string,
        columna: string,
        valor: string,
        descripcion: string
    ) => {
        const { count, error } = await supabaseAdmin
            .from(tabla)
            .select('id', { count: 'exact', head: true })
            .eq(columna, valor);

        if (error) {
            return {
                ok: false,
                tabla,
                columna,
                descripcion,
                count: 0,
                error: error.message,
            };
        }

        return {
            ok: true,
            tabla,
            columna,
            descripcion,
            count: count || 0,
            error: null,
        };
    };

    try {
        const body = (await request.json()) as BorrarUsuarioBody;

        const usuarioId = (body.usuario_id || '').trim();
        const authId = (body.auth_id || '').trim();
        const empresaId = (body.empresa_id || '').trim();
        const usuarioEmpresaId = (body.usuario_empresa_id || '').trim();
        const confirmacion = (body.confirmacion || '').trim();

        if (!usuarioId) {
            return respuestaError('Falta el ID del usuario.', 'No se recibió usuario_id.');
        }

        if (!authId) {
            return respuestaError('Falta el auth_id del usuario.', 'No se recibió auth_id.');
        }

        if (!empresaId && !usuarioEmpresaId) {
            return respuestaError(
                'Falta el vínculo empresa-usuario.',
                'Debes enviar empresa_id o usuario_empresa_id para saber qué vínculo revisar.'
            );
        }

        const { data: usuarioSesion, error: errorSesion } = await supabaseUsuario.auth.getUser();

        if (errorSesion || !usuarioSesion.user) {
            return respuestaError(
                'Sesión inválida.',
                errorSesion?.message || 'No se pudo validar el usuario autenticado.',
                401
            );
        }

        const adminAuthId = usuarioSesion.user.id;

        const { data: usuarioAdminPublico, error: errorUsuarioAdminPublico } = await supabaseAdmin
            .from('usuarios')
            .select('id, auth_id, username, apellido, activo')
            .eq('auth_id', adminAuthId)
            .maybeSingle();

        if (errorUsuarioAdminPublico || !usuarioAdminPublico?.id) {
            return respuestaError(
                'No se pudo validar el usuario administrador.',
                errorUsuarioAdminPublico?.message || 'Tu cuenta no existe en public.usuarios.',
                403
            );
        }

        const { data: rolAdminGlobal, error: errorRolAdminGlobal } = await supabaseAdmin
            .from('usuarios_globales_admin')
            .select('id, rol_global, activo')
            .eq('usuario_id', usuarioAdminPublico.id)
            .eq('activo', true)
            .maybeSingle();

        if (errorRolAdminGlobal || !rolAdminGlobal) {
            await registrarAuditoria(adminAuthId, 'intento_borrar_usuario_denegado', 'usuarios', usuarioId, {
                motivo: 'No es admin global activo',
                usuario_id: usuarioId,
                auth_id: authId,
                empresa_id: empresaId,
                usuario_empresa_id: usuarioEmpresaId,
                error: errorRolAdminGlobal?.message || null,
            });

            return respuestaError(
                'Acceso denegado.',
                'Solo un Dueño FleetVision / administrador global activo puede borrar usuarios.',
                403
            );
        }

        if (authId === adminAuthId) {
            await registrarAuditoria(adminAuthId, 'intento_borrar_propio_usuario_bloqueado', 'usuarios', usuarioId, {
                motivo: 'Intentó borrar su propio usuario',
                usuario_id: usuarioId,
                auth_id: authId,
                empresa_id: empresaId,
                usuario_empresa_id: usuarioEmpresaId,
            });

            return respuestaError(
                'Acción bloqueada.',
                'No puedes borrar tu propio usuario dueño.',
                403
            );
        }

        const { data: usuarioActual, error: errorUsuarioActual } = await supabaseAdmin
            .from('usuarios')
            .select('id, auth_id, username, apellido, activo')
            .eq('id', usuarioId)
            .eq('auth_id', authId)
            .maybeSingle();

        if (errorUsuarioActual) {
            return respuestaError(
                'No se pudo validar el usuario.',
                errorUsuarioActual.message,
                500
            );
        }

        if (!usuarioActual) {
            return respuestaError(
                'Usuario no encontrado.',
                'El usuario no existe o el auth_id no coincide.',
                404
            );
        }

        const { data: usuarioObjetivoGlobal, error: errorUsuarioObjetivoGlobal } = await supabaseAdmin
            .from('usuarios_globales_admin')
            .select('id, rol_global, activo')
            .eq('usuario_id', usuarioId)
            .eq('activo', true)
            .maybeSingle();

        if (errorUsuarioObjetivoGlobal) {
            await registrarAuditoria(adminAuthId, 'error_validando_dueno_protegido', 'usuarios', usuarioId, {
                usuario_id: usuarioId,
                auth_id: authId,
                error: errorUsuarioObjetivoGlobal.message,
            });

            return respuestaError(
                'No se pudo validar el dueño protegido.',
                'Por seguridad, FleetVision bloqueó el borrado.',
                500
            );
        }

        if (usuarioObjetivoGlobal) {
            await registrarAuditoria(adminAuthId, 'intento_borrar_dueno_bloqueado', 'usuarios', usuarioId, {
                motivo: 'Usuario objetivo es Dueño FleetVision activo',
                usuario_id: usuarioId,
                auth_id: authId,
                empresa_id: empresaId,
                usuario_empresa_id: usuarioEmpresaId,
                rol_global: usuarioObjetivoGlobal.rol_global,
            });

            return respuestaError(
                'Dueño protegido.',
                'Este usuario es Dueño FleetVision activo y no se puede borrar.',
                403
            );
        }

        const { data: vinculos, error: errorVinculos } = await supabaseAdmin
            .from('usuarios_empresas')
            .select('id, empresa_id')
            .eq('usuario_id', usuarioId);

        if (errorVinculos) {
            return respuestaError(
                'No se pudieron revisar los vínculos del usuario.',
                errorVinculos.message,
                500
            );
        }

        const vinculosActuales = vinculos || [];

        const vinculoActual = vinculosActuales.find((vinculo: any) => {
            if (usuarioEmpresaId) return vinculo.id === usuarioEmpresaId;
            return vinculo.empresa_id === empresaId;
        });

        if (!vinculoActual) {
            return respuestaError(
                'Vínculo no encontrado.',
                'El usuario no está vinculado a esta empresa o el vínculo ya fue eliminado.',
                404
            );
        }

        if (vinculosActuales.length > 1) {
            await supabaseAdmin
                .from('usuarios_empresas_roles')
                .delete()
                .eq('usuario_empresa_id', vinculoActual.id);

            const { error: errorEliminarVinculo } = await supabaseAdmin
                .from('usuarios_empresas')
                .delete()
                .eq('id', vinculoActual.id);

            if (errorEliminarVinculo) {
                return respuestaError(
                    'No se pudo eliminar el vínculo.',
                    errorEliminarVinculo.message,
                    400
                );
            }

            await registrarAuditoria(adminAuthId, 'usuario_vinculo_eliminado', 'usuarios_empresas', vinculoActual.id, {
                usuario_id: usuarioId,
                auth_id: authId,
                empresa_id: vinculoActual.empresa_id,
                razon: 'Usuario con más de una empresa. No se eliminó completo.',
            });

            return NextResponse.json({
                ok: true,
                accion: 'vinculo_eliminado',
                mensaje: 'El usuario pertenece a más de una empresa. Por seguridad solo se eliminó el vínculo con esta empresa.',
                detalle: 'El usuario no fue eliminado de Supabase Auth ni de public.usuarios porque aún tiene otros vínculos.',
            });
        }

        const revisiones = [
            await contarHistorial('activos', 'user_id', authId, 'Activos creados por el usuario'),
        ];

        const revisionesConError = revisiones.filter((item) => !item.ok);
        const revisionesConHistorial = revisiones.filter((item) => item.ok && item.count > 0);

        if (revisionesConError.length > 0) {
            await supabaseAdmin
                .from('usuarios')
                .update({ activo: false })
                .eq('id', usuarioId);

            await registrarAuditoria(adminAuthId, 'usuario_no_borrado_revision_insegura', 'usuarios', usuarioId, {
                usuario_id: usuarioId,
                auth_id: authId,
                errores_revision: revisionesConError,
                accion_tomada: 'desactivado',
            });

            return NextResponse.json({
                ok: true,
                accion: 'desactivado_por_revision_insegura',
                mensaje: 'No se pudo verificar toda la trazabilidad del usuario. Por seguridad no se eliminó.',
                detalle: 'FleetVision lo dejó inactivo para evitar pérdida de historial.',
                revisiones_con_error: revisionesConError,
            });
        }

        if (revisionesConHistorial.length > 0) {
            const { error: errorDesactivar } = await supabaseAdmin
                .from('usuarios')
                .update({ activo: false })
                .eq('id', usuarioId);

            if (errorDesactivar) {
                return respuestaError(
                    'Tiene historial, pero no se pudo desactivar.',
                    errorDesactivar.message,
                    400
                );
            }

            await registrarAuditoria(adminAuthId, 'usuario_desactivado_por_historial', 'usuarios', usuarioId, {
                usuario_id: usuarioId,
                auth_id: authId,
                historial_detectado: revisionesConHistorial,
            });

            return NextResponse.json({
                ok: true,
                accion: 'desactivado_por_historial',
                mensaje: 'El usuario tiene historial en FleetVision. No se eliminó para conservar trazabilidad.',
                detalle: revisionesConHistorial
                    .map((item) => `${item.descripcion}: ${item.count}`)
                    .join(' | '),
                historial_detectado: revisionesConHistorial,
            });
        }

        if (confirmacion !== 'BORRAR DEFINITIVO') {
            await registrarAuditoria(adminAuthId, 'usuario_borrado_requiere_confirmacion', 'usuarios', usuarioId, {
                usuario_id: usuarioId,
                auth_id: authId,
                empresa_id: empresaId,
                mensaje: 'Usuario sin historial detectado, pero falta confirmación fuerte.',
            });

            return NextResponse.json({
                ok: true,
                accion: 'requiere_confirmacion_definitiva',
                mensaje: 'El usuario no tiene historial detectado y podría borrarse definitivamente.',
                detalle: 'Para borrar definitivamente debes confirmar escribiendo BORRAR DEFINITIVO.',
            });
        }

        const idsVinculos = vinculosActuales.map((vinculo: any) => vinculo.id).filter(Boolean);

        if (idsVinculos.length > 0) {
            await supabaseAdmin
                .from('usuarios_empresas_roles')
                .delete()
                .in('usuario_empresa_id', idsVinculos);
        }

        const { error: errorEliminarVinculos } = await supabaseAdmin
            .from('usuarios_empresas')
            .delete()
            .eq('usuario_id', usuarioId);

        if (errorEliminarVinculos) {
            return respuestaError(
                'No se pudieron eliminar los vínculos del usuario.',
                errorEliminarVinculos.message,
                400
            );
        }

        const { error: errorEliminarAuth } = await supabaseAdmin.auth.admin.deleteUser(authId);

        if (errorEliminarAuth) {
            await registrarAuditoria(adminAuthId, 'usuario_auth_fallo', 'usuarios', usuarioId, {
                usuario_id: usuarioId,
                auth_id: authId,
                error: errorEliminarAuth.message,
            });

            return respuestaError(
                'No se pudo eliminar Supabase Auth.',
                errorEliminarAuth.message,
                400
            );
        }

        const { error: errorEliminarUsuarioPublico } = await supabaseAdmin
            .from('usuarios')
            .delete()
            .eq('id', usuarioId)
            .eq('auth_id', authId);

        if (errorEliminarUsuarioPublico) {
            return respuestaError(
                'Se eliminó Supabase Auth, pero no se pudo eliminar el usuario público.',
                errorEliminarUsuarioPublico.message,
                400
            );
        }

        await registrarAuditoria(adminAuthId, 'usuario_borrado_definitivo', 'usuarios', usuarioId, {
            usuario_id: usuarioId,
            auth_id: authId,
            empresa_id: empresaId,
            username: usuarioActual.username,
            revisiones,
        });

        return NextResponse.json({
            ok: true,
            accion: 'borrado_definitivo',
            mensaje: 'Usuario eliminado definitivamente.',
            detalle: 'Se eliminó el vínculo, los roles del vínculo, el usuario de Supabase Auth y el registro en public.usuarios.',
        });
    } catch (error: any) {
        return respuestaError(
            'Error inesperado borrando usuario.',
            error?.message || 'Error desconocido.',
            500
        );
    }
}
