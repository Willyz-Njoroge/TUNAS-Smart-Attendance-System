/**
 * API Error Handler - Standardized error handling for Supabase calls
 */

export const handleSupabaseError = (error, context = 'Operation') => {
  if (!error) return null;

  const errorMessage = {
    code: error.code || 'UNKNOWN',
    message: error.message || 'An unknown error occurred',
    context,
    timestamp: new Date().toISOString(),
  };

  // Specific error handling based on code
  switch (error.code) {
    case 'PGRST116':
      errorMessage.userMessage = 'No data found. Please check your search criteria.';
      break;
    case 'PGRST301':
      errorMessage.userMessage = 'You do not have permission to access this data.';
      break;
    case 'PGRST401':
      errorMessage.userMessage = 'Unauthorized. Please log in again.';
      break;
    case '23502':
      errorMessage.userMessage = 'Invalid data. Please fill all required fields.';
      break;
    case '23505':
      errorMessage.userMessage = 'This record already exists.';
      break;
    case 'PGRST':
      errorMessage.userMessage = 'Database error. Please try again later.';
      break;
    default:
      errorMessage.userMessage = error.message || 'An error occurred. Please try again.';
  }

  console.error('Supabase Error:', errorMessage);
  return errorMessage;
};

export const handleApiError = (error, context = 'API Call') => {
  const errorMessage = {
    code: error.code || error.status || 'UNKNOWN',
    message: error.message || 'An error occurred',
    context,
    timestamp: new Date().toISOString(),
  };

  if (error.response) {
    errorMessage.status = error.response.status;
    errorMessage.data = error.response.data;
  }

  console.error('API Error:', errorMessage);
  return errorMessage;
};

export const getErrorMessage = (error) => {
  return error?.userMessage || error?.message || 'An error occurred. Please try again.';
};
