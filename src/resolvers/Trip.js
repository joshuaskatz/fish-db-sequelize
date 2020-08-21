export const Trip = {
	author: async (parent, args, { loaders }) => {
		return loaders.users.load(parent.userId);
	},
	river: async (parent, args, { loaders }) => {
		return loaders.river.load(parent.riverId);
	},
	fish: async (parent, args, { models }) => {
		return models.Fish.findAll({
			include: [ { model: models.Trip, where: { id: parent.id } } ],
			through: { attributes: [] }
		});
	},
	flies: async (parent, args, { models }) => {
		return models.Fly.findAll({
			include: [ { model: models.Trip, where: { id: parent.id } } ],
			through: { attributes: [] }
		});
	},
	tackle: async (parent, args, { models }) => {
		return models.Tackle.findAll({
			include: [ { model: models.Trip, where: { id: parent.id } } ],
			through: { attributes: [] }
		});
	}
};
