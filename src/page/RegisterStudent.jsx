import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Input from "../component/Input";
import Logo from "/trackAS.png";
import registerImg from "/registerImg.jpg";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Footer from "../component/Footer";
import {
  validateStudentRegistrationForm,
  validatePasswordStrength,
  normalizeInput,
} from "../utils/validation";

const RegisterStudent = () => {
  const [fullName, setFullName] = useState("");
  const [matricNo, setMatricNo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [course, setCourse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrengthHint, setPasswordStrengthHint] = useState("");

  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword) {
      const validation = validatePasswordStrength(newPassword);
      if (!validation.isValid) {
        setPasswordStrengthHint(validation.errors[0]);
      } else {
        setPasswordStrengthHint("✓ Strong password");
      }
    } else {
      setPasswordStrengthHint("");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setValidationErrors({});

    const normalizedData = {
      fullName: normalizeInput(fullName),
      matricNo: normalizeInput(matricNo).toUpperCase(),
      email: normalizeInput(email).toLowerCase(),
      password,
      confirmPassword,
      phoneNumber: phoneNumber.replace(/\s+/g, ""),
      course: normalizeInput(course),
    };

    const validation = validateStudentRegistrationForm(normalizedData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setIsLoading(false);
      toast.error("Please fix the errors below");
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedData.email,
        password: normalizedData.password,
      });

      if (authError) throw authError;

      const authUserId = authData?.user?.id;
      if (!authUserId) throw new Error("Failed to get auth user ID");

      const { error: insertError } = await supabase.from("students").insert({
        auth_user_id: authUserId,
        full_name: normalizedData.fullName,
        matric_no: normalizedData.matricNo,
        email: normalizedData.email,
        phone_number: normalizedData.phoneNumber,
        course: normalizedData.course,
      });

      if (insertError) throw insertError;

      toast.success("Registration successful! You can now log in.");
      navigate("/loginStudent");
    } catch (error) {
      console.error("Student registration error:", error);
      if (error.message.includes("duplicate key")) {
        if (error.message.includes("matric_no")) {
          toast.error("This matriculation number is already registered.");
        } else {
          toast.error("Email already registered. Please login instead.");
        }
      } else if (error.message.includes("auth")) {
        toast.error("Authentication error: " + error.message);
      } else {
        toast.error(error.message || "Registration failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-[100vh]">
      <div className="grid md:grid-cols-2">
        <form
          onSubmit={handleRegister}
          className="px-6 lg:px-[133px] overflow-scroll h-[100vh]"
        >
          <div className="flex flex-col items-center">
            <img src={Logo} alt="logo" className="w-32 mt-8" />
            <h2 className="text-[#000D46] font-bold text-2xl mt-1 mb-2">
              Create Your Student Account
            </h2>
            <p className="text-[#000D46] text-sm mb-4">Tharaka University</p>
          </div>
          <div className="grid gap-y-4">
            <Input
              type="text"
              label="Full Name"
              placeholder="Enter your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={validationErrors.fullName}
              required
            />

            <Input
              type="text"
              label="Matriculation Number"
              placeholder="e.g. CS/001/2023"
              value={matricNo}
              onChange={(e) => setMatricNo(e.target.value)}
              error={validationErrors.matricNo}
              required
            />

            <Input
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={validationErrors.email}
              required
            />

            <Input
              type="tel"
              label="Phone Number"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              error={validationErrors.phoneNumber}
              required
            />

            <Input
              type="text"
              label="Course / Department"
              placeholder="e.g. Computer Science"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              error={validationErrors.course}
              required
            />

            <div>
              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                error={validationErrors.password}
                required
              />
              {passwordStrengthHint && (
                <span
                  className={`text-xs mt-1 block ${
                    passwordStrengthHint.startsWith("✓")
                      ? "text-green-600"
                      : "text-amber-600"
                  }`}
                >
                  {passwordStrengthHint}
                </span>
              )}
            </div>

            <Input
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={validationErrors.confirmPassword}
              required
            />
          </div>

          <button
            type="submit"
            className="btn bg-[#000D46] font-bold text-base text-white btn-block mt-4"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="my-4 text-[#1E1E1E] text-center">
            Already have an account?{" "}
            <Link className="text-[#000D46] font-semibold" to={"/loginStudent"}>
              Login
            </Link>
          </p>
        </form>

        <div className="max-[100%] hidden md:block">
          <img
            src={registerImg}
            alt="register hero image"
            className="h-[100vh] w-full object-cover"
          />
        </div>
      </div>
      <Footer />
    </section>
  );
};

export default RegisterStudent;
