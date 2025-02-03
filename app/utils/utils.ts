
/**
 * Returns the difference in days between two dates without taking into account the hours.
 * @param date1 The first date.
 * @param date2 The second date.
 * @returns The difference in days between the two dates.
*/
export const getDaysDiffWithoutHours = (date1: Date, date2: Date): number => {
    const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
    const diffTime = Math.abs(normalizeDate(date2).getTime() - normalizeDate(date1).getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  