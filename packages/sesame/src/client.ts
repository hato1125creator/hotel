// SESAME5 API Client
// Docs: https://doc.candyhouse.co/ja/SesameAPI
export class SesameClient {
  private apiKey: string
  private baseUrl = 'https://app.candyhouse.co/api/sesame2'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async lock(deviceId: string) {
    return this.command(deviceId, 82)
  }

  async unlock(deviceId: string) {
    return this.command(deviceId, 83)
  }

  async getStatus(deviceId: string) {
    const res = await fetch(`${this.baseUrl}/${deviceId}`, {
      headers: { 'x-api-key': this.apiKey },
    })
    if (!res.ok) throw new Error(`SESAME API error: ${res.status}`)
    return res.json() as Promise<{ CHSesame2Status: string; timestamp: number }>
  }

  private async command(deviceId: string, cmd: number) {
    const res = await fetch(`${this.baseUrl}/${deviceId}/cmd`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cmd, history: 'smart-guesthouse', sign: this.generateSign() }),
    })
    if (!res.ok) throw new Error(`SESAME command error: ${res.status}`)
    return res.json()
  }

  private generateSign(): string {
    // TODO: implement CMAC-AES128 signing per SESAME5 API spec
    return ''
  }
}
