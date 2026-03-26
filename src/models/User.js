import mongoose from "mongoose";

const inMemory = {
  users: []
};

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  createdAt: { type: Date, default: Date.now }
});

let MUser = null;
try {
  MUser = mongoose.models.User || mongoose.model("User", userSchema);
} catch (err) {
  // ignore
}

const User = {
  async findOne(query) {
    if (mongoose.connection.readyState === 1 && MUser) {
      return MUser.findOne(query).lean();
    }

    if (query._id) {
      return inMemory.users.find(u => String(u._id) === String(query._id)) || null;
    }

    if (query.email) {
      return inMemory.users.find(u => u.email === query.email) || null;
    }

    return null;
  },

  async findById(id) {
    if (mongoose.connection.readyState === 1 && MUser) {
      return MUser.findById(id).lean();
    }
    return inMemory.users.find(u => String(u._id) === String(id)) || null;
  },

  async create(data) {
    if (mongoose.connection.readyState === 1 && MUser) {
      return MUser.create(data);
    }

    const _id = (Date.now() + Math.random()).toString(36);
    const user = { _id, ...data };
    inMemory.users.push(user);
    return user;
  }
};

export default User;
