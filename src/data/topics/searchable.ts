import type { Topic } from '@/types/topic';

const topic: Topic = {
  slug: 'searchable',
  order: 16,
  title: 'Searchable',
  subtitle: 'Pantry search system',
  icon: '🔍',
  prerequisiteSlugs: ['download-image-async'],
  storyDay: 30,
  storyIntro:
    "Day 30. The restaurant pantry has grown massive — three walk-in shelves of ingredients, spices from six continents, and a freezer the size of a small room. When the sous chef yells \"I need smoked paprika!\" nobody wants to search every shelf by hand. So you install a search terminal at the pantry entrance. The chef types a few letters and the system shows matching ingredients, updating as they type.\n\nBut there's a problem: the chef types fast. If you search the entire pantry on every keystroke, you'll have runners racing back and forth between shelves, bumping into each other, returning results for \"sm\" when the chef already typed \"smoked pap\". You need two things: debouncing (wait until the chef pauses typing before searching) and cancellation (if a new search starts, stop the old one immediately).\n\nThis is exactly what SwiftUI's `.searchable` modifier gives you — a search bar wired into NavigationStack. But the debouncing and cancellation? That's where Swift concurrency shines. With `.task(id:)` and `Task.sleep`, you get automatic cancellation of stale searches and debounced execution — no Combine, no timers, just structured concurrency.",
  kitchenMetaphor:
    "Search the pantry shelves — debounce so the chef doesn't run back and forth.",
  sections: [
    {
      id: 'concept-searchable-basics',
      type: 'concept',
      title: 'SwiftUI .searchable Fundamentals',
      content: `The \`.searchable\` modifier adds a search bar to a \`NavigationStack\` (or \`NavigationSplitView\`). It binds to a \`@State\` string that updates as the user types.

**Basic anatomy:**
- \`.searchable(text: $searchText)\` — binds the search bar to a string
- \`.searchable(text:placement:prompt:)\` — customize placement and placeholder text
- The search bar appears in the navigation toolbar area
- On iOS, it's the pull-down search bar below the navigation title

**Key behaviors:**
- The bound text updates on EVERY keystroke — no built-in debounce
- \`.searchable\` only provides the UI; filtering logic is your responsibility
- You can add \`.searchScopes\` for category tabs (e.g., "All", "Spices", "Proteins")
- \`.searchSuggestions\` provides autocomplete dropdown items

**The concurrency challenge:** If search hits a network API or database, you don't want to fire a request on every keystroke. You need:
1. **Debouncing** — wait until the user pauses typing (e.g., 300ms)
2. **Cancellation** — if the user types more, cancel the pending search
3. **Ordering** — make sure the displayed results match the current query, not a stale one

All three are elegantly solved with \`.task(id:)\` and structured concurrency.`,
    },
    {
      id: 'code-walkthrough-searchable-view',
      type: 'code-walkthrough',
      title: 'Searchable List with Debounce',
      content: 'Here is the full pattern for a searchable view with async debounced search and automatic cancellation:',
      codeBlocks: [
        {
          id: 'searchable-debounce',
          label: 'NavigationStack with .searchable and debounce',
          code: `struct PantrySearchView: View {
    @StateObject private var vm = PantryViewModel()
    @State private var searchText = ""

    var body: some View {
        NavigationStack {
            List(vm.results, id: \\.name) { item in
                HStack {
                    Text(item.emoji)
                    VStack(alignment: .leading) {
                        Text(item.name).font(.headline)
                        Text(item.category).font(.caption)
                    }
                }
            }
            .overlay {
                if vm.isSearching {
                    ProgressView("Searching...")
                }
                if vm.results.isEmpty && !searchText.isEmpty && !vm.isSearching {
                    ContentUnavailableView.search(text: searchText)
                }
            }
            .searchable(text: $searchText, prompt: "Search ingredients")
            .task(id: searchText) {
                await vm.search(query: searchText)
            }
            .navigationTitle("Pantry")
        }
    }
}`,
          steps: [
            {
              lineRange: [2, 3],
              explanation: "The ViewModel handles search logic. searchText is a @State string bound to the search bar — it updates on every keystroke. These are separate concerns: the view owns the text input, the ViewModel owns the search results.",
              threadIndicator: 'main',
            },
            {
              lineRange: [7, 15],
              explanation: "A standard List rendering search results. Each item shows an emoji, name, and category. This re-renders whenever vm.results changes.",
              threadIndicator: 'main',
            },
            {
              lineRange: [16, 23],
              explanation: "Two overlay states: a loading spinner while searching, and the system-provided ContentUnavailableView.search when there are no results for the query. The three-condition check prevents the empty state from flashing during loading.",
              threadIndicator: 'main',
            },
            {
              lineRange: [24, 27],
              explanation: "This is the critical pair. .searchable binds the text field. .task(id: searchText) is the magic: whenever searchText changes, SwiftUI CANCELS the previous task and starts a new one. This gives us automatic cancellation of stale searches. The ViewModel adds the debounce delay inside search().",
              threadIndicator: 'main',
              executionNote: 'Previous task cancelled on every keystroke',
            },
          ],
        },
      ],
    },
    {
      id: 'code-walkthrough-search-vm',
      type: 'code-walkthrough',
      title: 'Search ViewModel with Debounce',
      content: 'The ViewModel implements debouncing using Task.sleep — if the task is cancelled (because the user typed again), the sleep throws and the search never fires:',
      codeBlocks: [
        {
          id: 'search-viewmodel',
          label: 'PantryViewModel with debounced async search',
          code: `struct Ingredient: Codable {
    let name: String
    let emoji: String
    let category: String
}

@MainActor
class PantryViewModel: ObservableObject {
    @Published var results: [Ingredient] = []
    @Published var isSearching = false

    func search(query: String) async {
        guard !query.isEmpty else {
            results = []
            isSearching = false
            return
        }

        isSearching = true

        // Debounce: wait 300ms. If the Task is cancelled
        // (user typed again), this throws and we exit early.
        do {
            try await Task.sleep(for: .milliseconds(300))
        } catch {
            return // Task was cancelled — don't search
        }

        do {
            let encoded = query.addingPercentEncoding(
                withAllowedCharacters: .urlQueryAllowed
            ) ?? query
            let url = URL(string: "https://api.example.com/search?q=\\(encoded)")!
            let (data, _) = try await URLSession.shared.data(from: url)
            let decoded = try JSONDecoder().decode([Ingredient].self, from: data)

            // Only update if this task is still active
            if !Task.isCancelled {
                results = decoded
            }
        } catch is CancellationError {
            return
        } catch {
            results = []
        }

        isSearching = false
    }
}`,
          steps: [
            {
              lineRange: [12, 17],
              explanation: "Guard against empty queries — clear the results and return immediately. This handles the case where the user deletes all text from the search bar.",
              threadIndicator: 'main',
            },
            {
              lineRange: [21, 27],
              explanation: "THE DEBOUNCE. Task.sleep(for: .milliseconds(300)) suspends for 300ms. If the user types another character during those 300ms, .task(id:) cancels this Task, which causes sleep to throw CancellationError. We catch it and return — the search never fires. Only when the user pauses for 300ms does execution continue past the sleep.",
              threadIndicator: 'background',
              executionNote: 'Cancelled if user types within 300ms',
            },
            {
              lineRange: [29, 36],
              explanation: "The actual network search. This only runs after the debounce delay succeeds (user stopped typing). URLSession.shared.data(from:) is also cancellation-aware — if the Task is cancelled while the network request is in flight, it throws CancellationError.",
              threadIndicator: 'background',
              executionNote: 'Network request — also cancellable',
            },
            {
              lineRange: [38, 40],
              explanation: "A defensive check: Task.isCancelled verifies the task is still active before updating results. This prevents a stale response from overwriting results from a newer, faster search. Belt and suspenders with the catch below.",
              threadIndicator: 'main',
            },
          ],
        },
      ],
    },
    {
      id: 'side-by-side-debounce-approaches',
      type: 'side-by-side',
      title: 'Debounce Approaches Compared',
      content: `**Combine debounce (old way):**
\`\`\`swift
$searchText
    .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
    .removeDuplicates()
    .sink { query in
        // fire search
    }
    .store(in: &cancellables)
\`\`\`
Requires importing Combine, managing AnyCancellable storage, and the sink callback doesn't integrate cleanly with async/await.

**Task.sleep debounce (new way):**
\`\`\`swift
.task(id: searchText) {
    try? await Task.sleep(for: .milliseconds(300))
    guard !Task.isCancelled else { return }
    await vm.search(query: searchText)
}
\`\`\`
No Combine import. Cancellation is automatic via structured concurrency. The code reads top-to-bottom. The sleep IS the debounce — if cancelled before it completes, the search never runs.

**Key differences:**
| Aspect | Combine | Task.sleep |
|---|---|---|
| Cancellation | Manual (AnyCancellable) | Automatic (structured) |
| Dependencies | Combine framework | None (built-in) |
| Learning curve | Publisher chain operators | Sequential async code |
| Flexibility | Rich operator library | Simpler but sufficient |

For most SwiftUI search scenarios, the Task.sleep approach is simpler and fully sufficient. Use Combine when you need complex stream transformations (merge, combineLatest, etc.).`,
    },
    {
      id: 'edge-case-race-conditions',
      type: 'edge-case',
      title: 'Race Conditions in Search',
      content: `**The stale response problem:** Imagine the user searches "pasta", then quickly changes to "pizza". If the "pasta" network request is slow and "pizza" is fast, "pizza" results arrive first, then "pasta" results arrive and overwrite them. The user sees "pasta" results while the search bar says "pizza".

**Why .task(id:) solves this:** When searchText changes from "pasta" to "pizza", SwiftUI cancels the "pasta" task entirely. The URLSession request for "pasta" is aborted. The "pizza" task starts fresh. There's no way for stale results to arrive because the old task is dead.

**But watch out for this pattern:**

\`\`\`swift
// DANGEROUS — no cancellation protection
func search(query: String) async {
    let results = try? await api.search(query)
    self.results = results ?? [] // Stale results if called concurrently!
}
\`\`\`

Without .task(id:) handling cancellation, two calls to search() could interleave. Always check \`Task.isCancelled\` before assigning results, or rely on .task(id:) to cancel the previous call.

**Another subtle bug — searching on every keystroke without debounce:**

\`\`\`swift
// Rate-limit problem
.task(id: searchText) {
    // No debounce! Fires a network request on EVERY keystroke.
    await vm.search(query: searchText)
}
\`\`\`

For local filtering, this is fine. For network calls, add the Task.sleep debounce to avoid hammering your API with requests for "p", "pi", "piz", "pizz", "pizza".`,
    },
  ],
  interviewQuestion: {
    question: 'How would you debounce search in SwiftUI with async/await?',
    hints: [
      'Think about .task(id:) — what happens to the previous task when the id changes?',
      'Consider Task.sleep as a debounce mechanism. What happens if the task is cancelled during sleep?',
      'How do you prevent stale search results from overwriting newer results?',
    ],
    answer: `The key insight is combining .task(id:) with Task.sleep to create a debounce that leverages structured concurrency's automatic cancellation. You bind .searchable to a @State string and use .task(id: searchText). Every time searchText changes, SwiftUI cancels the currently running task and spawns a new one.

Inside the task, the first thing you do is try await Task.sleep(for: .milliseconds(300)). This 300ms pause IS the debounce. If the user types another character before the 300ms elapses, the task is cancelled, Task.sleep throws CancellationError, and you exit early — the search never fires. Only when the user pauses typing for 300ms does the sleep complete successfully and the actual search execute.

This approach also solves the stale response problem. Because .task(id:) cancels the previous task, there is never a situation where two searches are in flight simultaneously (assuming you let the cancellation propagate through URLSession). Even if you add an explicit Task.isCancelled check before assigning results, the primary protection is that the old task is killed when the new one starts.

Compared to the Combine approach (using .debounce operator on a publisher pipeline), this is simpler and doesn't require importing Combine or managing AnyCancellable storage. The code reads sequentially: sleep, then search, then assign. Cancellation is implicit via structured concurrency rather than explicit via cancellable tokens. For most search implementations in SwiftUI, this pattern is the recommended modern approach.`,
    followUps: [
      'What if you want to show search suggestions while debouncing the main search? How would you handle two different debounce intervals?',
      'How would you add .searchScopes to filter by category, and how does that interact with the debounce?',
      'Could you implement a similar debounce with an actor instead of .task(id:)?',
    ],
  },
  codePuzzle: {
    type: 'predict-output',
    prompt: 'The user types "a", then "ab" after 100ms, then "abc" after another 100ms, then waits 500ms. How many network requests fire?',
    code: `@State private var searchText = ""

var body: some View {
    List { /* ... */ }
        .searchable(text: $searchText)
        .task(id: searchText) {
            do {
                try await Task.sleep(for: .milliseconds(300))
                print("Searching: \\(searchText)")
                // await networkSearch(searchText)
            } catch {
                print("Cancelled: \\(searchText)")
            }
        }
}
// User types: "a" (t=0), "ab" (t=100ms), "abc" (t=200ms), waits...`,
    solution: 'Only 1 network request fires, for "abc". Here\'s why: At t=0, a task starts for "a" and begins sleeping 300ms. At t=100ms, searchText becomes "ab" — the "a" task is cancelled (prints "Cancelled: a"), and a new task starts sleeping. At t=200ms, searchText becomes "abc" — the "ab" task is cancelled (prints "Cancelled: ab"), and a new task starts sleeping. At t=500ms (300ms after the last keystroke), the sleep completes and "Searching: abc" prints. Only the final query triggers a search.',
    options: [
      '3 requests — one for each keystroke',
      '1 request — only "abc" (others cancelled during debounce)',
      '2 requests — "a" fires before cancellation, plus "abc"',
      '0 requests — all tasks are cancelled',
    ],
    correctOptionIndex: 1,
  },
};

export default topic;
