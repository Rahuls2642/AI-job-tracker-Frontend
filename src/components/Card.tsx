function Stat({
  title,
  value,
  highlight = false,
}: {
  title: string;
  value: any;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl p-5
      ${highlight ? "ring-2 ring-[#4318FF]" : ""}`}
    >
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}
export default Stat;