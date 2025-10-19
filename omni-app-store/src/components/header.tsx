import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
    return (
        <header className="glassmorphism fixed w-full top-0 z-50">
            <div className="container mx-auto px-4 py-3">
                <nav className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Image 
                            src="/vercel.svg" 
                            alt="OmniFactory Logo" 
                            width={40} 
                            height={40}
                        />
                        <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent">
                            OMNIFACTORY
                        </span>
                    </div>
                    <div className="flex items-center space-x-8">
                        <Link href="/apps" className="nav-link">
                            Browse Apps
                        </Link>
                        <Link href="/dashboard" className="nav-link">
                            Dashboard
                        </Link>
                        <button className="btn-primary">
                            Sign In
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    );
}