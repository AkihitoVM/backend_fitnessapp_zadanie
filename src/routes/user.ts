import { Router, Request, Response, NextFunction } from 'express'

import { models } from '../db'
import { UserModel } from '../db/user'
import auth from '../middleware/auth'

const router: Router = Router()

const {
	User
} = models


/* USER API */

export default () => {

	/* Use middlewares for USER API */
	router.use([auth.verifyToken, auth.isUser])

	/* Get all users (id, nickName) */
	router.get('/users', async (req: Request, res: Response, next: NextFunction) => {

		try {
			const users: UserModel[] = await User.findAll({
				attributes: ['id', 'nickName']
			})
			return res.status(200).json({
				data: users,
				message: 'List of users'
			})
		} catch (error) {
			return res.status(500).json({
                error
            })
		}
	})

	/*Get own info (name, surname, age, nickName) */
	router.get("/own", async (req: Request, res: Response, next: NextFunction) => {
		const ID = req.cookies.user_id

		try {
			const myOwnProfileData: UserModel = await User.findByPk(ID,{
				attributes: ['name', 'surname', 'age', 'nickName'],
				raw: true
			})

			if (!myOwnProfileData) {
				return res.status(400).send("Unknown user");
			}
			
			const response = {
				data: {
					...myOwnProfileData
				},
				message: 'Your own profile info'
			}
			return res.status(200).json(response)

		} catch (error) {
			return res.status(500).json({
                error
            })
		}
	})

	return router
}
