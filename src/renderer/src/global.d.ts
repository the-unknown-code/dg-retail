export {}

declare global {
  interface Window {
    electronAPI: {
      getMachineId: () => Promise<string | null>
      appendJson: (entry: object) => Promise<number>
    }
  }
}
