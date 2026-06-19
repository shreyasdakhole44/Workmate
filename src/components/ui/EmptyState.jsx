export default function EmptyState({ 
  icon: Icon, 
  title, 
  desc, 
  action, 
  iconBg = "bg-orange-50", 
  iconColor = "text-[#E8420A]" 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className={`w-20 h-20 rounded-full ${iconBg} flex items-center justify-center mx-auto`}>
          <Icon size={28} className={iconColor}/>
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-750 mt-4">{title}</h3>
      {desc && <p className="text-sm text-gray-400 mt-1 max-w-md">{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
