import type { Topic } from '@/types/topic';

const topic: Topic = {
  slug: 'global-actor',
  order: 10,
  title: 'Global Actors',
  subtitle: 'Front-of-house manager',
  icon: '🎩',
  prerequisiteSlugs: ['actors'],
  storyDay: 18,
  storyIntro:
    "Day 18. The kitchen runs smoothly now — every chef has an isolated workstation, and data races are a thing of the past. But there is a new problem: the dining room. Customers are complaining that their orders appear on the wrong tables, the specials board updates mid-sentence, and sometimes the menu screen just freezes. The issue? The dining room is your UI, and dozens of background kitchen tasks are shouting updates at it simultaneously. You need a single front-of-house manager who controls everything the customers see.\n\nThat manager is the **MainActor**. Every update to the menu board, every plate placed on a table, every receipt printed — it all goes through this one person. Background chefs can prepare food on their own time, but the moment a dish is ready to be presented, they hand it to the manager, who places it in front of the customer in an orderly fashion. No more flickering menu boards.\n\nBut MainActor is not the only manager you can hire. What if you have a private wine cellar that needs its own dedicated coordinator? You can create a **custom global actor** — a singleton manager for any subsystem that needs serialized access from anywhere in the restaurant.",
  kitchenMetaphor:
    'The manager routes everything between kitchen and dining room.',
  sections: [
    {
      id: 'concept-global-actors',
      type: 'concept',
      title: 'What Is a Global Actor?',
      content: `A **global actor** is a singleton actor that provides a shared isolation domain accessible from anywhere in your codebase. Instead of creating an instance, you annotate declarations with the actor's attribute, and the compiler ensures they run on that actor's executor.

**MainActor** is the most important global actor — it runs on the main thread. UIKit and SwiftUI require all UI mutations to happen on the main thread. Before Swift concurrency, you'd sprinkle \`DispatchQueue.main.async { }\` everywhere and hope you didn't miss a spot. Now the compiler catches it for you.

**Key rules of global actors:**
- Annotate a class, struct, function, or property with \`@MainActor\` (or any global actor) to isolate it
- All access from outside the isolation domain requires \`await\`
- Isolation is **inherited**: if a class is \`@MainActor\`, all its stored properties and methods are too
- Use \`nonisolated\` to opt specific members OUT of the inherited isolation
- You can create custom global actors for non-UI subsystems (logging, analytics, caching)`,
    },
    {
      id: 'code-walkthrough-mainactor-vm',
      type: 'code-walkthrough',
      title: '@MainActor ViewModel in Practice',
      content: 'The most common use of @MainActor is on a ViewModel. Here is the pattern you will use in virtually every SwiftUI app:',
      codeBlocks: [
        {
          id: 'mainactor-viewmodel',
          label: '@MainActor ViewModel',
          code: `@MainActor
class ProfileViewModel: ObservableObject {
    @Published var username = ""
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let api = ProfileAPI()

    func loadProfile() async {
        isLoading = true
        defer { isLoading = false }

        do {
            let profile = try await api.fetchProfile()
            username = profile.name
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}`,
          steps: [
            {
              lineRange: [1, 2],
              explanation: "@MainActor on the class means EVERY property and method inside is isolated to the main thread. The compiler guarantees that 'username', 'isLoading', and 'errorMessage' are only ever mutated on the main thread. No more purple runtime warnings in Xcode.",
              threadIndicator: 'main',
            },
            {
              lineRange: [3, 5],
              explanation: "@Published properties trigger SwiftUI view updates. These MUST be set on the main thread. Because the whole class is @MainActor, this is guaranteed at compile time. Before global actors, you'd need DispatchQueue.main.async around every assignment.",
              threadIndicator: 'main',
            },
            {
              lineRange: [9, 11],
              explanation: "loadProfile() is async but still runs on MainActor. When we set isLoading = true, we're on the main thread. The 'defer' block ensures isLoading is reset even if an error is thrown — and it too runs on the main thread.",
              threadIndicator: 'main',
            },
            {
              lineRange: [13, 15],
              explanation: "The 'await api.fetchProfile()' suspends this function. The actual network call runs off the main thread. When it returns, execution resumes on MainActor automatically — so 'username = profile.name' is guaranteed to be a main-thread UI update. No manual thread hopping!",
              threadIndicator: 'main',
              executionNote: 'Suspends during network call, resumes on main thread',
            },
          ],
        },
      ],
    },
    {
      id: 'code-walkthrough-custom-global-actor',
      type: 'code-walkthrough',
      title: 'Creating a Custom Global Actor',
      content: 'You can create your own global actor for subsystems that need serialized access but should NOT block the main thread:',
      codeBlocks: [
        {
          id: 'custom-global-actor',
          label: 'Custom Global Actor for Database Access',
          code: `@globalActor
struct DatabaseActor {
    actor ActorType { }
    static let shared = ActorType()
}

@DatabaseActor
class DatabaseManager {
    private var cache: [String: Data] = [:]

    func save(key: String, value: Data) {
        cache[key] = value
    }

    func load(key: String) -> Data? {
        return cache[key]
    }
}

// Usage from anywhere:
func saveToDB() async {
    let db = DatabaseManager()
    await db.save(key: "user", value: someData)
}`,
          steps: [
            {
              lineRange: [1, 5],
              explanation: "The @globalActor attribute tells Swift this struct defines a global actor. It must contain a 'static let shared' that is an actor instance. The inner 'ActorType' is a plain actor — the struct just wraps it to create the @DatabaseActor annotation. This is the full boilerplate — only 4 lines.",
              threadIndicator: 'background',
            },
            {
              lineRange: [7, 17],
              explanation: "@DatabaseActor on the class means all access is serialized through our custom actor — NOT the main thread. The cache dictionary is protected from concurrent access. Multiple callers can call save() and load() from different tasks, and the actor ensures they execute one at a time.",
              threadIndicator: 'background',
            },
            {
              lineRange: [20, 23],
              explanation: "From outside the DatabaseActor isolation domain, you need 'await' to call any of its methods. This is identical to how @MainActor works — the only difference is WHICH executor the code runs on. Main thread for @MainActor, a background executor for @DatabaseActor.",
              threadIndicator: 'background',
            },
          ],
        },
      ],
    },
    {
      id: 'side-by-side-nonisolated',
      type: 'side-by-side',
      title: 'Isolation Inheritance vs nonisolated',
      content: `When a class is annotated with a global actor, ALL members inherit that isolation. Sometimes you need to opt out.

**With inherited isolation (default):**
\`\`\`swift
@MainActor
class ViewModel: ObservableObject {
    let id = UUID()           // MainActor-isolated (even though it's a let!)
    func format() -> String { // MainActor-isolated
        return id.uuidString
    }
}
// Outside: await vm.format() — requires await even though it's pure computation
\`\`\`

**With nonisolated opt-out:**
\`\`\`swift
@MainActor
class ViewModel: ObservableObject {
    nonisolated let id = UUID()    // NOT isolated — accessible without await
    nonisolated func format() -> String {
        return id.uuidString       // OK: only accesses nonisolated state
        // return username          // ERROR: cannot access MainActor state
    }
}
// Outside: vm.format() — no await needed, can run on any thread
\`\`\`

**When to use nonisolated:**
- Immutable properties (\`let\`) that don't need main-thread protection
- Protocol conformance methods like \`Hashable.hash(into:)\` or \`CustomStringConvertible.description\`
- Pure functions that compute a result without touching isolated state
- Properties or methods accessed from background contexts where awaiting would be wasteful`,
    },
    {
      id: 'edge-case-assume-isolated',
      type: 'edge-case',
      title: 'MainActor.assumeIsolated and Legacy Code',
      content: `Sometimes you KNOW you're on the main thread but the compiler doesn't. This happens when bridging with legacy callback-based APIs.

\`\`\`swift
@MainActor
class ViewModel: ObservableObject {
    @Published var items: [String] = []

    func setupLegacyCallback() {
        // This old API calls back on the main thread, but Swift doesn't know that
        LegacyNetworkLib.fetch { [weak self] result in
            // ERROR: cannot access @MainActor property 'items' from non-isolated context
            // self?.items = result

            // Option 1: Task to hop back (introduces a tick of delay)
            Task { @MainActor in
                self?.items = result
            }

            // Option 2: assumeIsolated (synchronous, crashes if NOT on main thread)
            MainActor.assumeIsolated {
                self?.items = result
            }
        }
    }
}
\`\`\`

**assumeIsolated** is a runtime assertion: it checks that you truly ARE on the main thread and crashes if you're not. Use it only when you're 100% certain the callback runs on main. Prefer \`Task { @MainActor in }\` when in doubt — it's always safe but introduces a microtask hop.

**Common pitfall:** Using \`MainActor.run { }\` inside an already-MainActor context. This causes an unnecessary async hop. If you're already on MainActor, just execute the code directly.`,
    },
  ],
  interviewQuestion: {
    question: 'Why is @MainActor important for SwiftUI?',
    hints: [
      'Think about what thread SwiftUI uses to render views and process @Published changes.',
      'Consider what happened before @MainActor — how did developers ensure UI updates were on the main thread?',
      'What does isolation inheritance mean for a ViewModel marked @MainActor?',
    ],
    answer: `@MainActor is critical for SwiftUI because SwiftUI's view rendering system and its observation mechanism (@Published, @StateObject, @ObservedObject) all operate on the main thread. If a @Published property is mutated from a background thread, you get undefined behavior — often manifesting as purple runtime warnings in Xcode, UI glitches, or crashes.

Before @MainActor, developers manually dispatched to the main queue with DispatchQueue.main.async { } every time they updated UI state from a background callback. This was entirely manual — miss one call site and you have a threading bug that only appears intermittently in production. The compiler had no way to help.

@MainActor solves this at compile time. When you mark a ViewModel class as @MainActor, the compiler enforces that ALL its mutable properties and methods are accessed from the main thread. If you try to set a @Published property from a nonisolated context, the code won't compile — the compiler forces you to use 'await' to hop to the MainActor first. This turns a class of runtime bugs into compile-time errors.

Isolation inheritance is the key mechanism: annotating the class propagates the isolation to every stored property and method. The compiler tracks this across your entire call graph. If a background Task tries to write viewModel.items = newData, the compiler demands 'await'. When combined with async/await, the pattern becomes natural — your async method suspends for I/O on a background thread, and when it resumes on MainActor, it safely updates @Published properties.`,
    followUps: [
      'Can you create a custom global actor? When would you use one instead of a regular actor?',
      'What is the difference between MainActor.run { } and MainActor.assumeIsolated { }?',
      'How does nonisolated interact with @MainActor class isolation?',
    ],
  },
  codePuzzle: {
    type: 'predict-output',
    prompt: 'Which lines execute on the main thread?',
    code: `@MainActor
class ViewModel {
    var count = 0

    func increment() {
        count += 1
        print("A: count is \\(count)")
    }

    nonisolated func greet() {
        print("B: hello")
    }
}

let vm = ViewModel()

Task { @MainActor in
    vm.increment()
}

Task.detached {
    vm.greet()
    await vm.increment()
}`,
    solution: 'Line A (inside increment()) always runs on the main thread because ViewModel is @MainActor and increment() inherits that isolation. Line B (inside greet()) runs on whatever thread calls it — in this case a detached task, so it runs on a background thread. The detached task\'s call to await vm.increment() hops to the main thread before executing. So "A: count is 1" runs on main, "B: hello" runs on background, and "A: count is 2" runs on main. The nonisolated keyword is what lets greet() escape MainActor isolation.',
    options: [
      'A runs on main, B runs on background — both increment() calls on main',
      'Everything runs on main because ViewModel is @MainActor',
      'A runs on main, B runs on main — detached task forces background',
      'Compile error — cannot call nonisolated from detached task',
    ],
    correctOptionIndex: 0,
  },
};

export default topic;
