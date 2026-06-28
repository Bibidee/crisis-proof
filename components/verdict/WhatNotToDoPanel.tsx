"use client";

import { XCircle } from "lucide-react";

interface Props {
  text: string;
}

export function WhatNotToDoPanel({ text }: Props) {
  if (!text) return null;
  return (
    <div className="bg-redline/10 border border-redline/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <XCircle className="w-4 h-4 text-redline" />
        <span className="text-xs font-mono text-redline uppercase tracking-wider">What NOT To Do</span>
      </div>
      <p className="text-sm text-cold-white font-inter leading-relaxed">{text}</p>
    </div>
  );
}
