// app/api/trial-request/route.ts
import { supabase } from '../../lib/supabase'; // Ajusta la ruta según tu estructura
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, name, company, phone } = body;

        // Validaciones
        if (!email || !name || !company) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos (email, nombre, empresa)' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Correo electrónico inválido' },
                { status: 400 }
            );
        }

        // Sanitizar (opcional pero buena práctica)
        const sanitizedName = name.trim().replace(/[<>]/g, '');
        const sanitizedCompany = company.trim().replace(/[<>]/g, '');
        const sanitizedPhone = phone?.trim().replace(/[<>]/g, '') || '';

        // Insertar en Supabase (sin autenticación, solo con anon key)
        const { error } = await supabase
            .from('trial_requests')
            .insert({
                email: email.trim(),
                name: sanitizedName,
                company: sanitizedCompany,
                phone: sanitizedPhone,
                status: 'pending',
                created_at: new Date().toISOString(),
            });

        if (error) {
            console.error('❌ Error insertando trial_request:', error);
            return NextResponse.json(
                { error: 'Error al procesar la solicitud. Intenta más tarde.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: 'Solicitud recibida' });

    } catch (error) {
        console.error('❌ Error en API trial-request:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}