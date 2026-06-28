import Link from "next/link";
import { Shield, AlertTriangle, ArrowRight, Gavel, FileSearch, LayoutGrid } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-crisis-black flex flex-col">
      <header className="border-b border-border-steel px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-redline rounded flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-cold-white font-grotesk font-bold">CrisisProof</span>
            <span className="text-muted-text text-xs font-mono ml-2 hidden sm:inline">REDLINE COMMAND</span>
          </div>
        </div>
        <Link href="/app" className="flex items-center gap-2 px-4 py-2 bg-redline/10 border border-redline/30 text-redline rounded text-sm font-inter hover:bg-redline/20 transition-colors">
          Open Command <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-redline/10 border border-redline/30 rounded-full text-xs font-mono text-redline mb-8">
          <span className="w-1.5 h-1.5 bg-redline rounded-full animate-pulse" />
          Powered by GenLayer Intelligent Contracts
        </div>
        <h1 className="text-4xl md:text-6xl font-grotesk font-bold text-cold-white max-w-3xl leading-tight mb-6">
          CrisisProof decides what action is{" "}
          <span className="text-redline">defensible</span> when truth is incomplete.
        </h1>
        <p className="text-lg text-muted-text font-inter max-w-2xl mb-10 leading-relaxed">
          A decentralized crisis response judgment protocol. Submit evidence, compare response options, and let GenLayer consensus produce a canonical, confidence-scored crisis verdict — stored permanently on-chain.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/app/create" className="flex items-center gap-2 px-6 py-3 bg-redline hover:bg-redline/80 text-white rounded font-inter font-medium transition-colors">
            Create Crisis Case <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/app" className="flex items-center gap-2 px-6 py-3 border border-border-steel text-cold-white rounded font-inter hover:bg-deep-slate transition-colors">
            <Shield className="w-4 h-4" /> Open Command Room
          </Link>
        </div>
      </section>

      <section className="border-t border-border-steel px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono text-muted-text uppercase tracking-wider text-center mb-10">Five Command Zones</p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { icon: AlertTriangle, label: "Crisis Timeline Rail", color: "text-redline", bg: "bg-redline/10 border-redline/20" },
              { icon: FileSearch, label: "Evidence Wall", color: "text-legal-blue", bg: "bg-legal-blue/10 border-legal-blue/20" },
              { icon: LayoutGrid, label: "Response Options", color: "text-emergency-amber", bg: "bg-emergency-amber/10 border-emergency-amber/20" },
              { icon: Shield, label: "Risk Siren", color: "text-warning-rose", bg: "bg-warning-rose/10 border-warning-rose/20" },
              { icon: Gavel, label: "Verdict Chamber", color: "text-trust-green", bg: "bg-trust-green/10 border-trust-green/20" },
            ].map(({ icon: Icon, label, color, bg }) => (
              <div key={label} className={`border rounded-lg p-4 text-center ${bg}`}>
                <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
                <p className="text-xs font-mono text-cold-white/80">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border-steel px-6 py-12 bg-panel-charcoal">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-mono text-muted-text uppercase tracking-wider mb-6 text-center">CrisisProof answers</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {["What happened?","What evidence exists?","What options do we have?","What is the harm?","What action is defensible?"].map((q) => (
              <div key={q} className="bg-deep-slate border border-border-steel rounded p-3 text-xs text-cold-white/80 font-inter text-center">{q}</div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border-steel px-6 py-4 text-center">
        <p className="text-xs text-muted-text font-mono">CrisisProof Protocol — GenLayer StudioNet — Evidence-backed. Risk-aware. Publicly auditable.</p>
      </footer>
    </main>
  );
}
