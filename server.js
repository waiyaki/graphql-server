import express from 'express';
import graphqlHTTP from 'express-graphql';
import {
  GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLNonNull,
  GraphQLID,
} from 'graphql';

import {
  NodeInterface, UserType, PostType,
} from './src/types';

import * as loaders from './src/loaders';

const app = express();

const PORT = process.env.PORT || 3000;

const inMemoryStore = {};

const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  description: 'The root query',
  fields: {
    node: {
      type: NodeInterface,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve(source, args, context, info) {
        let includeFriends = false;
        const selectionFragments = info.fieldNodes[0].selectionSet.selections;
        const userSelections = selectionFragments
          .filter(selection => selection.kind === 'InlineFragment' &&
            selection.typeCondition.name.value === 'User');

        userSelections.forEach((selection) => {
          selection.selectionSet.selections.forEach((innerSelection) => {
            if (innerSelection.name.value === 'friends') {
              includeFriends = true;
            }
          });
        });

        if (includeFriends) {
          return loaders.getUserNodeWithFriends(args.id);
        }
        return loaders.getNodeById(args.id);
      },
    },
  },
});

const RootMutation = new GraphQLObjectType({
  name: 'RootMutation',
  description: 'The root mutation',
  fields: {
    setNode: {
      type: GraphQLString,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
        value: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve(source, args) {
        inMemoryStore[args.key] = args.value;
        return inMemoryStore[args.key];
      },
    },
  },
});

const Schema = new GraphQLSchema({
  types: [UserType, PostType],
  query: RootQuery,
  mutation: RootMutation,
});


app.use('/graphql', graphqlHTTP({ schema: Schema, graphiql: true }));

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Application is running at http://localhost:${PORT}`);
});
