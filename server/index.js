const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
// The data below is mocked.
const data = require("./data");

// The schema should model the full data object available.
const schema = buildSchema(`
  type Pokemon {
    id: String
    name: String!
    classification: String
    types: [String]
    resistant: [String]
    weaknesses: [String]
    weight: Weight
    height: Height
    fleeRate: Float
    evolutionRequirements: EvolutionRequirements
    evolutions: [Evolution]
    maxCP: Int
    maxHP: Int
    attacks: Attack
  }
  type Weight {
    minimum: String
    maximum: String
  }
  type Height {
    minimum: String
    maximum: String
  }
  type EvolutionRequirements {
    amount: Int
    name: String
  }
  type Evolution {
    id: Int
    name: String
  }
  type Attack {
    fast: [AttackType]
    special: [AttackType]
  }
  type AttackType {
    name: String
    type: String
    damage: Int
  }
  type PokemonByAttack {
    name: String
    type: String
    damage: Int
    pokemon: [Pokemon]
  }
  type Query {
    Pokemons: [Pokemon]
    Types(type:String): [Pokemon]
    Pokemon(name: String, id: String): Pokemon
    Attack(type: String): [AttackType]
    PokemonByAttack(name:String) :PokemonByAttack
  }
`);

// The root provides the resolver functions for each type of query or mutation.
const root = {
  Pokemons: () => {
    return data.pokemon;
  },
  // Types: (request) => {
  //   return data.types.find;
  // },
  Pokemon: (request) => {
    // const idOrName = request.id === undefined ? request.name : request.id;
    if (request.id === undefined)
      return data.pokemon.find((pokemon) => pokemon.name === request.name);
    return data.pokemon.find((pokemon) => pokemon.id === request.id);
  },
  Attack: (request) => {
    // return data.attacks.fast;
    if (request.type === "fast") {
      return data.attacks.fast;
    } else if (request.type === "special") {
      return data.attacks.special;
    }
  },
  Types: (request) => {
    return data.pokemon.filter((pokemon) => {
      return pokemon.types.includes(request.type);
    });
  },
  PokemonByAttack: (request) => {
    const allAttacks = data.attacks.fast.concat(data.attacks.special);
    const attack = allAttacks.find((attack) => attack.name === request.name);
    console.log("allAttacks :", allAttacks);

    const pokemonByAttack = data.pokemon.filter((pokemon) => {
      const filtered = pokemon.attacks.fast.filter((attack) => {
        return attack.name === "Tackle";
      });
      if (filtered.length === 0) {
        return false;
      }
      return true;
    });
    //Get attack
    //name,type,damage
    const name = attack.name;
    const type = attack.type;
    const damage = attack.damage;
    console.log("object :", pokemonByAttack);
    return {
      name: name,
      type: type,
      damage: damage,
      pokemon: pokemonByAttack,
    };
  },
};

// Start your express server!
const app = express();

/*
  The only endpoint for your server is `/graphql`- if you are fetching a resource, 
  you will need to POST your query to that endpoint. Suggestion: check out Apollo-Fetch
  or Apollo-Client. Note below where the schema and resolvers are connected. Setting graphiql
  to 'true' gives you an in-browser explorer to test your queries.
*/
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Running a GraphQL API server at localhost:${PORT}/graphql`);
});
