import type { Topic } from '@/types/topic';

const topic: Topic = {
  slug: 'task-group',
  order: 7,
  title: 'Task Groups',
  subtitle: 'Catering event coordination',
  icon: '🎪',
  prerequisiteSlugs: ['task', 'async-let'],
  storyDay: 12,
  storyIntro:
    "Day 12, and your restaurant has been hired to cater a wedding with 150 guests. The bride wants 150 personalized dessert plates — each one slightly different. You can't use `async let` because you don't know at compile time how many plates you'll need (what if next week it's a party of 30? or 500?). You need a system where you can dynamically spin up as many chefs as needed, have them all work in parallel, and collect every finished plate into one big cart.\n\nEnter `TaskGroup` — the catering coordinator of Swift concurrency. You open a group, add child tasks in a loop (one per dessert plate), and the group manages everything: parallel execution, result collection, cancellation if something goes wrong, and making sure every child task finishes before the group closes.\n\nUnlike `async let` where you declare a fixed number of parallel operations, `TaskGroup` lets you spawn tasks dynamically based on runtime data. It's the difference between a kitchen with 3 fixed burners and a kitchen that can summon as many burners as it needs.",
  kitchenMetaphor:
    'A big event needs coordinated prep — spawn tasks dynamically.',
  sections: [
    {
      id: 'concept-why-task-groups',
      type: 'concept',
      title: 'When Async Let Is Not Enough',
      content: `\`async let\` works great when you know exactly how many parallel tasks you need at compile time: fetch a user, an avatar, and posts — always three. But what about:

- Downloading thumbnails for a **variable-length** array of URLs?
- Processing every item in a user's shopping cart?
- Fetching details for each search result?

You need **dynamic structured concurrency** — the ability to spawn N child tasks where N is only known at runtime. That's \`TaskGroup\`.

**Two flavors:**
- \`withTaskGroup(of: T.self)\` — for child tasks that don't throw
- \`withThrowingTaskGroup(of: T.self)\` — for child tasks that can throw

Both return results via an \`AsyncSequence\` that you iterate with \`for await\`. Results arrive in **completion order** — whichever child finishes first is yielded first, NOT the order you added them.`,
    },
    {
      id: 'code-walkthrough-basic-group',
      type: 'code-walkthrough',
      title: 'Fetching N Images in Parallel',
      content:
        'Here\'s the classic use case — downloading an array of images concurrently and collecting them all:',
      codeBlocks: [
        {
          id: 'image-fetch-group',
          label: 'Parallel Image Fetching with TaskGroup',
          code: `func fetchAllThumbnails(ids: [String]) async throws -> [String: UIImage] {
    try await withThrowingTaskGroup(of: (String, UIImage).self) { group in
        for id in ids {
            group.addTask {
                let url = URL(string: "https://example.com/thumb/\\(id)")!
                let (data, _) = try await URLSession.shared.data(from: url)
                guard let image = UIImage(data: data) else {
                    throw ThumbnailError.invalidData
                }
                return (id, image)
            }
        }

        var results: [String: UIImage] = [:]
        for try await (id, image) in group {
            results[id] = image
        }
        return results
    }
}`,
          steps: [
            {
              lineRange: [1, 2],
              explanation:
                "We open a throwing task group whose child tasks each produce a (String, UIImage) tuple. The 'of:' parameter tells Swift the return type of each child task. The entire withThrowingTaskGroup call returns our final dictionary.",
              threadIndicator: 'background',
            },
            {
              lineRange: [3, 12],
              explanation:
                "For each image ID, we add a child task to the group. Each task runs concurrently — if there are 50 IDs, up to 50 tasks may run in parallel (Swift's runtime manages the actual concurrency level). Each child fetches data from a URL and converts it to a UIImage.",
              executionNote:
                'Child tasks start running as soon as they are added',
              threadIndicator: 'background',
            },
            {
              lineRange: [14, 17],
              explanation:
                "We iterate the group as an AsyncSequence using 'for try await'. Results arrive in COMPLETION ORDER — whichever download finishes first is yielded first. We build up our dictionary as results trickle in. If any child throws, the error propagates here.",
              threadIndicator: 'suspended',
            },
            {
              lineRange: [18, 18],
              explanation:
                "Once all child tasks have completed and we've collected every result, we return the dictionary. The group ensures ALL children finish before this line is reached — no orphaned tasks.",
              threadIndicator: 'background',
            },
          ],
        },
      ],
    },
    {
      id: 'code-walkthrough-error-handling',
      type: 'code-walkthrough',
      title: 'Graceful Error Handling in Task Groups',
      content:
        'Sometimes you want some tasks to fail without bringing down the whole group. Here\'s how to handle errors per-task:',
      codeBlocks: [
        {
          id: 'graceful-errors',
          label: 'Per-Task Error Handling',
          code: `func fetchAvailableImages(ids: [String]) async -> [String: UIImage] {
    await withTaskGroup(of: (String, UIImage?).self) { group in
        for id in ids {
            group.addTask {
                do {
                    let image = try await downloadImage(id: id)
                    return (id, image)
                } catch {
                    print("Failed to fetch \\(id): \\(error)")
                    return (id, nil)
                }
            }
        }

        var results: [String: UIImage] = [:]
        for await (id, image) in group {
            if let image {
                results[id] = image
            }
        }
        return results
    }
}`,
          steps: [
            {
              lineRange: [1, 2],
              explanation:
                "Notice we use withTaskGroup (non-throwing) instead of withThrowingTaskGroup. Each child returns an optional UIImage. This means the group itself will never throw — we handle errors inside each child task.",
              threadIndicator: 'background',
            },
            {
              lineRange: [4, 12],
              explanation:
                "Each child task wraps its work in a do/catch. If a download fails, we log the error and return nil instead of propagating the throw. This allows other tasks to continue running — one failure doesn't cancel the group.",
              threadIndicator: 'background',
            },
            {
              lineRange: [15, 21],
              explanation:
                "We iterate with 'for await' (no 'try' needed since the group is non-throwing). We only add successful results to our dictionary. The caller gets back whatever images succeeded, with failed ones simply omitted.",
              threadIndicator: 'suspended',
            },
          ],
        },
      ],
    },
    {
      id: 'edge-case-group-pitfalls',
      type: 'edge-case',
      title: 'Task Group Gotchas',
      content: `**1. Results arrive in completion order, not submission order:**
\`\`\`swift
await withTaskGroup(of: Int.self) { group in
    group.addTask { try? await Task.sleep(for: .seconds(2)); return 1 }
    group.addTask { try? await Task.sleep(for: .seconds(1)); return 2 }
    for await value in group {
        print(value)  // Prints 2, then 1 — NOT 1, then 2
    }
}
\`\`\`
If you need ordered results, pair each result with an index and sort afterward.

**2. You cannot access mutable variables from child tasks:**
\`\`\`swift
// WRONG — compiler error
var count = 0
await withTaskGroup(of: Void.self) { group in
    group.addTask { count += 1 }  // Error: mutation of captured var
}
\`\`\`
Child task closures must be \`@Sendable\`, which means they cannot capture mutable local variables. Return values from child tasks and collect them in the \`for await\` loop instead.

**3. Throwing group cancels remaining children:**
With \`withThrowingTaskGroup\`, if you don't catch errors inside child tasks and one throws, the group cancels all remaining children and rethrows the error. This is often what you want — but if you need partial results, catch errors inside each child (as shown in the previous section).

**4. Don't forget to iterate the group:**
If you add tasks but never iterate with \`for await\`, the group still waits for all tasks to complete at the end of the closure — but you lose all the return values.`,
    },
    {
      id: 'deep-dive-concurrency-limits',
      type: 'deep-dive',
      title: 'Concurrency Limits and Back-Pressure',
      content: `A common concern: "If I add 10,000 child tasks to a TaskGroup, will it create 10,000 threads?" **No.** Swift's cooperative thread pool limits the actual number of threads (typically to the number of CPU cores). Tasks are scheduled cooperatively — when one suspends at an \`await\`, another task gets to run on that thread.

However, all 10,000 tasks ARE created in memory. For very large workloads, you may want to limit concurrency manually:

\`\`\`swift
func processInBatches(items: [Item]) async {
    await withTaskGroup(of: Void.self) { group in
        let maxConcurrency = 10
        for (index, item) in items.enumerated() {
            if index >= maxConcurrency {
                await group.next()  // wait for one to finish before adding more
            }
            group.addTask { await process(item) }
        }
    }
}
\`\`\`

The \`group.next()\` call waits for any one child task to complete before adding the next. This creates a sliding window of at most \`maxConcurrency\` active tasks — essential for memory-sensitive workloads like image processing.

**TaskGroup vs async let recap:**
| Feature | async let | TaskGroup |
|---------|-----------|-----------|
| Number of tasks | Fixed at compile time | Dynamic at runtime |
| Return types | Can differ per task | Must be the same type |
| Result order | Matches declaration | Completion order |
| Best for | 2-5 known operations | N operations from a collection |`,
    },
  ],
  interviewQuestion: {
    question:
      'How does TaskGroup handle child task failures?',
    hints: [
      'Consider the difference between withTaskGroup and withThrowingTaskGroup.',
      'Think about what happens to sibling tasks when one child throws in a throwing group.',
      'Consider how you would implement partial-success behavior where some tasks can fail.',
    ],
    answer: `The behavior depends on which variant you use. With \`withThrowingTaskGroup\`, if a child task throws an error and you are iterating with \`for try await\`, the error propagates out of the iteration. At that point, the group automatically cancels all remaining child tasks and waits for them to finish (cancellation is cooperative — tasks must check \`Task.isCancelled\`). The thrown error then propagates to the caller of \`withThrowingTaskGroup\`.

If you want to handle failures individually, you catch errors INSIDE each child task's closure. The child returns a result type (like an optional or a Result enum) instead of throwing. This way, one failure doesn't cancel the group and you can collect partial results. You would typically use the non-throwing \`withTaskGroup\` in this pattern.

You can also use \`group.next()\` to manually consume results one at a time and handle errors case by case, rather than using the \`for try await\` loop. This gives you maximum control: you can decide per-error whether to cancel the group (\`group.cancelAll()\`), log and continue, or take some other action.

A subtle point: even after \`group.cancelAll()\` is called, child tasks don't stop immediately. Cancellation in Swift is cooperative — each child task must periodically check \`Task.isCancelled\` or use cancellation-aware APIs like \`Task.sleep\` and \`URLSession\`. Well-written async APIs already do this, but custom logic needs explicit checks.`,
    followUps: [
      'How would you limit the number of concurrent tasks in a TaskGroup?',
      'Can TaskGroup child tasks return different types? How do you work around this?',
      'What is the difference between group.cancelAll() and throwing from a child task?',
    ],
  },
  codePuzzle: {
    type: 'predict-output',
    prompt:
      'What values will be printed and in what order?',
    code: `func demo() async {
    await withTaskGroup(of: String.self) { group in
        group.addTask {
            try? await Task.sleep(for: .seconds(2))
            return "A"
        }
        group.addTask {
            try? await Task.sleep(for: .seconds(1))
            return "B"
        }
        group.addTask {
            return "C"
        }
        for await letter in group {
            print(letter)
        }
    }
}`,
    solution:
      'TaskGroup yields results in completion order. The third task returns "C" immediately (no sleep), the second task returns "B" after 1 second, and the first task returns "A" after 2 seconds. So the print order is C, B, A. This is a key difference from async let, where results are gathered in declaration order.',
    options: [
      'A, B, C — in the order tasks were added',
      'C, B, A — in completion order (fastest first)',
      'A, B, C or C, B, A — unpredictable',
      'C, A, B — alphabetical order',
    ],
    correctOptionIndex: 1,
  },
};

export default topic;
