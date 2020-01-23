const chai = require("chai");
const chaiHttp = require("chai-http");
// const fetch = require("node-fetch");
const expect = chai.expect;
chai.use(chaiHttp);
// send post request
// get the result
// assert
const customFetch = function(query) {
  return chai
    .request("http://localhost:4000/graphql")
    .post()
    .send(JSON.stringify({ query }));
  // return fetch("http://localhost:4000/graphql", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ query }),
  // })
  //   .then((res) => {
  //     return res.json();
  //   })
  //   .then((res) => res.data);
};

describe("graphQlTests", () => {
  it("should return all Pokemon", async () => {
    const result = await customFetch("{ Pokemons { id name } }");
    expect(result.Pokemons.length).to.equal(151);
  });
  it("should return specific Pokemon", async () => {
    const result = await customFetch(
      '{ Pokemon(name: "Pikachu") { id name } }'
    );
    console.log("result :", result);
    expect(result.Pokemon.id).to.equal("025");
  });
});
