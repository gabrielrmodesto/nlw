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

		const point = {
			image: "image-fake",
			name,
			email,
			whatsapp,
			latitude,
			longitude,
			city,
			uf,
		};
		const insertedId = await trx("points").insert(point);

		const pointId = insertedId[0];

		const pointsItems = items.map((items_id: number) => {
			return {
				items_id,
				points_id: pointId,
			};
		});

		await trx("points_items").insert(pointsItems);

		return response.json({ id: pointId, ...point });
	}

	async show(request: Request, response: Response) {
		const { id } = request.params;

		const point = await knex("points").where("id", id).first();

		if (!point)
			return response.status(400).json({ message: "Point not found" });

		const items = await knex("items")
			.join("points_items", "items.id", "=", "points_items.items_id")
			.where("points_items.points_id", id)
			.select("items.title");

		return response.json({ point, items });
	}
}
