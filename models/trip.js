module.exports = (sequelize, Sequelize) => {
	const { DataTypes } = Sequelize;

	const Trip = sequelize.define('trip', {
		date: {
			type: DataTypes.DATEONLY,
			allowNull: false
		},
		time_spent: {
			type: DataTypes.DECIMAL(4, 2),
			allowNull: true
		},
		amount_caught: {
			type: DataTypes.STRING,
			allowNull: false
		},
		average_size: {
			type: DataTypes.STRING,
			allowNull: true
		},
		largest_size: {
			type: DataTypes.STRING,
			allowNull: true
		}
	});

	Trip.associate = (models) => {
		Trip.belongsToMany(models.Fish, {
			through: 'trip_fishes'
		});

		Trip.belongsToMany(models.Fly, {
			through: 'trip_flies'
		});

		Trip.belongsToMany(models.Tackle, {
			through: 'trip_tackles'
		});
	};

	return Trip;
};
