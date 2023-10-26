# NextCart API - Simple Rest API for Shopping Website

This project is for researching only so that it doesn't cover all aspects of full shopping cart.


## Dependences

This project is tested against the following packages:

* [nodejs](http://nodejs.org) 20.9
* [typescript](typescriptlang.org) 5.2
* [vitest](https://vitest.dev) 0.34
* [prisma](https://www.prisma.io) 5.4
* [expressjs](https://expressjs.com) 4.18

Keep in mind that the versions above are not hard requirements.


## Installation and Usage

At root of project, run `npm` to install library:

```bash
npm install
```

Then copy `.env.example` file to `.env` and correct your own settings:

```bash
copy .env.example .env
```

To deploy this project at your localhost:

```bash
npx prisma migrate dev
npm run dev
```

To deploy this project at a production server:

```bash
npx prisma deploy
npm run server
```

## Development

Code of this project comes with unit & integration tests by using Vitest. The following command to run tests:

```bash
copy .env.example .env.test
npm run test
```

## Copyright and License

Copyright (c) 2023 LuongFox, and distributed under the MIT License.