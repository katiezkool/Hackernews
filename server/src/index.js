import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const Subscription = require('./resolvers/Subscription')
const Feed = require('./resolvers/Feed')

const wsLink = new WebSocketLink({
    uri: `ws://localhost:4000`,
    options: {
      reconnect: true,
      connectionParams: {
        authToken: localStorage.getItem(AUTH_TOKEN),
      }
    }
})

const link = split(
    ({ query }) => {
      const { kind,operation } = getMainDefinition(query)
      return kind === 'OperationDefinition' && operation === 'subscription'
    },
    wsLink
    authLink.concat(httpLink)
)

const client = new ApolloClient ({
    link,
    cache: new InMemoryCache ()
})

const resolvers = {
  Query,
  Mutation,
  Subscription,
  Feed,
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: 'http://localhost:4466/hackernews-graphql-js/dev',
      secret: 'mysecret123',
      debug: true
    }),
  }),
})

server.start(() => console.log('Server is running on http://localhost:4000'))
