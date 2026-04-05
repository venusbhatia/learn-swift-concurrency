import type { Topic } from '@/types/topic';

const topic: Topic = {
  slug: 'strong-self',
  order: 11,
  title: 'Strong Self & Memory',
  subtitle: 'Fixing the leaky pipes',
  icon: '💧',
  prerequisiteSlugs: ['task'],
  storyDay: 20,
  storyIntro:
    "Day 20. You walk into the kitchen and your shoes are soaked. Water everywhere. The plumber explains: some pipes have circular connections — pipe A feeds into pipe B, and pipe B feeds back into pipe A. Neither pipe can shut off because each one is keeping the other alive. This is a **retain cycle**. In your old kitchen, closures that captured 'self' created invisible pipes back to the object that owned them. If the object also held a reference to the closure, you got a loop. Water (memory) leaked until the whole kitchen flooded.\n\nBut today you're upgrading to Swift concurrency's new plumbing. **Tasks** handle self-references differently than closures. A Task body is NOT an escaping closure in the traditional sense — it's a new top-level unit of async work. Tasks capture 'self' strongly by default, but here's the key difference: structured tasks (like those in a TaskGroup) are guaranteed to complete before their parent scope exits, so the strong reference is always released. Unstructured Tasks (Task { }) live independently and hold 'self' until the task finishes.\n\nThe question that trips up every interview candidate: do you need [weak self] in a Task? The answer is nuanced, and today you'll learn exactly when you do and when you don't.",
  kitchenMetaphor:
    'Water pipes leaking — strong vs weak connections, task cancellation.',
  sections: [
    {
      id: 'concept-retain-cycles',
      type: 'concept',
      title: 'Retain Cycles: The Circular Pipe Problem',
      content: `A **retain cycle** happens when two objects hold strong references to each other, preventing either from being deallocated. In Swift, this most commonly occurs with closures.

**The classic pattern:**
- Object A stores a closure as a property
- That closure captures \`self\` (Object A) strongly
- Object A can never be deallocated because the closure keeps it alive
- The closure can never be deallocated because Object A keeps it alive
- Memory leaks forever

**The traditional fix:** \`[weak self]\` in the closure capture list. This creates a weak reference that doesn't prevent deallocation. When the object is deallocated, the weak reference becomes nil.

**But Swift concurrency changes the rules.** Tasks are not stored closures. Understanding when you need \`[weak self]\` in the async world requires understanding how Tasks capture and release references.`,
    },
    {
      id: 'code-walkthrough-classic-leak',
      type: 'code-walkthrough',
      title: 'The Classic Retain Cycle vs Task Capture',
      content: 'Let us compare the old closure-based retain cycle with how Tasks handle the same situation:',
      codeBlocks: [
        {
          id: 'timer-retain-cycle',
          label: 'Retain Cycle with Timer (Classic Problem)',
          code: `class Poller {
    var timer: Timer?
    var count = 0

    func startPolling() {
        // BUG: Timer holds strong ref to closure,
        // closure holds strong ref to self,
        // self holds strong ref to timer — CYCLE!
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            self.count += 1
            print("Poll #\\(self.count)")
        }
    }

    func stopPolling() {
        timer?.invalidate()
    }

    deinit {
        print("Poller deallocated")  // Never called!
    }
}`,
          steps: [
            {
              lineRange: [1, 3],
              explanation: "Poller owns a Timer (strong reference via the 'timer' property). The Timer is a stored property — as long as Poller is alive, the Timer stays alive.",
              threadIndicator: 'main',
            },
            {
              lineRange: [9, 12],
              explanation: "The closure captures 'self' strongly (no [weak self]). Now we have a cycle: Poller -> timer -> closure -> self (Poller). Even if nothing else references this Poller, it can never be freed. The 'deinit' on line 20 will NEVER be called.",
              threadIndicator: 'main',
              executionNote: 'Retain cycle formed — memory leak',
            },
            {
              lineRange: [15, 17],
              explanation: "stopPolling() invalidates the timer, which WOULD break the cycle — but only if someone calls it. If the Poller is dropped without calling stopPolling(), the cycle persists forever. This is why [weak self] is the safer fix: it prevents the cycle regardless of call order.",
              threadIndicator: 'main',
            },
          ],
        },
        {
          id: 'task-capture',
          label: 'Task Capture — No Cycle',
          code: `class ProfileLoader {
    var name = ""

    func loadProfile() {
        // Task captures self strongly — but there's NO cycle!
        Task {
            let result = try await API.fetchProfile()
            self.name = result.name
            print("Loaded: \\(self.name)")
        }
        // Task is NOT stored as a property — no cycle
    }

    deinit {
        print("ProfileLoader deallocated")  // WILL be called
    }
}`,
          steps: [
            {
              lineRange: [5, 11],
              explanation: "Task { } captures 'self' strongly. ProfileLoader stays alive while the Task runs. But here's the key: the Task is NOT stored on the object. ProfileLoader does not hold a reference to the Task. So there's no cycle: Task -> self, but self does NOT reference Task. When the Task finishes, it releases self. If nothing else holds self, deinit is called.",
              threadIndicator: 'background',
              executionNote: 'Strong capture but no cycle — Task is not stored',
            },
            {
              lineRange: [14, 16],
              explanation: "deinit WILL be called — after the Task completes and releases its strong reference to self. The key insight: a retain cycle requires MUTUAL strong references. Here the reference is one-way (Task -> self), so memory is eventually freed.",
              threadIndicator: 'main',
            },
          ],
        },
      ],
    },
    {
      id: 'code-walkthrough-when-weak-self',
      type: 'code-walkthrough',
      title: 'When You DO Need [weak self] in a Task',
      content: 'There are cases where [weak self] in a Task is the right call — when the Task is long-running and the object may become irrelevant:',
      codeBlocks: [
        {
          id: 'weak-self-task',
          label: 'Long-Running Task with [weak self]',
          code: `class ChatViewModel: ObservableObject {
    @Published var messages: [String] = []

    func startListening() {
        Task { [weak self] in
            for await message in MessageStream.live() {
                guard let self else { return }
                await MainActor.run {
                    self.messages.append(message)
                }
            }
        }
    }

    deinit {
        print("ChatViewModel deallocated")
    }
}`,
          steps: [
            {
              lineRange: [5, 5],
              explanation: "[weak self] is used because this Task runs indefinitely — it listens to a live message stream that never ends. Without [weak self], the ViewModel would stay alive forever even after the user navigates away from the chat screen. With [weak self], once the View releases the ViewModel, 'self' becomes nil and the guard exits the loop.",
              threadIndicator: 'background',
            },
            {
              lineRange: [6, 7],
              explanation: "The 'for await' loop suspends and resumes for each new message. After each suspension, we check 'guard let self' — if the ViewModel was deallocated while we were waiting, self is nil and we return, ending the Task cleanly.",
              threadIndicator: 'background',
              executionNote: 'Suspends between messages, checks self each iteration',
            },
            {
              lineRange: [8, 10],
              explanation: "We hop to MainActor to update @Published messages. Notice we use the unwrapped 'self' from the guard — this creates a temporary strong reference for the duration of the MainActor.run block, preventing deallocation mid-update.",
              threadIndicator: 'main',
            },
          ],
        },
      ],
    },
    {
      id: 'deep-dive-task-modifier',
      type: 'deep-dive',
      title: '.task Modifier: SwiftUI\'s Built-In Cancellation',
      content: `SwiftUI's \`.task\` view modifier is the gold standard for async work in views. It handles cancellation automatically.

\`\`\`swift
struct ProfileView: View {
    @StateObject var vm = ProfileViewModel()

    var body: some View {
        Text(vm.username)
            .task {
                await vm.loadProfile()
            }
    }
}
\`\`\`

**What .task does for you:**
1. Creates a Task when the view **appears**
2. Automatically **cancels** that Task when the view **disappears**
3. The Task is tied to the view's lifetime — no manual cleanup needed

**This means:**
- No need for \`[weak self]\` — the Task is cancelled when the view goes away
- No need for \`onDisappear { task.cancel() }\` — it's automatic
- If the user navigates away mid-load, the Task is cancelled immediately

**Compare with manual Task management:**
\`\`\`swift
struct ProfileView: View {
    @StateObject var vm = ProfileViewModel()
    @State private var loadTask: Task<Void, Never>?

    var body: some View {
        Text(vm.username)
            .onAppear {
                loadTask = Task { await vm.loadProfile() }
            }
            .onDisappear {
                loadTask?.cancel()  // Manual cleanup — easy to forget!
            }
    }
}
\`\`\`

The .task modifier eliminates this boilerplate and the bug risk of forgetting to cancel.

**Rule of thumb:** Use \`.task { }\` for view-scoped work. Use \`Task { }\` with manual cancellation only when you need the Task to outlive the view.`,
    },
    {
      id: 'edge-case-structured-vs-unstructured',
      type: 'edge-case',
      title: 'Structured vs Unstructured: Memory Implications',
      content: `The memory behavior differs significantly between structured and unstructured concurrency:

**Structured (TaskGroup, async let):**
\`\`\`swift
func loadAll() async {
    async let a = fetchA()  // Child task
    async let b = fetchB()  // Child task
    let results = await (a, b)
    // Both child tasks are GUARANTEED complete here
    // Strong references released immediately
}
\`\`\`
Structured tasks cannot outlive their parent scope. Memory is always released when the scope exits. You NEVER need [weak self] in structured tasks — they complete before the enclosing function returns.

**Unstructured (Task { }):**
\`\`\`swift
func startWork() {
    Task {
        // This task lives independently!
        // It can outlive the object that created it
        await heavyComputation()
        self.result = "done"  // self kept alive until here
    }
}
\`\`\`
Unstructured tasks run independently. They hold strong references until they complete. If the task takes 30 seconds and the user navigates away after 2 seconds, the object stays alive for 28 more seconds doing work nobody will see.

**Detached tasks (Task.detached { }):**
Same memory rules as Task { }, but they also lose the parent's priority and actor context. Rarely needed — prefer Task { } in most cases.

**Decision flowchart:**
- Task finishes quickly (network call, single operation)? Strong self is fine — no [weak self] needed
- Task runs indefinitely (stream, polling)? Use [weak self]
- SwiftUI view work? Use .task modifier — cancellation is automatic
- TaskGroup / async let? Never needs [weak self] — structured lifetime guarantees cleanup`,
    },
  ],
  interviewQuestion: {
    question: 'Do you need [weak self] in a Task?',
    hints: [
      'Think about what creates a retain cycle — does a Task { } body create a mutual strong reference?',
      'Consider the difference between a short-lived Task (one network call) and a long-running Task (AsyncSequence listener).',
      'How does SwiftUI\'s .task modifier change the calculus?',
    ],
    answer: `The short answer is: usually no, but sometimes yes. A Task body captures self strongly by default, but it does NOT create a retain cycle in the classic sense. A retain cycle requires two objects holding strong references to each other. A Task holds a strong reference to self, but self typically does not hold a strong reference back to the Task. When the Task completes, it releases self, and memory is freed normally.

For short-lived Tasks — a single network call, a database write, a computation that finishes in seconds — strong self is perfectly fine. The Task completes, releases its references, and the object can be deallocated. Using [weak self] here adds unnecessary nil-checking boilerplate without any real benefit.

However, [weak self] IS important for long-running or indefinite Tasks. If a Task listens to an AsyncSequence that never ends (like a WebSocket stream or a Combine publisher bridged to AsyncSequence), the strong capture keeps the object alive indefinitely. If the user navigates away from a screen, the ViewModel stays in memory, continuing to process events nobody will see. Using [weak self] with a guard let self check allows the Task to exit gracefully when the object is deallocated.

SwiftUI's .task view modifier is the best solution for view-scoped work because it automatically cancels the Task when the view disappears. With .task, you rarely need [weak self] because cancellation handles cleanup. For unstructured Tasks created manually, consider: will this Task outlive the usefulness of the object? If yes, use [weak self]. If the Task is guaranteed to finish quickly, strong self is fine.`,
    followUps: [
      'What is the difference between Task { } and Task.detached { } regarding capture semantics and actor context?',
      'How does structured concurrency (TaskGroup, async let) handle memory differently than unstructured Tasks?',
      'Can you describe a scenario where using [weak self] in a Task actually causes a bug?',
    ],
  },
  codePuzzle: {
    type: 'spot-bug',
    prompt: 'This ViewModel has a memory leak. Can you spot it?',
    code: `class TimerViewModel: ObservableObject {
    @Published var elapsed = 0
    private var task: Task<Void, Never>?

    func start() {
        task = Task {
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 1_000_000_000)
                self.elapsed += 1
            }
        }
    }

    deinit {
        task?.cancel()
        print("TimerViewModel deallocated")
    }
}`,
    solution: 'The bug is a retain cycle. The ViewModel stores the Task in the "task" property (self -> Task). The Task body captures self strongly on line 9 (Task -> self). This creates a mutual strong reference: self holds Task, Task holds self. deinit will never be called because the retain cycle prevents deallocation, which means task?.cancel() never executes. Fix: use [weak self] in the Task closure, or cancel the task externally before releasing the ViewModel.',
    options: [
      'Retain cycle: self stores Task, Task captures self strongly',
      'Thread safety: elapsed must be updated on MainActor',
      'Missing try: Task.sleep can throw but the error is ignored',
      'Task.isCancelled is never true because cancel() is never called',
    ],
    correctOptionIndex: 0,
  },
};

export default topic;
