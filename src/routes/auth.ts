import {
    Router,
    Request,
    Response,
    NextFunction
} from 'express'
// import * as crypto from "crypto-js";
import jwt from 'jsonwebtoken'
const bcrypt = require('bcryptjs');
import { models } from '../db'
import user, { UserModel } from '../db/user'
import verifySignUp from '../middleware/verifySignUp'
import { ROLE } from '../utils/enums'
const router: Router = Router()

const {
    User
} = models

function getEnumKeyByEnumValue<T extends { [index: string]: ROLE }>(ROLE: T, enumValue: string): keyof T | null {
    let keys = Object.keys(ROLE).filter(x => ROLE[x] == enumValue);
    return keys.length > 0 ? keys[0] : null;
}

export default () => {
    router.use(function (req: Request, res: Response, next: NextFunction) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });


    router.post("/signup", [verifySignUp.checkDuplicateEmail, verifySignUp.checkRolesExisted], async (req: Request, res: Response, _next: NextFunction) => {
        const encryptedPassword: string = await bcrypt.hash(req.body.password, 10);
        User.create({
            name: req.body.name,
            surname: req.body.surname,
            nickName: req.body.nickName,
            age: req.body.age,
            email: req.body.email,
            role: req.body.role,
            password: encryptedPassword
        })
            .then((user: UserModel, err: Error) => {
                if (err) {
                    res.status(500).send({
                        message: "Some error with creating new User"
                    });
                    return;
                }
                res.send({ message: "User was registered successfully!" });
            })
            .catch((err: Error) => {
                res.status(500).send({ message: err.message || "ERROR!)!)!" });
            });
    })

    router.post("/sigin", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body

            if (!(email && password)) {
                return res.status(400).send({ message: "All Input is required" })
            }
            const user: UserModel = await User.findOne({
                where: {
                    email: email
                }
            })

            if (user && (await bcrypt.compare(password, user.password))) {
                const token = jwt.sign(
                    { user_id: user.id, email },
                    "secretJWTkey",
                    {
                        expiresIn: "2h",
                    }
                );
                return res.status(200).json({ user, token });
            }
            res.status(400).send("Invalid Credentials");
        } catch (error) {
            console.log(error);
        }

    })

    return router
}
