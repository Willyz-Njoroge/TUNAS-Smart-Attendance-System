import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import toast from "react-hot-toast";

const useUserDetails = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (session && session.user) {
          // Look up by auth_user_id (UUID) — this is reliable and indexed.
          // Querying by email worked before but breaks if the user changes their
          // email in Auth without updating the lecturers table.
          const { data: userData, error: userError } = await supabase
            .from("lecturers")
            .select("*")
            .eq("auth_user_id", session.user.id)
            .single();

          if (userError) {
            if (userError.code === "PGRST116") {
              setError("Lecturer profile not found. Please contact support.");
            } else {
              throw userError;
            }
          } else if (userData) {
            setUserDetails(userData);
          }
        } else {
          setError("User is not logged in.");
        }
      } catch (err) {
        const msg =
          err.message === "TypeError: Failed to fetch"
            ? "Please check your internet connection"
            : err.message;
        toast.error(msg);
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  return { userDetails, userDetailsError: error, isLoading };
};

export default useUserDetails;