export const getNextOccurrences = (dayOfWeek: number, count: number): string[] => {
  const dates: string[] = [];
  let currentDate = new Date();

  while (dates.length < count) {
    // If we're past the day this week, move to next week
    if (currentDate.getDay() > dayOfWeek) {
      currentDate.setDate(currentDate.getDate() + (7 - currentDate.getDay() + dayOfWeek));
    } else {
      // Move to the target day this week
      currentDate.setDate(currentDate.getDate() + (dayOfWeek - currentDate.getDay()));
    }

    dates.push(currentDate.toISOString().split('T')[0]);
    // Move to next week
    currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  return dates;
};