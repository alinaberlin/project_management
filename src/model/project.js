function Project(id, giveName, startDate, timeSlack) {
    this.id = id;
    this.giveName = giveName;
    this.startDate = startDate;
    this.timeSlack = timeSlack;
}

module.exports = {
    Project
};
