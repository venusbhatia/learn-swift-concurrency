'use client';

import React from 'react';

function ErrorHandlingDiagram() {
  return (
    <svg viewBox="0 0 800 320" className="w-full">
      {/* Title */}
      <text x="400" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1A1A1A" fontFamily="var(--font-sans)">Error Handling Flow</text>

      {/* Main flow */}
      {/* Function call box */}
      <rect x="40" y="100" width="130" height="44" rx="8" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1.5" />
      <text x="105" y="127" textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="#1A1A1A">function()</text>

      {/* Arrow → try */}
      <line x1="170" y1="122" x2="220" y2="122" stroke="#D1D5DB" strokeWidth="1.5" markerEnd="url(#arrowGray)" />

      {/* try box */}
      <rect x="220" y="100" width="80" height="44" rx="8" fill="#6366F1" stroke="#6366F1" strokeWidth="1.5" />
      <text x="260" y="127" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="var(--font-mono)" fill="#FFFFFF">try</text>

      {/* Success path */}
      <line x1="300" y1="110" x2="400" y2="80" stroke="#16A34A" strokeWidth="1.5" markerEnd="url(#arrowGreen)" />
      <rect x="400" y="58" width="140" height="44" rx="8" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5" />
      <text x="470" y="85" textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="#16A34A">✓ success</text>
      <line x1="540" y1="80" x2="620" y2="80" stroke="#16A34A" strokeWidth="1.5" markerEnd="url(#arrowGreen)" />
      <rect x="620" y="58" width="130" height="44" rx="8" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1.5" />
      <text x="685" y="85" textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="#1A1A1A">continue ▸</text>

      {/* Error path */}
      <line x1="300" y1="134" x2="400" y2="164" stroke="#DC2626" strokeWidth="1.5" markerEnd="url(#arrowRed)" />
      <rect x="400" y="142" width="140" height="44" rx="8" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1.5" />
      <text x="470" y="169" textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="#DC2626">✗ throws</text>
      <line x1="540" y1="164" x2="620" y2="164" stroke="#DC2626" strokeWidth="1.5" markerEnd="url(#arrowRed)" />
      <rect x="620" y="142" width="130" height="44" rx="8" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1.5" />
      <text x="685" y="162" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#DC2626">catch {'{'}</text>
      <text x="685" y="178" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#DC2626">{'  '}handle</text>

      {/* Three flavors */}
      <text x="120" y="240" textAnchor="middle" fontSize="11" fontWeight="600" fill="#6B7280" fontFamily="var(--font-sans)">Three flavors:</text>

      <rect x="210" y="220" width="120" height="40" rx="6" fill="#FFFFFF" stroke="#6366F1" strokeWidth="1.5" />
      <text x="270" y="244" textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="#6366F1">try</text>
      <text x="270" y="275" textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="var(--font-sans)">propagate error</text>

      <rect x="370" y="220" width="120" height="40" rx="6" fill="#FFFFFF" stroke="#D97706" strokeWidth="1.5" />
      <text x="430" y="244" textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="#D97706">try?</text>
      <text x="430" y="275" textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="var(--font-sans)">nil on error</text>

      <rect x="530" y="220" width="120" height="40" rx="6" fill="#FFFFFF" stroke="#DC2626" strokeWidth="1.5" />
      <text x="590" y="244" textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="#DC2626">try!</text>
      <text x="590" y="275" textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="var(--font-sans)">crash on error</text>

      {/* Arrow markers */}
      <defs>
        <marker id="arrowGray" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#D1D5DB" /></marker>
        <marker id="arrowGreen" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#16A34A" /></marker>
        <marker id="arrowRed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#DC2626" /></marker>
      </defs>
    </svg>
  );
}

function StructClassActorDiagram() {
  return (
    <svg viewBox="0 0 800 280" className="w-full">
      <text x="400" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1A1A1A" fontFamily="var(--font-sans)">Memory Model: Value vs Reference vs Isolated</text>

      {/* Struct - Stack */}
      <rect x="30" y="55" width="220" height="200" rx="12" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5" />
      <text x="140" y="80" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16A34A" fontFamily="var(--font-mono)">struct (Stack)</text>
      <rect x="55" y="100" width="70" height="50" rx="6" fill="#FFFFFF" stroke="#16A34A" strokeWidth="1" />
      <text x="90" y="130" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#16A34A">copy A</text>
      <rect x="155" y="100" width="70" height="50" rx="6" fill="#FFFFFF" stroke="#16A34A" strokeWidth="1" />
      <text x="190" y="130" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#16A34A">copy B</text>
      <text x="140" y="180" textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="var(--font-sans)">Each variable gets</text>
      <text x="140" y="195" textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="var(--font-sans)">its own independent copy</text>
      <text x="140" y="235" textAnchor="middle" fontSize="10" fontWeight="600" fill="#16A34A" fontFamily="var(--font-sans)">Safe by default</text>

      {/* Class - Heap */}
      <rect x="290" y="55" width="220" height="200" rx="12" fill="#FFF7ED" stroke="#FF5A1F" strokeWidth="1.5" />
      <text x="400" y="80" textAnchor="middle" fontSize="12" fontWeight="600" fill="#FF5A1F" fontFamily="var(--font-mono)">class (Heap)</text>
      <rect x="355" y="100" width="90" height="50" rx="6" fill="#FFFFFF" stroke="#FF5A1F" strokeWidth="1" />
      <text x="400" y="130" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#FF5A1F">object</text>
      <line x1="320" y1="170" x2="380" y2="140" stroke="#FF5A1F" strokeWidth="1" strokeDasharray="4 2" />
      <line x1="480" y1="170" x2="420" y2="140" stroke="#FF5A1F" strokeWidth="1" strokeDasharray="4 2" />
      <text x="320" y="185" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#FF5A1F">ref A</text>
      <text x="480" y="185" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#FF5A1F">ref B</text>
      <text x="400" y="215" textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="var(--font-sans)">Both point to same object</text>
      <text x="400" y="235" textAnchor="middle" fontSize="10" fontWeight="600" fill="#DC2626" fontFamily="var(--font-sans)">Shared = data races!</text>

      {/* Actor - Isolated */}
      <rect x="550" y="55" width="220" height="200" rx="12" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5" />
      <text x="660" y="80" textAnchor="middle" fontSize="12" fontWeight="600" fill="#6366F1" fontFamily="var(--font-mono)">actor (Isolated)</text>
      <rect x="610" y="100" width="100" height="50" rx="6" fill="#FFFFFF" stroke="#6366F1" strokeWidth="1" />
      <text x="660" y="122" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#6366F1">state</text>
      <text x="660" y="137" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="#6366F1">serial access</text>
      <text x="600" y="180" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#D97706">await →</text>
      <text x="720" y="180" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#D97706">await →</text>
      <text x="660" y="215" textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="var(--font-sans)">One caller at a time</text>
      <text x="660" y="235" textAnchor="middle" fontSize="10" fontWeight="600" fill="#6366F1" fontFamily="var(--font-sans)">Thread-safe by design</text>
    </svg>
  );
}

function AsyncAwaitDiagram() {
  return (
    <svg viewBox="0 0 800 280" className="w-full">
      <text x="400" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1A1A1A" fontFamily="var(--font-sans)">Synchronous vs Async/Await</text>

      {/* Sync timeline */}
      <text x="50" y="80" fontSize="11" fontWeight="600" fill="#DC2626" fontFamily="var(--font-sans)">Synchronous (blocks thread)</text>
      <rect x="50" y="90" width="700" height="30" rx="4" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1" />
      <rect x="50" y="90" width="200" height="30" rx="4" fill="#DC2626" opacity="0.8" />
      <text x="150" y="110" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontFamily="var(--font-mono)">fetch()</text>
      <rect x="250" y="90" width="300" height="30" rx="0" fill="#DC2626" opacity="0.3" />
      <text x="400" y="110" textAnchor="middle" fontSize="10" fill="#DC2626" fontFamily="var(--font-mono)">⏳ BLOCKED — waiting for network...</text>
      <rect x="550" y="90" width="200" height="30" rx="4" fill="#DC2626" opacity="0.8" />
      <text x="650" y="110" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontFamily="var(--font-mono)">process result</text>
      <text x="755" y="85" fontSize="9" fill="#DC2626" fontFamily="var(--font-mono)">UI frozen!</text>

      {/* Async timeline */}
      <text x="50" y="160" fontSize="11" fontWeight="600" fill="#16A34A" fontFamily="var(--font-sans)">Async/Await (frees thread)</text>
      <rect x="50" y="170" width="700" height="30" rx="4" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1" />
      <rect x="50" y="170" width="130" height="30" rx="4" fill="#6366F1" opacity="0.9" />
      <text x="115" y="190" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontFamily="var(--font-mono)">call async</text>
      <text x="250" y="185" textAnchor="middle" fontSize="10" fill="#D97706" fontFamily="var(--font-mono)">↓ await (suspend)</text>
      <rect x="320" y="170" width="200" height="30" rx="0" fill="#16A34A" opacity="0.15" />
      <text x="420" y="190" textAnchor="middle" fontSize="10" fill="#16A34A" fontFamily="var(--font-mono)">thread free for other work</text>
      <text x="565" y="185" textAnchor="middle" fontSize="10" fill="#D97706" fontFamily="var(--font-mono)">↑ resume</text>
      <rect x="610" y="170" width="140" height="30" rx="4" fill="#6366F1" opacity="0.9" />
      <text x="680" y="190" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontFamily="var(--font-mono)">process result</text>
      <text x="755" y="165" fontSize="9" fill="#16A34A" fontFamily="var(--font-mono)">UI smooth!</text>

      {/* Key insight */}
      <rect x="200" y="230" width="400" height="36" rx="8" fill="#FFFBEB" stroke="#D97706" strokeWidth="1" />
      <text x="400" y="253" textAnchor="middle" fontSize="11" fill="#D97706" fontFamily="var(--font-sans)">Key: await suspends the task, NOT the thread</text>
    </svg>
  );
}

function TaskDiagram() {
  return (
    <svg viewBox="0 0 800 300" className="w-full">
      <text x="400" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1A1A1A" fontFamily="var(--font-sans)">Task Hierarchy & Lifecycle</text>
      <defs>
        <marker id="arrowIndigo" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#6366F1" /></marker>
      </defs>

      {/* Parent Task */}
      <rect x="230" y="50" width="340" height="80" rx="12" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5" />
      <text x="400" y="75" textAnchor="middle" fontSize="13" fontWeight="600" fill="#6366F1" fontFamily="var(--font-mono)">Task {'{'} ... {'}'}</text>
      <text x="400" y="95" textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="var(--font-sans)">Runs on cooperative thread pool</text>
      <text x="400" y="115" textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="var(--font-sans)">Can be cancelled • Has priority • Returns value</text>

      {/* Arrows down */}
      <line x1="300" y1="130" x2="200" y2="170" stroke="#6366F1" strokeWidth="1.5" markerEnd="url(#arrowIndigo)" />
      <line x1="400" y1="130" x2="400" y2="170" stroke="#6366F1" strokeWidth="1.5" markerEnd="url(#arrowIndigo)" />
      <line x1="500" y1="130" x2="600" y2="170" stroke="#6366F1" strokeWidth="1.5" markerEnd="url(#arrowIndigo)" />
      <text x="400" y="158" textAnchor="middle" fontSize="9" fill="#6366F1" fontFamily="var(--font-mono)">spawns</text>

      {/* Child tasks with priorities */}
      <rect x="100" y="175" width="180" height="50" rx="8" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1.5" />
      <text x="190" y="197" textAnchor="middle" fontSize="11" fontWeight="600" fill="#DC2626" fontFamily="var(--font-mono)">.high</text>
      <text x="190" y="215" textAnchor="middle" fontSize="9" fill="#6B7280" fontFamily="var(--font-sans)">runs first</text>

      <rect x="310" y="175" width="180" height="50" rx="8" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.5" />
      <text x="400" y="197" textAnchor="middle" fontSize="11" fontWeight="600" fill="#D97706" fontFamily="var(--font-mono)">.medium</text>
      <text x="400" y="215" textAnchor="middle" fontSize="9" fill="#6B7280" fontFamily="var(--font-sans)">default priority</text>

      <rect x="520" y="175" width="180" height="50" rx="8" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5" />
      <text x="610" y="197" textAnchor="middle" fontSize="11" fontWeight="600" fill="#6366F1" fontFamily="var(--font-mono)">.background</text>
      <text x="610" y="215" textAnchor="middle" fontSize="9" fill="#6B7280" fontFamily="var(--font-sans)">runs when idle</text>

      {/* Cancellation */}
      <rect x="250" y="255" width="300" height="30" rx="6" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1" />
      <text x="400" y="275" textAnchor="middle" fontSize="10" fill="#DC2626" fontFamily="var(--font-mono)">task.cancel() → cancels all children too</text>
    </svg>
  );
}

function ActorsDiagram() {
  return (
    <svg viewBox="0 0 800 300" className="w-full">
      <text x="400" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1A1A1A" fontFamily="var(--font-sans)">Actor Isolation: Serial Access to Shared State</text>

      {/* Actor box */}
      <rect x="200" y="50" width="400" height="150" rx="12" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2" />
      <text x="400" y="75" textAnchor="middle" fontSize="13" fontWeight="600" fill="#6366F1" fontFamily="var(--font-mono)">actor BankAccount</text>

      {/* Private state */}
      <rect x="280" y="90" width="240" height="30" rx="6" fill="#FFFFFF" stroke="#6366F1" strokeWidth="1" />
      <text x="400" y="110" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#6366F1">private var balance = 1000</text>

      {/* Serial queue */}
      <rect x="260" y="130" width="280" height="55" rx="8" fill="#F5F4F1" stroke="#D1D5DB" strokeWidth="1" />
      <text x="400" y="148" textAnchor="middle" fontSize="10" fontWeight="600" fill="#6B7280" fontFamily="var(--font-sans)">Serial Queue (one at a time)</text>
      <text x="330" y="172" textAnchor="middle" fontSize="10" fill="#FF5A1F" fontFamily="var(--font-mono)">deposit()</text>
      <text x="400" y="172" textAnchor="middle" fontSize="10" fill="#D1D5DB" fontFamily="var(--font-mono)">→</text>
      <text x="470" y="172" textAnchor="middle" fontSize="10" fill="#FF5A1F" fontFamily="var(--font-mono)">withdraw()</text>

      {/* Task A */}
      <rect x="50" y="230" width="150" height="50" rx="8" fill="#FFF7ED" stroke="#FF5A1F" strokeWidth="1.5" />
      <text x="125" y="253" textAnchor="middle" fontSize="11" fontWeight="600" fill="#FF5A1F" fontFamily="var(--font-mono)">Task A</text>
      <text x="125" y="270" textAnchor="middle" fontSize="9" fill="#6B7280" fontFamily="var(--font-sans)">await deposit(50)</text>
      <line x1="200" y1="250" x2="310" y2="185" stroke="#FF5A1F" strokeWidth="1.5" strokeDasharray="4 2" />
      <text x="240" y="215" fontSize="9" fill="#D97706" fontFamily="var(--font-mono)">await</text>

      {/* Task B */}
      <rect x="600" y="230" width="150" height="50" rx="8" fill="#FFF7ED" stroke="#FF5A1F" strokeWidth="1.5" />
      <text x="675" y="253" textAnchor="middle" fontSize="11" fontWeight="600" fill="#FF5A1F" fontFamily="var(--font-mono)">Task B</text>
      <text x="675" y="270" textAnchor="middle" fontSize="9" fill="#6B7280" fontFamily="var(--font-sans)">await withdraw(30)</text>
      <line x1="600" y1="250" x2="490" y2="185" stroke="#FF5A1F" strokeWidth="1.5" strokeDasharray="4 2" />
      <text x="555" y="215" fontSize="9" fill="#D97706" fontFamily="var(--font-mono)">await</text>

      {/* Wait label */}
      <text x="400" y="260" textAnchor="middle" fontSize="10" fontWeight="600" fill="#16A34A" fontFamily="var(--font-sans)">No data races — compiler enforced!</text>
    </svg>
  );
}

function AsyncLetDiagram() {
  return (
    <svg viewBox="0 0 800 300" className="w-full">
      <text x="400" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1A1A1A" fontFamily="var(--font-sans)">async let — Sequential vs Parallel</text>
      <defs>
        <marker id="arrowGrayAL" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#D1D5DB" /></marker>
      </defs>

      {/* Sequential */}
      <text x="50" y="75" fontSize="11" fontWeight="600" fill="#DC2626" fontFamily="var(--font-sans)">Sequential (one at a time)</text>
      <rect x="50" y="85" width="180" height="30" rx="4" fill="#DC2626" opacity="0.8" />
      <text x="140" y="105" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontFamily="var(--font-mono)">Task 1 — 2s</text>
      <line x1="230" y1="100" x2="250" y2="100" stroke="#D1D5DB" strokeWidth="1.5" markerEnd="url(#arrowGrayAL)" />
      <rect x="250" y="85" width="180" height="30" rx="4" fill="#DC2626" opacity="0.8" />
      <text x="340" y="105" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontFamily="var(--font-mono)">Task 2 — 2s</text>
      <line x1="430" y1="100" x2="450" y2="100" stroke="#D1D5DB" strokeWidth="1.5" markerEnd="url(#arrowGrayAL)" />
      <rect x="450" y="85" width="180" height="30" rx="4" fill="#DC2626" opacity="0.8" />
      <text x="540" y="105" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontFamily="var(--font-mono)">Task 3 — 2s</text>
      <text x="680" y="105" fontSize="11" fontWeight="600" fill="#DC2626" fontFamily="var(--font-mono)">= 6 sec</text>

      {/* Parallel */}
      <text x="50" y="155" fontSize="11" fontWeight="600" fill="#16A34A" fontFamily="var(--font-sans)">Parallel (async let)</text>
      <rect x="50" y="165" width="350" height="25" rx="4" fill="#16A34A" opacity="0.8" />
      <text x="225" y="182" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontFamily="var(--font-mono)">async let a = Task 1 — 2s</text>
      <rect x="50" y="195" width="350" height="25" rx="4" fill="#6366F1" opacity="0.8" />
      <text x="225" y="212" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontFamily="var(--font-mono)">async let b = Task 2 — 2s</text>
      <rect x="50" y="225" width="350" height="25" rx="4" fill="#D97706" opacity="0.8" />
      <text x="225" y="242" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontFamily="var(--font-mono)">async let c = Task 3 — 2s</text>
      <rect x="420" y="180" width="130" height="40" rx="6" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5" />
      <text x="485" y="205" textAnchor="middle" fontSize="10" fill="#16A34A" fontFamily="var(--font-mono)">await (a,b,c)</text>
      <text x="600" y="205" fontSize="11" fontWeight="600" fill="#16A34A" fontFamily="var(--font-mono)">= 2 sec!</text>

      {/* Key insight */}
      <rect x="150" y="265" width="500" height="28" rx="8" fill="#FFFBEB" stroke="#D97706" strokeWidth="1" />
      <text x="400" y="284" textAnchor="middle" fontSize="11" fill="#D97706" fontFamily="var(--font-sans)">Key: async let starts immediately, await collects results</text>
    </svg>
  );
}

function TaskGroupDiagram() {
  return (
    <svg viewBox="0 0 800 310" className="w-full">
      <text x="400" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1A1A1A" fontFamily="var(--font-sans)">TaskGroup — Dynamic Parallelism</text>
      <defs>
        <marker id="arrowIndigoTG" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#6366F1" /></marker>
        <marker id="arrowGreenTG" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#16A34A" /></marker>
      </defs>

      {/* withTaskGroup box */}
      <rect x="50" y="50" width="350" height="180" rx="12" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2" />
      <text x="225" y="75" textAnchor="middle" fontSize="12" fontWeight="600" fill="#6366F1" fontFamily="var(--font-mono)">withTaskGroup {'{'}</text>

      {/* Loop */}
      <rect x="80" y="90" width="290" height="30" rx="6" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1" />
      <text x="225" y="110" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#1A1A1A">for url in urls {'{'}</text>

      {/* Spawned tasks */}
      <rect x="100" y="130" width="120" height="35" rx="6" fill="#6366F1" opacity="0.15" stroke="#6366F1" strokeWidth="1" />
      <text x="160" y="152" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#6366F1">group.addTask</text>
      <rect x="230" y="130" width="80" height="35" rx="6" fill="#6366F1" opacity="0.15" stroke="#6366F1" strokeWidth="1" />
      <text x="270" y="152" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#6366F1">task 2</text>
      <rect x="320" y="130" width="60" height="35" rx="6" fill="#6366F1" opacity="0.15" stroke="#6366F1" strokeWidth="1" />
      <text x="350" y="152" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#6366F1">...</text>
      <text x="225" y="192" textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="var(--font-sans)">N tasks spawned dynamically</text>
      <text x="225" y="220" textAnchor="middle" fontSize="12" fill="#6366F1" fontFamily="var(--font-mono)">{'}'}</text>

      {/* Results flowing back */}
      <line x1="400" y1="110" x2="470" y2="80" stroke="#16A34A" strokeWidth="1.5" markerEnd="url(#arrowGreenTG)" />
      <line x1="400" y1="140" x2="470" y2="120" stroke="#16A34A" strokeWidth="1.5" markerEnd="url(#arrowGreenTG)" />
      <line x1="400" y1="165" x2="470" y2="160" stroke="#16A34A" strokeWidth="1.5" markerEnd="url(#arrowGreenTG)" />

      <rect x="470" y="55" width="280" height="140" rx="12" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5" />
      <text x="610" y="80" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16A34A" fontFamily="var(--font-sans)">Results (completion order)</text>
      <text x="610" y="105" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#16A34A">for await result in group {'{'}</text>
      <text x="610" y="130" textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="var(--font-sans)">3rd finished first → comes first</text>
      <text x="610" y="150" textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="var(--font-sans)">1st finished second → comes second</text>
      <text x="610" y="170" textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="var(--font-sans)">2nd finished last → comes last</text>

      {/* Key insight */}
      <rect x="150" y="270" width="500" height="28" rx="8" fill="#FFFBEB" stroke="#D97706" strokeWidth="1" />
      <text x="400" y="289" textAnchor="middle" fontSize="11" fill="#D97706" fontFamily="var(--font-sans)">Key: Dynamic parallelism — spawn tasks in a loop</text>
    </svg>
  );
}

function CheckedContinuationDiagram() {
  return (
    <svg viewBox="0 0 800 300" className="w-full">
      <text x="400" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1A1A1A" fontFamily="var(--font-sans)">Checked Continuation — Bridging Old → New</text>
      <defs>
        <marker id="arrowCoralCC" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#FF5A1F" /></marker>
        <marker id="arrowGreenCC" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#16A34A" /></marker>
      </defs>

      {/* Old API side */}
      <rect x="30" y="55" width="250" height="140" rx="12" fill="#FFF7ED" stroke="#FF5A1F" strokeWidth="1.5" />
      <text x="155" y="80" textAnchor="middle" fontSize="12" fontWeight="600" fill="#FF5A1F" fontFamily="var(--font-sans)">Old API (callback)</text>
      <rect x="55" y="95" width="200" height="25" rx="4" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1" />
      <text x="155" y="113" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#FF5A1F">fetchData {'{'} completion in</text>
      <rect x="55" y="130" width="200" height="25" rx="4" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1" />
      <text x="155" y="148" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#FF5A1F">{'  '}completion(result)</text>
      <text x="155" y="180" textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="var(--font-mono)">{'}'}</text>

      {/* Bridge */}
      <line x1="280" y1="125" x2="330" y2="125" stroke="#D97706" strokeWidth="2" markerEnd="url(#arrowCoralCC)" />
      <rect x="330" y="75" width="140" height="100" rx="10" fill="#FFFBEB" stroke="#D97706" strokeWidth="2" />
      <text x="400" y="100" textAnchor="middle" fontSize="11" fontWeight="600" fill="#D97706" fontFamily="var(--font-sans)">Bridge</text>
      <text x="400" y="120" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="#D97706">withChecked</text>
      <text x="400" y="135" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="#D97706">Continuation</text>
      <text x="400" y="160" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="#16A34A">.resume(returning:)</text>

      {/* Arrow to new */}
      <line x1="470" y1="125" x2="520" y2="125" stroke="#16A34A" strokeWidth="2" markerEnd="url(#arrowGreenCC)" />

      {/* New async side */}
      <rect x="520" y="55" width="250" height="140" rx="12" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5" />
      <text x="645" y="80" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16A34A" fontFamily="var(--font-sans)">New API (async)</text>
      <rect x="545" y="95" width="200" height="25" rx="4" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1" />
      <text x="645" y="113" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#16A34A">func fetchData() async</text>
      <rect x="545" y="130" width="200" height="25" rx="4" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1" />
      <text x="645" y="148" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#16A34A">{'  '}→ throws Data</text>
      <text x="645" y="180" textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="var(--font-sans)">Clean, linear code</text>

      {/* Resume options */}
      <rect x="140" y="220" width="220" height="30" rx="6" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1" />
      <text x="250" y="240" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#16A34A">continuation.resume(returning:)</text>
      <rect x="440" y="220" width="220" height="30" rx="6" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1" />
      <text x="550" y="240" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#DC2626">continuation.resume(throwing:)</text>

      {/* Key insight */}
      <rect x="200" y="265" width="400" height="28" rx="8" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1" />
      <text x="400" y="284" textAnchor="middle" fontSize="11" fill="#DC2626" fontFamily="var(--font-sans)">Key: Resume exactly once — or crash</text>
    </svg>
  );
}

function SendableDiagram() {
  return (
    <svg viewBox="0 0 800 300" className="w-full">
      <text x="400" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1A1A1A" fontFamily="var(--font-sans)">Sendable — What Can Cross Isolation Boundaries</text>

      {/* Left side - Task A */}
      <rect x="50" y="60" width="250" height="80" rx="12" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5" />
      <text x="175" y="85" textAnchor="middle" fontSize="12" fontWeight="600" fill="#6366F1" fontFamily="var(--font-mono)">Task A (isolation)</text>
      <text x="175" y="110" textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="var(--font-sans)">Wants to send data across →</text>

      {/* Boundary */}
      <line x1="400" y1="50" x2="400" y2="290" stroke="#D97706" strokeWidth="2" strokeDasharray="8 4" />
      <text x="400" y="55" textAnchor="middle" fontSize="10" fontWeight="600" fill="#D97706" fontFamily="var(--font-sans)">Isolation Boundary</text>

      {/* Right side - Task B */}
      <rect x="500" y="60" width="250" height="80" rx="12" fill="#FFF7ED" stroke="#FF5A1F" strokeWidth="1.5" />
      <text x="625" y="85" textAnchor="middle" fontSize="12" fontWeight="600" fill="#FF5A1F" fontFamily="var(--font-mono)">Task B / Actor</text>
      <text x="625" y="110" textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="var(--font-sans)">Receives data</text>

      {/* Sendable types - can cross */}
      <rect x="120" y="160" width="200" height="28" rx="6" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5" />
      <text x="220" y="179" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#16A34A">struct Point (Sendable)</text>
      <line x1="320" y1="174" x2="480" y2="174" stroke="#16A34A" strokeWidth="1.5" />
      <text x="400" y="167" textAnchor="middle" fontSize="14" fill="#16A34A">✓</text>

      <rect x="120" y="200" width="200" height="28" rx="6" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5" />
      <text x="220" y="219" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#16A34A">final class + let props</text>
      <line x1="320" y1="214" x2="480" y2="214" stroke="#16A34A" strokeWidth="1.5" />
      <text x="400" y="207" textAnchor="middle" fontSize="14" fill="#16A34A">✓</text>

      {/* Non-sendable - cannot cross */}
      <rect x="120" y="240" width="200" height="28" rx="6" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1.5" />
      <text x="220" y="259" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#DC2626">class + var props</text>
      <line x1="320" y1="254" x2="380" y2="254" stroke="#DC2626" strokeWidth="1.5" />
      <text x="395" y="259" fontSize="14" fill="#DC2626">✗</text>

      {/* Key insight */}
      <rect x="450" y="240" width="320" height="28" rx="8" fill="#FFFBEB" stroke="#D97706" strokeWidth="1" />
      <text x="610" y="259" textAnchor="middle" fontSize="11" fill="#D97706" fontFamily="var(--font-sans)">Sendable = safe to send across isolation boundaries</text>
    </svg>
  );
}

function GlobalActorDiagram() {
  return (
    <svg viewBox="0 0 800 300" className="w-full">
      <text x="400" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1A1A1A" fontFamily="var(--font-sans)">@MainActor — Guaranteed Main Thread</text>
      <defs>
        <marker id="arrowIndigoGA" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#6366F1" /></marker>
        <marker id="arrowCoralGA" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#FF5A1F" /></marker>
      </defs>

      {/* MainActor box */}
      <rect x="50" y="55" width="350" height="180" rx="12" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2" />
      <text x="225" y="80" textAnchor="middle" fontSize="12" fontWeight="600" fill="#6366F1" fontFamily="var(--font-mono)">@MainActor</text>
      <text x="225" y="98" textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="var(--font-sans)">(Main Thread)</text>

      <rect x="80" y="110" width="140" height="40" rx="8" fill="#FFFFFF" stroke="#6366F1" strokeWidth="1" />
      <text x="150" y="135" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#6366F1">ViewModel</text>

      <rect x="240" y="110" width="140" height="40" rx="8" fill="#FFFFFF" stroke="#6366F1" strokeWidth="1" />
      <text x="310" y="128" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#6366F1">UI Updates</text>
      <text x="310" y="143" textAnchor="middle" fontSize="9" fill="#6B7280" fontFamily="var(--font-mono)">self.title = ...</text>

      <text x="225" y="190" textAnchor="middle" fontSize="10" fill="#6366F1" fontFamily="var(--font-sans)">@Published var items: [Item]</text>
      <text x="225" y="210" textAnchor="middle" fontSize="10" fill="#6366F1" fontFamily="var(--font-sans)">All property access on main thread</text>

      {/* Background box */}
      <rect x="480" y="55" width="280" height="100" rx="12" fill="#FFF7ED" stroke="#FF5A1F" strokeWidth="1.5" />
      <text x="620" y="80" textAnchor="middle" fontSize="12" fontWeight="600" fill="#FF5A1F" fontFamily="var(--font-sans)">Background Work</text>
      <text x="620" y="105" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#FF5A1F">await api.fetch()</text>
      <text x="620" y="125" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#FF5A1F">await db.query()</text>

      {/* Arrows */}
      <line x1="400" y1="100" x2="475" y2="100" stroke="#FF5A1F" strokeWidth="1.5" markerEnd="url(#arrowCoralGA)" />
      <text x="438" y="93" textAnchor="middle" fontSize="9" fill="#FF5A1F" fontFamily="var(--font-mono)">await</text>

      <line x1="475" y1="140" x2="400" y2="170" stroke="#6366F1" strokeWidth="1.5" markerEnd="url(#arrowIndigoGA)" />
      <text x="455" y="165" textAnchor="middle" fontSize="9" fill="#6366F1" fontFamily="var(--font-mono)">MainActor.run</text>

      {/* Key insight */}
      <rect x="200" y="265" width="400" height="28" rx="8" fill="#FFFBEB" stroke="#D97706" strokeWidth="1" />
      <text x="400" y="284" textAnchor="middle" fontSize="11" fill="#D97706" fontFamily="var(--font-sans)">Key: @MainActor = guaranteed main thread</text>
    </svg>
  );
}

function StrongSelfDiagram() {
  return (
    <svg viewBox="0 0 800 300" className="w-full">
      <text x="400" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1A1A1A" fontFamily="var(--font-sans)">Retain Cycles — Closures vs Tasks</text>

      {/* Left: Retain Cycle */}
      <text x="200" y="65" textAnchor="middle" fontSize="12" fontWeight="600" fill="#DC2626" fontFamily="var(--font-sans)">Classic Retain Cycle</text>
      <rect x="100" y="80" width="120" height="45" rx="8" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1.5" />
      <text x="160" y="107" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#DC2626">Object</text>
      <rect x="100" y="170" width="120" height="45" rx="8" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1.5" />
      <text x="160" y="197" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#DC2626">Closure</text>
      {/* Circular arrows */}
      <line x1="130" y1="125" x2="130" y2="168" stroke="#DC2626" strokeWidth="1.5" />
      <text x="115" y="150" fontSize="10" fill="#DC2626" fontFamily="var(--font-mono)">→</text>
      <line x1="190" y1="170" x2="190" y2="127" stroke="#DC2626" strokeWidth="1.5" />
      <text x="198" y="150" fontSize="10" fill="#DC2626" fontFamily="var(--font-mono)">→</text>
      <text x="265" y="145" fontSize="10" fill="#DC2626" fontFamily="var(--font-sans)">strong ref</text>
      <text x="265" y="160" fontSize="10" fill="#DC2626" fontFamily="var(--font-sans)">both ways</text>

      <rect x="80" y="230" width="220" height="28" rx="6" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1" />
      <text x="190" y="249" textAnchor="middle" fontSize="10" fill="#DC2626" fontFamily="var(--font-sans)">Memory leak — never deallocated</text>

      {/* Divider */}
      <line x1="400" y1="60" x2="400" y2="270" stroke="#E5E5E3" strokeWidth="1" strokeDasharray="4 4" />

      {/* Right: Task */}
      <text x="600" y="65" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16A34A" fontFamily="var(--font-sans)">Task Capture</text>
      <rect x="540" y="80" width="120" height="45" rx="8" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5" />
      <text x="600" y="107" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#16A34A">Object</text>
      <rect x="540" y="170" width="120" height="45" rx="8" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5" />
      <text x="600" y="197" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#6366F1">Task</text>
      {/* One-way arrow */}
      <line x1="600" y1="170" x2="600" y2="127" stroke="#16A34A" strokeWidth="1.5" />
      <text x="620" y="150" fontSize="10" fill="#16A34A" fontFamily="var(--font-mono)">strong</text>
      <text x="555" y="155" fontSize="10" fill="#6B7280" fontFamily="var(--font-sans)">holds</text>

      <rect x="490" y="230" width="220" height="28" rx="6" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1" />
      <text x="600" y="249" textAnchor="middle" fontSize="10" fill="#16A34A" fontFamily="var(--font-sans)">Task completes → releases self</text>

      {/* Key insight */}
      <rect x="200" y="272" width="400" height="28" rx="8" fill="#FFFBEB" stroke="#D97706" strokeWidth="1" />
      <text x="400" y="291" textAnchor="middle" fontSize="11" fill="#D97706" fontFamily="var(--font-sans)">Key: Tasks release self when done — closures may not</text>
    </svg>
  );
}

function MVVMDiagram() {
  return (
    <svg viewBox="0 0 800 300" className="w-full">
      <text x="400" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1A1A1A" fontFamily="var(--font-sans)">MVVM Architecture with Concurrency</text>
      <defs>
        <marker id="arrowUpMVVM" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#16A34A" /></marker>
        <marker id="arrowDownMVVM" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#6366F1" /></marker>
      </defs>

      {/* View Layer */}
      <rect x="50" y="60" width="700" height="55" rx="12" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5" />
      <text x="130" y="85" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16A34A" fontFamily="var(--font-mono)">View</text>
      <text x="130" y="103" textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="var(--font-sans)">SwiftUI</text>
      <text x="400" y="85" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#16A34A">Text(vm.title)</text>
      <text x="600" y="85" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#16A34A">.task {'{'} await vm.load() {'}'}</text>

      {/* Arrows between View and ViewModel */}
      <line x1="300" y1="115" x2="300" y2="145" stroke="#6366F1" strokeWidth="1.5" markerEnd="url(#arrowDownMVVM)" />
      <text x="310" y="135" fontSize="9" fill="#6366F1" fontFamily="var(--font-mono)">await</text>
      <line x1="500" y1="145" x2="500" y2="115" stroke="#16A34A" strokeWidth="1.5" markerEnd="url(#arrowUpMVVM)" />
      <text x="530" y="135" fontSize="9" fill="#16A34A" fontFamily="var(--font-mono)">@Published</text>

      {/* ViewModel Layer */}
      <rect x="50" y="150" width="700" height="55" rx="12" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5" />
      <text x="130" y="175" textAnchor="middle" fontSize="12" fontWeight="600" fill="#6366F1" fontFamily="var(--font-mono)">ViewModel</text>
      <text x="130" y="193" textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="var(--font-sans)">@MainActor</text>
      <text x="400" y="180" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#6366F1">@Published var title: String</text>
      <text x="600" y="180" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#6366F1">func load() async</text>

      {/* Arrows between ViewModel and Model */}
      <line x1="300" y1="205" x2="300" y2="235" stroke="#FF5A1F" strokeWidth="1.5" markerEnd="url(#arrowDownMVVM)" />
      <text x="310" y="225" fontSize="9" fill="#FF5A1F" fontFamily="var(--font-mono)">await</text>
      <line x1="500" y1="235" x2="500" y2="205" stroke="#FF5A1F" strokeWidth="1.5" />
      <text x="530" y="225" fontSize="9" fill="#FF5A1F" fontFamily="var(--font-mono)">returns</text>

      {/* Model Layer */}
      <rect x="50" y="240" width="700" height="55" rx="12" fill="#FFF7ED" stroke="#FF5A1F" strokeWidth="1.5" />
      <text x="130" y="265" textAnchor="middle" fontSize="12" fontWeight="600" fill="#FF5A1F" fontFamily="var(--font-mono)">Model</text>
      <text x="130" y="283" textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="var(--font-sans)">actor / service</text>
      <text x="400" y="270" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#FF5A1F">actor DataStore</text>
      <text x="600" y="270" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#FF5A1F">func fetch() async → [Item]</text>
    </svg>
  );
}

function DownloadImageAsyncDiagram() {
  return (
    <svg viewBox="0 0 800 310" className="w-full">
      <text x="400" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1A1A1A" fontFamily="var(--font-sans)">Three Eras of Async Code</text>

      {/* Era 1: Completion Handler */}
      <rect x="30" y="55" width="230" height="190" rx="12" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1.5" />
      <text x="145" y="78" textAnchor="middle" fontSize="11" fontWeight="600" fill="#DC2626" fontFamily="var(--font-sans)">Era 1: Completion Handler</text>
      <rect x="50" y="90" width="190" height="20" rx="4" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1" />
      <text x="145" y="104" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="#DC2626">fetchURL {'{'} data in</text>
      <rect x="65" y="115" width="175" height="20" rx="4" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1" />
      <text x="152" y="129" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="#DC2626">{'  '}decode {'{'} image in</text>
      <rect x="80" y="140" width="160" height="20" rx="4" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1" />
      <text x="160" y="154" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="#DC2626">{'    '}validate {'{'} ok in</text>
      <rect x="95" y="165" width="145" height="20" rx="4" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1" />
      <text x="167" y="179" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="#DC2626">{'      '}completion(ok)</text>
      <text x="145" y="210" textAnchor="middle" fontSize="9" fill="#DC2626" fontFamily="var(--font-sans)">Pyramid of doom</text>
      <text x="145" y="230" textAnchor="middle" fontSize="22" fill="#DC2626">{'>'}</text>

      {/* Era 2: Combine */}
      <rect x="285" y="55" width="230" height="190" rx="12" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.5" />
      <text x="400" y="78" textAnchor="middle" fontSize="11" fontWeight="600" fill="#D97706" fontFamily="var(--font-sans)">Era 2: Combine</text>
      <rect x="305" y="95" width="190" height="20" rx="4" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1" />
      <text x="400" y="109" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="#D97706">URLSession.dataTaskPublisher</text>
      <rect x="305" y="120" width="190" height="20" rx="4" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1" />
      <text x="400" y="134" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="#D97706">.map {'{'} decode($0) {'}'}</text>
      <rect x="305" y="145" width="190" height="20" rx="4" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1" />
      <text x="400" y="159" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="#D97706">.tryMap {'{'} validate($0) {'}'}</text>
      <rect x="305" y="170" width="190" height="20" rx="4" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1" />
      <text x="400" y="184" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="#D97706">.sink {'{'} handle($0) {'}'}</text>
      <text x="400" y="218" textAnchor="middle" fontSize="9" fill="#D97706" fontFamily="var(--font-sans)">Operator chains</text>

      {/* Era 3: async/await */}
      <rect x="540" y="55" width="230" height="190" rx="12" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5" />
      <text x="655" y="78" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16A34A" fontFamily="var(--font-sans)">Era 3: async/await</text>
      <rect x="560" y="100" width="190" height="20" rx="4" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1" />
      <text x="655" y="114" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="#16A34A">let data = try await fetch()</text>
      <rect x="560" y="130" width="190" height="20" rx="4" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1" />
      <text x="655" y="144" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="#16A34A">let img = try decode(data)</text>
      <rect x="560" y="160" width="190" height="20" rx="4" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1" />
      <text x="655" y="174" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="#16A34A">try validate(img)</text>
      <text x="655" y="218" textAnchor="middle" fontSize="9" fill="#16A34A" fontFamily="var(--font-sans)">Linear, just like sync code</text>

      {/* Key insight */}
      <rect x="175" y="270" width="450" height="28" rx="8" fill="#FFFBEB" stroke="#D97706" strokeWidth="1" />
      <text x="400" y="289" textAnchor="middle" fontSize="11" fill="#D97706" fontFamily="var(--font-sans)">Key: Same operation, dramatically simpler code</text>
    </svg>
  );
}

function AsyncPublisherDiagram() {
  return (
    <svg viewBox="0 0 800 280" className="w-full">
      <text x="400" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1A1A1A" fontFamily="var(--font-sans)">AsyncPublisher — Combine → AsyncSequence Bridge</text>
      <defs>
        <marker id="arrowCoralAP" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#FF5A1F" /></marker>
        <marker id="arrowGreenAP" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#16A34A" /></marker>
      </defs>

      {/* Combine World */}
      <rect x="30" y="60" width="280" height="130" rx="12" fill="#FFF7ED" stroke="#FF5A1F" strokeWidth="1.5" />
      <text x="170" y="85" textAnchor="middle" fontSize="12" fontWeight="600" fill="#FF5A1F" fontFamily="var(--font-sans)">Combine World</text>
      <rect x="55" y="100" width="230" height="30" rx="6" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1" />
      <text x="170" y="120" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#FF5A1F">@Published var items: [Item]</text>
      <rect x="55" y="140" width="230" height="30" rx="6" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1" />
      <text x="170" y="160" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#FF5A1F">$items → Publisher</text>

      {/* Bridge arrow */}
      <line x1="310" y1="125" x2="370" y2="125" stroke="#D97706" strokeWidth="2" markerEnd="url(#arrowCoralAP)" />
      <rect x="370" y="100" width="60" height="50" rx="8" fill="#FFFBEB" stroke="#D97706" strokeWidth="2" />
      <text x="400" y="122" textAnchor="middle" fontSize="9" fontWeight="600" fill="#D97706" fontFamily="var(--font-mono)">.values</text>
      <text x="400" y="140" textAnchor="middle" fontSize="8" fill="#D97706" fontFamily="var(--font-sans)">bridge</text>
      <line x1="430" y1="125" x2="490" y2="125" stroke="#16A34A" strokeWidth="2" markerEnd="url(#arrowGreenAP)" />

      {/* Async World */}
      <rect x="490" y="60" width="280" height="130" rx="12" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5" />
      <text x="630" y="85" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16A34A" fontFamily="var(--font-sans)">Async World</text>
      <rect x="515" y="100" width="230" height="30" rx="6" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1" />
      <text x="630" y="120" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#16A34A">for await items in $items.values</text>
      <rect x="515" y="140" width="230" height="30" rx="6" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1" />
      <text x="630" y="160" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#16A34A">{'  '}self.items = items</text>

      {/* Key insight */}
      <rect x="150" y="220" width="500" height="28" rx="8" fill="#FFFBEB" stroke="#D97706" strokeWidth="1" />
      <text x="400" y="239" textAnchor="middle" fontSize="11" fill="#D97706" fontFamily="var(--font-sans)">Key: .values converts any Publisher to an AsyncSequence</text>
    </svg>
  );
}

function RefreshableDiagram() {
  return (
    <svg viewBox="0 0 800 280" className="w-full">
      <text x="400" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1A1A1A" fontFamily="var(--font-sans)">.refreshable — Pull to Refresh Flow</text>
      <defs>
        <marker id="arrowGrayRF" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#6B7280" /></marker>
      </defs>

      {/* Step 1: Pull */}
      <rect x="30" y="70" width="140" height="60" rx="10" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5" />
      <text x="100" y="95" textAnchor="middle" fontSize="11" fontWeight="600" fill="#6366F1" fontFamily="var(--font-sans)">User pulls ↓</text>
      <text x="100" y="115" textAnchor="middle" fontSize="9" fill="#6B7280" fontFamily="var(--font-sans)">scroll gesture</text>

      <line x1="170" y1="100" x2="210" y2="100" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arrowGrayRF)" />

      {/* Step 2: .refreshable triggers */}
      <rect x="210" y="70" width="150" height="60" rx="10" fill="#FFF7ED" stroke="#FF5A1F" strokeWidth="1.5" />
      <text x="285" y="93" textAnchor="middle" fontSize="10" fontWeight="600" fill="#FF5A1F" fontFamily="var(--font-mono)">.refreshable {'{'}</text>
      <text x="285" y="115" textAnchor="middle" fontSize="10" fill="#FF5A1F" fontFamily="var(--font-mono)">{'  '}triggers</text>

      <line x1="360" y1="100" x2="400" y2="100" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arrowGrayRF)" />

      {/* Step 3: await loadData */}
      <rect x="400" y="70" width="170" height="60" rx="10" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.5" />
      <text x="485" y="93" textAnchor="middle" fontSize="10" fontWeight="600" fill="#D97706" fontFamily="var(--font-mono)">await loadData()</text>
      <text x="485" y="113" textAnchor="middle" fontSize="10" fill="#D97706" fontFamily="var(--font-sans)">⏳ spinner shows</text>

      <line x1="570" y1="100" x2="610" y2="100" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arrowGrayRF)" />

      {/* Step 4: Done */}
      <rect x="610" y="70" width="160" height="60" rx="10" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5" />
      <text x="690" y="93" textAnchor="middle" fontSize="10" fontWeight="600" fill="#16A34A" fontFamily="var(--font-sans)">Function returns</text>
      <text x="690" y="113" textAnchor="middle" fontSize="10" fill="#16A34A" fontFamily="var(--font-sans)">Spinner auto-dismisses</text>

      {/* Timeline bar */}
      <rect x="100" y="160" width="600" height="6" rx="3" fill="#E5E5E3" />
      <rect x="100" y="160" width="300" height="6" rx="3" fill="#D97706" opacity="0.5" />
      <text x="250" y="185" textAnchor="middle" fontSize="10" fill="#D97706" fontFamily="var(--font-sans)">spinner visible while async function runs</text>
      <rect x="400" y="160" width="300" height="6" rx="3" fill="#16A34A" opacity="0.5" />
      <text x="550" y="185" textAnchor="middle" fontSize="10" fill="#16A34A" fontFamily="var(--font-sans)">data loaded, spinner gone</text>

      {/* Key insight */}
      <rect x="175" y="215" width="450" height="28" rx="8" fill="#FFFBEB" stroke="#D97706" strokeWidth="1" />
      <text x="400" y="234" textAnchor="middle" fontSize="11" fill="#D97706" fontFamily="var(--font-sans)">Key: Spinner lives as long as the async function</text>
    </svg>
  );
}

function SearchableDiagram() {
  return (
    <svg viewBox="0 0 800 300" className="w-full">
      <text x="400" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1A1A1A" fontFamily="var(--font-sans)">.task(id:) — Automatic Cancellation on Change</text>
      <defs>
        <marker id="arrowRedSD" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#DC2626" /></marker>
        <marker id="arrowGreenSD" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#16A34A" /></marker>
      </defs>

      {/* Keystrokes */}
      <text x="80" y="70" fontSize="11" fontWeight="600" fill="#6B7280" fontFamily="var(--font-sans)">Keystrokes:</text>

      {/* Keystroke "s" */}
      <rect x="50" y="85" width="60" height="30" rx="6" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1.5" />
      <text x="80" y="105" textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="#1A1A1A">&quot;s&quot;</text>
      <line x1="110" y1="100" x2="150" y2="100" stroke="#DC2626" strokeWidth="1.5" markerEnd="url(#arrowRedSD)" />
      <rect x="150" y="85" width="100" height="30" rx="6" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1" />
      <text x="200" y="105" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#DC2626">search &quot;s&quot;</text>
      <text x="270" y="105" fontSize="10" fill="#DC2626" fontFamily="var(--font-sans)">CANCELLED</text>

      {/* Keystroke "sw" */}
      <rect x="50" y="125" width="60" height="30" rx="6" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1.5" />
      <text x="80" y="145" textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="#1A1A1A">&quot;sw&quot;</text>
      <line x1="110" y1="140" x2="150" y2="140" stroke="#DC2626" strokeWidth="1.5" markerEnd="url(#arrowRedSD)" />
      <rect x="150" y="125" width="100" height="30" rx="6" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1" />
      <text x="200" y="145" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#DC2626">search &quot;sw&quot;</text>
      <text x="270" y="145" fontSize="10" fill="#DC2626" fontFamily="var(--font-sans)">CANCELLED</text>

      {/* Keystroke "swi" */}
      <rect x="50" y="165" width="60" height="30" rx="6" fill="#FFFFFF" stroke="#E5E5E3" strokeWidth="1.5" />
      <text x="80" y="185" textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="#1A1A1A">&quot;swi&quot;</text>
      <line x1="110" y1="180" x2="150" y2="180" stroke="#DC2626" strokeWidth="1.5" markerEnd="url(#arrowRedSD)" />
      <rect x="150" y="165" width="100" height="30" rx="6" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1" />
      <text x="200" y="185" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#DC2626">search &quot;swi&quot;</text>
      <text x="270" y="185" fontSize="10" fill="#DC2626" fontFamily="var(--font-sans)">CANCELLED</text>

      {/* Keystroke "swift" - succeeds */}
      <rect x="50" y="205" width="60" height="30" rx="6" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5" />
      <text x="80" y="225" textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="#16A34A">&quot;swift&quot;</text>
      <line x1="110" y1="220" x2="150" y2="220" stroke="#16A34A" strokeWidth="1.5" markerEnd="url(#arrowGreenSD)" />
      <rect x="150" y="205" width="100" height="30" rx="6" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1" />
      <text x="200" y="225" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#16A34A">search &quot;swift&quot;</text>
      <line x1="250" y1="220" x2="330" y2="220" stroke="#16A34A" strokeWidth="1.5" markerEnd="url(#arrowGreenSD)" />
      <rect x="330" y="205" width="120" height="30" rx="6" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5" />
      <text x="390" y="225" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#16A34A">✓ Results!</text>

      {/* Code snippet */}
      <rect x="500" y="85" width="260" height="80" rx="10" fill="#F5F4F1" stroke="#E5E5E3" strokeWidth="1" />
      <text x="520" y="108" fontSize="10" fontFamily="var(--font-mono)" fill="#6366F1">.searchable(text: $query)</text>
      <text x="520" y="128" fontSize="10" fontFamily="var(--font-mono)" fill="#6366F1">.task(id: query) {'{'}</text>
      <text x="520" y="148" fontSize="10" fontFamily="var(--font-mono)" fill="#6366F1">{'  '}await search(query)</text>
      <text x="520" y="158" fontSize="10" fontFamily="var(--font-mono)" fill="#6366F1">{'}'}</text>

      {/* Key insight */}
      <rect x="150" y="260" width="500" height="28" rx="8" fill="#FFFBEB" stroke="#D97706" strokeWidth="1" />
      <text x="400" y="279" textAnchor="middle" fontSize="11" fill="#D97706" fontFamily="var(--font-sans)">Key: .task(id:) auto-cancels previous task when id changes</text>
    </svg>
  );
}

function PhotoPickerDiagram() {
  return (
    <svg viewBox="0 0 800 280" className="w-full">
      <text x="400" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1A1A1A" fontFamily="var(--font-sans)">PhotosPicker — Two-Phase Design</text>
      <defs>
        <marker id="arrowGrayPP" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#6B7280" /></marker>
        <marker id="arrowIndigoPP" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#6366F1" /></marker>
      </defs>

      {/* Phase 1 */}
      <text x="230" y="65" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16A34A" fontFamily="var(--font-sans)">Phase 1: Selection (instant)</text>
      <rect x="50" y="80" width="140" height="55" rx="10" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5" />
      <text x="120" y="105" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="var(--font-mono)" fill="#16A34A">PhotosPicker</text>
      <text x="120" y="122" textAnchor="middle" fontSize="9" fill="#6B7280" fontFamily="var(--font-sans)">system UI</text>

      <line x1="190" y1="108" x2="240" y2="108" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arrowGrayPP)" />
      <text x="215" y="100" textAnchor="middle" fontSize="9" fill="#6B7280" fontFamily="var(--font-sans)">tap</text>

      <rect x="240" y="80" width="180" height="55" rx="10" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5" />
      <text x="330" y="102" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="var(--font-mono)" fill="#16A34A">PhotosPickerItem</text>
      <text x="330" y="122" textAnchor="middle" fontSize="9" fill="#6B7280" fontFamily="var(--font-sans)">lightweight reference</text>

      {/* Divider */}
      <line x1="460" y1="60" x2="460" y2="250" stroke="#E5E5E3" strokeWidth="1.5" strokeDasharray="6 4" />

      {/* Phase 2 */}
      <text x="620" y="65" textAnchor="middle" fontSize="12" fontWeight="600" fill="#6366F1" fontFamily="var(--font-sans)">Phase 2: Loading (async)</text>
      <rect x="480" y="80" width="130" height="55" rx="10" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5" />
      <text x="545" y="102" textAnchor="middle" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)" fill="#6366F1">loadTransferable</text>
      <text x="545" y="120" textAnchor="middle" fontSize="9" fill="#6B7280" fontFamily="var(--font-mono)">(type: Data.self)</text>

      <line x1="610" y1="108" x2="650" y2="108" stroke="#6366F1" strokeWidth="1.5" markerEnd="url(#arrowIndigoPP)" />
      <text x="630" y="100" textAnchor="middle" fontSize="9" fill="#6366F1" fontFamily="var(--font-mono)">await</text>

      <rect x="650" y="80" width="120" height="55" rx="10" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5" />
      <text x="710" y="105" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="var(--font-mono)" fill="#6366F1">UIImage</text>
      <text x="710" y="122" textAnchor="middle" fontSize="9" fill="#6B7280" fontFamily="var(--font-sans)">full image data</text>

      {/* Weight comparison */}
      <rect x="80" y="165" width="300" height="40" rx="8" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1" />
      <text x="230" y="182" textAnchor="middle" fontSize="10" fill="#16A34A" fontFamily="var(--font-sans)">⚡ Instant — no data loaded yet</text>
      <text x="230" y="197" textAnchor="middle" fontSize="10" fill="#16A34A" fontFamily="var(--font-sans)">Just a reference / ID</text>

      <rect x="490" y="165" width="270" height="40" rx="8" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1" />
      <text x="625" y="182" textAnchor="middle" fontSize="10" fill="#6366F1" fontFamily="var(--font-sans)">⏳ Async — downloads/decodes bytes</text>
      <text x="625" y="197" textAnchor="middle" fontSize="10" fill="#6366F1" fontFamily="var(--font-sans)">Can fail, shows progress</text>

      {/* Key insight */}
      <rect x="175" y="230" width="450" height="28" rx="8" fill="#FFFBEB" stroke="#D97706" strokeWidth="1" />
      <text x="400" y="249" textAnchor="middle" fontSize="11" fill="#D97706" fontFamily="var(--font-sans)">Key: Selection is instant, loading is async</text>
    </svg>
  );
}

const diagrams: Record<string, () => React.ReactNode> = {
  'do-catch-try-throws': ErrorHandlingDiagram,
  'struct-class-actor': StructClassActorDiagram,
  'async-await': AsyncAwaitDiagram,
  'task': TaskDiagram,
  'actors': ActorsDiagram,
  'async-let': AsyncLetDiagram,
  'task-group': TaskGroupDiagram,
  'checked-continuation': CheckedContinuationDiagram,
  'sendable': SendableDiagram,
  'global-actor': GlobalActorDiagram,
  'strong-self': StrongSelfDiagram,
  'mvvm': MVVMDiagram,
  'download-image-async': DownloadImageAsyncDiagram,
  'async-publisher': AsyncPublisherDiagram,
  'refreshable': RefreshableDiagram,
  'searchable': SearchableDiagram,
  'photo-picker': PhotoPickerDiagram,
};

export default function ConceptScene({ slug }: { slug: string }) {
  const Diagram = diagrams[slug];

  if (!Diagram) {
    return null;
  }

  return (
    <div
      className="w-full rounded-2xl overflow-hidden p-6"
      style={{
        background: '#F5F4F1',
        border: '1px solid #E5E5E3',
      }}
    >
      <Diagram />
    </div>
  );
}
