import type { Topic } from '@/types/topic';

const topic: Topic = {
  slug: 'async-publisher',
  order: 14,
  title: 'Async Publisher',
  subtitle: 'The kitchen ticket printer',
  icon: '📡',
  prerequisiteSlugs: ['mvvm'],
  storyDay: 26,
  storyIntro:
    "Day 26, and the kitchen is running full tilt. The head chef just bolted a ticket printer to the pass — one of those old-school thermal printers that screams out a new strip of paper every time an order changes status. \"Prepping table 7's salmon.\" Rrrip. \"Table 7 salmon — plating.\" Rrrip. \"Table 7 salmon — ready.\" Rrrip. The expo doesn't poll the kitchen or ask \"is it done yet?\" — they just watch the printer and react to each ticket the moment it appears.\n\nYour ViewModel is the expo. Your @Published property is the printer. Until now, SwiftUI observed @Published properties synchronously — re-rendering every time the paper moved. But what if the expo needs to process each ticket asynchronously — say, logging it, notifying the server, and updating a display board one step at a time? That's where AsyncPublisher comes in. By calling `.values` on any Combine publisher, you get an AsyncSequence you can loop over with `for await`. Each ticket prints, the expo awaits it, handles it, and waits for the next one.\n\nThe printer still works the old way for anyone watching it directly. But now the expo can also process tickets one at a time in an async Task, handling each at their own pace — no Combine sink required.",
  kitchenMetaphor:
    'The ticket printer spits out updates in real-time — the ViewModel watches the printer and reacts to each ticket as it arrives.',
  sections: [
    {
      id: 'side-by-side-sink-vs-for-await',
      type: 'side-by-side',
      title: 'Combine sink vs async for-await',
      content: `Before we dive into how AsyncPublisher works, look at the two ways to observe the same @Published property. This is the "why" — you can replace a Combine sink with a structured for-await loop:

**Combine sink (the old way):**
\`\`\`swift
manager.$myData
    .receive(on: DispatchQueue.main)
    .sink { dataArray in
        self.dataArray = dataArray
    }
    .store(in: &cancellables)
\`\`\`

**async for-await (the new way):**
\`\`\`swift
Task {
    for await value in manager.$myData.values {
        await MainActor.run {
            self.dataArray = value
        }
    }
}
\`\`\`

**Why switch?**
- No \`AnyCancellable\` bookkeeping — cancelling the Task cancels the subscription automatically
- Linear control flow — you can use \`if\`, \`break\`, \`continue\`, and \`try/catch\` inside the loop
- Plays nicely with structured concurrency — the subscription lifetime is tied to the Task's lifetime
- One fewer import: no need for \`import Combine\` in your ViewModel if all you do is observe

**When to keep Combine:**
- You need operators like \`debounce\`, \`combineLatest\`, or \`removeDuplicates\` before consuming
- You have an existing Combine pipeline that works well — don't rewrite for the sake of it`,
    },
    {
      id: 'code-walkthrough-published-values',
      type: 'code-walkthrough',
      title: 'Observing @Published with for-await',
      content: 'This pattern comes directly from AsyncPublisherBootcamp.swift. A data manager owns @Published state, and the ViewModel observes it via `.values`:',
      codeBlocks: [
        {
          id: 'data-manager-published',
          label: 'DataManager + ViewModel pattern',
          code: `class AsyncPublisherDataManager {
    @Published var myData: [String] = []

    func addData() async {
        myData.append("Apple")
        try? await Task.sleep(nanoseconds: 2_000_000_000)
        myData.append("Banana")
        try? await Task.sleep(nanoseconds: 2_000_000_000)
        myData.append("Orange")
    }
}

class ViewModel: ObservableObject {
    @MainActor @Published var dataArray: [String] = []
    let manager = AsyncPublisherDataManager()

    init() {
        Task {
            for await value in manager.$myData.values {
                await MainActor.run {
                    self.dataArray = value
                }
            }
        }
    }
}`,
          steps: [
            {
              lineRange: [1, 3],
              explanation: "The data manager owns a @Published property. Every time myData changes, the underlying Combine publisher ($myData) emits the new array. Think of this as the ticket printer — each mutation prints a new ticket.",
              threadIndicator: 'main',
            },
            {
              lineRange: [4, 10],
              explanation: "addData() mutates myData over time with sleeps in between. Each append triggers a publish. The publisher emits [], then [\"Apple\"], then [\"Apple\", \"Banana\"], then the three-element array. Four tickets total (including the initial empty array).",
              threadIndicator: 'background',
              executionNote: 'Each append triggers a new publish event',
            },
            {
              lineRange: [18, 23],
              explanation: "Here's the bridge: manager.$myData gives the Published.Publisher, and .values converts it to an AsyncSequence. The for-await loop suspends until the next value arrives, then resumes. The first value is always the CURRENT value at subscription time (the empty array). MainActor.run ensures the UI update happens on the main thread.",
              threadIndicator: 'background',
              executionNote: 'Suspends between each published value — thread is freed',
            },
            {
              lineRange: [17, 24],
              explanation: "The Task owns this subscription. If the ViewModel is deallocated and the Task is cancelled, the for-await loop exits and the Combine subscription is cleaned up automatically. No AnyCancellable needed. Compare this to the Combine sink version — no .store(in: &cancellables), no Set<AnyCancellable> property.",
              threadIndicator: 'background',
            },
          ],
        },
      ],
    },
    {
      id: 'code-walkthrough-async-stream',
      type: 'code-walkthrough',
      title: 'AsyncStream with Continuation',
      content: 'When you don\'t have a Combine publisher — say you\'re wrapping a delegate, a WebSocket, or a callback-based API — you build your own AsyncSequence with AsyncStream. This is a critical senior-level pattern:',
      codeBlocks: [
        {
          id: 'async-stream-continuation',
          label: 'AsyncStream with yield/finish',
          code: `class LocationTracker {
    func locationUpdates() -> AsyncStream<String> {
        AsyncStream(bufferingPolicy: .bufferingNewest(5)) { continuation in
            // Simulate delegate callbacks arriving over time
            let locations = ["Kitchen", "Dining Room", "Bar", "Exit"]

            Task {
                for location in locations {
                    try? await Task.sleep(nanoseconds: 1_000_000_000)
                    continuation.yield(location)
                }
                continuation.finish()
            }

            continuation.onTermination = { reason in
                switch reason {
                case .cancelled:
                    print("Consumer cancelled — stop GPS")
                case .finished:
                    print("All locations delivered")
                @unknown default:
                    break
                }
            }
        }
    }
}

// Consumer side:
Task {
    let tracker = LocationTracker()
    for await location in tracker.locationUpdates() {
        print("Now at: \\(location)")
    }
    print("Stream ended — loop exited")
}`,
          steps: [
            {
              lineRange: [2, 3],
              explanation: "The function returns AsyncStream<String> — a concrete AsyncSequence you build yourself. The bufferingPolicy: .bufferingNewest(5) means if the producer yields faster than the consumer awaits, only the 5 most recent values are kept. This prevents unbounded memory growth — a real concern with high-frequency sources like sensor data.",
              threadIndicator: 'background',
            },
            {
              lineRange: [7, 13],
              explanation: "Inside the closure you get a 'continuation' — your handle for pushing values into the stream. continuation.yield() sends a value to the consumer. continuation.finish() signals that no more values will come, which causes the for-await loop on the other side to exit. Think of yield as printing a ticket and finish as turning off the printer.",
              threadIndicator: 'background',
              executionNote: 'Each yield resumes the suspended for-await consumer',
            },
            {
              lineRange: [15, 24],
              explanation: "onTermination fires when the stream ends for ANY reason — either you called finish(), or the consuming Task was cancelled. This is your cleanup hook: close a WebSocket, remove a delegate, stop GPS. The reason parameter tells you which case triggered it. This is essential for avoiding resource leaks.",
              threadIndicator: 'background',
            },
            {
              lineRange: [30, 35],
              explanation: "The consumer side is beautifully simple: a plain for-await loop. When continuation.finish() is called, the loop ends naturally and execution falls through to the print below. If the Task is cancelled externally, the loop also exits and onTermination fires with .cancelled. This is structured concurrency in action.",
              threadIndicator: 'background',
            },
          ],
        },
      ],
    },
    {
      id: 'edge-case-backpressure',
      type: 'edge-case',
      title: 'Backpressure and Buffering',
      content: `**The hidden danger of .values:** When you bridge a Combine publisher with \`.values\`, the resulting AsyncSequence uses an unbounded buffer. If the publisher emits faster than your for-await loop processes, values pile up in memory with no limit.

\`\`\`swift
// Dangerous: sensor emits 60 times/sec, but processing takes 100ms each
Task {
    for await reading in sensorPublisher.values {
        await processReading(reading) // Falls behind, buffer grows forever
    }
}
\`\`\`

**Fix #1 — Debounce before bridging:**
\`\`\`swift
sensorPublisher
    .debounce(for: .milliseconds(200), scheduler: RunLoop.main)
    .values  // Now at most 5 values/sec
\`\`\`

**Fix #2 — Use AsyncStream with a bounded buffer instead:**
\`\`\`swift
AsyncStream(bufferingPolicy: .bufferingNewest(1)) { continuation in
    sensorPublisher.sink { value in
        continuation.yield(value) // Drops old values when buffer is full
    }.store(in: &cancellables)
}
\`\`\`

**Buffering policies for AsyncStream:**
- \`.unbounded\` — default, keeps everything (same risk as .values)
- \`.bufferingOldest(N)\` — keeps first N, drops newer values when full
- \`.bufferingNewest(N)\` — keeps last N, drops older values when full

**Rule of thumb:** If the producer is faster than the consumer and you only care about the latest state (like a current location or a stock price), use \`.bufferingNewest(1)\`.`,
    },
    {
      id: 'deep-dive-publisher-lifecycle',
      type: 'deep-dive',
      title: 'What Happens When the Publisher Completes?',
      content: `A subtle but important detail: **when a Combine publisher sends .finished, the for-await loop exits.** This is how structured concurrency knows the stream is done.

\`\`\`swift
let subject = PassthroughSubject<String, Never>()

Task {
    for await value in subject.values {
        print(value) // Prints "A", "B"
    }
    print("Loop exited") // This DOES print after send(completion:)
}

subject.send("A")
subject.send("B")
subject.send(completion: .finished) // Causes the for-await loop to end
\`\`\`

**But @Published never completes on its own.** A @Published publisher only finishes when the owning object is deallocated. So \`for await value in manager.$myData.values\` runs forever unless:
1. The Task is cancelled (e.g., the view disappears and .task{} cancels)
2. You \`break\` out of the loop manually
3. The manager is deallocated, which sends .finished

**Common mistake:** Starting a for-await loop on a @Published property without a way to exit it. Always tie it to a Task that has a clear cancellation path — like SwiftUI's \`.task\` modifier, which cancels when the view disappears.`,
    },
  ],
  interviewQuestion: {
    question: 'When would you choose AsyncStream over publisher.values, and how do you handle backpressure in each case?',
    hints: [
      'Think about where values originate — an existing Combine publisher vs. a delegate/callback API.',
      'Consider what happens when the producer is faster than the consumer. Which approach gives you control over buffering?',
      'Remember that .values uses an unbounded buffer, while AsyncStream lets you specify a bufferingPolicy.',
    ],
    answer: `Use publisher.values when you already have a Combine publisher (like @Published, NotificationCenter, or a Combine pipeline) and want to consume it in an async context. The most common case: for await value in viewModel.$items.values inside a Task. The publisher controls emission timing and completion. Cancelling the Task cancels the subscription.

Use AsyncStream when you're wrapping a non-Combine source — delegate callbacks (like CLLocationManager), WebSocket message handlers, or any callback-based API. You get a continuation with yield() to push values, finish() to end the stream, and onTermination for cleanup. This gives you full control over the stream's lifecycle without pulling in Combine.

The critical difference is backpressure. publisher.values uses an unbounded buffer — if the publisher emits faster than the for-await loop processes, values accumulate in memory without limit. Your only options are to debounce or throttle the publisher BEFORE calling .values. AsyncStream, on the other hand, lets you specify a bufferingPolicy at creation time: .bufferingNewest(N) drops old values, .bufferingOldest(N) drops new ones. For a high-frequency source like sensor data where you only care about the latest reading, AsyncStream with .bufferingNewest(1) is the safe choice.

One more nuance: .values on @Published replays the current value immediately as the first element. AsyncStream only yields what you explicitly push. This matters when you need the initial state vs. only caring about future changes.`,
    followUps: [
      'A @Published property\'s for-await loop never exits on its own. How do you ensure it doesn\'t leak? What is the role of .task {} in SwiftUI?',
      'Walk me through wrapping CLLocationManager\'s delegate into an AsyncStream.',
      'What happens if two Tasks both iterate over manager.$myData.values — do they share a subscription or get independent ones?',
    ],
  },
  codePuzzle: {
    type: 'predict-output',
    prompt: 'What does this code print? Pay close attention to when the for-await loop exits.',
    code: `let subject = PassthroughSubject<String, Never>()

Task {
    for await value in subject.values {
        print(value)
    }
    print("Done")
}

// Allow Task to start
try? await Task.sleep(nanoseconds: 100_000_000)

subject.send("A")
subject.send("B")
subject.send(completion: .finished)`,
    solution: 'The for-await loop receives "A" and "B" from the PassthroughSubject, printing each. When the subject sends .finished, the AsyncSequence completes, causing the for-await loop to exit naturally. Then "Done" prints. This is a key insight: publisher completion directly controls when the for-await loop ends. With @Published, the publisher never sends .finished on its own (only on deallocation), so the loop would run indefinitely unless the Task is cancelled or you break out manually.',
    options: [
      'A, B, Done',
      'A, B (loop never exits — hangs forever)',
      'Done, A, B (Done prints first because Task is async)',
      'A, B, then crashes (subject deallocated)',
    ],
    correctOptionIndex: 0,
  },
};

export default topic;
