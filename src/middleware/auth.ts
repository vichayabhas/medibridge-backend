import jwt from "jsonwebtoken";
import { NextFunction } from "express";
import express from "express";
import { resError } from "../controllers/setup";
import Profile from "../models/Profile";
const testJwt = process.env.JWT_SECRET as jwt.Secret
export async function protect(
  req: express.Request,
  res: express.Response,
  next: NextFunction,
) {
  let token: string | null | undefined;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    res
      .status(401)
      .json({ success: false, massage: "Not authorize to access this route" });
    return;
  }
  try {
    const decoded = jwt.verify(token, testJwt);
    const { id } = decoded as { id: string };
    const user = await Profile.findById(id);
    if (!user) {
      res.status(401).json({
        success: false,
        massage: "Not authorize to access this route",
      });
      return;
    }
    next();
  } catch  {
    res
      .status(401)
      .json({ success: false, massage: "Not authorize to access this route" });
    return;
  }
}
export function authorize(...roles: string[]) {
  return async (
    req: express.Request,
    res: express.Response,
    next: NextFunction,
  ) => {
    let token: string | null | undefined;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({
        success: false,
        massage: "Not authorize to access this route",
      });
    }
    const decoded = jwt.verify(token.toString(), testJwt);
    const { id } = decoded as { id: string };
    const user = await Profile.findById(id);
    if (!user) {
      return res.status(401).json({
        success: false,
        massage: "Not authorize to access this route",
      });
    }
    if (!roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        msg: `User role ${user.role} is not authorized to access`,
      });
    }
    next();
  };
}
export async function getUser(req: express.Request) {
  let token: string | null | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return null;
  }
  try {
    const decoded = jwt.verify(token.toString(), testJwt);
    const { id } = decoded as { id: string };
    const user = await Profile.findById(id).select("+password");
    return user;
  } catch {
    return null;
  }
}

export function isLogin(
  withIn: express.RequestHandler,
  withOut: express.RequestHandler | null,
) {
  return async (
    req: express.Request,
    res: express.Response,
    next: NextFunction,
  ) => {
    let token: string | null | undefined;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      if (withOut) {
        withOut(req, res, next);
      } else {
        res.status(403).json(resError);
      }

      return;
    }
    try {
      const decoded = jwt.verify(token.toString(), testJwt);
      const { id } = decoded as { id: string };
      const user = await Profile.findById(id);
      if (!user) {
        if (withOut) {
          withOut(req, res, next);
        } else {
          res.status(403).json(resError);
        }

        return;
      }
      withIn(req, res, next);
    } catch {
      if (withOut) {
        withOut(req, res, next);
      } else {
        res.status(403).json(resError);
      }
      return;
    }
  };
}
export async function isPass(
  req: express.Request,
  res: express.Response,
  next: NextFunction,
) {
  console.log();
  next();
}
