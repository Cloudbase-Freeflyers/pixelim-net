import mongoose, { Schema, models } from "mongoose";

export type LeadStatus = "new" | "contacted" | "converted" | "rejected";

export interface ILead {
  name: string;
  phone: string;
  email: string;
  service: string;
  message?: string;
  status: LeadStatus;
  userAgent?: string;
  referrer?: string;
  visitorId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

const leadSchema = new Schema<ILead>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  service: { type: String, required: true },
  message: { type: String },
  status: { type: String, enum: ["new", "contacted", "converted", "rejected"], default: "new" },
  userAgent: { type: String },
  referrer: { type: String },
  visitorId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

const Lead = models.Lead ?? mongoose.model<ILead>("Lead", leadSchema);

export default Lead;
