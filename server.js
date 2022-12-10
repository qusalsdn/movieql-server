import { ApolloServer, gql } from "apollo-server";

// package.json에서 type을 module로 하는 이유는 위에 처럼 import 문을 사용하기 위해서이고
// type을 module로 지정하지 않으면 아래처럼 선언해야 한다.
// const { ApolloServer, gql } = require("apollo-server");

const tweets = [
  {
    id: "1",
    text: "first one!",
  },
  {
    id: "2",
    text: "second one!",
  },
];

// graphql에서 query는 rest API에서 GET request를 만드는 것과 같다.
const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    firstName: String!
    lastName: String
  }
  type Tweet {
    id: ID!
    text: String!
    author: User
  }
  type Query {
    allTweets: [Tweet!]!
    tweet(id: ID!): Tweet
  }
  type Mutation {
    postTweet(text: String!, userId: ID!): Tweet!
    deleteTweet(id: ID!): Boolean!
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
    tweet(root, { id }) {
      return tweets.find((tweet) => tweet.id === id);
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
});
