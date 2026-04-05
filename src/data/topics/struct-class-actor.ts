import type { Topic } from '@/types/topic';

const topic: Topic = {
  slug: 'struct-class-actor',
  order: 2,
  title: 'Struct vs Class vs Actor',
  subtitle: 'Organizing your kitchen storage',
  icon: '📦',
  prerequisiteSlugs: ['do-catch-try-throws'],
  storyDay: 2,
  storyIntro:
    "Day 2 at the restaurant, and your kitchen is a mess. Ingredients are everywhere — some chefs grab their own fresh copies from the pantry shelf (fast, no conflict), while others share a single jar from the walk-in fridge (convenient, but two chefs reaching for it at once means trouble). You realize you need three storage systems: quick-access shelves where every chef gets their own copy, shared lockers in the back for things that must be centralized, and locked cages for the most precious items — where only one person can access them at a time. Welcome to the world of Structs, Classes, and Actors.",
  kitchenMetaphor:
    'Structs are your pantry shelves — every chef grabs a personal copy. Classes are shared lockers in the walk-in fridge — everyone references the same item. Actors are locked cages — shared but only one chef can reach in at a time.',
  sections: [
    {
      id: 'concept-value-vs-reference',
      type: 'concept',
      title: 'Value Types vs Reference Types',
      content: `The most fundamental distinction in Swift is between **value types** and **reference types**. Understanding this is like understanding the difference between a photocopy and a shared document.

**Value Types (Struct, Enum, String, Int, Array, etc.)**
- Stored on the **Stack** — a fast, organized shelf right next to the chef
- When you assign a value type to a new variable, Swift makes a **copy**
- Each copy is independent — changing one never affects the other
- Inherently **thread-safe** because no two threads share the same instance
- Think: every chef has their own cutting board. If one chef scratches theirs, nobody else is affected

**Reference Types (Class, Function, Actor)**
- Stored on the **Heap** — a shared storage room that requires more overhead to manage
- When you assign a reference type to a new variable, both variables **point to the same object**
- Changing one reference changes what everyone sees
- Classes are **NOT thread-safe** — two chefs grabbing the same shared knife at the same time is a recipe for disaster
- Actors are the exception: they ARE reference types on the heap, but they have a built-in lock

**When to use each:**
- **Structs** → Data models, SwiftUI Views, anything you want to be copyable and safe
- **Classes** → ViewModels (ObservableObject requires a class), UIKit view controllers, when you need inheritance
- **Actors** → Shared managers, caches, any mutable state accessed from multiple threads`,
    },
    {
      id: 'code-walkthrough-types',
      type: 'code-walkthrough',
      title: 'Defining and Using All Three Types',
      content: 'Let\'s define a struct, a class, and an actor side by side, then see how they behave differently when you try to share data:',
      codeBlocks: [
        {
          id: 'three-types-definition',
          label: 'Struct vs Class vs Actor Definitions',
          code: `struct MyStruct {
    var title: String
}

class MyClass {
    var title: String
    init(title: String) {
        self.title = title
    }
    func updateTitle(newTitle: String) {
        title = newTitle
    }
}

actor MyActor {
    var title: String
    init(title: String) {
        self.title = title
    }
    func updateTitle(newTitle: String) {
        title = newTitle
    }
}`,
          steps: [
            {
              lineRange: [1, 3],
              explanation: "A struct is the simplest storage type. It lives on the Stack — think of a recipe card you photocopy for each chef. No initializer needed here because Swift auto-generates a memberwise init for structs. The 'var' means the property is mutable on the copy.",
              threadIndicator: 'main',
            },
            {
              lineRange: [5, 12],
              explanation: "A class lives on the Heap. Unlike structs, classes require an explicit init. The key difference: when you hand this to another chef, you're handing them the SAME object, not a copy. The updateTitle method mutates the shared instance — every reference sees the change. This is NOT thread-safe.",
              threadIndicator: 'main',
            },
            {
              lineRange: [14, 22],
              explanation: "An actor looks almost identical to a class, but the 'actor' keyword gives it automatic thread safety. Under the hood, Swift ensures only one task can execute inside the actor at a time. To call updateTitle or read 'title' from outside, you MUST use 'await'. It's like a locked cage — you wait in line for your turn.",
              threadIndicator: 'main',
            },
          ],
        },
        {
          id: 'behavior-test',
          label: 'Copy vs Reference Behavior',
          code: `// STRUCT: Creates a COPY
var structA = MyStruct(title: "Starting title")
var structB = structA
structB.title = "New title"
print(structA.title) // "Starting title" — NOT affected!
print(structB.title) // "New title"

// CLASS: Creates a REFERENCE
let classA = MyClass(title: "Starting title")
let classB = classA
classB.updateTitle(newTitle: "New title")
print(classA.title) // "New title" — BOTH changed!
print(classB.title) // "New title"

// ACTOR: Like class but requires 'await'
let actorA = MyActor(title: "Starting title")
await actorA.updateTitle(newTitle: "New title")
let title = await actorA.title
print(title) // "New title"`,
          steps: [
            {
              lineRange: [1, 6],
              explanation: "With structs, 'var structB = structA' creates an entirely independent copy. Changing structB's title has zero effect on structA. This is like photocopying a recipe — scribbling on your copy doesn't change the original. This copy-on-assign behavior is why structs are inherently thread-safe.",
              threadIndicator: 'main',
            },
            {
              lineRange: [8, 13],
              explanation: "With classes, 'let classB = classA' does NOT copy. Both variables now point to the SAME object on the heap. When classB updates the title, classA sees the change too — they're looking at the same locker. Notice classA is declared with 'let', but we can still mutate its properties because 'let' only prevents reassigning the reference, not mutating the object.",
              threadIndicator: 'main',
            },
            {
              lineRange: [15, 19],
              explanation: "The actor behaves like a class (reference type, shared on the heap), but every access from outside requires 'await'. This is Swift's way of enforcing serialized access — your code suspends until the actor is free. No manual locks, no DispatchQueues. The compiler enforces safety at build time.",
              threadIndicator: 'main',
            },
          ],
        },
      ],
    },
    {
      id: 'deep-dive-stack-heap',
      type: 'deep-dive',
      title: 'Stack vs Heap: Why It Matters for Performance',
      content: `Understanding where your data lives isn't just academic — it has real performance implications.

**The Stack** (where structs live)
- Operates in Last-In-First-Out order, like a stack of plates
- Allocation is nearly instant — just move a pointer
- Deallocation is automatic when the scope exits
- Each thread has its own stack, so no synchronization needed
- Downside: limited size, data must have a known size at compile time

**The Heap** (where classes and actors live)
- A large, shared pool of memory
- Allocation requires finding a free block — slower than stack
- Deallocation uses **ARC (Automatic Reference Counting)** — Swift counts how many references point to an object and frees it when the count hits zero
- Shared across threads, so access needs synchronization
- Upside: flexible size, objects can outlive the scope that created them

**The Interview Gotcha:** Interviewers love asking "Are structs always on the stack?" The answer is **no**. If a struct is captured by a closure or stored as a property of a class, it may end up on the heap. But conceptually, value semantics still apply — you always get copy behavior regardless of where the bits physically live.`,
    },
    {
      id: 'edge-case-class-let',
      type: 'edge-case',
      title: 'The "let" Trap with Classes',
      content: `A common source of confusion: if you declare a class instance with 'let', you might think it's immutable. It's not!

**With structs**, 'let' means truly immutable — you cannot change any property.
**With classes**, 'let' only means you can't reassign the variable to a different object. But you CAN still mutate the object's properties through that reference.

\`\`\`swift
let myClass = MyClass(title: "Hello")
myClass.updateTitle(newTitle: "World") // This WORKS!
// myClass = MyClass(title: "Other") // This FAILS — can't reassign 'let'
\`\`\`

Think of it this way: 'let' on a class is like a permanent name badge for a locker. You can't change WHICH locker the badge points to, but you can absolutely change what's INSIDE the locker. This is a favorite interview question because it tests whether you truly understand value vs reference semantics.`,
    },
  ],
  interviewQuestion: {
    question: 'What are the key differences between a struct, a class, and an actor in Swift? When would you choose each one?',
    hints: [
      'Start with the fundamental distinction: value type vs reference type. Where does each live in memory?',
      'Think about what happens when you assign one variable to another — copy or shared reference?',
      'Consider thread safety: which ones are safe to use across concurrent tasks without extra work?',
    ],
    answer: `Structs are VALUE types stored on the stack. When you assign a struct to a new variable, Swift creates an independent copy. Changing one copy never affects the other. This makes structs inherently thread-safe because no two threads share the same instance. Use structs for data models, SwiftUI views, and any time you want predictable copy semantics.

Classes are REFERENCE types stored on the heap. When you assign a class instance to a new variable, both variables point to the same object. Changes through one reference are visible through all references. Classes support inheritance and are required for ObservableObject in SwiftUI. However, classes are NOT thread-safe — concurrent access to mutable state requires manual synchronization (locks, queues, etc.).

Actors are also REFERENCE types on the heap, but they provide automatic thread safety through actor isolation. The Swift compiler enforces that all access to an actor's mutable state from outside the actor goes through an 'await' call, which serializes access. Only one task can execute inside an actor at a time. Use actors for shared mutable state that multiple tasks need to access — like a data cache, a network manager, or any singleton with mutable properties.

The key tradeoff: structs are fast and safe but create copies; classes are flexible and shared but unsafe; actors are shared AND safe but require async access.`,
    followUps: [
      'Can a struct contain a class property? What happens to thread safety in that case?',
      'What is ARC and how does it apply to classes and actors but not structs?',
      'What does the nonisolated keyword do on an actor, and when would you use it?',
    ],
  },
  codePuzzle: {
    type: 'predict-output',
    prompt: 'What will be printed when this code runs?',
    code: `struct Chef {
    var name: String
}

var chefA = Chef(name: "Alice")
var chefB = chefA
chefB.name = "Bob"

print("A: \\(chefA.name), B: \\(chefB.name)")`,
    solution: 'Because Chef is a struct (value type), "var chefB = chefA" creates an independent copy. Changing chefB.name to "Bob" does NOT affect chefA. So chefA.name is still "Alice" and chefB.name is "Bob".',
    options: [
      'A: Alice, B: Bob',
      'A: Bob, B: Bob',
      'A: Alice, B: Alice',
      'Compile error — structs are immutable',
    ],
    correctOptionIndex: 0,
  },
  whatHappensNext: {
    title: 'Value vs Reference — Predict the Outcome',
    steps: [
      {
        codeLine: 'var chefB = chefA  // Chef is a struct',
        question: 'You copy chefA into chefB. They\'re both structs. What happened?',
        options: [
          { label: 'chefB is a completely independent copy', emoji: '📋', isCorrect: true },
          { label: 'chefB points to the same chef as chefA', emoji: '👉', isCorrect: false },
        ],
        explanation: 'Structs are value types — like photocopying a recipe card. chefB gets their own card. Changing one card doesn\'t affect the other.',
      },
      {
        codeLine: 'var managerB = managerA  // Manager is a class',
        question: 'Now you copy managerA into managerB. Manager is a class. What happened?',
        options: [
          { label: 'managerB is an independent copy', emoji: '📋', isCorrect: false },
          { label: 'Both variables point to the SAME manager', emoji: '👉', isCorrect: true },
        ],
        explanation: 'Classes are reference types — like giving two people the same locker key. Both managerA and managerB open the same locker. Change one, the other sees it too.',
      },
      {
        codeLine: 'managerB.name = "Bob"',
        question: 'You changed managerB\'s name to "Bob". What is managerA.name now?',
        options: [
          { label: 'Still "Alice" — they\'re separate', emoji: '🙂', isCorrect: false },
          { label: '"Bob" — they share the same object!', emoji: '😱', isCorrect: true },
        ],
        explanation: 'This is the reference type trap! Since both variables point to the same object on the heap, changing one changes both. This is why actors exist — to prevent exactly this kind of shared mutation.',
      },
      {
        codeLine: 'await actor.updateName("Charlie")',
        question: 'Now it\'s an actor. Why do you need "await"?',
        options: [
          { label: 'Actors process one request at a time — you wait in line', emoji: '🎟️', isCorrect: true },
          { label: 'updateName is slow and takes time', emoji: '⏳', isCorrect: false },
          { label: 'It\'s just Swift syntax — doesn\'t mean anything', emoji: '🤷', isCorrect: false },
        ],
        explanation: 'Actors are like a chef\'s station with a single door. Only one person can enter at a time. You "await" because you\'re waiting for your turn. This is what makes actors thread-safe — serial access, no data races.',
      },
    ],
  },
  fillKeyword: {
    title: 'Pick the Right Type',
    codeTemplate: `// A point with x,y coordinates
// Should be cheap to copy, no shared state
{{blank1}} Point {
    var x: Double
    var y: Double
}

// A database connection
// Should be shared, not copied
{{blank2}} DatabaseConnection {
    var isConnected: Bool
    func query(_ sql: String) -> [Row] { ... }
}

// A bank account
// Must be thread-safe, one access at a time
{{blank3}} BankAccount {
    private var balance: Double
    func deposit(_ amount: Double) { ... }
}`,
    blanks: [
      { id: 'blank1', correctAnswer: 'struct', distractors: ['class', 'actor'], hint: 'Value types live on the stack and are copied — perfect for small data' },
      { id: 'blank2', correctAnswer: 'class', distractors: ['struct', 'actor'], hint: 'Reference types are shared — good for resources you don\'t want to duplicate' },
      { id: 'blank3', correctAnswer: 'actor', distractors: ['struct', 'class'], hint: 'This type provides built-in thread safety with serial access' },
    ],
  },
  quickChecks: [
    {
      question: 'Structs are stored on the stack and classes on the heap — true?',
      options: ['True', 'It\'s more nuanced'],
      correctIndex: 1,
      explanation: 'Generally yes, but Swift can optimize. The key difference is value semantics (copy) vs reference semantics (share), not where they\'re stored.',
    },
    {
      question: 'Can two variables point to the same struct instance?',
      options: ['Yes', 'No — each gets its own copy'],
      correctIndex: 1,
      explanation: 'That\'s the whole point! Structs copy on assignment. Two variables, two independent instances.',
    },
  ],
};

export default topic;
