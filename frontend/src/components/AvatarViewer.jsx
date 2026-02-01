import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, useAnimations } from '@react-three/drei';

// A default ReadyPlayerMe avatar
const AVATAR_URL = "https://models.readyplayer.me/64a6e0e85a6a5f70a7d519b5.glb";

function Model({ measurements }) {
    const group = useRef();
    const { scene, animations } = useGLTF(AVATAR_URL);
    const { actions } = useAnimations(animations, group);

    useEffect(() => {
        if (scene && measurements) {
            // Traverse the bone hierarchy to find key bones
            // Note: Bone names depend on the rig (Mixamo standard usually used by RPM)
            scene.traverse((object) => {
                if (object.isBone) {
                    // A simple example of "Morphing" by bone scaling
                    // In a real app, we would use Morph Targets (Shape Keys) on the mesh

                    if (object.name.includes("Spine") && measurements.waist) {
                        const scale = measurements.waist / 30.0; // Normalize against base 30"
                        object.scale.set(scale, 1, scale);
                    }

                    if (object.name.includes("Shoulder") && measurements.shoulders) {
                        const scale = measurements.shoulders / 18.0;
                        object.scale.set(scale, 1, scale);
                    }

                    if (object.name.includes("Hips") && measurements.hips) {
                        const scale = measurements.hips / 36.0;
                        object.scale.set(scale, 1, scale);
                    }
                }
            });
        }
    }, [scene, measurements]);

    return <primitive ref={group} object={scene} scale={2} position={[0, -2, 0]} />;
}

export default function AvatarViewer({ measurements }) {
    return (
        <div className="w-full h-[600px] bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden border border-white/10">
            <Canvas camera={{ position: [0, 1, 4] }}>
                <ambientLight intensity={0.7} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <Environment preset="city" />

                <Model measurements={measurements} />

                <OrbitControls minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.5} />
            </Canvas>
        </div>
    );
}
