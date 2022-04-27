import { makeExecutableSchema } from "@graphql-tools/schema"
import { GraphQLContext} from './context'
import type { Link } from '@prisma/client'
import { Id } from "@graphql-yoga/node"

const typeDefinitions = /* GraphQL */ `
  type Link {
  id: ID!
  description: String!
  url: String!
  comments: [Comment!]!
}

    type Comment {
    id: ID!
    body: String!
}

    type Query {
    info: String!
    feed: [Link!]!
    comment(id: ID!): Comment
}

    type Mutation {
    postLink(url: String!, description: String!): Link!
    postCommentOnLink(linkId: ID!, body: String!): Comment!
}
`

  
  const resolvers = {
    Query: {
      info: () => `This is the API of a Hackernews Clone`,
      // 3
      feed: async (parents: unknown, args: {}, context: GraphQLContext) => {
          return context.prisma.link.findMany()
      },
      comment:async (parents: unknown, args: {id: string}, context: GraphQLContext) => {
          return context.prisma.comment.findUnique({
              where: {
               id: parseInt(args.id)
              }
          })
      }
    },
    Link: {
        id: (parent: Link) => parent.id,
        description: (parent: Link) => parent.description,
        url: (parent: Link) => parent.url,
        comments: (parent: Link, args: {}, context: GraphQLContext) => {
            return context.prisma.comment.findMany({
                where: {
                    linkId: parent.id,
                }
            })
        }

    },
    // 4
    Mutation: {
        postLink: async (
            parent: unknown, 
            agrs: {description: string; url: string},
            context: GraphQLContext) => {

            const newLink = await context.prisma.link.create({
                data: {
                    url: agrs.url,
                    description: agrs.description,
                },
            })
            return newLink
        },
        postCommentOnLink:async (parents: unknown, 
            args: { linkId: string; body: string}, 
            context: GraphQLContext,) => {
            // console.log(context.prisma.comment)
            const newComment = await context.prisma.comment.create({
                data: {
                    linkId: parseInt(args.linkId),
                    body: args.body,
                },
            })
            return newComment
        }
    },
  }

export const schema = makeExecutableSchema({
    resolvers: [resolvers],
    typeDefs: [typeDefinitions],
})