// Ollama client for local Qwen2.5 model
export class OllamaClient {
  private baseUrl: string
  private model: string

  constructor(baseUrl = 'http://localhost:11434', model = 'qwen2.5') {
    this.baseUrl = baseUrl
    this.model = model
  }

  async chat(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>) {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: false,
      }),
    })
    if (!res.ok) throw new Error(`Ollama error: ${res.status}`)
    const data = await res.json() as { message: { content: string } }
    return data.message.content
  }

  async generate(prompt: string) {
    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
      }),
    })
    if (!res.ok) throw new Error(`Ollama error: ${res.status}`)
    const data = await res.json() as { response: string }
    return data.response
  }
}
