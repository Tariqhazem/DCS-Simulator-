// Preload runs in an isolated context between Node and the renderer.
// Nothing is exposed to the renderer yet — the simulator is a pure browser
// app. If the sim ever needs file I/O (e.g. save a trend CSV), add it here
// via contextBridge.exposeInMainWorld with a narrow, audited API.
