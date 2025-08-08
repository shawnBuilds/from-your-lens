const Controls = require('../controls');

// MARK: - Batch Job Model
class BatchJob {
    constructor(id, userId, sourceImageData, totalBatches, metadata = {}) {
        this.id = id;
        this.userId = userId;
        this.sourceImageData = sourceImageData; // Store source image for reuse across chunks
        this.totalBatches = totalBatches;
        this.completedBatches = 0;
        this.status = BatchJobStatus.PENDING;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.metadata = {
            sourceImageSize: sourceImageData ? sourceImageData.length : 0,
            estimatedTotalImages: 0,
            ...metadata
        };
        this.results = []; // Store results from each completed batch
        this.errors = []; // Store any errors that occur during processing
    }

    // Update job status and increment completed batches
    updateProgress(completedBatches, results = [], errors = []) {
        this.completedBatches = completedBatches;
        this.updatedAt = new Date();
        
        if (results.length > 0) {
            this.results.push(...results);
        }
        
        if (errors.length > 0) {
            this.errors.push(...errors);
        }

        // Update status based on progress
        if (this.completedBatches >= this.totalBatches) {
            this.status = BatchJobStatus.COMPLETED;
        } else if (this.completedBatches > 0) {
            this.status = BatchJobStatus.PROCESSING;
        }

        if (Controls.enableDebugLogBatchJobService) {
            console.log(`[BatchJobService] Job ${this.id} progress: ${this.completedBatches}/${this.totalBatches} batches completed`);
        }
    }

    // Mark job as failed
    markFailed(error) {
        this.status = BatchJobStatus.FAILED;
        this.updatedAt = new Date();
        this.errors.push(error);

        if (Controls.enableDebugLogBatchJobService) {
            console.log(`[BatchJobService] Job ${this.id} marked as failed: ${error}`);
        }
    }

    // Get progress percentage
    getProgressPercentage() {
        return this.totalBatches > 0 ? (this.completedBatches / this.totalBatches) * 100 : 0;
    }

    // Get estimated time remaining (simple calculation)
    getEstimatedTimeRemaining() {
        if (this.completedBatches === 0) {
            return null; // Can't estimate yet
        }

        const elapsedTime = Date.now() - this.createdAt.getTime();
        const avgTimePerBatch = elapsedTime / this.completedBatches;
        const remainingBatches = this.totalBatches - this.completedBatches;
        
        return Math.round(avgTimePerBatch * remainingBatches);
    }

    // Get all results from all completed batches
    getAllResults() {
        return this.results.flat();
    }

    // Get summary statistics
    getSummary() {
        const allResults = this.getAllResults();
        const successfulComparisons = allResults.filter(r => !r.error).length;
        const failedComparisons = allResults.filter(r => r.error).length;
        const totalMatches = allResults.reduce((sum, r) => sum + (r.FaceMatches ? r.FaceMatches.length : 0), 0);

        return {
            totalProcessed: allResults.length,
            successfulComparisons,
            failedComparisons,
            totalMatches,
            sourceFaceCount: allResults.length > 0 ? allResults[0].sourceFaceCount : 0
        };
    }
}

// MARK: - Batch Job Status Enum
const BatchJobStatus = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
};

// MARK: - In-Memory Storage
class BatchJobStorage {
    constructor() {
        this.jobs = new Map();
        this.jobIdCounter = 0;
        this.cleanupInterval = null;
        
        // Start cleanup interval to remove old completed jobs
        this.startCleanupInterval();
    }

    // Generate unique job ID
    generateJobId() {
        this.jobIdCounter++;
        return `batch_job_${Date.now()}_${this.jobIdCounter}`;
    }

    // Create a new batch job
    createJob(userId, sourceImageData, totalBatches, metadata = {}) {
        const jobId = this.generateJobId();
        const job = new BatchJob(jobId, userId, sourceImageData, totalBatches, metadata);
        
        this.jobs.set(jobId, job);
        
        if (Controls.enableDebugLogBatchJobService) {
            console.log(`[BatchJobService] Created new batch job: ${jobId} for user ${userId} with ${totalBatches} batches`);
        }
        
        return job;
    }

    // Get job by ID
    getJob(jobId) {
        return this.jobs.get(jobId);
    }

    // Update job progress
    updateJobProgress(jobId, completedBatches, results = [], errors = []) {
        const job = this.jobs.get(jobId);
        if (!job) {
            throw new Error(`Batch job not found: ${jobId}`);
        }
        
        job.updateProgress(completedBatches, results, errors);
        return job;
    }

    // Mark job as failed
    markJobFailed(jobId, error) {
        const job = this.jobs.get(jobId);
        if (!job) {
            throw new Error(`Batch job not found: ${jobId}`);
        }
        
        job.markFailed(error);
        return job;
    }

    // Get all jobs for a user
    getUserJobs(userId) {
        return Array.from(this.jobs.values()).filter(job => job.userId === userId);
    }

    // Get all active jobs (not completed or failed)
    getActiveJobs() {
        return Array.from(this.jobs.values()).filter(job => 
            job.status === BatchJobStatus.PENDING || job.status === BatchJobStatus.PROCESSING
        );
    }

    // Delete job
    deleteJob(jobId) {
        const deleted = this.jobs.delete(jobId);
        if (deleted && Controls.enableDebugLogBatchJobService) {
            console.log(`[BatchJobService] Deleted batch job: ${jobId}`);
        }
        return deleted;
    }

    // Cleanup old completed jobs (older than 24 hours)
    cleanupOldJobs() {
        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
        const jobsToDelete = [];
        
        for (const [jobId, job] of this.jobs.entries()) {
            if ((job.status === BatchJobStatus.COMPLETED || job.status === BatchJobStatus.FAILED) &&
                job.updatedAt.getTime() < cutoffTime) {
                jobsToDelete.push(jobId);
            }
        }
        
        jobsToDelete.forEach(jobId => this.deleteJob(jobId));
        
        if (jobsToDelete.length > 0 && Controls.enableDebugLogBatchJobService) {
            console.log(`[BatchJobService] Cleaned up ${jobsToDelete.length} old batch jobs`);
        }
    }

    // Start cleanup interval (runs every hour)
    startCleanupInterval() {
        this.cleanupInterval = setInterval(() => {
            this.cleanupOldJobs();
        }, 60 * 60 * 1000); // 1 hour
    }

    // Stop cleanup interval
    stopCleanupInterval() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }

    // Get storage statistics
    getStats() {
        const totalJobs = this.jobs.size;
        const pendingJobs = Array.from(this.jobs.values()).filter(job => job.status === BatchJobStatus.PENDING).length;
        const processingJobs = Array.from(this.jobs.values()).filter(job => job.status === BatchJobStatus.PROCESSING).length;
        const completedJobs = Array.from(this.jobs.values()).filter(job => job.status === BatchJobStatus.COMPLETED).length;
        const failedJobs = Array.from(this.jobs.values()).filter(job => job.status === BatchJobStatus.FAILED).length;

        return {
            totalJobs,
            pendingJobs,
            processingJobs,
            completedJobs,
            failedJobs
        };
    }
}

// MARK: - Batch Job Service
class BatchJobService {
    constructor() {
        this.storage = new BatchJobStorage();
    }

    /**
     * Create a new batch job
     * @param {number} userId - The user's ID
     * @param {Buffer} sourceImageData - Source image data for face comparison
     * @param {number} totalBatches - Total number of batches to process
     * @param {Object} metadata - Additional metadata for the job
     * @returns {BatchJob} The created batch job
     */
    createBatchJob(userId, sourceImageData, totalBatches, metadata = {}) {
        if (!userId || !sourceImageData || totalBatches <= 0) {
            throw new Error('Invalid parameters for batch job creation');
        }

        return this.storage.createJob(userId, sourceImageData, totalBatches, metadata);
    }

    /**
     * Get batch job by ID
     * @param {string} jobId - The job ID
     * @returns {BatchJob|null} The batch job or null if not found
     */
    getBatchJob(jobId) {
        return this.storage.getJob(jobId);
    }

    /**
     * Update batch job progress
     * @param {string} jobId - The job ID
     * @param {number} completedBatches - Number of completed batches
     * @param {Array} results - Results from the completed batch
     * @param {Array} errors - Any errors from the completed batch
     * @returns {BatchJob} The updated batch job
     */
    updateBatchJobProgress(jobId, completedBatches, results = [], errors = []) {
        return this.storage.updateJobProgress(jobId, completedBatches, results, errors);
    }

    /**
     * Mark batch job as failed
     * @param {string} jobId - The job ID
     * @param {string} error - Error message
     * @returns {BatchJob} The updated batch job
     */
    markBatchJobFailed(jobId, error) {
        return this.storage.markJobFailed(jobId, error);
    }

    /**
     * Get batch job status with progress information
     * @param {string} jobId - The job ID
     * @returns {Object|null} Status object or null if job not found
     */
    getBatchJobStatus(jobId) {
        const job = this.storage.getJob(jobId);
        if (!job) {
            return null;
        }

        return {
            job: {
                id: job.id,
                userId: job.userId,
                totalBatches: job.totalBatches,
                completedBatches: job.completedBatches,
                status: job.status,
                createdAt: job.createdAt.toISOString(),
                updatedAt: job.updatedAt.toISOString(),
                metadata: job.metadata
            },
            progress: job.getProgressPercentage(),
            estimatedTimeRemaining: job.getEstimatedTimeRemaining(),
            summary: job.getSummary()
        };
    }

    /**
     * Get all jobs for a user
     * @param {number} userId - The user's ID
     * @returns {Array} Array of batch jobs
     */
    getUserBatchJobs(userId) {
        return this.storage.getUserJobs(userId);
    }

    /**
     * Delete a batch job
     * @param {string} jobId - The job ID
     * @returns {boolean} True if job was deleted
     */
    deleteBatchJob(jobId) {
        return this.storage.deleteJob(jobId);
    }

    /**
     * Get service statistics
     * @returns {Object} Statistics about the batch job service
     */
    getStats() {
        return this.storage.getStats();
    }

    /**
     * Cleanup old jobs manually
     */
    cleanupOldJobs() {
        this.storage.cleanupOldJobs();
    }

    /**
     * Stop the service (cleanup intervals, etc.)
     */
    stop() {
        this.storage.stopCleanupInterval();
    }
}

// MARK: - Export
module.exports = {
    BatchJobService,
    BatchJob,
    BatchJobStatus
}; 