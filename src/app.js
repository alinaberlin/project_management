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

app.get("/employee", (request, response, next) => {
    response.send(JSON.stringify(employees));
});

app.get("/employee/:id", (request, response, next) => {
    console.log("Id value", request.params["id"]);
    response.send(JSON.stringify(employees.filter(e => e.id == request.params["id"])[0]));
});
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

app.put("/task/:id", (request, response, next) => {
    const taskId = request.params["id"];
    for (let i in tasks) {
        if (tasks[i].id == taskId) {
            tasks[i].estimatedDays = request.body.estimatedDays;
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
app.listen(3000, () => {});
