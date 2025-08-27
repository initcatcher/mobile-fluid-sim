import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PopupInfo: React.FC = () => {
	const [show, setShow] = useState(false);

	useEffect(() => {
		const showTimer = setTimeout(() => {
			setShow(true);

			const hideTimer = setTimeout(() => {
				setShow(false);
			}, 5000);

			return () => clearTimeout(hideTimer);
		}, 1000);

		return () => clearTimeout(showTimer);
	}, []);

	return (
		<AnimatePresence>
			{show && (
				<motion.div
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: 20, opacity: 0 }}
					transition={{ duration: 0.3, ease: 'easeOut' }}
					className="absolute top-1/2 z-20 -translate-y-1/2 rounded-lg bg-black/90 px-3 py-2 text-sm text-gray-100"
				>
					<p>Tilt your device to control the fluid</p>
					<p className="mt-1 text-center text-xs opacity-75">Shake to change colors!</p>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default PopupInfo;