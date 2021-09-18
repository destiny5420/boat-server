const mongoose = require("mongoose");
const LeaderBoard = require("./models/leaderboard");
const uri = `mongodb+srv://player:${process.env.MONGODB_PASSWORD}@leaderboard.am973.mongodb.net/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`;
const dbName = process.env.MONGODB_DATABASE;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (err) => {
  console.err(`connection error`, err);
});
db.once("open", (db) => console.log(`Connected to MonoDB`));

async function register(data) {
  const dataObj = {
    name: data.name,
  };

  const findObj = await LeaderBoard.find(dataObj);
  console.log(`findObj: `, findObj);

  // The user already exits
  if (findObj.length !== 0) {
    return {
      success: true,
      result: "The user already exits",
    };
  }

  const createObj = await LeaderBoard.create(dataObj);
  console.log(`createObj: `, createObj);

  return {
    success: true,
    result: "register successfully!",
  };
}

async function update(data) {
  try {
    const filter = {
      name: data.name,
    };

    const update = {
      score: data.score,
    };

    const findObj = await LeaderBoard.find(filter);

    if (data.score <= findObj[0].score && findObj.length === 1) {
      return { name: findObj[0].name, score: findObj[0].score };
    } else {
      const doc = await LeaderBoard.findOneAndUpdate(filter, update);

      return {
        name: doc.name,
        score: doc.score,
      };
    }
  } catch (err) {
    return {
      result: err.stack,
      success: false,
    };
  }
}

async function find() {
  try {
    const sortQuery = {
      score: -1,
    };
    const cursor = await LeaderBoard.find().sort(sortQuery).limit(3);

    const resultObj = [];
    for (let i = 0; i < cursor.length; i++) {
      const data = await LeaderBoard.findById(cursor[i]._id);

      resultObj.push({
        name: data.name,
        score: data.score,
      });
    }

    console.log(`resultObj: `, resultObj);

    return {
      success: true,
      result: resultObj,
    };
  } catch (err) {
    return {
      message: err.stack,
      success: false,
    };
  }
}

module.exports = {
  register: async (data) => {
    return await register(data);
  },
  update: async (data) => {
    return await update(data);
  },
  find: async () => {
    return await find();
  },
  gameOver: async (data) => {
    const playerData = await update(data);

    const findData = await find();

    return {
      success: true,
      result: {
        topUsers: findData,
        player: playerData.data,
      },
    };
  },
};
