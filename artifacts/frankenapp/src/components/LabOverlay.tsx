import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MutationLab } from '@/components/MutationLab/MutationLab';

interface LabOverlayProps {
  open: boolean;
  onClose: () => void;
  onReplayIntro?: () => void;
}

export function LabOverlay({ open, onClose, onReplayIntro }: LabOverlayProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] bg-[#090909] flex items-center justify-center"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-[10000] border-2 border-[#2A2015] bg-[#1E1C18] text-[#E8DDC4] font-mono px-4 py-2 text-sm font-bold tracking-widest hover:bg-[#17C9C2] hover:text-[#090909] transition-colors hover:border-[#17C9C2]"
            data-testid="button-close-lab"
          >
            ✕ EXIT LAB
          </button>

          <MutationLab onReplayIntro={onReplayIntro} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
