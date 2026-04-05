import type { Topic } from '@/types/topic';

const topic: Topic = {
  slug: 'checked-continuation',
  order: 8,
  title: 'Checked Continuation',
  subtitle: 'Replacing the old phone system',
  icon: '📞',
  prerequisiteSlugs: ['async-await'],
  storyDay: 14,
  storyIntro:
    "Day 14, and you love the new async ordering system. But there's a problem — half the kitchen equipment still uses the OLD callback-based phone system. The industrial oven has a \"call me when done\" button (a completion handler). The meat thermometer uses a delegate pattern to report temperatures. You can't rip out all the old equipment overnight, so you need an **adapter** that bridges the old phone system to the new async ticket system.\n\nThat adapter is `withCheckedContinuation`. You wrap the old callback-based API in an async function. Inside, you get a `continuation` object — think of it as a one-time return ticket. When the old equipment calls back, you \"resume\" the continuation with the result, and the async world receives it as a normal return value.\n\nThe \"checked\" part is your safety net. If you accidentally resume the continuation twice (double callback), or forget to resume it at all (lost callback), the runtime will catch the mistake and crash loudly — much better than a silent bug that corrupts your app's state.",
  kitchenMetaphor:
    'Bridge the old callback phone system to the new async ticket system.',
  sections: [
    {
      id: 'concept-bridging-worlds',
      type: 'concept',
      title: 'Why We Need Continuations',
      content: `Swift concurrency is beautiful — but the real world is messy. Millions of lines of existing code use **completion handlers**, **delegates**, and **NotificationCenter** patterns. You can't rewrite everything at once.

**The problem:** You have an async function that needs to call an old callback-based API. The old API doesn't return a value — it calls a closure later. How do you make that work with await?

**The solution:** \`withCheckedContinuation\` and \`withCheckedThrowingContinuation\` let you **suspend** the current task and give you a \`continuation\` handle. You pass that handle into the old callback world. When the callback fires, you \`resume\` the continuation, and the suspended task wakes up with the result.

**Two variants:**
- \`withCheckedContinuation(returning: T.self)\` — for callbacks that always succeed
- \`withCheckedThrowingContinuation(returning: T.self)\` — for callbacks that might fail

**The golden rule:** You MUST resume the continuation **exactly once**. Not zero times (task hangs forever). Not two times (runtime crash). Exactly once, on every code path.`,
    },
    {
      id: 'code-walkthrough-wrapping-callback',
      type: 'code-walkthrough',
      title: 'Wrapping a Completion Handler API',
      content:
        'The most common use case — wrapping a legacy callback-based function into a clean async function:',
      codeBlocks: [
        {
          id: 'wrap-url-session',
          label: 'Wrapping a Callback-Based Network Call',
          code: `// Legacy API with completion handler
func fetchData(url: URL, completion: @escaping (Data?, Error?) -> Void) {
    URLSession.shared.dataTask(with: url) { data, _, error in
        completion(data, error)
    }.resume()
}

// Modern async wrapper using checked continuation
func fetchData(url: URL) async throws -> Data {
    try await withCheckedThrowingContinuation { continuation in
        fetchData(url: url) { data, error in
            if let error {
                continuation.resume(throwing: error)
            } else if let data {
                continuation.resume(returning: data)
            } else {
                continuation.resume(throwing: URLError(.badServerResponse))
            }
        }
    }
}`,
          steps: [
            {
              lineRange: [1, 6],
              explanation:
                "The legacy API: takes a URL and a completion handler. The callback is called sometime later with either data or an error. This is the old 'phone system' we need to bridge.",
              threadIndicator: 'background',
            },
            {
              lineRange: [9, 10],
              explanation:
                "We create a new async function with the same name (overload). Inside, we call withCheckedThrowingContinuation. This suspends the current task and gives us a continuation object. The task will remain suspended until we resume this continuation.",
              threadIndicator: 'suspended',
            },
            {
              lineRange: [11, 18],
              explanation:
                "We call the legacy API and in its completion handler, we resume the continuation. EVERY code path must resume exactly once: error case resumes with throwing, success case resumes with returning, and the else case handles the edge case where both are nil. Missing any path would leave the task suspended forever.",
              executionNote:
                'The continuation MUST be resumed on every possible code path',
              threadIndicator: 'background',
            },
          ],
        },
      ],
    },
    {
      id: 'code-walkthrough-delegate-pattern',
      type: 'code-walkthrough',
      title: 'Wrapping a Delegate Pattern',
      content:
        'Delegates are trickier because the callback comes through a separate method. Here\'s how to wrap one:',
      codeBlocks: [
        {
          id: 'wrap-delegate',
          label: 'Wrapping CLLocationManager (Delegate Pattern)',
          code: `class LocationFetcher: NSObject, CLLocationManagerDelegate {
    private var continuation: CheckedContinuation<CLLocation, Error>?
    private let manager = CLLocationManager()

    override init() {
        super.init()
        manager.delegate = self
    }

    func currentLocation() async throws -> CLLocation {
        try await withCheckedThrowingContinuation { continuation in
            self.continuation = continuation
            manager.requestLocation()
        }
    }

    func locationManager(_ manager: CLLocationManager,
                         didUpdateLocations locations: [CLLocation]) {
        continuation?.resume(returning: locations.first!)
        continuation = nil
    }

    func locationManager(_ manager: CLLocationManager,
                         didFailWithError error: Error) {
        continuation?.resume(throwing: error)
        continuation = nil
    }
}`,
          steps: [
            {
              lineRange: [1, 2],
              explanation:
                "We store the continuation as an optional property. This lets us capture it in the async method and resume it later from the delegate callbacks. Setting it to nil after use prevents accidental double-resume.",
              threadIndicator: 'main',
            },
            {
              lineRange: [10, 15],
              explanation:
                "The async function suspends with withCheckedThrowingContinuation, stores the continuation, and triggers the delegate-based API (requestLocation). The task is now suspended — waiting for a delegate callback.",
              threadIndicator: 'suspended',
            },
            {
              lineRange: [17, 21],
              explanation:
                "When the location arrives, the delegate method fires. We resume the continuation with the location, then nil it out. The suspended task in currentLocation() wakes up and returns the CLLocation.",
              threadIndicator: 'background',
            },
            {
              lineRange: [23, 27],
              explanation:
                "If the location request fails, we resume with an error instead. Again, we nil out the continuation. The suspended task wakes up and throws the error. Every delegate path is covered.",
              threadIndicator: 'background',
            },
          ],
        },
      ],
    },
    {
      id: 'edge-case-resume-rules',
      type: 'edge-case',
      title: 'The One-Resume Rule and Common Bugs',
      content: `The most dangerous bugs with continuations come from violating the **exactly-once** rule:

**Bug 1 — Resuming twice (crash):**
\`\`\`swift
func broken() async -> String {
    await withCheckedContinuation { continuation in
        someAPI { result in
            continuation.resume(returning: result)
        }
        continuation.resume(returning: "fallback") // CRASH! Already resumed
    }
}
\`\`\`
The checked continuation detects the double resume and traps at runtime.

**Bug 2 — Never resuming (task hangs forever):**
\`\`\`swift
func broken() async throws -> Data {
    try await withCheckedThrowingContinuation { continuation in
        fetchData { data, error in
            if let data {
                continuation.resume(returning: data)
            }
            // BUG: if data is nil and error is nil, we never resume!
        }
    }
}
\`\`\`
The task suspends and NEVER wakes up. With \`withCheckedContinuation\`, the runtime logs a warning when the continuation is deallocated without being resumed.

**Checked vs Unsafe:**
- \`withCheckedContinuation\` — validates the exactly-once rule at runtime. Use this during development.
- \`withUnsafeContinuation\` — no validation, slightly faster. Use only after thorough testing.
In practice, always use checked. The performance difference is negligible, and the safety is invaluable.`,
    },
    {
      id: 'deep-dive-when-to-use',
      type: 'deep-dive',
      title: 'When You Actually Need Continuations',
      content: `With each iOS release, fewer APIs need manual continuation wrapping because Apple adds native async versions. Before writing a continuation wrapper, check:

1. **Does an async overload already exist?** Many Apple APIs (URLSession, FileManager, etc.) already have async versions in iOS 15+. Use those directly.

2. **Is there a better pattern?** For ongoing events (NotificationCenter, KVO), consider \`AsyncSequence\` or \`AsyncStream\` instead of single-shot continuations.

3. **Third-party SDKs** — Firebase, Alamofire, etc. These often still use completion handlers and are the most common place you'll need continuations.

**Pattern for wrapping any callback API:**
\`\`\`swift
func asyncWrapper() async throws -> ResultType {
    try await withCheckedThrowingContinuation { continuation in
        legacyAPI { result, error in
            if let error {
                continuation.resume(throwing: error)
                return
            }
            guard let result else {
                continuation.resume(throwing: SomeError.noResult)
                return
            }
            continuation.resume(returning: result)
        }
    }
}
\`\`\`

**Thread safety note:** The continuation's \`resume\` method is safe to call from any thread. The callback can come back on any queue — main, background, or a custom serial queue — and the continuation handles the scheduling correctly. The awaiting task will resume according to its own actor/isolation context.`,
    },
  ],
  interviewQuestion: {
    question:
      'When would you use checked vs unsafe continuation?',
    hints: [
      'Think about the trade-off between safety and performance.',
      'Consider what "checked" actually checks at runtime.',
      'Think about what happens in production vs development builds.',
    ],
    answer: `\`withCheckedContinuation\` validates at runtime that the continuation is resumed **exactly once**. If you resume it twice, it traps immediately with a clear error message. If you never resume it (the continuation is deallocated), it logs a warning. This makes bugs obvious during development and testing.

\`withUnsafeContinuation\` skips these runtime checks. Resuming twice is undefined behavior (could crash, corrupt memory, or silently break). Never resuming silently leaks the suspended task forever. The benefit is a very small performance gain from avoiding the bookkeeping.

In practice, **always use the checked variant** unless you have measured a performance bottleneck in a hot path and are absolutely certain your resume logic is correct. The performance difference is negligible for the vast majority of use cases — we're talking nanoseconds per call, which is irrelevant when you're wrapping a network request that takes milliseconds.

A reasonable approach is: use checked everywhere during development and testing. If profiling reveals a continuation-heavy hot path (like a tight loop wrapping thousands of callback-based operations), consider switching to unsafe for that specific call site after thorough testing. Even then, keep the checked version in a debug assert or test suite so you catch regressions.`,
    followUps: [
      'What happens if a checked continuation is deallocated without being resumed?',
      'How would you wrap an API that calls its completion handler multiple times?',
      'Can you resume a continuation from a different thread than where it was created?',
    ],
  },
  codePuzzle: {
    type: 'spot-bug',
    prompt:
      'This code wraps a callback API with a continuation. What bug will cause a runtime crash?',
    code: `func loadImage(named name: String) async -> UIImage {
    await withCheckedContinuation { continuation in
        ImageLoader.shared.load(name: name) { image in
            continuation.resume(returning: image ?? UIImage())
        }
        // Provide a fallback in case the callback is slow
        continuation.resume(returning: UIImage(systemName: "photo")!)
    }
}`,
    solution:
      'The continuation is resumed TWICE — once inside the callback closure and once immediately after setting up the callback (the "fallback" line). The callback will almost certainly also fire, causing a second resume. Checked continuations detect this and trap at runtime. The fix: remove the fallback line. If you need a timeout, use a Task with a sleep and coordinate with a flag or actor to ensure only one resume happens.',
    options: [
      'The UIImage() fallback creates a nil image',
      'The continuation is resumed twice — once in the callback and once on the fallback line',
      'withCheckedContinuation should be withCheckedThrowingContinuation',
      'ImageLoader.shared might be nil',
    ],
    correctOptionIndex: 1,
  },
};

export default topic;
