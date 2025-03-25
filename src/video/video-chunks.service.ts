import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VideoChunksService {
  private readonly logger = new Logger(VideoChunksService.name);
  private readonly tempDir: string;
  // Add a map to track completed uploads
  private readonly completedUploads = new Map<string, boolean>();
  private readonly uploadStatus = new Map<
    string,
    {
      uploaded: number;
      total: number;
      complete: boolean;
      missingChunks?: number[];
    }
  >();

  constructor(private configService: ConfigService) {
    // Configure a temp directory for chunks
    this.tempDir = path.join(process.cwd(), 'temp');
    this.ensureTempDirExists();
  }

  private async ensureTempDirExists(): Promise<void> {
    try {
      await fs.promises.access(this.tempDir);
      this.logger.log(`Using existing temp directory at ${this.tempDir}`);
    } catch (error) {
      this.logger.error(error.message);
      await fs.promises.mkdir(this.tempDir, { recursive: true });
      this.logger.log(`Created temp directory at ${this.tempDir}`);
    }
  }

  async saveChunk(
    fileId: string,
    chunkIndex: number,
    totalChunks: number,
    chunkBuffer: Buffer,
  ): Promise<void> {
    const chunkDir = path.join(this.tempDir, fileId);

    try {
      await fs.promises.access(chunkDir);
    } catch (error) {
      await fs.promises.mkdir(chunkDir, { recursive: true });
      this.logger.error(error.message);
      this.logger.log(`Created directory for file ${fileId}`);
    }

    const chunkPath = path.join(chunkDir, `${chunkIndex}`);

    try {
      await fs.promises.writeFile(chunkPath, chunkBuffer);
      this.logger.log(
        `Saved chunk ${chunkIndex + 1}/${totalChunks} for ${fileId}`,
      );

      // After saving a chunk, update the status immediately
      await this.updateInternalStatus(fileId, totalChunks);
    } catch (error) {
      this.logger.error(
        `Error saving chunk ${chunkIndex} for ${fileId}`,
        error,
      );
      throw new Error(
        `Failed to save chunk ${chunkIndex} for ${fileId}: ${error.message}`,
      );
    }
  }

  // Add a method to update the internal status
  private async updateInternalStatus(
    fileId: string,
    totalChunks: number,
  ): Promise<void> {
    try {
      const chunkDir = path.join(this.tempDir, fileId);
      const files = await fs.promises.readdir(chunkDir);

      // Determine which chunks are present
      const uploadedChunks = new Set(
        files
          .map((filename) => parseInt(filename, 10))
          .filter(
            (index) => !isNaN(index) && index >= 0 && index < totalChunks,
          ),
      );

      // Determine which chunks are missing
      const missingChunks: number[] = [];
      for (let i = 0; i < totalChunks; i++) {
        if (!uploadedChunks.has(i)) {
          missingChunks.push(i);
        }
      }

      const complete = uploadedChunks.size === totalChunks;

      // Save status to cache
      this.uploadStatus.set(fileId, {
        uploaded: uploadedChunks.size,
        total: totalChunks,
        complete,
        missingChunks: missingChunks.length > 0 ? missingChunks : undefined,
      });

      // Mark as completed if all chunks are uploaded
      if (complete) {
        this.completedUploads.set(fileId, true);
      }
    } catch (error) {
      this.logger.error(`Error updating internal status for ${fileId}:`, error);
    }
  }

  async combineChunks(fileId: string, totalChunks: number): Promise<Buffer> {
    const chunkDir = path.join(this.tempDir, fileId);
    const buffers: Buffer[] = [];

    this.logger.log(`Combining ${totalChunks} chunks for ${fileId}`);

    try {
      // First, verify that all chunks exist
      for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path.join(chunkDir, `${i}`);
        try {
          await fs.promises.access(chunkPath);
        } catch (error) {
          this.logger.error(error.message);
          throw new Error(`Missing chunk ${i} for file ${fileId}`);
        }
      }

      // Mark this upload as complete in our tracking map BEFORE combining
      // so status checks during processing still report correctly
      this.completedUploads.set(fileId, true);
      this.uploadStatus.set(fileId, {
        uploaded: totalChunks,
        total: totalChunks,
        complete: true,
      });

      // Then read and combine them
      for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path.join(chunkDir, `${i}`);
        const chunkBuffer = await fs.promises.readFile(chunkPath);
        buffers.push(chunkBuffer);
        this.logger.verbose(
          `Added chunk ${i} (${chunkBuffer.length} bytes) to combined buffer`,
        );
      }

      const combinedBuffer = Buffer.concat(buffers);
      this.logger.log(
        `Successfully combined ${totalChunks} chunks for ${fileId}, total size: ${combinedBuffer.length} bytes`,
      );

      // Clean up chunks in the background AFTER we create the buffer,
      // but maintain the status information
      this.cleanupChunks(fileId, false).catch((err) => {
        this.logger.error(`Failed to cleanup chunks for ${fileId}`, err);
      });

      return combinedBuffer;
    } catch (error) {
      this.logger.error(`Error combining chunks for ${fileId}`, error);
      throw error;
    }
  }

  private async cleanupChunks(
    fileId: string,
    removeStatus = true,
  ): Promise<void> {
    const chunkDir = path.join(this.tempDir, fileId);

    try {
      this.logger.log(`Cleaning up chunks for ${fileId}`);

      // Make sure we keep tracking the upload as complete even if files are removed
      if (!removeStatus) {
        const currentStatus = this.uploadStatus.get(fileId);
        if (currentStatus) {
          this.uploadStatus.set(fileId, {
            ...currentStatus,
            complete: true,
          });
        }
      }

      try {
        const files = await fs.promises.readdir(chunkDir);
        // Delete each chunk file
        for (const file of files) {
          await fs.promises.unlink(path.join(chunkDir, file));
        }
        // Remove the directory
        await fs.promises.rmdir(chunkDir);
        this.logger.log(`Successfully cleaned up all chunks for ${fileId}`);
      } catch (error) {
        this.logger.error(`Error cleaning chunk files: ${error.message}`);
        // Non-fatal, continue
      }

      // Only remove tracking data if requested
      if (removeStatus) {
        // Wait 5 minutes before removing status info to allow for any final status checks
        setTimeout(
          () => {
            this.completedUploads.delete(fileId);
            this.uploadStatus.delete(fileId);
            this.logger.log(`Removed tracking data for ${fileId}`);
          },
          5 * 60 * 1000,
        );
      }
    } catch (error) {
      this.logger.error(`Error cleaning up chunks for ${fileId}`, error);
      // Don't rethrow this error since cleanup is non-critical
    }
  }

  async getUploadStatus(
    fileId: string,
    totalChunks: number,
  ): Promise<{
    uploaded: number;
    total: number;
    complete: boolean;
    missingChunks?: number[];
  }> {
    this.logger.log(
      `Checking status for fileId=${fileId}, totalChunks=${totalChunks}`,
    );

    // First check if we've marked this upload as complete
    if (this.completedUploads.get(fileId) === true) {
      this.logger.log(`FileId=${fileId} is marked as complete in our tracking`);
      return {
        uploaded: totalChunks,
        total: totalChunks,
        complete: true,
      };
    }

    // Next check our cached status
    const cachedStatus = this.uploadStatus.get(fileId);
    if (cachedStatus) {
      this.logger.log(
        `Retrieved cached status for fileId=${fileId}:`,
        cachedStatus,
      );
      return cachedStatus;
    }

    // If no cached data, check the filesystem
    const chunkDir = path.join(this.tempDir, fileId);

    try {
      await fs.promises.access(chunkDir);
      const files = await fs.promises.readdir(chunkDir);

      // Determine which chunks are present
      const uploadedChunks = new Set(
        files
          .map((filename) => parseInt(filename, 10))
          .filter(
            (index) => !isNaN(index) && index >= 0 && index < totalChunks,
          ),
      );

      // Determine which chunks are missing
      const missingChunks: number[] = [];
      for (let i = 0; i < totalChunks; i++) {
        if (!uploadedChunks.has(i)) {
          missingChunks.push(i);
        }
      }

      const complete = uploadedChunks.size === totalChunks;

      // Cache the result for future queries
      const status = {
        uploaded: uploadedChunks.size,
        total: totalChunks,
        complete,
        missingChunks: missingChunks.length > 0 ? missingChunks : undefined,
      };

      this.uploadStatus.set(fileId, status);
      if (complete) {
        this.completedUploads.set(fileId, true);
      }

      this.logger.log(`Filesystem status for fileId=${fileId}:`, status);
      return status;
    } catch (error) {
      // If the directory doesn't exist and we have no cached data,
      // then indeed no chunks have been uploaded
      this.logger.error(error.message);
      this.logger.log(
        `No chunks directory found for ${fileId}, assuming no uploads`,
      );

      const status = {
        uploaded: 0,
        total: totalChunks,
        complete: false,
        missingChunks: Array.from({ length: totalChunks }, (_, i) => i),
      };

      this.uploadStatus.set(fileId, status);
      return status;
    }
  }

  async cleanupIncompleteUploads(olderThanHours: number = 24): Promise<void> {
    try {
      const entries = await fs.promises.readdir(this.tempDir, {
        withFileTypes: true,
      });
      const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000;

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const dirPath = path.join(this.tempDir, entry.name);
          try {
            const stats = await fs.promises.stat(dirPath);
            if (stats.mtimeMs < cutoffTime) {
              this.logger.log(`Cleaning up incomplete upload: ${entry.name}`);
              await this.cleanupChunks(entry.name, true);
            }
          } catch (error) {
            this.logger.error(`Error checking directory ${entry.name}:`, error);
          }
        }
      }

      this.logger.log(
        `Finished cleanup of incomplete uploads older than ${olderThanHours} hours`,
      );
    } catch (error) {
      this.logger.error('Error during cleanup of incomplete uploads', error);
    }
  }
}
