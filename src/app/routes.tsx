import { Route, Routes } from "react-router-dom";
import { LandingPage } from "@/features/home";
import {
  LoginAdminPage,
  LoginPresidentPage,
  LoginFacilitatorPage,
} from "@/features/auth";
import { DashboardPage } from "@/features/dashboard";
import { CohortsPage, CohortDetailPage } from "@/features/cohorts";
import { GroupsPage, GroupDetailPage } from "@/features/groups";
import { StudentsPage, StudentProfilePage } from "@/features/students";
import { SignInOutPage } from "@/features/signinout";
import { AttendancePage, AttendanceEventPage } from "@/features/attendance";
import { AssignmentsPage, AssignmentDetailPage } from "@/features/assignments";
import { RetreatsPage } from "@/features/retreats";
import {
  WeeklyClassesPage,
  WeeklyClassDetailPage,
} from "@/features/weekly-classes";
import { FeedbackPage } from "@/features/feedback";
import { ChatRoomsPage, ChatRoomPage } from "@/features/chat";
import {
  WaitingListsPage,
  WaitingListDetailPage,
} from "@/features/waiting-list";
import { RedundantStudentsPage } from "@/features/redundant-students";
import { AnalyticsPage } from "@/features/analytics";
import { ReportsPage } from "@/features/reports";
import { PaymentsPage } from "@/features/payments";
import { FacilitatorsPage } from "@/features/facilitators";
import { NotFoundPage } from "@/features/not-found";
import { ProtectedRoute } from "./ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login/admin" element={<LoginAdminPage />} />
      <Route path="/login/president" element={<LoginPresidentPage />} />
      <Route path="/login/facilitator" element={<LoginFacilitatorPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Cohorts are the intake batch students are placed into before a group. */}
      <Route
        path="/cohorts"
        element={
          <ProtectedRoute>
            <CohortsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cohorts/:cohortId"
        element={
          <ProtectedRoute>
            <CohortDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Groups are the hub every other feature is reached through. */}
      <Route
        path="/groups"
        element={
          <ProtectedRoute>
            <GroupsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:groupId"
        element={
          <ProtectedRoute>
            <GroupDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:groupId/students"
        element={
          <ProtectedRoute>
            <StudentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:groupId/signinout"
        element={
          <ProtectedRoute>
            <SignInOutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:groupId/attendance"
        element={
          <ProtectedRoute>
            <AttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:groupId/attendance/:eventId"
        element={
          <ProtectedRoute>
            <AttendanceEventPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:groupId/assignments"
        element={
          <ProtectedRoute>
            <AssignmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:groupId/assignments/:assignmentId"
        element={
          <ProtectedRoute>
            <AssignmentDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:groupId/retreats"
        element={
          <ProtectedRoute>
            <RetreatsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:groupId/classes"
        element={
          <ProtectedRoute>
            <WeeklyClassesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:groupId/classes/:classId"
        element={
          <ProtectedRoute>
            <WeeklyClassDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:groupId/feedback"
        element={
          <ProtectedRoute>
            <FeedbackPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:groupId/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />

      {/* A student's profile isn't tied to one group - they can be in several. */}
      <Route
        path="/students/:studentId"
        element={
          <ProtectedRoute>
            <StudentProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Facilitator-only: chat isn't tied to groups. */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute roles={["facilitator"]}>
            <ChatRoomsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:roomId"
        element={
          <ProtectedRoute roles={["facilitator"]}>
            <ChatRoomPage />
          </ProtectedRoute>
        }
      />

      {/* Org-wide overviews across every group. */}
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback"
        element={
          <ProtectedRoute>
            <FeedbackPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/waiting-list"
        element={
          <ProtectedRoute>
            <WaitingListsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/waiting-list/:waitingListId"
        element={
          <ProtectedRoute>
            <WaitingListDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/redundant-students"
        element={
          <ProtectedRoute>
            <RedundantStudentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/facilitators"
        element={
          <ProtectedRoute roles={["president", "admin"]}>
            <FacilitatorsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute roles={["admin"]}>
            <PaymentsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
