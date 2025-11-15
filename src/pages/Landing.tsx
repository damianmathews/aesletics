import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Zap, TrendingUp, Target, Flame, Palette, Lock } from 'lucide-react';

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
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Aesletics" className="h-12 w-auto" />
          </Link>
          <Link
            to="/app"
            className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
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
        {/* Animated background with stronger gradient */}
        <div className="absolute inset-0 bg-pattern-dots opacity-40" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 70%)'
        }} />

        {/* Floating gradient orbs - gray tones */}
        <motion.div
          animate={{
            x: [0, 150, 0],
            y: [0, -150, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 150, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-20 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)' }}
        />

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-2 rounded-full glass mb-6">
              <span style={{ color: 'var(--color-accent)' }} className="font-semibold flex items-center gap-2 font-mono">
                <Zap size={16} />
                LEVEL UP YOUR ENTIRE LIFE
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

            <p className="text-xl md:text-2xl mb-4 max-w-3xl mx-auto leading-relaxed font-mono" style={{ color: 'var(--color-text-secondary)' }}>
              BUILD THE BODY, MIND, AND DISCIPLINE YOU RESPECT.
            </p>
            <p className="text-lg mb-12 max-w-2xl mx-auto" style={{ color: 'var(--color-text-tertiary)' }}>
              One quest at a time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/app"
                className="group px-8 py-4 rounded-lg font-display font-semibold text-lg transition-all hover:scale-105 hover:shadow-2xl relative overflow-hidden"
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
                className="px-8 py-4 rounded-lg glass font-display font-semibold text-lg transition-all hover:scale-105"
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
                { value: '150+', label: 'QUESTS' },
                { value: '12', label: 'CATEGORIES' },
                { value: '100%', label: 'LOCAL' },
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
                  <div className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-32 px-6 relative" style={{
        background: 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.02) 0%, transparent 60%)'
      }}>
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
            <p className="text-xl max-w-2xl mx-auto font-mono" style={{ color: 'var(--color-text-secondary)' }}>
              STOP GUESSING. START IMPROVING.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Prove your progress',
                description: 'Track every rep, every minute, every milestone. See undeniable proof of your growth.'
              },
              {
                icon: TrendingUp,
                title: 'Watch yourself evolve',
                description: 'XP, levels, and streaks that show exactly how far you\'ve come. Progress you can feel.'
              },
              {
                icon: Target,
                title: 'Build complete mastery',
                description: 'Fitness, mind, discipline, creativity—12 categories covering every dimension of excellence.'
              },
              {
                icon: Flame,
                title: 'Never break momentum',
                description: 'Build unstoppable streaks. Grace periods protect your progress. Consistency becomes automatic.'
              },
              {
                icon: Palette,
                title: 'Actually want to open it',
                description: 'An interface designed to inspire action, not overwhelm you. Every interaction feels right.'
              },
              {
                icon: Lock,
                title: 'Your data stays yours',
                description: 'Zero tracking. Zero servers. Zero subscriptions. Complete privacy, forever.'
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="p-8 rounded-xl glass transition-all"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="mb-4" style={{ color: 'var(--color-accent)' }}>
                    <Icon size={48} />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-6 relative" style={{
        background: 'radial-gradient(circle at 50% 100%, rgba(255, 255, 255, 0.02) 0%, transparent 60%)'
      }}>
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
            <p className="text-xl font-mono" style={{ color: 'var(--color-text-secondary)' }}>
              THREE STEPS TO TRANSFORMATION
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '1', title: 'Choose your path', description: 'Pick challenges that push you forward. 150+ quests across every area of life.' },
              { step: '2', title: 'Take action', description: 'Complete quests. Prove your work. Build undeniable momentum every single day.' },
              { step: '3', title: 'Become unstoppable', description: 'Watch your XP climb, streaks build, and capabilities multiply. Transformation becomes inevitable.' },
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
                  className="text-8xl font-bold absolute -top-8 -left-4 opacity-10 tabular-nums font-mono"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {item.step}
                </div>
                <div className="relative z-10 p-8 rounded-xl glass">
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
        <div className="absolute inset-0 bg-pattern-dots opacity-20" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 70%)'
        }} />

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
          <p className="text-xl mb-4 font-mono" style={{ color: 'var(--color-text-secondary)' }}>
            START BUILDING THE LIFE YOU RESPECT
          </p>
          <p className="text-sm mb-10" style={{ color: 'var(--color-text-tertiary)' }}>
            No signup. No credit card. No excuses.
          </p>
          <Link
            to="/app"
            className="inline-block px-12 py-5 rounded-lg font-display font-bold text-xl transition-all hover:scale-105 hover:shadow-2xl"
            style={{
              background: 'var(--gradient-primary)',
              color: 'white',
            }}
          >
            Launch Aesletics
          </Link>
          <p className="mt-6 text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
            100% FREE • LOCAL-FIRST • YOUR DATA STAYS YOURS
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Aesletics" className="h-8 w-auto" />
              <span style={{ color: 'var(--color-text-secondary)' }} className="font-mono text-sm">
                Aesthetic discipline meets athletic execution.
              </span>
            </div>
            <div className="flex gap-6">
              <Link to="/app" className="hover:opacity-70 transition-opacity font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                App
              </Link>
              <Link to="/app/quests" className="hover:opacity-70 transition-opacity font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Quests
              </Link>
              <Link to="/app/settings" className="hover:opacity-70 transition-opacity font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Settings
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
