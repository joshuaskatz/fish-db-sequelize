import DataLoader from 'dataloader';

import models from '../models';

const batchRivers = async (ids) => {
	const rows = await models.River.findAll({ where: { id: ids } });

	return ids.map((id) => rows.find((x) => x.id === id));
};

export const river = new DataLoader(batchRivers);
