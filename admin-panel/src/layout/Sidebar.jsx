import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TbLayoutDashboard, TbLogs } from "react-icons/tb";
import { BsThreeDotsVertical, BsPersonVideo3, BsReverseLayoutSidebarInsetReverse } from "react-icons/bs";
import { FaRegFileImage, FaUsers, FaTasks } from "react-icons/fa";
import { LuFileTerminal } from "react-icons/lu";
import { VscGitPullRequestGoToChanges, VscRequestChanges } from "react-icons/vsc";
import { MdMiscellaneousServices, MdVerifiedUser, MdOutlineProductionQuantityLimits, MdOutlineAccountBox, MdErrorOutline, MdOutlinePrivacyTip, MdOutlineRequestPage } from "react-icons/md";
import { GrTransaction } from "react-icons/gr";
import { PiBuildingApartment } from "react-icons/pi";
import { BiCartAdd } from "react-icons/bi";
import { CgUnavailable } from "react-icons/cg";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { FaWarehouse, FaClipboardUser } from "react-icons/fa6";
import { RiAdvertisementLine } from "react-icons/ri";
import { SlBadge } from "react-icons/sl";
import { GiRoad } from "react-icons/gi";
import { FiInfo } from "react-icons/fi";

export default function Sidebar({ isOpen, toggleSidebar }) {
    const { permissions } = useAuth();
    const { role } = useAuth();
    const linkClasses = ({ isActive }) =>
        `flex items-center p-3 rounded-lg transition font-medium
        ${isActive
            ? "bg-[#F3F4FD] text-[black] font-[600] shadow-md rounded "
            : "text-gray-700 hover:bg-gray-200"
        }`;

    const sectionTitle = "text-xs font-semibold text-gray-500 uppercase px-3 mt-6 mb-2";

    return (
        <>
            {isOpen && (
                <div
                    onClick={toggleSidebar}
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                />
            )}

            <aside
                className={`
                    fixed left-0 top-0 h-full bg-white shadow-lg z-40 w-64 
                    transform transition-transform duration-300 overflow-y-scroll
                    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                <div className="p-4 flex items-center gap-3">
                    <img src="/assets/Favicon.webp" className="w-10" /><h2 className="text-[25px] font-bold text-textGreen">Nadi Buhrain</h2>
                </div>

                <nav className="p-4">
                    {permissions.includes("dashboard") && (
                        <>
                            <div className={sectionTitle}>General</div>
                            <NavLink to="/" className={linkClasses}>
                                <TbLayoutDashboard size={20} /> &nbsp;&nbsp;&nbsp;Dashboard
                            </NavLink>
                            <NavLink to="/account-type" className={linkClasses}>
                                <MdOutlineAccountBox size={20} /> &nbsp;&nbsp;&nbsp;Account Type
                            </NavLink>
                        </>
                    )}
                    {permissions.includes("admin-list") && (
                        <>
                            <div className={sectionTitle}>Users</div>
                            <NavLink to="/admin-list" className={linkClasses}>
                                <VscGitPullRequestGoToChanges size={20} /> &nbsp;&nbsp;&nbsp;Admin Users
                            </NavLink>
                            <NavLink to="/roles" className={linkClasses}>
                                <BsReverseLayoutSidebarInsetReverse size={20} /> &nbsp;&nbsp;&nbsp;Roles
                            </NavLink>
                            <NavLink to="/role-manager" className={linkClasses}>
                                <BsPersonVideo3 size={20} /> &nbsp;&nbsp;&nbsp;Role Manager
                            </NavLink>
                        </>
                    )}
                    {permissions.includes("service-requests") && (
                        <>
                            <div className={sectionTitle}>Requests</div>
                            <NavLink to="/service-requests" className={linkClasses}>
                                <VscGitPullRequestGoToChanges size={20} /> &nbsp;&nbsp;&nbsp;Service Requests List
                            </NavLink>
                            <NavLink to="/new-requests" className={linkClasses}>
                                <VscRequestChanges size={20} /> &nbsp;&nbsp;&nbsp;New Requests
                            </NavLink>
                        </>
                    )}
                    {permissions.includes("services") && (
                        <>
                            <div className={sectionTitle}>Services</div>
                            <NavLink to="/services" className={linkClasses}>
                                <MdMiscellaneousServices size={20} /> &nbsp;&nbsp;&nbsp;Service List
                            </NavLink>
                            <NavLink to="/issues" className={linkClasses}>
                                <MdErrorOutline size={20} /> &nbsp;&nbsp;&nbsp;Issues
                            </NavLink>
                        </>
                    )}
                    {permissions.includes("users") && (
                        <>
                            <div className={sectionTitle}>Users</div>
                            <NavLink to="/users" className={linkClasses}>
                                <MdVerifiedUser size={20} /> &nbsp;&nbsp;&nbsp;Verified Users
                            </NavLink>
                            <NavLink to="/not-verified" className={linkClasses}>
                                <CgUnavailable size={20} /> &nbsp;&nbsp;&nbsp;Not Verified Users
                            </NavLink>
                        </>
                    )}
                    {permissions.includes("technicians") && (
                        <>
                            <div className={sectionTitle}>Technicians</div>
                            <NavLink to="/technicians" className={linkClasses}>
                                <FaUsers size={20} /> &nbsp;&nbsp;&nbsp;Technicians List
                            </NavLink>
                            <NavLink to="/technician-skill" className={linkClasses}>
                                <FaClipboardUser size={20} /> &nbsp;&nbsp;&nbsp;Technicians Skill List
                            </NavLink>
                        </>
                    )}
                    {permissions.includes("address") && (
                        <>
                            <div className={sectionTitle}>Address</div>
                            <NavLink to="/road" className={linkClasses}>
                                <GiRoad size={20} /> &nbsp;&nbsp;&nbsp;Road Type
                            </NavLink>
                            <NavLink to="/block" className={linkClasses}>
                                <PiBuildingApartment size={20} /> &nbsp;&nbsp;&nbsp;Block Type
                            </NavLink>
                        </>
                    )}
                    {permissions.includes("points") && (
                        <>
                            <div className={sectionTitle}>Points</div>
                            <NavLink to="/points" className={linkClasses}>
                                <SlBadge size={20} /> &nbsp;&nbsp;&nbsp;Points List
                            </NavLink>
                            <NavLink to="/users-point-transactions" className={linkClasses}>
                                <GrTransaction size={20} /> &nbsp;&nbsp;&nbsp;User Transactions
                            </NavLink>
                            <NavLink to="/requested-points" className={linkClasses}>
                                <MdOutlineRequestPage size={20} /> &nbsp;&nbsp;&nbsp;Requested Points list
                            </NavLink>
                            <NavLink to="/questionnaires" className={linkClasses}>
                                <FaTasks size={20} /> &nbsp;&nbsp;&nbsp;Questionnaires List
                            </NavLink>
                        </>
                    )}
                    {permissions.includes("inventory") && (
                        <>
                            <div className={sectionTitle}>Inventory</div>
                            <NavLink to="/inventory" className={linkClasses}>
                                <FaWarehouse size={20} /> &nbsp;&nbsp;&nbsp;Inventory List
                            </NavLink>
                            <NavLink to="/material-requests" className={linkClasses}>
                                <MdOutlineProductionQuantityLimits size={20} /> &nbsp;&nbsp;&nbsp;Material Requests
                            </NavLink>
                            <NavLink to="/spare-parts" className={linkClasses}>
                                <BiCartAdd size={20} /> &nbsp;&nbsp;&nbsp;Spare Parts
                            </NavLink>
                        </>
                    )}
                    {permissions.includes("Settings") && (
                        <>
                            <div className={sectionTitle}>CMS</div>
                            <NavLink to="/splash-screen" className={linkClasses}>
                                <BsThreeDotsVertical size={20} /> &nbsp;&nbsp;&nbsp;Splash screen
                            </NavLink>
                            <NavLink to="/about-screen" className={linkClasses}>
                                <FaRegFileImage size={20} /> &nbsp;&nbsp;&nbsp;About screen
                            </NavLink>
                            <NavLink to="/terms-condition" className={linkClasses}>
                                <LuFileTerminal size={20} /> &nbsp;&nbsp;&nbsp;Terms and Condition
                            </NavLink>
                            <NavLink to="/about" className={linkClasses}>
                                <FiInfo size={20} /> &nbsp;&nbsp;&nbsp;About
                            </NavLink>
                            <NavLink to="/privacy-policy" className={linkClasses}>
                                <MdOutlinePrivacyTip size={20} /> &nbsp;&nbsp;&nbsp;Privacy Policy
                            </NavLink>
                            <NavLink to="/help-support" className={linkClasses}>
                                <IoIosHelpCircleOutline size={20} /> &nbsp;&nbsp;&nbsp;Help and Support
                            </NavLink>
                            <NavLink to="/advertisement" className={linkClasses}>
                                <RiAdvertisementLine size={20} /> &nbsp;&nbsp;&nbsp;Advertisements
                            </NavLink>
                            <NavLink to="/popup" className={linkClasses}>
                                <RiAdvertisementLine size={20} /> &nbsp;&nbsp;&nbsp;PopUp
                            </NavLink>
                        </>
                    )}
                    {permissions.includes("user-logs") && (
                        <>
                            <div className={sectionTitle}>Logs</div>
                            <NavLink to="/user-logs" className={linkClasses}>
                                <TbLogs size={20} /> &nbsp;&nbsp;&nbsp;User Activity
                            </NavLink>
                        </>
                    )}
                </nav>
            </aside>
        </>
    );
}