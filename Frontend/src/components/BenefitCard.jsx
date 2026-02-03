export function BenefitCard({ benefit }) {
  return (
    <div
      className={`group relative bg-gradient-to-br ${benefit.gradient} rounded-2xl p-6 md:p-8 border-2 ${benefit.borderColor} hover:border-opacity-100 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 cursor-pointer overflow-hidden`}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity">
        {benefit.icon}
      </div>

      {/* Icon */}
      <div className={`${benefit.iconBg} w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-white mb-4 md:mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
        {benefit.icon}
      </div>

      {/* Content */}
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
        {benefit.title}
      </h3>
      <p className="text-gray-700 leading-relaxed">
        {benefit.description}
      </p>

      {/* Hover Effect */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent ${benefit.accentColor || 'via-green-500'} to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
    </div>
  );
}
