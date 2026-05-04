import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { attendanceChart, performanceChart } from "../data/mockData";

const roleSplit = [
  { name: "Students", value: 420 },
  { name: "Faculty", value: 48 },
  { name: "Admins", value: 6 },
];

const COLORS = ["#2563eb", "#7c3aed", "#f59e0b"];

export default function AdminDashboard({ currentUser, onLogout }) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome, {currentUser?.usn || "Admin"}.</p>
        </div>
        <button type="button" onClick={onLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold">
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Platform Role Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleSplit} dataKey="value" nameKey="name" outerRadius={90} label>
                  {roleSplit.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[roleSplit.indexOf(entry) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Attendance Overview</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceChart}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attendance" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Performance Overview</h2>
          <div className="grid md:grid-cols-5 gap-3">
            {performanceChart.map((item) => (
              <div key={item.subject} className="bg-indigo-50 rounded-xl p-4 text-center">
                <div className="text-sm text-gray-600">{item.subject}</div>
                <div className="text-2xl font-black text-indigo-600">{item.score}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
