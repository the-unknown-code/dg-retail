export async function initMachineId(): Promise<string | null> {
  const id = await window.electronAPI.getMachineId()
  if (id) localStorage.setItem('machineId', id)
  return id
}

export function getMachineId(): string | null {
  return localStorage.getItem('machineId')
}
