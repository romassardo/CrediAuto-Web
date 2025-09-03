// Util simple de logging para controlar verbosidad por bandera de entorno.
// Activa logs de depuración cuando DEBUG_AUTH=1

export const isDebugAuth = (): boolean => process.env.DEBUG_AUTH === '1'

export const debugAuth = (...args: any[]) => {
  if (isDebugAuth()) {
    console.log(...args)
  }
}

export const errorLog = (...args: any[]) => {
  // Mantener errores visibles; si se desea, podría condicionarse por otra bandera
  console.error(...args)
}
