module.exports = {
  server: function() {
    var server = this
    var snake; // Array to render snake
    var foodBits = []; // Food Array

    server.state = {
      players: {},
      foodBits: foodBits,
      w: 50,
      h: 50,
    }

    server.addPlayer = function(name) {
      server.state.players[name] = {
        snake: makeSnake(),
        dir: 'right',
      }
    }

    server.setDir = function(name, dir) {
      server.state.players[name]['dir'] = dir
    }

    server.removePlayer = function(name) {
      delete server.state.players[name]
    }

    server.update = function(){
      updateSnakes()
      checkCollision()
    }

    makeFood()

    function makeSnake() {
      var snakeLength = 6
      var snake = []
      for(var i = snakeLength - 1; i >= 0; i--) {
        snake.push({x: i, y: 0}) // Initialises snake from top left of canvas
      }
      return snake
    }

    function makeFood() {
      foodBits.push({
        x: Math.floor(Math.random() * server.state.w), // spawns food in length/width of canvas minus 1 cw
        y: Math.floor(Math.random() * server.state.h),
        type: "regular",
        colour: "#45B29D"
      })
    }

    function updateSnakes() {
      for (var name in server.state.players) {
        var snake = server.state.players[name].snake
        var dir = server.state.players[name].dir

        var head_x = snake[0].x
        var head_y = snake[0].y

        if (dir == "right") head_x++
        else if (dir == "left") head_x--
        else if (dir == "up") head_y--
        else if (dir == "down") head_y++

        // Teleporting walls
        if (head_x >= 67){
          head_x = 0
        }
        else if (head_x <= -1){
          head_x = 67
        }
        else if (head_y >= 40){
          head_y = 0
        }
        else if (head_y <= -1){
          head_y = 40
        }
        var tail = snake.pop() // pops(removes) tail cell
        tail.x = head_x
        tail.y = head_y
        snake.unshift(tail) // Puts tail cell at the head of the snake
      }
    }

    function checkCollision() {
      for (var name in server.state.players) {
        var snake = server.state.players[name].snake
        var dir = server.state.players[name].dir
        var head_x = snake[0].x
        var head_y = snake[0].y

        for(var i = 0; i < foodBits.length; i++) {
          var f = foodBits[i]
          if (head_x == f.x && head_y == f.y) {
            if (f.type === "regular") {
              var tail = {
                // get the x and y position of the last cell in the snake array (the tail)
                x: snake[snake.length-1].x,
                y: snake[snake.length-1].y,
              }

              snake.push(tail) // adds the new tail cell that's been created to the end of the array.
              // This block above extends the tail.

              foodBits.splice(i, 1) // This is what removes the food from the screen.
              i-- // dont skip next food bit

              makeFood()
            }
          } else {
            for (var j = 1; j < snake.length; j++) {
              var s = snake[j]

              // if (head_x == s.x && head_y == s.y) {
              //   gameOver()
              // }

            }
          }
        }
      }
    } // food collision

    return this
  }
}
