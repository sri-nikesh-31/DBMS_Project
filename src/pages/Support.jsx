import { Mail, Phone, MessageSquare, HelpCircle } from 'lucide-react';

const Support = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">How can we help?</h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">We're here to assist you with any questions or concerns you might have about our products or your order.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
          <div className="w-14 h-14 bg-indigo-900/30 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
             <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Live Chat</h3>
          <p className="text-slate-400 text-sm mb-6">Chat with our friendly support team in real-time.</p>
          <button className="text-indigo-400 font-semibold hover:text-indigo-300">Start Chatting</button>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
          <div className="w-14 h-14 bg-indigo-900/30 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
             <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Email Us</h3>
          <p className="text-slate-400 text-sm mb-6">Send us an email and we'll respond within 24 hours.</p>
          <a href="mailto:support@aura.com" className="text-indigo-400 font-semibold hover:text-indigo-300">support@aura.com</a>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
          <div className="w-14 h-14 bg-indigo-900/30 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
             <Phone className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Call Us</h3>
          <p className="text-slate-400 text-sm mb-6">Available Mon-Fri, 9am-6pm EST for urgent concerns.</p>
          <a href="tel:+18001234567" className="text-indigo-400 font-semibold hover:text-indigo-300">+1 (800) 123-4567</a>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 md:p-12 border border-slate-800 shadow-xl">
        <div className="flex items-center mb-8">
          <HelpCircle className="w-8 h-8 text-indigo-500 mr-4" />
          <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
        </div>
        
        <div className="space-y-6">
           <div>
             <h4 className="text-lg font-semibold text-white mb-2">What is your return policy?</h4>
             <p className="text-slate-400 leading-relaxed text-sm">We offer a 30-day money-back guarantee for all unused items in their original packaging. Simply contact support to generate a return label.</p>
           </div>
           <div>
             <h4 className="text-lg font-semibold text-white mb-2">How long does shipping take?</h4>
             <p className="text-slate-400 leading-relaxed text-sm">Standard shipping usually takes 3-5 business days. Expedited options are available at checkout. You can always track your order in your profile.</p>
           </div>
           <div>
             <h4 className="text-lg font-semibold text-white mb-2">Do you ship internationally?</h4>
             <p className="text-slate-400 leading-relaxed text-sm">Currently, we only ship within the United States and Canada. We are working on expanding our logistics to Europe later this year.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
