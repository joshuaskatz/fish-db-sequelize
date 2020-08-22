const DataLoader = require('dataloader');

import models from '../models';

const batchUsers = async (ids) => {
	const rows = await models.User.findAll({ where: { id: ids } });

	return ids.map((id) => rows.find((x) => x.id === id));
};

export const users = new DataLoader(batchUsers);
