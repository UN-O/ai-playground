import React from 'react';
import { motion } from 'framer-motion';

interface HighlightOverlayProps {
	rects: DOMRect[];
}

const HighlightOverlay: React.FC<HighlightOverlayProps> = ({ rects }) => {
	return (
		<div className="absolute top-0 left-0 pointer-events-none">
			{rects.map((rect, index) => (
				<motion.div
					key={index}
					className="absolute bg-yellow-300 rounded-sm"
					style={{
						left: `${rect.left}px`,
						top: `${rect.top}px`,
						width: `${rect.width}px`,
						height: `${rect.height}px`,
					}}
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 0.5, scale: 1 }}
					transition={{ duration: 0.2 }}
				/>
			))}
		</div>
	);
};

export default HighlightOverlay;
