import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageProgress from '@/components/PageProgress';
import ScrollToTop from '@/components/ScrollToTop';

export function Layout() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-background text-foreground glass-bg-glow font-sans">
      <PageProgress />
      <Header />
      <main className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname + location.search}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
