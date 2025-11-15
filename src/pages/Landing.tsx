import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F7F9] to-white">
      {/* Hero Section */}
      <header className="px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="font-display text-2xl font-bold">Æ</div>
          <Link
            to="/app"
            className="px-6 py-3 rounded-button bg-[#FF6A55] text-white font-medium hover:bg-[#ff5544] transition-colors"
          >
            Launch App
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="py-20 text-center"
        >
          <h1 className="font-display text-6xl md:text-8xl font-bold mb-6 leading-tight">
            Become<br />formidable.
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Build the body, mind, and discipline you respect.<br />
            One quest at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/app"
              className="px-8 py-4 rounded-button bg-[#FF6A55] text-white font-display font-semibold text-lg hover:bg-[#ff5544] transition-all hover:shadow-lift"
            >
              Start Free
            </Link>
            <Link
              to="/app/quests"
              className="px-8 py-4 rounded-button border-2 border-gray-300 font-display font-semibold text-lg hover:border-gray-400 transition-all"
            >
              See the Quests
            </Link>
          </div>
        </motion.section>

        {/* Value Props */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="py-20 grid md:grid-cols-3 gap-12"
        >
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="font-display text-xl font-semibold mb-2">Do hard things</h3>
            <p className="text-gray-600">
              Standards over slogans. Real proof. Real points.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="font-display text-xl font-semibold mb-2">See progress instantly</h3>
            <p className="text-gray-600">
              XP, streaks, and levels you can feel.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="font-display text-xl font-semibold mb-2">Clean, fast, beautiful</h3>
            <p className="text-gray-600">
              A tool you want to open.
            </p>
          </div>
        </motion.section>

        {/* How it works */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="py-20"
        >
          <h2 className="font-display text-4xl font-bold text-center mb-16">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-card p-8 shadow-soft">
              <div className="text-3xl mb-4">1</div>
              <h3 className="font-display text-xl font-semibold mb-2">Pick quests</h3>
              <p className="text-gray-600">
                Choose from 150+ curated challenges across fitness, mind, and discipline.
              </p>
            </div>
            <div className="bg-white rounded-card p-8 shadow-soft">
              <div className="text-3xl mb-4">2</div>
              <h3 className="font-display text-xl font-semibold mb-2">Do the reps</h3>
              <p className="text-gray-600">
                Complete quests with proof: timers, counters, photos, or text logs.
              </p>
            </div>
            <div className="bg-white rounded-card p-8 shadow-soft">
              <div className="text-3xl mb-4">3</div>
              <h3 className="font-display text-xl font-semibold mb-2">Level up</h3>
              <p className="text-gray-600">
                Earn XP, build streaks, unlock badges, and watch your stats climb.
              </p>
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="py-20 text-center"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Ready to get more jobs?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Live in 48 hours. No servers. No subscriptions.
          </p>
          <Link
            to="/app"
            className="inline-block px-8 py-4 rounded-button bg-[#FF6A55] text-white font-display font-semibold text-lg hover:bg-[#ff5544] transition-all hover:shadow-lift"
          >
            Start Free
          </Link>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
          <div className="font-display text-2xl mb-4">Æ</div>
          <p className="text-sm">Aesletics — aesthetic discipline meets athletic execution.</p>
        </div>
      </footer>
    </div>
  );
}
