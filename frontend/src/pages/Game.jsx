import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Game Constants
const LANE_WIDTH = 3;
const SPEED = 15;
const JUMP_FORCE = 8;
const GRAVITY = 20;

function Player({ position, onGameOver }) {
    const mesh = useRef();
    const [lane, setLane] = useState(0); // -1, 0, 1
    const [yVelocity, setYVelocity] = useState(0);
    const [isJumping, setIsJumping] = useState(false);
    const [currentPos, setCurrentPos] = useState([0, 0.5, 0]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'a' || e.key === 'ArrowLeft') setLane(l => Math.max(l - 1, -1));
            if (e.key === 'd' || e.key === 'ArrowRight') setLane(l => Math.min(l + 1, 1));
            if (e.key === ' ' && !isJumping) {
                setYVelocity(JUMP_FORCE);
                setIsJumping(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isJumping]);

    useFrame((state, delta) => {
        if (!mesh.current) return;

        // Lateral Movement (Lerp)
        const targetX = lane * LANE_WIDTH;
        mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, targetX, delta * 10);

        // Vertical Movement (Physics)
        let newY = mesh.current.position.y + yVelocity * delta;
        let newVel = yVelocity - GRAVITY * delta;

        if (newY <= 0.5) {
            newY = 0.5;
            newVel = 0;
            setIsJumping(false);
        }

        mesh.current.position.y = newY;
        setYVelocity(newVel);

        // Update local state for collision check
        setCurrentPos([mesh.current.position.x, newY, 0]);
    });

    // Expose position for collision logic (hacky for React, but works for simple prototype)
    window.playerPos = currentPos;

    return (
        <mesh ref={mesh} position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="cyan" emissive="cyan" emissiveIntensity={0.5} />
        </mesh>
    );
}

function Obstacle({ position }) {
    const ref = useRef();

    useFrame((state, delta) => {
        ref.current.position.z += SPEED * delta;
        if (ref.current.position.z > 5) ref.current.position.z = -100 - Math.random() * 50;
    });

    return (
        <mesh ref={ref} position={position}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#ff0055" />
        </mesh>
    );
}

function Floor() {
    const ref = useRef();
    useFrame((state, delta) => {
        ref.current.position.z += SPEED * delta;
        if (ref.current.position.z > 10) ref.current.position.z = 0;
    });

    return (
        <group ref={ref}>
            <gridHelper args={[200, 100, 0x555555, 0x222222]} position={[0, 0, -50]} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -50]}>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="#050505" />
            </mesh>
        </group>
    );
}

export default function Game() {
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            // Collision & Score Logic Loop
            setScore(s => s + 1);

            // Simple global check (Not ideal for production but funcitonal for prototype)
            // Assuming obstacles are spawned at fixed lanes...
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-screen relative bg-black">
            <div className="absolute top-4 left-4 z-10 glass-panel p-4">
                <h2 className="text-xl font-bold text-cyan-400">CITY RUN: METRO</h2>
                <p className="text-sm text-gray-400">SCORE: {score}</p>
                <p className="text-xs text-gray-500 mt-2">A / D to Move • SPACE to Jump</p>
            </div>

            {gameOver && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur">
                    <h1 className="text-5xl font-bold text-red-500 mb-4">CRITICAL FAILURE</h1>
                </div>
            )}

            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 5, 8]} fov={60} />

                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} castShadow />
                <fog attach="fog" args={['#000', 5, 40]} />

                <Player onGameOver={() => setGameOver(true)} />

                {/* Simple Obstacle Spawner */}
                <Obstacle position={[-3, 1, -20]} />
                <Obstacle position={[0, 1, -50]} />
                <Obstacle position={[3, 1, -80]} />

                <Floor />

                <Environment preset="night" />
            </Canvas>
        </div>
    );
}
