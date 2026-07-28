import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const response = await fetch('https://formspree.io/f/mykrozpy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, message })
      });
      
      if (response.ok) {
        setStatus('success');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold text-slate-900 mb-2">제휴 문의</h2>
        <p className="text-sm text-slate-500 mb-6 font-medium">서비스 제휴 및 기타 문의사항을 남겨주시면 빠르게 답변해 드리겠습니다.</p>
        
        {status === 'success' ? (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 text-center flex flex-col items-center py-8">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
              <Send className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-bold mb-1">문의가 접수되었습니다!</h3>
            <p className="text-sm font-medium">빠른 시일 내에 답변 드리겠습니다.</p>
            <button 
              onClick={() => {
                onClose();
                setStatus('idle');
              }}
              className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-slate-800 transition-colors"
            >
              닫기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">이메일 주소</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-400"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">문의 내용</label>
              <textarea
                id="message"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="문의하실 내용을 입력해주세요..."
                rows={4}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-400 resize-none"
              ></textarea>
            </div>
            
            {status === 'error' && (
              <p className="text-xs text-red-500 font-medium">오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
            )}
            
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center"
            >
              {status === 'submitting' ? '전송 중...' : '문의하기'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
