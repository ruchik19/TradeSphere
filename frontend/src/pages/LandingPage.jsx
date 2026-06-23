import { Link } from 'react-router-dom';
import { 
  TrendingUp, ShieldCheck, Activity, Bot, 
  Briefcase, BookOpen, ArrowRight, CheckCircle2 
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Navigation Bar */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-sm">
            <TrendingUp size={20} strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight leading-none block">TradeSphere</span>
            <span className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase">Smart Investing</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How it works</a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/auth" className="text-sm font-medium text-slate-700 hover:text-slate-900 hidden sm:block">
            Log in
          </Link>
          <Link to="/auth" className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition-all shadow-sm">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Content */}
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium">
            <Bot size={16} />
            <span>AI-powered market insights</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Invest smarter. <br/>
            <span className="text-emerald-500">Grow with confidence.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-xl leading-relaxed">
            Track your holdings, trade in real time, and get personalized AI advice — all in one premium, paper-trading-friendly platform built for modern Indian investors.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link to="/auth" className="w-full sm:w-auto bg-emerald-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2">
              Start investing free <ArrowRight size={18} />
            </Link>
            <a href="#features" className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-full font-semibold hover:bg-slate-50 transition-all text-center">
              See features
            </a>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500 font-medium pt-4">
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-500" /> Bank-grade security</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> No credit card needed</span>
          </div>
        </div>

        {/* Right Content / Mockup Card */}
        <div className="flex-1 w-full max-w-lg relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-transparent blur-3xl opacity-50 rounded-full"></div>
          <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
            <p className="text-sm font-medium text-slate-500 mb-1">Total portfolio value</p>
            <div className="flex items-end justify-between mb-8">
              <h3 className="text-4xl font-bold text-slate-900">₹1,24,320.50</h3>
              <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-sm font-bold">+12.4% YTD</span>
            </div>
            
            {/* Abstract Chart Representation */}
            <div className="h-32 w-full bg-gradient-to-t from-emerald-50 to-transparent border-b-2 border-emerald-400 mb-6 relative overflow-hidden">
              <svg className="absolute w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,80 L20,70 L40,85 L60,50 L80,60 L100,30" fill="none" stroke="#34d399" strokeWidth="3" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {['RELIANCE', 'TCS', 'INFY'].map((stock, i) => (
                <div key={stock} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 mb-1">{stock}</p>
                  <p className={`text-sm font-bold ${i === 2 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {i === 2 ? '-0.6%' : '+2.4%'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="bg-white py-24 border-t border-slate-200">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Everything you need to invest with confidence</h2>
          <p className="text-lg text-slate-600 mb-16">Premium tools that used to belong to professionals — now right in your browser.</p>
          
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              { icon: <Briefcase/>, title: "Unified Portfolio", desc: "Track your virtual stocks in one beautifully designed dashboard." },
              { icon: <TrendingUp/>, title: "Real-time Markets", desc: "Live prices, trending tickers, and instant Buy/Sell execution." },
              { icon: <Activity/>, title: "AI Portfolio Analyzer", desc: "Scan your holdings for sector concentration and get diversification tips." },
              { icon: <BookOpen/>, title: "Jargon Simplifier", desc: "Highlight any complex financial term and let AI explain it simply." },
              { icon: <ShieldCheck/>, title: "Risk-Free Trading", desc: "Test your strategies in the live market without losing a single rupee." },
              { icon: <Bot/>, title: "Smart Watchlists", desc: "Monitor your favorite Indian equities and stay ahead of the curve." }
            ].map((feat, idx) => (
              <div key={idx} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-16 text-center tracking-tight">Start in three simple steps</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Create your account", desc: "Sign up in under a minute. No paperwork, no KYC, no hassle." },
              { num: "02", title: "Build your portfolio", desc: "Hit the market and start paper-trading instantly with ₹1,00,000 in virtual cash." },
              { num: "03", title: "Grow with AI insights", desc: "Run your portfolio through our AI engine to optimize your long-term strategy." }
            ].map((step) => (
              <div key={step.num} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <span className="text-emerald-500 font-bold text-lg mb-4 block">{step.num}</span>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="bg-slate-900 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Ready to take control of your investments?</h2>
              <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">Join the next generation of investors using TradeSphere to make smarter decisions every day in the Indian market.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/auth" className="bg-emerald-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2">
                  Get started free <ArrowRight size={18} />
                </Link>
                <Link to="/auth" className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-all text-center">
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <TrendingUp size={20} className="text-emerald-500" />
            TradeSphere <span className="text-slate-400 font-normal text-sm ml-2">© 2026</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500 font-medium">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;