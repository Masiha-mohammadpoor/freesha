# freesha-backend

This is the documentation for the backend of freesha.

## Getting started

### Manual

1. First, install these softwares:
  - [Node.js](https://nodejs.org/)
  - [NPM](https://www.npmjs.com/)
  - [PostgreSQL](https://www.postgresql.org/)
  - [Redis](https://redis.io/)

2. Create a database in PostgreSQL using psql or pgAdmin:
  ```sql
  CREATE DATABASE "freesha";
  ```

3. After cloning [freesha](https://github.com/Ilia-Masiha/freesha), go inside the `backend` directory and run all the shell commands there

4. Install dependencies:  
  ```sh
  npm install
  ```

5. Run migration commands:  
  ```sh
  npm run generate
  npm run migrate
  npm run seed
  ```

6. Create a new email address or use your own email address for OTP sending. If you want to use your own email address, read the next section: [OTP](https://github.com/ilia-abbasi/freesha/blob/main/backend/misc/docs.md#otp)

7. Create `.env` files based on the provided `.env.example` files

8. Make sure Redis is already running

9. You can either use `npm run dev` to run the backend in watch mode, or build it first and then run the Javascript files instead:  
  ```sh
  npm run build
  npm run start
  ```

### Docker

1. Install [docker](https://www.docker.com/)

2. Create a new email address or use your own email address for OTP sending. If you want to use your own email address, read the next section: [OTP](https://github.com/ilia-abbasi/freesha/blob/main/backend/misc/docs.md#otp)

3. Create `.env` files based on the provided `.env.example` files

4. Run this command in the root of the project (where `compose.yml` is located):  
  ```sh
  docker compose up
  ```

## OTP

To use your own email address for sending OTPs, follow these steps (GMAIL):

  1. Go to your google account settings.
  2. In the `Security` section, enable 2FA.
  3. Then go to `App passwords` and make a new password to use it in this project. You can call the new app `freesha`.
  4. The password must be a 16-character string containing a-z.
  5. Put this password in `EMAIL_PASS` environment variable.
  6. Put your own email address in `EMAIL_USER` environment variable.
  7. Put `gmail` in `EMAIL_SERVICE` environment variable.

OTP is a 5-character string consisting of 0-9 and A-Z except capital i (`I`) and capital o (`O`), because they can be confused with `1` and `0`. This gives 45,435,424 distinct OTPs.

## Response format

Every response has a `message` and `data` property:

  - `message`: This is a string explaining the response.
  - `data`: This could either be an array or an object based on the type of request. For example if you requested the list of users, you should expect `data` to be an array, but if you requested the information of a single user, you should expect `data` to be an object.

## Endpoints

These status codes are always expected from any endpoint, so I will not include them in any endpoint's description:  
  - `429`: Too many requests.
  - `500`: Something went wrong on the server, Not your fault.

- `POST /register`:  
  This endpoint is used for registering a new user. This endpoint can also be used to resend the OTP. Send user information in the request body in this format:  
  ```json
  REQUEST BODY
  {
    "name": "John Doe",
    "email": "john@doe.com",
    "password": "verySecure!123"
  }
  ```
  Response body will contain a `message` about the result of your request. Expected status codes:  
  - `400`: Validation error. More information in `message`.
  - `409`: Duplicate email. The email that you are trying to register with, already exists in the database.
  - `429`: Too many OTP requests. Wait some more time before sending an OTP request again.
  - `200`: OK. OTP is sent to the email for verification.

- `POST /verifyemail`:  
  This endpoint is used for verifying your email using the OTP that was sent to it. Send information in the request body in this format:  
  ```json
  REQUEST BODY
  {
    "email": "john@doe.com",
    "otp": "ABCDE",
  }
  ```
  Response body will contain a `message` about the result of your request. If successful, `data` will also contain information about the verified user. Response body will be in this format (If status code is `201`):  
  ```json
  RESPONSE BODY
  {
    "message": "ثبت نام با موفقیت انجام شد",
    "data": {
      "id": 5,
      "name": "John Doe",
      "email": "john@doe.com",
      "roleName": "user",
      "createdAt": "2025-10-02T11:52:24.977Z",
      "updatedAt": "2025-10-02T11:52:24.977Z",
      "lastLoginAt": "2025-10-02T11:52:24.977Z"
    }
  }
  ```
  If status code is `201`, a session key will be sent as an `httponly` cookie. Expected status codes:  
  - `400`: Validation error. More information in `message`.
  - `401`: Invalid OTP.
  - `201`: Successfully verified the OTP and created the user in database.

- `POST /login`:  
  This endpoint is used for logging in. Send information in the request body in this format:  
  ```json
  REQUEST BODY
  {
    "email": "john@doe.com",
    "password": "verySecure!123",
  }
  ```
  Response body will contain a `message` about the result of your request. If successful, `data` will also contain information about the logged in user. Response body will be in this format (If status code is `200`):  
  ```json
  RESPONSE BODY
  {
    "message": "شما با موفقیت وارد شدید",
    "data": {
      "id": 5,
      "name": "John Doe",
      "email": "john@doe.com",
      "roleName": "user",
      "createdAt": "2025-10-02T11:52:24.977Z",
      "updatedAt": "2025-10-02T11:52:24.977Z",
      "lastLoginAt": "2025-10-17T19:39:37.428Z"
    }
  }
  ```
  If status code is `200`, a session key will be sent as an `httponly` cookie. Expected status codes:  
  - `400`: Validation error. More information in `message`.
  - `401`: Bad credentials.
  - `200`: Successfully logged in.

- `POST /logout`:  
  This endpoint is used for logging out. Request body should be empty. Status code will always be `200` unless something goes wrong in the server (`500`) or you reach your limit (`429`).  
  Response body contains `data` which has a `alreadyLoggedOut` property. This property is `false` when you have an active session and try to log out. If you are already logged out and use this endpoint, `data.alreadyLoggedOut` will be `true`. Example of response body:  
  ```json
  RESPONSE BODY
  {
    "message": "شما با موفقیت خارج شدید",
    "data": {
      "alreadyLoggedOut": false
    }
  }
  ```
  Expected status codes:  
  - `200`: Successfully logged out.

- `GET /users/:userId` (Protected):  
  This endpoint is used for getting a user's information. Put user's id instead of `:userId`. Specify your requested fields in the query parameter:  
  ```json
  GET /users/5?fields=email,birthDate,workExperiences

  RESPONSE BODY
  {
    "message": "اطلاعات کاربر با موفقیت دریافت شد",
    "data": {
      "id": 5,
      "roleName": "user",
      "email": "john@doe.com",
      "workExperiences": [
        {
          "jobTitle": "Architect",
          "company": "Example LTD",
          "description": "Some description about my job experience",
          "startDate": "2005-01-17",
          "endDate": "2007-09-11"
        }
      ],
      "birthDate": "1999-01-20"
    }
  }
  ```
  `id` and `roleName` will always be included. The values of `fields` in query is case-sensitive. `genderId` can't be requested, use `genderName` instead. You can use `all` as a field to get all of the fields possible. Use `all` only if necessary.  
  Expected status codes:  
  - `400`: Validation error. More information in `message`.
  - `401`: Invalid session key.
  - `403`: Forbidden.
  - `200`: Successfully got user information.

- `PATCH /users/:userId` (Protected):  
  This endpoint is used for editing a user's information. Put user's id instead of `:userId`. Send information in the request body in this format:  
  ```json
  PATCH /users/5

  REQUEST BODY
  {
    "name": "John Doe",
    "postalCode": "0123456789",
    "homeAddress": "221B Baker St. London",
    "genderId": 2,
    "jobTitle": "Front-End Web Developer",
    "bio": "Hi. This is some information about me",
    "birthDate": "1999-01-20",
    "skills": [
      "Cooking",
      "Coding"
    ],
    "languageNames": [
      "Persian",
      "English"
    ],
    "socialLinks": [
      "http://example.com"
    ],
    "educationDegrees": [
      {
        "title": "Bachelor of Architecture",
        "startDate":"2000-12-12",
        "endDate": null
      }
    ],
    "workExperiences": [
      {
        "jobTitle": "Architect",
        "company": "Example LTD",
        "description": "Some description about my job experience",
        "startDate": "2005-01-17",
        "endDate": "2007-09-11"
      }
    ]
  }
  ```
  All of the properties are optional, but the request body must contain at least one property. Including a property but leaving it empty (`""` or `[]`) is the equivalent of removing that record from the user's profile. Dates like `birthDate` can't set to be `""`, instead you have to set it as `null`. No `startDate` can be `null` but any `endDate` can be `null`. Dates must be in the `YYYY-MM-DD` format.  
  Response body will contain a `message` about the result of your request. If successful, `data` will also contain information about the updated user. Response body will be in this format (If status code is `200`):  
  ```json
  RESPONSE BODY
  {
    "message": "اطلاعات کاربر با موفقیت بروزرسانی شد",
    "data": {
      "id": 5,
      "name": "John Doe",
      "email": "john@doe.com",
      "roleName": "user",
      "phoneNumber": "09123456789",
      "postalCode": "0123456789",
      "homeAddress": "221B Baker St. London",
      "genderName": "M",
      "jobTitle": "Hello brother",
      "bio": "Hi. This is some information about me",
      "birthDate": "1999-01-20",
      "createdAt": "2025-10-02T11:52:24.977Z",
      "updatedAt": "2025-10-15T18:40:02.152Z",
      "lastLoginAt": "2025-10-17T19:39:37.428Z",
      "skills": [
        "Cooking",
        "Coding"
      ],
      "languageNames": [
        "Persian",
        "English"
      ],
      "socialLinks": [
        "http://example.com"
      ],
      "educationDegrees": [
        {
          "title": "Bachelor of Architecture",
          "startDate":"2000-12-12",
          "endDate": null
        }
      ],
      "workExperiences": [
        {
          "jobTitle": "Architect",
          "company": "Example LTD",
          "description": "Some description about my job experience",
          "startDate": "2005-01-17",
          "endDate": "2007-09-11"
        }
      ],
      "portfolios": [
        {
          "title": "Online shop",
          "projectUrl": "https://example.com",
          "skills": [
            "Next.js",
            "Express.js"
          ],
          "description": "This text is explaining the project"
        }
      ],
    }
  }
  ```
  Take notice that `genderId` in request body is converted to `genderName` in response body. Data relationships are explained in the next section of the documentation (Data relationships).  
  Expected status codes:  
  - `400`: Validation error. More information in `message`.
  - `401`: Invalid session key.
  - `403`: Forbidden.
  - `200`: Successfully updated user information.

- `GET /auth/me` (Protected):  
  This endpoint is used to make sure that you are logged in and can also be used for getting the basic information of the currently logged in user, based on the session key which is provided in a cookie. Request body will not be checked and should be empty. Response body will contain a `message` about the result of your request. If successful, `data` will also contain information about the logged in user. Response body will be in this format (If status code is `200`):  
  ```json
  RESPONSE BODY
  {
    "message": "احراز هویت موفقیت آمیز بود",
    "data": {
      "id": 5,
      "roleName": "user",
      "name": "John Doe",
      "email": "john@doe.com",
      "createdAt": "2025-10-02T11:52:24.977Z",
      "updatedAt": "2025-10-15T18:40:02.152Z",
      "lastLoginAt": "2025-10-17T19:39:37.428Z"
    }
  }
  ```
  Expected status codes:  
  - `401`: Invalid session key.
  - `200`: Successfully authenticated the user.

- `POST /job_posts` (Protected):  
  This endpoint is used for creating a job post. Send information in the request body in this format:  
  ```json
  REQUEST BODY
  {
    "title": "Designing the database of an online shop",
    "description": "I'm currently giving you a lot of information about this project",
    "budgetLow": 500000,
    "budgetHigh": 1000000
  }
  ```
  Response body will contain a `message` about the result of your request. If successful, `data` will also contain information about the created job post. Response body will be in this format (If status code is `201`):  
  ```json
  RESPONSE BODY
  {
    "message": "آگهی کار با موفقیت ایجاد شد",
    "data": {
      "clientId": 5,
      "statusId": 1,
      "title": "Designing the database of an online shop",
      "description": "I'm currently giving you a lot of information about this project",
      "budget_low": 500000,
      "budget_high": 1000000,
      "id": 1,
      "createdAt": "2025-12-06T17:39:01.244Z",
      "updatedAt": "2025-12-06T17:39:01.244Z"
    }
  }
  ```
  Expected status codes:  
  - `400`: Validation error. More information in `message`.
  - `401`: Invalid session key.
  - `201`: Successfully created the job post.

## Data relationships

- Genders:  
  | genderId | genderName | Meaning |
  |----------|------------|---------|
  | 1        | N          | None    |
  | 2        | M          | Male    |
  | 3        | F          | Female  |

- Job post statuses:  
  | statusId | statusName |
  |----------|------------|
  | 1        | Pending    |
  | 2        | Accepted   |
  | 3        | Cancelled  |
  | 4        | Done       |