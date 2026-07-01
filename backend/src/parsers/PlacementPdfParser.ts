/**
 * Placement PDF Parser
 * Extracts placement data from college placement brochure PDFs
 * Uses pdf-parse to extract text and then applies heuristics
 * to identify tables, salary figures, and company names.
 */

import pdfParse from 'pdf-parse';
import { logger } from '../utils/logger.js';
import {
  parseSalary,
  normalizeCompanyName,
} from '../utils/normalizers/index.js';

export interface ParsedPlacement {
  academicYear: string;
  stats: {
    eligible: number;
    placed: number;
    placementRate: number;
    averagePackage: number;
    medianPackage: number;
    highestPackage: number;
    lowestPackage: number;
  };
  branchWise: {
    branch: string;
    eligible: number;
    placed: number;
    averagePackage: number;
    highestPackage: number;
  }[];
  recruiters: {
    company: string;
    offers: number;
    package?: number;
  }[];
  internships?: {
    total: number;
    averageStipend?: number;
  };
  rawText: string;
}

export class PlacementPdfParser {
  /**
   * Parse a placement PDF from a file buffer
   */
  async parseBuffer(buffer: Buffer, academicYear: string): Promise<ParsedPlacement> {
    logger.info('[PlacementPdfParser] Parsing PDF buffer');

    const pdf = await pdfParse(buffer);
    const text = pdf.text;

    logger.info(`[PlacementPdfParser] Extracted ${text.length} chars from ${pdf.numpages} pages`);

    return this.extractData(text, academicYear);
  }

  /**
   * Parse placement data from raw text (already extracted from PDF)
   */
  extractData(text: string, academicYear: string): ParsedPlacement {
    const result: ParsedPlacement = {
      academicYear,
      stats: {
        eligible: 0,
        placed: 0,
        placementRate: 0,
        averagePackage: 0,
        medianPackage: 0,
        highestPackage: 0,
        lowestPackage: 0,
      },
      branchWise: [],
      recruiters: [],
      rawText: text.slice(0, 10000), // Store first 10k chars for debugging
    };

    // ── Extract aggregate statistics ─────────────────────────

    // Highest package
    const highestMatch = text.match(
      /(?:highest|maximum|top|best)\s*(?:package|salary|offer|ctc)[:\s]*(?:(?:rs\.?|₹|inr)\s*)?([\d,.]+)\s*(?:lpa|lakhs?|lacs?|l|crores?|cr)/i
    );
    if (highestMatch) {
      result.stats.highestPackage = parseSalary(highestMatch[0]) || 0;
    }

    // Average package
    const avgMatch = text.match(
      /(?:average|avg|mean)\s*(?:package|salary|offer|ctc)[:\s]*(?:(?:rs\.?|₹|inr)\s*)?([\d,.]+)\s*(?:lpa|lakhs?|lacs?|l)/i
    );
    if (avgMatch) {
      result.stats.averagePackage = parseSalary(avgMatch[0]) || 0;
    }

    // Median package
    const medianMatch = text.match(
      /(?:median)\s*(?:package|salary|offer|ctc)[:\s]*(?:(?:rs\.?|₹|inr)\s*)?([\d,.]+)\s*(?:lpa|lakhs?|lacs?|l)/i
    );
    if (medianMatch) {
      result.stats.medianPackage = parseSalary(medianMatch[0]) || 0;
    }

    // Placement rate
    const rateMatch = text.match(
      /(?:placement\s*(?:rate|percentage)|(?:placed|placement)\s*%)[:\s]*([\d.]+)\s*%?/i
    );
    if (rateMatch) {
      result.stats.placementRate = parseFloat(rateMatch[1]);
    }

    // Total eligible
    const eligibleMatch = text.match(
      /(?:eligible|registered|total)\s*(?:students?)?[:\s]*([\d,]+)/i
    );
    if (eligibleMatch) {
      result.stats.eligible = parseInt(eligibleMatch[1].replace(/,/g, ''));
    }

    // Total placed
    const placedMatch = text.match(
      /(?:students?\s*)?(?:placed|offers?\s*made)[:\s]*([\d,]+)/i
    );
    if (placedMatch) {
      result.stats.placed = parseInt(placedMatch[1].replace(/,/g, ''));
    }

    // Calculate rate if we have eligible and placed but no rate
    if (result.stats.eligible > 0 && result.stats.placed > 0 && !result.stats.placementRate) {
      result.stats.placementRate = Math.round((result.stats.placed / result.stats.eligible) * 100);
    }

    // ── Extract company names ────────────────────────────────

    // Common pattern: company names often appear in lists or tables
    const companyPatterns = [
      /(?:companies?|recruiters?|employers?)\s*(?:visiting|participated|hiring)[:\s]*([^\n]+)/gi,
      /(?:top\s*recruiters?)[:\s]*([^\n]+)/gi,
    ];

    const knownCompanies = [
      'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Goldman Sachs',
      'JP Morgan', 'Morgan Stanley', 'McKinsey', 'BCG', 'Bain', 'Deloitte',
      'TCS', 'Infosys', 'Wipro', 'HCL', 'Cognizant', 'Accenture',
      'Samsung', 'Intel', 'Qualcomm', 'Cisco', 'Oracle', 'Adobe',
      'Uber', 'Flipkart', 'Paytm', 'Swiggy', 'Zomato',
      'KPMG', 'EY', 'PwC', 'Capgemini', 'IBM', 'SAP',
      'Tesla', 'Netflix', 'Nvidia', 'Salesforce', 'Twitter',
    ];

    const foundCompanies = new Set<string>();

    // Check for known companies in text
    for (const company of knownCompanies) {
      if (text.toLowerCase().includes(company.toLowerCase())) {
        foundCompanies.add(normalizeCompanyName(company));
      }
    }

    result.recruiters = Array.from(foundCompanies).map(company => ({
      company,
      offers: 0, // Can't always extract exact numbers from PDF
    }));

    // ── Extract branch-wise data ─────────────────────────────

    // Look for branch/department tables
    const branchPatterns = [
      /(?:computer\s*science|cse?|cs)[^:]*?[:\s]*([\d.]+)\s*(?:lpa|l)/gi,
      /(?:electrical|ee|ece)[^:]*?[:\s]*([\d.]+)\s*(?:lpa|l)/gi,
      /(?:mechanical|me)[^:]*?[:\s]*([\d.]+)\s*(?:lpa|l)/gi,
      /(?:civil|ce)[^:]*?[:\s]*([\d.]+)\s*(?:lpa|l)/gi,
    ];

    const branches = [
      { pattern: /computer\s*science|cse|cs\b/i, name: 'Computer Science' },
      { pattern: /electrical|ece|ee\b/i, name: 'Electrical / Electronics' },
      { pattern: /mechanical|me\b/i, name: 'Mechanical' },
      { pattern: /civil|ce\b/i, name: 'Civil' },
      { pattern: /chemical|che\b/i, name: 'Chemical' },
      { pattern: /information\s*technology|it\b/i, name: 'Information Technology' },
    ];

    // Simple heuristic: look for branch names near salary figures
    const lines = text.split('\n');
    for (const line of lines) {
      for (const branch of branches) {
        if (branch.pattern.test(line)) {
          const salaryMatch = line.match(/([\d.]+)\s*(?:lpa|lakhs?|l)/i);
          if (salaryMatch) {
            const salary = parseSalary(salaryMatch[0]) || 0;
            if (salary > 0) {
              result.branchWise.push({
                branch: branch.name,
                eligible: 0,
                placed: 0,
                averagePackage: salary,
                highestPackage: 0,
              });
            }
          }
          break;
        }
      }
    }

    // ── Internships ──────────────────────────────────────────

    const internMatch = text.match(
      /(?:internship|intern)\s*(?:offers?)?[:\s]*([\d,]+)/i
    );
    if (internMatch) {
      result.internships = {
        total: parseInt(internMatch[1].replace(/,/g, '')),
      };
    }

    logger.info(`[PlacementPdfParser] Extracted: highest=${result.stats.highestPackage}, avg=${result.stats.averagePackage}, ${result.recruiters.length} recruiters, ${result.branchWise.length} branches`);

    return result;
  }
}

export default PlacementPdfParser;
