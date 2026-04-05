import type { Topic } from '@/types/topic';

const topic: Topic = {
  slug: 'download-image-async',
  order: 13,
  title: 'Download Image Async',
  subtitle: 'The delivery truck',
  icon: '🚚',
  prerequisiteSlugs: ['mvvm'],
  storyDay: 24,
  storyIntro:
    "Day 24. The restaurant has gone viral, and customers are ordering dishes they've seen on social media. The problem? You need to show photos of each dish on the menu board, and those photos live on a remote server. You've had three delivery systems over the years. The first was **shouting out the window** — you'd yell the order to a driver, and sometime later he'd shout back with the package (completion handlers). Messy, loud, and you never knew when the reply was coming. The second was **walkie-talkies** — a Combine publisher that streamed updates as the truck moved through checkpoints. Better, but you needed to learn a whole radio protocol.\n\nNow you have **the app**. You tap 'request delivery', the screen says 'loading...', and when the truck arrives, the result just appears. That's async/await with URLSession. One line to make the request, one line to get the data back. No callbacks, no publishers, no radio protocols. Just clean, linear code.\n\nBut fast delivery isn't enough. Smart restaurants cache their most popular dish photos so they don't send a truck every time someone orders the same thing. Today you'll build an image downloader with caching, error handling, and all three approaches side by side so you can see why async/await wins.",
  kitchenMetaphor:
    'Three ways to handle deliveries: shouting, walkie-talkie, or the app.',
  sections: [
    {
      id: 'concept-three-approaches',
      type: 'concept',
      title: 'Three Eras of Async Networking in Swift',
      content: `Swift has evolved through three paradigms for asynchronous networking:

**1. Completion Handlers (2014 — Swift 1.0)**
The original pattern. You pass a closure that gets called "sometime later" with the result. Leads to deeply nested callbacks ("pyramid of doom"), unclear error handling, and easy-to-forget main thread hops.

**2. Combine (2019 — iOS 13)**
Apple's reactive framework. Network calls become publishers that emit values over time. Powerful for complex data flows, but steep learning curve, lots of boilerplate for simple requests, and requires managing AnyCancellable subscriptions.

**3. async/await (2021 — Swift 5.5)**
The modern approach. Network calls look like synchronous code. Errors use try/catch. Results return directly. The compiler handles thread management. This is what Apple recommends for all new code.

**Which should you use?**
- New code: async/await, always
- Existing Combine pipelines: keep them if they work, migrate gradually
- Legacy completion handler APIs: wrap them with \`withCheckedThrowingContinuation\` to bridge into async/await`,
    },
    {
      id: 'code-walkthrough-evolution',
      type: 'code-walkthrough',
      title: 'The Same Download, Three Ways',
      content: 'Following DownloadImageAsync.swift from the bootcamp, we implement the exact same image download using all three approaches. Watch how each era gets cleaner. All three share one helper method for response validation:',
      codeBlocks: [
        {
          id: 'completion-handler',
          label: 'Era 1: @escaping Completion Handler',
          code: `class DownloadImageAsyncImageLoader {
    let url = URL(string: "https://picsum.photos/200")!

    func handleResponse(data: Data?, response: URLResponse?) -> UIImage? {
        guard
            let data = data,
            let image = UIImage(data: data),
            let response = response as? HTTPURLResponse,
            response.statusCode >= 200 && response.statusCode < 300 else {
                return nil
            }
        return image
    }

    func downloadWithEscaping(
        completionHandler: @escaping (_ image: UIImage?, _ error: Error?) -> ()
    ) {
        URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            let image = self?.handleResponse(data: data, response: response)
            completionHandler(image, error)
        }
        .resume()
    }
}`,
          steps: [
            {
              lineRange: [4, 13],
              explanation: "A shared helper that validates the response: checks that data exists, that it decodes to a UIImage, and that the HTTP status is 2xx. Returns nil on any failure. All three approaches reuse this same method — the only thing that changes is HOW we call it.",
              threadIndicator: 'background',
            },
            {
              lineRange: [15, 17],
              explanation: "The @escaping closure is the old-school callback. The caller passes a function that gets invoked 'sometime later' with an optional image and optional error. Two optionals — so the caller must handle four combinations (both nil, both non-nil, etc.). Messy contract.",
              threadIndicator: 'main',
            },
            {
              lineRange: [18, 21],
              explanation: "The callback fires on a URLSession background thread. [weak self] prevents a retain cycle. But notice: completionHandler(image, error) also runs on the background thread. The CALLER must remember to dispatch to main for UI updates. Forget that and you get a subtle threading bug.",
              threadIndicator: 'background',
              executionNote: 'Callback fires on background queue',
            },
            {
              lineRange: [22, 23],
              explanation: "The infamous .resume(). Forget this one line and the request never fires — no compiler warning, no runtime error, just silence. Every iOS developer has lost time to this at least once.",
              threadIndicator: 'background',
            },
          ],
        },
        {
          id: 'combine-approach',
          label: 'Era 2: Combine Publisher',
          code: `// Added to DownloadImageAsyncImageLoader:
func downloadWithCombine() -> AnyPublisher<UIImage?, Error> {
    URLSession.shared.dataTaskPublisher(for: url)
        .map(handleResponse)
        .mapError({ $0 })
        .eraseToAnyPublisher()
}

// Caller side (in ViewModel):
var cancellables = Set<AnyCancellable>()

func fetchWithCombine() {
    loader.downloadWithCombine()
        .receive(on: DispatchQueue.main)
        .sink { completion in
            // handle error
        } receiveValue: { [weak self] image in
            self?.image = image
        }
        .store(in: &cancellables)
}`,
          steps: [
            {
              lineRange: [2, 7],
              explanation: "The loader returns an AnyPublisher instead of using a callback. dataTaskPublisher converts the URLSession call into a Combine stream. .map(handleResponse) transforms the (data, response) tuple into a UIImage?. Cleaner than the callback — but requires knowing Combine's operator vocabulary.",
              threadIndicator: 'background',
            },
            {
              lineRange: [10, 10],
              explanation: "Combine requires you to hold onto subscriptions. If this Set is deallocated, all subscriptions cancel. Forgetting to store the cancellable means your network call silently disappears. A new category of bug that didn't exist with completion handlers.",
              threadIndicator: 'main',
            },
            {
              lineRange: [13, 14],
              explanation: ".receive(on: DispatchQueue.main) hops to the main thread before delivering values. Better than the manual dispatch in Era 1, but you still have to remember to add it. .sink provides two closures — one for completion (success/failure), one for values.",
              threadIndicator: 'main',
            },
            {
              lineRange: [15, 20],
              explanation: "Two closures, [weak self], .store(in:) — lots of boilerplate for a simple 'download one image' task. Combine shines for complex reactive streams (search-as-you-type, real-time feeds), but for one-shot requests it is ceremony-heavy.",
              threadIndicator: 'main',
            },
          ],
        },
        {
          id: 'async-await-approach',
          label: 'Era 3: async/await',
          code: `// Added to DownloadImageAsyncImageLoader:
func downloadWithAsync() async throws -> UIImage? {
    do {
        let (data, response) = try await URLSession.shared.data(
            from: url, delegate: nil
        )
        return handleResponse(data: data, response: response)
    } catch {
        throw error
    }
}

// Caller side (in ViewModel):
func fetchImage() async {
    let image = try? await loader.downloadWithAsync()
    await MainActor.run {
        self.image = image
    }
}`,
          steps: [
            {
              lineRange: [2, 2],
              explanation: "The function signature tells the whole story: async (can suspend), throws (can fail), returns UIImage? directly. No callback, no publisher, no cancellable to manage. The caller writes 'let img = try await loader.downloadWithAsync()' — one line.",
              threadIndicator: 'background',
            },
            {
              lineRange: [4, 6],
              explanation: "One line replaces the entire dataTask/resume/callback dance. 'try await' suspends until the download completes, then returns (data, response) as a tuple. If the network fails, it throws automatically. No forgotten .resume(), no silent failures.",
              threadIndicator: 'background',
              executionNote: 'Suspends here until download completes',
            },
            {
              lineRange: [14, 15],
              explanation: "The ViewModel calls the loader and gets back an image directly. try? swallows errors (in production, use do/catch). No sink, no cancellable, no nested closures. The code reads top-to-bottom like synchronous code.",
              threadIndicator: 'background',
            },
            {
              lineRange: [16, 18],
              explanation: "MainActor.run ensures the UI update happens on the main thread. In modern code, you would mark the ViewModel @MainActor instead (like the refreshable example), eliminating even this hop. The bootcamp source shows this transitional pattern.",
              threadIndicator: 'main',
            },
          ],
        },
      ],
    },
    {
      id: 'code-walkthrough-proper-errors',
      type: 'code-walkthrough',
      title: 'Proper Error Handling for HTTP Responses',
      content: 'URLSession does NOT throw on HTTP 404 or 500 — it only throws for network-level failures (no internet, DNS error, timeout). You must check status codes yourself. Here is a compact pattern:',
      codeBlocks: [
        {
          id: 'error-handling',
          label: 'Status Code Validation',
          code: `enum ImageDownloadError: LocalizedError {
    case badResponse(statusCode: Int)
    case invalidImageData

    var errorDescription: String? {
        switch self {
        case .badResponse(let code): return "Server returned \\(code)"
        case .invalidImageData: return "Data is not a valid image"
        }
    }
}

func downloadImage(from url: URL) async throws -> UIImage {
    let (data, response) = try await URLSession.shared.data(from: url)

    guard let http = response as? HTTPURLResponse,
          (200...299).contains(http.statusCode) else {
        let code = (response as? HTTPURLResponse)?.statusCode ?? -1
        throw ImageDownloadError.badResponse(statusCode: code)
    }

    guard let image = UIImage(data: data) else {
        throw ImageDownloadError.invalidImageData
    }

    return image
}`,
          steps: [
            {
              lineRange: [1, 11],
              explanation: "A focused error enum with just two cases: bad HTTP status and invalid image data. Conforms to LocalizedError so error.localizedDescription gives human-readable messages. Keep error enums small and specific to their domain.",
              threadIndicator: 'background',
            },
            {
              lineRange: [14, 14],
              explanation: "The async call. If the network itself fails (no Wi-Fi, DNS error, timeout), this line throws automatically. But if the server returns 404 or 500, this line succeeds — URLSession considers those valid HTTP responses.",
              threadIndicator: 'background',
              executionNote: 'Suspends until download completes',
            },
            {
              lineRange: [16, 20],
              explanation: "This guard is essential. Cast to HTTPURLResponse to access statusCode, then check for 2xx range. Without this check, a 404 HTML error page would flow into UIImage(data:) and silently return nil — or worse, crash on a force unwrap.",
              threadIndicator: 'background',
            },
            {
              lineRange: [22, 26],
              explanation: "Validate that the data is actually an image. A server might return 200 OK with a JSON error body or an HTML page. Guard + throw gives the caller a clear, catchable error instead of a mysterious nil.",
              threadIndicator: 'background',
            },
          ],
        },
      ],
    },
    {
      id: 'edge-case-cancellation',
      type: 'edge-case',
      title: 'Cancellation, Cell Reuse, and .task(id:)',
      content: `Network requests in async/await support cooperative cancellation. When a Task is cancelled, the next await point throws \`CancellationError\`. URLSession respects this automatically.

**SwiftUI .task(id:) handles cell reuse:**
\`\`\`swift
struct ImageCell: View {
    let url: URL
    @State private var image: UIImage?

    var body: some View {
        Group {
            if let image { Image(uiImage: image) }
            else { ProgressView() }
        }
        .task(id: url) {
            image = try? await ImageCacheManager.shared.image(from: url)
        }
    }
}
\`\`\`

**Why \`.task(id: url)\` instead of \`.task\`?**
- \`.task\` runs once when the view appears
- \`.task(id:)\` re-runs whenever the id changes, cancelling the previous Task
- When a cell is recycled in a List, the URL changes, the old download cancels, and a new one starts

**Handle CancellationError separately from real errors:**
\`\`\`swift
.task(id: url) {
    do {
        image = try await loader.downloadImage(from: url)
    } catch is CancellationError {
        // User scrolled away — do nothing
    } catch {
        showError = true
    }
}
\`\`\`

Catching all errors indiscriminately would flash an error state when the user simply scrolls past a cell. Check for cancellation first.`,
    },
  ],
  interviewQuestion: {
    question: 'How would you implement async image loading with caching in Swift concurrency?',
    hints: [
      'Think about thread safety for the cache — what type protects shared mutable state in Swift concurrency?',
      'Consider the deduplication problem: what happens when 10 cells request the same image simultaneously?',
      'How would you integrate this with SwiftUI view lifecycle and handle cell reuse?',
    ],
    answer: `I'd build an actor-based image cache manager. The actor provides thread-safe access to two dictionaries: a completed image cache (URL to UIImage) and an in-progress download tracker (URL to Task). When an image is requested, the manager first checks the cache for an instant hit. If the image isn't cached but is currently being downloaded, it returns the existing Task's value — this deduplicates requests so 10 cells asking for the same image only trigger one network call.

For the download itself, I'd use URLSession.shared.data(from:) with async/await. After receiving the response, I'd validate the HTTP status code (URLSession doesn't throw on 404/500), decode the data into a UIImage, store it in the cache, and return it. Error handling uses standard try/catch, and the in-progress tracker is cleaned up in both success and failure paths.

On the SwiftUI side, I'd use .task(id: url) on each image cell. The id parameter is crucial: when a cell is reused in a List (URL changes), SwiftUI automatically cancels the previous download Task and starts a new one. This prevents stale images from appearing in recycled cells. URLSession's data(from:) respects Task cancellation, so cancelled downloads don't waste bandwidth. I'd also handle CancellationError separately from real errors to avoid flashing error states when the user scrolls quickly.

For production, I'd add a memory limit to the cache (evict least-recently-used entries when the cache exceeds a threshold), consider using NSCache for automatic memory pressure eviction, and potentially add a disk cache layer for persistence across app launches.`,
    followUps: [
      'How would you add a disk cache layer that persists across app launches?',
      'What happens if the device loses network connectivity mid-download? How would you handle retry?',
      'How would you limit the number of concurrent image downloads to avoid overwhelming the network?',
    ],
  },
  codePuzzle: {
    type: 'spot-bug',
    prompt: 'This async image loader has a bug that causes a crash. Can you find it?',
    code: `func loadImage(from urlString: String) async -> UIImage? {
    guard let url = URL(string: urlString) else { return nil }

    do {
        let (data, response) = try await URLSession.shared.data(from: url)

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            return nil
        }

        return UIImage(data: data)!
    } catch {
        return nil
    }
}`,
    solution: 'The bug is the force unwrap on line 12: UIImage(data: data)! will crash if the server returns 200 OK but the data is not a valid image (for example, an HTML error page, a JSON response, or corrupted data). The fix is to use optional binding: "guard let image = UIImage(data: data) else { return nil }". Additionally, only checking for statusCode == 200 is too strict — any 2xx status (200-299) indicates success. The range check should be (200...299).contains(httpResponse.statusCode).',
    options: [
      'Force unwrap UIImage(data:)! crashes when data is not a valid image',
      'Missing await on URLSession call causes a concurrency error',
      'The catch block should rethrow instead of returning nil',
      'URL(string:) needs to be awaited because it does I/O',
    ],
    correctOptionIndex: 0,
  },
};

export default topic;
