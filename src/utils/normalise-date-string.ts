const pad = (str: string) => (str.length === 1 ? '0' + str : str);

export const normaliseDateString = (
  str: string // Eg 20172211193559912000+660
) => {
  // Convert the offset mins (eg, +660) to offset hours (eg, +11:00)
  const [
    dateTime, // 20172211193559912
    minuteOffsetString, // +660
  ] = str.split('000+');
  const minuteOffsetNumber = parseInt(minuteOffsetString, 10);
  const offsetHours = pad(Math.floor(minuteOffsetNumber / 60).toString());
  const offsetMinutes = pad((minuteOffsetNumber % 60).toString());
  const hourOffsetString = `+${offsetHours}:${offsetMinutes}`;

  // Parse the dateTime string
  const year = dateTime.slice(0, 4);
  const day = dateTime.slice(4, 6);
  const month = dateTime.slice(6, 8);
  const hours = dateTime.slice(8, 10);
  const minutes = dateTime.slice(10, 12);
  const seconds = dateTime.slice(12, 14);
  const milliseconds = dateTime.slice(14, 17);

  return new Date(
    `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${hourOffsetString}`
  ).toISOString();
};
