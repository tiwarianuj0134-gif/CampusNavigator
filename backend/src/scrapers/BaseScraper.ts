/**
 * BaseScraper
 * Reusable scraper foundation with retry, throttling, logging, dedup
 */

import * as cheerio from 'cheerio';
import { logger } from '../utils/logger.js';
import { IngestionLog } from '../models/IngestionLog.js';

export interface ScraperOptions {
  /** Unique identifier for this scraper run */
  source: 'aicte' | 'ugc' | 'nirf' | 'placement_pdf' | 'college_website';
  /** Max retries per request */
  maxRetries: number;
  /** Delay between requests in ms (throttling) */
  delayMs: number;
  /** Request timeout in ms */
  timeoutMs: number;
  /** Who triggered this run */
  triggeredBy: string;
}

export interface ScraperResult<T> {
  data: T[];
  stats: {
    total: number;
    created: number;
    updated: number;
    skipped: number;
    failed: number;
  };
  errors: { message: string; item?: string }[];
  durationMs: number;
}

export abstract class BaseScraper<T> {
  protected options: ScraperOptions;
  protected log: typeof logger;
  protected stats = { total: 0, created: 0, updated: 0, skipped: 0, failed: 0 };
  protected errors: { message: string; item?: string; stack?: string }[] = [];
  private logDocId: string | null = null;

  constructor(options: Partial<ScraperOptions> & { source: ScraperOptions['source'] }) {
    this.options = {
      maxRetries: 3,
      delayMs: 1000,
      timeoutMs: 30000,
      triggeredBy: 'system',
      ...options,
    };
    this.log = logger;
  }

  /** Subclass implements the actual scraping logic */
  protected abstract scrape(): Promise<T[]>;

  /** Subclass implements how to persist / upsert each item */
  protected abstract persist(items: T[]): Promise<void>;

  /** Run the full scraper pipeline */
  async run(): Promise<ScraperResult<T>> {
    const start = Date.now();

    // Create ingestion log
    const logDoc = await IngestionLog.create({
      source: this.options.source,
      action: 'scrape',
      status: 'running',
      triggeredBy: this.options.triggeredBy,
      startedAt: new Date(),
    });
    this.logDocId = logDoc._id.toString();

    this.log.info(`[${this.options.source}] Scraper started`);

    let data: T[] = [];

    try {
      // 1. Scrape
      data = await this.scrape();
      this.stats.total = data.length;
      this.log.info(`[${this.options.source}] Scraped ${data.length} items`);

      // 2. Persist
      await this.persist(data);
      this.log.info(`[${this.options.source}] Persist complete: ${JSON.stringify(this.stats)}`);

      // 3. Finalize log
      const duration = Date.now() - start;
      await IngestionLog.findByIdAndUpdate(this.logDocId, {
        status: this.errors.length > 0 ? 'partial' : 'completed',
        stats: this.stats,
        errorList: this.errors.slice(0, 100),
        completedAt: new Date(),
        durationMs: duration,
      });

      this.log.info(`[${this.options.source}] Finished in ${duration}ms`);

      return { data, stats: this.stats, errors: this.errors, durationMs: duration };
    } catch (error: any) {
      const duration = Date.now() - start;
      this.log.error(`[${this.options.source}] Scraper failed: ${error.message}`);

      await IngestionLog.findByIdAndUpdate(this.logDocId, {
        status: 'failed',
        stats: this.stats,
        errorList: [{ message: error.message, stack: error.stack }, ...this.errors].slice(0, 100),
        completedAt: new Date(),
        durationMs: duration,
      });

      return { data: [], stats: this.stats, errors: this.errors, durationMs: duration };
    }
  }

  // ─── Utility Methods ─────────────────────────────────────────

  /** HTTP GET with retries and throttling */
  protected async fetchHtml(url: string): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        // Throttle
        if (attempt > 1) {
          await this.sleep(this.options.delayMs * attempt);
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.options.timeoutMs);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'CampusNavigator-Bot/1.0 (education research)',
            'Accept': 'text/html,application/xhtml+xml',
          },
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.text();
      } catch (err: any) {
        lastError = err;
        this.log.warn(`[${this.options.source}] Fetch attempt ${attempt}/${this.options.maxRetries} failed for ${url}: ${err.message}`);
      }
    }

    throw lastError || new Error(`Failed to fetch ${url}`);
  }

  /** Fetch and parse HTML with Cheerio */
  protected async fetchAndParse(url: string): Promise<cheerio.CheerioAPI> {
    const html = await this.fetchHtml(url);
    return cheerio.load(html);
  }

  /** Fetch JSON from an API endpoint */
  protected async fetchJson<R = any>(url: string): Promise<R> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          await this.sleep(this.options.delayMs * attempt);
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.options.timeoutMs);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'CampusNavigator-Bot/1.0',
            'Accept': 'application/json',
          },
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return await response.json() as R;
      } catch (err: any) {
        lastError = err;
        this.log.warn(`[${this.options.source}] JSON fetch attempt ${attempt} failed: ${err.message}`);
      }
    }

    throw lastError || new Error(`Failed to fetch JSON from ${url}`);
  }

  /** Throttle helper */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /** Track a failure for a specific item */
  protected trackError(message: string, item?: string) {
    this.stats.failed++;
    this.errors.push({ message, item });
    this.log.error(`[${this.options.source}] Error: ${message} ${item ? `(${item})` : ''}`);
  }
}

export default BaseScraper;
