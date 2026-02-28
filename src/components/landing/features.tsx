import { features } from "./landing-data";

export function Features() {
  return (
    <section id="features" className="px-6 py-28">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Características
          </p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Construido para equipos modernos que quieren claridad, velocidad y
            control total sobre sus proyectos.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md group-hover:shadow-primary/30">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
