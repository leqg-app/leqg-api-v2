const tap = require("tap");

const build = require("./mocks/build.js");

const fastify = build();
tap.teardown(() => fastify.close());

tap.test("Profile", async ({ context }) => {
  tap.test("Login", async (t) => {
    const login = await fastify.inject({
      method: "POST",
      url: "/auth/local",
      payload: { identifier: "admin", password: "azerty" },
    });
    t.equal(login.statusCode, 200);

    const { jwt } = login.json();
    t.type(jwt, "string");
    context.jwt = jwt;
  });

  tap.test("Get user profile", async (t) => {
    const { jwt } = context;

    const profile = await fastify.inject({
      url: "/users/me",
      headers: {
        authorization: `Bearer ${jwt}`,
      },
    });

    t.equal(profile.statusCode, 200);
    t.equal(profile.json().user.username, "admin");
  });

  tap.test("Invalid jwt", async (t) => {
    const profile = await fastify.inject({
      url: "/users/me",
      headers: {
        authorization: `Bearer invalidJwt`,
      },
    });

    t.equal(profile.statusCode, 401);
  });

  tap.test("Add favorite store to user", async (t) => {
    const { jwt } = context;

    const update = await fastify.inject({
      method: "PUT",
      url: "/users/me",
      headers: {
        authorization: `Bearer ${jwt}`,
      },
      payload: { favorites: [1] },
    });
    t.equal(update.statusCode, 200);

    const profile = await fastify.inject({
      url: "/users/me",
      headers: {
        authorization: `Bearer ${jwt}`,
      },
    });

    t.equal(profile.statusCode, 200);
    t.equal(profile.json().user.favorites.length, 1);
  });
});