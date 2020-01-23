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

  input WeightInput {
    minimum: String
    maximum: String
  }
  input HeightInput {
    minimum: String
    maximum: String
  }

  input EvolutionRequirementsInput {
    amount: Int
    name: String
  }

  input EvolutionInput {
    id: Int
    name: String
  }

  input AttackInput {
    fast: [AttackTypeInput]
    special: [AttackTypeInput]
  }

  input AttackTypeInput {
    name: String
    type: String
    damage: Int
  }
   type Mutation { 
     createPokemon(
       id: String!, 
       name: String!,     
       classification: String,
       types: [String],
       resistant: [String],
       weaknesses: [String],
       weight: WeightInput,
       height: HeightInput,
       fleeRate: Float,
       evolutionRequirements: EvolutionRequirementsInput,
       evolutions: [EvolutionInput],
       maxCP: Int,
       maxHP: Int,
       attacks: AttackInput
       ): [Pokemon]

     updatePokemon(
       id: String, 
       name: String,     
       classification: String,
       types: [String],
       resistant: [String],
       weaknesses: [String],
       weight: WeightInput,
       height: HeightInput,
       fleeRate: Float,
       evolutionRequirements: EvolutionRequirementsInput,
       evolutions: [EvolutionInput],
       maxCP: Int,
       maxHP: Int,
       attacks: AttackInput
       ): [Pokemon]
     deletePokemon(
       id: String, 
       name: String
       ): [Pokemon]
     createAttack(
       attackType: String!,
       name: String!, 
       type:String, 
       damage:Int
     ): [AttackType]
     updateAttack(
       attackType: String!, 
       name: String!, 
       type:String, 
       damage:Int
       ): [AttackType]
     deleteAttack(attackType: String!, name: String!): [AttackType]
     createTypes(name: String!): [String]
     deleteTypes(name: String!): [String]
  }
`);

// The root provides the resolver functions for each type of query or mutation.
const root = {
  Pokemons: () => {
    return data.pokemon;
  },
  Pokemon: (request) => {
    if (request.id === undefined)
      return data.pokemon.find((pokemon) => pokemon.name === request.name);
    return data.pokemon.find((pokemon) => pokemon.id === request.id);
  },
  Attack: (request) => {
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

  createPokemon: (request) => {
    const newPokemon = {
      id: request.id,
      name: request.name,
    };
    for (const key in data.pokemon[0]) {
      if (key === "id" || key === "name") continue;
      if (request[key] !== undefined) newPokemon[key] = request[key];
      else newPokemon[key] = null;
    }
    data.pokemon.push(newPokemon);
    return data.pokemon;
  },

  updatePokemon: (request) => {
    //look for by name
    let index;
    if (request.id === undefined) {
      index = data.pokemon.findIndex(
        (pokemon) => pokemon.name === request.name
      );
    } else {
      index = data.pokemon.findIndex((pokemon) => pokemon.id === request.id);
    }
    for (const key in data.pokemon[index]) {
      if (request[key] !== undefined) data.pokemon[index][key] = request[key];
    }
    return data.pokemon;
  },

  deletePokemon: (request) => {
    //look for by name
    let index;
    if (request.id === undefined) {
      index = data.pokemon.findIndex(
        (pokemon) => pokemon.name === request.name
      );
    } else {
      index = data.pokemon.findIndex((pokemon) => pokemon.id === request.id);
    }
    if (index !== -1) data.pokemon.splice(index, 1);
    return data.pokemon;
  },

  createAttack: (request) => {
    if (Object.keys(data.attacks).includes(request.attackType)) {
      const newAttack = {
        name: request.name,
        type: request.type || null,
        damage: request.damage || null,
      };
      data.attacks[request.attackType].push(newAttack);
    }
    return data.attacks.fast.concat(data.attacks.special);
  },
  updateAttack: (request) => {
    if (Object.keys(data.attacks).includes(request.attackType)) {
      const index = data.attacks[request.attackType].findIndex(
        (attack) => attack.name === request.name
      );

      //Go thought all key to update
      if (index !== -1) {
        const newAttack = {
          name: request.name,
          type: request.type || data.attacks[request.attackType][index].type,
          damage:
            request.damage || data.attacks[request.attackType][index].damage,
        };
        data.attacks[request.attackType][index] = newAttack;
      }
    }

    return data.attacks.fast.concat(data.attacks.special);
  },

  deleteAttack: (request) => {
    if (Object.keys(data.attacks).includes(request.attackType)) {
      const index = data.attacks[request.attackType].findIndex(
        (attack) => attack.name === request.name
      );
      if (index !== -1) {
        data.attacks[request.attackType].splice(index, 1);
      }
    }

    return data.attacks.fast.concat(data.attacks.special);
  },

  createTypes: (request) => {
    data.types.push(request.name);
    return data.types;
  },

  deleteTypes: (request) => {
    const index = data.types.indexOf(request.name);
    if (index !== -1) data.types.splice(index, 1);
    return data.types;
  },
  PokemonByAttack: (request) => {
    const allAttacks = data.attacks.fast.concat(data.attacks.special);
    const attack = allAttacks.find((attack) => attack.name === request.name);
    console.log("allAttacks :", allAttacks);

    const pokemonByAttack = data.pokemon.filter((pokemon) => {
      const filtered = pokemon.attacks.fast.filter((attack) => {
        return attack.name === request.attack;
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
      name,
      type,
      damage,
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
