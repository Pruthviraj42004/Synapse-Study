// Simple global editor context service to share the active Monaco editor instance
// across pages and components without tight coupling.

let currentEditor = null; // Monaco editor instance
let currentMonaco = null; // Monaco API instance

export function setEditor(editor, monaco) {
  currentEditor = editor || null;
  currentMonaco = monaco || null;
}

export function clearEditor() {
  currentEditor = null;
  currentMonaco = null;
}

export function getEditor() {
  return currentEditor;
}

export function getMonaco() {
  return currentMonaco;
}

const editorContextService = {
  setEditor,
  clearEditor,
  getEditor,
  getMonaco,
};

export default editorContextService;
