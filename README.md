# deavour-backend
A REST API for the Shopping App backend.
## Prerequisites

Two postgres databases are required: one for testing the other for development

Service account credentials from Google Cloud for file storage on Firebase 

**Setting up the database with a user who has all privileges**
```
psql postgres or sudo -u postgres psql postgres
postgres=# create database your_database;
postgres=# create user your-username with encrypted password 'your-password';
postgres=# grant all privileges on database your_database to username;
```

# Run the application on local development environment
## Clone the repository using: 
```bash
git clone git@github.com:yurii0419/deavour-backend.git
cd endeavour-backend
```

## Install the dependencies
```bash
yarn install
```

## Copy the file .env.example then rename it to .env and **populate the environment variables**
```bash
cp .env.example .env
```

## API Documentation
Navigate to the root domain to get the API url under documentation
