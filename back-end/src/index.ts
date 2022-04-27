import { createServer } from '@graphql-yoga/node'
import { schema } from './schema'
import { createContext } from './context'

//add new

async function main() {
  const server = createServer({ schema, context: createContext })
  await server.start()
}

main()