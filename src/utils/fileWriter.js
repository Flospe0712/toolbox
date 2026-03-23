/**
 * Atomic File Write Utility
 *
 * Ensures safe file writes with atomic operations to prevent data corruption
 * Strategy: Write to temp file, then rename to target (atomic on most file systems)
 */

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Write file atomically
 * 1. Create temp file with random suffix
 * 2. Write data to temp
 * 3. Verify write successful
 * 4. Rename temp to target (atomic operation)
 * 5. Clean up on error
 *
 * @param {string} filePath - Target file path
 * @param {string|Buffer} data - Data to write
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function atomicWriteFile(filePath, data) {
  const directory = path.dirname(filePath);
  const tmpPath = `${filePath}.${Date.now()}.tmp`;

  try {
    // Ensure directory exists
    await fs.mkdir(directory, { recursive: true });

    // Write to temporary file
    const dataStr =
      typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    await fs.writeFile(tmpPath, dataStr, 'utf8');

    // Verify file was written correctly
    const written = await fs.readFile(tmpPath, 'utf8');
    if (written !== dataStr) {
      await fs.unlink(tmpPath); // Clean up temp file
      return {
        success: false,
        error: 'File verification failed - data mismatch',
      };
    }

    // Atomic rename operation
    await fs.rename(tmpPath, filePath);

    console.log(`[FileWriter] Successfully wrote: ${filePath}`);
    return { success: true };
  } catch (error) {
    // Clean up temp file on error
    try {
      await fs.unlink(tmpPath);
    } catch (cleanupErr) {
      // Silently ignore cleanup errors
    }

    const errorMessage = getErrorMessage(error);
    console.error(`[FileWriter] Failed to write ${filePath}:`, errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Write JSON file atomically
 * @param {string} filePath - Target file path
 * @param {Object} data - JSON object to write
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function atomicWriteJson(filePath, data) {
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    return await atomicWriteFile(filePath, jsonStr);
  } catch (error) {
    return {
      success: false,
      error: `JSON serialization error: ${error.message}`,
    };
  }
}

/**
 * Read file safely with error handling
 * @param {string} filePath - File path to read
 * @returns {Promise<{success: boolean, data?: string, error?: string}>}
 */
export async function safeReadFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return { success: true, data };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error(`[FileWriter] Failed to read ${filePath}:`, errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Read and parse JSON file
 * @param {string} filePath - File path to read
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function safeReadJson(filePath) {
  try {
    const { success, data, error } = await safeReadFile(filePath);
    if (!success) {
      return { success: false, error };
    }
    const parsed = JSON.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    return {
      success: false,
      error: `JSON parse error: ${error.message}`,
    };
  }
}

/**
 * Delete file safely
 * @param {string} filePath - File path to delete
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function safeDeleteFile(filePath) {
  try {
    await fs.unlink(filePath);
    console.log(`[FileWriter] Successfully deleted: ${filePath}`);
    return { success: true };
  } catch (error) {
    // Treat "file not found" as success
    if (error.code === 'ENOENT') {
      return { success: true };
    }
    const errorMessage = getErrorMessage(error);
    console.error(`[FileWriter] Failed to delete ${filePath}:`, errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Check if file exists
 * @param {string} filePath - File path to check
 * @returns {Promise<boolean>}
 */
export async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get human-readable error message from Node.js error
 * @param {Error} error - Node.js error object
 * @returns {string} User-friendly error message
 */
function getErrorMessage(error) {
  switch (error.code) {
    case 'EACCES':
      return 'Permission denied - check file permissions';
    case 'ENOENT':
      return 'File or directory not found';
    case 'ENOSPC':
      return 'No space left on disk';
    case 'EISDIR':
      return 'Is a directory, not a file';
    case 'EAGAIN':
      return 'Resource temporarily unavailable';
    case 'EBUSY':
      return 'File is locked or in use';
    default:
      return error.message || 'Unknown error';
  }
}

/**
 * Batch write multiple files atomically
 * Writes all files or none (if one fails, rest are skipped)
 *
 * @param {Array<{path: string, data: any}>} files - Files to write
 * @returns {Promise<{success: boolean, results: Object, error?: string}>}
 */
export async function atomicBatchWrite(files) {
  const results = {};

  try {
    for (const { path: filePath, data } of files) {
      const result = await atomicWriteFile(filePath, data);
      results[filePath] = result;

      if (!result.success) {
        throw new Error(`Failed to write ${filePath}: ${result.error}`);
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error('[FileWriter] Batch write failed:', error.message);
    return {
      success: false,
      results,
      error: error.message,
    };
  }
}
