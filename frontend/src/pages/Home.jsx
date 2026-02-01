import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Camera, Gamepad2 } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                {/* 3D Background would go here */}
            </div>

            <div className="z-10 text-center glass-panel p-12">
                <h1 className="title-gradient mb-8">FITQUEST 360</h1>

                <div className="flex gap-6">
                    <MenuCard
                        icon={<Camera size={48} />}
                        title="Digital Tailor"
                        desc="AI Body Measurement"
                        onClick={() => navigate('/measure')}
                    />
                    <MenuCard
                        icon={<Gamepad2 size={48} />}
                        title="Game World"
                        desc="Play & Explore"
                        onClick={() => navigate('/game')}
                    />
                </div>
            </div>
        </div>
    );
}

function MenuCard({ icon, title, desc, onClick }) {
    return (
        <motion.div
            whileHover={{ scale: 1.1 }}
            className="bg-black/40 p-6 rounded-xl cursor-pointer border border-white/10 hover:border-cyan-400"
            onClick={onClick}
        >
            <div className="text-cyan-400 mb-4 flex justify-center">{icon}</div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-400">{desc}</p>
        </motion.div>
    );
}
