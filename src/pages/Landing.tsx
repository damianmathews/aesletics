import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <span className="text-3xl">Æ</span>
            <span>Aesletics</span>
          </Link>
          <Link
            to="/app"
            className="px-6 py-3 rounded-button font-semibold transition-all hover:scale-105"
            style={{
              background: 'var(--gradient-primary)',
              color: 'white',
            }}
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* Hero Section with Animated Background */}
      <motion.section
        ref={heroRef}
        style={{ opacity, scale }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="absolute inset-0 bg-pattern-dots opacity-30" />

        {/* Floating gradient orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--gradient-primary)' }}
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--gradient-secondary)' }}
        />

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-2 rounded-full glass mb-6">
              <span style={{ color: 'var(--color-accent)' }} className="font-semibold">
                ⚡ The gamified system for total well-being
              </span>
            </div>

            <h1 className="font-display font-bold mb-6 leading-tight" style={{
              fontSize: 'clamp(3rem, 8vw, 7rem)',
              color: 'var(--color-text)'
            }}>
              Become<br />
              <span style={{
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                formidable.
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Build the body, mind, and discipline you respect.<br />
              <span style={{ color: 'var(--color-accent)' }}>One quest at a time.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/app"
                className="group px-8 py-4 rounded-button font-display font-semibold text-lg transition-all hover:scale-105 hover:shadow-2xl relative overflow-hidden"
                style={{
                  background: 'var(--gradient-primary)',
                  color: 'white',
                }}
              >
                <span className="relative z-10">Start Free</span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                     style={{ background: 'var(--gradient-secondary)' }} />
              </Link>
              <Link
                to="/app/quests"
                className="px-8 py-4 rounded-button glass font-display font-semibold text-lg transition-all hover:scale-105"
                style={{ color: 'var(--color-text)' }}
              >
                Explore Quests →
              </Link>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-wrap justify-center gap-8 mt-16"
            >
              {[
                { value: '150+', label: 'Quests' },
                { value: '12', label: 'Categories' },
                { value: '100%', label: 'Offline' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold tabular-nums mb-1" style={{
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {stat.value}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="font-display text-5xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
              Why Aesletics?
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              A complete system for building the life you respect
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Do Hard Things',
                description: 'Standards over slogans. Real proof. Real points. Track with timers, counters, photos, and logs.'
              },
              {
                icon: '📊',
                title: 'See Progress Instantly',
                description: 'XP, levels, and streaks you can feel. Watch your stats climb with every quest completed.'
              },
              {
                icon: '🎯',
                title: 'Total Well-Being',
                description: '12 categories from fitness and conditioning to intelligence, discipline, and creativity.'
              },
              {
                icon: '🔥',
                title: 'Streak System',
                description: 'Build momentum with daily streaks. Grace periods keep you going. Bonus XP for consistency.'
              },
              {
                icon: '🎨',
                title: 'Beautiful & Fast',
                description: 'Clean, modern UI you want to open. Dark mode. Smooth animations. Zero bloat.'
              },
              {
                icon: '🔒',
                title: '100% Private',
                description: 'All data stays on your device. No servers. No tracking. No subscriptions. Ever.'
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="p-8 rounded-card glass transition-all"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="font-display text-xl font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-pattern-grid opacity-20" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="font-display text-5xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
              How it works
            </h2>
            <p className="text-xl" style={{ color: 'var(--color-text-secondary)' }}>
              Simple. Direct. Effective.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '1', title: 'Pick Quests', description: 'Choose from 150+ curated challenges across fitness, mind, discipline, and life.' },
              { step: '2', title: 'Do The Reps', description: 'Complete quests with proof. Timers, counters, photos, or text logs.' },
              { step: '3', title: 'Level Up', description: 'Earn XP, build streaks, unlock badges. Watch your stats climb.' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div
                  className="text-8xl font-bold absolute -top-8 -left-4 opacity-10 tabular-nums"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {item.step}
                </div>
                <div className="relative z-10 p-8 rounded-card glass">
                  <h3 className="font-display text-2xl font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'var(--gradient-mesh)' }} />
        <div className="absolute inset-0 bg-pattern-dots opacity-20" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <h2 className="font-display text-5xl md:text-6xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
            Ready to become<br />
            <span style={{
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              formidable?
            </span>
          </h2>
          <p className="text-xl mb-10" style={{ color: 'var(--color-text-secondary)' }}>
            Start tracking your quests today. No signup. No credit card. No BS.
          </p>
          <Link
            to="/app"
            className="inline-block px-12 py-5 rounded-button font-display font-bold text-xl transition-all hover:scale-105 hover:shadow-2xl"
            style={{
              background: 'var(--gradient-primary)',
              color: 'white',
            }}
          >
            Launch Aesletics
          </Link>
          <p className="mt-6 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            100% free • No account required • Works offline
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold">Æ</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Aesletics — aesthetic discipline meets athletic execution.
              </span>
            </div>
            <div className="flex gap-6">
              <Link to="/app" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-secondary)' }}>
                App
              </Link>
              <Link to="/app/quests" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-secondary)' }}>
                Quests
              </Link>
              <Link to="/app/settings" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-secondary)' }}>
                Settings
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
