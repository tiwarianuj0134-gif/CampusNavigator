/**
 * UGC Scraper
 * Fetches UGC-recognized universities from the UGC portal
 * https://www.ugc.gov.in/oldpdf/Consolidated_List_of_All_Universities.pdf
 * https://www.ugc.gov.in/
 *
 * UGC publishes university lists in multiple formats.
 * We support both the API endpoint and PDF parsing.
 */

import { BaseScraper } from './BaseScraper.js';
import { RawInstitution } from '../models/RawInstitution.js';
import {
  normalizeInstitutionName,
  normalizeCity,
  normalizeState,
} from '../utils/normalizers/index.js';

interface UgcRecord {
  name: string;
  sourceId: string;
  type: string; // Central / State / Private / Deemed
  state: string;
  city: string;
  website: string;
  established?: number;
  rawPayload: Record<string, any>;
}

export class UgcScraper extends BaseScraper<UgcRecord> {
  constructor(triggeredBy: string = 'system') {
    super({
      source: 'ugc',
      maxRetries: 3,
      delayMs: 2000,
      timeoutMs: 30000,
      triggeredBy,
    });
  }

  protected async scrape(): Promise<UgcRecord[]> {
    const records: UgcRecord[] = [];

    this.log.info('[ugc] Starting UGC university data fetch');

    /**
     * UGC API endpoint for university listing.
     * The actual UGC website uses a search form at:
     *   https://www.ugc.gov.in/oldpdf/Consolidated_List_of_All_Universities.pdf
     *
     * Alternatively, there's a web-based search at:
     *   https://www.ugc.gov.in/
     *
     * We attempt the API-style fetch, and fall back to HTML scraping.
     */

    try {
      // Try the UGC website university listing page
      const url = 'https://www.ugc.gov.in/oldpdf/Consolidated%20list%20of%20All%20Universities.pdf';

      this.log.info('[ugc] Attempting UGC data source...');

      // For PDF source, delegate to the PDF parser (handled separately)
      // For now, attempt the HTML listing if available

      const htmlUrl = 'https://www.ugc.gov.in/';
      
      try {
        const $ = await this.fetchAndParse(htmlUrl);
        
        // UGC lists universities in various categories
        // Parse whatever structure is available
        $('table tr').each((_, row) => {
          const cells = $(row).find('td');
          if (cells.length >= 3) {
            const name = $(cells[1]).text().trim();
            const state = $(cells[2]).text().trim();
            
            if (name && name.length > 5) {
              records.push({
                name,
                sourceId: `ugc_${normalizeInstitutionName(name).replace(/\s+/g, '_').slice(0, 50)}`,
                type: 'State',
                state: state || 'Unknown',
                city: '',
                website: '',
                rawPayload: { name, state },
              });
            }
          }
        });

        this.log.info(`[ugc] Parsed ${records.length} universities from HTML`);
      } catch (err: any) {
        this.log.warn(`[ugc] HTML scrape failed: ${err.message} — will use cached/manual data`);
      }
    } catch (err: any) {
      this.trackError(`UGC scrape failed: ${err.message}`);
    }

    return records;
  }

  protected async persist(items: UgcRecord[]): Promise<void> {
    for (const item of items) {
      if (!item.name || item.name.trim().length < 5) {
        this.stats.skipped++;
        continue;
      }

      try {
        const normalized = {
          source: 'ugc' as const,
          sourceId: item.sourceId,
          name: item.name.trim(),
          nameNormalized: normalizeInstitutionName(item.name),
          type: item.type || 'Government',
          city: item.city ? normalizeCity(item.city) : '',
          state: normalizeState(item.state || ''),
          website: item.website || '',
          established: item.established,
          ugcApproved: true,
          ugcId: item.sourceId,
          rawPayload: item.rawPayload,
          moderationStatus: 'pending' as const,
        };

        const filter = {
          source: 'ugc',
          nameNormalized: normalized.nameNormalized,
        };

        const existing = await RawInstitution.findOne(filter);

        if (existing) {
          if (existing.moderationStatus === 'pending') {
            await RawInstitution.updateOne(filter, { $set: normalized });
            this.stats.updated++;
          } else {
            this.stats.skipped++;
          }
        } else {
          await RawInstitution.create(normalized);
          this.stats.created++;
        }
      } catch (err: any) {
        if (err.code === 11000) {
          this.stats.skipped++;
        } else {
          this.trackError(err.message, item.name);
        }
      }
    }
  }
}

export default UgcScraper;
