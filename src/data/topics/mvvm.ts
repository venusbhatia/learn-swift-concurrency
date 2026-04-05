import type { Topic } from '@/types/topic';

const topic: Topic = {
  slug: 'mvvm',
  order: 12,
  title: 'MVVM Architecture',
  subtitle: 'Kitchen blueprint',
  icon: '📐',
  prerequisiteSlugs: ['global-actor'],
  storyDay: 22,
  storyIntro:
    "Day 22. The health inspector arrives and is horrified. Chefs are plating food at customer tables. Waitstaff are reaching into ovens. The dishwasher is taking orders. Everyone is doing everyone else's job, and nobody knows who is responsible for what. The inspector draws three zones on the floor with tape: the **dining room** (View), the **pass** where finished plates are placed (ViewModel), and the **kitchen** (Model/Data layer). Each zone has strict rules about who can be there and what they can touch.\n\nThe dining room is where customers sit — it only DISPLAYS food and takes orders. The staff there never cook. The pass is the ViewModel — the coordinator who receives orders from the dining room, calls back to the kitchen, and places finished plates on the counter for pickup. The kitchen is your data layer — actors and services that do the real work of fetching, transforming, and storing data.\n\nThis separation is MVVM: Model-View-ViewModel. In Swift concurrency, the ViewModel is @MainActor (it manages what the dining room sees), and the Model layer uses actors for thread-safe data management. The boundaries between zones are enforced by the compiler through actor isolation.",
  kitchenMetaphor:
    'Separate dining room (View), pass (ViewModel), and kitchen (Model).',
  sections: [
    {
      id: 'concept-mvvm-layers',
      type: 'concept',
      title: 'MVVM with Swift Concurrency',
      content: `**MVVM** separates your app into three layers:

**Model** — The data and business logic. In Swift concurrency, this is often an \`actor\` that manages shared state thread-safely. It knows nothing about the UI.

**View** — The SwiftUI struct that displays data and captures user input. It observes the ViewModel and redraws when @Published properties change. It should contain ZERO business logic.

**ViewModel** — The bridge between Model and View. Marked \`@MainActor\` because it drives UI state. It transforms raw data from the Model into display-ready formats and exposes @Published properties for the View to observe.

**How actor isolation enforces the boundaries:**
- The View accesses the ViewModel synchronously (same MainActor isolation)
- The ViewModel calls the Model (actor) with \`await\` — crossing an isolation boundary
- The Model can never accidentally touch UI state — the compiler prevents it
- Data flows one direction: User action -> View -> ViewModel -> Model -> ViewModel -> View

This is a massive improvement over pre-concurrency MVVM where threading mistakes at layer boundaries caused subtle bugs.`,
    },
    {
      id: 'code-walkthrough-full-mvvm',
      type: 'code-walkthrough',
      title: 'Complete MVVM Stack',
      content: 'Here is a complete MVVM implementation with an actor Model, @MainActor ViewModel, and SwiftUI View:',
      codeBlocks: [
        {
          id: 'actor-model',
          label: 'Model Layer — Actor',
          code: `actor RecipeRepository {
    private var recipes: [Recipe] = []
    private let networkService: NetworkService

    init(networkService: NetworkService = .shared) {
        self.networkService = networkService
    }

    func fetchRecipes() async throws -> [Recipe] {
        let newRecipes: [Recipe] = try await networkService.get("/recipes")
        recipes = newRecipes
        return recipes
    }

    func addRecipe(_ recipe: Recipe) {
        recipes.append(recipe)
    }

    func getRecipe(byId id: String) -> Recipe? {
        return recipes.first { $0.id == id }
    }
}`,
          steps: [
            {
              lineRange: [1, 3],
              explanation: "The Model layer is an actor — it owns the source of truth (the recipes array) and protects it from concurrent access. No matter how many ViewModels or background tasks access this repository, the actor serializes all operations. This IS your thread-safe data layer.",
              threadIndicator: 'background',
            },
            {
              lineRange: [9, 13],
              explanation: "fetchRecipes() is async and throws — it does real I/O work. This runs on the actor's executor (background), never blocking the main thread. It updates the local cache and returns the data. The ViewModel will 'await' this call, crossing the isolation boundary cleanly.",
              threadIndicator: 'background',
              executionNote: 'Network I/O runs off main thread',
            },
            {
              lineRange: [15, 20],
              explanation: "Synchronous methods like addRecipe and getRecipe access the actor's state directly — no await needed from INSIDE the actor. From outside, callers must await these too. The actor guarantees that addRecipe and getRecipe never run simultaneously with fetchRecipes.",
              threadIndicator: 'background',
            },
          ],
        },
        {
          id: 'mainactor-viewmodel',
          label: 'ViewModel Layer — @MainActor',
          code: `@MainActor
class RecipeListViewModel: ObservableObject {
    @Published var recipes: [RecipeRow] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let repository: RecipeRepository

    init(repository: RecipeRepository = RecipeRepository()) {
        self.repository = repository
    }

    func loadRecipes() async {
        isLoading = true
        defer { isLoading = false }

        do {
            let rawRecipes = try await repository.fetchRecipes()
            recipes = rawRecipes.map { RecipeRow(from: $0) }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func addRecipe(name: String) async {
        let recipe = Recipe(id: UUID().uuidString, name: name)
        await repository.addRecipe(recipe)
        await loadRecipes()
    }
}`,
          steps: [
            {
              lineRange: [1, 5],
              explanation: "@MainActor ensures every @Published property is only mutated on the main thread. SwiftUI observes these properties and redraws the view whenever they change. The 'RecipeRow' type is a display-ready struct — the ViewModel transforms raw Model data into what the View needs.",
              threadIndicator: 'main',
            },
            {
              lineRange: [13, 23],
              explanation: "loadRecipes() is the bridge: it sets UI loading state (main thread), then 'await's the actor (crosses to background), transforms the result, and updates @Published properties (back on main thread). The async/await syntax makes this read top-to-bottom despite crossing thread boundaries. No completion handlers, no DispatchQueue.main.async.",
              threadIndicator: 'main',
              executionNote: 'Suspends at await, resumes on MainActor',
            },
            {
              lineRange: [25, 29],
              explanation: "addRecipe creates a domain object, sends it to the repository (await crosses to actor), then reloads the full list. Each 'await' is an isolation boundary crossing: MainActor -> RecipeRepository actor -> MainActor. The compiler tracks all of this.",
              threadIndicator: 'main',
            },
          ],
        },
        {
          id: 'swiftui-view',
          label: 'View Layer — SwiftUI',
          code: `struct RecipeListView: View {
    @StateObject private var vm = RecipeListViewModel()

    var body: some View {
        List(vm.recipes) { recipe in
            Text(recipe.displayName)
        }
        .overlay {
            if vm.isLoading {
                ProgressView()
            }
        }
        .alert("Error", isPresented: .constant(vm.errorMessage != nil)) {
            Button("OK") { vm.errorMessage = nil }
        } message: {
            Text(vm.errorMessage ?? "")
        }
        .task {
            await vm.loadRecipes()
        }
    }
}`,
          steps: [
            {
              lineRange: [1, 2],
              explanation: "@StateObject creates and owns the ViewModel. SwiftUI keeps this instance alive for the lifetime of the view. Because RecipeListViewModel is @MainActor, and SwiftUI views operate on the main thread, the view accesses vm.recipes, vm.isLoading, etc. synchronously — no 'await' needed.",
              threadIndicator: 'main',
            },
            {
              lineRange: [4, 7],
              explanation: "The View is pure presentation — it reads vm.recipes and displays them. When the ViewModel's @Published property changes, SwiftUI automatically redraws this List. The View never calls the repository directly, never knows about networking, never touches business logic.",
              threadIndicator: 'main',
            },
            {
              lineRange: [18, 20],
              explanation: "The .task modifier starts the async work when the view appears and automatically cancels it when the view disappears. This is the recommended way to trigger ViewModel loading in SwiftUI — clean, cancellable, and tied to the view lifecycle.",
              threadIndicator: 'main',
              executionNote: 'Auto-cancelled when view disappears',
            },
          ],
        },
      ],
    },
    {
      id: 'side-by-side-di',
      type: 'side-by-side',
      title: 'Dependency Injection with Actors',
      content: `Actors make dependency injection cleaner because the compiler enforces boundaries.

**Without DI (tightly coupled):**
\`\`\`swift
@MainActor
class ViewModel: ObservableObject {
    func load() async {
        let data = try? await URLSession.shared.data(from: url)
        // Directly uses URLSession — impossible to test
    }
}
\`\`\`

**With actor-based DI:**
\`\`\`swift
protocol DataRepository: Actor {
    func fetchItems() async throws -> [Item]
}

actor LiveRepository: DataRepository {
    func fetchItems() async throws -> [Item] {
        // Real network call
        return try await APIClient.shared.get("/items")
    }
}

actor MockRepository: DataRepository {
    func fetchItems() async throws -> [Item] {
        return [Item(name: "Test")]  // Instant, no network
    }
}

@MainActor
class ViewModel: ObservableObject {
    private let repo: any DataRepository

    init(repo: any DataRepository = LiveRepository()) {
        self.repo = repo
    }

    func load() async {
        let items = try? await repo.fetchItems()
        // Works with real OR mock repository
    }
}
\`\`\`

Notice the protocol conforms to \`Actor\` — this means any conforming type must be an actor, guaranteeing thread safety. In tests, inject MockRepository. In production, inject LiveRepository. The ViewModel doesn't know or care which one it has.`,
    },
    {
      id: 'edge-case-task-management',
      type: 'edge-case',
      title: 'Task Lifecycle in ViewModels',
      content: `A common mistake in MVVM is creating Tasks that outlive their usefulness. Here are patterns to manage Task lifecycles properly:

**Problem: Overlapping loads**
\`\`\`swift
@MainActor
class SearchViewModel: ObservableObject {
    @Published var results: [String] = []

    func search(_ query: String) async {
        // If the user types fast, multiple searches run simultaneously!
        let data = try? await api.search(query)
        results = data ?? []
        // Old results might overwrite new results (race condition)
    }
}
\`\`\`

**Fix: Cancel previous Task before starting new one**
\`\`\`swift
@MainActor
class SearchViewModel: ObservableObject {
    @Published var results: [String] = []
    private var searchTask: Task<Void, Never>?

    func search(_ query: String) {
        searchTask?.cancel()  // Cancel previous search
        searchTask = Task {
            try? await Task.sleep(nanoseconds: 300_000_000) // Debounce
            guard !Task.isCancelled else { return }

            let data = try? await api.search(query)
            guard !Task.isCancelled else { return }
            results = data ?? []
        }
    }
}
\`\`\`

**Key practices:**
- Cancel previous tasks before starting new ones for the same operation
- Check \`Task.isCancelled\` after each await point
- Use debouncing to avoid excessive API calls
- Consider storing Task references for explicit lifecycle management
- In SwiftUI, prefer \`.task(id:)\` which automatically restarts when the id changes`,
    },
  ],
  interviewQuestion: {
    question: 'How do actors fit into MVVM?',
    hints: [
      'Think about which layer of MVVM needs thread safety for shared mutable state.',
      'Consider why the ViewModel is @MainActor and the Model is an actor — what does each protect?',
      'How does the compiler enforce the separation between layers?',
    ],
    answer: `Actors fit naturally into the Model layer of MVVM. The Model layer manages shared data — database caches, network response caches, user session state — that may be accessed from multiple parts of the app concurrently. By making the Model layer an actor, you get compiler-enforced thread safety for all shared mutable state. No manual locks, no forgotten DispatchQueue.sync calls, no data races.

The ViewModel sits on @MainActor because it drives UI state through @Published properties that SwiftUI observes. Every time the ViewModel updates a @Published property, SwiftUI potentially redraws views — this must happen on the main thread. @MainActor guarantees this at compile time. The ViewModel acts as the bridge: it calls into actor-isolated Model methods with 'await' (crossing from MainActor to the Model actor's isolation domain), receives results, transforms them into display-ready data, and updates @Published properties (back on MainActor).

The compiler enforces the MVVM boundaries through actor isolation. The View accesses the ViewModel synchronously (both on MainActor). The ViewModel accesses the Model with 'await' (crossing isolation). The Model cannot accidentally update UI state — it would need 'await' to reach @MainActor-isolated properties, making the boundary crossing explicit. This turns what was previously a convention (keep layers separate) into a compiler-enforced rule.

The practical benefit is that data flow is visible in the code. Every 'await' marks an isolation boundary crossing. You can trace exactly where data moves between threads just by reading the code. Before Swift concurrency, you'd have callbacks, DispatchQueue hops, and Combine pipelines where thread context was implicit and easy to get wrong.`,
    followUps: [
      'How would you handle a ViewModel that needs data from multiple actors?',
      'Should you use @MainActor on individual ViewModel methods or on the entire class?',
      'How do you test a @MainActor ViewModel in unit tests?',
    ],
  },
  codePuzzle: {
    type: 'predict-output',
    prompt: 'What order will these print statements execute?',
    code: `actor CounterModel {
    private var value = 0
    func increment() -> Int {
        value += 1
        return value
    }
}

@MainActor
class ViewModel: ObservableObject {
    @Published var display = ""
    private let model = CounterModel()

    func doWork() async {
        print("A: start on main")
        let result = await model.increment()
        print("B: got \\(result) on main")
        display = "Count: \\(result)"
        print("C: updated UI")
    }
}`,
    solution: 'The output is always A, then B, then C in order. "A: start on main" prints first — we are on MainActor. Then "await model.increment()" suspends the function and hops to the CounterModel actor to execute increment(). When it returns, execution resumes on MainActor (because doWork is @MainActor-isolated). So "B: got 1 on main" prints next, on the main thread. Then display is updated (main thread, safe for @Published), and "C: updated UI" prints last. The key insight: after the await, we automatically return to MainActor — no manual thread hopping needed.',
    options: [
      'A, B, C — sequential, all resuming on main thread',
      'A, C, B — display updates before print',
      'A then B and C in undefined order',
      'Compile error — cannot access actor from @MainActor',
    ],
    correctOptionIndex: 0,
  },
};

export default topic;
