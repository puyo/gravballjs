// @flow

import p2 from "p2"

type Arena = {
  w: number;
  h: number;
}

export default class GravballServer {
  world: p2.World;
  scores: Map<number, number>;
  players: Object;
  arena: Arena;
  ball: p2.Body;
  goals: Map<number, p2.Body>;
  state: Object;

  constructor() {
    this.initWorld()
    this.initArena()
    this.initWalls()
    this.initBall()
    this.initPlayers()
    this.initGoals()
    this.initScores()
  }

  initWorld() {
    this.world = new p2.World({
      //gravity: [0, -1000]
    })
    this.world.defaultContactMaterial.friction = 0
    this.world.defaultContactMaterial.restitution = 0.1
    this.world.applyDamping = false
    this.world.on('beginContact', e => {
      //console.log('contact', e.bodyA, e.bodyB)
      const bodies: Array<p2.Body> = [e.bodyA, e.bodyB]
      const collType = bodies.map(b => b.collisionType).sort().join('-')
      if (collType === 'ball-goal') {
        const ball = bodies.find(b => b.collisionType === 'ball')
        const goal: p2.Body = bodies.find(b => b.collisionType === 'goal')
        console.log('ball hit a goal of player', goal.playerIndex)
        const score: number = this.scores[goal.playerIndex]
        if (score != null) {
          this.scores[goal.playerIndex] = score + 1
        }
      }
    })
    this.world.applyGravity = false
  }

  initArena() {
    this.arena = { w: 1000, h: 1000 }
  }

  initWalls() {
    const top = new p2.Body({
      position:[0, this.arena.h/2],
      angle: Math.PI // 180 degrees
    })
    top.addShape(new p2.Plane())
    const bottom = new p2.Body({
      position: [0, -this.arena.h/2],
      angle: 0
    })
    bottom.addShape(new p2.Plane())
    const left = new p2.Body({
      position: [-this.arena.w/2, 0],
      angle: -Math.PI/2
    })
    left.addShape(new p2.Plane())
    const right = new p2.Body({
      position: [this.arena.w/2, 0],
      angle: Math.PI/2 // 90 degrees
    })
    right.addShape(new p2.Plane())
    this.world.addBody(top)
    this.world.addBody(bottom)
    this.world.addBody(left)
    this.world.addBody(right)
  }

  initBall() {
    const ball = new p2.Body({
      mass: 1,
      position: [0, 10],
      velocity: [50, 40],
    })
    ball.collisionType = 'ball'
    ball.addShape(new p2.Circle({ radius: 10 }))
    this.ball = ball
    this.world.addBody(ball)
  }

  initPlayers() {
    this.players = new Map()
    this.initPlayer(0, {
      position: [-this.arena.w/3, -this.arena.h/3],
      color: 'red'
    })
    this.initPlayer(1, {
      position: [this.arena.w/3, this.arena.h/3],
      color: 'cyan'
    })
  }

  initPlayer(index: number, props: Object) {
    const player = new p2.Body({
      mass: 10000,
      position: props.position
    })
    Object.assign(player, props)
    player.addShape(new p2.Circle({ radius: 20 }))
    this.players[index] = player
    this.world.addBody(player)
  }

  initGoals() {
    this.goals = new Map()
    this.initGoal(0, {
      position: [0, this.arena.h/2],
      color: 'red',
      collisionType: 'goal'
    })
    this.initGoal(1, {
      position: [0, -this.arena.h/2],
      color: 'cyan',
      collisionType: 'goal'
    })
  }

  initGoal(index: number, props: Object) {
    const goal = new p2.Body({
      mass: 0,
      position: props.position
    })
    Object.assign(goal, props)
    goal.playerIndex = index
    goal.addShape(new p2.Circle({ radius: 40 }))
    this.goals[index] = goal
    this.world.addBody(goal)
  }

  initScores() {
    let scores: Map<number, number> = new Map();
    scores[0] = 0
    scores[1] = 0
    this.scores = scores;
  }

  clientState() {
    return {
      ball: {
        x: this.ball.position[0],
        y: this.ball.position[1],
        vx: this.ball.velocity[0],
        vy: this.ball.velocity[1],
        ax: this.ball.force[0],
        ay: this.ball.force[1],
        radius: this.ball.shapes[0].radius
      },
      arena: this.arena,
      players: this.players,
      goals: this.goals,
      scores: this.scores
    }
  }

  applyGravityToBall() {
    // apply gravity!
    let ax = 0
    let ay = 0
    const k = 100000 // a scalar
    for (const name in this.players) {
      const p = this.players[name]
      const dx = p.position[0] - this.ball.position[0]
      const dy = p.position[1] - this.ball.position[1]
      const distSquared = dx*dx + dy*dy
      // gravity will fall off exponentionally with distance
      const a = Math.atan2(dy, dx)
      ax += k * Math.cos(a) / distSquared
      ay += k * Math.sin(a) / distSquared
    }
    this.ball.applyImpulse([ax, ay])
  }

  step() {
    this.applyGravityToBall()
    this.world.step(1/60)
  }
}

const server = new Server()

function moveLoop() {
  server.step()
  //client.state = server.clientState() // over a network with socketio io events
  setTimeout(moveLoop, 20) // update state every 20ms
}

moveLoop()
