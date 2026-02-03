export function StepCard({ step, index }) {
  return (
    <div className="relative">
      {/* Step Number Badge */}
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg z-10 border-4 border-white">
        {step.number}
      </div>

      <div className={`bg-gradient-to-br ${step.gradient} rounded-2xl p-8 md:p-10 border-2 border-gray-200 hover:border-green-500 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2 h-full relative overflow-hidden group`}>
        {/* Background Icon */}
        <div className="absolute bottom-0 right-0 w-40 h-40 opacity-5 group-hover:opacity-10 transition-opacity transform translate-x-8 translate-y-8">
          {step.icon}
        </div>

        {/* Icon */}
        <div className={`${step.iconBg} w-20 h-20 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10`}>
          {step.icon}
        </div>

        {/* Content */}
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 relative z-10">
          {step.title}
        </h3>
        <p className="text-gray-700 leading-relaxed text-lg relative z-10">
          {step.description}
        </p>
      </div>
    </div>
  );
}
