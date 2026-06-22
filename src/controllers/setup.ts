import express from "express";
// import {

//   Id,
// } from "../models/interface";
import mongoose from "mongoose";
type Id = mongoose.Types.ObjectId;

export function swop(olds: Id | null, news: Id | null, array: Id[]): Id[] {
  if (!olds) {
    if (news) {
      return [...array, news];
    }
    return array;
  }
  const re = array.filter((e) => {
    return e
      .toString()
      .split(" ")[0]
      .localeCompare(olds.toString().split(" ")[0]);
  });
  if (news) {
    return [...re, news];
  }
  return re;
}
export function calculate(
  input: unknown | number | undefined,
  plus: unknown | number | undefined,
  minus: unknown | number | undefined,
) {
  return (input as number) + (plus as number) - (minus as number);
}
export const resOk = { success: true };
export const resError = { success: false };
export function sendRes(res: express.Response, success: boolean) {
  res.status(success ? 200 : 400).json({ success });
}
export function isInTime(start: Date, end: Date): boolean {
  const now = new Date(Date.now());
  return now > start && now < end;
}
export const backendUrl = "http://localhost:5000";
export const userPath = "api/v1/auth";
export function removeDuplicate(input: Id[], compare: Id[]): Id[] {
  return input.filter((e) => {
    return !compare.map((v) => v.toString()).includes(e.toString());
  });
}
export function notEmpty<TValue>(
  value: TValue | null | undefined,
): value is TValue {
  if (value === null || value === undefined) return false;
  return true;
}

// import nodemailer from "nodemailer";
// import { MailOptions } from "nodemailer/lib/json-transport";

// export function sendingEmail(email: string, text: string) {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "arifmini64@gmail.com",
//       pass: "mtekbmbboehothcy",
//     },
//   });
//   const mailOptions: MailOptions = {
//     from: "arifmini64@gmail.com",
//     to: email,
//     subject: "verify email",
//     text,
//   };
//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.error("Email sending failed:", error);
//     } else {
//       console.log("Email sent: " + info.response);
//     }
//   });
// }
export const removeDups = (input: Id[]): Id[] => {
  const arr = input.map((e) => e.toString().split(" ")[0]);
  const unique = arr.filter(function (elem, index, self) {
    return index === self.indexOf(elem);
  });
  return unique.map((e) => stringToId(e));
};

export function ifIsTrue<T>(
  input: boolean,
  id: T,
  array1: T[],
  array2?: T[],
  array3?: T[],
) {
  if (input) {
    array1.push(id);
    if (array2) {
      array2.push(id);
    }
    if (array3) {
      array3.push(id);
    }
  }
  return array1;
}
export function ifIsHave(input: Id | null, array: Id[]) {
  if (input) {
    array.push(input);
  }
  return array;
}
export function ifIsPlus(logic: boolean, input: number): number {
  if (logic) {
    return input + 1;
  } else {
    return input;
  }
}
export function stringToId(input: string) {
  return new mongoose.Types.ObjectId(input);
}
export const arrayObjectId = {
  type: [mongoose.Schema.ObjectId],
  default: [],
} as const;
export const arrayString = {
  type: [String],
  default: [],
} as const;
export const dataString = {
  type: String,
  required: true,
} as const;
export const dataNumber = {
  type: Number,
  default: 0,
} as const;
export const dataMapString = {
  type: Map,
  default: new Map(),
  of: String,
} as const;
export const dataMapObjectId = {
  type: Map,
  default: new Map(),
  of: mongoose.Schema.ObjectId,
} as const;
export const dataId = {
  type: mongoose.Schema.Types.ObjectId,
  required: true,
} as const;
export const dataDate = {
  type: Date,
  required: true,
} as const;
export const dateNow = {
  type: Date,
  default: Date.now(),
} as const;
export const reqNumber = {
  type: Number,
  required: true,
} as const;
export function getDefaultBoolean(init: boolean) {
  return {
    type: Boolean,
    default: init,
  };
}
export const dataStringDefault = {
  type: String,
  default: "",
} as const;
