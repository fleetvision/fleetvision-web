import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

type BorrarUsuarioBody = {
    usuario_id?: string;
    auth_id?: string;
    empresa_id?: string;
    usuario_empresa_id?: string;
    confirmacion?: string;
};

function respuestaError(error: string, detalle: string, status = 400) {
    return NextResponse.json(
        {
            ok: false,
            error,
            detalle,
        },
        { status }
    );
}

export async function POST(request: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
        return respuestaError(
            'Faltan variables de entorno de Supabase.',
            'Revisa NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY.',
            500
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
            console.error('No se pudo registrar auditoría:', error);
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
                'No se pudo validar el usuario autenticado.',
                401
            );
        }

        const adminAuthId = usuarioSesion.user.id;

        const { data: esAdminGlobal, error: errorAdminGlobal } =
            await supabaseUsuario.rpc('soy_admin_global');

        if (errorAdminGlobal || esAdminGlobal !== true) {
            await registrarAuditoria(adminAuthId, 'intento_borrar_usuario_denegado', 'usuarios', usuarioId, {
                motivo: 'No es admin global',
                usuario_id: usuarioId,
                auth_id: authId,
                empresa_id: empresaId,
                usuario_empresa_id: usuarioEmpresaId,
            });

            return respuestaError(
                'Acceso denegado.',
                'Solo un administrador global puede borrar usuarios.',
                403
            );
        }

        const { data: usuarioActual, error: errorUsuarioActual } =
            await supabaseAdmin
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

        // CANDADO 1:
        // Si pertenece a más de una empresa, jamás se borra completo.
        // Solo se elimina este vínculo.
        if (vinculosActuales.length > 1) {
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
                mensaje:
                    'El usuario pertenece a más de una empresa. Por seguridad solo se eliminó el vínculo con esta empresa.',
                detalle:
                    'El usuario no fue eliminado de Supabase Auth ni de public.usuarios porque aún tiene otros vínculos.',
            });
        }

        // CANDADO 2:
        // Revisar historial. Si una revisión falla, NO se borra.
        const revisiones = [
            await contarHistorial('activos', 'user_id', authId, 'Activos creados por el usuario'),
        ];

        // Agrega aquí más revisiones cuando tus tablas tengan columnas de usuario:
        // await contarHistorial('ordenes_trabajo', 'user_id', authId, 'Órdenes asociadas al usuario'),
        // await contarHistorial('mantenimientos', 'user_id', authId, 'Mantenimientos asociados al usuario'),
        // await contarHistorial('auditoria_dueno', 'admin_auth_id', authId, 'Acciones registradas en auditoría'),

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
                mensaje:
                    'No se pudo verificar toda la trazabilidad del usuario. Por seguridad no se eliminó.',
                detalle:
                    'FleetVision lo dejó inactivo para evitar pérdida de historial. Revisa las tablas de historial antes de permitir borrado definitivo.',
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
                mensaje:
                    'El usuario tiene historial en FleetVision. No se eliminó para conservar trazabilidad.',
                detalle: revisionesConHistorial
                    .map((item) => `${item.descripcion}: ${item.count}`)
                    .join(' | '),
                historial_detectado: revisionesConHistorial,
            });
        }

        // CANDADO 3:
        // Aunque no tenga historial, no se borra definitivo sin confirmación fuerte.
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
                mensaje:
                    'El usuario no tiene historial detectado y podría borrarse definitivamente.',
                detalle:
                    'Para borrar definitivamente debes confirmar escribiendo BORRAR DEFINITIVO.',
            });
        }

        // CANDADO 4:
        // Borrado definitivo solo si:
        // - una empresa
        // - sin historial
        // - sin errores de revisión
        // - confirmación fuerte correcta
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

        const { error: errorEliminarUsuarioPublico } = await supabaseAdmin
            .from('usuarios')
            .delete()
            .eq('id', usuarioId)
            .eq('auth_id', authId);

        if (errorEliminarUsuarioPublico) {
            return respuestaError(
                'No se pudo eliminar el usuario público.',
                errorEliminarUsuarioPublico.message,
                400
            );
        }

        const { error: errorEliminarAuth } =
            await supabaseAdmin.auth.admin.deleteUser(authId);

        if (errorEliminarAuth) {
            await registrarAuditoria(adminAuthId, 'usuario_publico_eliminado_auth_fallo', 'usuarios', usuarioId, {
                usuario_id: usuarioId,
                auth_id: authId,
                error: errorEliminarAuth.message,
            });

            return respuestaError(
                'El usuario público fue eliminado, pero no se pudo eliminar Supabase Auth.',
                errorEliminarAuth.message,
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
            detalle:
                'Se eliminó el vínculo, el registro en public.usuarios y el usuario de Supabase Auth.',
        });
    } catch (error: any) {
        return respuestaError(
            'Error inesperado borrando usuario.',
            error?.message || 'Error desconocido.',
            500
        );
    }
}