import { Op } from 'sequelize';

import getUserId from '../utils/getUserId';

export const Query = {
	fish: (_, { query = '', limit, offset, orderBy = 'ASC' }, { models }) => {
		return models.Fish.findAll({
			where: { species: { [Op.iLike]: `%${query}%` } },
			limit,
			offset,
			order: [ [ 'species', orderBy ] ]
		});
	},
	flies: (_, { query = '', limit, offset, orderBy = 'ASC' }, { models }) => {
		return models.Fly.findAll({
			where: {
				[Op.or]: [
					{ name: { [Op.iLike]: `%${query}%` } },
					{ color: { [Op.iLike]: `%${query}%` } },
					{ type: { [Op.iLike]: `%${query}%` } }
				]
			},
			limit,
			offset,
			order: [ [ 'name', orderBy ] ]
		});
	},
	profile: async (_, { query = '', limit, offset }, { models }) => {
		return models.Profile.findAll({
			where: { location: { [Op.iLike]: `%${query}%` } },
			limit,
			offset
		});
	},
	river: (_, { query = '', limit, offset, orderBy = 'ASC' }, { models }) => {
		return models.River.findAll({
			where: {
				[Op.or]: [
					{ name: { [Op.iLike]: `%${query}%` } },
					{ regulation: { [Op.iLike]: `%${query}%` } },
					{ size: { [Op.iLike]: `%${query}%` } }
				]
			},
			limit,
			offset,
			order: [ [ 'name', orderBy ] ]
		});
	},
	tackle: async (
		_,
		{ query = '', limit, offset, orderBy = 'ASC' },
		{ models }
	) => {
		return models.Tackle.findAll({
			where: {
				[Op.or]: [
					{ rod_name: { [Op.iLike]: `%${query}%` } },
					{ rod_weight: { [Op.iLike]: `%${query}%` } }
				]
			},
			limit,
			offset,
			order: [ [ 'rod_name', orderBy ] ]
		});
	},
	myTackle: async (
		_,
		{ query = '', limit, offset, orderBy = 'ASC' },
		{ models, request }
	) => {
		const userId = getUserId(request);

		return models.Tackle.findAll({
			where: {
				userId,
				[Op.or]: [
					{ rod_name: { [Op.iLike]: `%${query}%` } },
					{ rod_weight: { [Op.iLike]: `%${query}%` } }
				]
			},
			limit,
			offset,
			order: [ [ 'rod_name', orderBy ] ]
		});
	},
	trip: (_, { limit, offset, orderBy = 'ASC' }, { models }) => {
		return models.Trip.findAll({
			limit,
			offset,
			order: [ [ 'date', orderBy ] ]
		});
	},
	myTrips: async (
		_,
		{ limit, offset, orderBy = 'ASC' },
		{ models, request }
	) => {
		const userId = getUserId(request);

		return models.Trip.findAll({
			where: { userId },
			limit,
			offset,
			order: [ [ 'date', orderBy ] ]
		});
	},
	user: async (
		_,
		{ query = '', limit, offset, orderBy = 'ASC' },
		{ models }
	) => {
		return models.User.findAll({
			where: {
				[Op.or]: [
					{ name: { [Op.iLike]: `%${query}%` } },
					{ email: { [Op.iLike]: `%${query}%` } }
				]
			},
			include: [ models.Profile ],
			limit,
			offset,
			order: [ [ 'name', orderBy ] ]
		});
	},
	me: async (_, __, { models, request }) => {
		const id = getUserId(request);

		return models.User.findOne({
			where: { id },
			include: [ models.Profile ]
		});
	},
	myProfile: async (_, __, { models, request }) => {
		const userId = getUserId(request);

		return models.Profile.findOne({
			where: { userId }
		});
	}
};
