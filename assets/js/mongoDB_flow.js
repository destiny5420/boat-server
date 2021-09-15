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
  console.err(`connection error`, error);
});
db.once("open", (db) => console.log(`Connected to MonoDB`));

function register(data) {
  const dataObj = {
    name: data.name,
  };
  return new Promise((resolve, reject) => {
    LeaderBoard.create(dataObj, (err, user) => {
      if (err) {
        reject({
          success: false,
          result: err,
        });
      }

      console.log(`register successfully! / data: `, user);

      return resolve({
        success: true,
        result: "register successfully!",
      });
    });
  });
}

async function update(data) {
  try {
    await client.connect();

    const db = client.db(dbName);
    const leaderboardCl = db.collection("leaderboard");

    const filter = {
      name: data.name,
    };

    const updateDocument = {
      $set: {
        score: data.score,
      },
    };

    const options = {
      projection: { _id: 0, name: 1, score: 1 },
    };

    const findResult = await leaderboardCl.findOne(filter, options);

    if (!findResult) {
      return {
        success: false,
        result: "This user does not exist!",
        data: null,
      };
    }

    if (data.score <= findResult.score) {
      return {
        success: false,
        result: "The score does not exceed the leaderboard!",
        data: {
          name: data.name,
          score: data.score,
        },
      };
    }

    const r = await leaderboardCl.findOneAndUpdate(filter, updateDocument);

    return {
      success: true,
      result: `update score to leaderboard successfully!`,
      data: {
        name: data.name,
        score: data.score,
      },
    };
  } catch (error) {
    console.log(err.stack);
    return {
      result: err.stack,
      success: false,
    };
  } finally {
    await client.close();
  }
}

async function find() {
  try {
    await client.connect();

    const db = client.db(dbName);
    const leaderboardCl = db.collection("leaderboard");

    // query for leaderboard that have a score less than 1500
    // const query = {
    //   score: {
    //     $lt: 2100,
    //   },
    // };

    const options = {
      // sort returned documents in ascending order by title (A->Z)
      sort: { score: -1 },
    };

    const cursor = leaderboardCl.find(null, options).limit(3);

    if ((await cursor.count()) === 0) {
      console.log(`No document found!`);
    }

    const datas = [];
    await cursor.forEach((e) => {
      datas.push({
        name: e.name,
        score: e.score,
      });
    });

    return {
      message: "find the leaderboard successfully!",
      success: true,
      result: datas,
    };
  } catch (err) {
    console.log(err.stack);
    return {
      message: err.stack,
      success: false,
    };
  } finally {
    await client.close();
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
    console.log(`playerData / data: `, playerData.data);

    const findData = await find();
    console.log(`findData: `, findData);

    return {
      success: true,
      result: {
        topUsers: findData,
        player: playerData.data,
      },
    };
  },
};
