// Token-based Swift syntax highlighter — no broken nested HTML
export interface Token {
  text: string;
  type: 'keyword' | 'type' | 'string' | 'comment' | 'decorator' | 'number' | 'punctuation' | 'plain';
}

const SWIFT_KEYWORDS = new Set([
  'func', 'class', 'struct', 'actor', 'let', 'var', 'return', 'if', 'else',
  'do', 'catch', 'try', 'throw', 'throws', 'async', 'await', 'import',
  'private', 'public', 'static', 'self', 'guard', 'for', 'in', 'nil',
  'true', 'false', 'init', 'enum', 'case', 'switch', 'mutating', 'extension',
  'protocol', 'some', 'where', 'typealias', 'nonisolated', 'override',
  'weak', 'strong', 'unowned', 'lazy', 'final', 'open', 'internal',
  'fileprivate', 'deinit', 'subscript', 'associatedtype', 'inout',
  'convenience', 'required', 'dynamic', 'prefix', 'postfix', 'operator',
  'precedencegroup', 'while', 'repeat', 'break', 'continue', 'fallthrough',
  'defer', 'is', 'as', 'super', 'Self', 'Type', 'get', 'set', 'willSet',
  'didSet', 'rethrows', 'indirect', 'escaping', 'completionHandler',
]);

const SWIFT_TYPES = new Set([
  'String', 'Int', 'Bool', 'Double', 'Float', 'Error', 'URLError', 'Result',
  'ObservableObject', 'View', 'UIImage', 'URL', 'URLSession', 'Data',
  'DispatchQueue', 'Thread', 'Published', 'StateObject', 'State', 'Timer',
  'Task', 'MainActor', 'Array', 'Dictionary', 'Set', 'Optional', 'Void',
  'Any', 'AnyObject', 'Never', 'UUID', 'Sendable',
]);

export function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    // Comments
    if (line[i] === '/' && line[i + 1] === '/') {
      tokens.push({ text: line.slice(i), type: 'comment' });
      return tokens;
    }

    // Strings
    if (line[i] === '"') {
      let j = i + 1;
      while (j < line.length && line[j] !== '"') {
        if (line[j] === '\\') j++; // skip escaped chars
        j++;
      }
      tokens.push({ text: line.slice(i, j + 1), type: 'string' });
      i = j + 1;
      continue;
    }

    // Decorators
    if (line[i] === '@') {
      let j = i + 1;
      while (j < line.length && /\w/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), type: 'decorator' });
      i = j;
      continue;
    }

    // Numbers
    if (/\d/.test(line[i]) && (i === 0 || !/\w/.test(line[i - 1]))) {
      let j = i;
      while (j < line.length && /[\d._]/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), type: 'number' });
      i = j;
      continue;
    }

    // Words (keywords, types, identifiers)
    if (/[a-zA-Z_]/.test(line[i])) {
      let j = i;
      while (j < line.length && /\w/.test(line[j])) j++;
      const word = line.slice(i, j);
      if (SWIFT_KEYWORDS.has(word)) {
        tokens.push({ text: word, type: 'keyword' });
      } else if (SWIFT_TYPES.has(word)) {
        tokens.push({ text: word, type: 'type' });
      } else {
        tokens.push({ text: word, type: 'plain' });
      }
      i = j;
      continue;
    }

    // Punctuation
    if (/[{}()\[\]<>:;,.=+\-*/%&|!?~^]/.test(line[i])) {
      tokens.push({ text: line[i], type: 'punctuation' });
      i++;
      continue;
    }

    // Whitespace / other
    let j = i;
    while (j < line.length && !/[a-zA-Z_\d"@/{}()\[\]<>:;,.=+\-*/%&|!?~^]/.test(line[j])) j++;
    tokens.push({ text: line.slice(i, j || i + 1), type: 'plain' });
    i = j || i + 1;
  }

  return tokens;
}

export const TOKEN_COLORS: Record<Token['type'], string> = {
  keyword: '#ff79c6',   // soft pink — easier on eyes than pure cyan
  type: '#8be9fd',      // light cyan
  string: '#f1fa8c',    // warm yellow
  comment: '#6272a4',   // muted blue-gray
  decorator: '#ffb86c', // orange
  number: '#bd93f9',    // purple
  punctuation: '#7a7ea8', // muted
  plain: '#f8f8f2',     // near-white
};
