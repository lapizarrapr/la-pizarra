/**
 * Runs in <head> before first paint, so a reader's saved light/dark choice
 * never flashes the wrong theme. Kept as a constant string (no user input).
 */
export const GUION_TEMA = `try{var t=localStorage.getItem('tema');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}`
