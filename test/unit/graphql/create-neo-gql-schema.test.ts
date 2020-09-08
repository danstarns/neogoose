import { expect } from "chai";
import { describe } from "mocha";
import createNeoGQLSchema from "../../../src/graphql/create-neo-gql-schema";
import model from "../../../src/methods/model";
import { Runtime, Connection } from "../../../src/types";
import { printSchema } from "graphql";

describe("graphql/createNeoGQLSchema", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(createNeoGQLSchema).to.be.a("function");
    });
  });

  describe("functionality", () => {
    it("should", () => {
      const runtime: Runtime = {
        models: [],
        connections: [],
        // @ts-ignore
        connection: new Connection({ config: {}, driver: {} }),
      };

      const _model = model(runtime);

      _model("Movie", {
        typeDefs: `
          input MovieValidation {
            title: String
            year: Int
            imdbRating: Float
          }

          input MovieGenres {
            test: String
          }

          type Movie @Validation(properties: MovieValidation) {
            title: String @id
            year: Int
            imdbRating: Float
            genres: [Genre] @Relationship(label: "IN_GENRE", direction: "OUT", properties: MovieGenres)
            test: [Movie] @cypher
          }
        `,
      });

      _model("Genre", {
        typeDefs: `
          type Genre {
            name: String
            movies: [Movie] @Relationship(label: "IN_GENRE", direction: "IN")
          }
        `,
      });

      const _createNeoGQLSchema = createNeoGQLSchema({ runtime, options: {} });

      const printed = printSchema(_createNeoGQLSchema);

      expect(printed).to.not.include("@Relationship");
      expect(printed).to.not.include("@Validation");
      expect(printed).to.include("Movie");
      expect(printed).to.include("AddMovieGenres");
      expect(printed).to.include("RemoveMovieGenres");
      expect(printed).to.include("MergeMovieGenres");
      expect(printed).to.include("CreateMovie");
      expect(printed).to.include("UpdateMovie");
      expect(printed).to.include("DeleteMovie");
      expect(printed).to.include("MergeMovie");
      expect(printed).to.include("AddGenreMovies");
      expect(printed).to.include("RemoveGenreMovies");
      expect(printed).to.include("MergeGenreMovies");
      expect(printed).to.include("CreateGenre");
      expect(printed).to.include("DeleteGenre");
      expect(printed).to.include("MergeGenre");
    });
  });
});
