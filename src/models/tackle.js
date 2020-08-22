module.exports = (sequelize, Sequelize) => {
	const { DataTypes } = Sequelize;

	const Tackle = sequelize.define('tackle', {
		rod_name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		rod_weight: {
			type: DataTypes.STRING,
			allowNull: false
		},
		rod_length_ft: {
			type: DataTypes.STRING,
			allowNull: false
		},
		rod_length_in: {
			type: DataTypes.STRING,
			allowNull: false
		}
	});

	Tackle.associate = (models) => {
		Tackle.belongsToMany(models.Trip, {
			through: 'trip_tackle'
		});
	};

	return Tackle;
};
