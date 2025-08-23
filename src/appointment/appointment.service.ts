import { desc, eq, sql, and, inArray } from "drizzle-orm";
import db from "../drizzle/db";
import { AppointmentInsert, appointments, AppointmentSelect, AppointmentStatus, doctors, users,doctorAvailability, DayOfWeek } from "../drizzle/schema";
import { format, addMinutes, isBefore } from "date-fns";


export const getAllAppointmentsService = async (page: number, pageSize: number): Promise<AppointmentSelect[] | null> => {
    const appointmentsList = await db.query.appointments.findMany({
        with: {
            user: {
                columns: {
                    firstName: true,
                    lastName: true,
                }
            },
            doctor: {
                with: {
                    user: {
                        columns: {
                            firstName: true,
                            lastName: true,
                            
                        }
                    },
                    specialization: true,
                    availability: true
                }
            },
            prescriptions: true,
            payments: true,
            complaints: true,
        },
        orderBy: desc(appointments.appointmentId),
    });

    return appointmentsList;
}

export const getAppointmentByIdService = async (appointmentId: number): Promise<AppointmentSelect | undefined> => {
    const appointment = await db.query.appointments.findFirst({
        where: eq(appointments.appointmentId, appointmentId),
        with: {
            user: {
                columns: {
                    firstName: true,
                    lastName: true,
                }
            },
            doctor: {
                with: {
                    user: {
                        columns: {
                            firstName: true,
                            lastName: true,
                            
                        }
                    },
                    specialization: true
                }
            },
            prescriptions: true,
            payments: true,
            complaints: true,
        },
    });

    return appointment;
}

export const createAppointmentService = async (appointment: AppointmentInsert): Promise<AppointmentSelect> => {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();

    return newAppointment;
}

export const updateAppointmentService = async (appointmentId: number, appointment: AppointmentInsert): Promise<AppointmentSelect | undefined> => {
    const [updatedAppointment] = await db.update(appointments)
        .set(appointment)
        .where(eq(appointments.appointmentId, appointmentId))
        .returning();

    return updatedAppointment;
}

export const deleteAppointmentService = async (appointmentId: number): Promise<string> => {
    await db.delete(appointments).where(eq(appointments.appointmentId, appointmentId));
    return "Appointment deleted successfully";
}

export const getAppointmentsByUserIdService = async (userId: number,page: number,pageSize: number): Promise<{ data: AppointmentSelect[]; total: number }> => {
    const appointmentsList = await db.query.appointments.findMany({
        where: eq(appointments.userId, userId),
        with: {
        user: {
            columns: {
            firstName: true,
            lastName: true,
            },
        },
        doctor: {
            with: {
            user: {
                columns: {
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                },
            },
            availability: true,
            specialization: true,
            },
        },
        prescriptions: true,
        payments: true,
        complaints: true,
        },
        orderBy: desc(appointments.appointmentId),
        offset: (page - 1) * pageSize,
        limit: pageSize,
    });

    // Total count using raw SQL count
    const totalCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(appointments)
        .where(eq(appointments.userId, userId));

    const totalCount = totalCountResult[0]?.count ?? 0;

    return {
        data: appointmentsList,
        total: totalCount,
    };
};

export const getAppointmentsByDoctorIdService = async (userId: number, page: number, pageSize: number): Promise<AppointmentSelect[] | null> => {
  // Find the doctor record linked to this userId
  const doctorRecord = await db.query.doctors.findFirst({
    where: eq(doctors.userId, userId),
    columns: { doctorId: true }
  });

  if (!doctorRecord) {
    // No doctor linked to this userId
    return null;
  }

  const doctorId = doctorRecord.doctorId;

  // Now find appointments for this doctorId
  const appointmentsList = await db.query.appointments.findMany({
    where: eq(appointments.doctorId, doctorId),
    with: {
      user: {
        columns: {
          password: false
        },
      },
      doctor: {
        
        with: {
          user: {
            columns: {
                password: false
            },
            
          },
          availability: true,
          specialization: true
        },
      },
      prescriptions: true,
      payments: true,
      complaints: true,
      
    },
    orderBy: desc(appointments.appointmentId),
    offset: (page - 1) * pageSize,
    limit: pageSize,
  });

  return appointmentsList;
};

export const updateAppointmentStatusService = async (appointmentId: number,status: AppointmentStatus): Promise<AppointmentSelect | undefined> => {
    const [updatedAppointment] = await db
        .update(appointments)
        .set({ appointmentStatus: status }) // ✅ Typed correctly
        .where(eq(appointments.appointmentId, appointmentId))
        .returning();

    return updatedAppointment;
};

export const updateAppointmentDateService = async (appointmentId: number,date: string): Promise<AppointmentSelect | undefined> => {
    const [updatedAppointment] = await db
        .update(appointments)
        .set({ appointmentDate: date })
        .where(eq(appointments.appointmentId, appointmentId))
        .returning();

    return updatedAppointment;
};

export const doctorsPatientsService = async (userId: number) => {
    const doctorRecord = await db.query.doctors.findFirst({
        where: eq(doctors.userId, userId),
        columns: { doctorId: true }
    });

    if (!doctorRecord) {
        // No doctor linked to this userId
        return null;
    }

    const doctorId = doctorRecord.doctorId;

  // Now find appointments for this doctorId
    const patients = await db.query.appointments.findMany({
        where: eq(appointments.doctorId, doctorId),
        with: {
        user: {
            columns: {
            password: false
            },
        },
        prescriptions: true,
        payments: true,
        complaints: true,
        },
        orderBy: desc(appointments.appointmentId),
    });

  return patients;
};

export const getAvailableSlotsForDoctorService = async (doctorId: number, dateStr: string) => {
    const date = new Date(dateStr);

    // Fix 1: Cast the day to enum type
    const dayOfWeek = format(date, "EEEE").toLowerCase() as DayOfWeek;

    // Get availability for that weekday
    const availability = await db.query.doctorAvailability.findFirst({
        where: and(
            eq(doctorAvailability.doctorId, doctorId),
            eq(doctorAvailability.dayOfWeek, dayOfWeek),
        ),
    });

    if (!availability) return [];

    const { startTime, endTime, slotDurationMinutes } = availability;

    // Generate all potential time slots
    const slots: string[] = [];
    let current = new Date(`${dateStr}T${startTime}`);
    const end = new Date(`${dateStr}T${endTime}`);

    while (isBefore(current, end)) {
        const slotEnd = addMinutes(current, slotDurationMinutes);
        if (isBefore(slotEnd, end) || +slotEnd === +end) {
            slots.push(format(current, "HH:mm"));
        }
        current = slotEnd;
    }

    // Fix 2: Select startTime/endTime explicitly
    const bookedAppointments = await db
        .select({
            startTime: appointments.startTime,
            endTime: appointments.endTime,
        })
        .from(appointments)
        .where(
            and(
                eq(appointments.doctorId, doctorId),
                eq(appointments.appointmentDate, dateStr),
            )
        );

    const bookedTimes = bookedAppointments.map(a =>
        format(new Date(`${dateStr}T${a.startTime}`), "HH:mm")
    );

    const availableSlots = slots.filter(slot => !bookedTimes.includes(slot));

    return availableSlots;
};

export const deleteManyAppointmentsService = async (appointmentIds: number[]): Promise<string> => {
    if (appointmentIds.length === 0) {
        throw new Error("No appointment IDs provided.");
    }

    await db.delete(appointments).where(inArray(appointments.appointmentId, appointmentIds));

    return "Appointments deleted successfully";
};
