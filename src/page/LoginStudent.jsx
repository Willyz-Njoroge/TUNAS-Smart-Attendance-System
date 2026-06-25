import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import Logo from "/trackAS.png";
import loginImg from "/loginlecture.png";
import Input from "../component/Input";
import Spinner from "../component/Spinner";
import toast from "react-hot-toast";
import { validateLoginForm, normalizeInput } from "../utils/validation";

const LoginStudent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Students arriving from a QR scan are sent here with ?redirect=/attendance?...
  // After login we send them straight back to that URL so they can mark attendance.
  const queryParams = new URLSearchParams(location.search);
  const redirectTo = queryParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setValidationErrors({});

    const normalizedEmail = normalizeInput(email).toLowerCase();
    const validation = validateLoginForm(normalizedEmail, password);

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setIsLoading(false);
      toast.error("Please fix the errors below");
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) throw error;

      toast.success("Login successful");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const errorMsg = error.error_description || error.message;
      if (errorMsg.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      <div className="grid md:grid-cols-2">
        <div className="px-6 lg:px-[133px] overflow-scroll h-[100vh] pb-8">
          <div className="flex flex-col mt-5 items-center">
            <img src={Logo} alt="login logo" className="w-32" />
            <h2 className="text-[#000D46] font-bold text-2xl mt-2 mb-6">
              Student Sign In
            </h2>
          </div>
          <form onSubmit={handleLogin}>
            <div className="grid gap-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={validationErrors.email}
                required
              />
              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={validationErrors.password}
                required
              />
            </div>

            <button
              className="btn bg-[#000D46] disabled:bg-[#000D46] disabled:cursor-not-allowed text-white btn-block mt-6 text-base font-bold"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? <Spinner /> : "Login"}
            </button>
          </form>

          <p className="mt-3 text-[#1E1E1E] text-center">
            Don&apos;t have an account?{" "}
            <Link
              className="text-[#000D46] font-semibold"
              to={`/registerStudent${
                redirectTo !== "/"
                  ? `?redirect=${encodeURIComponent(redirectTo)}`
                  : ""
              }`}
            >
              Register Now
            </Link>
          </p>
        </div>

        <div>
          <img
            src={loginImg}
            alt="login screen image"
            className="h-[100vh] hidden md:block w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default LoginStudent;