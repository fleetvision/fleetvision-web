import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

type CrearUsuarioBody = {
    email?: string;
    password?: string;
    username?: string;
    apellido?: string;
    rol_texto?: string;
    empresa_id?: string;
    rol_id?: string;
    activo?: boolean;
};

export async function POST(request: Request) {
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
        const body = (await request.json()) as CrearUsuarioBody;

        const email = (body.email || '').trim().toLowerCase();
        const password = body.password || '';
        const username = (body.username || '').trim();
        const apellido = (body.apellido || '').trim();
        const rolTexto = (body.rol_texto || 'usuario').trim();
        const empresaId = (body.empresa_id || '').trim();
        const rolId = (body.rol_id || '').trim();
        const activo = body.activo ?? true;

        if (!email) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'El correo es obligatorio.',
                },
                { status: 400 }
            );
        }

        if (!password || password.length < 6) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'La contraseña debe tener al menos 6 caracteres.',
                },
                { status: 400 }
            );
        }

        if (!username) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'El nombre de usuario es obligatorio.',
                },
                { status: 400 }
            );
        }

        if (!empresaId) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'Debes seleccionar una empresa.',
                },
                { status: 400 }
            );
        }

        if (!rolId) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'Debes seleccionar un rol.',
                },
                { status: 400 }
            );
        }

        // Seguridad: verificar que quien llama sea dueño/developer/soporte plataforma
        const { data: esAdminGlobal, error: errorAdminGlobal } =
            await supabaseUsuario.rpc('soy_admin_global');

        if (errorAdminGlobal || esAdminGlobal !== true) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'Acceso denegado.',
                    detalle: 'Solo un administrador global puede crear usuarios.',
                },
                { status: 403 }
            );
        }

        // Evitar username duplicado en public.usuarios
        const { data: usuarioUsernameExistente, error: errorUsername } =
            await supabaseAdmin
                .from('usuarios')
                .select('id, username')
                .eq('username', username)
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

        if (usuarioUsernameExistente) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'Ya existe un usuario con ese username.',
                    detalle: 'Usa otro nombre de usuario.',
                },
                { status: 409 }
            );
        }

        // 1) Crear usuario en Supabase Auth
        const { data: authCreado, error: errorAuth } =
            await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    username,
                    apellido,
                    nombre: username,
                },
            });

        if (errorAuth || !authCreado.user) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'No se pudo crear el usuario en Supabase Auth.',
                    detalle: errorAuth?.message || 'Supabase Auth no devolvió usuario.',
                },
                { status: 400 }
            );
        }

        const authId = authCreado.user.id;
        const usuarioId = crypto.randomUUID();

        try {
            // 2) Crear registro en public.usuarios
            const { error: errorInsertUsuario } = await supabaseAdmin
                .from('usuarios')
                .insert({
                    id: usuarioId,
                    auth_id: authId,
                    username,
                    apellido: apellido || null,
                    rol: rolTexto,
                    activo,
                    created_at: new Date().toISOString(),
                });

            if (errorInsertUsuario) {
                throw new Error(errorInsertUsuario.message);
            }

            // 3) Vincular a empresa y asignar rol usando la función segura
            const { data: usuarioVinculado, error: errorVincular } =
                await supabaseUsuario.rpc('dueno_vincular_usuario_empresa', {
                    p_usuario_id: usuarioId,
                    p_empresa_id: empresaId,
                    p_rol_id: rolId,
                });

            if (errorVincular) {
                throw new Error(errorVincular.message);
            }

            return NextResponse.json({
                ok: true,
                mensaje: 'Usuario creado y vinculado correctamente.',
                usuario: {
                    usuario_id: usuarioId,
                    auth_id: authId,
                    email,
                    username,
                    apellido,
                    activo,
                },
                vinculo: usuarioVinculado,
            });
        } catch (errorInterno: any) {
            // Si algo falla después de crear Auth, limpiamos para no dejar basura
            await supabaseAdmin.from('usuarios').delete().eq('id', usuarioId);
            await supabaseAdmin.auth.admin.deleteUser(authId);

            return NextResponse.json(
                {
                    ok: false,
                    error: 'No se pudo terminar la creación del usuario.',
                    detalle:
                        errorInterno?.message ||
                        'Se eliminó el usuario creado parcialmente para mantener limpio el sistema.',
                },
                { status: 400 }
            );
        }
    } catch (error: any) {
        return NextResponse.json(
            {
                ok: false,
                error: 'Error inesperado creando usuario.',
                detalle: error?.message || 'Error desconocido.',
            },
            { status: 500 }
        );
    }
}