import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TbLayoutDashboard, TbLogs, TbBellQuestion } from "react-icons/tb";
import { BsThreeDotsVertical, BsPersonVideo3, BsReverseLayoutSidebarInsetReverse } from "react-icons/bs";
import { FaRegFileImage, FaUsers, FaTasks } from "react-icons/fa";
import { LuFileTerminal } from "react-icons/lu";
import { VscGitPullRequestGoToChanges, VscRequestChanges } from "react-icons/vsc";
import { MdMiscellaneousServices, MdVerifiedUser, MdOutlineProductionQuantityLimits, MdOutlineAccountBox, MdErrorOutline, MdOutlinePrivacyTip, MdOutlineRequestPage } from "react-icons/md";
import { FaWpforms } from "react-icons/fa6";
import { MdDeleteOutline } from "react-icons/md";
import { AiOutlineUserDelete } from "react-icons/ai";
import { IoChatboxOutline } from "react-icons/io5";
import { GrTransaction } from "react-icons/gr";
import { PiBuildingApartment } from "react-icons/pi";
import { BiCartAdd } from "react-icons/bi";
import { CgUnavailable } from "react-icons/cg";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { FaWarehouse, FaClipboardUser } from "react-icons/fa6";
import { RiAdvertisementLine } from "react-icons/ri";
import { SlBadge } from "react-icons/sl";
import { GiRoad } from "react-icons/gi";
import { FiInfo, FiGift } from "react-icons/fi";

export default function Sidebar({ isOpen, toggleSidebar }) {
    const { permissions } = useAuth();
    const { role } = useAuth();
    const [search, setSearch] = useState("");
    const linkClasses = ({ isActive }) =>
        `flex items-center p-3 rounded-lg transition font-medium
        ${isActive
            ? "bg-[#F3F4FD] text-[black] font-[600] shadow-md rounded "
            : "text-gray-700 hover:bg-gray-200"
        }`;

    const sectionTitle = "text-xs font-semibold text-gray-500 uppercase px-3 mt-6 mb-2";

    const filterBySearch = (label) =>
        label.toLowerCase().includes(search.toLowerCase());

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
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                <div className="p-4 flex items-center gap-3">
                    <img src="/assets/admin-panel-logo.png" className="w-[175px]" />
                    {/* <h2 className="text-[25px] font-bold text-textGreen">Nadi Bahrain</h2> */}
                    {isOpen && (
                        <button
                            onClick={toggleSidebar}
                            className="ml-auto bg-gray-100 hover:bg-gray-200 p-2 rounded lg:block"
                            style={{ position: "static" }}
                            title="Toggle Sidebar"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    )}
                </div>
                <div className="px-4 pb-2 relative">
                    <input
                        type="text"
                        placeholder="Search menu..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring pr-10"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                            tabIndex={-1}
                        >
                            <MdClose size={20} />
                        </button>
                    )}
                </div>
                <nav className="p-4">
                    {permissions.includes("dashboard") && (
                        <>
                            <div className={sectionTitle}>General</div>
                            {filterBySearch("Dashboard") && (
                                <NavLink to="/" className={linkClasses}>
                                    <TbLayoutDashboard size={20} /> &nbsp;&nbsp;&nbsp;Dashboard
                                </NavLink>
                            )}
                            {filterBySearch("Account Type") && (
                                <NavLink to="/account-type" className={linkClasses}>
                                    <MdOutlineAccountBox size={20} /> &nbsp;&nbsp;&nbsp;Account Type
                                </NavLink>
                            )}
                        </>
                    )}
                    {permissions.includes("admin-list") && (
                        <>
                            <div className={sectionTitle}>Users</div>
                            {filterBySearch("Admin Users") && (
                                <NavLink to="/admin-list" className={linkClasses}>
                                    <VscGitPullRequestGoToChanges size={20} /> &nbsp;&nbsp;&nbsp;Admin Users
                                </NavLink>
                            )}
                            {filterBySearch("Roles") && (
                                <NavLink to="/roles" className={linkClasses}>
                                    <BsReverseLayoutSidebarInsetReverse size={20} /> &nbsp;&nbsp;&nbsp;Roles
                                </NavLink>
                            )}
                            {filterBySearch("Role Manager") && (
                                <NavLink to="/role-manager" className={linkClasses}>
                                    <BsPersonVideo3 size={20} /> &nbsp;&nbsp;&nbsp;Role Manager
                                </NavLink>
                            )}
                        </>
                    )}
                    {permissions.includes("admin-chat") && (
                        <>
                            <div className={sectionTitle}>Admin Chat</div>
                            {filterBySearch("Admin Chat") && (
                                <NavLink to="/admin-chat" className={linkClasses}>
                                    <IoChatboxOutline size={20} /> &nbsp;&nbsp;&nbsp;Admin Chat
                                </NavLink>
                            )}
                            {filterBySearch("User Chat") && (
                                <NavLink to="/user-chat" className={linkClasses}>
                                    <IoChatboxOutline size={20} /> &nbsp;&nbsp;&nbsp;User Chat
                                </NavLink>
                            )}
                            {filterBySearch("Technician Chat") && (
                                <NavLink to="/technician-chat" className={linkClasses}>
                                    <IoChatboxOutline size={20} /> &nbsp;&nbsp;&nbsp;Technician Chat
                                </NavLink>
                            )}
                        </>
                    )}
                    {permissions.includes("service-requests") && (
                        <>
                            <div className={sectionTitle}>Requests</div>
                            {filterBySearch("Service Requests List") && (
                                <NavLink to="/service-requests" className={linkClasses}>
                                    <VscGitPullRequestGoToChanges size={20} /> &nbsp;&nbsp;&nbsp;Service Requests List
                                </NavLink>
                            )}
                            {filterBySearch("New Requests") && (
                                <NavLink to="/new-requests" className={linkClasses}>
                                    <VscRequestChanges size={20} /> &nbsp;&nbsp;&nbsp;New Requests
                                </NavLink>
                            )}
                        </>
                    )}
                    {permissions.includes("services") && (
                        <>
                            <div className={sectionTitle}>Services</div>
                            {filterBySearch("Service List") && (
                                <NavLink to="/services" className={linkClasses}>
                                    <MdMiscellaneousServices size={20} /> &nbsp;&nbsp;&nbsp;Service List
                                </NavLink>
                            )}
                            {filterBySearch("Issues") && (
                                <NavLink to="/issues" className={linkClasses}>
                                    <MdErrorOutline size={20} /> &nbsp;&nbsp;&nbsp;Issues
                                </NavLink>
                            )}
                        </>
                    )}
                    {permissions.includes("users") && (
                        <>
                            <div className={sectionTitle}>Users</div>
                            {filterBySearch("Verified Users") && (
                                <NavLink to="/users" className={linkClasses}>
                                    <MdVerifiedUser size={20} /> &nbsp;&nbsp;&nbsp;Verified Users
                                </NavLink>
                            )}
                            {filterBySearch("Not Verified Users") && (
                                <NavLink to="/not-verified" className={linkClasses}>
                                    <CgUnavailable size={20} /> &nbsp;&nbsp;&nbsp;Not Verified Users
                                </NavLink>
                            )}
                        </>
                    )}
                    {permissions.includes("technicians") && (
                        <>
                            <div className={sectionTitle}>Technicians</div>
                            {filterBySearch("Technicians List") && (
                                <NavLink to="/technicians" className={linkClasses}>
                                    <FaUsers size={20} /> &nbsp;&nbsp;&nbsp;Technicians List
                                </NavLink>
                            )}
                            {filterBySearch("Technicians Skill List") && (
                                <NavLink to="/technician-skill" className={linkClasses}>
                                    <FaClipboardUser size={20} /> &nbsp;&nbsp;&nbsp;Technicians Skill List
                                </NavLink>
                            )}
                        </>
                    )}
                    {permissions.includes("address") && (
                        <>
                            <div className={sectionTitle}>Address</div>
                            {filterBySearch("Road Type") && (
                                <NavLink to="/road" className={linkClasses}>
                                    <GiRoad size={20} /> &nbsp;&nbsp;&nbsp;Road Type
                                </NavLink>
                            )}
                            {filterBySearch("Block Type") && (
                                <NavLink to="/block" className={linkClasses}>
                                    <PiBuildingApartment size={20} /> &nbsp;&nbsp;&nbsp;Block Type
                                </NavLink>
                            )}
                        </>
                    )}
                    {permissions.includes("points") && (
                        <>
                            <div className={sectionTitle}>Points</div>
                            {filterBySearch("Points Liste") && (
                                <NavLink to="/points" className={linkClasses}>
                                    <SlBadge size={20} /> &nbsp;&nbsp;&nbsp;Points List
                                </NavLink>
                            )}
                            {filterBySearch("User Transactions") && (
                                <NavLink to="/users-point-transactions" className={linkClasses}>
                                    <GrTransaction size={20} /> &nbsp;&nbsp;&nbsp;User Transactions
                                </NavLink>
                            )}
                            {filterBySearch("Requested Points list") && (
                                <NavLink to="/requested-points" className={linkClasses}>
                                    <MdOutlineRequestPage size={20} /> &nbsp;&nbsp;&nbsp;Requested Points list
                                </NavLink>
                            )}
                            {filterBySearch("Questionnaires List") && (
                                <NavLink to="/questionnaires" className={linkClasses}>
                                    <FaTasks size={20} /> &nbsp;&nbsp;&nbsp;Questionnaires List
                                </NavLink>
                            )}
                        </>
                    )}
                    {permissions.includes("inventory") && (
                        <>
                            <div className={sectionTitle}>Inventory</div>
                            {filterBySearch("Inventory List") && (
                                <NavLink to="/inventory" className={linkClasses}>
                                    <FaWarehouse size={20} /> &nbsp;&nbsp;&nbsp;Inventory List
                                </NavLink>
                            )}
                            {filterBySearch("Questionnaires List") && (
                                <NavLink to="/Material-Requests" className={linkClasses}>
                                    <MdOutlineProductionQuantityLimits size={20} /> &nbsp;&nbsp;&nbsp;Material Requests
                                </NavLink>
                            )}
                            {filterBySearch("Spare Parts") && (
                                <NavLink to="/spare-parts" className={linkClasses}>
                                    <BiCartAdd size={20} /> &nbsp;&nbsp;&nbsp;Spare Parts
                                </NavLink>
                            )}
                            {filterBySearch("Spare Parts Usage") && (
                                <NavLink to="/spare-parts-usage" className={linkClasses}>
                                    <BiCartAdd size={20} /> &nbsp;&nbsp;&nbsp;Spare Parts Usage
                                </NavLink>
                            )}
                        </>
                    )}
                    {permissions.includes("Settings") && (
                        <>
                            <div className={sectionTitle}>CMS</div>
                            {filterBySearch("Splash screen") && (
                                <NavLink to="/splash-screen" className={linkClasses}>
                                    <BsThreeDotsVertical size={20} /> &nbsp;&nbsp;&nbsp;Splash screen
                                </NavLink>
                            )}
                            {filterBySearch("About screen") && (
                                <NavLink to="/about-screen" className={linkClasses}>
                                    <FaRegFileImage size={20} /> &nbsp;&nbsp;&nbsp;About screen
                                </NavLink>
                            )}
                            {filterBySearch("Terms and Condition") && (
                                <NavLink to="/terms-condition" className={linkClasses}>
                                    <LuFileTerminal size={20} /> &nbsp;&nbsp;&nbsp;Terms and Condition
                                </NavLink>
                            )}
                            {filterBySearch("About") && (
                                <NavLink to="/about" className={linkClasses}>
                                    <FiInfo size={20} /> &nbsp;&nbsp;&nbsp;About
                                </NavLink>
                            )}
                            {filterBySearch("Privacy Policy") && (
                                <NavLink to="/privacy-policy" className={linkClasses}>
                                    <MdOutlinePrivacyTip size={20} /> &nbsp;&nbsp;&nbsp;Privacy Policy
                                </NavLink>
                            )}
                            {filterBySearch("Help and Support") && (
                                <NavLink to="/help-support" className={linkClasses}>
                                    <IoIosHelpCircleOutline size={20} /> &nbsp;&nbsp;&nbsp;Help and Support
                                </NavLink>
                            )}
                            {filterBySearch("Advertisements") && (
                                <NavLink to="/advertisement" className={linkClasses}>
                                    <RiAdvertisementLine size={20} /> &nbsp;&nbsp;&nbsp;Advertisements
                                </NavLink>
                            )}
                            {filterBySearch("PopUp") && (
                                <NavLink to="/popup" className={linkClasses}>
                                    <TbBellQuestion size={20} /> &nbsp;&nbsp;&nbsp;PopUp
                                </NavLink>
                            )}
                            {filterBySearch("Gifts") && (
                                <NavLink to="/gifts" className={linkClasses}>
                                    <FiGift size={20} /> &nbsp;&nbsp;&nbsp;Gifts
                                </NavLink>
                            )}
                            {filterBySearch("Deleted Account") && (
                                <NavLink to="/deleted-account" className={linkClasses}>
                                    <AiOutlineUserDelete size={20} /> &nbsp;&nbsp;&nbsp;Deleted Account
                                </NavLink>
                            )}
                            {filterBySearch("Deleted Reason") && (
                                <NavLink to="/deleted-reasons" className={linkClasses}>
                                    <MdDeleteOutline size={20} /> &nbsp;&nbsp;&nbsp;Deleted Reason
                                </NavLink>
                            )}
                            {filterBySearch("Enquiry List") && (
                                <NavLink to="/enquiry" className={linkClasses}>
                                    <FaWpforms size={20} /> &nbsp;&nbsp;&nbsp;Enquiry List
                                </NavLink>
                            )}
                        </>
                    )}
                    {permissions.includes("user-logs") && (
                        <>
                            <div className={sectionTitle}>Logs</div>
                            {filterBySearch("User Activity") && (
                                <NavLink to="/user-logs" className={linkClasses}>
                                    <TbLogs size={20} /> &nbsp;&nbsp;&nbsp;User Activity
                                </NavLink>
                            )}
                        </>
                    )}
                </nav>
            </aside>
        </>
    );
}