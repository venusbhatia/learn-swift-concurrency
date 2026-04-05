import type { Topic } from '@/types/topic';

const topic: Topic = {
  slug: 'actors',
  order: 8,
  title: 'Actors',
  subtitle: 'Isolated stations for safe sharing',
  icon: '🔒',
  prerequisiteSlugs: ['struct-class-actor', 'async-await', 'task'],
  storyDay: 8,
  storyIntro:
    "Day 8 brings disaster. Two chefs reached for the same knife at the exact same moment — one was slicing tomatoes, the other reaching for it to debone a fish. The knife went flying, tomatoes everywhere, fish ruined. This is a DATA RACE: two workers accessing the same shared resource simultaneously with at least one writing. Your old solution was a clipboard sign-out sheet next to each tool (a DispatchQueue lock), but chefs kept forgetting to sign out. You need a better system: isolated workstations where each chef has their own counter, and if anyone else needs something from that station, they wait in a single-file line. That's an Actor.",
  kitchenMetaphor:
    'An actor is an isolated workstation with a built-in queue. The chef at that station can use all their tools freely. Anyone else must wait in line and ask politely (await). No more knife fights.',
  sections: [
    {
      id: 'concept-data-races',
      type: 'concept',
      title: 'The Data Race Problem',
      content: `A **data race** occurs when two or more threads access the same memory location concurrently, and at least one of them is writing. Data races cause unpredictable behavior: corrupted data, crashes, or — worst of all — bugs that only happen sometimes and are nearly impossible to reproduce.

**Before actors, you had two options:**

1. **Serial DispatchQueue as a lock** — Create a private queue, dispatch all reads and writes through it. This works, but it's entirely manual. Forget the lock in ONE place and you have a data race. The compiler can't help you.

2. **NSLock / os_unfair_lock** — Lower-level locks. Faster but even more error-prone. Forgetting to unlock causes deadlocks. Locking in the wrong order causes deadlocks. The compiler still can't help you.

**Actors solve this at the language level.** The Swift compiler enforces that all access to an actor's mutable state goes through its internal serialization mechanism. You literally cannot write a data race on actor-isolated state — the code won't compile.

**How actors work internally:**
- An actor has a **serial executor** (like a single-file line)
- When you call a method on an actor from outside, your task joins the queue
- Only ONE task executes inside the actor at a time
- From inside the actor, you access properties directly — no await needed
- From outside, every access to mutable state requires \`await\``,
    },
    {
      id: 'code-walkthrough-old-vs-new',
      type: 'code-walkthrough',
      title: 'From DispatchQueue Locks to Actors',
      content: 'Let\'s compare the old manual-lock approach with the actor approach. This is one of the most dramatic improvements in Swift concurrency:',
      codeBlocks: [
        {
          id: 'old-class-lock',
          label: 'Old Way — Class with DispatchQueue Lock',
          code: `class MyDataManager {
    static let instance = MyDataManager()
    var data: [String] = []
    private let lock = DispatchQueue(label: "com.MyApp.MyDataManager")

    func getRandomData(completionHandler: @escaping (_ title: String?) -> ()) {
        lock.async {
            self.data.append(UUID().uuidString)
            completionHandler(self.data.randomElement())
        }
    }
}`,
          steps: [
            {
              lineRange: [1, 4],
              explanation: "A singleton class managing shared data. The 'data' array is mutable and accessed from multiple threads. The private 'lock' DispatchQueue is our manual protection — all access to 'data' must go through this serial queue. But the compiler doesn't enforce this! If someone adds a method that reads 'data' without using 'lock', you have a silent data race.",
              threadIndicator: 'main',
            },
            {
              lineRange: [6, 11],
              explanation: "Every access to 'data' is wrapped in 'lock.async { }'. The serial queue ensures only one block runs at a time. But look at the API: it uses a completion handler, making the caller deal with callbacks. Also notice the @escaping closure — a common source of retain cycles if you forget [weak self]. This is a LOT of boilerplate for thread-safe access.",
              threadIndicator: 'background',
            },
          ],
        },
        {
          id: 'new-actor',
          label: 'New Way — Actor',
          code: `actor MyActorDataManager {
    static let instance = MyActorDataManager()
    var data: [String] = []

    nonisolated let myRandomText = "some text"

    func getRandomData() -> String? {
        self.data.append(UUID().uuidString)
        return self.data.randomElement()
    }

    nonisolated func getSavedData() -> String {
        return "NEW DATA"
    }
}

// Usage from outside:
// let manager = MyActorDataManager.instance
// if let data = await manager.getRandomData() {
//     print(data)
// }
// let text = manager.myRandomText  // No await needed!`,
          steps: [
            {
              lineRange: [1, 3],
              explanation: "Just change 'class' to 'actor' and remove the lock entirely! The actor keyword gives you automatic serialized access. The 'data' array is now actor-isolated — the compiler guarantees no concurrent access. No manual DispatchQueue, no lock.async { }, no risk of forgetting the lock.",
              threadIndicator: 'main',
            },
            {
              lineRange: [5, 5],
              explanation: "The 'nonisolated' keyword on 'myRandomText' tells Swift: this property is safe to access without going through the actor's queue, because it's an immutable 'let' constant. You can read it WITHOUT 'await'. Use nonisolated for properties and methods that don't touch mutable state.",
              threadIndicator: 'main',
            },
            {
              lineRange: [7, 10],
              explanation: "Inside the actor, methods access 'data' directly — no await, no lock. This code looks exactly like a normal class method. The serialization is invisible from the inside. But from OUTSIDE the actor, calling getRandomData() requires 'await' because the caller must wait for their turn in the queue.",
              threadIndicator: 'background',
            },
            {
              lineRange: [12, 14],
              explanation: "A nonisolated function cannot access the actor's mutable state (like 'data'). If you tried to read 'self.data' here, the compiler would give an error. This is the tradeoff: you get synchronous access but lose the ability to touch isolated state. Use nonisolated for pure computations or constant data.",
              threadIndicator: 'main',
            },
            {
              lineRange: [17, 22],
              explanation: "From outside the actor, calling getRandomData() requires 'await'. This is the compiler enforcing thread safety — you MUST acknowledge the suspension point. But myRandomText (nonisolated let) can be accessed directly without await. The compiler knows exactly what's safe and what isn't.",
              threadIndicator: 'main',
            },
          ],
        },
      ],
    },
    {
      id: 'deep-dive-mainactor',
      type: 'deep-dive',
      title: 'MainActor: The Special Chef',
      content: `**MainActor** is a special global actor that runs on the main thread. It's the Swift concurrency replacement for \`DispatchQueue.main\`.

**Why it matters:** UIKit and SwiftUI require all UI updates to happen on the main thread. MainActor guarantees this at compile time.

\`\`\`swift
@MainActor
class ViewModel: ObservableObject {
    @Published var title = "" // Always accessed on main thread

    func updateTitle() {
        title = "New Title" // Safe — we're on MainActor
    }
}
\`\`\`

**Ways to use MainActor:**
- \`@MainActor\` on a class — ALL properties and methods are main-thread isolated
- \`@MainActor\` on a function — just that function runs on the main thread
- \`await MainActor.run { }\` — run a specific block on the main thread from a background context

**Common mistake:** Marking a ViewModel as @MainActor and then doing heavy computation inside it. The computation blocks the main thread and freezes the UI. Move heavy work to a non-isolated async function or a detached task, then hop back to MainActor only for the UI update.

**nonisolated + MainActor:**
If your @MainActor class conforms to a protocol that requires a synchronous method, mark that method as \`nonisolated\` to opt it out of main-actor isolation. But remember: it can't access @Published properties or other isolated state.`,
    },
    {
      id: 'edge-case-reentrancy',
      type: 'edge-case',
      title: 'Actor Reentrancy: The Subtle Trap',
      content: `Actors are NOT reentrant-safe in the way you might expect. Consider this scenario:

\`\`\`swift
actor BankAccount {
    var balance: Int = 100

    func withdraw(amount: Int) async -> Bool {
        guard balance >= amount else { return false }
        // Suspension point! Another task might run here
        try? await Task.sleep(nanoseconds: 1_000_000)
        balance -= amount // balance might have changed!
        return true
    }
}
\`\`\`

Between the guard check and the actual subtraction, there's an \`await\` — a suspension point. While this task is suspended, ANOTHER task could enter the actor and modify 'balance'. When the first task resumes, the guard condition might no longer be true!

**This is actor reentrancy**: while one task is suspended inside an actor, another task can start executing in the same actor.

**The fix:** Never assume state is unchanged across an await point. Re-check conditions after suspension:

\`\`\`swift
func withdraw(amount: Int) async -> Bool {
    try? await Task.sleep(nanoseconds: 1_000_000)
    // Check AFTER the await, not before
    guard balance >= amount else { return false }
    balance -= amount
    return true
}
\`\`\`

This is a critical interview topic. Actors prevent DATA RACES (concurrent access), but they do NOT prevent RACE CONDITIONS (logical ordering issues across suspension points).`,
    },
  ],
  interviewQuestion: {
    question: 'What is an actor in Swift and how does it prevent data races? What is the difference between a data race and a race condition in the context of actors?',
    hints: [
      'Start with what problem actors solve — concurrent access to shared mutable state.',
      'Think about what happens at suspension points (await) inside an actor. Can another task start running?',
      'Consider: actors guarantee no TWO tasks run inside them at the SAME time. But what about sequential interleaving at await points?',
    ],
    answer: `An actor is a reference type in Swift that provides automatic thread-safe access to its mutable state. Like a class, it lives on the heap and is passed by reference. But unlike a class, the compiler enforces that all access to its mutable state from outside is serialized through the actor's internal executor.

When you access an actor's property or method from outside, you must use 'await'. Your task is placed in the actor's queue and waits for its turn. Only one task executes inside the actor at any given time. This eliminates DATA RACES — situations where two threads read/write the same memory simultaneously.

However, actors do NOT prevent RACE CONDITIONS. A race condition is a logical bug where the outcome depends on the timing of operations. Because actors support reentrancy — when a task inside an actor hits an 'await' and suspends, another task can begin executing inside the actor — the actor's state can change between suspension points within a single method.

Example: you check 'if balance >= 100', then await a network call, then subtract 100. Between the check and the subtraction, another task might have already drained the balance. The data race is prevented (no concurrent memory access), but the race condition exists (your logic assumed balance wouldn't change).

The key distinction: data races are MEMORY-LEVEL bugs (undefined behavior, crashes). Race conditions are LOGIC-LEVEL bugs (wrong results, but defined behavior). Actors solve the first completely. The second requires careful programming — re-checking state after suspension points and designing methods to be reentrancy-safe.

The 'nonisolated' keyword allows opting specific properties or methods out of actor isolation. Use it for immutable data (let constants) or pure functions that don't access mutable state, avoiding the overhead of serialized access when it isn't needed.`,
    followUps: [
      'What is the nonisolated keyword and when would you use it on an actor?',
      'How does MainActor differ from a regular actor? Can you have a global actor?',
      'How would you design an actor method to be safe against reentrancy issues?',
    ],
  },
  codePuzzle: {
    type: 'predict-output',
    prompt: 'What will this code print? Both tasks run concurrently.',
    code: `actor Counter {
    var count = 0

    func increment() -> Int {
        count += 1
        return count
    }
}

let counter = Counter()
Task { print(await counter.increment()) }
Task { print(await counter.increment()) }`,
    solution: 'Each Task calls increment() which adds 1 to count and returns it. Because the actor serializes access, the two calls never overlap. One will execute first (printing 1) and the other second (printing 2). The ORDER of "1" and "2" in the output is nondeterministic (either task might go first), but the VALUES will always be 1 and 2 — never two 1s, never a data race. The actor guarantees each increment is atomic.',
    options: [
      '1 and 2 (order may vary)',
      '1 and 1 (both read 0, then increment)',
      '2 and 2 (both see final state)',
      'Compile error — cannot call actor method from Task',
    ],
    correctOptionIndex: 0,
  },
};

export default topic;
