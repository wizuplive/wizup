import React, { useState } from 'react';
import { Image as ImageIcon, Loader2, Download, AlertCircle } from 'lucide-react';
import { generateImageWithGemini } from '../services/geminiService';
import { ImageSize } from '../types';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>(ImageSize.SIZE_1K);
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await generateImageWithGemini(prompt, size);
      if (result) {
        setGeneratedImage(result);
      } else {
        setError("Failed to generate image. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during generation. Make sure you have selected a paid API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="create" className="py-24 bg-gradient-to-b from-black to-[#0a0a0a] border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6">
        
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-medium text-white mb-4">Create with WIZUP AI</h2>
          <p className="text-gray-400 font-light">Powered by Gemini Nano Banana Pro. Visualize your community assets instantly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
              <label className="block text-sm text-gray-400 mb-2">Describe your vision</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors h-32 resize-none"
                placeholder="A futuristic community lounge with neon lights..."
              />

              <div className="mt-6">
                <label className="block text-sm text-gray-400 mb-2">Resolution</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(ImageSize).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`py-2 rounded-lg text-sm border transition-all ${
                        size === s 
                          ? 'bg-purple-600/20 border-purple-500 text-purple-200' 
                          : 'bg-black/30 border-white/10 text-gray-500 hover:border-white/20'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading || !prompt}
                className={`w-full mt-6 py-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${
                  loading || !prompt 
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                {loading ? 'Dreaming...' : 'Generate Asset'}
              </button>
              
              {error && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-200 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              
              <p className="mt-4 text-xs text-gray-600 text-center">
                 Note: Requires a paid API key via Google AI Studio. You will be prompted to select one.
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="relative aspect-video lg:aspect-square bg-black/50 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden group">
            {generatedImage ? (
              <>
                <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                   <a 
                     href={generatedImage} 
                     download="wizup-asset.png"
                     className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white backdrop-blur-md flex items-center gap-2 transition-all"
                   >
                     <Download size={18} /> Download Asset
                   </a>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-600">
                {loading ? (
                   <div className="flex flex-col items-center gap-4">
                     <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                     <p className="text-sm font-light animate-pulse">Rendering pixels...</p>
                   </div>
                ) : (
                  <>
                    <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-sm">Your creation will appear here.</p>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ImageGenerator;