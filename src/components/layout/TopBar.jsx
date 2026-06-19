export default function TopBar({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6 flex-wrap gap-3 border-b border-gray-100 pb-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
