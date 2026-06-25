const Footer = () => {
  return (
    <section className="w-full bg-white py-6 text-black px-4">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-8">
        {/* Left Section */}
        <div className="text-center md:text-left">
          <h2 className="font-bold text-lg text-black pb-2">TUNAS</h2>
          <p className="text-sm max-w-sm">
            TUNAS is a smart attendance system that helps in marking students attendance for lectures. It keeps the records and provide analytics for every lecture.
          </p>
          <p className="text-xs text-gray-600 mt-2">Tharaka University</p>
        </div>

        {/* Right Section */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
          <div className="text-xs">
            <p className="pb-2">Smart Attendance Solution</p>
            <p className="pb-2">
              TUNAS leverages QR codes to enable lecturers to
              efficiently mark student attendance and manage class records, while
              providing analytics and attendance reports.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Footer;
