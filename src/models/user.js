module.exports = (sequelize, Sequelize) => {
	const { DataTypes } = Sequelize;

	const User = sequelize.define('user', {
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false
		},
		reset_token: {
			type: DataTypes.STRING,
			allowNull: true
		},
		reset_token_expiry: {
			type: DataTypes.BIGINT,
			allowNull: true
		}
	});

	User.associate = (models) => {
		User.hasOne(models.Profile, {
			foreignKey: 'userId'
		});
		User.hasMany(models.Tackle, {
			foreignKey: 'userId',
			as: 'tackle'
		});
		User.hasMany(models.Trip, {
			foreignKey: 'userId',
			as: 'trip'
		});
	};

	return User;
};
