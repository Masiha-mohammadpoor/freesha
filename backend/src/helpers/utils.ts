import { Tag, None, ResObj, EducationDegree, WorkExperience } from "./types.js";

const phoneNumberRegex = /^09\d{9}$/;

export function timeNow(): string {
  return new Date().toTimeString().split(" ")[0]!;
}

export function customLog(tag: Tag, text: string | None): void {
  console.log(`(${timeNow()}) [${tag.toUpperCase()}] ${text}`);
}

export function generateOtp(length = 5): string {
  const chars = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randChar = chars[Math.floor(Math.random() * chars.length)];
    result = `${result}${randChar}`;
  }

  return result;
}

export function makeResObj(message: string, data: Object | None = {}): ResObj {
  if (isNone(data)) {
    data = {};
  }
  return { message, data };
}

export function isNone(value: any): value is None {
  return value === null || value === undefined;
}

export function isEducationDegree(value: any): value is EducationDegree {
  if (typeof value !== "object") return false;

  if (value.userId === undefined) return false;
  if (value.title === undefined) return false;
  if (value.startDate === undefined) return false;
  if (value.endDate === undefined) return false;

  if (typeof value.userId !== "number") return false;
  if (typeof value.title !== "string") return false;
  if (typeof value.startDate !== "string") return false;
  if (typeof value.endDate !== "string" && value.endDate !== null) return false;

  return Object.keys(value).length === 4;
}

export function isWorkExperience(value: any): value is WorkExperience {
  if (typeof value !== "object") return false;

  if (value.userId === undefined) return false;
  if (value.jobTitle === undefined) return false;
  if (value.company === undefined) return false;
  if (value.startDate === undefined) return false;
  if (value.endDate === undefined) return false;

  if (typeof value.userId !== "number") return false;
  if (typeof value.jobTitle !== "string") return false;
  if (typeof value.company !== "string") return false;
  if (typeof value.startDate !== "string") return false;
  if (typeof value.endDate !== "string" && value.endDate !== null) return false;

  return Object.keys(value).length === 5;
}

export function isArrayUnique(items: any[]): boolean {
  const itemsLength = items.length;

  for (let i = 0; i < itemsLength; i++) {
    for (let j = i + 1; j < itemsLength; j++) {
      if (items[i] === items[j]) return false;
    }
  }

  return true;
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function portfoliosSkillsCustom(value: any): boolean {
  value = value.skills;
  if (isNone(value)) return false;
  if (typeof value !== "object") return false;
  if (isNone(value.length)) return false;
  if (value.length <= 0) return false;
  for (const item of value) {
    if (typeof item !== "string") return false;
    if (item.length <= 0) return false;
    if (item.length > 30) return false;
  }
  return true;
}

export function isNumericCustom(value: string): boolean {
  const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  for (const character of value) {
    if (!digits.includes(character)) {
      return false;
    }
  }

  return true;
}

export function isPhoneNumber(value: string): boolean {
  if (value === "") {
    return true;
  }

  return phoneNumberRegex.test(value);
}
