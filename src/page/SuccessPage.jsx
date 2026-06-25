import { useLocation, Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

const SuccessPage = () => {
  const { state } = useLocation();
  const studentName = state?.name || "Student";
  const courseCode = state?.courseCode || "the class";

  return (
    <section className="h-[100vh] grid place-items-center bg-green-50 px-4">
      <div className="bg-white px-8 py-10 md:px-14 md:py-14 rounded-2xl shadow-xl text-center max-w-sm w-full">
        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />

        <h1 className="text-3xl font-bold text-green-800 mb-2">
          Attendance Marked!
        </h1>

        <p className="text-lg text-gray-700 mb-1">
          Well done,{" "}
          <span className="font-bold text-[#000D46]">{studentName}</span>!
        </p>

        <p className="text-gray-500 text-sm mb-6">
          You have successfully attended{" "}
          <span className="font-semibold">{courseCode}</span>.
          Your attendance has been recorded.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
          <p className="text-green-700 text-sm font-medium">
            ✅ You are marked as present for this session.
          </p>
        </div>

        <Link to="/">
          <button className="btn bg-[#000D46] text-white border-none w-full">
            Back to Home
          </button>
        </Link>
      </div>
    </section>
  );
};

export default SuccessPage;
