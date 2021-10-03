import { Router, Request, Response, NextFunction } from 'express'

import { models } from '../db'
import { ExerciseModel } from '../db/exercise'
import { UserModel } from '../db/user'
import auth from '../middleware/auth'

const router: Router = Router()

const {
    Exercise,
    User
} = models


/* ADMIN API */

export default () => {

    /* Use middlewares for ADMIN API */
    router.use([auth.verifyToken, auth.isAdmin])

    /* Get all users */
    router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
        const users = await User.findAll({ raw: true })

        return res.json({
            count: users.length,
            users: users.map((user: UserModel) => {
                return {
                    ...user,
                    request: {
                        type: 'GET',
                        url: "http://localhost:8000/api/admin/user/" + user.id
                    }
                }
            }),
            message: req.headers['language'] === 'en' ? 'List of users' : 'Zoznam užívateľov'
        })
    })

    /* Get user by ID */
    router.get("/user/:userId", async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.params.userId
        try {
            const user = await User.findByPk(userId)
            if (!user) {
                return res.status(400).json({
                    message: "User with given ID not found"
                })
            }
            return res.json({
                data: user,
                message: req.headers['language'] === 'en' ? 'Specific user' : 'Konkrétny užívateľ'
            })
        } catch (error) {
            return res.status(500).json({
                error
            })
        }
    })

    /* Update user info by ID,

        how to send request: 
            TYPE: PATCH,
            BODY:
                    `[
                        {
                            "propName":"name", "value":"ReactJs"
                        },
                        {
                            "propName":"difficulty", "value":"HARD"
                        }
                    ]`,
            OK
    */
    router.patch("/user/:userId", async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.params.userId

        const updateOptions: { [key: string]: any } = {};

        for (let i = 0; i < req.body.length; i++) {
            updateOptions[req.body[i].propName] = req.body[i].value
        }

        try {
            await User.update(updateOptions, {
                where: {
                    id: userId
                }
            })
        } catch (error) {
            console.log(error);
        }
        const user = await User.findByPk(userId)
        res.status(200).json({
            user,
            request: {
                type: 'GET',
                url: 'http://localhost:8000/api/admin/user/' + userId
            },
            message: 'User with ID = ' + userId + ' successfuly updated'
        })
    })

    /* Get all exercises */
    router.get("/exercises", async (req: Request, res: Response, next: NextFunction) => {
        const exercises = await Exercise.findAll({ raw: true })
        res.status(200).json({
            count: exercises.length,
            users: exercises.map((exercise: ExerciseModel) => {
                return {
                    ...exercise,
                    request: {
                        type: 'GET',
                        url: "http://localhost:8000/api/admin/user/exercise/" + exercise.id
                    }
                }
            }),
            message: req.headers['language'] === 'en' ? 'List of users' : 'Zoznam užívateľov'
        })
    })

    /* Get exercise by ID */
    router.get("/exercise/:exerciseId", async (req: Request, res: Response, next: NextFunction) => {
        const exerciseId = req.params.exerciseId
        try {
            const exercise = await Exercise.findByPk(exerciseId)
            if (!exercise) {
                return res.status(400).json({
                    message: "Exercise with given ID not found"
                })
            }
            return res.json({
                data: exercise,
                message: req.headers['language'] === 'en' ? 'Specific user' : 'Konkrétny užívateľ'
            })
        } catch (error) {
            return res.status(500).json({
                error
            })
        }
    })


    /* Create new exercise */
    router.post("/exercise/create", async (req: Request, res: Response, next: NextFunction) => {
        const { name, difficulty, programID } = req.body

        if (!(name && difficulty && programID)) {
            return res.status(400).send({ message: "All Input is required" })
        }

        const exercise = await Exercise.create({ name, difficulty, programID })
        res.status(200).json({
            data: {
                id: exercise.id
            },
            message: req.headers['language'] === 'en' ? 'You have successfully created exercise' : 'Cvičenie bol úspešne vytvorený'
        })
    })

    /*
        Update exercise info by ID,

        how to send request: 
            TYPE: PATCH,
            BODY:
                    `[
                        {
                            "propName":"name", "value":"ReactJs"
                        },
                        {
                            "propName":"difficulty", "value":"HARD"
                        }
                    ]`,
            OK
    */
    router.patch("/exercise/:exerciseId", async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.exerciseId;

        const updateOptions: { [key: string]: any } = {};

        for (let i = 0; i < req.body.length; i++) {
            updateOptions[req.body[i].propName] = req.body[i].value
        }

        try {
            await Exercise.update(updateOptions, {
                where: {
                    id: id
                }
            })
        } catch (error) {
            return res.status(500).json({
                error
            })
        }
        const exercise = await Exercise.findByPk(id);
        return res.status(200).json({
            exercise,
            request: {
                type: 'GET',
                url: 'http://localhost:8000/api/admin/exercise/' + id
            },
            message: 'Exercise with ID = ' + id + ' successfuly updated'
        })
    })

    /* Delete exercise by ID */
    router.delete("/exercise/:exerciseId", async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.exerciseId;

        try {
            let result = await Exercise.destroy({
                where: {
                    id: id
                }
            })
            if (!result) {
                return res.status(500).json({
                    message: 'Not found exercise with ID = ' + id
                })
            }
        } catch (error) {
            console.log(error);
        }

        res.status(200).json({
            message: 'Exercise deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:8000/api/admin/exercise/create',
                body: { name: 'String', difficulty: 'String', programID: 'Integer' }
            }
        })
    })

    return router
}

