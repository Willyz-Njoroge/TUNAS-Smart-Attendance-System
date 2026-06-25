/**
 * Data Utilities - Helper functions for data processing and calculations
 */

/**
 * Calculate attendance statistics for a class
 */
export const calculateAttendanceStats = (attendanceRecords) => {
  if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
    return {
      total: 0,
      present: 0,
      absent: 0,
      attendanceRate: 0,
      presentPercentage: 0,
      absentPercentage: 0,
    };
  }

  // Some schemas use `is_present`, others infer presence by truthy `present` or non-empty matric_no.
  const present = attendanceRecords.filter((record) => {
    if (!record) return false;
    if (typeof record.is_present === "boolean") return record.is_present;
    if (typeof record.present === "boolean") return record.present;
    // fallback: treat any record with a matric_no or timestamp as present
    return !!(record.matric_no || record.timestamp || record.name);
  }).length;

  const total = attendanceRecords.length;
  const absent = Math.max(0, total - present);
  const attendanceRate = total > 0 ? (present / total) * 100 : 0;

  return {
    total,
    present,
    absent,
    attendanceRate: parseFloat(attendanceRate.toFixed(2)),
    presentPercentage: parseFloat(attendanceRate.toFixed(2)),
    absentPercentage: parseFloat(((absent / total) * 100 || 0).toFixed(2)),
  };
};

/**
 * Calculate attendance trend over time
 */
export const calculateAttendanceTrend = (classesData) => {
  const trends = [];

  classesData.forEach((cls) => {
    const stats = calculateAttendanceStats(cls.attendance_records || []);
    trends.push({
      date: cls.date,
      time: cls.time,
      courseCode: cls.course_code,
      attendanceRate: stats.attendanceRate,
      total: stats.total,
      present: stats.present,
    });
  });

  return trends.sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * Get most absent students
 */
export const getMostAbsentStudents = (allAttendanceRecords, limit = 10) => {
  const studentAbsenceMap = {};

  allAttendanceRecords.forEach((record) => {
    if (!record.is_present) {
      const studentId = record.student_id;
      studentAbsenceMap[studentId] = (studentAbsenceMap[studentId] || 0) + 1;
    }
  });

  return Object.entries(studentAbsenceMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([studentId, absenceCount]) => ({
      studentId,
      absenceCount,
    }));
};

/**
 * Calculate class attendance distribution by date
 */
export const getAttendanceByDate = (classesData) => {
  const distribution = {};

  classesData.forEach((cls) => {
    const date = cls.date;
    if (!distribution[date]) {
      distribution[date] = { total: 0, present: 0 };
    }
    const stats = calculateAttendanceStats(cls.attendance_records || []);
    distribution[date].total += stats.total;
    distribution[date].present += stats.present;
  });

  return Object.entries(distribution).map(([date, data]) => ({
    date,
    totalStudents: data.total,
    presentStudents: data.present,
    attendanceRate: ((data.present / data.total) * 100).toFixed(2),
  }));
};

/**
 * Get summary statistics for dashboard
 */
export const getDashboardSummary = (classesData) => {
  let totalClasses = classesData.length;
  let totalAttendanceRecords = 0;
  let totalPresent = 0;

  classesData.forEach((cls) => {
    const records = cls.attendance_records || [];
    totalAttendanceRecords += records.length;
    totalPresent += records.filter((r) => r.is_present).length;
  });

  const overallAttendanceRate =
    totalAttendanceRecords > 0
      ? ((totalPresent / totalAttendanceRecords) * 100).toFixed(2)
      : 0;

  return {
    totalClasses,
    totalStudents: totalAttendanceRecords,
    totalPresent,
    totalAbsent: totalAttendanceRecords - totalPresent,
    overallAttendanceRate: parseFloat(overallAttendanceRate),
  };
};

/**
 * Group data by course
 */
export const groupByField = (data, field) => {
  return data.reduce((acc, item) => {
    const key = item[field];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
};

/**
 * Format date to readable format
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
