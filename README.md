## Description

Basic Authentication and Authorisation functionality written on [Nest](https://github.com/nestjs/nest) .

## Running the app

1. Ensure your Docker daemon is running.
2. Run `npm ci` to install dependencies.
3. Run the app locally with `npm run start:dev:all`

   ### Details

   This command will run under the hood:

   ```
   npm run docker:db:dev
   npm run migrate:dev
   npm run start:dev
   ```

   In case that this command is running with errors please try to run upper command one-by-one and inspect possible errors

4. After the usage run `npm run docker:down`

## How the endpoints work

**NOTE**: as an api key JWT token is used (accessToken) along with the refreshToken in cookies

App hosts the following endpoints:

- **POST /auth/signup**

  - Ensure email and userName are unique, and passwords match.

- **POST /auth/signin**

  - Provide email and password.
  - The response includes an accessToken and stores the refreshToken in a cookie.
  - Multiple tokens can be generated for the same user across different user agents.

- **POST /auth/refresh-token**

  - Provide email and password.
  - Include the current refreshToken in cookies and the current accessToken in the Authentication Bearer header.
  - The response contains a new accessToken and stores the new refreshToken in a cookie.

- **POST /auth/signout**

  - Include the current refreshToken in cookies and the current accessToken in the Authentication Bearer header.
  - Deletes the refresh token from the database.

- **PUT /auth/password**

  - Updates the password
  - Provide emailOrUserName, oldPassword, newPassword and repeatNewPassword fields

- **GET /user/me**
  - Include the current refreshToken in cookies and the current accessToken in the Authentication Bearer header.
-
- **POST /catalogs**

  - Create catalog for the current user
  - Include the current accessToken in the Authentication Bearer header

- **GET /catalogs**
  - Observe all current user catalogs
  - Include the current accessToken in the Authentication Bearer header
- **PATCH /catalogs/{catalogId}**

  - Update current user catalog by id (only primary field is processed)
  - Include the current accessToken in the Authentication Bearer header

- **DELETE /catalogs/{catalogId}**

  - Delete current user catalog by id
  - Include the current accessToken in the Authentication Bearer header

- **DELETE /catalogs**
  - Delete current user catalogs in bulk by ids ({"ids": ["id_1", "id_2"]})
  - Include the current accessToken in the Authentication Bearer header

## Integration Tests (E2E Tests)

**How to run**

```
npm run test:e2e
```

Additionally you can run `npm run docker:down` if other container is running.

There is on flaky test that sometimes end up with an error.

## Further Plans

- add Swagger
- some endpoints responses are not with the same structure as the majority (ex. signin). Do need to be updated
- add other authentications: OAuth2

## License

Nest is [MIT licensed](LICENSE).
