// app/dashboard/layout.tsx
import type { CSSProperties, ReactNode } from "react";

// ================================================================
// 🔍 CONFIGURACIÓN DE ZOOM POR SECCIÓN - DASHBOARD
// ================================================================
// Ajusta estos valores para controlar el tamaño visual de cada parte.
//
// 1.00 = tamaño normal
// 0.95 = un poco más pequeño
// 0.90 = más pequeño
// 0.85 = bastante más pequeño
// 0.80 = muy pequeño
// 1.05 = un poco más grande
// ================================================================

const ZOOM_DASHBOARD = 1.0; // Zoom general (aplica a todo, opcional)
const ZOOM_BARRA_IZQUIERDA = 0.94
const ZOOM_HEADER_SUPERIOR = 0.94;
const ZOOM_CONTENIDO_PRINCIPAL = 0.85;

// ================================================================
// LAYOUT PRINCIPAL DEL DASHBOARD
// ================================================================
export default function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    // Inyectamos las variables CSS para que estén disponibles en toda la página
    const zoomVariables = {
        "--zoom-dashboard": String(ZOOM_DASHBOARD),
        "--zoom-sidebar": String(ZOOM_BARRA_IZQUIERDA),
        "--zoom-header": String(ZOOM_HEADER_SUPERIOR),
        "--zoom-main": String(ZOOM_CONTENIDO_PRINCIPAL),
    } as CSSProperties;

    return (
        <div
            style={zoomVariables}
            className="h-full w-full"
        >
            {children}
        </div>
    );
}