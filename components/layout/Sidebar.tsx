"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/cn";
import {
  Shield, AlertTriangle, PlusCircle, Clock, Globe, Settings, Code2, ChevronRight
} from "lucide-react";

const nav = [
  { href: "/app", label: "Command", icon: Shield },
  { href: "/app/create", label: "New Crisis", icon: PlusCircle },
  { href: "/app/history", label: "History", icon: Clock },
  { href: "/app/settings", label: "Settings", icon: Settings },
  { href: "/app/contract", label: "Contract", icon: Code2 },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 bg-panel-charcoal border-r border-border-steel flex flex-col shrink-0">
      <div className="px-4 py-5 border-b border-border-steel">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-redline rounded flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-cold-white text-sm font-grotesk font-bold leading-none">CrisisProof</p>
            <p className="text-muted-text text-[10px] font-mono leading-none mt-0.5">REDLINE COMMAND</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded text-sm font-inter transition-colors group",
                active
                  ? "bg-redline/15 text-cold-white border border-redline/20"
                  : "text-muted-text hover:text-cold-white hover:bg-deep-slate border border-transparent"
              )}
            >
              <Icon className={cn("w-4 h-4", active ? "text-redline" : "text-evidence-grey group-hover:text-muted-text")} />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-redline" />}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-3 border-t border-border-steel">
        <Link
          href="/app/public/demo"
          className="flex items-center gap-2 text-xs text-muted-text hover:text-cold-white font-mono transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          Public View
        </Link>
      </div>
    </aside>
  );
}
