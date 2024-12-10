# Football Website Frontend

This repository contains the frontend infrastructure for a football website, built with **React**. The user interface is designed to be dynamic, interactive, and responsive, allowing users to interact with data about players and teams in Argentina's lower football divisions.

---

## Authors

| First Name    | Last Name   | Student ID | Gmail                  |
| ------------- | ----------- | ---------- | ---------------------- |
| Joaquin       | Batemarco   | 110222     | jbatemarco@fi.uba.ar   |
| Franco Ariel  | Alani       | 111147     | falani@fi.uba.ar       |
| Franco Martin | Fusco       | 102692     | ffusco@fi.uba.ar       |
| Benicio       | Braunstein  | 110126     | bbraunstein@fi.uba.ar  |
| Juan Martin   | de la Cruz  | 109588     | jdelacruz@fi.uba.ar    |
| Theo          | Lijs        | 109472     | tlijs@fi.uba.ar        |

---

## Table of Contents

1. [Repository Structure](#repository-structure)  
2. [Prerequisites](#prerequisites)  
3. [Project Setup](#project-setup)  
   - 3.1. [Install Project Dependencies](#install-project-dependencies)  
   - 3.2. [Configure Environment Variables](#configure-environment-variables)  
4. [Build and Run the Project](#build-and-run-the-project)  
   - 4.1. [Development Mode](#development-mode)  
   - 4.2. [Production Mode](#production-mode)  
5. [Environment Variable Considerations](#environment-variable-considerations)  
6. [Contributing](#contributing)  
7. [License](#license)

---

## Repository Structure

```plaintext
├── public/               # Public files accessible by the application
│   ├── background.jpg    # Website background image
│   ├── favicon.ico       # Website favicon
│   ├── index.html        # Main HTML file
│   ├── jugador.png       # Player-related image
│   ├── logo192.png       # Logo in 192x192 format
│   ├── logo512.png       # Logo in 512x512 format
│   ├── manifest.json     # PWA configuration file
│   └── robots.txt        # Search engine robot configuration
├── src/                  # Application source code
│   ├── components/       # User interface components
│   ├── pages/            # Website pages
│   ├── App.css           # Global application styles
│   ├── App.js            # Main application component
│   ├── App.test.js       # Tests for the App component
│   ├── index.css         # Styles for the index file
│   ├── index.js          # Main application entry point
│   ├── logo.svg          # Logo in SVG format
│   ├── reportWebVitals.js# Performance measurement file
│   ├── setupTests.js     # Test configuration
│   ├── supabaseContext.js# Supabase connection context
│   └── utils.js          # General utility functions
├── .env                  # Environment variables file
├── .gitignore            # Files and folders ignored by Git
├── LICENSE               # Project license
├── README.md             # Project documentation
├── package.json          # Project dependencies and scripts
└── package-lock.json     # Dependency lock file
```

---

## Prerequisites

Ensure you have the following tools installed and properly configured:

- **Node.js**: Download and install it from [https://nodejs.org/](https://nodejs.org/).  
- **npm**: Make sure you have the latest version installed. Update it using the following command:

```bash
$ npm install -g npm@latest
```

---

## Project Setup

### 1. Install Project Dependencies

After cloning or downloading the repository, navigate to the project directory and install the required dependencies by running:

```bash
$ npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory of the project and set up the following variables:

```bash
# ./ .env
## Application API URL
REACT_APP_API_URL=http://localhost:3000

## Supabase URL and Key
REACT_APP_SUPABASE_URL="your_supabase_url"
REACT_APP_SUPABASE_KEY="your_supabase_key"

## Admin ID
REACT_APP_ADMIN_ID="your_admin_id"
```

> **Note**: Replace the placeholders with the appropriate values for your Supabase project and the administrator ID.

---

## Build and Run the Project

### Development Mode

To run the project in development mode, which automatically reloads the page when changes are made to the code, use:

```bash
$ npm run start
```

The project will be available at [http://localhost:3001](http://localhost:3001).

### Production Mode

To build the project for production, execute:

```bash
$ npm run build
```

This will generate an optimized version of the application in the `build` folder, ready to be deployed.

---

## Environment Variable Considerations

Ensure that the environment variables are correctly configured to connect to Supabase and to manage the administrator user. This step is essential for the application to function correctly with the database and the admin-specific features.

---

## Contributing

If you would like to contribute to the project, you can fork the repository and submit a pull request. Please ensure you follow the coding standards and that all tests pass before submitting your changes.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
