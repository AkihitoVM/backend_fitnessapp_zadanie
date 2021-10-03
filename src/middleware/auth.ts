import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UserModel } from '../db/user';
import { models } from '../db'


const {
  User
} = models


const verifyToken = (req: Request, res: Response, next: NextFunction) => {

  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }

  try {
    const decoded = jwt.verify(token, "secretJWTkey");
    req.cookies = decoded
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: UserModel = await User.findByPk(req.cookies.user_id)
    if (user.role === 'ADMIN') {
      return next()
    }
    return res.status(403).send({
      message: "Require Admin Role!"
    });
  } catch (error) {
    return console.log(error);
  }
}

const isUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: UserModel = await User.findByPk(req.cookies.user_id)
    if (user.role === 'USER') {
      return next()
    }
    return res.status(403).send({
      message: "Require USER Role!"
    });
  } catch (error) {
    return console.log(error);
  }
}



export = { verifyToken, isAdmin, isUser };