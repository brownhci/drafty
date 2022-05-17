# Welcome to the Drafty Source Code

Drafty strives to keep data up-to-date by recruiting people to review it from the crowd of people who are already using it. The data is hosted on Drafty, a web-based spreadsheet. Potential reviewers are matched to topics they likely have an interest in, by inferring their interest from interactions such as text highlighting, pointing, searching, sorting, and clicks. This continual review allows the maintenance of data to be self-sustaining over time.

# HCOMP 2017 and CSCW 2021 papers

Please look in the branch "shaun=dev-branch" to find the source code used in the papers:

Drafty: Enlisting Users to be Editors who Maintain Structured Data
Shaun Wallace, Lucy van Kleunen, Marianne Aubin-Le Quere, Abraham Peterkin, Yirui Huang, Jeff Huang

Case Studies on the Motivation and Performance of Contributors Who Verify and Maintain In-Flux Tabular Datasets
Shaun Wallace, Alexandra Papoutsaki, Neilly H. Tan, Hua Guo, Jeff Huang

# Basic Systems and Server Operations
For additional scripts, the server folder has numerous scripts to update and manage the live server.

### Install MariaDB (MySQL) using Docker


    cd docker/<local_dev or production>/
    update the root password in the docker-compose.yml file: - MYSQL_ROOT_PASSWORD=<your_db_password>
    docker-compose up -d


### Install project dependencies and Run Locally (we use Node v16.3.0 and NVM to switch between versions of Node and NPM)

    cd backend
    npm install
    npm run watch
    

### Update Drafty and Restart Drafty’s Web Server


    cd <file_directory_of_this_repo>
    git stash
    git pull
    cd backend/
    npm run build
    pm2 reload all

### Update CS Open Rankings (Production Server Only)

    cd /vol/csopenrankings
    git pull
NOTE: cs open rankings is served statically from drafty’s web server


### Restart Drafty’s Web Server (Production Server Only)

    pm2 reload all
