/**
 * Read a text file (e.g. .md) and pass its content to the callback.
 */
export function readTextFile(file, callback) {
  const reader = new FileReader()
  reader.onload = (e) => callback(e.target.result)
  reader.readAsText(file)
}
