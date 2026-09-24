import type { Database, Student } from "./mockStore";
import { uid, registrationNumber } from "./format";
import { currentWeekKey } from "./date";

const day = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

const plusHour = (hhmm: string): string => {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  return `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

interface StudentSeed {
  name: string;
  hour: string;
}

const rosters: Record<string, StudentSeed[]> = {
  grp_1: [
    { name: "Grace Adeyemi", hour: "05:00" },
    { name: "Samuel Okonkwo", hour: "06:00" },
    { name: "Deborah Eze", hour: "12:00" },
    { name: "Emmanuel Bassey", hour: "18:00" },
    { name: "Ruth Danjuma", hour: "21:00" },
    { name: "Peter Olawale", hour: "06:30" },
  ],
  grp_2: [
    { name: "Faith Umeh", hour: "05:30" },
    { name: "Joseph Nwachukwu", hour: "07:00" },
    { name: "Blessing Etim", hour: "19:00" },
    { name: "David Okoro", hour: "20:00" },
  ],
  grp_3: [
    { name: "Mercy Effiong", hour: "05:15" },
    { name: "Isaac Adamu", hour: "06:45" },
    { name: "Comfort Ibe", hour: "13:00" },
    { name: "Victor Usman", hour: "17:30" },
  ],
};

const buildStudents = (
  groupId: string,
  sequence: number,
  phoneBase: number,
): Student[] =>
  (rosters[groupId] ?? []).map((row, i) => ({
    id: uid("stu"),
    name: row.name,
    phone: `080${String(phoneBase + i * 111111)}`,
    registrationNumber: registrationNumber(sequence, i + 1),
    groupIds: [groupId],
    hourOfPriesthood: row.hour,
    hourOfPriesthoodEnd: plusHour(row.hour),
    dateJoined: day(-40),
    isActive: !(groupId === "grp_1" && i === 5),
  }));

const poolStudents: Student[] = [
  {
    id: "stu_pool_1",
    name: "Tobi Adisa",
    phone: "08036000001",
    registrationNumber: registrationNumber(0, 1),
    groupIds: [],
    dateJoined: day(-10),
    isActive: true,
  },
  {
    id: "stu_pool_2",
    name: "Chioma Nwosu",
    phone: "08036000002",
    registrationNumber: registrationNumber(0, 2),
    groupIds: [],
    dateJoined: day(-6),
    isActive: true,
  },
  {
    id: "stu_pool_3",
    name: "Uche Bello",
    phone: "08036000003",
    registrationNumber: registrationNumber(0, 3),
    groupIds: [],
    dateJoined: day(-3),
    isActive: true,
  },
];

/** Fresh demo database. Accounts all use the password "password123". */
export const seed = (): Database => {
  const students = [
    ...buildStudents("grp_1", 1, 30000000),
    ...buildStudents("grp_2", 2, 40000000),
    ...buildStudents("grp_3", 3, 50000000),
    ...poolStudents,
  ];
  const byGroup = (groupId: string) =>
    students.filter((s) => s.groupIds.includes(groupId));
  const activeIn = (groupId: string) =>
    byGroup(groupId).filter((s) => s.isActive);
  const period = currentWeekKey();

  const attendanceEvents: Database["attendanceEvents"] = [
    {
      id: "att_1",
      name: "Wednesday Prayer Meeting",
      type: "Prayer Meeting",
      groupId: "grp_1",
      date: `${day(-3)}T18:00`,
      recurrence: "weekly",
      studentIds: activeIn("grp_1").map((s) => s.id),
      seriesId: "att_1",
    },
    {
      id: "att_2",
      name: "Doctrine Class",
      type: "Class",
      groupId: "grp_1",
      date: `${day(4)}T16:00`,
      recurrence: "none",
      studentIds: activeIn("grp_1").map((s) => s.id),
      seriesId: "att_2",
    },
    {
      id: "att_3",
      name: "Friday Prayer Meeting",
      type: "Prayer Meeting",
      groupId: "grp_2",
      date: `${day(-2)}T19:00`,
      recurrence: "weekly",
      studentIds: activeIn("grp_2").map((s) => s.id),
      seriesId: "att_3",
    },
    {
      id: "att_4",
      name: "Sunday Fellowship",
      type: "Prayer Meeting",
      groupId: "grp_3",
      date: `${day(-1)}T17:00`,
      recurrence: "weekly",
      studentIds: activeIn("grp_3").map((s) => s.id),
      seriesId: "att_4",
    },
  ];

  const assignments: Database["assignments"] = [
    {
      id: "asg_1",
      title: "Review: The Faith of Abraham",
      type: "Message Review",
      groupId: "grp_1",
      dueDate: day(-2),
      description: "Two page written review submitted to your facilitator.",
      studentIds: activeIn("grp_1").map((s) => s.id),
      recurrence: "none",
      seriesId: "asg_1",
    },
    {
      id: "asg_2",
      title: "Book Review: Pilgrim's Progress",
      type: "Book Review",
      groupId: "grp_1",
      dueDate: day(9),
      studentIds: activeIn("grp_1").map((s) => s.id),
      recurrence: "none",
      seriesId: "asg_2",
    },
    {
      id: "asg_3",
      title: "Weekly Bible Reading Review",
      type: "Bible Review",
      groupId: "grp_2",
      dueDate: day(-1),
      description: "Summarise this week's assigned chapters.",
      studentIds: activeIn("grp_2").map((s) => s.id),
      recurrence: "weekly",
      seriesId: "asg_3",
    },
    {
      id: "asg_4",
      title: "Weekly Bible Reading Review",
      type: "Bible Review",
      groupId: "grp_3",
      dueDate: day(2),
      description: "Summarise this week's assigned chapters.",
      studentIds: activeIn("grp_3").map((s) => s.id),
      recurrence: "weekly",
      seriesId: "asg_4",
    },
  ];

  const payments: Database["payments"] = students
    .filter((s) => s.isActive)
    .map((s, i) => {
      const status = i % 3 === 0 ? "unpaid" : i % 3 === 1 ? "partial" : "paid";
      const amountDue = 1000;
      const amountPaid =
        status === "paid" ? 1000 : status === "partial" ? 500 : 0;
      return {
        id: uid("pay"),
        studentId: s.id,
        groupId: s.groupIds[0] ?? "",
        period,
        amountDue,
        amountPaid,
        status,
      };
    });

  return {
    admins: [
      {
        id: "adm_1",
        name: "System Admin",
        email: "admin@tes.edu",
        password: "password123",
        phone: "08000000001",
      },
    ],
    presidents: [
      {
        id: "pre_1",
        name: "The President",
        email: "president@tes.edu",
        password: "password123",
        phone: "08000000002",
      },
    ],
    facilitators: [
      {
        id: "fac_1",
        name: "John Ibrahim",
        email: "facilitator@tes.edu",
        password: "password123",
        phone: "08000000003",
        hoursOfPriesthood: 3,
        ordinationDate: "2019-04-12",
      },
      {
        id: "fac_2",
        name: "Mary Chukwu",
        email: "mary@tes.edu",
        password: "password123",
        phone: "08000000004",
        hoursOfPriesthood: 2,
        ordinationDate: "2021-08-03",
      },
      {
        id: "fac_3",
        name: "Daniel Abiodun",
        email: "daniel@tes.edu",
        password: "password123",
        phone: "08000000005",
        hoursOfPriesthood: 1,
        ordinationDate: "2022-02-19",
      },
    ],
    cohorts: [
      {
        id: "coh_1",
        name: "2026 First Cohort",
        startDate: day(-60),
        endDate: day(60),
        facilitatorId: "fac_1",
        status: "active",
        studentIds: ["stu_pool_3"],
      },
      {
        id: "coh_2",
        name: "2025 Second Cohort",
        startDate: day(-400),
        endDate: day(-200),
        facilitatorId: "fac_1",
        status: "closed",
        studentIds: [],
      },
      {
        id: "coh_3",
        name: "2026 First Cohort",
        startDate: day(-55),
        endDate: day(65),
        facilitatorId: "fac_2",
        status: "active",
        studentIds: [],
      },
      {
        id: "coh_4",
        name: "2026 First Cohort",
        startDate: day(-50),
        endDate: day(70),
        facilitatorId: "fac_3",
        status: "active",
        studentIds: [],
      },
      {
        id: "coh_5",
        name: "March 2026 Intake",
        startDate: day(-3),
        endDate: day(90),
        status: "active",
        studentIds: [],
      },
    ],
    groups: [
      {
        id: "grp_1",
        name: "Group 1 - Bethel",
        cohortId: "coh_1",
        facilitatorIds: ["fac_1", "fac_2"],
        sequence: 1,
        isActive: true,
      },
      {
        id: "grp_2",
        name: "Group 2 - Zion",
        cohortId: "coh_3",
        facilitatorIds: ["fac_2"],
        sequence: 2,
        isActive: true,
      },
      {
        id: "grp_3",
        name: "Group 3 - Shiloh",
        cohortId: "coh_4",
        facilitatorIds: ["fac_3"],
        sequence: 3,
        isActive: true,
      },
    ],
    students,
    signInOuts: [
      {
        id: "sio_1",
        studentId: students[0]!.id,
        date: day(-1),
        signedIn: true,
        timeIn: "05:02",
        signedOut: true,
        timeOut: "06:00",
      },
      {
        id: "sio_2",
        studentId: students[1]!.id,
        date: day(-1),
        signedIn: true,
        timeIn: "06:10",
        signedOut: false,
      },
      {
        id: "sio_3",
        studentId: students[2]!.id,
        date: day(-2),
        signedIn: false,
        signedOut: false,
      },
      {
        id: "sio_4",
        studentId: students[6]!.id,
        date: day(-1),
        signedIn: true,
        timeIn: "05:31",
        signedOut: true,
        timeOut: "06:20",
      },
      {
        id: "sio_5",
        studentId: students[10]!.id,
        date: day(-1),
        signedIn: true,
        timeIn: "05:16",
        signedOut: false,
      },
    ],
    attendanceEvents,
    attendanceRecords: students
      .filter((s) => s.isActive)
      .map((s, i) => {
        const event = attendanceEvents.find((e) =>
          s.groupIds.includes(e.groupId),
        );
        return event
          ? {
              id: uid("rec"),
              attendanceEventId: event.id,
              studentId: s.id,
              date: event.date.slice(0, 10),
              attended: i % 4 !== 0,
            }
          : null;
      })
      .filter((r): r is Database["attendanceRecords"][number] => r !== null),
    assignments,
    submissions: students
      .filter((s) => s.isActive)
      .flatMap((s, i): Database["submissions"] => {
        const assignment = assignments.find(
          (a) => s.groupIds.includes(a.groupId) && a.dueDate < day(1),
        );
        if (!assignment) return [];
        const submitted = i % 3 !== 0;
        return [
          {
            id: uid("sub"),
            assignmentId: assignment.id,
            studentId: s.id,
            submitted,
            dateSubmitted: submitted ? assignment.dueDate : undefined,
            grade: submitted ? (i % 2 === 0 ? "A" : "B") : undefined,
          },
        ];
      }),
    payments,
    retreats: [
      {
        id: "ret_1",
        name: "Foundations Retreat",
        groupId: "grp_1",
        startDate: day(-20),
        endDate: day(-18),
        description: "Three-day foundations retreat for new students.",
        studentIds: activeIn("grp_1").map((s) => s.id),
        finishedAt: day(-17),
      },
      {
        id: "ret_2",
        name: "Mid-Cohort Retreat",
        groupId: "grp_2",
        startDate: day(10),
        endDate: day(12),
        description: "Mid-cohort retreat for spiritual renewal.",
        studentIds: activeIn("grp_2").map((s) => s.id),
      },
    ],
    retreatAttendance: activeIn("grp_1").map((s, i) => ({
      id: uid("rta"),
      retreatId: "ret_1",
      studentId: s.id,
      attended: i !== 1,
    })),
    weeklyClasses: [
      {
        id: "wc_1",
        name: "Doctrine Class",
        groupId: "grp_1",
        dayOfWeek: 2,
        time: "16:00",
        description: "Foundational doctrine, taught weekly.",
        studentIds: activeIn("grp_1").map((s) => s.id),
        isActive: true,
      },
      {
        id: "wc_2",
        name: "Bible Study",
        groupId: "grp_2",
        dayOfWeek: 4,
        time: "17:00",
        studentIds: activeIn("grp_2").map((s) => s.id),
        isActive: true,
      },
      {
        id: "wc_3",
        name: "Foundation Class",
        groupId: "grp_3",
        dayOfWeek: 1,
        time: "15:30",
        studentIds: activeIn("grp_3").map((s) => s.id),
        isActive: true,
      },
    ],
    weeklyClassAttendance: activeIn("grp_1").map((s, i) => ({
      id: uid("wca"),
      weeklyClassId: "wc_1",
      studentId: s.id,
      date: day(-2),
      attended: i !== 4,
    })),
    feedback: [
      {
        id: "fbk_1",
        studentId: students[0]!.id,
        groupId: "grp_1",
        facilitatorId: "fac_1",
        date: day(-5),
        message:
          "Grace shared that she's finding it easier to keep her morning priesthood hour since moving her alarm earlier. Encouraged her to keep at it.",
        createdAt: `${day(-5)}T09:00`,
      },
      {
        id: "fbk_2",
        studentId: students[3]!.id,
        groupId: "grp_1",
        facilitatorId: "fac_1",
        date: day(-2),
        message:
          "Emmanuel mentioned he's been struggling to balance assignments with work. Following up next week to see how he's coping.",
        createdAt: `${day(-2)}T14:30`,
      },
      {
        id: "fbk_3",
        studentId: students[6]!.id,
        groupId: "grp_2",
        facilitatorId: "fac_2",
        date: day(-1),
        message:
          "Faith gave great feedback on the Bible study format - asked for more group discussion time.",
        createdAt: `${day(-1)}T18:00`,
      },
    ],
    chatRooms: [
      {
        id: "room_1",
        name: "Facilitators Lounge",
        facilitatorIds: ["fac_1", "fac_2", "fac_3"],
        createdBy: "fac_1",
        createdAt: day(-10),
      },
    ],
    chatMessages: [
      {
        id: "msg_1",
        roomId: "room_1",
        senderId: "fac_1",
        text: "Morning all - quick reminder that retreat sign-ups close Friday.",
        createdAt: `${day(-2)}T08:00`,
      },
      {
        id: "msg_2",
        roomId: "room_1",
        senderId: "fac_2",
        text: "Noted, thanks! I'll pass it on to Group 2.",
        createdAt: `${day(-2)}T08:05`,
        replyToId: "msg_1",
      },
      {
        id: "msg_3",
        roomId: "room_1",
        senderId: "fac_1",
        text: "One of my students shared some helpful feedback on the Bible study format - sharing here in case it's useful for your groups too.",
        createdAt: `${day(-1)}T18:10`,
        sharedFeedbackId: "fbk_3",
      },
    ],
    waitingLists: [
      {
        id: "wl_1",
        name: "General Waiting List",
        facilitatorIds: ["fac_1"],
        studentIds: ["stu_pool_1"],
      },
    ],
    quotes: [
      {
        id: "q1",
        text: "Character is the foundation on which every gift of God rests.",
        author: "The President",
        active: true,
      },
      {
        id: "q2",
        text: "I know what will happen when I do not try. I want to see what will happen when I try.",
        author: "The President",
        active: true,
      },
      {
        id: "q3",
        text: "Discipline is not punishment; it is the shaping of destiny.",
        author: "The President",
        active: true,
      },
      {
        id: "q4",
        text: "You cannot give what you have not become. You impart who you are and not what you know",
        author: "The President",
        active: true,
      },
    ],
  };
};
