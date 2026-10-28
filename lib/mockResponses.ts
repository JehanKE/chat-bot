/**
 * Mock Response System
 *
 * NOTE FOR API INTEGRATION:
 * When you are ready to connect to a real backend / LLM API (such as OpenAI, Anthropic,
 * Google Gemini, or a custom Next.js API route like `/api/chat`), replace the body of
 * `fetchAIResponse` with your actual fetch call.
 */

interface MockAnswer {
  keywords: string[];
  response: string;
}

const KNOWLEDGE_BASE: MockAnswer[] = [
  {
    keywords: ['react', 'hook', 'useeffect', 'state', 'debug'],
    response: `Here is how to properly manage state and avoid common pitfall issues with React hooks:

### 1. The Common Issue
Often, infinite re-renders or stale closures occur when dependencies aren't declared correctly in \`useEffect\` or \`useCallback\`.

\`\`\`tsx
import React, { useState, useEffect, useCallback } from 'react';

export function Counter() {
  const [count, setCount] = useState<number>(0);

  // Using functional update avoids stale closure over count
  const increment = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      increment();
    }, 1000);

    // Always clean up subscriptions/intervals
    return () => clearInterval(timer);
  }, [increment]);

  return (
    <div className="p-4 bg-zinc-800 rounded-lg text-white">
      <p className="text-xl">Count: {count}</p>
      <button 
        onClick={increment} 
        className="mt-2 px-3 py-1 bg-emerald-600 rounded"
      >
        Increment
      </button>
    </div>
  );
}
\`\`\`

### Key Best Practices:
- **Always provide a cleanup function** for intervals, timers, and event listeners.
- **Use functional updates** \`setCount(c => c + 1)\` instead of reading mutable values directly from outer scope.
- **Keep custom hooks focused** on one single stateful concern.`,
  },
  {
    keywords: ['python', 'script', 'scrape', 'scraping', 'web', 'data'],
    response: `Here is a modern Python script utilizing \`httpx\` and \`BeautifulSoup4\` with clean error handling:

\`\`\`python
import httpx
from bs4 import BeautifulSoup
from typing import List, Dict
import asyncio

async def fetch_articles(url: str) -> List[Dict[str, str]]:
    """Fetches and parses articles asynchronously."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    async with httpx.AsyncClient(headers=headers, timeout=10.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, "html.parser")
            results = []
            
            for item in soup.select("article h2"):
                title = item.get_text(strip=True)
                link = item.find("a")["href"] if item.find("a") else None
                if title:
                    results.append({"title": title, "link": link})
                    
            return results
            
        except httpx.HTTPError as exc:
            print(f"HTTP Exception occurred: {exc}")
            return []

if __name__ == "__main__":
    articles = asyncio.run(fetch_articles("https://news.ycombinator.com"))
    print(f"Extracted {len(articles)} items.")
\`\`\`

### Prerequisites:
Run \`pip install httpx beautifulsoup4\` before executing the script.`,
  },
  {
    keywords: ['quantum', 'physics', 'computing', 'qubit', 'simple'],
    response: `### What is Quantum Computing?

Classical computers use **bits** as the fundamental unit of information. A bit is binary—it can either be **0 (off)** or **1 (on)**.

Quantum computers use **qubits** (quantum bits), which leverage two strange principles of quantum mechanics:

1. **Superposition**:
   - Imagine a spinning coin. While spinning, it's not strictly heads or tails—it exists in a blend of both states until it stops. 
   - A qubit can be 0, 1, or any quantum proportion of both simultaneously.

2. **Entanglement**:
   - Two qubits can become linked so that the state of one instantly dictates the state of another, even if separated by vast distances.
   - Einstein famously referred to this as *"spooky action at a distance"*.

### Why Does It Matter?
- **Massive Parallelism**: Solving complex problems in seconds that would take classical supercomputers thousands of years.
- **Key Applications**: Drug discovery, molecular simulation, financial risk modeling, and advanced cryptography.`,
  },
  {
    keywords: ['email', 'decline', 'polite', 'invitation', 'draft'],
    response: `Here are two polite options depending on the tone you prefer:

### Option 1: Warm & Professional (Recommended)
> **Subject:** Thank you for the invitation – [Event/Meeting Name]
>
> Hi [Name],
>
> Thank you so much for thinking of me and extending the invitation to [Event/Project Name].
>
> Unfortunately, I will not be able to attend due to prior commitments scheduled for that time. I really appreciate you reaching out, and I hope the event is a great success.
>
> Let's make sure to catch up soon.
>
> Best regards,  
> [Your Name]

### Option 2: Casual & Friendly
> **Subject:** Re: [Event Name]
>
> Hey [Name],
>
> Thanks a lot for the invite! Sadly I won't be able to make it this time around as I already have plans. 
>
> Hope you all have a wonderful time, and let's grab coffee soon!
>
> Cheers,  
> [Your Name]`,
  },
];

const DEFAULT_RESPONSES = [
  `I understand what you're asking! Here is a structured breakdown:

1. **Core Concept**: Analyzing the requirements and planning the optimal approach.
2. **Implementation**: Writing robust, maintainable code with clear patterns.
3. **Validation**: Testing edge cases to ensure reliability.

\`\`\`typescript
// Quick architectural pattern
interface Config {
  apiKey: string;
  endpoint: string;
  retries?: number;
}

export async function initializeClient(config: Config) {
  console.log("Connecting to:", config.endpoint);
  return { status: "ready", timestamp: Date.now() };
}
\`\`\`

Let me know if you would like me to expand on any specific aspect!`,

  `That's a great question! Here are the primary points to keep in mind:

- **Performance**: Minimize unnecessary re-renders and computations.
- **Modularity**: Break down complex tasks into small, testable utility functions.
- **User Experience**: Provide instant visual feedback with loading states and smooth transitions.

Feel free to ask follow-up questions or share more context!`,
];

/**
 * Simulates a realistic token streaming response.
 * Replace this function with your API call when integrating your backend!
 */
export async function streamMockResponse(
  prompt: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  signal?: AbortSignal
) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Find matching answer or pick default
  const matched = KNOWLEDGE_BASE.find((entry) =>
    entry.keywords.some((kw) => lowerPrompt.includes(kw))
  );

  const fullText = matched
    ? matched.response
    : DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)];

  // Stream in realistic word/token batches
  const words = fullText.split(/(\s+)/);
  let accumulated = '';

  for (let i = 0; i < words.length; i++) {
    if (signal?.aborted) {
      break;
    }

    accumulated += words[i];
    onChunk(accumulated);

    // Realistic typing jitter between 10ms and 35ms
    const delay = Math.random() * 25 + 10;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  onComplete();
}

