import bcrypt from 'bcryptjs';

import hashPassword from '../utils/hashPassword';
import generateToken from '../utils/generateToken';
import getUserId from '../utils/getUserId';
import { toTitleCase } from '../utils/toTitleCase';

export const Mutation = {
	signup: async (_, { data }, { models }) => {
		const { name, email } = data;

		const password = await hashPassword(data.password);

		return models.User.create({
			name: toTitleCase(name),
			email,
			password
		});
	},
	update_user: async (_, { data }, { models, request }) => {
		const id = getUserId(request);

		const userExists = await models.User.findOne({ where: { id } });

		if (!userExists) {
			throw new Error("User doesn't exist. Care to create an account?");
		}

		const { name, email } = data;

		const password = await hashPassword(data.password);

		if (data.password) {
			await models.User.update({ password }, { where: { id } });
		}

		await models.User.update({ name, email }, { where: { id } });

		return models.User.findOne({ where: { id } });
	},
	delete_user: async (_, args, { models, request }) => {
		const id = getUserId(request);

		const userExists = await models.User.findOne({ where: { id } });

		if (!userExists) {
			throw new Error("User doesn't exist.");
		}

		await userExists.destroy();

		return userExists;
	},
	login: async (_, { data }, { models }) => {
		const { email, password } = data;

		const user = await models.User.findOne({
			where: { email }
		});

		if (!user) {
			throw new Error('Unable to login');
		}

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			throw new Error('Unable to login');
		}

		return {
			user,
			token: generateToken(user.id)
		};
	},
	create_profile: async (_, { data }, { models, request }) => {
		const userId = getUserId(request);

		const profileExists = await models.Profile.findOne({
			where: { userId }
		});

		if (profileExists) {
			throw new Error('You already have a profile! Care to update it?');
		}

		const { bio, location } = data;

		return models.Profile.create({
			bio,
			location,
			userId
		});
	},
	update_profile: async (_, { data }, { models, request }, info) => {
		const userId = getUserId(request);

		const profileExists = await models.Profile.findOne({
			where: { userId }
		});

		if (!profileExists) {
			throw new Error("You don't have a profile! Care to create one?");
		}

		const { bio, location } = data;

		await models.Profile.update(
			{
				bio,
				location
			},
			{ where: { userId } }
		);

		return models.Profile.findOne({ where: { userId } });
	},
	delete_profile: async (_, args, { models, request }) => {
		const userId = getUserId(request);

		const profileExists = await models.Profile.findOne({
			where: { userId }
		});

		if (!profileExists) {
			throw new Error("You don't have a profile! Care to create one?");
		}

		await profileExists.destroy();

		return profileExists;
	},
	create_fish: async (_, { data }, { models, request }) => {
		getUserId(request);

		const species = toTitleCase(data.species);

		const fishExists = await models.Fish.findOne({
			where: { species }
		});

		if (fishExists) {
			throw new Error('Fish already exists!');
		}

		return models.Fish.create({ species });
	},
	update_fish: async (_, { data, id }, { models, request }) => {
		getUserId(request);

		const species = toTitleCase(data.species);

		const fishExists = await models.Fish.findOne({ where: { id } });

		if (!fishExists) {
			throw new Error(
				"Fish doesn't exist! Care to add it to our database?"
			);
		}

		await models.Fish.update({ species }, { where: { id } });

		return models.Fish.findOne({ where: { id } });
	},
	delete_fish: async (_, { id }, { models, request }) => {
		getUserId(request);

		const fishExists = await models.Fish.findOne({ where: { id } });

		if (!fishExists) {
			throw new Error(
				"Fish doesn't exist! Care to add it to our database?"
			);
		}

		await fishExists.destroy();

		return fishExists;
	},
	create_fly: async (_, { data }, { models, request }) => {
		getUserId(request);

		const { type, name, color } = data;

		const flyExists = await models.Fly.findOne({
			where: {
				type: toTitleCase(type),
				name: toTitleCase(name),
				color: toTitleCase(color)
			}
		});

		if (flyExists) {
			throw new Error('Fly already exists! Care to add a new one?');
		}

		return models.Fly.create({
			type: toTitleCase(type),
			name: toTitleCase(name),
			color: toTitleCase(color)
		});
	},
	update_fly: async (_, { data, id }, { models, request }) => {
		getUserId(request);

		const flyExists = await models.Fly.findOne({ where: { id } });

		if (!flyExists) {
			throw new Error(
				"Fly doesn't exist! Care to add one to the database?"
			);
		}

		const { type, name, color } = data;

		await models.Fly.update(
			{
				type: toTitleCase(type),
				name: toTitleCase(name),
				color: toTitleCase(color)
			},
			{ where: { id } }
		);

		return models.Fly.findOne({ where: { id } });
	},
	delete_fly: async (_, { id }, { models, request }) => {
		getUserId(request);

		const flyExists = await models.Fly.findOne({ where: { id } });

		if (!flyExists) {
			throw new Error(
				"Fly doesn't exist! Care to add one to the database?"
			);
		}

		await flyExists.destroy();

		return flyExists;
	},
	create_river: async (_, { data }, { models, request }) => {
		getUserId(request);

		const {
			longitude,
			latitude,
			stocked,
			regulation,
			size,
			brush,
			fish,
			flies
		} = data;

		const name = toTitleCase(data.name);

		const riverPromise = models.River.create({
			name,
			longitude,
			latitude,
			stocked,
			regulation,
			size,
			brush
		});

		const [ river ] = await Promise.all([ riverPromise ]);

		fish.forEach((fishId) => {
			return models.RiverFish.create({
				fishId,
				riverId: river.id
			});
		});

		flies.forEach((flyId) => {
			return models.RiverFly.create({
				flyId,
				riverId: river.id
			});
		});

		return riverPromise;
	},
	update_river: async (_, { data, id }, { models, request }) => {
		getUserId(request);

		const riverExists = await models.River.findOne({ where: { id } });

		if (!riverExists) {
			throw new Error(
				"River doesn't exist! Care to add one to the database?"
			);
		}

		const {
			longitude,
			latitude,
			stocked,
			regulation,
			size,
			brush,
			fish,
			flies
		} = data;

		if (data.name) {
			const name = toTitleCase(data.name);

			await models.River.update(
				{
					name,
					longitude,
					latitude,
					stocked,
					regulation,
					size,
					brush
				},
				{ where: { id } }
			);
		}

		await models.River.update(
			{
				longitude,
				latitude,
				stocked,
				regulation,
				size,
				brush
			},
			{ where: { id } }
		);

		if (fish) {
			fish.forEach(async (fishId) => {
				await models.RiverFish.destroy({ where: { riverId: id } });

				return models.RiverFish.create({
					fishId,
					riverId: id
				});
			});
		}

		if (flies) {
			flies.forEach(async (flyId) => {
				await models.RiverFly.destroy({ where: { riverId: id } });

				return models.RiverFly.create({
					flyId,
					riverId: id
				});
			});
		}
	},

	delete_river: async (_, { id }, { models, request }) => {
		getUserId(request);

		const riverExists = await models.River.findOne({ where: { id } });

		if (!riverExists) {
			throw new Error(
				"River doesn't exist! Care to add one to the database?"
			);
		}

		await models.River.destroy({ where: { id } });

		await models.RiverFish.destroy({ where: { riverId: id } });

		await models.RiverFly.destroy({ where: { riverId: id } });

		return riverExists;
	},
	create_tackle: async (_, { data }, { models, request }) => {
		const userId = getUserId(request);

		const { rod_name, rod_weight, rod_length_ft, rod_length_in } = data;

		const tackleExists = await models.Tackle.findOne({
			where: {
				userId,
				rod_name: toTitleCase(rod_name),
				rod_weight: toTitleCase(rod_weight),
				rod_length_ft: toTitleCase(rod_length_ft),
				rod_length_in: toTitleCase(rod_length_in)
			}
		});

		if (tackleExists) {
			throw new Error('Tackle already exists. Care to add another?');
		}

		return models.Tackle.create({
			userId,
			rod_name: toTitleCase(rod_name),
			rod_weight: toTitleCase(rod_weight),
			rod_length_ft: toTitleCase(rod_length_ft),
			rod_length_in: toTitleCase(rod_length_in)
		});
	},
	update_tackle: async (_, { data, id }, { models, request }) => {
		//Cannot update other users tackle
		const userId = getUserId(request);

		const { rod_name, rod_weight, rod_length_ft, rod_length_in } = data;

		const tackleExists = await models.Tackle.findOne({
			where: { id, userId }
		});

		if (!tackleExists) {
			throw new Error("Tackle doesn't exist! Care to add one?");
		}

		await models.Tackle.update(
			{
				rod_name: toTitleCase(rod_name),
				rod_weight: toTitleCase(rod_weight),
				rod_length_ft: toTitleCase(rod_length_ft),
				rod_length_in: toTitleCase(rod_length_in)
			},
			{ where: { id } }
		);

		return models.Tackle.findOne({ where: { id, userId } });
	},
	delete_tackle: async (_, { id }, { models, request }) => {
		//Cannot delete other users tackle
		const userId = getUserId(request);

		const tackleExists = await models.Tackle.findOne({
			where: { id, userId }
		});

		if (!tackleExists) {
			throw new Error('Cannot delete tackle.');
		}

		await tackleExists.destroy();

		return tackleExists;
	},
	create_trip: async (_, { data }, { models, request }) => {
		const userId = getUserId(request);

		const {
			date,
			time_spent,
			amount_caught,
			average_size,
			largest_size,
			fish,
			flies,
			river,
			tackle
		} = data;

		const tripPromise = models.Trip.create({
			date,
			time_spent,
			amount_caught,
			average_size,
			largest_size,
			riverId: river,
			userId
		});

		const [ trip ] = await Promise.all([ tripPromise ]);

		fish.forEach((fishId) => {
			return models.TripFish.create({
				fishId,
				tripId: trip.id
			});
		});

		flies.forEach((flyId) => {
			return models.TripFly.create({
				flyId,
				tripId: trip.id
			});
		});

		tackle.forEach((tackleId) => {
			return models.TripTackle.create({
				tackleId,
				tripId: trip.id
			});
		});

		return tripPromise;
	},
	update_trip: async (_, { data, id }, { models, request }) => {
		const userId = getUserId(request);

		const tripExists = await models.Trip.findOne({ where: { id, userId } });

		if (!tripExists) {
			throw new Error("Trip doesn't exist! Care to add one?");
		}

		const {
			date,
			time_spent,
			amount_caught,
			average_size,
			largest_size,
			fish,
			flies,
			river,
			tackle
		} = data;

		await models.Trip.update(
			{
				date,
				time_spent,
				amount_caught,
				average_size,
				largest_size,
				riverId: river
			},
			{ where: { id, userId } }
		);

		if (fish) {
			fish.forEach(async (fishId) => {
				await models.TripFish.destroy({ where: { tripId: id } });

				return models.TripFish.create({
					fishId,
					tripId: id
				});
			});
		}
		if (flies) {
			flies.forEach(async (flyId) => {
				await models.TripFly.destroy({ where: { tripId: id } });

				return models.TripFly.create({
					flyId,
					tripId: id
				});
			});
		}

		if (tackle) {
			tackle.forEach(async (tackleId) => {
				await models.TripTackle.destroy({ where: { tripId: id } });

				return models.TripTackle.create({
					tackleId,
					tripId: id
				});
			});
		}

		return tripExists;
	},
	delete_trip: async (_, { id }, { models, request }) => {
		const userId = getUserId(request);

		const tripExists = await models.Trip.findOne({ where: { id, userId } });

		if (!tripExists) {
			throw new Error("Trip doesn't exist! Care to add one?");
		}

		await models.Trip.destroy({ where: { id, userId } });

		await models.TripFish.destroy({ where: { tripId: id } });

		await models.TripFly.destroy({ where: { tripId: id } });

		await models.TripTackle.destroy({ where: { tripId: id } });

		return tripExists;
	}
};
