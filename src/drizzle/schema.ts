import { relations } from "drizzle-orm";
import {pgTable,serial,varchar,text,numeric,integer,date,time,timestamp,pgEnum,boolean,} from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("role", ["user", "admin", "doctor"]);
export type UserRole = typeof userRoleEnum.enumValues[number];
export const appointmentStatusEnum = pgEnum("appointmentStatus", ["pending", "confirmed", "cancelled"]);
export type AppointmentStatus = typeof appointmentStatusEnum.enumValues[number];
export const complaintStatusEnum = pgEnum("complaintStatus", ["open", "inProgress", "resolved", "closed"]);
export type ComplaintStatus = typeof complaintStatusEnum.enumValues[number];
export const paymentStatusEnum = pgEnum("paymentStatus", ["pending", "completed", "failed"]);
export const dayOfWeekEnum = pgEnum("dayOfWeek", ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]);
export type DayOfWeek = typeof dayOfWeekEnum.enumValues[number];

// Specializations
export const specializations = pgTable("specializations", {
    specializationId: serial("specializationId").primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    description: text("description").notNull(),
});

// Users
export const users = pgTable("users", {
    userId: serial("userId").primaryKey(),
    firstName: varchar("firstName", { length: 255 }).notNull(),
    lastName: varchar("lastName", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: boolean("emailVerified").notNull().default(false),
    confirmationCode: varchar("confirmationCode", { length: 255 }).default(""),
    password: varchar("password", { length: 255 }).notNull(),
    contactPhone: varchar("contactPhone", { length: 20 }),
    address: text("address"),
    profileImageUrl: text("profileImageUrl"),
    role: userRoleEnum("role").notNull().default("user"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
});

// Doctors
export const doctors = pgTable("doctors", {
    doctorId: serial("doctorId").primaryKey(),
    userId: integer("userId").notNull().unique().references(() => users.userId, { onDelete: "cascade" }),
    specializationId: integer("specializationId").references(() => specializations.specializationId, { onDelete: "set null" }),
    bio: text("bio").notNull(),
    experienceYears: integer("experienceYears"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
});

// Doctor Availability
export const doctorAvailability = pgTable("doctorAvailability", {
    availabilityId: serial("availabilityId").primaryKey(),
    doctorId: integer("doctorId").notNull().references(() => doctors.doctorId, { onDelete: "cascade" }),
    dayOfWeek: dayOfWeekEnum("dayOfWeek").notNull(),
    startTime: time("startTime").notNull(),
    endTime: time("endTime").notNull(),
    slotDurationMinutes: integer("slotDurationMinutes").notNull().default(30),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
});

// Appointments
export const appointments = pgTable("appointments", {
    appointmentId: serial("appointmentId").primaryKey(),
    userId: integer("userId").notNull().references(() => users.userId, { onDelete: "cascade" }),
    doctorId: integer("doctorId").notNull().references(() => doctors.doctorId, { onDelete: "cascade" }),
    availabilityId: integer("availabilityId").notNull().references(() => doctorAvailability.availabilityId, { onDelete: "cascade" }),
    appointmentDate: date("appointmentDate").notNull(), // ✅ add this
    startTime: time("startTime").notNull(), // ✅ NEW
    endTime: time("endTime").notNull(),     // ✅ NEW
    totalAmount: numeric("totalAmount", { precision: 10, scale: 2 }).notNull(),
    appointmentStatus: appointmentStatusEnum("appointmentStatus").notNull().default("pending"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
});


// Prescriptions
export const prescriptions = pgTable("prescriptions", {
    prescriptionId: serial("prescriptionId").primaryKey(),
    appointmentId: integer("appointmentId").notNull().references(() => appointments.appointmentId, { onDelete: "cascade" }),
    doctorId: integer("doctorId").notNull().references(() => doctors.doctorId, { onDelete: "cascade" }),
    patientId: integer("patientId").notNull().references(() => users.userId, { onDelete: "cascade" }),
    medicationName: text("medicationName").notNull(),
    dosage: text("dosage").notNull(),                     // e.g., "500mg"
    frequency: text("frequency").notNull(),               // e.g., "Twice a day"
    duration: integer("duration").notNull(),              // e.g., 7 (days)
    instructions: text("instructions"),                   // e.g., "Take before meals"
    isActive: boolean("isActive").default(true),
    refillCount: integer("refill_count").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


// Payments
export const payments = pgTable("payments", {
    paymentId: serial("paymentId").primaryKey(),
    appointmentId: integer("appointmentId").notNull().references(() => appointments.appointmentId, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    paymentStatus: paymentStatusEnum("paymentStatus").notNull().default("pending"),
    transactionId: varchar("transactionId", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
});

// Complaints
export const complaints = pgTable("complaints", {
    complaintId: serial("complaintId").primaryKey(),
    userId: integer("userId").notNull().references(() => users.userId, { onDelete: "cascade" }),
    relatedAppointmentId: integer("relatedAppointmentId").references(() => appointments.appointmentId, { onDelete: "cascade" }),
    subject: varchar("subject", { length: 255 }).notNull(),
    description: text("description").notNull(),
    status: complaintStatusEnum("complaintStatus").notNull().default("open"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
});

export const complaintReplies = pgTable("complaintReplies", {
    replyId: serial("replyId").primaryKey(),
    complaintId: integer("complaintId").notNull().references(() => complaints.complaintId, { onDelete: "cascade" }),
    senderId: integer("senderId").notNull().references(() => users.userId, { onDelete: "cascade" }), // add this line
    message: text("message").notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
});

// User Relations
export const userRelations = relations(users, ({ many }) => ({
    appointments: many(appointments),
    complaints: many(complaints),
    prescriptions: many(prescriptions),
}));

// Doctor Relations
export const doctorRelations = relations(doctors, ({ one, many }) => ({
    user: one(users, {
        fields: [doctors.userId],
        references: [users.userId],
    }),
    specialization: one(specializations, {
        fields: [doctors.specializationId],
        references: [specializations.specializationId],
    }),
    appointments: many(appointments),
    prescriptions: many(prescriptions),
    availability: many(doctorAvailability),
}));

// Specialization Relations
export const specializationRelations = relations(specializations, ({ many }) => ({
    doctors: many(doctors),
}));

// Doctor Availability Relations
export const availabilityRelations = relations(doctorAvailability, ({ one }) => ({
    doctor: one(doctors, {
        fields: [doctorAvailability.doctorId],
        references: [doctors.doctorId],
    }),
}));

// Appointment Relations
export const appointmentRelations = relations(appointments, ({ one, many }) => ({
    user: one(users, {
        fields: [appointments.userId],
        references: [users.userId],
    }),
    doctor: one(doctors, {
        fields: [appointments.doctorId],
        references: [doctors.doctorId],
    }),
    prescriptions: many(prescriptions),
    payments: many(payments),
    complaints: many(complaints),
}));

// Prescription Relations
export const prescriptionRelations = relations(prescriptions, ({ one }) => ({
    doctor: one(doctors, {
        fields: [prescriptions.doctorId],
        references: [doctors.doctorId],
    }),
    patient: one(users, {
        fields: [prescriptions.patientId],
        references: [users.userId],
    }),
    appointment: one(appointments, {
        fields: [prescriptions.appointmentId],
        references: [appointments.appointmentId],
    }),
}));

// Payment Relations
export const paymentRelations = relations(payments, ({ one }) => ({
    appointment: one(appointments, {
        fields: [payments.appointmentId],
        references: [appointments.appointmentId],
    }),
}));

// Complaint Relations
export const complaintRelations = relations(complaints, ({ one }) => ({
    user: one(users, {
        fields: [complaints.userId],
        references: [users.userId],
    }),
    appointment: one(appointments, {
        fields: [complaints.relatedAppointmentId],
        references: [appointments.appointmentId],
    }),
}));

// Complaint Reply Relations
export const complaintReplyRelations = relations(complaintReplies, ({ one }) => ({
    complaint: one(complaints, {
        fields: [complaintReplies.complaintId],
        references: [complaints.complaintId],
    }),
}));


// User Types
export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

// Doctor Types
export type DoctorSelect = typeof doctors.$inferSelect;
export type DoctorInsert = typeof doctors.$inferInsert;

// Specialization Types
export type SpecializationSelect = typeof specializations.$inferSelect;
export type SpecializationInsert = typeof specializations.$inferInsert;

// Doctor Availability Types
export type DoctorAvailabilitySelect = typeof doctorAvailability.$inferSelect;
export type DoctorAvailabilityInsert = typeof doctorAvailability.$inferInsert;

// Appointment Types
export type AppointmentSelect = typeof appointments.$inferSelect;
export type AppointmentInsert = typeof appointments.$inferInsert;

// Prescription Types
export type PrescriptionSelect = typeof prescriptions.$inferSelect;
export type PrescriptionInsert = typeof prescriptions.$inferInsert;

// Payment Types
export type PaymentSelect = typeof payments.$inferSelect;
export type PaymentInsert = typeof payments.$inferInsert;

// Complaint Types
export type ComplaintSelect = typeof complaints.$inferSelect;
export type ComplaintInsert = typeof complaints.$inferInsert;

// Complaint Replies Types
export type ComplaintReplySelect = typeof complaintReplies.$inferSelect;
export type ComplaintReplyInsert = typeof complaintReplies.$inferInsert
