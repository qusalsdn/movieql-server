import { ApolloServer, gql } from "apollo-server";

// package.json에서 type을 module로 하는 이유는 위에 처럼 import 문을 사용하기 위해서이고
// type을 module로 지정하지 않으면 아래처럼 선언해야 한다.
// const { ApolloServer, gql } = require("apollo-server");

let tweets = [
  {
    id: "1",
    text: "first one!",
    userId: "2",
  },
  {
    id: "2",
    text: "second one!",
    userId: "1",
  },
];

let users = [
  {
    id: "1",
    firstName: "byun",
    lastName: "min",
  },
  {
    id: "2",
    firstName: "son",
    lastName: "heung",
  },
];

// graphql에서 query는 rest API에서 GET request를 만드는 것과 같다.
const typeDefs = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    fullName: String!
  }

  """
  트윗 오브젝트는 트윗에 대한 리소스를 나타냅니다.
  """
  type Tweet {
    id: ID!
    text: String!
    author: User
  }

  type Query {
    allMovies: [Movie!]!
    allUsers: [User!]!
    allTweets: [Tweet!]!
    tweet(id: ID!): Tweet
    movie(id: String!): Movie
  }

  type Mutation {
    postTweet(text: String!, userId: ID!): Tweet!
    """
    트윗을 찾으면 삭제하고, 찾지 못하면 false를 return한다.
    """
    deleteTweet(id: ID!): Boolean!
  }

  type Movie {
    id: Int!
    url: String!
    imdb_code: String!
    title: String!
    title_english: String!
    title_long: String!
    slug: String!
    year: Int!
    rating: Float!
    runtime: Float!
    genres: [String]!
    summary: String
    description_full: String!
    yt_trailer_code: String!
    language: String!
    background_image: String!
    background_image_original: String!
    small_cover_image: String!
    medium_cover_image: String!
    large_cover_image: String!
  }
`;
// GET /api/v1/tweets
// GET /api/v1/tweet/:id
// POST /api/v1/tweets
// tweet(id: ID!): Tweet에서 마지막 Tweet 옆에 !를 안 붙여준 이유는 id가 존재하지 않으면 리턴 값으로 null를 받을 수도 있기 때문이다.

const resolvers = {
  Query: {
    // 함수는 Query type에 있는 object들과 같은 이름으로 함수를 정의해줘야 실행이 된다.
    allTweets() {
      return tweets;
    },
    // arguments가 있는 API는 항상 첫 번째 인자는 root이고 두 번째 인자는 API에서 받아온 arguments이다.
    tweet(_, { id }) {
      return tweets.find((tweet) => tweet.id === id);
    },
    allUsers() {
      console.log("allUsers called!");
      return users;
    },
    allMovies() {
      return fetch("https://yts.mx/api/v2/list_movies.json")
        .then((response) => response.json())
        .then((json) => json.data.movies);
    },
    movie(_, { id }) {
      return fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`)
        .then((response) => response.json())
        .then((json) => json.data.movie);
    },
  },

  Mutation: {
    postTweet(_, { text, userId }) {
      const userCheck = users.find((user) => user.id === userId);
      if (userCheck) {
        const newTweet = {
          id: tweets.length + 1,
          text,
          userId,
        };
        tweets.push(newTweet);
        return newTweet;
      } else {
        console.log("userId is not find");
      }
    },
    deleteTweet(_, { id }) {
      const tweet = tweets.find((tweet) => tweet.id === id);
      if (!tweet) return false;
      tweets = tweets.filter((tweet) => tweet.id != id);
      return true;
    },
  },

  User: {
    fullName({ firstName, lastName }) {
      return `${firstName} ${lastName}`;
    },
  },

  Tweet: {
    // Tweet에는 author가 없기 때문에 이렇게 하나만 인자를 주게 되면 상위의 값들을 얻을 수 있다.
    author({ userId }) {
      return users.find((user) => user.id === userId);
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
});
