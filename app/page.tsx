export default function Home() {
  return (
    <main className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-sky-500 to-blue-700">

      {/* HEADER */}
      <header className="absolute top-0 z-20 w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
          <div className="text-xl font-bold tracking-wide text-white">
            FleetVision
          </div>
          <button className="rounded-xl bg-white px-5 py-2 font-semibold text-sky-600 shadow hover:bg-sky-50">
            Iniciar sesión
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative mx-auto flex min-h-screen max-w-7xl items-center px-8 pt-24">
        <div className="z-10 max-w-xl text-white">
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            Gestión inteligente del mantenimiento de flotas
          </h1>

          <p className="mt-6 text-lg text-white/90">
            FleetVision es la plataforma profesional para controlar, planificar
            y optimizar el mantenimiento de vehículos y maquinaria crítica,
            reduciendo costos y maximizando la disponibilidad operativa.
          </p>

          <div className="mt-10">
            <button className="rounded-xl bg-white px-8 py-4 text-lg font-semibold text-sky-600 shadow-lg hover:bg-sky-50">
              Iniciar sesión
            </button>
          </div>
        </div>

        {/* MOCKUP */}
        <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 md:block">
          <div className="relative h-[380px] w-[600px] rounded-2xl bg-white shadow-2xl">
            <div className="flex h-12 items-center gap-2 rounded-t-2xl bg-slate-100 px-4">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            <div className="p-6">
              <div className="mb-4 h-44 rounded-lg bg-gradient-to-r from-sky-200 to-blue-200" />
              <div className="grid grid-cols-3 gap-4">
                <div className="h-20 rounded-lg bg-sky-100" />
                <div className="h-20 rounded-lg bg-sky-100" />
                <div className="h-20 rounded-lg bg-sky-100" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-8 text-center">
          <p className="text-sm uppercase tracking-widest text-slate-400">
            Plataforma diseñada para operaciones críticas
          </p>
          <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-4">
            <TrustItem text="Transporte" />
            <TrustItem text="Minería" />
            <TrustItem text="Construcción" />
            <TrustItem text="Logística" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-8">
          <h2 className="text-center text-3xl font-bold text-slate-800">
            Capacidades clave de FleetVision
          </h2>
          <p className="mt-4 text-center text-slate-500">
            Todo el control del mantenimiento en un solo sistema
          </p>

          <div className="mt-16 grid gap-10 md:grid-cols-3">
            <Feature title="Mantenimiento preventivo y predictivo" text="Planificación por horas, kilometraje y condición real del equipo." />
            <Feature title="Control total de costos" text="Visibilidad completa de repuestos, mano de obra y detenciones." />
            <Feature title="KPIs operacionales" text="Disponibilidad, MTBF, MTTR y desempeño en tiempo real." />
            <Feature title="Gestión de órdenes de trabajo" text="OT digitales con trazabilidad total por equipo y técnico." />
            <Feature title="Historial técnico centralizado" text="Toda la información del activo en un solo lugar." />
            <Feature title="Alertas y vencimientos" text="Notificaciones automáticas para evitar fallos no programados." />
          </div>
        </div>
      </section>

      {/* VALUE */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-800">
            Decisiones basadas en datos reales
          </h2>
          <p className="mt-6 text-lg text-slate-600">
            FleetVision transforma la información del mantenimiento en
            indicadores claros para jefaturas y gerencia.
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-sky-700 py-20 text-center text-white">
        <h2 className="text-3xl font-bold">
          FleetVision · Control total de tu flota
        </h2>
        <p className="mt-4 text-sky-100">
          Plataforma profesional de mantenimiento para operaciones exigentes
        </p>
        <div className="mt-8">
          <button className="rounded-xl bg-white px-10 py-4 text-lg font-semibold text-sky-700 hover:bg-sky-50">
            Iniciar sesión
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} FleetVision · Gestión inteligente de mantenimiento de flotas
      </footer>
    </main>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-3 text-slate-500">{text}</p>
    </div>
  );
}

function TrustItem({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white py-4 text-sm font-semibold text-slate-600 shadow-sm">
      {text}
    </div>
  );
}
