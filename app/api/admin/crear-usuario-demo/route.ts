import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

type CrearUsuarioDemoBody = {
    contacto_id?: number;
    password?: string;
    rol_id?: string;
};

function responderError(error: string, detalle = '', status = 400) {
    return NextResponse.json(
        {
            ok: false,
            error,
            detalle,
        },
        { status }
    );
}

function crearUsernameBase(nombre: string, correo: string) {
    const base = (correo?.split('@')[0] || nombre || 'demo')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 24);

    return base.length >= 3 ? base : `demo_${Date.now()}`;
}

async function buscarAuthPorEmail(supabaseAdmin: any, email: string) {
    const emailBuscado = email.trim().toLowerCase();

    for (let page = 1; page <= 10; page++) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({
            page,
            perPage: 1000,
        });

        if (error) {
            throw new Error(error.message);
        }

        const usuario = data?.users?.find(
            (user: any) => String(user.email || '').toLowerCase() === emailBuscado
        );

        if (usuario) return usuario;

        if (!data?.users || data.users.length < 1000) break;
    }

    return null;
}

export async function POST(request: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
        return responderError(
            'Faltan variables de entorno de Supabase.',
            'Revisa NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY.',
            500
        );
    }

    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return responderError(
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

    let authIdCreadoNuevo = '';
    let usuarioIdCreadoNuevo = '';

    try {
        const body = (await request.json()) as CrearUsuarioDemoBody;

        const contactoId = Number(body.contacto_id || 0);
        const password = String(body.password || '').trim();
        let rolId = String(body.rol_id || '').trim();

        if (!contactoId) {
            return responderError('Falta la solicitud.', 'No se recibió contacto_id.');
        }

        if (!password || password.length < 6) {
            return responderError(
                'Contraseña inválida.',
                'La contraseña temporal debe tener al menos 6 caracteres.'
            );
        }

        const { data: esAdminGlobal, error: errorAdminGlobal } =
            await supabaseUsuario.rpc('soy_admin_global');

        if (errorAdminGlobal || esAdminGlobal !== true) {
            return responderError(
                'Acceso denegado.',
                'Solo el dueño puede crear usuarios demo.',
                403
            );
        }

        const { data: contacto, error: errorContacto } = await supabaseAdmin
            .from('contactos')
            .select('id, nombre, rut, telefono, correo, region, pais, estado, usuario_demo_id, auth_demo_id')
            .eq('id', contactoId)
            .maybeSingle();

        if (errorContacto) {
            return responderError(
                'No se pudo leer la solicitud.',
                errorContacto.message,
                500
            );
        }

        if (!contacto) {
            return responderError('Solicitud no encontrada.', 'El contacto ya no existe.', 404);
        }

        if (!contacto.correo) {
            return responderError(
                'La solicitud no tiene correo.',
                'No se puede crear un usuario demo sin correo.'
            );
        }

        const email = String(contacto.correo).trim().toLowerCase();
        const nombre = String(contacto.nombre || '').trim();

        const { data: empresaDemoId, error: errorEmpresaDemo } =
            await supabaseUsuario.rpc('dueno_obtener_o_crear_empresa_demo');

        if (errorEmpresaDemo || !empresaDemoId) {
            return responderError(
                'No se pudo preparar la empresa PRUEBA.',
                errorEmpresaDemo?.message || 'La función no devolvió empresa_id.',
                500
            );
        }

        if (!rolId) {
            const { data: rolPorCodigo } = await supabaseAdmin
                .from('roles')
                .select('id')
                .eq('codigo', 'administrador')
                .maybeSingle();

            if (rolPorCodigo?.id) {
                rolId = rolPorCodigo.id;
            }
        }

        if (!rolId) {
            const { data: rolPorNombre } = await supabaseAdmin
                .from('roles')
                .select('id')
                .ilike('nombre', '%administrador%')
                .maybeSingle();

            if (rolPorNombre?.id) {
                rolId = rolPorNombre.id;
            }
        }

        if (!rolId) {
            return responderError(
                'No se encontró rol administrador.',
                'Selecciona un rol manualmente o revisa la tabla roles.'
            );
        }

        let authId = '';
        let usuarioId = '';
        let username = crearUsernameBase(nombre, email);
        let authYaExistia = false;

        const authExistente = await buscarAuthPorEmail(supabaseAdmin, email);

        if (authExistente?.id) {
            authYaExistia = true;
            authId = authExistente.id;

            const { data: usuarioPublicoExistente } = await supabaseAdmin
                .from('usuarios')
                .select('id, username, activo')
                .eq('auth_id', authId)
                .maybeSingle();

            if (usuarioPublicoExistente?.id) {
                usuarioId = usuarioPublicoExistente.id;
                username = usuarioPublicoExistente.username || username;

                const { data: vinculosExistentes } = await supabaseAdmin
                    .from('usuarios_empresas')
                    .select('empresa_id')
                    .eq('usuario_id', usuarioId);

                const empresaIds = (vinculosExistentes || [])
                    .map((v: any) => v.empresa_id)
                    .filter(Boolean);

                if (empresaIds.length > 0) {
                    const { data: empresasVinculadas } = await supabaseAdmin
                        .from('empresas')
                        .select('id, nombre, modo_demo')
                        .in('id', empresaIds);

                    const empresasNoDemo = (empresasVinculadas || []).filter(
                        (empresa: any) =>
                            empresa.id !== empresaDemoId && empresa.modo_demo !== true
                    );

                    if (empresasNoDemo.length > 0) {
                        return responderError(
                            'Este correo ya pertenece a un cliente real.',
                            `El correo ${email} ya está vinculado a otra empresa. No se modificará su contraseña para evitar afectar un cliente real.`,
                            409
                        );
                    }
                }

                const { error: errorActivarUsuario } = await supabaseAdmin
                    .from('usuarios')
                    .update({
                        activo: true,
                        rol: 'demo',
                    })
                    .eq('id', usuarioId);

                if (errorActivarUsuario) {
                    throw new Error(errorActivarUsuario.message);
                }
            }

            const { error: errorActualizarAuth } =
                await supabaseAdmin.auth.admin.updateUserById(authId, {
                    password,
                    email_confirm: true,
                    user_metadata: {
                        username,
                        nombre,
                        origen: 'demo_fleetvision',
                        empresa_demo: 'PRUEBA',
                    },
                });

            if (errorActualizarAuth) {
                return responderError(
                    'No se pudo actualizar la contraseña del usuario existente.',
                    errorActualizarAuth.message,
                    400
                );
            }
        } else {
            const { data: usernameExistente } = await supabaseAdmin
                .from('usuarios')
                .select('id')
                .eq('username', username)
                .maybeSingle();

            if (usernameExistente) {
                username = `${username}_${Math.floor(1000 + Math.random() * 9000)}`;
            }

            const { data: authCreado, error: errorAuth } =
                await supabaseAdmin.auth.admin.createUser({
                    email,
                    password,
                    email_confirm: true,
                    user_metadata: {
                        username,
                        nombre,
                        origen: 'demo_fleetvision',
                        empresa_demo: 'PRUEBA',
                    },
                });

            if (errorAuth || !authCreado.user) {
                return responderError(
                    'No se pudo crear el usuario en Supabase Auth.',
                    errorAuth?.message || 'Supabase Auth no devolvió usuario.',
                    400
                );
            }

            authId = authCreado.user.id;
            authIdCreadoNuevo = authId;
        }

        if (!usuarioId) {
            const { data: usuarioPorAuth } = await supabaseAdmin
                .from('usuarios')
                .select('id, username')
                .eq('auth_id', authId)
                .maybeSingle();

            if (usuarioPorAuth?.id) {
                usuarioId = usuarioPorAuth.id;
                username = usuarioPorAuth.username || username;
            }
        }

        if (!usuarioId) {
            usuarioId = crypto.randomUUID();
            usuarioIdCreadoNuevo = usuarioId;

            const { data: usernameExistente } = await supabaseAdmin
                .from('usuarios')
                .select('id')
                .eq('username', username)
                .maybeSingle();

            if (usernameExistente) {
                username = `${username}_${Math.floor(1000 + Math.random() * 9000)}`;
            }

            const { error: errorUsuarioPublico } = await supabaseAdmin
                .from('usuarios')
                .insert({
                    id: usuarioId,
                    auth_id: authId,
                    username,
                    apellido: nombre || null,
                    rol: 'demo',
                    activo: true,
                    created_at: new Date().toISOString(),
                });

            if (errorUsuarioPublico) {
                throw new Error(errorUsuarioPublico.message);
            }
        }

        const { data: vinculoDemoExistente } = await supabaseAdmin
            .from('usuarios_empresas')
            .select('id')
            .eq('usuario_id', usuarioId)
            .eq('empresa_id', empresaDemoId)
            .maybeSingle();

        if (!vinculoDemoExistente?.id) {
            const { error: errorVinculo } =
                await supabaseUsuario.rpc('dueno_vincular_usuario_empresa', {
                    p_usuario_id: usuarioId,
                    p_empresa_id: empresaDemoId,
                    p_rol_id: rolId,
                });

            if (errorVinculo) {
                throw new Error(errorVinculo.message);
            }
        }

        const notaDemo =
            `Usuario demo ${authYaExistia ? 'actualizado' : 'creado'} para empresa PRUEBA. ` +
            `Username: ${username}. Correo: ${email}.`;

        const { error: errorActualizarContacto } = await supabaseAdmin
            .from('contactos')
            .update({
                estado: 'convertida',
                empresa_creada_id: empresaDemoId,
                usuario_demo_id: usuarioId,
                auth_demo_id: authId,
                demo_creado_at: new Date().toISOString(),
                notas_dueno: notaDemo,
                updated_at: new Date().toISOString(),
            })
            .eq('id', contactoId);

        if (errorActualizarContacto) {
            throw new Error(errorActualizarContacto.message);
        }

        await supabaseAdmin.from('auditoria_dueno').insert({
            admin_auth_id: null,
            accion: authYaExistia
                ? 'usuario_demo_existente_actualizado_desde_solicitud'
                : 'usuario_demo_creado_desde_solicitud',
            entidad: 'contactos',
            entidad_id: null,
            detalle: {
                contacto_id: contactoId,
                empresa_demo_id: empresaDemoId,
                usuario_id: usuarioId,
                auth_id: authId,
                correo: email,
                username,
                empresa_demo: 'PRUEBA',
                auth_ya_existia: authYaExistia,
                fecha: new Date().toISOString(),
            },
        });

        return NextResponse.json({
            ok: true,
            mensaje: authYaExistia
                ? 'El usuario demo ya existía. Se actualizó su contraseña temporal y se vinculó a PRUEBA.'
                : 'Usuario demo creado correctamente.',
            detalle:
                'El usuario quedó activo y vinculado a la empresa PRUEBA.',
            usuario: {
                usuario_id: usuarioId,
                auth_id: authId,
                username,
                email,
                auth_ya_existia: authYaExistia,
            },
            empresa_demo_id: empresaDemoId,
        });
    } catch (error: any) {
        if (usuarioIdCreadoNuevo) {
            await supabaseAdmin.from('usuarios').delete().eq('id', usuarioIdCreadoNuevo);
        }

        if (authIdCreadoNuevo) {
            await supabaseAdmin.auth.admin.deleteUser(authIdCreadoNuevo);
        }

        return responderError(
            'Error inesperado creando usuario demo.',
            error?.message || 'Error desconocido.',
            500
        );
    }
}