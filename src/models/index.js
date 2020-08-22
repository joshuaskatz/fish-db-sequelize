import Sequelize from 'sequelize';
import path from 'path';

const sequelize = new Sequelize(process.env.DATABASE_URI, {
	dialect: 'postgres',
	protocol: 'postgres',
	dialectOptions: {
		ssl: {
			require: true,
			//Necessary for use with heroku
			rejectUnauthorized: false
		}
	},
	define: {
		//add createdAt/updateAt manually if needed
		timestamps: false
	}
});

sequelize
	.authenticate()
	.then(() => console.log('Connected to db'))
	.catch((e) => console.log(e));

const db = {
	User: require(path.join(__dirname, './user'))(sequelize, Sequelize),
	Profile: require(path.join(__dirname, './profile'))(sequelize, Sequelize),
	Trip: require(path.join(__dirname, './trip'))(sequelize, Sequelize),
	Fish: require(path.join(__dirname, './fish'))(sequelize, Sequelize),
	Fly: require(path.join(__dirname, './fly'))(sequelize, Sequelize),
	Tackle: require(path.join(__dirname, './tackle'))(sequelize, Sequelize),
	River: require(path.join(__dirname, './river'))(sequelize, Sequelize),
	RiverFish: require(path.join(__dirname, './river_fish'))(
		sequelize,
		Sequelize
	),
	RiverFly: require(path.join(__dirname, './river_fly'))(
		sequelize,
		Sequelize
	),
	TripFish: require(path.join(__dirname, './trip_fish'))(
		sequelize,
		Sequelize
	),
	TripFly: require(path.join(__dirname, './trip_fly'))(sequelize, Sequelize),
	TripTackle: require(path.join(__dirname, './trip_tackle'))(
		sequelize,
		Sequelize
	)
};

Object.keys(db).forEach((modelName) => {
	if ('associate' in db[modelName]) {
		db[modelName].associate(db);
	}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
