import { useState } from 'react';
import { Upload } from 'lucide-react';
import AvatarViewer from '../components/AvatarViewer';
import FitAssistant from '../components/FitAssistant';

export default function Measure() {
    const [frontImg, setFrontImg] = useState(null);
    const [sideImg, setSideImg] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e, setType) => {
        if (e.target.files && e.target.files[0]) {
            setType(e.target.files[0]);
        }
    };

    const analyze = async () => {
        if (!frontImg || !sideImg) return alert("Please upload both images");
        setLoading(true);

        const formData = new FormData();
        formData.append('front_image', frontImg);
        formData.append('side_image', sideImg);

        try {
            const res = await fetch('http://localhost:8000/analyze-measurements', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.status === 'success') {
                setResults(data.measurements);
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Error connectivity to AI Engine");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center p-8 overflow-hidden">
            <div className="glass-panel p-8 w-full max-w-7xl grid grid-cols-12 gap-8 h-[90vh]">

                {/* Left Panel: Inputs & Data */}
                <div className="col-span-4 flex flex-col gap-6">
                    <div>
                        <h2 className="title-gradient text-3xl mb-2">SCAN BODY</h2>
                        <p className="text-gray-400 text-sm">Upload front/side photos with a credit card reference.</p>
                    </div>

                    <div className="space-y-4">
                        <UploadBox label="FRONT PHOTO" file={frontImg} onChange={(e) => handleFileChange(e, setFrontImg)} />
                        <UploadBox label="SIDE PHOTO" file={sideImg} onChange={(e) => handleFileChange(e, setSideImg)} />
                    </div>

                    <button
                        onClick={analyze}
                        disabled={loading}
                        className="btn-primary w-full py-4 text-xl"
                    >
                        {loading ? 'ANALYZING...' : 'GENERATE ALGORITHM'}
                    </button>

                    {results && (
                        <div className="grid grid-cols-2 gap-3 mt-auto overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                            {Object.entries(results).map(([key, val]) => (
                                <div key={key} className="bg-white/5 p-3 rounded border border-white/5">
                                    <div className="text-gray-500 text-xs uppercase tracking-wider">{key}</div>
                                    <div className="text-xl font-mono text-cyan-300">{val.toFixed(1)}"</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Panel: 3D Visualization */}
                <div className="col-span-8 bg-black/40 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col">
                    <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                        <span className="text-cyan-400 font-bold mr-2">●</span>
                        <span className="text-white text-sm font-bold tracking-widest">DIGITAL TWIN V1.0</span>
                    </div>

                    {results ? (
                        <div className="flex-1 w-full h-full relative cursor-move">
                            <AvatarViewer measurements={results} />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                            <div className="w-32 h-32 border-4 border-dashed border-gray-500 rounded-full animate-spin-slow mb-4"></div>
                            <div className="text-2xl font-bold tracking-[0.5em]">AWAITING DATA</div>
                        </div>
                    )}
                </div>
            </div>
            <FitAssistant measurements={results} />
        </div>
    );
}

function UploadBox({ label, file, onChange }) {
    return (
        <div className="border border-dashed border-gray-600 rounded-xl p-6 text-center hover:bg-white/5 transition group cursor-pointer relative overflow-hidden">
            <label className="cursor-pointer block relative z-10">
                <Upload className="mx-auto mb-3 text-gray-500 group-hover:text-cyan-400 transition" size={32} />
                <div className="font-bold text-gray-300 tracking-wider mb-1">{label}</div>
                <div className="text-xs text-gray-500">{file ? file.name : "DRAG & DROP OR CLICK"}</div>
                <input type="file" className="hidden" onChange={onChange} accept="image/*" />
            </label>
            {file && <div className="absolute inset-0 bg-cyan-900/20 z-0"></div>}
        </div>
    );
}
