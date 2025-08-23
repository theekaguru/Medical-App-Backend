CREATE TYPE "public"."appointmentStatus" AS ENUM('pending', 'confirmed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."complaintStatus" AS ENUM('open', 'inProgress', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."dayOfWeek" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');--> statement-breakpoint
CREATE TYPE "public"."paymentStatus" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin', 'doctor');--> statement-breakpoint
CREATE TABLE "appointments" (
	"appointmentId" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"doctorId" integer NOT NULL,
	"availabilityId" integer NOT NULL,
	"appointmentDate" date NOT NULL,
	"startTime" time NOT NULL,
	"endTime" time NOT NULL,
	"totalAmount" numeric(10, 2) NOT NULL,
	"appointmentStatus" "appointmentStatus" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "complaintReplies" (
	"replyId" serial PRIMARY KEY NOT NULL,
	"complaintId" integer NOT NULL,
	"senderId" integer NOT NULL,
	"message" text NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "complaints" (
	"complaintId" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"relatedAppointmentId" integer,
	"subject" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"complaintStatus" "complaintStatus" DEFAULT 'open' NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "doctorAvailability" (
	"availabilityId" serial PRIMARY KEY NOT NULL,
	"doctorId" integer NOT NULL,
	"dayOfWeek" "dayOfWeek" NOT NULL,
	"startTime" time NOT NULL,
	"endTime" time NOT NULL,
	"slotDurationMinutes" integer DEFAULT 30 NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"doctorId" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"specializationId" integer,
	"bio" text NOT NULL,
	"experienceYears" integer,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "doctors_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"paymentId" serial PRIMARY KEY NOT NULL,
	"appointmentId" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"paymentStatus" "paymentStatus" DEFAULT 'pending' NOT NULL,
	"transactionId" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"prescriptionId" serial PRIMARY KEY NOT NULL,
	"appointmentId" integer NOT NULL,
	"doctorId" integer NOT NULL,
	"patientId" integer NOT NULL,
	"medicationName" text NOT NULL,
	"dosage" text NOT NULL,
	"frequency" text NOT NULL,
	"duration" integer NOT NULL,
	"instructions" text,
	"isActive" boolean DEFAULT true,
	"refill_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "specializations" (
	"specializationId" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	CONSTRAINT "specializations_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"userId" serial PRIMARY KEY NOT NULL,
	"firstName" varchar(255) NOT NULL,
	"lastName" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"confirmationCode" varchar(255) DEFAULT '',
	"password" varchar(255) NOT NULL,
	"contactPhone" varchar(20),
	"address" text,
	"profileImageUrl" text,
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctorId_doctors_doctorId_fk" FOREIGN KEY ("doctorId") REFERENCES "public"."doctors"("doctorId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_availabilityId_doctorAvailability_availabilityId_fk" FOREIGN KEY ("availabilityId") REFERENCES "public"."doctorAvailability"("availabilityId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaintReplies" ADD CONSTRAINT "complaintReplies_complaintId_complaints_complaintId_fk" FOREIGN KEY ("complaintId") REFERENCES "public"."complaints"("complaintId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaintReplies" ADD CONSTRAINT "complaintReplies_senderId_users_userId_fk" FOREIGN KEY ("senderId") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_relatedAppointmentId_appointments_appointmentId_fk" FOREIGN KEY ("relatedAppointmentId") REFERENCES "public"."appointments"("appointmentId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctorAvailability" ADD CONSTRAINT "doctorAvailability_doctorId_doctors_doctorId_fk" FOREIGN KEY ("doctorId") REFERENCES "public"."doctors"("doctorId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_specializationId_specializations_specializationId_fk" FOREIGN KEY ("specializationId") REFERENCES "public"."specializations"("specializationId") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_appointmentId_appointments_appointmentId_fk" FOREIGN KEY ("appointmentId") REFERENCES "public"."appointments"("appointmentId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_appointmentId_appointments_appointmentId_fk" FOREIGN KEY ("appointmentId") REFERENCES "public"."appointments"("appointmentId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctorId_doctors_doctorId_fk" FOREIGN KEY ("doctorId") REFERENCES "public"."doctors"("doctorId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patientId_users_userId_fk" FOREIGN KEY ("patientId") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;