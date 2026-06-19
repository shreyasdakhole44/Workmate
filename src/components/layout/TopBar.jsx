import { useAuth } from "../../context/AuthContext";

export default function TopBar({ title, subtitle, action, isSharedView }) {
  const { user } = useAuth();
  const showBadge = isSharedView && user?.role === "ADMIN";

  return (
    <div className="flex items-start justify-between mb-6 flex-wrap gap-3 border-b border-gray-100 pb-5 w-full">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {showBadge && (
            <span className="bg-red-50 text-red-655 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100 uppercase tracking-wider animate-pulse">
              Admin View
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
