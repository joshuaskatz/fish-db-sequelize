import DataLoader from 'dataloader';

import models from '../../models';

const batchTripFish = async (ids) => {
	const tripFish = await models.TripFish.findAll({
		where: { tripId: ids },
		attibutes: [ 'fishId' ]
	});

	const fishMap = tripFish.map(({ fishId }) => {
		return fishId;
	});

	const tripMap = tripFish.map(({ tripId }) => {
		return tripId;
	});

	const fishes = await models.Fish.findAll({
		include: [ { model: models.Trip, where: { id: tripMap } } ]
	});

	return tripMap.map((id) => fishes.filter((x) => x.id === id));
};

export const tripFish = new DataLoader(batchTripFish);
