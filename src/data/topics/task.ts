import type { Topic } from '@/types/topic';

const topic: Topic = {
  slug: 'task',
  order: 5,
  title: 'Tasks',
  subtitle: 'Hiring independent workers',
  icon: '👷',
  prerequisiteSlugs: ['async-await'],
  storyDay: 5,
  storyIntro:
    "Day 5, and your restaurant is booming. The problem? Your single-waiter system can't keep up. You need to hire independent workers — each one handles their own job from start to finish. Some are high-priority (the VIP table's order), others can take their time (restocking napkins). You also need the ability to FIRE a worker mid-task if the customer leaves, and workers should be polite enough to YIELD the kitchen aisle when someone more urgent needs to pass. In Swift, these independent workers are called Tasks.",
  kitchenMetaphor:
    'A Task is an independent worker you hire for a specific job. They work on their own, can be given a priority level, can be cancelled if the customer leaves, and can yield to let higher-priority workers through.',
  sections: [
    {
      id: 'concept-what-is-task',
      type: 'concept',
      title: 'What Is a Task?',
      content: `A **Task** is the fundamental unit of concurrency in Swift. Every piece of async code runs inside a task — even if you don't see it explicitly.

**Key properties of a Task:**
- It's a **top-level unit of async work** — like hiring a worker for a specific job
- It runs **concurrently** with other tasks — multiple workers in your kitchen at once
- It has a **priority** — VIP orders get processed first
- It can be **cancelled** — if the customer walks out, stop cooking their order
- It **inherits context** from where it's created — a Task created on the main actor stays on the main actor by default

**Task vs Task.detached:**
- \`Task { }\` — inherits the current actor context. If created on @MainActor, the task runs on the main actor
- \`Task.detached { }\` — completely independent, no inherited context. Like hiring a freelancer who doesn't follow your restaurant's rules

**Task priorities (highest to lowest):**
- \`.high\` / \`.userInitiated\` — VIP table, needs attention NOW
- \`.medium\` — regular customer order
- \`.low\` / \`.utility\` — prep work, can wait
- \`.background\` — overnight deep cleaning, nobody notices if it's slow`,
    },
    {
      id: 'code-walkthrough-fetch',
      type: 'code-walkthrough',
      title: 'A Real-World Task: Fetching an Image',
      content: 'Let\'s walk through a practical example — using a Task to fetch an image from the network and display it in the UI:',
      codeBlocks: [
        {
          id: 'fetch-image-task',
          label: 'Fetching an Image with Task',
          code: `func fetchImage() async {
    try? await Task.sleep(nanoseconds: 5_000_000_000)

    do {
        guard let url = URL(string: "https://picsum.photos/1000") else {
            return
        }
        let (data, _) = try await URLSession.shared.data(from: url)

        await MainActor.run(body: {
            self.image = UIImage(data: data)
        })
    } catch {
        print(error.localizedDescription)
    }
}`,
          steps: [
            {
              lineRange: [1, 2],
              explanation: "The function is marked 'async' — it can only be called with 'await' from within another async context (like a Task). The Task.sleep simulates a 5-second delay — maybe the chef is finishing another order first. Unlike Thread.sleep, this does NOT block a thread; it suspends the task.",
              executionNote: 'Task suspends for 5 seconds, thread is free to do other work',
              threadIndicator: 'suspended',
            },
            {
              lineRange: [4, 7],
              explanation: "We validate the URL inside a guard statement. If the URL is malformed, we bail out early with 'return'. This is standard Swift defensive programming. The 'do' block wraps everything that might throw an error.",
              threadIndicator: 'background',
            },
            {
              lineRange: [8, 8],
              explanation: "This is the key line. 'URLSession.shared.data(from:)' is an async throwing function. The 'try await' means: (1) this might throw an error (try), and (2) this will suspend until the network response arrives (await). The tuple destructuring grabs the data and discards the URLResponse with '_'.",
              executionNote: 'Network request happens here — task suspends until response arrives',
              threadIndicator: 'suspended',
            },
            {
              lineRange: [10, 12],
              explanation: "We have the data! But we need to update 'self.image', which drives the UI. UI updates MUST happen on the main thread. 'await MainActor.run' ensures this closure executes on the main actor (main thread). We create a UIImage from the raw data and assign it.",
              threadIndicator: 'main',
            },
            {
              lineRange: [13, 15],
              explanation: "If anything inside the 'do' block throws (like a network timeout, no internet, or invalid data), we land here. The error is printed but not re-thrown — this function handles its own errors. In production, you might set an error state on the ViewModel instead.",
              threadIndicator: 'background',
            },
          ],
        },
      ],
    },
    {
      id: 'code-walkthrough-cancellation',
      type: 'code-walkthrough',
      title: 'Task Cancellation and Cooperation',
      content: 'Tasks in Swift use COOPERATIVE cancellation. Calling .cancel() sets a flag, but the task itself must check for it. Think of it as telling a worker "you can stop now" rather than forcibly pulling them away:',
      codeBlocks: [
        {
          id: 'cancellation-patterns',
          label: 'Cancellation, Yield, and .task Modifier',
          code: `// Launching a task and cancelling it
let task = Task {
    try? await Task.sleep(nanoseconds: 5_000_000_000)
    // Check if we were cancelled during sleep
    try Task.checkCancellation()
    print("Completed!")
}

// Cancel the task externally
task.cancel()

// Yielding execution to other tasks
func longRunningWork() async {
    for i in 0..<1000 {
        // Do some work
        processItem(i)
        // Be polite: let other tasks run
        await Task.yield()
    }
}

// SwiftUI .task modifier — auto-cancels!
// .task {
//     await viewModel.fetchImage()
// }`,
          steps: [
            {
              lineRange: [1, 7],
              explanation: "We create a Task and store its handle. Inside, Task.sleep is a cancellation point — if the task is cancelled during the sleep, the try? swallows the CancellationError. After sleeping, 'Task.checkCancellation()' explicitly checks: if the task was cancelled, it throws CancellationError and 'Completed!' never prints.",
              threadIndicator: 'background',
            },
            {
              lineRange: [9, 10],
              explanation: "task.cancel() sets the task's cancellation flag. But this is COOPERATIVE — it doesn't forcibly stop the task. The task must check for cancellation itself (via checkCancellation, Task.isCancelled, or an await point). This is like telling a worker 'the customer left' — they finish their current action, then stop.",
              threadIndicator: 'main',
            },
            {
              lineRange: [12, 20],
              explanation: "Task.yield() is a politeness mechanism. In a long loop, calling yield() gives the Swift runtime a chance to run other tasks. Without it, a tight loop could starve other tasks. Think of it as a worker stepping aside in a narrow kitchen aisle to let others pass.",
              executionNote: 'yield() is a suspension point — the task may resume on a different thread',
              threadIndicator: 'background',
            },
            {
              lineRange: [22, 24],
              explanation: "The SwiftUI .task modifier is the recommended way to launch tasks in views. It automatically cancels the task when the view disappears — perfect for navigation. No manual cleanup needed. This prevents the common bug of updating state on a view that's already been dismissed.",
              threadIndicator: 'main',
            },
          ],
        },
      ],
    },
    {
      id: 'edge-case-priority-inversion',
      type: 'edge-case',
      title: 'Priority and the Inheritance Trap',
      content: `**Task Priority Escalation:**
If a high-priority task awaits the result of a low-priority task, Swift may temporarily ESCALATE the low-priority task to prevent priority inversion. This is like a VIP customer waiting on a side dish — the kitchen bumps that dish up in the queue.

**The Inheritance Trap with Task { }:**
\`\`\`swift
@MainActor
class ViewModel: ObservableObject {
    func load() {
        Task {
            // This inherits @MainActor!
            // Heavy computation here blocks the UI
            let result = heavyComputation() // BAD — blocks main thread
        }
        Task.detached(priority: .background) {
            // This does NOT inherit @MainActor
            // Safe for heavy computation
            let result = await self.heavyComputation()
        }
    }
}
\`\`\`

A \`Task { }\` created inside a @MainActor context inherits that actor context. Your "background work" actually runs on the main thread! Use \`Task.detached\` or explicitly hop off the main actor when you need true background execution.`,
    },
  ],
  interviewQuestion: {
    question: 'Explain how Task cancellation works in Swift. Why is it called "cooperative" and what are the implications for developers?',
    hints: [
      'Think about what happens when you call task.cancel() — does the task stop immediately?',
      'Consider the built-in cancellation check points: Task.checkCancellation(), Task.isCancelled, and what happens at await points.',
      'Why would Apple choose cooperative cancellation over forceful termination? Think about resource cleanup.',
    ],
    answer: `Task cancellation in Swift is COOPERATIVE, meaning calling task.cancel() does NOT forcibly stop the task. Instead, it sets a Boolean cancellation flag on the task. The task itself is responsible for checking this flag and responding appropriately.

There are several ways a task can check for cancellation:

1. **Task.checkCancellation()** — A throwing function. If the task is cancelled, it throws CancellationError. Use this when you want to bail out immediately.

2. **Task.isCancelled** — A Boolean property. Check it in loops or conditional logic when you want to handle cancellation gracefully (e.g., save partial progress before stopping).

3. **Await points** — Many built-in async functions (like URLSession.data, Task.sleep) automatically check for cancellation and throw CancellationError.

The reason cancellation is cooperative is SAFETY. Forceful cancellation (like killing a thread) can leave resources in an inconsistent state — open file handles, half-written data, leaked memory. Cooperative cancellation lets the task clean up properly: close connections, save state, release resources.

The implication for developers: you MUST design your async code to be cancellation-aware. Long-running tasks should periodically check Task.isCancelled or call Task.checkCancellation(). If you write a tight loop without any cancellation checks, calling task.cancel() has no effect — the task runs to completion regardless.

In SwiftUI, the .task modifier automatically cancels its task when the view disappears, which makes cancellation handling essential for preventing wasted work and memory leaks.`,
    followUps: [
      'What is the difference between Task { } and Task.detached { }? When would you use each?',
      'How does task priority work, and what is priority escalation?',
      'What happens if you never check for cancellation inside a long-running task?',
    ],
  },
  codePuzzle: {
    type: 'predict-output',
    prompt: 'What will be printed? Assume the task is cancelled immediately after creation.',
    code: `let task = Task {
    print("A")
    try? await Task.sleep(nanoseconds: 2_000_000_000)
    print("B")
    guard !Task.isCancelled else {
        print("C")
        return
    }
    print("D")
}
task.cancel()`,
    solution: '"A" prints immediately when the task starts. The Task.sleep is a cancellation point — since the task is cancelled, the try? swallows the CancellationError and execution continues. "B" prints next. Then Task.isCancelled is true (we called cancel()), so the guard fails and "C" prints. "D" never prints because we returned. The output is A, B, C.',
    options: [
      'A, B, C',
      'A only — task is cancelled before B',
      'A, B, D — isCancelled is false',
      'Nothing — cancel() stops the task immediately',
    ],
    correctOptionIndex: 0,
  },
};

export default topic;
