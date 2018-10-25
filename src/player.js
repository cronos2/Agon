const uuid = require('uuid/v4');


class Player {
    constructor(socket, username){
        this.id = uuid();
        this.socket = socket;
        this.username = username;
    }

    serialize(){
        return {
            'id': this.id,
            'username': this.username
        };
    }
}


module.exports = Player;
