import {
    Request,
    Response,
    NextFunction
} from 'express'

import { models } from '../db'
import { UserModel } from '../db/user'
import { ROLE } from '../utils/enums'

const {
    User
} = models


const checkDuplicateEmail = (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.email) {
        return res.status(500).json({
            message: 'You probably forgot your email or it can\'t be null'
        })

    }
    else {
        User.findOne({
            where: {
                email: req.body.email
            }
        }).then((user: UserModel) => {
            if (user) {
                return res.status(400).send({
                    message: "Failed! Email is already in use!"
                });
            }
        });
    }
    next()
};


const checkRolesExisted = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.role) {
        if (Object.values(ROLE).includes(req.body.role.toUpperCase())) {
            next()
        } else {
            res.status(400).send({
                message: `Failed! Role does not exist = ${req.body.role}`
            });
            return;
        }
    }
};


const verifySignUp = {
    checkDuplicateEmail: checkDuplicateEmail,
    checkRolesExisted: checkRolesExisted
};

export default verifySignUp