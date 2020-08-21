export const Subscription = {
	fish: {
		subscribe: (_, __, { pubsub }) => {
			return pubsub.asyncIterator('fish');
		}
	},
	fly: {
		subscribe: (_, __, { pubsub }) => {
			return pubsub.asyncIterator('fly');
		}
	},
	profile: {
		subscribe: (_, __, { pubsub }) => {
			return pubsub.asyncIterator('profile');
		}
	},
	user: {
		subscribe: (_, __, { pubsub }) => {
			return pubsub.asyncIterator('user');
		}
	},
	river: {
		subscribe: (_, __, { pubsub }) => {
			return pubsub.asyncIterator('river');
		}
	},
	tackle: {
		subscribe: (_, __, { pubsub }) => {
			return pubsub.asyncIterator('tackle');
		}
	},
	trip: {
		subscribe: (_, __, { pubsub }) => {
			return pubsub.asyncIterator('trip');
		}
	}
};
