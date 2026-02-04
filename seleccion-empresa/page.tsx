'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SeleccionEmpresaPage() {
    const router = useRouter();
    const [empresas, setEmpresas] = useState<any[]>([]);

    useEffect(() => {
        const data = sessionStorage.getItem('empresas_disponibles');

        if (!data) {
            // si no hay empresas, volver al dashboard
            router.replace('/dashboard');
            return;
        }

        try {
            const parsed = JSON.parse(data);
            setEmpresas(parsed);
        } catch {
            router.replace('/dashboard');
        }
    }, [router]);

    const seleccionarEmpresa = (empresa: any) => {
        sessionStorage.setItem('empresa_activa', JSON.stringify(empresa));
        router.push('/dashboard');
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
            <div className="w-full max-w-md space-y-4">
                <h1 className="text-2xl font-bold text-center">
                    Selecciona una empresa
                </h1>

                {empresas.map((empresa) => (
                    <button
                        key={empresa.id}
                        onClick={() => seleccionarEmpresa(empresa)}
                        className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 py-3 text-lg font-semibold transition"
                    >
                        {empresa.nombre}
                    </button>
                ))}
            </div>
        </main>
    );
}
