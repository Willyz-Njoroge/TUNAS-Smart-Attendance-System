/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Link } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { supabase } from "../utils/supabaseClient";
import useUserDetails from "../hooks/useUserDetails";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { userDetails } = useUserDetails();
  const lecturerId = userDetails?.lecturer_id;

  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [view, setView] = useState("classes"); // "classes" | "students"

  useEffect(() => {
    if (!lecturerId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: classesData, error: classesError } = await supabase
          .from("classes")
          .select("course_id, course_title, course_code, date")
          .eq("lecturer_id", lecturerId)
          .order("date", { ascending: true });

        if (classesError) throw classesError;

        const courseIds = (classesData || []).map((c) => c.course_id);

        let attendeesData = [];
        if (courseIds.length > 0) {
          const { data, error: attendeesError } = await supabase
            .from("attendees")
            .select("attendee_id, course_id, student_id, matric_no, name, timestamp")
            .in("course_id", courseIds);

          if (attendeesError) throw attendeesError;
          attendeesData = data || [];
        }

        setClasses(classesData || []);
        setAttendees(attendeesData);
      } catch (error) {
        toast.error(`Error loading dashboard data: ${error.message}`);
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [lecturerId]);

  // Class-level: how many students checked in per session
  const classStats = useMemo(() => {
    return classes.map((cls) => {
      const count = attendees.filter((a) => a.course_id === cls.course_id).length;
      return {
        courseId: cls.course_id,
        label: cls.course_code || cls.course_title || `Class ${cls.course_id}`,
        title: cls.course_title,
        date: cls.date,
        checkIns: count,
      };
    });
  }, [classes, attendees]);

  // Student-level: how many of this lecturer's sessions each student attended
  const studentStats = useMemo(() => {
    const totalSessions = classes.length;
    const byStudent = {};

    attendees.forEach((a) => {
      const key = a.matric_no || `unlinked-${a.attendee_id}`;
      if (!byStudent[key]) {
        byStudent[key] = {
          matricNo: a.matric_no,
          name: a.name,
          sessionsAttended: 0,
        };
      }
      byStudent[key].sessionsAttended += 1;
    });

    return Object.values(byStudent)
      .map((s) => ({
        ...s,
        totalSessions,
        attendanceRate:
          totalSessions > 0
            ? Math.round((s.sessionsAttended / totalSessions) * 100)
            : 0,
      }))
      .sort((a, b) => b.attendanceRate - a.attendanceRate);
  }, [attendees, classes.length]);

  const summary = useMemo(() => {
    return {
      totalClasses: classes.length,
      totalCheckIns: attendees.length,
      uniqueStudents: new Set(attendees.map((a) => a.matric_no)).size,
      avgCheckInsPerClass:
        classes.length > 0
          ? (attendees.length / classes.length).toFixed(1)
          : 0,
    };
  }, [classes, attendees]);

  return (
    <section className="pb-20 pt-8 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex items-center mb-6">
        <Link to="/classDetails">
          <button className="btn btn-sm rounded-full bg-blue-500 border-none text-white">
            <span className="hidden xs:inline-flex mr-1">
              <BiArrowBack />
            </span>
            Back
          </button>
        </Link>
        <h2 className="text-center mx-auto font-bold text-2xl text-black">
          Attendance Dashboard
        </h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="loading loading-spinner bg-blue-500"></div>
        </div>
      ) : classes.length === 0 ? (
        <p className="text-center text-black">
          No classes yet. Create a class to see analytics here.
        </p>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <SummaryCard label="Classes Held" value={summary.totalClasses} />
            <SummaryCard label="Total Check-ins" value={summary.totalCheckIns} />
            <SummaryCard
              label="Unique Students"
              value={summary.uniqueStudents}
            />
            <SummaryCard
              label="Avg per Class"
              value={summary.avgCheckInsPerClass}
            />
          </div>

          {/* View toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setView("classes")}
              className={`btn btn-sm ${
                view === "classes"
                  ? "bg-[#000D46] text-white border-none"
                  : "btn-outline"
              }`}
            >
              By Class
            </button>
            <button
              onClick={() => setView("students")}
              className={`btn btn-sm ${
                view === "students"
                  ? "bg-[#000D46] text-white border-none"
                  : "btn-outline"
              }`}
            >
              By Student
            </button>
          </div>

          {view === "classes" ? (
            <div>
              <div className="bg-white rounded-xl p-4 mb-6" style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="checkIns"
                      name="Students Checked In"
                      fill="#000D46"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="text-black">
                      <th>Course Code</th>
                      <th>Title</th>
                      <th>Date</th>
                      <th>Check-ins</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStats.map((c) => (
                      <tr key={c.courseId} className="text-neutral-700">
                        <td>{c.label}</td>
                        <td>{c.title}</td>
                        <td>{c.date}</td>
                        <td>{c.checkIns}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="text-black">
                    <th>Name</th>
                    <th>Matric No</th>
                    <th>Sessions Attended</th>
                    <th>Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {studentStats.map((s) => (
                    <tr key={s.matricNo} className="text-neutral-700">
                      <td className="uppercase">{s.name}</td>
                      <td className="uppercase">{s.matricNo}</td>
                      <td>
                        {s.sessionsAttended} / {s.totalSessions}
                      </td>
                      <td>
                        <span
                          className={`font-bold ${
                            s.attendanceRate >= 75
                              ? "text-green-600"
                              : s.attendanceRate >= 50
                              ? "text-amber-600"
                              : "text-red-500"
                          }`}
                        >
                          {s.attendanceRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {studentStats.length === 0 && (
                <p className="text-center text-black mt-4">
                  No attendance recorded yet.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
};

const SummaryCard = ({ label, value }) => (
  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
    <p className="text-3xl font-bold text-[#000D46]">{value}</p>
    <p className="text-xs text-neutral-600 mt-1">{label}</p>
  </div>
);

export default Dashboard;
