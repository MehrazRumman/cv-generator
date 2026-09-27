/** Shared by the server layout and the client toggle (kept out of the "use client" module on purpose). */
export const THEME_STORAGE_KEY = "cv-generator:theme";

/** Runs before first paint (inlined in <head>) so the saved theme applies without a flash. Dark is the default. */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");document.documentElement.classList.toggle("dark",t!=="light")}catch(e){}`;
