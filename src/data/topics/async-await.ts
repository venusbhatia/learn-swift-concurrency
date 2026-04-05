import type { Topic } from '@/types/topic';

const topic: Topic = {
  slug: 'async-await',
  order: 3,
  title: 'Async / Await',
  subtitle: 'A better ordering system for your kitchen',
  icon: '⏳',
  prerequisiteSlugs: ['do-catch-try-throws', 'struct-class-actor'],
  storyDay: 3,
  storyIntro:
    "Day 3, and your restaurant is getting busier. Waiters are literally tripping over each other — one waiter blocks the kitchen door waiting for a slow dessert, while three others pile up behind him with urgent orders. Your old system (shouting orders and using callback slips) is chaos: orders get lost, nobody knows which callback slip belongs to which table, and the code — err, kitchen — looks like spaghetti. You need a modern ordering system where waiters can DROP OFF an order, go serve other tables while the chef works, and come back to pick up the dish when it's ready. That system is async/await.",
  kitchenMetaphor:
    'async/await is your digital ordering system. Instead of a waiter standing at the kitchen window blocking everyone, they tap in an order (async call), go serve other tables (suspend), and get notified when the dish is ready (await resumes).',
  sections: [
    {
      id: 'concept-sync-vs-async',
      type: 'concept',
      title: 'Why Synchronous Code Blocks the Kitchen',
      content: `Before async/await, Swift developers had two main tools for concurrent work: **Grand Central Dispatch (GCD)** and **completion handlers** (callbacks). Both work, but they create messy, hard-to-read code.

**The Problem with Synchronous Code:**
Imagine a waiter who stands at the kitchen window and WAITS for each dish. While they wait, no other waiter can get through. That's synchronous code on the main thread — your entire UI freezes.

**The Old Solution — GCD + Callbacks:**
You dispatch work to a background queue and pass a closure (completion handler) that runs when the work finishes. This works, but creates "callback hell" — deeply nested closures that are hard to read, hard to debug, and easy to get wrong (forgetting to call the completion handler, calling it twice, etc.).

**The New Solution — async/await:**
Mark a function as \`async\` to say "this function can suspend." Use \`await\` at the call site to say "I'll wait here, but don't block the thread — go do other work." When the result is ready, execution resumes right where it left off. The code reads like synchronous code but behaves asynchronously.

**Key insight:** \`await\` does NOT block a thread. It SUSPENDS the current task, freeing the thread to do other work. When the awaited operation completes, the task resumes — potentially on a different thread.`,
    },
    {
      id: 'code-walkthrough-old-vs-new',
      type: 'code-walkthrough',
      title: 'From DispatchQueue to async/await',
      content: 'Let\'s compare the old callback-based approach with the new async/await approach. Watch how the same logic becomes dramatically cleaner:',
      codeBlocks: [
        {
          id: 'old-way-gcd',
          label: 'Old Way — DispatchQueue + Callbacks',
          code: `func addTitle2() {
    DispatchQueue.global().asyncAfter(deadline: .now() + 2) {
        let title = "Title2 : \\(Thread.current)"
        DispatchQueue.main.async {
            self.dataArray.append(title)
        }
    }
}`,
          steps: [
            {
              lineRange: [1, 1],
              explanation: "A regular synchronous function. Nothing about this signature tells you it does async work — that's already a problem. Callers have no idea this function dispatches to background threads.",
              threadIndicator: 'main',
            },
            {
              lineRange: [2, 3],
              explanation: "We dispatch to a global background queue with a 2-second delay. Everything inside this closure runs on a background thread. The 'Thread.current' will show a background thread. This is like sending a waiter to the back kitchen and saying 'come back in 2 minutes.'",
              threadIndicator: 'background',
            },
            {
              lineRange: [4, 6],
              explanation: "CRITICAL: UI updates MUST happen on the main thread. So we nest ANOTHER dispatch — this time back to the main queue — just to append to our array (which drives the UI). This nested dispatch pattern is the start of 'callback hell.' Imagine 3-4 levels of this nesting.",
              threadIndicator: 'main',
            },
            {
              lineRange: [1, 8],
              explanation: "The full picture: two levels of nesting, no error handling, no way to cancel, and 'self' is captured strongly (potential retain cycle). If you forget the inner DispatchQueue.main.async, you get a runtime crash or corrupted UI — and the compiler won't warn you.",
              threadIndicator: 'main',
            },
          ],
        },
        {
          id: 'new-way-async',
          label: 'New Way — async/await',
          code: `func addAuthor1() async {
    let author1 = "Author1 : \\(Thread.current)"
    self.dataArray.append(author1)

    try? await Task.sleep(nanoseconds: 2_000_000_000)

    let author2 = "Author2 : \\(Thread.current)"
    await MainActor.run(body: {
        self.dataArray.append(author2)
    })
}`,
          steps: [
            {
              lineRange: [1, 1],
              explanation: "The 'async' keyword in the function signature tells callers: 'This function can suspend. You must await it.' This is a huge improvement — the contract is explicit. No more hidden background dispatches.",
              threadIndicator: 'background',
            },
            {
              lineRange: [2, 3],
              explanation: "These lines run immediately, potentially on a background thread (in a non-isolated context). We create a string capturing the current thread and append it. So far, this looks like normal synchronous code — that's the beauty of async/await.",
              threadIndicator: 'background',
            },
            {
              lineRange: [5, 5],
              explanation: "Here's where the magic happens. 'await Task.sleep' SUSPENDS this function for 2 seconds. But unlike Thread.sleep or DispatchQueue.asyncAfter, it does NOT block a thread. The thread is freed to do other work. When 2 seconds pass, the task resumes — possibly on a DIFFERENT thread. The 'try?' means we ignore any cancellation error.",
              executionNote: 'Thread is freed during the 2-second sleep — not blocked!',
              threadIndicator: 'suspended',
            },
            {
              lineRange: [7, 10],
              explanation: "After resuming, we need to update the UI (dataArray). Instead of DispatchQueue.main.async, we use 'await MainActor.run'. This guarantees the closure runs on the main thread. The 'await' means we suspend until the MainActor is available — again, no thread blocking. The code reads top-to-bottom, no nesting.",
              threadIndicator: 'main',
            },
          ],
        },
      ],
    },
    {
      id: 'side-by-side-comparison',
      type: 'side-by-side',
      title: 'Callback Hell vs Linear Flow',
      content: `The biggest win of async/await is **readability**. Compare how error handling looks:

**Old Way (Callbacks):**
\`\`\`swift
fetchUser { user in
    guard let user = user else { return }
    fetchPosts(for: user) { posts in
        guard let posts = posts else { return }
        fetchComments(for: posts.first!) { comments in
            // 3 levels deep, errors silently swallowed
        }
    }
}
\`\`\`

**New Way (async/await):**
\`\`\`swift
do {
    let user = try await fetchUser()
    let posts = try await fetchPosts(for: user)
    let comments = try await fetchComments(for: posts.first!)
} catch {
    // ONE catch for ALL errors, flat structure
}
\`\`\`

Notice: the async/await version is flat, errors are handled in one place, and it reads top-to-bottom like synchronous code. Each \`await\` is a suspension point where the thread is freed.`,
    },
    {
      id: 'deep-dive-suspension',
      type: 'deep-dive',
      title: 'What Really Happens at an await Point',
      content: `When your code hits an \`await\`, here's what actually happens under the hood:

1. **The current task is suspended** — it's paused, its state is saved (like bookmarking a page)
2. **The thread is released** — it goes back to the thread pool and can pick up other work
3. **The awaited operation runs** — a network call, a sleep, an actor method, etc.
4. **When the result is ready**, the task is scheduled to resume
5. **A thread picks it up** — it might be a DIFFERENT thread than before

**Critical implication:** Code after an \`await\` might run on a different thread. This is why \`Thread.current\` can show different values before and after an await. This is also why you need \`MainActor.run\` or \`@MainActor\` to guarantee main-thread execution for UI updates.

**What CAN'T you await?**
- You can only call \`async\` functions from within an \`async\` context
- You cannot use \`await\` in a synchronous function (the compiler will stop you)
- To bridge from sync to async, you use \`Task { }\` to create an async context`,
    },
  ],
  interviewQuestion: {
    question: 'How does async/await differ from GCD (Grand Central Dispatch) in Swift? What problem does it solve that GCD doesn\'t?',
    hints: [
      'Think about readability first — how does the code structure change from nested callbacks to linear flow?',
      'Consider what happens to the thread at an await point vs. inside a DispatchQueue.async closure.',
      'Think about error handling: how do you propagate errors with callbacks vs. async/await?',
    ],
    answer: `GCD (Grand Central Dispatch) uses closures/completion handlers for async work. You dispatch work to queues and provide a callback that runs when the work finishes. While powerful, GCD has several pain points:

1. **Callback hell** — Multiple async operations create deeply nested closures that are hard to read and maintain.
2. **Error handling is manual** — You must remember to call the completion handler in every code path, including error paths. Forgetting to call it means the caller hangs forever. Calling it twice is undefined behavior.
3. **No structured cancellation** — There's no built-in way to cancel dispatched work or propagate cancellation through a chain of operations.
4. **Thread safety is your problem** — You must manually dispatch to the main queue for UI updates, and the compiler won't warn you if you forget.

async/await solves all of these:

1. **Linear, readable code** — async code reads top-to-bottom like synchronous code. No nesting.
2. **Integrated error handling** — async functions compose with try/catch. Errors propagate naturally up the call chain.
3. **Structured concurrency** — Tasks can be cancelled, and cancellation propagates to child tasks automatically.
4. **Compiler-enforced safety** — The compiler knows about MainActor and will warn you about thread-safety issues at compile time.

The key mechanism: when you 'await', the current task is SUSPENDED (not blocked), freeing the thread. GCD closures don't have this concept — a thread executing a closure is occupied until the closure returns.`,
    followUps: [
      'What is the difference between Task.sleep and Thread.sleep? Why does it matter?',
      'Can you call an async function from a synchronous context? How?',
      'What is MainActor and how does it relate to DispatchQueue.main?',
    ],
  },
  codePuzzle: {
    type: 'predict-output',
    prompt: 'What will the print statements output? Assume this runs in a non-isolated async context.',
    code: `func demo() async {
    print("1")
    try? await Task.sleep(nanoseconds: 1_000_000_000)
    print("2")
    await MainActor.run {
        print("3")
    }
    print("4")
}`,
    solution: 'The function prints 1, 2, 3, 4 in order. Even though there are suspension points (await), within a single task the execution is sequential. The Task.sleep suspends for ~1 second then resumes. MainActor.run suspends until the main thread is available, executes the closure printing 3, then resumes printing 4. The ORDER is always 1, 2, 3, 4 — but the THREADS may differ between suspension points.',
    options: [
      '1, 2, 3, 4 — in order, sequentially',
      '1, 3, 2, 4 — MainActor.run jumps ahead',
      '1, 2, 4, 3 — MainActor.run runs later',
      '1 then unpredictable order for 2, 3, 4',
    ],
    correctOptionIndex: 0,
  },
  whatHappensNext: {
    title: 'Follow the Async Flow',
    steps: [
      {
        codeLine: 'let data = await fetchFromServer()',
        question: 'This hits "await". What happens to the current thread?',
        options: [
          { label: 'Thread blocks and waits', emoji: '🧊', isCorrect: false },
          { label: 'Thread is freed — goes to do other work', emoji: '🏃', isCorrect: true },
          { label: 'A new thread is created', emoji: '🆕', isCorrect: false },
        ],
        explanation: 'This is the KEY insight of async/await. The thread is NOT blocked — it\'s released back to the pool. Think of a waiter who drops off an order at the kitchen, then goes to serve other tables instead of standing at the window waiting.',
      },
      {
        codeLine: '// ...server responds after 2 seconds...',
        question: 'The server finally responds. What happens?',
        options: [
          { label: 'The original thread picks up where it left off', emoji: '🔙', isCorrect: false },
          { label: 'ANY available thread resumes the function', emoji: '🔀', isCorrect: true },
        ],
        explanation: 'After await, execution may resume on a DIFFERENT thread. The waiter who picks up the finished dish might not be the same waiter who placed the order. This is why Thread.current can show different threads before and after await.',
      },
      {
        codeLine: 'self.label.text = data  // UI update',
        question: 'This updates the UI. Is this safe?',
        options: [
          { label: 'Yes — UI updates work from any thread', emoji: '✅', isCorrect: false },
          { label: 'No — UI must be updated on the main thread!', emoji: '⚠️', isCorrect: true },
        ],
        explanation: 'UI updates MUST happen on the main thread. Since await can resume on any thread, you need @MainActor or MainActor.run to guarantee main thread execution. This is like saying only the head waiter can talk to customers — background workers pass dishes through the window.',
      },
    ],
  },
  fillKeyword: {
    title: 'Complete the Async Function',
    codeTemplate: `// Mark this function as asynchronous
func fetchUser() {{blank1}} -> User {
    // Suspend here while waiting for network
    let data = {{blank2}} URLSession.shared.data(from: url)

    // This might fail — handle the error
    let user = {{blank3}} JSONDecoder().decode(User.self, from: data)

    return user
}

// Call the async function from a synchronous context
Task {
    let user = {{blank4}} fetchUser()
    print(user.name)
}`,
    blanks: [
      { id: 'blank1', correctAnswer: 'async', distractors: ['throws', 'mutating'], hint: 'This keyword marks a function that can suspend' },
      { id: 'blank2', correctAnswer: 'try await', distractors: ['await try', 'async'], hint: 'You need both error handling and suspension — try comes first' },
      { id: 'blank3', correctAnswer: 'try', distractors: ['await', 'throw'], hint: 'Decoding can fail but it\'s not async — just error handling' },
      { id: 'blank4', correctAnswer: 'try await', distractors: ['await', 'async'], hint: 'fetchUser is both async AND can throw' },
    ],
  },
  quickChecks: [
    {
      question: 'Does "await" block the thread like Thread.sleep does?',
      options: ['Yes, both block', 'No — await frees the thread'],
      correctIndex: 1,
      explanation: 'await SUSPENDS the task (bookmarks your place) and frees the thread. Thread.sleep BLOCKS the thread (holds it hostage). Huge difference!',
    },
    {
      question: 'Can you call an async function from a regular (non-async) function?',
      options: ['Yes, just add await', 'No — you need a Task { } wrapper'],
      correctIndex: 1,
      explanation: 'You can\'t use await in a synchronous function. You need Task { } to create an async context first.',
    },
  ],
};

export default topic;
