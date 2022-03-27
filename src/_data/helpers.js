module.exports = {
    currentDateTime() {
        const today = new Date();
        return today.toUTCString();
    }
};
  