module.exports = (sequelize, Sequelize) => {
	const { DataTypes } = Sequelize;

	const River = sequelize.define('river', {
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		latitude: {
			type: DataTypes.STRING,
			allowNull: false
		},
		longitude: {
			type: DataTypes.STRING,
			allowNull: false
		},
		brush: {
			type: DataTypes.STRING,
			allowNull: false
		},
		size: {
			type: DataTypes.STRING,
			allowNull: false
		},
		regulation: {
			type: DataTypes.STRING,
			allowNull: false
		},
		stocked: {
			type: DataTypes.BOOLEAN,
			allowNull: true
		}
	});

	River.associate = (models) => {
		River.hasMany(models.Trip, {
			foreignKey: 'riverId',
			as: 'river'
		});

		River.belongsToMany(models.Fish, {
			through: 'river_fishes'
		});

		River.belongsToMany(models.Fly, {
			through: 'river_flies'
		});
	};

	return River;
};
