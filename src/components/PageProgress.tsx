import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function PageProgress() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(0);

    // 快速增长到 80%
    const timer1 = setTimeout(() => setProgress(30), 50);
    const timer2 = setTimeout(() => setProgress(60), 200);
    const timer3 = setTimeout(() => setProgress(80), 500);

    // 页面完成后 100% 并淡出
    const timer4 = setTimeout(() => {
      setProgress(100);
    }, 700);
    const timer5 = setTimeout(() => {
      setVisible(false);
    }, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [location.pathname, location.search]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={location.pathname + location.search}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-[#C4A96B] via-[#E8C872] to-[#C4A96B]"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ boxShadow: '0 0 8px rgba(196, 169, 107, 0.5)' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
