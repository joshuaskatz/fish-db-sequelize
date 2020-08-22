module.exports = (sequelize, Sequelize) => {
	const { DataTypes } = Sequelize;

	const RiverFly = sequelize.define('river_fly');

	return RiverFly;
};
