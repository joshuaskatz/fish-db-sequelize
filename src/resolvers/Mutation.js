import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { promisify } from 'util';

import { mailClient } from '../utils/mailClient';
import hashPassword from '../utils/hashPassword';
import generateToken from '../utils/generateToken';
import getUserId from '../utils/getUserId';
import { toTitleCase } from '../utils/toTitleCase';
import { Op } from 'sequelize';

export const Mutation = {
	signup: async (_, { data }, { models, pubsub }) => {
		const { name, email } = data;

		const password = await hashPassword(data.password);

		const user = await models.User.create({
			name: toTitleCase(name),
			email,
			password
		});

		await pubsub.publish('user', {
			user: {
				mutation: 'CREATED',
				data: user
			}
		});

		return user;
	},
	update_user: async (_, { data }, { models, request, pubsub }) => {
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

		const user = await models.User.findOne({ where: { id } });

		await pubsub.publish('user', {
			user: {
				mutation: 'UPDATED',
				data: user
			}
		});

		return user;
	},
	delete_user: async (_, __, { models, request, pubsub }) => {
		const id = getUserId(request);

		const userExists = await models.User.findOne({ where: { id } });

		if (!userExists) {
			throw new Error("User doesn't exist.");
		}

		await userExists.destroy();

		await pubsub.publish('user', {
			user: {
				mutation: 'DELETED',
				data: userExists
			}
		});

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
	request_reset_password: async (_, { email }, { models }) => {
		const user = await models.User.findAll({
			where: {
				email
			}
		});

		if (!user) {
			throw new Error('No user found with that email.');
		}

		const randomBytesAsync = promisify(randomBytes);
		const reset_token = (await randomBytesAsync(20)).toString('hex');
		const reset_token_expiry = Date.now() + 3600000;

		await models.User.update(
			{
				reset_token,
				reset_token_expiry
			},
			{
				where: { email }
			}
		);

		mailClient.send(
			{
				text: `Use the following token to reset your password: ${reset_token}`,
				from: process.env.MAIL_USER,
				to: email,
				subject: 'Your Password Reset Token'
			},
			(err, message) => {
				console.log(err || message);
			}
		);

		return true;
	},
	reset_password: async (_, { data }, { models }) => {
		const { email, reset_token } = data;

		const password = await hashPassword(data.password);

		const user = await models.User.findAll({
			where: {
				email,
				reset_token,
				reset_token_expiry: {
					[Op.gte]: Date.now() - 3600000
				}
			}
		});

		if (!user) {
			throw new Error('Password reset token is invalid or expired.');
		}

		await models.User.update(
			{
				password,
				reset_token: null,
				reset_token_expiry: null
			},
			{
				where: { email }
			}
		);

		return true;
	},
	create_profile: async (_, { data }, { models, request, pubsub }) => {
		const userId = getUserId(request);

		const profileExists = await models.Profile.findOne({
			where: { userId }
		});

		if (profileExists) {
			throw new Error('You already have a profile! Care to update it?');
		}

		const { bio, location } = data;

		const profile = await models.Profile.create({
			bio,
			location,
			userId
		});

		await pubsub.publish('profile', {
			profile: {
				mutation: 'CREATED',
				data: profile
			}
		});

		return profile;
	},
	update_profile: async (_, { data }, { models, request, pubsub }) => {
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

		const profile = await models.Profile.findOne({ where: { userId } });

		await pubsub.publish('profile', {
			profile: {
				mutation: 'UPDATED',
				data: profile
			}
		});

		return profile;
	},
	delete_profile: async (_, __, { models, request, pubsub }) => {
		const userId = getUserId(request);

		const profileExists = await models.Profile.findOne({
			where: { userId }
		});

		if (!profileExists) {
			throw new Error("You don't have a profile! Care to create one?");
		}

		await profileExists.destroy();

		await pubsub.publish('profile', {
			profile: {
				mutation: 'DELETED',
				data: profileExists
			}
		});

		return profileExists;
	},
	create_fish: async (_, { data }, { models, request, pubsub }) => {
		getUserId(request);

		const species = toTitleCase(data.species);

		const fishExists = await models.Fish.findOne({
			where: { species }
		});

		if (fishExists) {
			throw new Error('Fish already exists!');
		}

		const fish = await models.Fish.create({ species });

		await pubsub.publish('fish', {
			fish: {
				mutation: 'CREATED',
				data: fish
			}
		});

		return fish;
	},
	update_fish: async (_, { data, id }, { models, request, pubsub }) => {
		getUserId(request);

		const species = toTitleCase(data.species);

		const fishExists = await models.Fish.findOne({ where: { id } });

		if (!fishExists) {
			throw new Error(
				"Fish doesn't exist! Care to add it to our database?"
			);
		}

		await models.Fish.update({ species }, { where: { id } });

		const fish = await models.Fish.findOne({ where: { id } });

		await pubsub.publish('fish', {
			fish: {
				mutation: 'UPDATED',
				data: fish
			}
		});

		return fish;
	},
	delete_fish: async (_, { id }, { models, request, pubsub }) => {
		getUserId(request);

		const fishExists = await models.Fish.findOne({ where: { id } });

		if (!fishExists) {
			throw new Error(
				"Fish doesn't exist! Care to add it to our database?"
			);
		}

		await fishExists.destroy();

		await pubsub.publish('fish', {
			fish: {
				mutation: 'DELETED',
				data: fishExists
			}
		});

		return fishExists;
	},
	create_fly: async (_, { data }, { models, request, pubsub }) => {
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

		const fly = await models.Fly.create({
			type: toTitleCase(type),
			name: toTitleCase(name),
			color: toTitleCase(color)
		});

		await pubsub.publish('fly', {
			fly: {
				mutation: 'CREATED',
				data: fly
			}
		});

		return fly;
	},
	update_fly: async (_, { data, id }, { models, request, pubsub }) => {
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

		const fly = await models.Fly.findOne({ where: { id } });

		await pubsub.publish('fly', {
			fly: {
				mutation: 'UPDATED',
				data: fly
			}
		});

		return fly;
	},
	delete_fly: async (_, { id }, { models, request, pubsub }) => {
		getUserId(request);

		const flyExists = await models.Fly.findOne({ where: { id } });

		if (!flyExists) {
			throw new Error(
				"Fly doesn't exist! Care to add one to the database?"
			);
		}

		await flyExists.destroy();

		await pubsub.publish('fly', {
			fly: {
				mutation: 'DELETED',
				data: flyExists
			}
		});

		return flyExists;
	},
	create_river: async (_, { data }, { models, request, pubsub }) => {
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

		const populatedRiver = await models.River.findOne({
			where: { id: river.id }
		});

		await pubsub.publish('river', {
			river: {
				mutation: 'CREATED',
				data: populatedRiver
			}
		});

		return populatedRiver;
	},
	update_river: async (_, { data, id }, { models, request, pubsub }) => {
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

		const river = await models.River.findOne({ where: { id } });

		await pubsub.publish('river', {
			river: {
				mutation: 'UPDATED',
				data: river
			}
		});

		return river;
	},

	delete_river: async (_, { id }, { models, request, pubsub }) => {
		getUserId(request);

		const riverExists = await models.River.findOne({ where: { id } });

		if (!riverExists) {
			throw new Error(
				"River doesn't exist! Care to add one to the database?"
			);
		}

		await riverExists.destroy({ where: { id } });

		await models.RiverFish.destroy({ where: { riverId: id } });

		await models.RiverFly.destroy({ where: { riverId: id } });

		await pubsub.publish('river', {
			river: {
				mutation: 'DELETED',
				data: riverExists
			}
		});

		return riverExists;
	},
	create_tackle: async (_, { data }, { models, request, pubsub }) => {
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

		const tackle = await models.Tackle.create({
			userId,
			rod_name: toTitleCase(rod_name),
			rod_weight: rod_weight,
			rod_length_ft: rod_length_ft,
			rod_length_in: rod_length_in
		});

		await pubsub.publish('tackle', {
			tackle: {
				mutation: 'CREATED',
				data: tackle
			}
		});

		return tackle;
	},
	update_tackle: async (_, { data, id }, { models, request, pubsub }) => {
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
				rod_weight,
				rod_length_ft,
				rod_length_in
			},
			{ where: { id } }
		);

		const tackle = await models.Tackle.findOne({ where: { id, userId } });

		await pubsub.publish('tackle', {
			tackle: {
				mutation: 'UPDATED',
				data: tackle
			}
		});

		return tackle;
	},
	delete_tackle: async (_, { id }, { models, request, pubsub }) => {
		//Cannot delete other users tackle
		const userId = getUserId(request);

		const tackleExists = await models.Tackle.findOne({
			where: { id, userId }
		});

		if (!tackleExists) {
			throw new Error('Cannot delete tackle.');
		}

		await tackleExists.destroy();

		await pubsub.publish('tackle', {
			tackle: {
				mutation: 'DELETED',
				data: tackleExists
			}
		});

		return tackleExists;
	},
	create_trip: async (_, { data }, { models, request, pubsub }) => {
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

		await pubsub.publish('trip', {
			trip: {
				mutation: 'CREATED',
				data: tripPromise
			}
		});

		return tripPromise;
	},
	update_trip: async (_, { data, id }, { models, request, pubsub }) => {
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

		const populatedTrip = await models.Trip.findOne({
			where: { id, userId }
		});

		await pubsub.publish('trip', {
			trip: {
				mutation: 'UPDATED',
				data: populatedTrip
			}
		});

		return populatedTrip;
	},
	delete_trip: async (_, { id }, { models, request, pubsub }) => {
		const userId = getUserId(request);

		const tripExists = await models.Trip.findOne({ where: { id, userId } });

		if (!tripExists) {
			throw new Error("Trip doesn't exist! Care to add one?");
		}

		await models.Trip.destroy({ where: { id, userId } });

		await models.TripFish.destroy({ where: { tripId: id } });

		await models.TripFly.destroy({ where: { tripId: id } });

		await models.TripTackle.destroy({ where: { tripId: id } });

		await pubsub.publish('trip', {
			trip: {
				mutation: 'DELETED',
				data: tripExists
			}
		});

		return tripExists;
	}
};
