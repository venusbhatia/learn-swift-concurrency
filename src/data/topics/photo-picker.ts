import type { Topic } from '@/types/topic';

const topic: Topic = {
  slug: 'photo-picker',
  order: 17,
  title: 'Photo Picker',
  subtitle: 'Food photography',
  icon: '📸',
  prerequisiteSlugs: ['async-publisher'],
  storyDay: 32,
  storyIntro:
    "Day 32. The restaurant's online menu needs professional food photos, so you've hired a photographer. She rolls in with a camera, sets up a light box in the corner, and starts snapping shots. Here's the workflow: she picks dishes off the line (selection), then processes each raw shot into a polished menu-ready image (loading). Picking a dish takes a second — she just points and clicks. But processing? That means color-correcting, cropping, exporting full-resolution files. It takes real time, and you absolutely cannot shut down the kitchen while she works.\n\nThis two-phase design — instant selection, async loading — is exactly how PhotosPicker works in SwiftUI. The user taps photos in the system picker, and your app immediately receives lightweight PhotosPickerItem references. These are claim tickets, not the actual images. To get real pixel data, you call loadTransferable(type:), an async operation that decodes, downloads (if the photo is in iCloud), and converts the image. Your UI stays responsive throughout because the loading suspends, not blocks.\n\nThe Transferable protocol is the contract between the photo library and your code. It tells Swift: 'here is how to convert raw photo bytes into the type I actually want.' Built-in conformances handle Data and Image, but you can write custom ones to resize on import or bundle metadata alongside the pixels.",
  kitchenMetaphor:
    'The photographer selects dishes instantly but processes each shot in the background — your kitchen never stops.',
  sections: [
    {
      id: 'concept-two-phase-design',
      type: 'concept',
      title: 'Two-Phase Design: Select Then Load',
      content: `**PhotosPicker** (from PhotosUI) replaces the old UIImagePickerController with a modern, privacy-first API. Its design splits photo handling into two distinct phases:

**Phase 1 — Selection (synchronous, instant):**
The user taps photos in the system picker. Your app receives \`PhotosPickerItem\` references immediately. These are lightweight handles — they contain no pixel data. Think of them as numbered tickets from the photographer's clipboard, not the processed photos themselves.

**Phase 2 — Loading (asynchronous, potentially slow):**
You call \`loadTransferable(type:)\` on each item to get the actual data. This can involve decoding HEIC, downloading from iCloud, or processing a Live Photo. It is \`async throws\` — it suspends your task and can fail.

**Why this matters:**
- \`PhotosPickerItem\` is cheap to hold. You can store dozens without memory pressure.
- \`loadTransferable\` is expensive. A single 48MP iPhone photo is ~20MB decoded. Loading ten simultaneously could spike memory by 200MB.
- The return type is \`T?\` (optional). It returns \`nil\` when the photo exists but cannot be represented as your requested type — this is NOT an error, it is a type mismatch. It \`throws\` when something actually goes wrong (network failure, corrupt data).

**Privacy model:** PhotosPicker requires NO permission prompt. The picker runs in a separate system process and only shares what the user explicitly selects. This is a massive privacy improvement over the old PHPhotoLibrary.requestAuthorization flow.`,
    },
    {
      id: 'code-walkthrough-viewmodel-pattern',
      type: 'code-walkthrough',
      title: 'The ViewModel Pattern from PhotoPickerBootcamp.swift',
      content: 'This pattern from the bootcamp source uses a @MainActor ViewModel with didSet observers to trigger async loading whenever the selection changes:',
      codeBlocks: [
        {
          id: 'viewmodel-single-photo',
          label: 'Single photo: didSet + loadTransferable',
          code: `@MainActor
final class PhotoPickerViewModel: ObservableObject {

    @Published private(set) var selectedImage: UIImage? = nil
    @Published var imageSelection: PhotosPickerItem? = nil {
        didSet {
            setImage(from: imageSelection)
        }
    }

    private func setImage(from selection: PhotosPickerItem?) {
        guard let selection else { return }

        Task {
            do {
                let data = try await selection.loadTransferable(type: Data.self)

                guard let data, let uiImage = UIImage(data: data) else {
                    throw URLError(.badServerResponse)
                }

                selectedImage = uiImage
            } catch {
                print(error)
            }
        }
    }
}`,
          steps: [
            {
              lineRange: [1, 2],
              explanation: "@MainActor on the class guarantees every property access and method call runs on the main thread. This is critical because selectedImage drives the UI. Without it, setting selectedImage from a background Task would be a data race.",
              threadIndicator: 'main',
            },
            {
              lineRange: [5, 9],
              explanation: "The didSet observer on imageSelection fires the moment the user picks a photo. This is the bridge from Phase 1 (sync selection) to Phase 2 (async loading). Note: didSet is synchronous, so we cannot use await here directly — we must spawn a Task inside setImage.",
              threadIndicator: 'main',
              executionNote: 'didSet fires synchronously when the binding updates',
            },
            {
              lineRange: [14, 16],
              explanation: "Task { } creates an unstructured async context so we can call await from inside the synchronous setImage method. Because the class is @MainActor, this Task inherits main-actor isolation — the do/catch body starts on the main thread, suspends at the await, and resumes on the main thread.",
              threadIndicator: 'main',
            },
            {
              lineRange: [16, 21],
              explanation: "loadTransferable(type: Data.self) is the async bridge to the photo library. It returns Data? (optional) and can throw. If it returns nil, the guard fails and we throw a custom error. If the network is down for an iCloud photo, it throws. The two-step unwrap (data then UIImage) handles both 'no data available' and 'data is not a valid image.'",
              threadIndicator: 'background',
              executionNote: 'Suspends here while photo library decodes/downloads the image',
            },
          ],
        },
      ],
    },
    {
      id: 'code-walkthrough-multi-photo',
      type: 'code-walkthrough',
      title: 'Multiple Photos: Sequential vs Concurrent Loading',
      content: 'The bootcamp source loads multiple photos sequentially in a for loop. Let\'s examine that pattern, then see how to make it concurrent with a TaskGroup:',
      codeBlocks: [
        {
          id: 'multi-photo-sequential',
          label: 'Sequential loading (bootcamp pattern)',
          code: `private func setImages(from selections: [PhotosPickerItem]) {
    Task {
        var images: [UIImage] = []
        for selection in selections {
            if let data = try? await selection.loadTransferable(type: Data.self) {
                if let uiImage = UIImage(data: data) {
                    images.append(uiImage)
                }
            }
        }
        selectedImages = images
    }
}`,
          steps: [
            {
              lineRange: [2, 3],
              explanation: "A new Task and a local array to accumulate results. Because this is inside a @MainActor class, the Task inherits main-actor isolation. The local 'images' array is safe to mutate — no concurrency issues here because we are processing sequentially.",
              threadIndicator: 'main',
            },
            {
              lineRange: [4, 9],
              explanation: "The for loop processes each selection ONE AT A TIME. Each loadTransferable call suspends, completes, then the loop moves to the next item. With 5 photos, this takes 5x the time of loading one. The try? silently swallows errors — if an iCloud download fails, that photo is just skipped with no feedback.",
              threadIndicator: 'background',
              executionNote: 'Each photo loads sequentially — total time is sum of all load times',
            },
            {
              lineRange: [5, 8],
              explanation: "Two levels of optional unwrapping: loadTransferable can return nil (type mismatch) OR throw (real failure, eaten by try?). Then UIImage(data:) can return nil if the data is not a valid image format. A photo that fails either check is silently dropped from the results.",
              threadIndicator: 'background',
            },
            {
              lineRange: [11, 11],
              explanation: "Only after ALL photos finish loading does the UI update. The user sees nothing until the entire batch completes. For a better UX, you could update selectedImages inside the loop to show photos as they arrive — but then you need to handle the array growing while the view is rendering.",
              threadIndicator: 'main',
              executionNote: 'Single UI update after all photos are processed',
            },
          ],
        },
        {
          id: 'multi-photo-concurrent',
          label: 'Concurrent loading with TaskGroup',
          code: `private func setImagesConcurrently(from selections: [PhotosPickerItem]) {
    Task {
        let images = await withTaskGroup(of: (Int, UIImage?).self) { group in
            for (index, selection) in selections.enumerated() {
                group.addTask {
                    guard let data = try? await selection.loadTransferable(type: Data.self),
                          let uiImage = UIImage(data: data) else {
                        return (index, nil)
                    }
                    return (index, uiImage)
                }
            }

            var results = Array<UIImage?>(repeating: nil, count: selections.count)
            for await (index, image) in group {
                results[index] = image
            }
            return results.compactMap { $0 }
        }

        selectedImages = images
    }
}`,
          steps: [
            {
              lineRange: [3, 3],
              explanation: "withTaskGroup creates structured concurrency: all child tasks must complete before the group returns. The tuple (Int, UIImage?) carries each photo's original index so we can reassemble them in the user's selection order despite concurrent, out-of-order completion.",
              threadIndicator: 'background',
            },
            {
              lineRange: [4, 12],
              explanation: "Each addTask spawns a concurrent child task. With 5 photos, all 5 load simultaneously. This is dramatically faster than sequential — total time equals the SLOWEST photo, not the sum. But beware: 5 concurrent full-resolution decodes can spike memory. For large batches, consider chunking into groups of 3-4.",
              threadIndicator: 'background',
              executionNote: 'All photos load in parallel',
            },
            {
              lineRange: [14, 17],
              explanation: "As each child task completes, we slot the result into the correct index position. The for-await loop processes results in completion order, but the index ensures the final array matches the user's original selection order. If a photo failed, its slot stays nil.",
              threadIndicator: 'background',
            },
            {
              lineRange: [18, 18],
              explanation: "compactMap removes nil entries (failed loads). The surviving images are in the correct order. This is a clean pattern: concurrent loading, ordered results, failed items gracefully excluded.",
              threadIndicator: 'background',
            },
          ],
        },
      ],
    },
    {
      id: 'deep-dive-custom-transferable',
      type: 'deep-dive',
      title: 'Building a Custom Transferable Type',
      content: `The Transferable protocol tells Swift how to convert raw bytes into a usable type. Built-in conformances cover \`Data\`, \`Image\`, \`String\`, and \`URL\`. But sometimes you need both the raw data (for uploading to a server) and the display image in one load operation.

**Step 1 — Define your type:**
\`\`\`swift
struct DishPhoto: Transferable {
    let image: Image
    let data: Data

    static var transferRepresentation: some TransferRepresentation {
        DataRepresentation(importedContentType: .image) { data in
            guard let uiImage = UIImage(data: data) else {
                throw TransferError.importFailed
            }
            return DishPhoto(
                image: Image(uiImage: uiImage),
                data: data
            )
        }
    }
}
\`\`\`

**Step 2 — Use it with loadTransferable:**
\`\`\`swift
if let photo = try await item.loadTransferable(type: DishPhoto.self) {
    dishImage = photo.image    // for SwiftUI display
    uploadData = photo.data    // for server upload
}
\`\`\`

**Step 3 — Add resizing on import (common optimization):**
\`\`\`swift
DataRepresentation(importedContentType: .image) { data in
    guard let uiImage = UIImage(data: data) else {
        throw TransferError.importFailed
    }
    let resized = uiImage.preparingThumbnail(of: CGSize(width: 800, height: 800))
    return DishPhoto(
        image: Image(uiImage: resized ?? uiImage),
        data: data  // keep original data for server upload
    )
}
\`\`\`

**Step 4 — Handle multiple content types:**
\`\`\`swift
static var transferRepresentation: some TransferRepresentation {
    DataRepresentation(importedContentType: .rawImage) { data in
        // Handle RAW photos (ProRAW, DNG)
        DishPhoto(image: processRAW(data), data: data)
    }
    DataRepresentation(importedContentType: .image) { data in
        // Fallback for JPEG, HEIC, PNG
        DishPhoto(image: processStandard(data), data: data)
    }
}
\`\`\`

The system tries representations in order, using the first one whose content type matches the source photo. RAW files hit the first representation; everything else falls through to the second.`,
    },
    {
      id: 'edge-case-memory-and-errors',
      type: 'edge-case',
      title: 'Memory, Errors, and Silent Failures',
      content: `**1. nil vs throw — they mean different things:**

\`loadTransferable(type:)\` returns \`T?\` and is \`throws\`. These are two separate failure modes:
- **Returns nil:** The photo exists but cannot be converted to your requested type. Example: you ask for \`Image.self\` but the item is a video.
- **Throws an error:** Something actually went wrong — iCloud download failed, disk read error, corrupt data.

Using \`try?\` collapses both into nil, losing critical diagnostic information. Prefer explicit do/catch when debugging.

**2. Memory pressure with concurrent loads:**

A single 48MP iPhone 15 Pro photo decodes to ~90MB in memory (8064x6048 x 4 bytes). Loading 5 concurrently means ~450MB of transient memory. On a 4GB device, this can trigger jetsam termination.

Mitigations:
- Use \`preparingThumbnail(of:)\` to downscale immediately after decoding
- Process in batches of 2-3 instead of all at once
- Use autoreleasepool in the loading closure to free intermediate buffers

**3. iCloud photos need network:**

Photos stored only in iCloud trigger a network download during \`loadTransferable\`. On poor connectivity, this can take 30+ seconds or fail entirely. Show a per-photo loading indicator, not just a single spinner for the whole batch.

**4. didSet fires on EVERY selection change:**

If the user opens the picker, selects 3 photos, then opens it again and selects 2 different photos, didSet fires again. The previous Task is still running. You now have two Tasks writing to the same property. Fix: cancel the previous Task before starting a new one, or use an ID to discard stale results.

**5. PhotosPickerItem is ephemeral:**

It does not survive app termination. If you need to persist a user's photo selection, save the loaded Data to disk. Do not attempt to archive or encode the PhotosPickerItem itself.`,
    },
  ],
  interviewQuestion: {
    question: 'If a user selects 10 high-resolution photos from their library, what are the memory implications of loading them all concurrently with a TaskGroup, and how would you design the loading pipeline to avoid jetsam termination on a memory-constrained device?',
    hints: [
      'Start with the math: a 48MP photo decodes to roughly 90MB in RAM. How much memory do 10 concurrent decodes consume?',
      'Think about the difference between the compressed data (HEIC on disk) and the decoded bitmap (UIImage in memory). Which one is the memory problem?',
      'Consider how you would throttle concurrency — what Swift concurrency primitive limits how many child tasks run at once?',
    ],
    answer: `The core problem is the gap between compressed and decoded image sizes. A 12MP HEIC file might be 3MB on disk, but UIImage(data:) decodes it into a bitmap of roughly 48MB (4032x3024 x 4 bytes per pixel). For a 48MP ProRAW image, the decoded bitmap can reach 90MB+. Loading 10 concurrently means up to 900MB of transient memory — enough to trigger iOS's jetsam killer on most devices.

A well-designed pipeline addresses this at multiple layers:

1. **Throttle concurrency.** Instead of adding all 10 tasks to a TaskGroup at once, process in batches of 2-3. You can implement this with a simple counter or by chunking the selections array and awaiting each chunk before starting the next.

2. **Downscale immediately.** Call UIImage.preparingThumbnail(of:) right after decoding to produce a display-sized image (e.g., 800x800). Then release the full-resolution UIImage. This drops per-image memory from 90MB to under 3MB.

3. **Separate display from upload.** If you need the original resolution for server upload, stream the raw Data to a temporary file on disk rather than holding it in memory. Use the thumbnail for display.

4. **Cancel stale work.** If the user changes their selection while loading is in progress, cancel the existing TaskGroup (structured concurrency makes this automatic if you cancel the parent Task) so you are not wasting memory on photos the user no longer wants.

5. **Use autoreleasepool.** Wrapping each loadTransferable + UIImage decode cycle in an autoreleasepool ensures intermediate buffers (the compressed Data, the decoded CGImage) are freed promptly rather than accumulating until the TaskGroup completes.

The Transferable protocol design supports this by letting you create custom types that resize during import — the DataRepresentation closure receives raw bytes and returns whatever processed form you want, so the full-resolution bitmap never needs to exist in memory longer than it takes to produce the thumbnail.`,
    followUps: [
      'How does structured concurrency help with cancellation when the user changes their photo selection mid-load?',
      'What is the difference between UIImage.preparingThumbnail(of:) and CGImageSourceCreateThumbnailAtIndex, and when would you choose one over the other?',
      'How would you implement progressive loading — showing thumbnails immediately while full-resolution images load in the background?',
    ],
  },
  codePuzzle: {
    type: 'predict-output',
    prompt: 'The user selects one photo. What does the console print, and in what order? Assume loadTransferable succeeds but returns nil for Data (the photo is a format that cannot be represented as raw Data).',
    code: `@MainActor
final class VM: ObservableObject {
    @Published var selection: PhotosPickerItem? = nil {
        didSet { loadPhoto() }
    }
    @Published var image: UIImage? = nil

    private func loadPhoto() {
        guard let selection else {
            print("A: no selection")
            return
        }
        print("B: selection received")

        Task {
            print("C: task started")
            do {
                let data = try await selection.loadTransferable(type: Data.self)
                print("D: load returned")

                guard let data else {
                    print("E: data was nil")
                    return
                }

                guard let uiImage = UIImage(data: data) else {
                    print("F: invalid image data")
                    return
                }

                image = uiImage
                print("G: image set")
            } catch {
                print("H: error \\(error)")
            }
        }
    }
}

// User selects one photo from the picker`,
    solution: 'The output is: B, C, D, E. The didSet fires synchronously, printing "B: selection received". The Task is created but does not run until the current synchronous work yields. When it runs, it prints "C: task started". loadTransferable succeeds (no throw) so we reach "D: load returned". But the prompt says loadTransferable returns nil for Data — the call succeeds (no error thrown) but the result is nil. The guard-let on data fails, printing "E: data was nil" and returning. We never reach F, G, or H. The key insight: returning nil is NOT an error — it means the type conversion is unsupported. The do/catch never triggers because no error was thrown.',
    options: [
      'B, C, D, E — loadTransferable returned nil (not an error), guard exits',
      'B, C, H — loadTransferable threw an error because data was unavailable',
      'B, C, D, G — nil is automatically converted to an empty UIImage',
      'B, C, D, F — nil Data is passed to UIImage(data:) which fails',
    ],
    correctOptionIndex: 0,
  },
};

export default topic;
