const { modifyObjectFields } = require('graphql-tools');

module.exports = (sequelize, Sequelize) => {
	const { DataTypes } = Sequelize;

	const Profile = sequelize.define('profile', {
		bio: {
			type: DataTypes.STRING(2048),
			allowNull: true
		},
		location: {
			type: DataTypes.STRING,
			allowNull: true
		}
	});

	return Profile;
};
