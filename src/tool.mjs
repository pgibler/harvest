const axios = require('axios')

module.exports = {
  harvestPassworded(url, username, password) {
    return new Promise((resolve, reject) => {
      axios.get(url, {
        auth: {
          username: this.key,
          password: this.secret
        }
      }).then(response => response.data);
    })
  }
}