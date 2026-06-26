import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

type EditarUsuarioBody = {
    usuario_id?: string;
    auth_id?: string;
    username?: string;
    apellido?: string;
    email?: string;
    activo?: boolean;
};

export async function PATCH(request: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
        return NextResponse.json(
            {
                ok: false,
                error: 'Faltan variables de entorno de Supabase.',
                detalle:
                    'Revisa NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY.',
            },
            { status: 500 }
        );
    }

    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            {
                ok: false,
                error: 'Sesión no enviada.',
                detalle: 'Debes enviar el token del usuario autenticado.',
            },
            { status: 401 }
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

    try {
        const body = (await request.json()) as EditarUsuarioBody;

        const usuarioId = (body.usuario_id || '').trim();
        const authId = (body.auth_id || '').trim();
        const username = (body.username || '').trim();
        const apellido = (body.apellido || '').trim();
        const email = (body.email || '').trim().toLowerCase();
        const activo = body.activo ?? true;

        if (!usuarioId) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'Falta el ID del usuario.',
                },
                { status: 400 }
            );
        }

        if (!authId) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'Falta el auth_id del usuario.',
                },
                { status: 400 }
            );
        }

        if (!username || username.length < 2) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'El nombre de usuario debe tener al menos 2 caracteres.',
                },
                { status: 400 }
            );
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'El correo ingresado no tiene un formato válido.',
                },
                { status: 400 }
            );
        }

        // Seguridad: verificar que quien llama sea admin global
        const { data: esAdminGlobal, error: errorAdminGlobal } =
            await supabaseUsuario.rpc('soy_admin_global');

        if (errorAdminGlobal || esAdminGlobal !== true) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'Acceso denegado.',
                    detalle: 'Solo un administrador global puede editar usuarios.',
                },
                { status: 403 }
            );
        }

        // Verificar que el usuario exista y coincida con su auth_id
        const { data: usuarioActual, error: errorUsuarioActual } =
            await supabaseAdmin
                .from('usuarios')
                .select('id, auth_id, username')
                .eq('id', usuarioId)
                .eq('auth_id', authId)
                .maybeSingle();

        if (errorUsuarioActual) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'No se pudo validar el usuario.',
                    detalle: errorUsuarioActual.message,
                },
                { status: 500 }
            );
        }

        if (!usuarioActual) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'Usuario no encontrado.',
                    detalle: 'El usuario no existe o el auth_id no coincide.',
                },
                { status: 404 }
            );
        }

        // Evitar username duplicado, pero permitir el mismo username del usuario actual
        const { data: usernameExistente, error: errorUsername } =
            await supabaseAdmin
                .from('usuarios')
                .select('id, username')
                .eq('username', username)
                .neq('id', usuarioId)
                .maybeSingle();

        if (errorUsername) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'No se pudo validar el username.',
                    detalle: errorUsername.message,
                },
                { status: 500 }
            );
        }

        if (usernameExistente) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'Ya existe otro usuario con ese username.',
                    detalle: 'Usa otro nombre de usuario.',
                },
                { status: 409 }
            );
        }

        // Actualizar correo en Supabase Auth solo si escribiste uno nuevo
        if (email) {
            const { error: errorActualizarAuth } =
                await supabaseAdmin.auth.admin.updateUserById(authId, {
                    email,
                    email_confirm: true,
                    user_metadata: {
                        username,
                        apellido,
                        nombre: username,
                    },
                });

            if (errorActualizarAuth) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: 'No se pudo actualizar el correo en Supabase Auth.',
                        detalle: errorActualizarAuth.message,
                    },
                    { status: 400 }
                );
            }
        } else {
            // Si no se cambia correo, igual actualizamos metadata
            const { error: errorActualizarMetadata } =
                await supabaseAdmin.auth.admin.updateUserById(authId, {
                    user_metadata: {
                        username,
                        apellido,
                        nombre: username,
                    },
                });

            if (errorActualizarMetadata) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: 'No se pudo actualizar la metadata del usuario.',
                        detalle: errorActualizarMetadata.message,
                    },
                    { status: 400 }
                );
            }
        }

        // Actualizar tabla public.usuarios
        const { error: errorActualizarUsuario } = await supabaseAdmin
            .from('usuarios')
            .update({
                username,
                apellido: apellido || null,
                activo,
            })
            .eq('id', usuarioId);

        if (errorActualizarUsuario) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'No se pudo actualizar el usuario.',
                    detalle: errorActualizarUsuario.message,
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            ok: true,
            mensaje: 'Usuario actualizado correctamente.',
            usuario: {
                usuario_id: usuarioId,
                auth_id: authId,
                username,
                apellido,
                email: email || null,
                activo,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                ok: false,
                error: 'Error inesperado editando usuario.',
                detalle: error?.message || 'Error desconocido.',
            },
            { status: 500 }
        );
    }
}