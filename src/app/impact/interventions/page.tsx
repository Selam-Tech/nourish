export default function InterventionsPage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#a36b12]">
        Nourish Impact
      </p>

      <h1 className="mt-2 text-3xl font-bold text-[#183f2b]">
        Intervention Lab
      </h1>

      <p className="mt-4 max-w-2xl leading-7 text-[#5d695f]">
        Test how changes in food support,
        household budgets, and prices could
        change modeled nutrition
        affordability.
      </p>

      <div className="mt-8 rounded-2xl border border-[#d8d3c3] bg-white p-6 shadow-sm">
        <p className="font-semibold text-[#183f2b]">
          Intervention simulation is the
          next Nourish Impact module.
        </p>

        <p className="mt-2 text-sm leading-6 text-[#657168]">
          We will connect this page to the
          same deterministic optimization
          engine used by household planning.
        </p>
      </div>
    </div>
  );
}