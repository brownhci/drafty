# Welcome to the Drafty Source Code

Drafty strives to keep data up-to-date by recruiting people to review it from the crowd of people who are already using it. The data is hosted on Drafty, a web-based spreadsheet. Potential reviewers are matched to topics they likely have an interest in, by inferring their interest from interactions such as text highlighting, pointing, searching, sorting, and clicks. This continual review allows the maintenance of data to be self-sustaining over time.

# HCOMP 2017 paper

Please look in the branch "shaun=dev-branch" to find the source code used in the HCOMP 2017 paper:

Drafty: Enlisting Users to be Editors who Maintain Structured Data

Wallace S., Van Kleunen L., Aubin-Le Quere M., Peterkin A., Huang Y., Huang J.


# Basic Systems and Server Operations
For additional scripts, the server folder has numerous scripts to update and manage the live server.

### Install MariaDB (MySQL) using Docker


    cd docker/<local_dev or production>/
    update the root password in the docker-compose.yml file: - MYSQL_ROOT_PASSWORD=<your_db_password>
    docker-compose up -d


### Update Drafty and Restart Drafty’s Web Server


    cd <file_directory_of_this_repo>
    git stash
    git pull
    cd backend/
    npm run build
    pm2 reload all

### Update CS Open Rankings

    cd /vol/csopenrankings
    git pull
NOTE: cs open rankings is served statically from drafty’s web server


### Restart Drafty’s Web Server

    pm2 reload all
