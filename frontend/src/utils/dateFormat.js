export default function dateFormat(date) {
  if (!date) return "";

  const [year, month, day] = date.split("-");
  const monthNames = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];

  const monthIndex = parseInt(month) - 1;
  const monthName = monthNames[monthIndex];

  return `${parseInt(day)} ${monthName} ${year}`;
}
