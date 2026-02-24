import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Save, Sparkles, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const AISettingsModal = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState(() => {
    try {
      const savedConfig = localStorage.getItem('sentence-flow-ai-config');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        return {
          apiKey: parsedConfig.apiKey || '',
          baseUrl: parsedConfig.baseUrl || 'https://api.openai.com/v1',
          model: parsedConfig.model || 'gpt-3.5-turbo'
        };
      }
    } catch (err) {
      console.error('Failed to load AI config:', err);
    }
    return {
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-3.5-turbo'
    };
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem('sentence-flow-ai-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig({
          apiKey: parsedConfig.apiKey || '',
          baseUrl: parsedConfig.baseUrl || 'https://api.openai.com/v1',
          model: parsedConfig.model || 'gpt-3.5-turbo'
        });
      } catch (err) {
        console.error('Failed to load AI config:', err);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('sentence-flow-ai-config', JSON.stringify(config));
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  };

  const getFullUrl = (url) => {
    const clean = url.trim().replace(/\/+$/, '');
    if (clean.endsWith('/chat/completions')) {
      return clean;
    }
    return `${clean}/chat/completions`;
  };

  const handleTestConnection = async () => {
    if (!config.apiKey || !config.baseUrl || !config.model) {
      setTestResult({ success: false, message: 'Please fill in all fields before testing' });
      return;
    }

    setTestingConnection(true);
    setTestResult(null);

    try {
      const cleanBaseUrl = config.baseUrl.replace(/\/+$/, '');
      const fullUrl = cleanBaseUrl.endsWith('/chat/completions') ? cleanBaseUrl : `${cleanBaseUrl}/chat/completions`;

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      await response.json();
      setTestResult({ success: true, message: 'Connection successful!' });

    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTestingConnection(false);
      setTimeout(() => {
        setTestResult(null);
      }, 3000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 w-[95%] md:w-full max-w-lg rounded-xl shadow-2xl border border-slate-700 flex flex-col max-h-[85vh] mx-4"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles size={20} className="text-yellow-400" />
              AI Configuration
            </h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </motion.button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  API Key (密钥)
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    placeholder="sk-xxxxxxxx..."
                    className="w-full px-4 py-2.5 pr-10 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  API Address (接口地址)
                </label>
                <input
                  type="text"
                  value={config.baseUrl}
                  onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                />
                <div className="mt-1.5 space-y-1">
                  <p className="text-xs text-slate-500">
                    Examples: https://api.openai.com/v1, https://api.deepseek.com/v1
                  </p>
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-slate-400 mt-0.5">Preview:</span>
                    <code className="text-xs text-blue-400 bg-slate-800/50 px-2 py-1 rounded break-all">
                      {getFullUrl(config.baseUrl)}
                    </code>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Model Name (模型名称)
                </label>
                <input
                  type="text"
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  placeholder="gpt-3.5-turbo"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Examples: gpt-3.5-turbo, deepseek-chat, gemini-pro
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 px-6 py-4">
            <div className="flex justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testingConnection ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <Save size={18} />
                Save Configuration
              </motion.button>
            </div>

            <AnimatePresence>
              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`mt-3 px-4 py-2 rounded-lg flex items-center gap-2 text-sm ${
                    testResult.success
                      ? 'bg-green-900/50 text-green-200 border border-green-700'
                      : 'bg-red-900/50 text-red-200 border border-red-700'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  <span>{testResult.message}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-green-600 text-white rounded-lg shadow-xl z-[60] flex items-center gap-2"
              >
                <Save size={18} />
                Configuration saved!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AISettingsModal;
