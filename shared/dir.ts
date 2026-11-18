import { fileURLToPath } from "node:url"

const projectDirURL = new URL("..", import.meta.url)

export const projectDir = fileURLToPath(projectDirURL)
