/**
 * IngestionLog Model
 * Tracks every data ingestion run — scrapers, parsers, cron jobs
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IIngestionLog extends Document {
  _id: mongoose.Types.ObjectId;
  source: 'aicte' | 'ugc' | 'nirf' | 'placement_pdf' | 'manual' | 'college_website';
  action: 'scrape' | 'parse' | 'normalize' | 'ingest' | 'update' | 'verify';
  status: 'running' | 'completed' | 'failed' | 'partial';
  stats: {
    total: number;
    created: number;
    updated: number;
    skipped: number;
    failed: number;
  };
  errorList: {
    message: string;
    item?: string;
    stack?: string;
  }[];
  metadata?: Record<string, any>;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  triggeredBy?: string; // 'cron' | 'admin' | userId
  createdAt: Date;
}

const ingestionLogSchema = new Schema<IIngestionLog>(
  {
    source: {
      type: String,
      enum: ['aicte', 'ugc', 'nirf', 'placement_pdf', 'manual', 'college_website'],
      required: true,
    },
    action: {
      type: String,
      enum: ['scrape', 'parse', 'normalize', 'ingest', 'update', 'verify'],
      required: true,
    },
    status: {
      type: String,
      enum: ['running', 'completed', 'failed', 'partial'],
      default: 'running',
    },
    stats: {
      total: { type: Number, default: 0 },
      created: { type: Number, default: 0 },
      updated: { type: Number, default: 0 },
      skipped: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },
    errorList: [{
      message: String,
      item: String,
      stack: String,
    }],
    metadata: Schema.Types.Mixed,
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
    durationMs: Number,
    triggeredBy: String,
  },
  { timestamps: true }
);

ingestionLogSchema.index({ source: 1, createdAt: -1 });
ingestionLogSchema.index({ status: 1 });

export const IngestionLog = mongoose.model<IIngestionLog>('IngestionLog', ingestionLogSchema);
export default IngestionLog;
