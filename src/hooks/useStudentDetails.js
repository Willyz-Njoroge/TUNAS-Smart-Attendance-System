import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import toast from "react-hot-toast";

const useStudentDetails = () => {
  const [studentDetails, setStudentDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session && session.user) {
          const { data: studentData, error: studentError } = await supabase
            .from("students")
            .select("*")
            .eq("auth_user_id", session.user.id)
            .single();

          if (studentError) {
            if (studentError.code === "PGRST116") {
              setError("Student details not found.");
            } else {
              throw studentError;
            }
          } else if (studentData) {
            setStudentDetails(studentData);
          }
        } else {
          setError("Student is not logged in.");
        }
      } catch (error) {
        const message =
          error.message === "TypeError: Failed to fetch"
            ? "Please check your internet connection"
            : error.message;
        toast.error(message);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentDetails();
  }, []);

  return { studentDetails, studentDetailsError: error, isLoading };
};

export default useStudentDetails;