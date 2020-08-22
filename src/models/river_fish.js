module.exports = (sequelize, Sequelize) => {
	const { DataTypes } = Sequelize;

	const RiverFish = sequelize.define('river_fish');

	return RiverFish;
};
