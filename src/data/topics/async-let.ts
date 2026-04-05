import type { Topic } from '@/types/topic';

const topic: Topic = {
  slug: 'async-let',
  order: 6,
  title: 'Async Let',
  subtitle: 'Parallel burners',
  icon: '🔥',
  prerequisiteSlugs: ['async-await'],
  storyDay: 10,
  storyIntro:
    "Day 10 at the restaurant, and you've mastered the art of placing one order at a time. But tonight, a table of eight just walked in, and they all ordered different dishes. Your current approach — cook dish 1, wait, cook dish 2, wait, cook dish 3, wait — means the first person's food is cold by the time the last dish is ready. You need to fire up ALL the burners at once and cook everything in parallel.\n\nThat's exactly what `async let` does. Instead of awaiting each async call one at a time (sequential), you declare multiple `async let` bindings that all start executing immediately and in parallel. You only await when you actually need the results. It's like telling four chefs to start cooking simultaneously, then collecting all the plates at the end.\n\nThe beauty is that this is still structured concurrency — if you leave the scope (say, the table cancels their order), all the parallel tasks are automatically cancelled. No orphaned burners left running.",
  kitchenMetaphor:
    'Fire all burners simultaneously — cook in parallel, combine at the end.',
  sections: [
    {
      id: 'concept-sequential-vs-parallel',
      type: 'concept',
      title: 'Sequential Awaiting vs Parallel Execution',
      content: `By default, when you write multiple \`await\` calls in a row, they execute **sequentially** — each one must finish before the next one starts. This is like a single chef cooking one dish at a time.

**Sequential (slow):**
\`\`\`swift
let soup = try await fetchSoup()       // 2 seconds
let salad = try await fetchSalad()     // 1 second
let steak = try await fetchSteak()     // 3 seconds
// Total: ~6 seconds
\`\`\`

**Parallel with async let (fast):**
\`\`\`swift
async let soup = fetchSoup()           // starts immediately
async let salad = fetchSalad()         // starts immediately
async let steak = fetchSteak()         // starts immediately
let meal = try await (soup, salad, steak)
// Total: ~3 seconds (limited by the slowest)
\`\`\`

With \`async let\`, all three operations begin concurrently the moment they are declared. You only \`await\` when you need the actual values. The total time is the duration of the **slowest** operation, not the sum of all operations.

**Key rule:** You MUST \`await\` every \`async let\` binding before leaving its scope. If you don't explicitly await it, Swift implicitly cancels the child task and awaits its completion at the end of the scope.`,
    },
    {
      id: 'code-walkthrough-async-let-basics',
      type: 'code-walkthrough',
      title: 'Async Let in Action',
      content:
        'Let\'s walk through a real example of using async let to fetch data in parallel:',
      codeBlocks: [
        {
          id: 'parallel-fetch',
          label: 'Fetching User Data in Parallel',
          code: `func loadUserProfile(id: String) async throws -> Profile {
    async let user = fetchUser(id: id)
    async let avatar = fetchAvatar(id: id)
    async let posts = fetchRecentPosts(id: id)

    let profile = try await Profile(
        user: user,
        avatar: avatar,
        posts: posts
    )
    return profile
}`,
          steps: [
            {
              lineRange: [1, 1],
              explanation:
                "The function is marked async throws — it can suspend and it can throw errors. The caller will need to use 'try await' to call it.",
              threadIndicator: 'background',
            },
            {
              lineRange: [2, 4],
              explanation:
                "Three async let declarations — each one spawns a child task that starts executing IMMEDIATELY. Notice there's no 'await' keyword here. The tasks are running concurrently right now, like three chefs working on different dishes at the same time.",
              executionNote:
                'All three network requests are in-flight simultaneously',
              threadIndicator: 'background',
            },
            {
              lineRange: [6, 10],
              explanation:
                "NOW we await all three results together. The 'try await' suspends until ALL three child tasks have completed. If any one of them throws an error, the other two are automatically cancelled. This is structured concurrency in action — the child tasks cannot outlive this scope.",
              threadIndicator: 'suspended',
            },
            {
              lineRange: [11, 11],
              explanation:
                'Once all three results are available, we return the assembled profile. The total wait time was only as long as the slowest of the three fetches.',
              threadIndicator: 'background',
            },
          ],
        },
      ],
    },
    {
      id: 'side-by-side-sequential-parallel',
      type: 'side-by-side',
      title: 'Sequential vs Async Let — Performance Impact',
      content: `Let's see the real difference in execution time:

**Sequential — Total ~5 seconds:**
\`\`\`swift
func loadSequential() async throws -> (User, [Post]) {
    let user = try await fetchUser()      // 2s
    let posts = try await fetchPosts()    // 3s
    return (user, posts)                  // runs AFTER both finish
}
\`\`\`

**Parallel — Total ~3 seconds:**
\`\`\`swift
func loadParallel() async throws -> (User, [Post]) {
    async let user = fetchUser()          // starts now
    async let posts = fetchPosts()        // also starts now
    return try await (user, posts)        // waits for both
}
\`\`\`

The sequential version takes 2 + 3 = 5 seconds. The parallel version takes max(2, 3) = 3 seconds. For independent operations, async let can dramatically improve performance.

**When to use sequential await instead:**
- When the second call depends on the first call's result (e.g., fetch user, then fetch that user's posts)
- When you need to check a condition before starting the next operation
- When you want to fail fast and avoid unnecessary work`,
    },
    {
      id: 'edge-case-error-cancellation',
      type: 'edge-case',
      title: 'Error Handling and Auto-Cancellation',
      content: `One of the most important behaviors of \`async let\` is **automatic cancellation on error**. If any child task throws, the remaining sibling tasks are cancelled before the error propagates.

\`\`\`swift
func loadDashboard() async throws -> Dashboard {
    async let profile = fetchProfile()      // succeeds in 1s
    async let analytics = fetchAnalytics()  // throws after 0.5s
    async let settings = fetchSettings()    // would take 2s

    // When analytics throws at 0.5s:
    // 1. profile is cancelled (was still running)
    // 2. settings is cancelled (was still running)
    // 3. The error from analytics propagates to the caller
    return try await Dashboard(
        profile: profile,
        analytics: analytics,
        settings: settings
    )
}
\`\`\`

**What about partial results?** You cannot get partial results with \`async let\`. If you need some operations to succeed independently (e.g., show the profile even if analytics fails), use a \`TaskGroup\` instead, or wrap individual calls in their own do/catch blocks.

**Implicit cancellation at scope exit:** If you declare an \`async let\` but never \`await\` it, Swift cancels the child task and implicitly awaits it when the scope ends. The task WILL be cleaned up — you cannot leak a child task with \`async let\`.`,
    },
    {
      id: 'deep-dive-structured-concurrency',
      type: 'deep-dive',
      title: 'Async Let Under the Hood',
      content: `\`async let\` is part of Swift's **structured concurrency** model. Here's what happens behind the scenes:

1. **Child task creation** — Each \`async let\` creates a child task in the current task's hierarchy. The child inherits the parent's priority and task-local values.

2. **Immediate execution** — The child task starts running as soon as it's declared. It doesn't wait for you to \`await\` it. This is different from lazy evaluation.

3. **Scope-bound lifetime** — The child task CANNOT outlive the scope where the \`async let\` is declared. This is the "structured" part — the task tree is always a proper tree, never a tangle.

4. **Cancellation propagation** — If the parent task is cancelled, all \`async let\` child tasks receive cancellation automatically. If one child throws, siblings are cancelled.

5. **Fixed concurrency** — \`async let\` is best when you know at compile time how many concurrent operations you need. If you need a dynamic number (e.g., fetch N images), use \`TaskGroup\` instead.

**Common mistake — async let in a loop:**
\`\`\`swift
// WRONG — this is still sequential!
for id in ids {
    async let result = fetch(id)
    results.append(try await result)  // awaits immediately each iteration
}
\`\`\`
Each iteration awaits before the next one starts. For dynamic parallelism, you need \`TaskGroup\`.`,
    },
  ],
  interviewQuestion: {
    question:
      'When would you use async let vs TaskGroup?',
    hints: [
      'Think about whether you know the number of concurrent operations at compile time or only at runtime.',
      'Consider how error handling differs — async let cancels siblings, TaskGroup gives you more control.',
      'Think about collecting results — async let uses tuples, TaskGroup uses an async sequence.',
    ],
    answer: `Use \`async let\` when you have a **fixed, known number** of concurrent operations at compile time. For example, fetching a user's profile, avatar, and recent posts in parallel — you always know it's exactly three calls. The results can be different types, and you destructure them from a tuple.

Use \`TaskGroup\` when you have a **dynamic number** of concurrent operations determined at runtime. For example, fetching thumbnails for an array of N image URLs. TaskGroup lets you add child tasks in a loop, and you collect results as they complete via an AsyncSequence.

Error handling also differs significantly. With \`async let\`, if one child task throws, all siblings are automatically cancelled and the error propagates immediately. With \`TaskGroup\`, you have finer control — you can catch errors from individual child tasks inside the group body, allowing some tasks to fail while others succeed. This makes TaskGroup better suited for "best effort" scenarios.

Performance-wise, both use structured concurrency and child tasks under the hood. The key difference is ergonomics: \`async let\` is simpler and more readable for the fixed-count case, while \`TaskGroup\` is more powerful and flexible for the dynamic case. A common pattern is to start with \`async let\` and graduate to \`TaskGroup\` when requirements grow.`,
    followUps: [
      'Can async let child tasks return different types? How does that compare to TaskGroup?',
      'What happens if you never await an async let binding?',
      'How does task priority propagation work with async let?',
    ],
  },
  codePuzzle: {
    type: 'predict-output',
    prompt:
      'What is the total execution time (approximately) and what values does meals contain?',
    code: `func cook(dish: String, seconds: Int) async -> String {
    try? await Task.sleep(for: .seconds(seconds))
    return dish
}

func prepareDinner() async {
    let start = Date()
    async let a = cook(dish: "Soup", seconds: 2)
    async let b = cook(dish: "Steak", seconds: 3)
    async let c = cook(dish: "Salad", seconds: 1)
    let meals = await (a, b, c)
    let elapsed = Date().timeIntervalSince(start)
    print("Done in ~\\(Int(elapsed))s: \\(meals)")
}`,
    solution:
      'All three cook calls start concurrently via async let. Soup takes 2s, Steak takes 3s, Salad takes 1s. Since they run in parallel, the total time is determined by the slowest — Steak at 3 seconds. The meals array is ["Soup", "Steak", "Salad"] preserving the order they were listed in the array literal, NOT the order they finished. Output: "Done in ~3s: ["Soup", "Steak", "Salad"]"',
    options: [
      'Done in ~6s: ["Soup", "Steak", "Salad"]',
      'Done in ~3s: ["Soup", "Steak", "Salad"]',
      'Done in ~3s: ["Salad", "Soup", "Steak"]',
      'Done in ~1s: ["Salad"]',
    ],
    correctOptionIndex: 1,
  },
};

export default topic;
