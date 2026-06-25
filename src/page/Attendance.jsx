import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Input from "../component/Input";
import { supabase } from "../utils/supabaseClient";
import toast from "react-hot-toast";
import Spinner from "../component/Spinner";
import dayjs from "dayjs";
import logo from "/trackAS.png";

const Attendance = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const courseId = queryParams.get("courseId");
  const courseCode = queryParams.get("courseCode");

  const [isLoading, setIsLoading] = useState(false);
  const [classDetails, setClassDetails] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const [matricNumber, setMatricNumber] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (!courseId) {
      setFetchError(true);
      return;
    }

    const fetchClassDetails = async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("course_id", courseId)
        .single();

      if (error) {
        console.error("Error fetching class details:", error);
        setFetchError(true);
      } else {
        setClassDetails(data);
      }
    };

    fetchClassDetails();
  }, [courseId]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (!matricNumber.trim()) {
      toast.error("Matriculation number is required.");
      return;
    }

    setIsLoading(true);
    try {
      // Check for duplicate matric number in this class
      const { data: existing, error: fetchErr } = await supabase
        .from("attendees")
        .select("matric_no")
        .eq("course_id", courseId)
        .ilike("matric_no", matricNumber.trim().toUpperCase());

      if (fetchErr) throw fetchErr;

      if (existing && existing.length > 0) {
        toast.error("This matriculation number has already been registered for this class.");
        return;
      }

      const { error: insertError } = await supabase
        .from("attendees")
        .insert([
          {
            course_id: courseId,
            matric_no: matricNumber.trim().toUpperCase(),
            name: name.trim().toUpperCase(),
            timestamp: new Date().toISOString(),
          },
        ]);

      if (insertError) throw insertError;

      // Pass student name to success page so the message is personalised
      navigate("/success", {
        replace: true,
        state: { name: name.trim(), courseCode: courseCode || classDetails?.course_code },
      });
    } catch (err) {
      toast.error(`Error marking attendance: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Invalid QR / missing params
  if (fetchError) {
    return (
      <section className="h-screen grid place-items-center bg-red-50">
        <div className="bg-white px-8 py-10 rounded-xl shadow-lg text-center max-w-sm">
          <p className="text-4xl mb-4">❌</p>
          <h2 className="text-xl font-bold text-red-700 mb-2">Invalid QR Code</h2>
          <p className="text-gray-600 text-sm">
            This QR code doesn&apos;t link to a valid class. Ask your lecturer to regenerate it.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="studentLogin min-h-screen grid place-items-center py-8 px-4">
      <div className="bg-white px-6 py-6 md:px-12 w-full max-w-md rounded-xl shadow-lg">
        <div className="flex justify-center mb-2">
          <img src={logo} alt="logo" className="h-16" />
        </div>

        <h2 className="text-2xl text-[#000D46] text-center font-bold mb-1">
          Mark Attendance
        </h2>

        {classDetails ? (
          <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm space-y-1">
            <p className="text-[#000D46] font-bold">
              📚 {classDetails.course_title}
            </p>
            <p className="text-[#000D46] font-semibold">
              Code: {courseCode || classDetails.course_code}
            </p>
            <p className="text-[#000D46]">
              📅 {dayjs(classDetails.date).format("DD MMMM, YYYY")}
            </p>
            <p className="text-[#000D46]">
              🕐{" "}
              {classDetails.time
                ? dayjs(`2000-01-01T${classDetails.time}`).format("hh:mm A")
                : "—"}
            </p>
            {classDetails.note && (
              <p className="text-gray-600 italic">📝 {classDetails.note}</p>
            )}
          </div>
        ) : (
          <div className="flex justify-center py-4">
            <div className="loading loading-spinner bg-blue-500" />
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-2">
          <Input
            type="text"
            name="name"
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            type="text"
            name="matricNumber"
            label="Matriculation Number"
            placeholder="e.g. CS/001/2023"
            value={matricNumber}
            onChange={(e) => setMatricNumber(e.target.value)}
            required
          />

          <button
            className="btn btn-block text-lg bg-[#000D46] text-white border-none mt-3"
            type="submit"
            disabled={isLoading || !classDetails}
          >
            {isLoading ? <Spinner /> : "Mark Attendance"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Attendance;
