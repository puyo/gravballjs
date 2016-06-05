var gravball = gravball || {}

gravball.server = function() {
    var server = this

    server.init = function() {
        server.world = new p2.World()
    }

    server.state = {
        players: {},
        ball: {
            radius: 10,
            color: 'yellow',
            x: 200,
            y: 20,
            vx: 5,
            vy: 5
        },
        arena: {
            w: 500,
            h: 500,
        }
    }

    server.addPlayer = function(name, opts = {}) {
        server.state.players[name] = {
            name: name,
            x: 20,
            y: 20,
            radius: 20
        }
        Object.assign(server.state.players[name], opts)
    }

    server.removePlayer = function(name) {
        delete server.state.players[name]
    }

    server.update = function() {
        updateBall()
        collideBall()
    }

    server.init()

    function eachPlayer(cb) {
        var players = server.state.players
        for (var name in players) {
            var player = players[name]
            cb(player)
        }
    }

    function updateBall() {
        var ball = server.state.ball

        // ball acceleration
        var ax = 0
        var ay = 0

        eachPlayer(p => {
            // distance will be scale
            var dx = p.x - ball.x
            var dy = p.y - ball.y
            var distSq = dx*dx + dy*dy

            // gravity will fall off exponentionally with distance
            var a = Math.atan2(dy, dx)
            var k = 500 // a scalar
            ax += k * Math.cos(a) / distSq
            ay += k * Math.sin(a) / distSq
        })

        ball.ax = ax
        ball.ay = ay

        // update velocity
        ball.vx += ax
        ball.vy += ay

        var maxv = 10
        // limit velocity
        ball.vx = Math.max(Math.min(ball.vx, maxv), -maxv)
        ball.vy = Math.max(Math.min(ball.vy, maxv), -maxv)

        // position
        ball.x += ball.vx
        ball.y += ball.vy

        // limit position (bounce)
        var arena = server.state.arena
        var energyConservation = 0.9
        if (ball.x > arena.w) { ball.x = arena.w; ball.vx *= -energyConservation }
        if (ball.y > arena.h) { ball.y = arena.h; ball.vy *= -energyConservation }
        if (ball.x < 0) { ball.x = 0; ball.vx *= -energyConservation }
        if (ball.y < 0) { ball.y = 0; ball.vy *= -energyConservation }
    }

    function collideBall() {
        // TODO: use p2!

        var ball = server.state.ball
        var energyConservation = 0.9
        eachPlayer(p => {
            var dx = p.x - ball.x
            var dy = p.y - ball.y
            var dist = Math.sqrt(dx*dx + dy*dy)
            //if (dist < 50) console.log('d', dist)
            if (dist < (ball.radius + p.radius)) {
                // collision yo
                var a = Math.atan2(dy, dx)
                //console.log('collision', a)
                ball.x = p.x + (p.radius + ball.radius)*Math.cos(a)
                ball.y = p.y + (p.radius + ball.radius)*Math.sin(a)
                ball.vx *= energyConservation * Math.cos(a)
                ball.vy *= energyConservation * Math.sin(a)
            }
        })
    }

    return this
}

gravball.client = function() {
    var client = this
    var canvas = document.getElementById("gravballCanvas")
    var ctx = canvas.getContext("2d")

    client.resizeToArena = function() {
        canvas.width = client.state.arena.w
        canvas.height = client.state.arena.h
    }

    client.draw = function() {
        drawBackground()
        drawBall()
        drawPlayers()
    }

    function drawBackground() {
        //ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "rgba(0, 0, 0)";
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    function drawPlayers() {
        var players = client.state.players
        for (var name in players) {
            var player = players[name]
            var radius = player.radius
            ctx.beginPath()
            var gradient = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, radius)
            gradient.addColorStop(0, "white")
            gradient.addColorStop(0.4, "white")
            gradient.addColorStop(0.4, player.color)
            gradient.addColorStop(1, "black")
            ctx.fillStyle = gradient
            ctx.arc(player.x, player.y, radius, Math.PI*2, false)
            ctx.fill()
        }
    }

    function drawBall() {
        var ball = client.state.ball
        ctx.beginPath()
        var gradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius)
        gradient.addColorStop(0, "white")
        gradient.addColorStop(0.4, "white")
        gradient.addColorStop(0.4, ball.color)
        gradient.addColorStop(1, "black")
        ctx.fillStyle = gradient
        ctx.arc(ball.x, ball.y, ball.radius, Math.PI*2, false)
        ctx.fill()

        var drawScalar = 500
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)'
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(ball.x + drawScalar*ball.ax, ball.y + drawScalar*ball.ay);
        ctx.stroke();
    }

    // var socket = io()
    // socket.on('state', function(state){
    //     client.state = state
    //     client.draw()
    // })

    // function onResize() {
    //     canvas.width = window.innerWidth
    //     canvas.height = window.innerHeight
    // }

    // $(window).resize(onResize)
    // $(document).ready(onResize)

    var keys = {
        38: {player: 0, x:  0, y: -1},
        40: {player: 0, x:  0, y: +1},
        37: {player: 0, x: -1, y:  0},
        39: {player: 0, x: +1, y:  0},
        87: {player: 1, x:  0, y: -1},
        83: {player: 1, x:  0, y: +1},
        65: {player: 1, x: -1, y:  0},
        68: {player: 1, x: +1, y:  0}
    }
    var validKeys = Object.keys(keys)

    $(document).keydown(function(e) {
        var key = e.which
        var dir
        console.log(validKeys)
        // if (key === 37 || key === 38 || key === 39 || key === 40) {
        //     e.preventDefault()
        // }
        // if ((key === 37) && (dir != "right")) dir = "left"
        // else if ((key === 38) && (dir != "down")) dir = "up"
        // else if ((key === 39) && (dir != "left")) dir = "right"
        // else if ((key === 40) && (dir != "up")) dir = "down"
        //socket.emit('dir', dir) // send change in direction to server
    })

    return this
}

var server = gravball.server()
var client = gravball.client()
var moveLoopTimer
var drawLoopTimer

function moveLoop() {
    server.update()
    client.state = server.state
    moveLoopTimer = setTimeout(moveLoop, 20) // update state every 20ms
}

function drawLoop() {
    //ioServer.emit('state', gravball.server.state)
    client.draw()
    drawLoopTimer = requestAnimationFrame(drawLoop)
}

function debugLoop() {
    var timestamp = new Date().getSeconds()
    console.log(timestamp, 'CLIENT', client.state)
    console.log(timestamp, 'SERVER', server.state)
}

// start
moveLoop()
client.resizeToArena()
server.addPlayer('A', {color: 'red', x: 120, y: 120})
server.addPlayer('B', {color: 'blue', x: client.state.arena.w - 120, y: client.state.arena.h - 120})

drawLoop()

//setInterval(debugLoop, 1000)

