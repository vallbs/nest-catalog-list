## Description

Basic Authentication and Authorisation functionality written on [Nest](https://github.com/nestjs/nest) .

## Running the app

There are two ways to run the application:

- All in Docker containers.
- PostgreSQL in a Docker container and the Nest app in a local terminal.

### Running All in Containers

1. Ensure your Docker daemon is running.
2. Run Docker Compose with `npm run docker:up`.

   **NOTE:** Rest assured that application has started successfully (message `Nest application successfully started` in logs)

3. After usage, run `npm run docker:down`

**CAUTION**: do not forget to use `containerized prisma migration` for `DATABASE_URL` in `.env` when running all containers.

### Running Nest App in Local Terminal

1. Ensure your Docker daemon is running.
2. Run `npm ci` to install dependencies.
3. Start the database Docker container with `npm run docker:up:db`
4. Run migrations with `npm run migrate:dev`

   **IMPORTANT**: to run migrations locally we should change HOST for the DATABASE_URL in the `.env` (in the root folder) file (from 'postgres' to 'localhost'):

   - `postgres` is for the name of container when all running in container
   - `localhost` is for the value to connect to db via local terminal.
     In the `.env` file `DATABASE_URL` for `local prisma migration` could be used.

   **CAUTION**: do not forget to get back to the `containerized prisma migration` for `DATABASE_URL` in the `.env` (in the root and prisma folders) when running all app in containers

5. Run the app locally with `npm run start`
6. After the usage run `npm run docker:down`

## How the auth endpoints work

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

- **GET /user/me**
  - Include the current refreshToken in cookies and the current accessToken in the Authentication Bearer header.

## License

Nest is [MIT licensed](LICENSE).
