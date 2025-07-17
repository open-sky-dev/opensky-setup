import { existsSync } from 'node:fs'
import { readdir, unlink, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { dim, red, yellow, green, bold } from 'picocolors'

const MIGRATIONS_PATH = './db/migrations'
const DB_PATH = './db'
const DB_FILE_PATTERN = /\.db(?:-wal|-shm)?$/

async function findFilesToDelete(): Promise<string[]> {
  const filesToDelete: string[] = []

  // Add migrations directory if it exists
  if (existsSync(MIGRATIONS_PATH)) {
    filesToDelete.push(MIGRATIONS_PATH + '/')
  }

  // Check for .db files
  if (existsSync(DB_PATH)) {
    const dbFiles = await readdir(DB_PATH)
    const devDbFiles = dbFiles
      .filter((file) => DB_FILE_PATTERN.test(file))
      .map((file) => join(DB_PATH, file))
    filesToDelete.push(...devDbFiles)
  }

  return filesToDelete
}

async function deleteFiles(files: string[]): Promise<void> {
  for (const file of files) {
    try {
      if (file.endsWith('/')) {
        await rm(file, { recursive: true })
        console.log(dim(`Deleted Directory: ${file}`))
      } else {
        await unlink(file)
        console.log(dim(`Deleted File: ${file}`))
      }
    } catch (error) {
      console.error(red(`Failed to delete ${file}: ${error.message}`))
    }
  }
}

async function main() {
  console.log(bold(green('\n   Drizzle Reset')))
  console.log(dim('   Use in dev only. Will delete all data!\n'))

  const filesToDelete = await findFilesToDelete()

  if (filesToDelete.length === 0) {
    console.log(yellow('No files found to delete.'))
    process.exit(0)
  }

  console.log(yellow('\nThe following files will be deleted:'))
  filesToDelete.forEach((file) => console.log(dim(`- ${file}`)))

  const answer = await prompt(bold('\nAre you sure you want to proceed? (y/N) '))

  if (answer.toLowerCase() !== 'y') {
    console.log(yellow('Operation cancelled.'))
    process.exit(0)
  }

  await deleteFiles(filesToDelete)
  console.log(green('\nDatabase reset completed successfully!'))
}

// Simple prompt function using Bun's readline
async function prompt(question: string): Promise<string> {
  process.stdout.write(question)
  for await (const line of console) {
    return line
  }
  return ''
}

// Run the script
main().catch((error) => {
  console.error(red(`\nError: ${error.message}`))
  process.exit(1)
})
