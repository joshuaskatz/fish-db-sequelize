module.exports = (sequelize, Sequelize) => {
	const { DataTypes } = Sequelize;

	const Fish = sequelize.define('fish', {
		species: {
			type: DataTypes.STRING,
			allowNull: false
		}
	});

	Fish.associate = (models) => {
		Fish.belongsToMany(models.River, {
			through: 'river_fish'
		});

		Fish.belongsToMany(models.Trip, {
			through: 'trip_fish'
		});
	};

	return Fish;
};
