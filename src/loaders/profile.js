const DataLoader = require('dataloader');

import models from '../models';

const batchProfiles = async (ids) => {
	const rows = await models.Profile.findAll({ where: { id: ids } });

	return ids.map((id) => rows.find((x) => x.id === id));
};

export const profile = new DataLoader(batchProfiles);
