const ACCENTS = {
  brand: "bg-brand-100 text-brand-700",
  green: "bg-green-100 text-green-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  purple: "bg-purple-100 text-purple-700",
};

const StatCard = ({ icon: Icon, label, value, accent = "brand" }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`h-11 w-11 rounded-xl ${ACCENTS[accent] || ACCENTS.brand} flex items-center justify-center shrink-0`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-900 leading-tight">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </div>
);

export default StatCard;
