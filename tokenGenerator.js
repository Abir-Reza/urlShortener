const tokenGenerator = function(id) {
    const Base62 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const baseSize = Base62.length;
    let tokenarray = [];
    while (id > 0){        
      Remainder = id % baseSize;
      tokenarray.push(Base62[Remainder]);
      id = Math.floor(id / baseSize);
    }    
    token = tokenarray.join(""); 
    return token;
  }

module.exports = tokenGenerator;
