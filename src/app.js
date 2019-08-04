const express = require("express");
const { Task, Project, Employee } = require("./model");
const app = express();
const employees = require("../emp.json");
const projects = require("../projects.json");
const tasks = require("../tasks.json");
const bodyParser = require("body-parser");
const fs = require("fs");

app.use(bodyParser.json());

app.get("/", (request, response, next) => {
    console.log(request);
    response.header("Content-Type", "application/json");
    response.send(JSON.stringify({ msg: "hello" }));
});
//Display all employee
app.get("/employee", (request, response, next) => {
    response.send(JSON.stringify(employees));
});
// Display/View one employee
app.get("/employee/:id", (request, response, next) => {
    console.log("Id value", request.params["id"]);
    response.send(JSON.stringify(employees.filter(e => e.id == request.params["id"])[0]));
});
//Creating a new employee with a given first name, last name and a direct supervisor
app.post("/employee", (request, response, next) => {
    employees.sort((a, b) => a.id - b.id);
    const maxId = employees.length ? employees[employees.length - 1].id : 0;
    console.log("request body", request.body);
    const newEm = request.body;
    newEm.id = maxId + 1;
    employees.push(newEm);
    fs.writeFile("emp.json", JSON.stringify(employees), function(err) {
        if (err) {
            return console.error(err);
        }

        console.log("The file was saved!");
    });

    response.send(JSON.stringify(newEm));
});
//Creating a new project with a given name, a start date and a time slack
app.post("/project", (request, response, next) => {
    projects.sort((a, b) => a.id - b.id);
    const maxId = projects.length ? projects[projects.length - 1].id : 0;
    const newProject = request.body;
    newProject.id = maxId + 1;
    projects.push(newProject);
    fs.writeFile("projects.json", JSON.stringify(projects), function(err) {
        if (err) {
            return console.error(err);
        }

        console.log("The file was saved!");
    });

    response.send(JSON.stringify(newProject));
});
//display all task
app.get("/tasks", (request, response, next) => {
    response.send(JSON.stringify(tasks));
});

//Creating a new task with a given name, a description of this task and estimated days needed tocomplete it
app.post("/task", (request, response, next) => {
    tasks.sort((a, b) => a.id - b.id);
    const maxId = tasks.length ? tasks[tasks.length - 1].id : 0;
    const newTask = request.body;
    newTask.id = maxId + 1;
    tasks.push(newTask);
    fs.writeFile("tasks.json", JSON.stringify(tasks), function(err) {
        if (err) {
            return console.error(err);
        }

        console.log("The file was saved!");
    });

    response.send(JSON.stringify(newTask));
});
//Display/View all tasks for a given project
app.get("/project/:id/task", (request, response, next) => {
    const id = request.param["id"];
    const projectTasks = tasks.filter(el => el.projectId == id);
    response.send(JSON.stringify(projectTasks));
});

app.patch("/task/:id", (request, response, next) => {
    const taskId = request.params["id"];
    for (let i in tasks) {
        if (tasks[i].id == taskId) {
            if (request.body.estimatedDays) {
                tasks[i].estimatedDays = request.body.estimatedDays;
            }
            if (request.body.projectId) {
                if (!projects.filter(el => el.id == request.body.projectId).length) {
                    response.status(400);
                    response.send(JSON.stringify({ msg: "Invalid project" }));
                    return;
                }
                tasks[i].projectId = request.body.projectId;
            }
            fs.writeFile("tasks.json", JSON.stringify(tasks), function(err) {
                if (err) {
                    return console.error(err);
                }

                console.log("The file was saved!");
            });
            response.send(JSON.stringify(tasks[i]));
            break;
        }
    }
});

// Assign a project to an employee (an employee can only work on two projects at the same time).
app.patch("/employee/:id", (request, response, next) => {
    const employeeId = request.params["id"];
    for (let i in employees) {
        if (employeeId == employees[i].id) {
            if (request.body.projectId) {
                if (!employees[i].projects) {
                    employees[i].projects = [];
                }
                if (!employees[i].projects.includes(request.body.projectId)) {
                    const projectIds = employees[i].projects;
                    projectIds.push(request.body.projectId);
                    if (isOverloaded(projectIds)) {
                        response.status(400);
                        response.send(JSON.stringify({ msg: "Employee already allocated to 2 projects" }));
                        return;
                    }
                    employees[i].projects.push(request.body.projectId);
                    fs.writeFile("emp.json", JSON.stringify(employees), function(err) {
                        if (err) {
                            return console.error(err);
                        }

                        console.log("The file was saved!");
                    });
                    response.send(JSON.stringify(employees[i]));
                    return;
                }
            }
        }
    }
});
//Delete a  task (don‘t forget to update the underlying references)
app.delete("/task/:id", (request, response, next) => {
    const id = request.params["id"];
    const index = tasks.findIndex(el => el.id == id);
    tasks.splice(index, 1);

    fs.writeFile("tasks.json", JSON.stringify(tasks), function(err) {
        if (err) {
            return console.error(err);
        }

        console.log("The task was deleted!");
    });
    response.status(204);
    response.send();
});
//Delete a project (don‘t forget to update the underlying references)
app.delete("/project/:id", (request, response, next) => {
    const id = request.params["id"];
    const index = projects.findIndex(el => el.id == id);
    projects.splice(index, 1);
    employees.forEach(el => {
        const projectIndex = el.projects.findIndex(p => p == index);
        if (projectIndex > -1) {
            el.projects.splice(projectIndex, 1);
        }
    });
    fs.writeFile("emp.json", JSON.stringify(employees), function(err) {
        if (err) {
            return console.error(err);
        }

        console.log("The project was deleted!");
    });

    fs.writeFile("projects.json", JSON.stringify(projects), function(err) {
        if (err) {
            return console.error(err);
        }

        console.log("The project was deleted!");
    });
    response.status(204);
    response.send();
});

// Include the possibility to adjust the give time estimation, by creating a new value for estimated daysneeded for a task
function isOverloaded(projectIds) {
    const empProjects = projects.filter(el => projectIds.includes(el.id));
    const projectsWithEndDate = empProjects.map(el => calculateProjectEndDate(el));
    let counter = 0;
    for (let i = 0; i < projectsWithEndDate.length - 1; i++) {
        for (let j = 1; j < projectsWithEndDate.length; j++) {
            if (
                (projectsWithEndDate[j].startDate >= projectsWithEndDate[i].startDate &&
                    projectsWithEndDate[j].startDate <= projectsWithEndDate[i].endDate) ||
                (projectsWithEndDate[j].endDate >= projectsWithEndDate[i].startDate &&
                    projectsWithEndDate[j].endDate <= projectsWithEndDate[i].endDate)
            ) {
                counter++;
                if (counter == 3) {
                    return true;
                }
            }
        }
    }
    return false;
}
// Include the possibility to adjust the give time estimation, by creating a new value for estimated daysneeded for a task
function calculateProjectEndDate(project) {
    let endDate = project.startDate + project.slackTime * 24 * 60 * 60 * 1000;
    const projectTasks = tasks.filter(el => el.projectId == project.id);
    projectTasks.forEach(el => {
        endDate = endDate + el.estimatedDays * 24 * 60 * 60 * 1000;
    });
    project.endDate = endDate;
    return project;
}

function calculateProjectDays(project) {
    let endDate = project.startDate + project.slackTime * 24 * 60 * 60 * 1000;
    const projectTasks = tasks.filter(el => el.projectId == project.id);
    projectTasks.forEach(el => {
        endDate = endDate + el.estimatedDays * 24 * 60 * 60 * 1000;
    });
    project.endDate = endDate;
    return (project.endDate - project.startDate) / (24 * 60 * 60 * 1000);
}

app.get("/project", (request, response, next) => {
    const projectsStrIds = request.query.ids;
    let days = 0;
    if (projectsStrIds) {
        const projectsIds = projectsStrIds.split(",");
        projectsIds.forEach(id => {
            const project = projects.filter(pr => pr.id == id)[0];
            days = days + calculateProjectDays(project);
        });
    }
    response.send(JSON.stringify({ days }));
});

app.listen(3000, () => {});
