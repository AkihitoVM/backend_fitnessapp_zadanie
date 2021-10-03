import { Router, Request, Response, NextFunction } from 'express'

import { models, db } from '../db'
import { ExerciseModel } from '../db/exercise'
import exerciseUtil from '../utils/utils.exercise'

const router: Router = Router()
const Op = db.Sequelize.Op;
const {
	Exercise,
	Program
} = models

export default () => {
	router.get('/', async (req: Request, res: Response, next: NextFunction) => {
		let response = null

		/* Check if query parameters was set */
		if (Object.keys(req.query).length) {

			/* Get query parameters */
			const { page, size, search, programID } = req.query;

			/* Check if search OR programID param was set */
			let condition = search ? { name: { [Op.like]: `%${search}%` } } : programID ? { id: programID } : null;

			/* Get pagination info by page number and size of elements in page */
			const { limit, offset } = exerciseUtil.getPagination(Number(page), Number(size));

			/* Get some data from Exercise model by conditions and another parameters */
			const exercises: ExerciseModel = await Exercise.findAndCountAll({
				where: condition,
				include: [{
					model: Program,
					as: 'program'
				}],
				offset: offset,
				limit: limit
			})

			/* Get pretty response info */
			response = exerciseUtil.getPagingData(exercises, Number(page), limit);

			return res.json({
				data: response,
				message: req.headers['language'] === 'en' ? 'List of exercises' : 'Zoznam cvikov'
			})
		}

		/* If !query parameters => return all exercises */
		response = await Exercise.findAll({
			include: [{
				model: Program,
				as: 'program'
			}]
		})

		return res.json({
			data: response,
			message: req.headers['language'] === 'en' ? 'List of exercises' : 'Zoznam cvikov'
		})
	})







	return router
}

