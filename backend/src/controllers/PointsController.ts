import { Request, Response } from "express";
import knex from "../database/connection";

export default class PointsController {
	async index(request: Request, response: Response) {
		const { city, uf, items } = request.query;

		const parsedItems = String(items)
			.split(",")
			.map((item) => Number(item.trim()));

		const points = await knex("points")
			.join("points_items", "points.id", "=", "points_items.points_id")
			.whereIn("points_items.items_id", parsedItems)
			.where("city", String(city))
			.where("uf", String(uf))
			.distinct()
			.select("points.*");

		return response.json(points);
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

		const points = {
			image: "image-fake",
			name,
			email,
			whatsapp,
			latitude,
			longitude,
			city,
			uf,
		};
		const insertedId = await trx("points").insert(points);

		const points_id = insertedId[0];

		const pointsItems = items
			.split(",")
			.map((item: string) => Number(item.trim()))
			.map((items_id: number) => {
				return {
					items_id,
					points_id,
				};
			});

		await trx("points_items").insert(pointsItems);

		await trx.commit();

		return response.json({ id: points_id, ...points });
	}
}
