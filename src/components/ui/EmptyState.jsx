export default function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
          <Icon size={26} className="text-gray-400"/>
        </div>
      )}
      <p className="text-base font-medium text-gray-700 mb-1">{title}</p>
      {desc && <p className="text-sm text-gray-400 mb-4 max-w-xs">{desc}</p>}
      {action}
    </div>
  );
}
