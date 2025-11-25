import React, { useState } from 'react';
import { Sparkles, Send, Loader2, Terminal } from 'lucide-react';
import { geminiService } from '../../services/gemini';
import { AICommandResponse } from '../../types';

interface AICommandPanelProps {
  onExecuteMacro: (macros: string[]) => void;
}

const AICommandPanel: React.FC<AICommandPanelProps> = ({ onExecuteMacro }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<AICommandResponse | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setLastResponse(null);
    try {
      const result = await geminiService.processCommand(input);
      setLastResponse(result);
      if (result.macros.length > 0) {
        onExecuteMacro(result.macros);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Sparkles className="text-white w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          智能控制
        </h2>
        <p className="text-gray-400 max-w-xs">
          描述你想做什么，Gemini 会自动执行相应的操作
        </p>

        {loading && (
          <div className="flex items-center gap-2 text-purple-400 animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>正在处理...</span>
          </div>
        )}

        {lastResponse && !loading && (
          <div className="mt-6 p-4 rounded-xl bg-gray-800/50 border border-gray-700 w-full max-w-md text-left">
            <div className="flex items-center gap-2 mb-2 text-green-400">
              <Terminal className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-wider">执行计划</span>
            </div>
            <p className="text-white font-medium mb-3">{lastResponse.actionDescription}</p>
            <div className="flex flex-wrap gap-2">
              {lastResponse.macros.map((m, i) => (
                <span key={i} className="px-2 py-1 bg-gray-900 rounded text-xs font-mono text-gray-300 border border-gray-700">
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto w-full max-w-md mx-auto relative">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例如：'打开记事本' 或 '播放音乐'"
          className="w-full bg-gray-800 text-white pl-4 pr-12 py-4 rounded-2xl border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-600"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="absolute right-2 top-2 bottom-2 aspect-square bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 rounded-xl flex items-center justify-center transition-colors text-white"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default AICommandPanel;
