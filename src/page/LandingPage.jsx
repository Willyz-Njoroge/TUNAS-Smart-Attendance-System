import { Link } from "react-router-dom";
import logo from "/trackAS.png";

const LandingPage = () => {
  return (
    <>
      <section className="h-[100vh] w-full grid place-items-center px-6 bg-slate-50">
        <div className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="items-center flex self-center justify-center mb-6">
            <img src={logo} alt="Project logo" className="h-24 w-auto" />
          </div>
          <h1 className="text-center text-4xl font-bold text-slate-900">
            TUNAS - Smart Attendance System
          </h1>
          <p className="mt-4 text-center text-lg text-slate-600">
            TUNAS is a smart attendance system that helps in marking students attendance for lectures. It keeps the records and provide analytics for every lecture.
          </p>

          <div className="mt-8">
            <p className="text-center text-sm font-bold text-slate-500 mb-2">
              I am a Lecturer
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/registerLecturer" className="w-full sm:w-auto">
                <button className="btn btn-primary w-full">Register Lecturer</button>
              </Link>
              <Link to="/loginLecturer" className="w-full sm:w-auto">
                <button className="btn btn-secondary w-full">Login Lecturer</button>
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-center text-sm font-bold text-slate-500 mb-2">
              I am a Student
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/registerStudent" className="w-full sm:w-auto">
                <button className="btn bg-[#000D46] text-white border-none w-full">
                  Register Student
                </button>
              </Link>
              <Link to="/loginStudent" className="w-full sm:w-auto">
                <button className="btn btn-outline w-full">Login Student</button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
