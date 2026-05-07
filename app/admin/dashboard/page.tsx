import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { redirect } from "next/navigation";

import DeleteUserButton from "../DeleteUser";
import DeleteTripButton from "../DeleteTrip";

import {
  FiArrowLeft,
  FiSearch,
  FiUsers,
  FiMap,
  FiCalendar,
} from "react-icons/fi";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: {
    page?: string;
  };
}) {
  const session = await getServerSession(authOptions);

  if (!(session?.user as any)?.isAdmin) {
    redirect("/dashboard");
  }

  // ===== PAGINATION =====
  const currentPage = Number(searchParams.page) || 1;
  const perPage = 15;

  const totalUsers = await prisma.user.count();

  const totalPages = Math.ceil(totalUsers / perPage);

  // ===== USERS =====
  const users = await prisma.user.findMany({
    skip: (currentPage - 1) * perPage,
    take: perPage,
    orderBy: {
      createdAt: "desc",
    },
  });

  // ===== TRIPS =====
  const trips = await prisma.trip.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 15,
  });

  return (
    <div className="min-h-screen bg-[#f6f8fb]">

      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#edf1f3]">

        <div className="max-w-[1600px] mx-auto h-[74px] px-5 lg:px-8 flex items-center justify-between gap-5">

          {/* LEFT */}
          <div className="flex items-center gap-5">

            {/* GO BACK */}
            <button
              className="
                h-[42px]
                px-4
                rounded-xl
                border border-[#e7ebee]
                bg-white
                hover:bg-[#f8fafc]
                hover:border-[#d7dee3]
                transition-all
                text-sm
                font-medium
                text-[#0f172a]
                flex items-center gap-2
              "
            >
              <FiArrowLeft size={16} />
              Go Back
            </button>

            {/* LOGO */}
            <div className="hidden md:flex items-center gap-3">

              <div className="w-10 h-10 rounded-full bg-[#16a34a] flex items-center justify-center text-white font-semibold text-sm">
                SH
              </div>

              <div>
                <h1 className="text-[22px] font-bold tracking-tight text-[#15803d]">
                  SOLO-
                  <span className="text-[#0f172a]">
                    HIKER
                  </span>
                </h1>
              </div>
            </div>
          </div>

          {/* SEARCH */}
          <div className="hidden md:block flex-1 max-w-[580px]">

            <div className="relative">

              <input
                type="text"
                placeholder="Search users, trips, bookings..."
                className="
                  w-full
                  h-[46px]
                  bg-white
                  border border-[#e7ebee]
                  rounded-2xl
                  pl-5 pr-12
                  text-[14px]
                  text-[#0f172a]
                  placeholder:text-[#94a3b8]
                  focus:outline-none
                  focus:border-[#16a34a]
                  focus:ring-4
                  focus:ring-green-100
                  transition-all
                "
              />

              <FiSearch
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-[#94a3b8]
                "
                size={18}
              />
            </div>
          </div>

          {/* ADMIN */}
          <div className="flex items-center gap-3">

            <div
              className="
                w-11 h-11
                rounded-full
                bg-[#16a34a]
                flex items-center justify-center
                text-white
                font-semibold
                text-sm
              "
            >
              A
            </div>

            <div className="hidden sm:block">
              <p className="text-[14px] font-semibold text-[#0f172a]">
                Admin User
              </p>

              <p className="text-[12px] text-[#64748b]">
                Super Admin
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="max-w-[1500px] mx-auto px-6 lg:px-10 py-8">

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

          {[
            {
              title: "Total Users",
              value: totalUsers,
              icon: <FiUsers size={18} />,
            },
            {
              title: "Active Users",
              value: Math.floor(totalUsers * 0.73),
              icon: <FiUsers size={18} />,
            },
            {
              title: "Total Trips",
              value: trips.length,
              icon: <FiMap size={18} />,
            },
            {
              title: "Upcoming Trips",
              value: Math.floor(trips.length * 0.4),
              icon: <FiCalendar size={18} />,
            },
          ].map((stat) => (

            <div
              key={stat.title}
              className="
                bg-white
                rounded-[22px]
                border border-[#edf0f2]
                p-5
              "
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-[13px] text-[#64748b] mb-2">
                    {stat.title}
                  </p>

                  <h2 className="text-[30px] leading-none font-semibold text-[#0f172a]">
                    {stat.value}
                  </h2>
                </div>

                <div
                  className="
                    w-11 h-11
                    rounded-xl
                    bg-green-50
                    text-[#16a34a]
                    flex items-center justify-center
                  "
                >
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= USERS TABLE ================= */}
        <div
          className="
            bg-white
            rounded-[24px]
            border border-[#edf0f2]
            overflow-hidden
            mb-6
          "
        >

          {/* TOP */}
          <div
            className="
              px-6 py-5
              border-b border-[#edf0f2]
              flex flex-col lg:flex-row
              lg:items-center
              justify-between
              gap-4
            "
          >

            <div>
              <h2 className="text-[20px] font-semibold text-[#0f172a]">
                All Users
              </h2>

              <p className="text-[13px] text-[#64748b] mt-1">
                Manage all registered hikers
              </p>
            </div>

            {/* FILTERS */}
            <div className="flex flex-col sm:flex-row gap-3">

              <div className="relative">

                <input
                  placeholder="Search users..."
                  className="
                    h-[42px]
                    w-full sm:w-[220px]
                    border border-[#e7ebee]
                    rounded-l
                    pl-6 pr-12
                    text-[14px]
                    focus:outline-none
                    focus:border-[#16a34a]
                    focus:ring-4
                    focus:ring-green-100
                    transition-all
                  "
                />

                <FiSearch
                  size={16}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-[#94a3b8]
                  "
                />
              </div>

              <select
                className="
                  h-[42px]
                  px-4
                  rounded-xl
                  border border-[#e7ebee]
                  text-[14px]
                  text-[#475569]
                  focus:outline-none
                "
              >
                <option>All Levels</option>
                <option>BEGINNER</option>
                <option>INTERMEDIATE</option>
                <option>ADVANCED</option>
              </select>

              <select
                className="
                  h-[42px]
                  px-5
                  rounded-l
                  border border-[#e7ebee]
                  text-[14px]
                  text-[#475569]
                  focus:outline-none
                "
              >
                <option>All Roles</option>
                <option>Admin</option>
                <option>User</option>
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px]">

              <thead className="bg-[#f8fafc] border-b border-[#edf0f2]">

                <tr>

                  {[
                    "USER",
                    "EMAIL",
                    "LEVEL",
                    "ROLE",
                    "JOINED",
                    "STATUS",
                    "ACTION",
                  ].map((head) => (

                    <th
                      key={head}
                      className="
                        text-left
                        px-6 py-4
                        text-[12px]
                        font-semibold
                        text-[#94a3b8]
                        tracking-wide
                      "
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>

                {users.map((user) => (

                  <tr
                    key={user.id}
                    className="
                      border-b border-[#f1f5f9]
                      hover:bg-[#fafafa]
                      transition-all
                    "
                  >

                    {/* USER */}
                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                      

                        <div>
                          <p className="text-[14px] font-medium text-[#0f172a]">
                            {user.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* EMAIL */}
                    <td className="px-6 py-5 text-[14px] text-[#64748b]">
                      {user.email}
                    </td>

                    {/* LEVEL */}
                    <td className="px-6 py-5">

                      <span
                        className={`
                          text-[12px]
                          px-3 py-1
                          rounded-lg
                          font-medium

                          ${
                            user.hikingLevel === "ADVANCED"
                              ? "bg-green-100 text-green-700"
                              : user.hikingLevel === "INTERMEDIATE"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }
                        `}
                      >
                        {user.hikingLevel}
                      </span>
                    </td>

                    {/* ROLE */}
                    <td className="px-6 py-5">

                      <span
                        className={`
                          text-[12px]
                          px-3 py-1
                          rounded-lg
                          font-medium

                          ${
                            (user as any).isAdmin
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }
                        `}
                      >
                        {(user as any).isAdmin ? "Admin" : "User"}
                      </span>
                    </td>

                    {/* DATE */}
                    <td className="px-6 py-5 text-[14px] text-[#64748b]">

                      {new Date(user.createdAt).toLocaleDateString(
                        "en-PK",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-5">

                      <div className="flex items-center gap-2">

                        <div className="w-2 h-2 rounded-full bg-green-500"></div>

                        <span className="text-[14px] text-green-600 font-medium">
                          Active
                        </span>
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-5">
                      <DeleteUserButton userId={user.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div
            className="
              px-6 py-4
              flex flex-col sm:flex-row
              items-center
              justify-between
              gap-4
            "
          >

            <p className="text-[13px] text-[#64748b]">
              Showing {(currentPage - 1) * perPage + 1}–
              {Math.min(currentPage * perPage, totalUsers)} of {totalUsers}
            </p>

            <div className="flex items-center gap-2">

              {Array.from({
                length: totalPages,
              }).map((_, i) => (

                <Link
                  key={i}
                  href={`?page=${i + 1}`}
                  className={`
                    w-9 h-9
                    rounded-full
                    flex items-center justify-center
                    text-sm
                    transition-all

                    ${
                      currentPage === i + 1
                        ? "bg-[#16a34a] text-white"
                        : "bg-white border border-[#e2e8f0] text-[#475569] hover:border-[#16a34a]"
                    }
                  `}
                >
                  {i + 1}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ================= TRIPS TABLE ================= */}
        <div
          className="
            bg-white
            rounded-[24px]
            border border-[#edf0f2]
            overflow-hidden
          "
        >

          {/* TOP */}
          <div
            className="
              px-6 py-5
              border-b border-[#edf0f2]
              flex items-center justify-between
            "
          >

            <div>

              <h2 className="text-[20px] font-semibold text-[#0f172a]">
                Recent Trips
              </h2>

              <p className="text-[13px] text-[#64748b] mt-1">
                Latest hiking trips created on platform
              </p>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px]">

              <thead className="bg-[#f8fafc] border-b border-[#edf0f2]">

                <tr>

                  {[
                    "TRIP",
                    "LOCATION",
                    "DIFFICULTY",
                    "DATE",
                    "ACTION",
                  ].map((head) => (

                    <th
                      key={head}
                      className="
                        text-left
                        px-6 py-4
                        text-[12px]
                        font-semibold
                        text-[#94a3b8]
                        tracking-wide
                      "
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>

                {trips.map((trip) => (

                  <tr
                    key={trip.id}
                    className="
                      border-b border-[#f1f5f9]
                      hover:bg-[#fafafa]
                      transition-all
                    "
                  >

                    {/* TRIP */}
                    <td className="px-6 py-5">

                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-[14px] font-medium text-[#0f172a]">
                            {trip.title}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* LOCATION */}
                    <td className="px-6 py-5 text-[14px] text-[#64748b]">
                      {trip.location}
                    </td>

                    {/* DIFFICULTY */}
                    <td className="px-6 py-5">

                      <span
                        className={`
                          text-[12px]
                          px-3 py-1
                          rounded-lg
                          font-medium

                          ${
                            trip.difficulty === "EXPERT"
                              ? "bg-red-100 text-red-600"
                              : trip.difficulty === "MODERATE"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-green-100 text-green-600"
                          }
                        `}
                      >
                        {trip.difficulty}
                      </span>
                    </td>

                    {/* DATE */}
                    <td className="px-6 py-5 text-[14px] text-[#64748b]">

                      {new Date(trip.createdAt).toLocaleDateString(
                        "en-PK",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-5">
                      <DeleteTripButton tripId={trip.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}