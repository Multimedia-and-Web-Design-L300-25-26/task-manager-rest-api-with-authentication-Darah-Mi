import mongoose from "mongoose";

// Create Task schema
// Fields:
// - title (String, required)
// - description (String)
// - completed (Boolean, default false)
// - owner (ObjectId, ref "User", required)
// - createdAt (default Date.now)

const taskSchema = new mongoose.Schema({
	title: { type: String, required: true },
	description: { type: String },
	completed: { type: Boolean, default: false },
	owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	createdAt: { type: Date, default: Date.now }
});

const inMemory = { tasks: [] };

let MTask = null;
try {
	MTask = mongoose.models.Task || mongoose.model("Task", taskSchema);
} catch (err) {
	// ignore
}

const Task = {
	async create(data) {
		if (mongoose.connection.readyState === 1 && MTask) {
			return MTask.create(data);
		}
		const _id = (Date.now() + Math.random()).toString(36);
		const task = { _id, ...data, createdAt: new Date() };
		inMemory.tasks.push(task);
		return task;
	},

	async find(query) {
		if (mongoose.connection.readyState === 1 && MTask) {
			return MTask.find(query).lean();
		}
		return inMemory.tasks.filter(t => {
			if (query.owner) return String(t.owner) === String(query.owner);
			return true;
		});
	},

	async findOneAndDelete(query) {
		if (mongoose.connection.readyState === 1 && MTask) {
			return MTask.findOneAndDelete(query).lean();
		}
		const idx = inMemory.tasks.findIndex(t => String(t._id) === String(query._id) && (!query.owner || String(t.owner) === String(query.owner)));
		if (idx === -1) return null;
		const [deleted] = inMemory.tasks.splice(idx, 1);
		return deleted;
	}
};

export default Task;
