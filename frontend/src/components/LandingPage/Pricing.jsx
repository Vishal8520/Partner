// components/Pricing.jsx
import { motion } from "framer-motion";
import {
  SparklesIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/solid';

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "0",
      duration: "/month",
      features: [
        "Basic GSD Access",
        "10 Ralph Loop builds/month",
        "CodeRabbit Lite",
        "Community Support",
        "Basic Analytics"
      ],
      icon: AcademicCapIcon,
      popular: false
    },
    {
      name: "Partner Pro",
      price: "199",
      duration: "/month",
      features: [
        "Full GSD Suite",
        "Unlimited Ralph Loop",
        "Detailed Ralph Loop Logs",
        "Advanced CodeRabbit",
        "Detailed Analytics",
        "Priority Support",
        "Team Progress Tracking"
      ],
      icon: RocketLaunchIcon,
      popular: true
    },
    {
      name: "Enterprise Engineering",
      price: "~20k",
      duration: "/year",
      features: [
        "All Pro Features",
        "Full Team Access",
        "Dedicated Success Manager",
        "Custom API Integrations",
        "Deep Progress Reports",
        "Custom Domains",
        "Department-level Analytics"
      ],
      icon: SparklesIcon,
      popular: false
    }
  ];

  return (
    <div className="min-h-screen px-4 py-24 bg-gradient-to-br from-partner-dark-slate via-partner-blue to-partner-dark-slate">
      <motion.section
        id="pricing"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl relative scroll-mt-24"
      >
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block p-4 mb-6 bg-gradient-to-r from-partner-blue to-partner-dark-slate border border-partner-bronze/30 rounded-xl"
          >
            <CurrencyDollarIcon className="w-12 h-12 text-partner-bronze" />
          </motion.div>
          <h1 className="mb-4 text-4xl font-bold text-transparent md:text-5xl bg-gradient-to-r from-partner-bronze to-partner-porcelain bg-clip-text">
            Simple, Transparent Pricing
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-partner-slate">
            Start building smarter with AI-powered engineering tools. Upgrade anytime, cancel anytime.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`relative p-8 border rounded-2xl backdrop-blur-lg ${plan.popular
                ? 'border-partner-bronze bg-gradient-to-b from-partner-blue/50 to-partner-dark-slate/30'
                : 'border-partner-slate/30 bg-partner-blue/20'
                }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 px-4 py-1 text-sm font-semibold bg-partner-bronze text-partner-dark-slate rounded-bl-lg">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <plan.icon className={`w-12 h-12 ${plan.popular ? 'text-partner-bronze' : 'text-partner-slate'
                  }`} />
              </div>
              <h2 className="mb-2 text-3xl font-bold text-white">{plan.name}</h2>
              <div className="flex items-end mb-6 gap-1.5">
                <span className="text-4xl font-bold text-transparent bg-gradient-to-r from-partner-bronze to-partner-porcelain bg-clip-text">
                  ₹{plan.price}
                </span>
                <span className="text-partner-slate">{plan.duration}</span>
              </div>

              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full mt-8 py-3 rounded-lg font-semibold transition-all ${plan.popular
                ? 'bg-gradient-to-r text-partner-dark-slate from-partner-bronze to-[#f3cb87] hover:brightness-105'
                : 'bg-partner-slate hover:bg-partner-dark-slate text-white'
                }`}>
                {plan.name === 'Starter' ? 'Get Started' : 'Choose Plan'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <motion.div
          className="p-8 mt-20 border bg-partner-blue/30 backdrop-blur-lg rounded-2xl border-partner-slate/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="mb-8 text-3xl font-bold text-center text-partner-porcelain">Frequently Asked Questions</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                question: "Can I switch plans later?",
                answer: "Yes, you can upgrade or downgrade your plan at any time."
              },
              {
                question: "Do you offer district discounts?",
                answer: "We offer special pricing for large educational institutions and school districts. Contact our sales team."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards and PayPal."
              },
              {
                question: "Is there a free trial?",
                answer: "The Starter plan is completely free forever. Paid plans come with a 14-day trial."
              }
            ].map((faq, idx) => (
              <div key={idx} className="p-6 border rounded-xl border-partner-slate/30">
                <h3 className="text-lg font-semibold text-partner-porcelain">{faq.question}</h3>
                <p className="mt-2 text-partner-slate">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default Pricing;