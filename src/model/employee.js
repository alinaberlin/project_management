function Employee(firstName, secondName, supervisor) {
    this.firstName = firstName;
    this.secondName = secondName;
    this.supervisor = supervisor;
    this.projects = [];
    function addProject(project) {
        this.projects.push(project);
    }
}

module.exports = {
    Employee
};
