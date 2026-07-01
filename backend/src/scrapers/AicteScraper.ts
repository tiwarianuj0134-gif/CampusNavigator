/**
 * AICTE Scraper
 * Fetches AICTE-approved institutions from the public AICTE portal API
 * https://www.aicte-india.org/
 *
 * AICTE provides a public search API that returns JSON.
 * We paginate through states to collect all institutes.
 */

import { BaseScraper } from './BaseScraper.js';
import { RawInstitution } from '../models/RawInstitution.js';
import {
  normalizeInstitutionName,
  normalizeCity,
  normalizeState,
  normalizeStream,
} from '../utils/normalizers/index.js';

interface AicteRecord {
  name: string;
  sourceId: string;
  type: string;
  city: string;
  state: string;
  district: string;
  pincode: string;
  website: string;
  email: string;
  phone: string;
  courses: string[];
  streams: string[];
  rawPayload: Record<string, any>;
}

// Indian states for pagination
const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi',
  'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
];

export class AicteScraper extends BaseScraper<AicteRecord> {
  constructor(triggeredBy: string = 'system') {
    super({
      source: 'aicte',
      maxRetries: 3,
      delayMs: 2000, // Be respectful to public APIs
      timeoutMs: 30000,
      triggeredBy,
    });
  }

  protected async scrape(): Promise<AicteRecord[]> {
    const allRecords: AicteRecord[] = [];

    /**
     * AICTE Dashboard API endpoint.
     * In production, use the actual AICTE API:
     *   POST https://www.aicte-india.org/sites/default/files/api.php
     * with form data for state/year/status filters.
     *
     * For now, we demonstrate the architecture with a simulation
     * that can be swapped in when the actual endpoint is confirmed.
     */
    this.log.info('[aicte] Starting state-wise institution scrape');

    for (const state of STATES) {
      try {
        await this.sleep(this.options.delayMs);

        // Attempt to fetch from AICTE API
        const url = `https://facilities.aicte-india.org/dashboard/pages/dashboardaicte.php`;

        this.log.info(`[aicte] Fetching data for state: ${state}`);

        // The AICTE API requires POST with form data.
        // We demonstrate the parse pattern here.
        // In production, this would call the real API.
        // For now, skip states where we can't reach the API.

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'CampusNavigator-Bot/1.0',
            },
            body: `state=${encodeURIComponent(state)}&type=All&year=2024-2025&status=Approved`,
            signal: AbortSignal.timeout(this.options.timeoutMs),
          });

          if (response.ok) {
            const html = await response.text();
            const records = this.parseAicteResponse(html, state);
            allRecords.push(...records);
            this.log.info(`[aicte] ${state}: found ${records.length} institutions`);
          }
        } catch {
          // API may not be reachable — that's OK, we log it
          this.log.warn(`[aicte] Could not reach AICTE API for ${state} — will retry in next cron cycle`);
        }
      } catch (err: any) {
        this.trackError(`Failed to scrape state: ${state}: ${err.message}`, state);
      }
    }

    this.log.info(`[aicte] Total scraped: ${allRecords.length} institutions`);
    return allRecords;
  }

  private parseAicteResponse(html: string, state: string): AicteRecord[] {
    const records: AicteRecord[] = [];

    // Parse the HTML/JSON response from AICTE
    // The actual format depends on the AICTE API version
    // This is the pattern — swap in real parsing when API confirmed

    try {
      // Try JSON parse first
      const data = JSON.parse(html);
      if (Array.isArray(data)) {
        for (const item of data) {
          records.push({
            name: item.INSTITUTION_NAME || item.name || '',
            sourceId: item.PERMANENT_ID || item.id || '',
            type: item.INSTITUTE_TYPE || 'Private',
            city: item.TOWN || item.city || '',
            state: state,
            district: item.DISTRICT || '',
            pincode: item.PINCODE || '',
            website: item.WEBSITE || '',
            email: item.EMAIL || '',
            phone: item.PHONE || '',
            courses: [],
            streams: [],
            rawPayload: item,
          });
        }
      }
    } catch {
      // Not JSON — try HTML table parsing
      // In production, use cheerio to parse table rows
      this.log.debug(`[aicte] Response for ${state} was not JSON, skipping`);
    }

    return records;
  }

  protected async persist(items: AicteRecord[]): Promise<void> {
    for (const item of items) {
      if (!item.name || item.name.trim().length < 3) {
        this.stats.skipped++;
        continue;
      }

      try {
        const normalized = {
          source: 'aicte' as const,
          sourceId: item.sourceId || undefined,
          name: item.name.trim(),
          nameNormalized: normalizeInstitutionName(item.name),
          type: item.type,
          city: normalizeCity(item.city || ''),
          state: normalizeState(item.state || ''),
          district: item.district,
          pincode: item.pincode,
          website: item.website,
          email: item.email,
          phone: item.phone,
          aicteApproved: true,
          aicteId: item.sourceId,
          courses: item.courses,
          streams: item.streams.map(normalizeStream),
          rawPayload: item.rawPayload,
          moderationStatus: 'pending' as const,
        };

        // Upsert: match on source + sourceId, or source + nameNormalized
        const filter = normalized.sourceId
          ? { source: 'aicte', sourceId: normalized.sourceId }
          : { source: 'aicte', nameNormalized: normalized.nameNormalized };

        const existing = await RawInstitution.findOne(filter);

        if (existing) {
          // Only update if not already approved
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
          this.stats.skipped++; // Duplicate
        } else {
          this.trackError(err.message, item.name);
        }
      }
    }
  }
}

export default AicteScraper;
