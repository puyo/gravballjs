// @flow

import "p2"
import "jquery"

type index = number;

class GravballClient {
  ctx: Object;

  constructor(el = "gravballCanvas") {
    this.canvas = document.getElementById(el)
    this.ctx = this.canvas.getContext("2d")
    this.initKeyboard()
  }

  resizeToArena() {
    this.canvas.width = this.state.arena.w
    this.canvas.height = this.state.arena.h
  }

  draw() {
    let scaleX = 1, scaleY = -1
    this.drawBackground()

    // Transform the canvas
    this.ctx.save()
    this.ctx.translate(this.state.arena.w/2, this.state.arena.h/2) // Translate to the center
    this.ctx.scale(scaleX, scaleY)

    this.ctx.globalCompositeOperation = "lighter"

    this.drawScores()
    this.drawWalls()
    this.drawBall()
    this.drawPlayers()
    this.drawGoals()

    // Restore transform
    this.ctx.restore()
  }

  drawBackground() {
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.fillStyle = "rgba(0, 0, 0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawScores() {
    $('.scores').text(
      this.state.players[0].color + ': ' + this.state.scores[0] + ', ' +
        this.state.players[1].color + ': ' + this.state.scores[1]
    )
  }

  drawWalls() {
    // var y = -1
    // this.ctx.strokeStyle = 'rgb(255, 255, 255)'
    // this.ctx.beginPath()
    // this.ctx.moveTo(- this.state.arena.w/2, y)
    // this.ctx.lineTo(+ this.state.arena.w/2, y)
    // this.ctx.stroke()
  }

  drawGoals() {
    for (let name in this.state.goals) {
      let goal = this.state.goals[name]
      let x = goal.position[0]
      let y = goal.position[1]
      let radius = goal.shapes[0].radius
      this.ctx.strokeStyle = goal.color
      this.ctx.lineWidth = 2
      this.ctx.beginPath()
      this.ctx.arc(x, y, radius, Math.PI*2, false)
      this.ctx.stroke()
    }
  }

  drawPlayers() {
    //console.log('drawPlayers', this.state.players)
    for (let name in this.state.players) {
      let player = this.state.players[name]
      let x = player.position[0]
      let y = player.position[1]
      let radius = player.shapes[0].radius
      // let gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius)
      // gradient.addColorStop(0, "white")
      // gradient.addColorStop(0.4, "white")
      // gradient.addColorStop(0.4, player.color)
      // gradient.addColorStop(1, "black")
      // this.ctx.fillStyle = gradient
      this.ctx.fillStyle = player.color
      this.ctx.lineWidth = 0
      this.ctx.beginPath()
      this.ctx.arc(x, y, radius, Math.PI*2, false)
      this.ctx.fill()
    }
  }

  drawBall() {
    let ball = this.state.ball
    // let gradient = this.ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius)
    // gradient.addColorStop(0, "white")
    // gradient.addColorStop(0.4, "white")
    // gradient.addColorStop(0.4, "yellow")
    // gradient.addColorStop(1, "black")
    // this.ctx.fillStyle = gradient
    this.ctx.fillStyle = "yellow"
    this.ctx.lineWidth = 0
    this.ctx.beginPath()
    this.ctx.arc(ball.x, ball.y, ball.radius, Math.PI*2, false)
    this.ctx.fill()

    let drawScalar = 50
    this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)'
    this.ctx.beginPath()
    this.ctx.moveTo(ball.x, ball.y)
    this.ctx.lineTo(ball.x + drawScalar*ball.ax, ball.y + drawScalar*ball.ay)
    this.ctx.stroke()
  }

  initKeyboard() {
    const keymap = new Map()
    keymap.set(38, {player: 0, x:  0, y: +1})
    keymap.set(40, {player: 0, x:  0, y: -1})
    keymap.set(37, {player: 0, x: -1, y:  0})
    keymap.set(39, {player: 0, x: +1, y:  0})
    keymap.set(87, {player: 1, x:  0, y: +1})
    keymap.set(83, {player: 1, x:  0, y: -1})
    keymap.set(65, {player: 1, x: -1, y:  0})
    keymap.set(68, {player: 1, x: +1, y:  0})

    // const validKeys = keys.keys()
    // console.log(validKeys)

    $(document).keyup(e => {
      const key = e.which
      const k = keymap.get(key)
      if (k) {
        console.log('keyup', key, k)
        // reach into server, although emit for network version
        let vel = server.players[k.player].velocity
        if (k.x !== 0)
          vel[0] = 0
        if (k.y !== 0)
          vel[1] = 0
      }
      //socket.emit('keyup', k.player, k.x, k.y)
    })

    $(document).keydown(e => {
      const key = e.which
      const k = keymap.get(key)
      if (k) {
        console.log('keydown', key, k)
        // reach into server, although emit for network version
        let vel = server.players[k.player].velocity
        let scalar = 200
        if (k.x !== 0)
          vel[0] = scalar * k.x
        if (k.y !== 0)
          vel[1] = scalar * k.y
        //socket.emit('keydown', k.player, k.x, k.y)
      }

    })
  }
}

var server = new Server()
var client = new Client()
// var moveLoopTimer
// var drawLoopTimer

function moveLoop() {
  server.step()
  client.state = server.clientState() // over a network with socketio io events
  //moveLoopTimer = setTimeout(moveLoop, 20) // update state every 20ms
  
  client.draw()
  requestAnimationFrame(moveLoop)
}

// function drawLoop() {
//     //ioServer.emit('state', gravball.server.state)
//     client.draw()
//     drawLoopTimer = requestAnimationFrame(drawLoop)
// }

function debugLoop() {
  var timestamp = new Date().getSeconds()
  console.log(timestamp, 'CLIENT', client.state)
  console.log(timestamp, 'SERVER', server.state)
}

// start
client.state = server.clientState() // over a network
client.resizeToArena() // over a network
moveLoop()
// server.addPlayer('A', {color: 'red', x: 120, y: 120})
// server.addPlayer('B', {color: 'blue', x: client.state.arena.w - 120, y: client.state.arena.h - 120})

// drawLoop()

//setInterval(debugLoop, 1000)

