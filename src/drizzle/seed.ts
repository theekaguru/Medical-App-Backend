import  db  from "./db";
import bcrypt from "bcrypt";

import {
  users,
  doctors,
  specializations,
  doctorAvailability,
  appointments,
  prescriptions,
  payments,
  complaints,
  complaintReplies,
} from "./schema";
import type {
  UserInsert,
  DoctorInsert,
  SpecializationInsert,
  DoctorAvailabilityInsert,
  AppointmentInsert,
  PrescriptionInsert,
  PaymentInsert,
  ComplaintInsert,
  ComplaintReplyInsert,
} from "./schema";

async function seed() {
  console.log("🌱 Starting seeding...");

  // --- Plaintext passwords you can use to log in ---
  const plainPasswords = {
    user: "user12345",
    admin: "admin12345",
    doctor: "doctor12345",
  };

  // --- Hash passwords ---
  const hashedPasswords = {
    user: await bcrypt.hash(plainPasswords.user, 10),
    admin: await bcrypt.hash(plainPasswords.admin, 10),
    doctor: await bcrypt.hash(plainPasswords.doctor, 10),
  };

  // --- Insert Specializations ---
  const specializationData: SpecializationInsert[] = [
    { name: "Cardiology", description: "Heart and cardiovascular system" },
    { name: "Dermatology", description: "Skin, hair, and nails" },
    { name: "Pediatrics", description: "Children’s health" },
  ];
  const insertedSpecs = await db.insert(specializations).values(specializationData).returning();

  // --- Insert Users ---
  const userData: UserInsert[] = [
    {
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice@example.com",
      password: hashedPasswords.user,
      role: "user",
    },
    {
      firstName: "Bob",
      lastName: "Smith",
      email: "bob@example.com",
      password: hashedPasswords.admin,
      role: "admin",
    },
    {
      firstName: "Dr",
      lastName: "Brown",
      email: "drbrown@example.com",
      password: hashedPasswords.doctor,
      role: "doctor",
    },
  ];
  const insertedUsers = await db.insert(users).values(userData).returning();

  // --- Insert Doctors ---
  const doctorData: DoctorInsert[] = [
    {
      userId: insertedUsers.find((u) => u.email === "drbrown@example.com")!.userId,
      specializationId: insertedSpecs[0].specializationId,
      bio: "Experienced cardiologist with 10 years of practice.",
      experienceYears: 10,
    },
  ];
  const insertedDoctors = await db.insert(doctors).values(doctorData).returning();

  // --- Insert Doctor Availability ---
  const availabilityData: DoctorAvailabilityInsert[] = [
    {
      doctorId: insertedDoctors[0].doctorId,
      dayOfWeek: "monday",
      startTime: "09:00",
      endTime: "12:00",
      slotDurationMinutes: 30,
      amount: "100.00",
    },
    {
      doctorId: insertedDoctors[0].doctorId,
      dayOfWeek: "wednesday",
      startTime: "14:00",
      endTime: "17:00",
      slotDurationMinutes: 30,
      amount: "120.00",
    },
  ];
  const insertedAvail = await db.insert(doctorAvailability).values(availabilityData).returning();

  // --- Insert Appointments ---
  const appointmentData: AppointmentInsert[] = [
    {
      userId: insertedUsers[0].userId, // Alice
      doctorId: insertedDoctors[0].doctorId,
      availabilityId: insertedAvail[0].availabilityId,
      appointmentDate: "2025-09-01",
      startTime: "09:00",
      endTime: "09:30",
      totalAmount: "100.00",
      appointmentStatus: "confirmed",
    },
  ];
  const insertedAppointments = await db.insert(appointments).values(appointmentData).returning();

  // --- Insert Prescriptions ---
  const prescriptionData: PrescriptionInsert[] = [
    {
      appointmentId: insertedAppointments[0].appointmentId,
      doctorId: insertedDoctors[0].doctorId,
      patientId: insertedUsers[0].userId,
      medicationName: "Aspirin",
      dosage: "500mg",
      frequency: "Twice a day",
      duration: 7,
      instructions: "Take after meals",
    },
  ];
  await db.insert(prescriptions).values(prescriptionData);

  // --- Insert Payments ---
  const paymentData: PaymentInsert[] = [
    {
      appointmentId: insertedAppointments[0].appointmentId,
      amount: "100.00",
      paymentStatus: "completed",
      transactionId: "TXN12345",
    },
  ];
  await db.insert(payments).values(paymentData);

  // --- Insert Complaints ---
  const complaintData: ComplaintInsert[] = [
    {
      userId: insertedUsers[0].userId,
      relatedAppointmentId: insertedAppointments[0].appointmentId,
      subject: "Late appointment",
      description: "Doctor was 20 minutes late.",
      status: "open",
    },
  ];
  const insertedComplaints = await db.insert(complaints).values(complaintData).returning();

  // --- Insert Complaint Replies ---
  const replyData: ComplaintReplyInsert[] = [
    {
      complaintId: insertedComplaints[0].complaintId,
      senderId: insertedUsers[1].userId, // Bob (Admin)
      message: "We apologize for the delay. We’ll ensure this doesn’t happen again.",
    },
  ];
  await db.insert(complaintReplies).values(replyData);

  console.log("✅ Seeding completed successfully!");
  console.log("👉 Login credentials for testing:");
  console.log(`   User: alice@example.com / ${plainPasswords.user}`);
  console.log(`   Admin: bob@example.com / ${plainPasswords.admin}`);
  console.log(`   Doctor: drbrown@example.com / ${plainPasswords.doctor}`);
}

seed().catch((err) => {
  console.error("❌ Seeding failed", err);
});
