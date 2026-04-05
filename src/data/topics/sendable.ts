import type { Topic } from '@/types/topic';

const topic: Topic = {
  slug: 'sendable',
  order: 9,
  title: 'Sendable',
  subtitle: 'Food safety labels',
  icon: '✅',
  prerequisiteSlugs: ['actors'],
  storyDay: 16,
  storyIntro:
    "Day 16, and the health inspector is visiting your restaurant. They point to a tray of sushi being carried between the cold prep station and the hot grill station. \"How do you know that tray is safe to move between stations?\" they ask. You realize: not everything CAN safely move between workstations. A sealed container of rice? Fine — it's self-contained. A shared cutting board that two chefs are using simultaneously? Dangerous — someone could get hurt.\n\nIn Swift concurrency, \"stations\" are actors and tasks running on different threads. The `Sendable` protocol is the health inspector's stamp of approval — it marks types that are **safe to pass between concurrent contexts**. Value types (structs, enums) are usually naturally Sendable because each context gets its own copy. Reference types (classes) are dangerous because multiple contexts could share the same instance and mutate it simultaneously.\n\nThe compiler enforces Sendable at every boundary: passing data into a Task, sending values to an actor, closures captured by concurrent code. If it's not Sendable, the compiler won't let it cross the boundary.",
  kitchenMetaphor:
    'Only food-safe containers can be passed between stations.',
  sections: [
    {
      id: 'concept-what-is-sendable',
      type: 'concept',
      title: 'What Does Sendable Mean?',
      content: `\`Sendable\` is a **marker protocol** — it has no methods or properties. It's a promise to the compiler: "This type is safe to share across concurrency boundaries."

**Why does it matter?** When you pass a value from one task or actor to another, that value might be accessed from multiple threads simultaneously. If the type has mutable shared state, you get data races — the most insidious bugs in concurrent programming.

**What makes a type Sendable:**
- **Value types** (structs, enums) are Sendable when all their stored properties are also Sendable. Since value types are copied, each context gets its own independent copy — no sharing.
- **Actors** are always Sendable because their internal state is protected by actor isolation.
- **Classes** are Sendable ONLY if they are \`final\`, have only immutable (\`let\`) stored properties, and those properties are themselves Sendable. Or, they use internal synchronization (locks).
- **Functions/closures** are Sendable when marked with \`@Sendable\`, meaning they don't capture mutable state.

**The compiler auto-conforms** many standard types: Int, String, Bool, Array (when Element is Sendable), Dictionary (when Key and Value are Sendable), Optional (when Wrapped is Sendable), etc.`,
    },
    {
      id: 'code-walkthrough-sendable-types',
      type: 'code-walkthrough',
      title: 'Sendable Conformance in Practice',
      content:
        'Let\'s see which types conform to Sendable and why:',
      codeBlocks: [
        {
          id: 'sendable-examples',
          label: 'Sendable vs Non-Sendable Types',
          code: `// Automatically Sendable — value type with Sendable fields
struct MenuItem: Sendable {
    let name: String
    let price: Double
    let isVegetarian: Bool
}

// NOT Sendable — class with mutable state
class ShoppingCart {
    var items: [MenuItem] = []  // mutable shared state = data race risk
}

// Sendable class — final + immutable properties only
final class AppConfig: Sendable {
    let apiBaseURL: String
    let maxRetries: Int

    init(apiBaseURL: String, maxRetries: Int) {
        self.apiBaseURL = apiBaseURL
        self.maxRetries = maxRetries
    }
}

// Enum — automatically Sendable when associated values are
enum OrderStatus: Sendable {
    case pending
    case preparing(estimatedMinutes: Int)
    case ready(item: MenuItem)
    case cancelled(reason: String)
}`,
          steps: [
            {
              lineRange: [1, 6],
              explanation:
                "A struct with only let properties of Sendable types (String, Double, Bool). This is naturally Sendable — when you pass it across a concurrency boundary, a copy is made. Each task gets its own independent MenuItem.",
              threadIndicator: 'background',
            },
            {
              lineRange: [8, 11],
              explanation:
                "A class with a var property. This is NOT Sendable because classes are reference types — two tasks could hold references to the same ShoppingCart and mutate 'items' simultaneously. The compiler will reject this if you try to send it across boundaries.",
              threadIndicator: 'background',
            },
            {
              lineRange: [13, 21],
              explanation:
                "A final class with only let properties can be Sendable. Since properties are immutable and the class is final (no subclass can add mutable state), it's safe to share the reference — nobody can mutate it. This is a common pattern for configuration objects.",
              threadIndicator: 'background',
            },
            {
              lineRange: [24, 29],
              explanation:
                "Enums are value types, so they're Sendable as long as all associated values are Sendable. MenuItem, Int, and String are all Sendable, so OrderStatus automatically qualifies.",
              threadIndicator: 'background',
            },
          ],
        },
      ],
    },
    {
      id: 'code-walkthrough-unchecked-sendable',
      type: 'code-walkthrough',
      title: '@unchecked Sendable — The Escape Hatch',
      content:
        'Sometimes you KNOW a type is thread-safe (because you use locks internally) but the compiler can\'t verify it. That\'s where @unchecked Sendable comes in:',
      codeBlocks: [
        {
          id: 'unchecked-sendable',
          label: '@unchecked Sendable with Internal Locking',
          code: `import Foundation

final class ThreadSafeCache<Key: Hashable & Sendable,
                            Value: Sendable>: @unchecked Sendable {
    private let lock = NSLock()
    private var storage: [Key: Value] = [:]

    func get(_ key: Key) -> Value? {
        lock.lock()
        defer { lock.unlock() }
        return storage[key]
    }

    func set(_ key: Key, value: Value) {
        lock.lock()
        defer { lock.unlock() }
        storage[key] = value
    }
}

// Usage across concurrency boundaries
let cache = ThreadSafeCache<String, Data>()

Task {
    cache.set("user", value: userData)
}

Task {
    if let data = cache.get("user") {
        print("Got cached data: \\(data.count) bytes")
    }
}`,
          steps: [
            {
              lineRange: [3, 4],
              explanation:
                "We declare the class as @unchecked Sendable. This tells the compiler: 'Trust me, this type is thread-safe even though you can't verify it.' The 'unchecked' keyword makes it clear this is an opt-out — the burden of proof is on you.",
              threadIndicator: 'background',
            },
            {
              lineRange: [5, 6],
              explanation:
                "The class HAS mutable state (storage dictionary) — normally disqualifying for Sendable. But we protect it with an NSLock. Every access goes through the lock, preventing data races.",
              threadIndicator: 'background',
            },
            {
              lineRange: [8, 12],
              explanation:
                "Read access locks before reading and unlocks after (defer ensures unlock even if we return early). This makes concurrent reads safe — only one thread can read at a time.",
              threadIndicator: 'background',
            },
            {
              lineRange: [23, 31],
              explanation:
                "Because the cache is Sendable, we can use it freely across Task boundaries. Two tasks can call set and get concurrently without data races — the lock inside the cache handles synchronization.",
              threadIndicator: 'background',
            },
          ],
        },
      ],
    },
    {
      id: 'edge-case-sendable-closures',
      type: 'edge-case',
      title: '@Sendable Closures and Common Pitfalls',
      content: `Closures that cross concurrency boundaries must be \`@Sendable\`. This means they cannot capture mutable local variables:

**Task closures are @Sendable:**
\`\`\`swift
var counter = 0
Task {
    counter += 1  // Error: mutation of captured var 'counter'
}
\`\`\`

**Actor method parameters can require @Sendable:**
\`\`\`swift
actor Kitchen {
    func prepare(using recipe: @Sendable () -> Meal) { ... }
}
\`\`\`

**Common pitfall — capturing self in a class:**
\`\`\`swift
class ViewController: UIViewController {
    var name = "Hello"

    func startTask() {
        Task {
            print(name)  // Warning: capture of non-Sendable 'self'
        }
    }
}
\`\`\`
UIViewController is not Sendable (it has mutable state and isn't thread-safe). Capturing it in a Task closure triggers a warning. The fix: make the view controller MainActor-isolated (\`@MainActor class ViewController\`), or capture only the Sendable values you need:
\`\`\`swift
func startTask() {
    let capturedName = name  // String is Sendable
    Task {
        print(capturedName)  // OK — captured a Sendable value
    }
}
\`\`\``,
    },
    {
      id: 'deep-dive-sendable-evolution',
      type: 'deep-dive',
      title: 'Sendable Checking Modes and the Future',
      content: `Swift is gradually tightening Sendable enforcement across compiler versions:

**Swift 5.x — Warnings only:**
In most projects, Sendable violations are warnings. You can increase strictness with the \`-strict-concurrency=complete\` compiler flag, which turns all Sendable warnings into errors.

**Swift 6 — Errors by default:**
Swift 6 enables complete concurrency checking by default. All Sendable violations become compile-time errors. This is a huge shift — code that compiled with warnings in Swift 5 may not compile in Swift 6.

**Preparing your code for Swift 6:**
1. Enable \`-strict-concurrency=complete\` in your build settings now
2. Fix all warnings — mark types as Sendable where appropriate
3. Use \`@MainActor\` on UI classes to avoid Sendable issues with view controllers
4. Use \`@unchecked Sendable\` sparingly and only with proper internal synchronization

**Global variables and Sendable:**
\`\`\`swift
// Error in Swift 6 — mutable global state is a data race
var globalCache: [String: Data] = [:]

// OK — immutable globals are fine
let defaultTimeout: TimeInterval = 30

// OK — actor-protected global
actor GlobalState {
    static let shared = GlobalState()
    var cache: [String: Data] = [:]
}
\`\`\`

**When to use @unchecked Sendable:**
- Wrapping thread-safe C/Objective-C types the compiler doesn't know about
- Types using internal locks, queues, or atomics for synchronization
- NEVER as a shortcut to silence warnings without actual thread safety`,
    },
  ],
  interviewQuestion: {
    question:
      'What does Sendable guarantee and when would you use @unchecked Sendable?',
    hints: [
      'Think about what "safe to share across concurrency boundaries" means concretely.',
      'Consider the difference between value types and reference types with respect to Sendable.',
      'Think about cases where YOU know something is thread-safe but the compiler cannot verify it.',
    ],
    answer: `Sendable is a marker protocol that guarantees a type is safe to pass across concurrency boundaries — between tasks, to actors, or into @Sendable closures. "Safe" means no data races can occur: either the value is copied (value types), the shared reference is immutable (final class with let properties), or access is serialized (actors).

The compiler automatically checks Sendable conformance. For structs and enums, it verifies all stored properties/associated values are themselves Sendable. For classes, it requires the class to be final with only immutable stored properties. If any property is mutable or non-Sendable, the compiler rejects the conformance.

\`@unchecked Sendable\` is an escape hatch for types that ARE thread-safe but use mechanisms the compiler can't verify — internal locks (NSLock, os_unfair_lock), dispatch queues for synchronization, or atomic operations. By marking a type \`@unchecked Sendable\`, you tell the compiler "I take responsibility for thread safety." The compiler stops checking and trusts you completely.

Use \`@unchecked Sendable\` sparingly and only when you have genuine internal synchronization. Common legitimate cases: thread-safe caches with locks, wrappers around Objective-C types that are documented as thread-safe, or types using os_unfair_lock for atomic access. Never use it as a shortcut to silence compiler warnings without actual thread safety — that just hides data races that will crash in production.`,
    followUps: [
      'How does Swift 6 change Sendable enforcement compared to Swift 5?',
      'Why are actors automatically Sendable?',
      'How would you make a UIViewController work safely with Task closures?',
    ],
  },
  codePuzzle: {
    type: 'predict-output',
    prompt:
      'Which of the following types will the compiler accept as Sendable in strict concurrency mode?',
    code: `struct Point: Sendable {
    let x: Double
    let y: Double
}

class Label: Sendable {
    var text: String = "Hello"
}

final class ID: Sendable {
    let value: UUID
    init() { self.value = UUID() }
}

struct Container: Sendable {
    let point: Point
    let id: ID
}`,
    solution:
      'Point is Sendable (struct with Sendable let properties). Label will NOT compile as Sendable — it is a class with a mutable var property, and the compiler cannot guarantee thread safety. ID is Sendable — it is a final class with only an immutable let property of a Sendable type (UUID). Container is Sendable — both its properties (Point and ID) are Sendable. So Point, ID, and Container compile; Label does not.',
    options: [
      'All four types compile as Sendable',
      'Only Point compiles — classes cannot be Sendable',
      'Point, ID, and Container compile — Label fails due to var property',
      'Point and Container compile — all classes fail',
    ],
    correctOptionIndex: 2,
  },
};

export default topic;
