/**
 * NIRF Scraper
 * Fetches National Institutional Ranking Framework data
 * https://www.nirfindia.org/
 *
 * NIRF publishes rankings yearly across categories:
 * Overall, Engineering, Management, Medical, Pharmacy, Architecture, Law, etc.
 */

import { BaseScraper } from './BaseScraper.js';
import { RawInstitution } from '../models/RawInstitution.js';
import { College } from '../models/College.js';
import {
  normalizeInstitutionName,
  normalizeCity,
  normalizeState,
} from '../utils/normalizers/index.js';

interface NirfRecord {
  rank: number;
  name: string;
  city: string;
  state: string;
  score: number;
  category: string;
  year: number;
  rawPayload: Record<string, any>;
}

const NIRF_CATEGORIES = [
  'Overall',
  'Engineering',
  'Management',
  'Medical',
  'Pharmacy',
  'Architecture',
  'Law',
  'University',
  'College',
  'Research',
  'Dental',
  'Agriculture',
];

export class NirfScraper extends BaseScraper<NirfRecord> {
  private year: number;

  constructor(year: number = new Date().getFullYear(), triggeredBy: string = 'system') {
    super({
      source: 'nirf',
      maxRetries: 3,
      delayMs: 2000,
      timeoutMs: 30000,
      triggeredBy,
    });
    this.year = year;
  }

  protected async scrape(): Promise<NirfRecord[]> {
    const allRecords: NirfRecord[] = [];

    this.log.info(`[nirf] Starting NIRF ${this.year} ranking scrape`);

    for (const category of NIRF_CATEGORIES) {
      try {
        await this.sleep(this.options.delayMs);

        // NIRF publishes rankings at URLs like:
        // https://www.nirfindia.org/2024/EngineeringRanking.html
        const slug = category.replace(/\s+/g, '');
        const url = `https://www.nirfindia.org/${this.year}/${slug}Ranking.html`;

        this.log.info(`[nirf] Fetching ${category} rankings for ${this.year}`);

        try {
          const $ = await this.fetchAndParse(url);

          // NIRF pages contain ranking tables
          $('table tbody tr, .ranking-table tr').each((_, row) => {
            const cells = $(row).find('td');
            if (cells.length >= 4) {
              const rank = parseInt($(cells[0]).text().trim());
              const name = $(cells[1]).text().trim();
              const cityState = $(cells[2]).text().trim();
              const score = parseFloat($(cells[3]).text().trim());

              if (!isNaN(rank) && name && name.length > 3) {
                const [city, state] = this.parseCityState(cityState);

                allRecords.push({
                  rank,
                  name,
                  city,
                  state,
                  score: isNaN(score) ? 0 : score,
                  category,
                  year: this.year,
                  rawPayload: {
                    rank,
                    name,
                    location: cityState,
                    score,
                    category,
                    year: this.year,
                  },
                });
              }
            }
          });

          this.log.info(`[nirf] ${category}: found ${allRecords.filter(r => r.category === category).length} entries`);
        } catch (err: any) {
          this.log.warn(`[nirf] Could not fetch ${category} rankings: ${err.message}`);
        }
      } catch (err: any) {
        this.trackError(`Failed ${category}: ${err.message}`, category);
      }
    }

    this.log.info(`[nirf] Total scraped: ${allRecords.length} rankings`);
    return allRecords;
  }

  private parseCityState(text: string): [string, string] {
    // "Mumbai, Maharashtra" or "New Delhi"
    const parts = text.split(',').map(s => s.trim());
    return [
      normalizeCity(parts[0] || ''),
      normalizeState(parts[1] || parts[0] || ''),
    ];
  }

  protected async persist(items: NirfRecord[]): Promise<void> {
    for (const item of items) {
      if (!item.name || item.rank < 1) {
        this.stats.skipped++;
        continue;
      }

      try {
        const nameNorm = normalizeInstitutionName(item.name);

        // 1. Try to directly update an existing College document
        const existingCollege = await College.findOne({
          $or: [
            { slug: { $regex: nameNorm.replace(/\s+/g, '-').slice(0, 30) } },
            // Text search fallback
          ],
        });

        if (existingCollege) {
          // Update NIRF data on the college directly
          await College.updateOne(
            { _id: existingCollege._id },
            {
              $set: {
                'approvals.nirf': {
                  rank: item.rank,
                  year: item.year,
                  category: item.category,
                },
              },
            }
          );
          this.stats.updated++;
        } else {
          // 2. Store in RawInstitution for future matching
          const filter = {
            source: 'nirf' as const,
            nameNormalized: nameNorm,
            nirfYear: item.year,
            nirfCategory: item.category,
          };

          await RawInstitution.updateOne(
            filter,
            {
              $set: {
                source: 'nirf',
                name: item.name.trim(),
                nameNormalized: nameNorm,
                city: item.city,
                state: item.state,
                nirfRank: item.rank,
                nirfYear: item.year,
                nirfCategory: item.category,
                nirfScore: item.score,
                rawPayload: item.rawPayload,
                moderationStatus: 'pending',
              },
            },
            { upsert: true }
          );
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

export default NirfScraper;
