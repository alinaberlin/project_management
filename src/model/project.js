function Project (giveName, startDate, timeSlack) {
    this.giveName  = giveName;
    this.startDate = startDate;
    this.timeSlack = timeSlack;
    function addTask (task){
        this.task.push(task);
    }
}

module.exports ={
    Project
}