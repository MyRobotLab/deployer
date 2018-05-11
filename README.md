# deployer

A small node web server for displaying the results of MyRobotLab builds.  Builds are posted from Jenkins or Maven via ssh plugin or scp.
The target directory only needs to be dropped in the correct location.  This service scans the directories and collects all of the latest info into one place for easy viewing and access.

It is meant to be running in a public place and allow a swarm of build servers behind NATs to post the artifacts and results of their work.


## starting
SET DEBUG=deployer:* & npm run devstart
http://localhost:8888

## directory structure

```
 |-- deployer
     |-- builds
         |-- origin/{branch}
             |-- {job name}
                 |-- {build number}
                      |-- classes
                           |-- git.properties
                           
```

## git.properties
The file git.properties contains all the necessary data to identify and classify the build.

```json
{
  "git.branch" : "origin/develop",
  "git.build.host" : "work-e",
  "git.build.time" : "2018-05-10T12:44:06-0700",
  "git.build.user.email" : "",
  "git.build.user.name" : "",
  "git.build.version" : "0.0.1-SNAPSHOT",
  "git.closest.tag.commit.count" : "2728",
  "git.closest.tag.name" : "1.0.119",
  "git.commit.id" : "11d91929dfc83c13d76eeb090f843f7d5d1f9ee6",
  "git.commit.id.abbrev" : "11d9192",
  "git.commit.id.describe" : "1.0.119-2728-g11d9192",
  "git.commit.id.describe-short" : "1.0.119-2728",
  "git.commit.message.full" : "initial checkin for raspi support with dl4j and yolo in dl4j.",
  "git.commit.message.short" : "initial checkin for raspi support with dl4j and yolo in dl4j.",
  "git.commit.time" : "2018-05-10T12:43:10-0700",
  "git.commit.user.email" : "kwatters@kmwllc.com",
  "git.commit.user.name" : "kwatters",
  "git.dirty" : "false",
  "git.remote.origin.url" : "https://github.com/MyRobotLab/myrobotlab.git",
  "git.tags" : ""
}
```     
     
    
