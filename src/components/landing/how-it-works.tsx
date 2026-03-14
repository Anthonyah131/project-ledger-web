import { steps } from "./landing-data";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/30 px-6 py-28">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Cómo funciona
          </p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground">
            De cero a control total en minutos
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Sin curvas de aprendizaje complicadas. Configura una vez, úsalo todos los días.
          </p>
        </div>

        {/* Steps — ahora son 4 */}
        <div className="relative mt-16 grid gap-8 lg:grid-cols-4">
          {/* Connector line */}
          <div className="absolute left-0 right-0 top-12 hidden h-px bg-border lg:block" />

          {steps.map(({ number, title, description }) => (
            <div key={number} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 mb-6 flex h-20 w-20 flex-col items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 shadow-md shadow-primary/10">
                <span className="text-xl font-bold text-primary">{number}</span>
              </div>
              <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
