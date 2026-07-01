/**
 * Job Scheduler
 * Manages automated scraping and data update cron jobs
 *
 * Uses node-cron for scheduling.
 * Each job runs the corresponding scraper and logs results.
 */

import cron, { ScheduledTask } from 'node-cron';
import { logger } from '../utils/logger.js';
import { AicteScraper } from '../scrapers/AicteScraper.js';
import { UgcScraper } from '../scrapers/UgcScraper.js';
import { NirfScraper } from '../scrapers/NirfScraper.js';

interface ScheduledJob {
  name: string;
  schedule: string;
  task: ScheduledTask | null;
  lastRun?: Date;
  lastStatus?: string;
  enabled: boolean;
}

class JobScheduler {
  private jobs: Map<string, ScheduledJob> = new Map();

  constructor() {
    this.registerJobs();
  }

  private registerJobs() {
    // ── AICTE data update ─────────────────────────────────────
    // Run every Sunday at 2 AM IST
    this.jobs.set('aicte_scrape', {
      name: 'AICTE Institution Scrape',
      schedule: '0 2 * * 0',
      task: null,
      enabled: true,
    });

    // ── UGC data update ───────────────────────────────────────
    // Run every Sunday at 3 AM IST
    this.jobs.set('ugc_scrape', {
      name: 'UGC University Scrape',
      schedule: '0 3 * * 0',
      task: null,
      enabled: true,
    });

    // ── NIRF rankings update ──────────────────────────────────
    // Run on 1st of every month at 4 AM IST
    this.jobs.set('nirf_scrape', {
      name: 'NIRF Rankings Scrape',
      schedule: '0 4 1 * *',
      task: null,
      enabled: true,
    });
  }

  /** Start all enabled jobs */
  start() {
    logger.info('[Scheduler] Initializing cron jobs...');

    for (const [key, job] of this.jobs) {
      if (!job.enabled) {
        logger.info(`[Scheduler] Job "${job.name}" is disabled, skipping`);
        continue;
      }

      if (!cron.validate(job.schedule)) {
        logger.error(`[Scheduler] Invalid cron expression for "${job.name}": ${job.schedule}`);
        continue;
      }

      job.task = cron.schedule(job.schedule, async () => {
        logger.info(`[Scheduler] Running job: ${job.name}`);
        job.lastRun = new Date();

        try {
          await this.executeJob(key);
          job.lastStatus = 'completed';
          logger.info(`[Scheduler] Job "${job.name}" completed successfully`);
        } catch (error: any) {
          job.lastStatus = 'failed';
          logger.error(`[Scheduler] Job "${job.name}" failed: ${error.message}`);
        }
      });

      logger.info(`[Scheduler] Registered job: ${job.name} (${job.schedule})`);
    }

    logger.info(`[Scheduler] ${this.jobs.size} jobs registered`);
  }

  /** Execute a specific job by key */
  async executeJob(key: string): Promise<any> {
    switch (key) {
      case 'aicte_scrape': {
        const scraper = new AicteScraper('cron');
        return scraper.run();
      }
      case 'ugc_scrape': {
        const scraper = new UgcScraper('cron');
        return scraper.run();
      }
      case 'nirf_scrape': {
        const scraper = new NirfScraper(new Date().getFullYear(), 'cron');
        return scraper.run();
      }
      default:
        throw new Error(`Unknown job: ${key}`);
    }
  }

  /** Manually trigger a job (for admin API) */
  async triggerJob(key: string, triggeredBy: string = 'admin'): Promise<any> {
    const job = this.jobs.get(key);
    if (!job) throw new Error(`Job not found: ${key}`);

    logger.info(`[Scheduler] Manual trigger: ${job.name} by ${triggeredBy}`);

    switch (key) {
      case 'aicte_scrape':
        return new AicteScraper(triggeredBy).run();
      case 'ugc_scrape':
        return new UgcScraper(triggeredBy).run();
      case 'nirf_scrape':
        return new NirfScraper(new Date().getFullYear(), triggeredBy).run();
      default:
        throw new Error(`Unknown job: ${key}`);
    }
  }

  /** Get status of all jobs */
  getStatus() {
    const status: any[] = [];
    for (const [key, job] of this.jobs) {
      status.push({
        key,
        name: job.name,
        schedule: job.schedule,
        enabled: job.enabled,
        lastRun: job.lastRun,
        lastStatus: job.lastStatus,
      });
    }
    return status;
  }

  /** Stop all jobs */
  stop() {
    for (const [_, job] of this.jobs) {
      if (job.task) {
        job.task.stop();
      }
    }
    logger.info('[Scheduler] All jobs stopped');
  }
}

// Singleton
export const scheduler = new JobScheduler();
export default scheduler;
