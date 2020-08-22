module.exports = (sequelize, Sequelize) => {
	const { DataTypes } = Sequelize;

	const Fly = sequelize.define('fly', {
		type: {
			type: DataTypes.STRING,
			allowNull: false
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		color: {
			type: DataTypes.STRING,
			allowNull: false
		}
	});

	Fly.associate = (models) => {
		Fly.belongsToMany(models.River, {
			through: 'river_fly'
		});

		Fly.belongsToMany(models.Trip, {
			through: 'trip_fly'
		});
	};

	return Fly;
};
