import { motion } from "framer-motion";
import { DocumentArrowUpIcon, SparklesIcon, PresentationChartLineIcon } from "@heroicons/react/24/outline";

export default function HowItWorks() {
  const steps = [
    {
      id: 1,
      name: "Upload Material",
      description: "Feed your existing PRDs, technical specs, or high-level goals into the Partner engine.",
      icon: DocumentArrowUpIcon,
    },
    {
      id: 2,
      name: "AI Processing",
      description: "The AI converts your material into an interactive tree checklist and custom curriculum structure.",
      icon: SparklesIcon,
    },
    {
      id: 3,
      name: "Teach & Track",
      description: "Run your build while Partner generates live feedback, tracks progress, and iterates to perfection.",
      icon: PresentationChartLineIcon,
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-partner-dark-slate scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-transparent bg-gradient-to-r from-partner-bronze to-partner-porcelain bg-clip-text sm:text-4xl">
            How Partner Works
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-partner-slate">
            Three simple steps to transform your classroom experience.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-partner-blue via-partner-bronze to-partner-blue" aria-hidden="true" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((step, index) => (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 rounded-full bg-partner-blue border-4 border-partner-dark-slate flex items-center justify-center relative z-10 shadow-xl group-hover:border-partner-bronze transition-colors duration-300">
                  <step.icon className="w-10 h-10 text-partner-bronze" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-partner-bronze text-partner-dark-slate font-bold flex items-center justify-center border-2 border-partner-dark-slate">
                    {step.id}
                  </div>
                </div>
                
                <h3 className="mt-6 text-xl font-bold text-white group-hover:text-partner-porcelain transition-colors">
                  {step.name}
                </h3>
                <p className="mt-2 text-base text-partner-slate px-4">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
