function Task(id, name, description, estimatedDays, projectId) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.estimatedDays = estimatedDays;
    this.projectId = projectId;

    this.addProject = function(projectId){
        this.projectId = projectId;
    }
    this.updateEstimation = function(estimatedDays){
        this.estimatedDays = estimatedDays
    }
}

module.exports = {
    Task
};
