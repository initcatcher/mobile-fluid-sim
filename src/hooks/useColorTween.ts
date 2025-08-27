import { useState, useEffect } from 'react';
import { animate, cubicBezier } from 'framer-motion';

interface ColorValue {
	r: number;
	g: number;
	b: number;
}

interface ColorTween {
	current: ColorValue;
	set: (newColor: ColorValue) => void;
}

export const useColorTween = (
	initialColor: ColorValue,
	duration: number = 500
): ColorTween => {
	const [current, setCurrent] = useState<ColorValue>(initialColor);
	const [animationController, setAnimationController] = useState<any>(null);

	const set = (newColor: ColorValue) => {
		// Stop any existing animation
		if (animationController) {
			animationController.stop();
		}

		const startColor = { ...current };
		
		// Create new animation
		const controls = animate(0, 1, {
			duration: duration / 1000, // Convert to seconds for Framer Motion
			ease: cubicBezier(0.25, 0.46, 0.45, 0.94), // cubicOut equivalent
			onUpdate: (progress) => {
				setCurrent({
					r: startColor.r + (newColor.r - startColor.r) * progress,
					g: startColor.g + (newColor.g - startColor.g) * progress,
					b: startColor.b + (newColor.b - startColor.b) * progress
				});
			}
		});

		setAnimationController(controls);
	};

	// Cleanup animation on unmount
	useEffect(() => {
		return () => {
			if (animationController) {
				animationController.stop();
			}
		};
	}, [animationController]);

	return {
		current,
		set
	};
};