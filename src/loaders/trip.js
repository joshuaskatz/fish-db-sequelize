const DataLoader = require('dataloader');

import models from '../models';

const batchTrips = async (ids) => {
	const rows = await models.Trip.findAll({ where: { userId: ids } });

	return ids.map((id) => rows.filter((x) => x.userId === id));
};

export const trips = new DataLoader(batchTrips);
