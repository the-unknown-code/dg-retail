export {}

declare global {
  interface Window {
    electronAPI: {
      getMachineId: () => Promise<string | null>
      getConfig: () => Promise<object | null>
      appendJson: (entry: object) => Promise<number>
    }
  }
}
