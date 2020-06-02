import { Request, Response } from "express";
import knex from "../database/connection";

export default class PointsController {
	async create(request: Request, response: Response) {
		const {
			name,
			email,
			whatsapp,
			latitude,
			longitude,
			city,
			uf,
			items,
		} = request.body;

		const trx = await knex.transaction();

		const point_id = await trx("points").insert({
			image: "image-fake",
			name,
			email,
			whatsapp,
			latitude,
			longitude,
			city,
			uf,
		});

		const pointsItems = items.map((items_id: number) => {
			return {
				items_id,
				points_id: point_id[0],
			};
		});

		await trx("points_items").insert(pointsItems);

		return response.json({ sucess: true });
	}
}
