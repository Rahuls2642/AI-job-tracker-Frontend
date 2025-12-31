import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
     
      <section className="relative overflow-hidden">
        
        <div className="absolute inset-0">
          <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-indigo-200/30 blur-3xl" />
          <div className="absolute top-40 right-0 h-[320px] w-[320px] rounded-full bg-indigo-300/20 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 mb-6">
              Interview Master · your job command center
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight">
              Stay clear in your
              <br />
              job search.
            </h1>

            <p className="mt-6 text-zinc-700 text-lg leading-relaxed max-w-2xl">
              Interview Master turns your job search into something you can actually
              understand. Track applications, see what’s blocking you, and
              practice interviews with purpose—not hope.
            </p>

            <div className="mt-10 flex items-center gap-6">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl
                           bg-zinc-900 text-white px-8 py-3.5 text-sm font-medium
                           hover:bg-zinc-800 active:scale-[0.98] transition"
              >
                Get started
              </Link>

              <span className="text-sm text-zinc-500">
                Free to use · no setup stress
              </span>
            </div>
          </div>
        </div>
      </section>

     
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <Feature
              title="Application clarity"
              description="See every role, status, and follow-up in one place. You always know what’s active, stalled, or done."
            />

            <Feature
              title="Resume & ATS insight"
              description="Understand how your resume matches a job description—and what’s weakening it—without vague scoring."
            />

            <Feature
              title="Interview practice that sticks"
              description="Practice real questions, review answers, and watch your confidence compound over time."
            />
          </div>
        </div>
      </section>

      
      <section className="border-t border-zinc-200 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6 py-10 text-sm text-zinc-500">
          Built for individuals, not recruiters. Your data stays private.
          AI is used only where it genuinely helps.
        </div>
      </section>
    </div>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="group rounded-2xl bg-zinc-50 p-7
                 shadow-sm ring-1 ring-zinc-200
                 hover:bg-white hover:shadow-md hover:-translate-y-1
                 transition-all duration-200"
    >
      <h3 className="text-base font-medium mb-3">{title}</h3>
      <p className="text-zinc-600 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
}
