# deployer

A small node web server for displaying the results of MyRobotLab builds.  Builds are posted from Jenkins or Maven via ssh plugin or scp.
The target directory only needs to be dropped in the correct location.  This service scans the directories and collects all of the latest info into one place for easy viewing and access.

It is meant to be running in a public place and allow a swarm of build servers behind NATs to post the artifacts and results of their work.


## starting
SET DEBUG=deployer:* & npm run devstart
http://localhost:8888

## directory structure

/deployer
 - builds
   - {branch}
     - {job name}
     
    
