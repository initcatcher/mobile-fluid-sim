import { Github } from 'lucide-react';

const GitHubLink: React.FC = () => {
	return (
		<a
			href="https://github.com/shajidhasan/mobile-fluid-sim"
			target="_blank"
			rel="noopener noreferrer"
			className="fixed top-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gray-800/80 backdrop-blur-sm transition-all hover:scale-110 hover:bg-gray-700/90 focus:ring-2 focus:ring-white/20 focus:outline-none"
			aria-label="View on GitHub"
		>
			<Github className="h-6 w-6 text-white" />
		</a>
	);
};

export default GitHubLink;