/**
 * Calculates the trip status based on current date and trip dates
 * @param departureDate - Trip departure date (ISO string)
 * @param returnDate - Trip return date (ISO string)
 * @returns Trip status: 'planned' | 'ongoing' | 'completed'
 */
export const calculateTripStatus = (
  departureDate: string,
  returnDate: string
): 'planned' | 'ongoing' | 'completed' => {
  const now = new Date();
  const departure = new Date(departureDate);
  const returnDateObj = new Date(returnDate);
  
  // Set time to midnight for accurate date comparison (ignore time component)
  now.setHours(0, 0, 0, 0);
  departure.setHours(0, 0, 0, 0);
  returnDateObj.setHours(0, 0, 0, 0);
  
  if (now < departure) {
    return 'planned';
  } else if (now >= departure && now <= returnDateObj) {
    return 'ongoing';
  } else {
    return 'completed';
  }
};

