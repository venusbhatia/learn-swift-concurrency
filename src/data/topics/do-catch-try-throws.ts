import type { Topic } from '@/types/topic';

const topic: Topic = {
  slug: 'do-catch-try-throws',
  order: 1,
  title: 'Do, Catch, Try & Throws',
  subtitle: 'Quality control for your kitchen',
  icon: '🛡',
  prerequisiteSlugs: [],
  storyDay: 1,
  storyIntro:
    "Congratulations! You just bought a restaurant. But on Day 1, you realize there's a serious problem: when dishes go wrong (burnt steak, dropped plate, wrong order), nobody has a system for handling it. Waiters just shrug. Chefs keep cooking. Customers leave angry. You need a QUALITY CONTROL system — a way to TRY making each dish, CATCH failures when they happen, and THROW problems up the chain before they reach the customer.",
  kitchenMetaphor:
    'Error handling is your kitchen\'s quality control station. Every dish (function) can fail. You need a system to try cooking, catch failures, and throw problems to the right person.',
  sections: [
    {
      id: 'concept-evolution',
      type: 'concept',
      title: 'The Evolution of Error Handling',
      content: `In Swift, error handling evolved through several stages. Imagine your restaurant trying different ways to report problems:

**Stage 1: The Tuple Approach** — The chef hands you a plate and a note. The plate might be empty, the note might say "burnt." You have to check both every time. This is like returning (title: String?, error: Error?).

**Stage 2: The Result Type** — Better! The chef gives you ONE envelope that either contains the dish OR an error report. Never both, never neither. This is Result<String, Error>.

**Stage 3: throws + do/catch** — The best system. The chef just TRIES to cook. If something goes wrong, they THROW the problem. The manager (your do/catch block) catches it and handles it. Clean, readable, and safe.`,
      codeBlocks: [],
    },
    {
      id: 'code-walkthrough',
      type: 'code-walkthrough',
      title: 'Building the Quality Control System',
      content: 'Let\'s walk through all four approaches — from the worst to the best:',
      codeBlocks: [
        {
          id: 'full-evolution',
          label: 'Error Handling Evolution',
          code: `class KitchenManager {
    let isActive: Bool = true

    // APPROACH 1: Tuple (old, messy)
    func getTitle() -> (title: String?, error: Error?) {
        if isActive {
            return ("NEW TEXT!", nil)
        } else {
            return (nil, URLError(.badURL))
        }
    }

    // APPROACH 2: Result type (better)
    func getTitle2() -> Result<String, Error> {
        if isActive {
            return .success("NEW TEXT!")
        } else {
            return .failure(URLError(.badURL))
        }
    }

    // APPROACH 3: throws (best!)
    func getTitle3() throws -> String {
        if isActive {
            return "NEW TEXT!"
        } else {
            throw URLError(.badServerResponse)
        }
    }
}`,
          steps: [
            {
              lineRange: [1, 2],
              explanation: "We create a KitchenManager class. Think of it as your restaurant's quality control department. The isActive flag simulates whether the kitchen is operational.",
              threadIndicator: 'main',
            },
            {
              lineRange: [4, 10],
              explanation: "APPROACH 1: The Tuple. This returns BOTH a possible title AND a possible error. The problem? Either could be nil, both could be nil, or both could have values. It's ambiguous — like a chef who might hand you a plate, a complaint card, or both at the same time.",
              executionNote: 'This is the OLD way — avoid it in new code',
              threadIndicator: 'main',
            },
            {
              lineRange: [12, 18],
              explanation: "APPROACH 2: The Result Type. Much better! It's an enum — it's either .success with a value OR .failure with an error. Never both, never neither. Like a chef handing you exactly ONE sealed envelope.",
              threadIndicator: 'main',
            },
            {
              lineRange: [20, 26],
              explanation: "APPROACH 3: throws. The BEST way! The function declares 'I might throw an error' with the throws keyword. If everything is fine, it returns normally. If not, it THROWS an error. The caller MUST handle it. This is like a chef who either serves the dish or yells 'FIRE!' — you can't ignore it.",
              executionNote: 'This is the modern Swift way — use this!',
              threadIndicator: 'main',
            },
          ],
        },
      ],
    },
    {
      id: 'try-variants',
      type: 'deep-dive',
      title: 'The Three Flavors of try',
      content: `Swift gives you three ways to call a throwing function. Think of them as three different attitudes in the kitchen:

**try** (with do/catch) — "I'll try this dish, and if it fails, I have a plan B." This is the responsible chef who has backup ingredients ready.

**try?** — "I'll try this dish. If it fails... meh, I'll just serve nothing." Converts the error to nil. Useful when failure is acceptable.

**try!** — "This dish WILL work, I guarantee it!" If it fails, your entire app crashes. Like a chef who bets their career on one dish. Only use when you're 100% certain it won't fail.`,
      codeBlocks: [
        {
          id: 'try-variants',
          label: 'Three Flavors of try',
          code: `func fetchTitle() {
    do {
        // try? — "If it fails, give me nil"
        let newTitle = try? manager.getTitle3()
        if let newTitle = newTitle {
            self.text = newTitle
        }

        // try — "I'll handle the error properly"
        let finalTitle = try manager.getTitle4()
        self.text = finalTitle

    } catch {
        // This catches ANY error from 'try' calls above
        self.text = error.localizedDescription
    }

    // try! — "I KNOW this won't fail" (crashes if wrong!)
    // let riskyTitle = try! manager.getTitle3()
}`,
          steps: [
            {
              lineRange: [2, 2],
              explanation: "The 'do' block starts a region where you can use 'try'. Think of it as entering the kitchen — once you're in, you can attempt risky operations.",
              threadIndicator: 'main',
            },
            {
              lineRange: [3, 7],
              explanation: "try? is the 'no drama' approach. If getTitle3() throws, instead of crashing or entering the catch block, it just returns nil. We use optional binding (if let) to unwrap it. Great for non-critical operations.",
              threadIndicator: 'main',
            },
            {
              lineRange: [9, 11],
              explanation: "Plain 'try' is the responsible approach. If getTitle4() throws an error, execution immediately jumps to the catch block. The line 'self.text = finalTitle' only runs if the try succeeds.",
              executionNote: 'If this fails, jumps to catch block on line 13',
              threadIndicator: 'main',
            },
            {
              lineRange: [13, 16],
              explanation: "The catch block receives the error automatically as a variable called 'error'. You can handle it however you want — show a message, retry, log it, etc. This is your safety net.",
              threadIndicator: 'main',
            },
            {
              lineRange: [18, 19],
              explanation: "try! is commented out because it's DANGEROUS. If the function throws, your entire app crashes. Only use this when you're mathematically certain the function won't throw (like loading a bundled resource).",
              executionNote: 'DANGER: Crashes on failure! Use sparingly.',
              threadIndicator: 'main',
            },
          ],
        },
      ],
    },
    {
      id: 'side-by-side',
      type: 'side-by-side',
      title: 'Old Way vs New Way',
      content: 'See how the same operation looks with tuples vs throws:',
      codeBlocks: [],
    },
  ],
  interviewQuestion: {
    question: 'Explain the difference between try, try?, and try! in Swift. When would you use each one?',
    hints: [
      'Think about what happens when the throwing function actually fails in each case.',
      'Consider: which one gives you an Optional? Which one crashes? Which one requires do/catch?',
      'Real-world scenario: loading a JSON file bundled with the app vs. fetching from a network.',
    ],
    answer: `'try' is used inside a do-catch block. If the function throws, execution jumps to the catch block where you handle the error. This is the safest and most common approach.

'try?' converts the result to an Optional. If the function succeeds, you get the value wrapped in an Optional. If it throws, you get nil. The error is silently discarded. Use this when failure is acceptable and you don't need to know WHY it failed — like checking if a file exists.

'try!' force-unwraps the result. If the function throws, your app crashes immediately (fatal error). Only use this when you are absolutely certain the function cannot fail, such as loading a known-good JSON file bundled with the app.

In practice, most production code uses 'try' with do-catch. 'try?' is good for optional operations. 'try!' should be rare — it's a code smell if overused.`,
    followUps: [
      'What if you need to catch specific error types? Can you have multiple catch blocks?',
      'How does error handling work with async/await? (Spoiler: throws composes beautifully with async)',
      'What\'s the difference between throws and rethrows?',
    ],
  },
  codePuzzle: {
    type: 'predict-output',
    prompt: 'Given this code, what will self.text contain after fetchTitle() runs? Assume isActive is true for getTitle3() but getTitle4() is hardcoded to always throw.',
    code: `func fetchTitle() {
    do {
        let newTitle = try? manager.getTitle3()
        // getTitle3 returns "NEW TEXT!" when isActive = true

        let finalTitle = try manager.getTitle4()
        // getTitle4 ALWAYS throws URLError(.badServerResponse)

        self.text = finalTitle
    } catch {
        self.text = error.localizedDescription
    }
}`,
    solution: 'self.text will be "The operation couldn\'t be completed." (the error\'s localizedDescription) because even though try? on line 3 succeeds, the plain try on line 6 throws an error, which immediately jumps to the catch block, skipping line 9.',
    options: [
      '"NEW TEXT!" — because try? succeeds',
      'error.localizedDescription — because try on getTitle4() throws',
      'nil — because everything fails',
      '"FINAL TEXT!" — because getTitle4 returns successfully',
    ],
    correctOptionIndex: 1,
  },
  whatHappensNext: {
    title: 'Predict the Error Flow',
    steps: [
      {
        codeLine: 'let title = try manager.getTitle()',
        question: 'getTitle() throws an error. What happens next?',
        options: [
          { label: 'The next line runs normally', emoji: '▶️', isCorrect: false },
          { label: 'Execution jumps to the catch block', emoji: '🎯', isCorrect: true },
          { label: 'The app crashes', emoji: '💥', isCorrect: false },
        ],
        explanation: 'When a function throws, execution immediately jumps to the nearest catch block. Think of it like a dish failing quality control — it gets diverted to the rejection bin, skipping the rest of the line.',
      },
      {
        codeLine: 'let title = try? manager.getTitle()',
        question: 'Same function, but now with try? — what happens when it throws?',
        options: [
          { label: 'title becomes nil, code continues', emoji: '🤷', isCorrect: true },
          { label: 'Execution jumps to catch', emoji: '🎯', isCorrect: false },
          { label: 'Compile error — can\'t use try? here', emoji: '🚫', isCorrect: false },
        ],
        explanation: 'try? converts the error into nil. The dish failed quality control, but instead of stopping the whole line, the chef just shrugs and moves on with an empty plate. No crash, no catch needed.',
      },
      {
        codeLine: 'let title = try! manager.getTitle()',
        question: 'Now with try! — what happens when it throws?',
        options: [
          { label: 'title becomes nil', emoji: '🤷', isCorrect: false },
          { label: 'The app crashes with a fatal error', emoji: '💥', isCorrect: true },
          { label: 'The error is silently ignored', emoji: '🤫', isCorrect: false },
        ],
        explanation: 'try! is a promise to the compiler: "I guarantee this will never throw." If it does throw, that\'s a broken promise — and Swift crashes. It\'s like telling the health inspector "this dish is perfect" without checking. If it\'s not, the kitchen gets shut down.',
      },
    ],
  },
  fillKeyword: {
    title: 'Fill in the Error Handling Keywords',
    codeTemplate: `enum NetworkError: Error {
    case badURL
    case serverDown
}

func fetchData() {{blank1}} -> String {
    guard let url = URL(string: "https://api.com") else {
        {{blank2}} NetworkError.badURL
    }
    return "Success!"
}

do {
    let result = {{blank3}} fetchData()
    print(result)
} {{blank4}} {
    print("Something went wrong: \\(error)")
}`,
    blanks: [
      { id: 'blank1', correctAnswer: 'throws', distractors: ['async', 'mutating'], hint: 'This keyword tells callers the function can fail' },
      { id: 'blank2', correctAnswer: 'throw', distractors: ['return', 'try'], hint: 'This keyword sends an error to the caller' },
      { id: 'blank3', correctAnswer: 'try', distractors: ['await', 'throw'], hint: 'This keyword means "this call might fail"' },
      { id: 'blank4', correctAnswer: 'catch', distractors: ['else', 'finally'], hint: 'This block runs when an error is thrown' },
    ],
  },
  quickChecks: [
    {
      question: 'Does try? crash the app if the function throws?',
      options: ['Yes, it crashes', 'No, it returns nil'],
      correctIndex: 1,
      explanation: 'try? converts errors to nil — it never crashes. That\'s why it\'s the "safe" version.',
    },
    {
      question: 'Can you use try without a do/catch block?',
      options: ['Yes, always', 'Only inside a throwing function'],
      correctIndex: 1,
      explanation: 'A plain try must be inside a do/catch OR inside another function marked throws — otherwise the error has nowhere to go.',
    },
  ],
};

export default topic;
