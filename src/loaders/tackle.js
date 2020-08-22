const DataLoader = require('dataloader');

import models from '../models';

const batchTackle = async (ids) => {
	const rows = await models.Tackle.findAll({ where: { userId: ids } });

	return ids.map((id) => rows.filter((x) => x.userId === id));
};

export const tackle = new DataLoader(batchTackle);
