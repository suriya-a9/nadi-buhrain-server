import { BrowserRouter, Routes, Route } from "react-router-dom";
import PermissionRoute from "./components/PermissionRoute";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import DashboardLayout from "./layout/DashboardLayout";
import { AuthProvider } from "./context/AuthContext";
import Services from "./pages/Services";
import PrivateRoute from "./components/PrivateRoute";
import User from "./pages/User";
import Technicians from "./pages/Technicians";
import NotVerifiedUser from "./pages/NotVerifiedUser";
import Intro from "./pages/Intro";
import LoadingScreen from "./pages/LoadingScreen";
import ServiceRequest from "./pages/ServiceRequest";
import ServiceRequestList from "./pages/ServiceRequestList";
import Points from "./pages/Points";
import NotFound from "./pages/NotFound";
import Logs from "./pages/Logs";
import Inventory from "./pages/Inventory";
import MaterialRequests from "./pages/MaterialRequests";
import SpareParts from "./pages/SpareParts";
import TechnicianSkills from "./pages/TechnicianSkillSet";
import TermsAndCondition from "./pages/TermsAndCondition";
import Issues from "./pages/Issues";
import AccountType from "./pages/AccountType";
import Road from "./pages/Road";
import Block from "./pages/Block";
import ServiceRequestDetails from "./pages/ServiceRequestDetails";
import AdminUser from "./pages/AdminUser";
import RoleManager from "./pages/RoleManager";
import Roles from "./pages/Roles";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AddUser from "./pages/AddUser";
import UserResetPassword from "./pages/UserResetPassword";
import TechnicianResetPassword from "./pages/TechnicianResetPassword";
import Questionnaire from "./pages/Questionnaire";
import QuestionnaireDetail from "./pages/QuestionnaireDetail";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import HelpAndSupport from "./pages/HelpAndSupport";
import NewServiceRequestDetails from "./pages/NewServiceRequestDetails";
import ProductDetails from "./pages/ProductDetails";
import RequestPoints from "./pages/RequestPoints";
import UserDetails from "./pages/UserDetails";
import NotVerifiedUserDetails from "./pages/NotVerifiedUserDetails";
import UserPointTransaction from "./pages/UserPointTransaction";
import Advertisement from "./pages/Advertisement";
import PopUpQuestionnaire from "./pages/PopUpQuestionnaire";
import PopUpQuestionnaireDetail from "./pages/PopUpQuestionnaireDetail";
import AdminChatList from "./pages/AdminChatList";
import UserChatList from "./pages/UserChatList";
import DeletedAccounts from "./pages/DeletedAccounts";
import DeletedReasons from "./pages/DeletedReasons";
import Enquiry from "./pages/Enquiry";
import SparePartsUsage from "./pages/SparePartsUsage";
import TechnicianChatList from "./pages/TechnicianChatList";

export default function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password/:token"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/user/reset-password/:token"
              element={
                <PublicRoute>
                  <UserResetPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/technician/reset-password/:token"
              element={
                <PublicRoute>
                  <TechnicianResetPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <PermissionRoute permission="dashboard">
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </PermissionRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/account-type"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="dashboard">
                    <DashboardLayout>
                      <AccountType />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/admin-list"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="admin-list">
                    <DashboardLayout>
                      <AdminUser />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/roles"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="admin-list">
                    <DashboardLayout>
                      <Roles />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/role-manager"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="admin-list">
                    <DashboardLayout>
                      <RoleManager />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin-chat"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="admin-chat">
                    <DashboardLayout>
                      <AdminChatList />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/user-chat"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="admin-chat">
                    <DashboardLayout>
                      <UserChatList />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/technician-chat"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="admin-chat">
                    <DashboardLayout>
                      <TechnicianChatList />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/service-requests"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="service-requests">
                    <DashboardLayout>
                      <ServiceRequestList />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/service-requests/:id"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="service-requests">
                    <DashboardLayout>
                      <ServiceRequestDetails />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/new-requests/:id"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="service-requests">
                    <DashboardLayout>
                      <NewServiceRequestDetails />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/new-requests"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="service-requests">
                    <DashboardLayout>
                      <ServiceRequest />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/services"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="services">
                    <DashboardLayout>
                      <Services />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/issues"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="services">
                    <DashboardLayout>
                      <Issues />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="users">
                    <DashboardLayout>
                      <User />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/users/:id"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="users">
                    <DashboardLayout>
                      <UserDetails />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/not-verified/:id"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="users">
                    <DashboardLayout>
                      <NotVerifiedUserDetails />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/add-user"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="users">
                    <DashboardLayout>
                      <AddUser />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/not-verified"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="users">
                    <DashboardLayout>
                      <NotVerifiedUser />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/technicians"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="technicians">
                    <DashboardLayout>
                      <Technicians />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/technician-skill"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="technicians">
                    <DashboardLayout>
                      <TechnicianSkills />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/road"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="address">
                    <DashboardLayout>
                      <Road />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/block"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="address">
                    <DashboardLayout>
                      <Block />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/points"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="points">
                    <DashboardLayout>
                      <Points />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/users-point-transactions"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="points">
                    <DashboardLayout>
                      <UserPointTransaction />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/requested-points"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="points">
                    <DashboardLayout>
                      <RequestPoints />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/questionnaires"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="points">
                    <DashboardLayout>
                      <Questionnaire />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/questionnaire/:id"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="points">
                    <DashboardLayout>
                      <QuestionnaireDetail />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="inventory">
                    <DashboardLayout>
                      <Inventory />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/inventory/:id"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="inventory">
                    <DashboardLayout>
                      <ProductDetails />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/material-requests"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="inventory">
                    <DashboardLayout>
                      <MaterialRequests />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/spare-parts"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="inventory">
                    <DashboardLayout>
                      <SpareParts />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/spare-parts-usage"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="inventory">
                    <DashboardLayout>
                      <SparePartsUsage />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/splash-screen"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="Settings">
                    <DashboardLayout>
                      <LoadingScreen />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/about-screen"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="Settings">
                    <DashboardLayout>
                      <Intro />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/terms-condition"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="Settings">
                    <DashboardLayout>
                      <TermsAndCondition />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/about"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="Settings">
                    <DashboardLayout>
                      <About />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/privacy-policy"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="Settings">
                    <DashboardLayout>
                      <PrivacyPolicy />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/help-support"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="Settings">
                    <DashboardLayout>
                      <HelpAndSupport />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/advertisement"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="Settings">
                    <DashboardLayout>
                      <Advertisement />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/popup"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="Settings">
                    <DashboardLayout>
                      <PopUpQuestionnaire />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/deleted-account"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="Settings">
                    <DashboardLayout>
                      <DeletedAccounts />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/deleted-reasons"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="Settings">
                    <DashboardLayout>
                      <DeletedReasons />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/enquiry"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="Settings">
                    <DashboardLayout>
                      <Enquiry />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/popup/:id"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="points">
                    <DashboardLayout>
                      <PopUpQuestionnaireDetail />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/user-logs"
              element={
                <PrivateRoute>
                  <PermissionRoute permission="user-logs">
                    <DashboardLayout>
                      <Logs />
                    </DashboardLayout>
                  </PermissionRoute>
                </PrivateRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <Toaster position="top-right" reverseOrder={false} duration={2000} />
    </>
  );
}