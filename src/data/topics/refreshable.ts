import type { Topic } from '@/types/topic';

const topic: Topic = {
  slug: 'refreshable',
  order: 15,
  title: 'Refreshable',
  subtitle: 'Pull-down menu board',
  icon: '🔄',
  prerequisiteSlugs: ['download-image-async'],
  storyDay: 28,
  storyIntro:
    "Day 28. The restaurant's specials board hangs above the dining room entrance. Every morning the head chef writes today's dishes on it. But customers keep asking: \"Are these still today's specials?\" — especially during the lunch rush when dishes sell out fast. The solution? A pull-down chain attached to the board. Any server can yank the chain, the board flips up briefly, and the kitchen sends out the latest list. While the board is refreshing, a little spinning indicator shows that the update is in progress. Once the new specials arrive, the board drops back down with fresh information.\n\nThis pull-down chain is SwiftUI's `.refreshable` modifier. It hooks into the native pull-to-refresh gesture on scrollable views and calls an async function you provide. The system manages the refresh indicator automatically — it appears when the user pulls and disappears when your async function returns. No manual state management for the loading spinner. No dispatch queues. Just an async closure.\n\nThe elegance is in what you don't have to do: no boolean `isLoading` flag to toggle, no completion handler to dismiss the spinner. The refreshable modifier's closure is async, so it naturally awaits your network call and the indicator dismisses when the await completes.",
  kitchenMetaphor:
    "Pull the chain to refresh today's specials on the menu board.",
  sections: [
    {
      id: 'concept-refreshable-basics',
      type: 'concept',
      title: 'How .refreshable Works',
      content: `The \`.refreshable\` modifier adds pull-to-refresh behavior to any scrollable SwiftUI view (List, ScrollView, etc.). Under the hood, it:

1. **Watches for the pull gesture** — the user drags down past the top of the scroll view
2. **Shows a ProgressView** — the system-standard spinning indicator appears automatically
3. **Calls your async closure** — the closure you provide runs inside a Task that SwiftUI creates
4. **Dismisses the indicator when the async closure returns** — not when a Task inside it finishes, but when the closure itself completes

**Key design insight:** The spinner's lifetime is tied to the closure's return, not to any child Tasks you launch inside it. If you fire off a \`Task.detached\` inside \`.refreshable\` and return immediately, the spinner vanishes instantly — even though the detached work is still running.

**Platform support:** \`.refreshable\` works on iOS 15+, macOS 13+, watchOS 8+, and visionOS 1+. On macOS, it maps to the toolbar refresh button rather than a pull gesture.

**Cancellation:** If the user navigates away while a refresh is in progress, the Task running the refreshable closure is cancelled. Your async code should respect cancellation via \`Task.checkCancellation()\` or by using APIs that are already cancellation-aware (like URLSession).`,
    },
    {
      id: 'code-walkthrough-data-service',
      type: 'code-walkthrough',
      title: 'The Data Service and ViewModel',
      content: 'Following the pattern from RefreshableBootcamp.swift, we separate the data-fetching service from the ViewModel. The service is a plain class; the ViewModel is @MainActor and owns the published state:',
      codeBlocks: [
        {
          id: 'service-and-viewmodel',
          label: 'Data Service + @MainActor ViewModel',
          code: `final class RefreshableDataService {
    func getData() async throws -> [String] {
        try? await Task.sleep(nanoseconds: 5_000_000_000)
        return ["Apple", "Orange", "Banana"].shuffled()
    }
}

@MainActor
final class RefreshableViewModel: ObservableObject {
    @Published private(set) var items: [String] = []
    let manager = RefreshableDataService()

    func loadData() async {
        do {
            items = try await manager.getData()
        } catch {
            print(error)
        }
    }
}`,
          steps: [
            {
              lineRange: [1, 5],
              explanation: "The data service is a plain class with an async throws method. The simulated delay (5 seconds) lets us observe the spinner behavior. In production this would be a URLSession call. Notice: this class has no UI concerns — it just fetches data.",
              threadIndicator: 'background',
              executionNote: 'Suspends for 5 seconds to simulate network latency',
            },
            {
              lineRange: [8, 11],
              explanation: "@MainActor on the class ensures every property update happens on the main thread. @Published private(set) means only the ViewModel can write to items, but SwiftUI views can read and observe it. This pattern comes straight from the bootcamp source.",
              threadIndicator: 'main',
            },
            {
              lineRange: [13, 19],
              explanation: "loadData() is async — it suspends at the 'try await' line while the service fetches data. When the result comes back, 'items = ...' runs on the main thread (guaranteed by @MainActor). Errors are caught and printed; in production you would set an error state flag.",
              threadIndicator: 'background',
              executionNote: 'Suspends during fetch, resumes on MainActor to assign items',
            },
          ],
        },
      ],
    },
    {
      id: 'code-walkthrough-refreshable-view',
      type: 'code-walkthrough',
      title: 'The .refreshable View',
      content: 'Now the SwiftUI view that ties it all together. Notice how .refreshable and .task both call the same async function with zero duplication:',
      codeBlocks: [
        {
          id: 'refreshable-view',
          label: 'ScrollView with .refreshable',
          code: `struct RefreshableBootcamp: View {
    @StateObject private var viewModel = RefreshableViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack {
                    ForEach(viewModel.items, id: \\.self) { item in
                        Text(item)
                            .font(.headline)
                    }
                }
            }
            .refreshable {
                await viewModel.loadData()
            }
            .navigationTitle("Refreshable")
            .task {
                await viewModel.loadData()
            }
        }
    }
}`,
          steps: [
            {
              lineRange: [1, 2],
              explanation: "@StateObject creates and owns the ViewModel. It survives view re-renders. Because RefreshableViewModel is @MainActor, all its property writes are guaranteed to be on the main thread — no DispatchQueue.main.async needed anywhere.",
              threadIndicator: 'main',
            },
            {
              lineRange: [6, 12],
              explanation: "A ScrollView with a ForEach. Unlike List, ScrollView does not have built-in row management, but .refreshable works on ScrollView from iOS 16+. The bootcamp source uses this exact pattern instead of List.",
              threadIndicator: 'main',
            },
            {
              lineRange: [14, 16],
              explanation: "The entire .refreshable integration. The closure is async, so we 'await viewModel.loadData()'. The pull-to-refresh spinner appears when the user pulls and dismisses when this await completes — when loadData() returns. No boolean flags, no manual spinner management.",
              threadIndicator: 'main',
              executionNote: 'Spinner shows until loadData() returns',
            },
            {
              lineRange: [18, 20],
              explanation: ".task runs loadData() when the view first appears. It also cancels automatically when the view disappears. Combined with .refreshable, you get initial load + pull-to-refresh calling the exact same function. This is the canonical pattern.",
              threadIndicator: 'background',
            },
          ],
        },
      ],
    },
    {
      id: 'edge-case-refresh-pitfalls',
      type: 'edge-case',
      title: 'Spinner Lifetime Gotchas',
      content: `**1. Detached Task inside .refreshable — spinner vanishes immediately:**

\`\`\`swift
// BUG: spinner disappears instantly
.refreshable {
    Task.detached {
        await vm.loadData() // runs in background...
    }
    // ...but the closure returns HERE, so spinner is gone
}
\`\`\`

The spinner is tied to the \`.refreshable\` closure's lifetime. \`Task.detached\` launches independent work and returns immediately, so the closure completes instantly. The data loads silently in the background with no visual feedback.

**2. Unstructured Task inside .refreshable — same problem:**

\`\`\`swift
// BUG: also returns immediately
.refreshable {
    Task {
        await vm.loadData()
    }
    // closure returns here, spinner gone
}
\`\`\`

Even a non-detached \`Task { }\` creates unstructured concurrency. The closure does not await the Task, so it returns immediately. The fix is simple — just \`await\` directly:

\`\`\`swift
// CORRECT: spinner stays until loadData() returns
.refreshable {
    await vm.loadData()
}
\`\`\`

**3. Rapid pull-to-refresh cancels the previous task:**

If the user pulls again while a refresh is in progress, SwiftUI cancels the first Task and starts a new one. Handle \`CancellationError\` gracefully — don't show it as a user-facing error.

**4. Minimum spinner duration:**

iOS shows the spinner for a minimum ~0.5 seconds even if your async call returns instantly. This prevents a jarring flash. You never need to add artificial delays.`,
    },
    {
      id: 'deep-dive-custom-refresh',
      type: 'deep-dive',
      title: 'Programmatic Refresh with @Environment',
      content: `You can read the refresh action from the environment to trigger refreshes from buttons or error-retry views:

\`\`\`swift
struct RetryButton: View {
    @Environment(\\.refresh) private var refresh

    var body: some View {
        Button("Retry") {
            Task {
                await refresh?()  // triggers the same .refreshable closure
            }
        }
        .disabled(refresh == nil)  // nil if no parent has .refreshable
    }
}
\`\`\`

The \`refresh\` environment value is a \`RefreshAction?\`. It is nil when no ancestor view has a \`.refreshable\` modifier. This lets child views trigger the exact same refresh logic the pull gesture uses — great for error-retry buttons.

**Combining .refreshable with .task(id:):**

\`\`\`swift
.task(id: selectedCategory) {
    await vm.loadSpecials(for: selectedCategory)
}
.refreshable {
    await vm.loadSpecials(for: selectedCategory)
}
\`\`\`

When \`selectedCategory\` changes, \`.task(id:)\` cancels the previous task and starts fresh. Pull-to-refresh also calls the same function. You get automatic initial load, category switching, AND pull-to-refresh with one shared function.`,
    },
  ],
  interviewQuestion: {
    question: 'How does .refreshable integrate with async/await, and how does the system know when to dismiss the spinner?',
    hints: [
      'Think about what kind of closure .refreshable accepts and what controls its lifetime.',
      'What happens if you launch a Task.detached inside the closure instead of awaiting directly?',
      'How does cancellation work if the user navigates away mid-refresh?',
    ],
    answer: `The .refreshable modifier accepts an async closure. When the user performs a pull-to-refresh gesture, SwiftUI creates a Task that runs your closure. The refresh spinner appears automatically when the gesture triggers and dismisses when your async closure returns — either normally or by throwing an error. This means there's no manual boolean flag to manage; the await keyword is the signal.

Inside the closure, you typically call an async method on your ViewModel: await vm.loadData(). The network call suspends, and the spinner keeps spinning. When the await resumes, the closure completes, and the spinner goes away. If the function throws, SwiftUI still dismisses the spinner — it doesn't show the error for you; that's your responsibility via your own state management.

A critical subtlety: the spinner's lifetime is tied to the closure returning, NOT to any child Tasks completing. If you launch a Task { } or Task.detached { } inside .refreshable without awaiting, the closure returns immediately and the spinner vanishes — even though the work is still running. You must directly await your async work for the spinner to behave correctly.

Cancellation is handled through structured concurrency. If the user navigates away while a refresh is in progress, SwiftUI cancels the Task running the refreshable closure. This propagates to any child tasks, including URLSession requests. If the user pulls to refresh while a previous refresh is still running, the system cancels the in-flight task and starts a new one, preventing stale data from overwriting fresh data.`,
    followUps: [
      'What happens if you wrap your async call in Task.detached inside .refreshable? How does the spinner behave?',
      'How would you add a retry button that triggers the same refresh logic as the pull gesture?',
      'How does .refreshable interact with .task(id:) for views that reload on filter changes?',
    ],
  },
  codePuzzle: {
    type: 'predict-output',
    prompt: 'The user pulls to refresh. What happens to the spinner and to "items"?',
    code: `struct PuzzleView: View {
    @State private var items = ["A", "B"]

    var body: some View {
        List(items, id: \\.self) { Text($0) }
            .refreshable {
                Task {
                    try? await Task.sleep(for: .seconds(2))
                    items.append("C")
                }
                // closure returns here
            }
    }
}
// After pull-to-refresh, what happens?`,
    solution: 'The spinner disappears almost immediately because the .refreshable closure returns right after creating the unstructured Task — it does not await it. However, "C" IS still appended 2 seconds later because the Task runs independently in the background. So the user sees the spinner flash and vanish, then 2 seconds later the list updates to ["A", "B", "C"]. The fix: remove the Task wrapper and directly write "try? await Task.sleep(...)" and "items.append(\"C\")" in the closure.',
    options: [
      'Spinner shows for 2s, then list becomes ["A", "B", "C"]',
      'Spinner disappears instantly, "C" appended 2s later in background',
      'Spinner disappears instantly, "C" is never appended (Task is cancelled)',
      'Crash — cannot create Task inside .refreshable',
    ],
    correctOptionIndex: 1,
  },
};

export default topic;
