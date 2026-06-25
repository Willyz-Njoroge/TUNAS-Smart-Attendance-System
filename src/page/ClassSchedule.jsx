import { useState } from "react";
import Input from "../component/Input";
import dayjs from "dayjs";
import QRCodeModal from "../component/QRCodeModal";
import scheduleImg from "/scheduleImg.jpg";
import logo from "/trackAS.png";
import { supabase } from "../utils/supabaseClient";
import useUserDetails from "../hooks/useUserDetails";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

// Works locally AND on Vercel — no more blank QR codes
const BASE_URL =
  import.meta.env.VITE_VERCEL_URL || window.location.origin;

const todayStr = dayjs().format("YYYY-MM-DD");

const ClassSchedule = () => {
  const { userDetails } = useUserDetails();

  const [formData, setFormData] = useState({
    courseTitle: "",
    courseCode: "",
    time: "",
    date: "",
    note: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrData, setQrData] = useState("");
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Only restrict time to >= now when the selected date is today
  const getMinTime = () => {
    if (formData.date === todayStr) {
      return dayjs().format("HH:mm");
    }
    return undefined;
  };

  // classes.lecturer_id is a UUID FK → auth.users.id — NOT the serial integer PK
  const lecturerAuthId = userDetails?.auth_user_id;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { courseTitle, courseCode, time, date, note } = formData;

    // Past-date guard
    if (dayjs(date).isBefore(dayjs().startOf("day"))) {
      toast.error("Date cannot be in the past.");
      return;
    }

    // Past-time guard (today only)
    if (date === todayStr) {
      const [selH, selM] = time.split(":").map(Number);
      const selectedMins = selH * 60 + selM;
      const nowMins = dayjs().hour() * 60 + dayjs().minute();
      if (selectedMins < nowMins) {
        toast.error("Time cannot be in the past for today's date.");
        return;
      }
    }

    if (!lecturerAuthId) {
      toast.error("Lecturer account not found. Please log out and log in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: insert class first — we NEED course_id before building the QR URL
      const { data, error } = await supabase
        .from("classes")
        .insert([
          {
            course_title: courseTitle,
            course_code: courseCode,
            date: dayjs(date).format("YYYY-MM-DD"),
            time: dayjs(`${date}T${time}`).format("HH:mm:ss"),
            note: note,
            lecturer_id: lecturerAuthId,
          },
        ])
        .select("course_id");

      if (error) throw error;

      const generatedCourseId = data[0]?.course_id;

      // Step 2: build the attendance URL now that we have a real courseId
      const attendanceUrl = `${BASE_URL}/attendance?courseId=${encodeURIComponent(
        generatedCourseId
      )}&courseCode=${encodeURIComponent(courseCode)}`;

      // Step 3: render QR to SVG data-URL and persist it on the class record
      const qrCodeDataUrl = await new Promise((resolve) => {
        const container = document.createElement("div");
        document.body.appendChild(container);
        import("react-dom/client").then((ReactDOM) => {
          ReactDOM.createRoot(container).render(
            <QRCodeSVG value={attendanceUrl} size={256} />
          );
          setTimeout(() => {
            const svgEl = container.querySelector("svg");
            if (svgEl) {
              const svgString = new XMLSerializer().serializeToString(svgEl);
              resolve(`data:image/svg+xml;base64,${btoa(svgString)}`);
            } else {
              resolve("");
            }
            document.body.removeChild(container);
          }, 100);
        });
      });

      if (qrCodeDataUrl) {
        await supabase
          .from("classes")
          .update({ qr_code: qrCodeDataUrl })
          .eq("course_id", generatedCourseId);
      }

      toast.success("Class schedule created successfully");
      setQrData(attendanceUrl);
      setIsQRModalOpen(true);

      setFormData({ courseTitle: "", courseCode: "", time: "", date: "", note: "" });
    } catch (err) {
      toast.error(`Error creating class: ${err.message}`);
      console.error("Error creating class:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row max-h-[100vh] bg-gray-100">
      <div className="w-full md:w-1/2 p-4 flex flex-col justify-center relative">
        <div>
          <Link to="/classDetails">
            <button className="btn btn-sm rounded-full bg-blue-500 border-none text-white">
              Back
            </button>
          </Link>
        </div>

        <div className="w-full max-w-2xl h-[90vh] overflow-y-auto">
          <div className="items-center flex self-center justify-center">
            <img src={logo} alt="logo" />
          </div>

          <p className="text-sm text-neutral-600 text-center mb-1">
            Schedule a class using the form below
          </p>

          <form onSubmit={handleSubmit} className="py-0">
            <Input
              label="Course Title"
              name="courseTitle"
              type="text"
              onChange={handleInputChange}
              value={formData.courseTitle}
              required={true}
            />
            <Input
              label="Course Code"
              name="courseCode"
              type="text"
              onChange={handleInputChange}
              value={formData.courseCode}
              required={true}
            />

            {/* Date — min blocks past dates in the browser picker */}
            <div className="form-control">
              <label htmlFor="date" className="label">
                <span className="label-text font-bold text-sm text-[#1E1E1E]">
                  Date
                </span>
              </label>
              <input
                id="date"
                name="date"
                type="date"
                min={todayStr}
                required
                value={formData.date}
                onChange={handleInputChange}
                className="input bg-white w-full text-black border-[1px] border-black focus:border-black rounded-[0.375rem]"
              />
            </div>

            {/* Time — min is current time only when date is today */}
            <div className="form-control">
              <label htmlFor="time" className="label">
                <span className="label-text font-bold text-sm text-[#1E1E1E]">
                  Time
                </span>
              </label>
              <input
                id="time"
                name="time"
                type="time"
                min={getMinTime()}
                required
                value={formData.time}
                onChange={handleInputChange}
                className="input bg-white w-full text-black border-[1px] border-black focus:border-black rounded-[0.375rem] pr-12"
              />
            </div>

            <Input
              label="Note"
              name="note"
              type="text"
              onChange={handleInputChange}
              value={formData.note}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn bg-blue-500 text-white hover:bg-blue-600 transition-colors mt-4 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Generating..." : "Generate QR Code"}
            </button>
          </form>
        </div>
      </div>

      <div className="hidden md:flex w-1/2 h-screen items-center justify-center overflow-hidden">
        <img
          src={scheduleImg}
          alt="Student"
          className="object-cover w-full h-full max-w-none"
        />
      </div>

      {isQRModalOpen && (
        <QRCodeModal
          qrData={qrData}
          onClose={() => setIsQRModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ClassSchedule;
