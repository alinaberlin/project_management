function Employee(id, firstName, lastName) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.projects = [];
    this.addProject = function(project){
        this.projects.push(project);
    }
}

module.exports = {
    Employee
};
